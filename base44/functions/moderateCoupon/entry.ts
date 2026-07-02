import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { coupon_id, title, promo_code, description, landing_url, business_name, category } = body;

    if (!coupon_id || !title) {
      return Response.json({ error: 'coupon_id and title are required' }, { status: 400 });
    }

    // Step 1: Validate landing URL is reachable
    let urlValid = true;
    let urlNote = '';
    if (landing_url) {
      try {
        const testUrl = landing_url.startsWith('http') ? landing_url : `https://${landing_url}`;
        const urlResp = await fetch(testUrl, { method: 'HEAD', redirect: 'follow' });
        if (!urlResp.ok && urlResp.status !== 405) {
          urlValid = false;
          urlNote = `URL returned status ${urlResp.status}`;
        }
      } catch (urlErr) {
        urlValid = false;
        urlNote = `URL unreachable: ${urlErr.message}`;
      }
    }

    // Step 2: Low-effort content detection (rule-based, before AI)
    const titleLower = (title || '').toLowerCase().trim();
    const descLower = (description || '').toLowerCase().trim();
    const codeUpper = (promo_code || '').toUpperCase().trim();

    const lowEffortIssues = [];
    if (titleLower.length < 5) lowEffortIssues.push('Title too short');
    if (descLower.length > 0 && descLower.length < 15) lowEffortIssues.push('Description too short');
    if (['test', 'xxx', 'your code', 'promo', 'code', 'tbd', 'todo', 'placeholder'].includes(codeUpper)) {
      lowEffortIssues.push('Placeholder promo code detected');
    }
    if (titleLower === descLower) lowEffortIssues.push('Title and description are identical');

    // Step 3: AI moderation for spam / quality
    const moderationPrompt = `You are a content moderation AI for Emberscot, a premium coupon marketplace.
Review this coupon submission and determine if it should be auto-approved or flagged for human review.

Coupon Details:
- Title: ${title}
- Promo Code: ${promo_code || 'N/A'}
- Description: ${description || 'N/A'}
- Landing URL: ${landing_url || 'N/A'} (URL validation: ${urlValid ? 'reachable' : 'UNREACHABLE - ' + urlNote})
- Business: ${business_name || 'N/A'}
- Category: ${category || 'N/A'}

Flag the coupon if ANY of these are true:
1. The title or description contains spam, misleading claims, or inappropriate content
2. The promo code looks fake or is a placeholder (e.g., "TEST", "XXX", "YOUR CODE")
3. The landing URL is missing or suspicious
4. The business name is missing or looks fake
5. The description is too short (under 10 characters) or copy-pasted spam
6. The deal seems too good to be true (e.g., "100% off everything")
7. The content appears auto-generated or low-effort

Auto-approve if the coupon looks legitimate with a real promo code, real business name, proper URL, and reasonable discount.

Respond with a JSON object containing:
- "approved": boolean (true if auto-approved, false if flagged)
- "reason": string (brief explanation)
- "confidence": number (0-1)`;

    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: moderationPrompt,
      response_json_schema: {
        type: "object",
        "properties": {
          approved: { type: "boolean" },
          reason: { type: "string" },
          confidence: { type: "number" }
        },
        required: ["approved", "reason", "confidence"]
      }
    });

    const result = aiResponse;

    // Combine all signals: AI + URL check + low-effort checks
    const allIssues = [];
    if (!result.approved) allIssues.push(result.reason);
    if (!urlValid) allIssues.push(`URL issue: ${urlNote}`);
    if (lowEffortIssues.length > 0) allIssues.push(`Quality: ${lowEffortIssues.join(', ')}`);

    const isApproved = result.approved && urlValid && lowEffortIssues.length === 0;
    const combinedNotes = `AI Confidence: ${result.confidence} - ${result.reason}` +
      (allIssues.length > 1 ? ` | Additional: ${allIssues.slice(1).join('; ')}` : '');

    // Update the coupon based on combined moderation result
    const updateData = {
      ai_flagged: !isApproved,
      ai_moderation_notes: combinedNotes,
      status: isApproved ? 'active' : 'flagged'
    };

    await base44.asServiceRole.entities.Coupon.update(coupon_id, updateData);

    // If flagged, notify admin via email
    if (!isApproved) {
      const adminEmail = Deno.env.get("EMBERSCOT_ADMIN_EMAIL");
      if (adminEmail) {
        try {
          await base44.asServiceRole.integrations.Core.SendEmail({
            to: adminEmail,
            subject: `🚨 Flagged Coupon: ${title}`,
            body: `A coupon has been flagged by AI moderation and needs your review.

Coupon: ${title}
Business: ${business_name || 'N/A'}
Promo Code: ${promo_code || 'N/A'}
URL Valid: ${urlValid ? 'Yes' : 'No - ' + urlNote}

Issues:
${allIssues.join('\n')}

Review it in the Emberscot admin dashboard.`
          });
        } catch (emailErr) {
          console.error('Failed to send admin notification:', emailErr.message);
        }
      }
    }

    return Response.json({
      status: isApproved ? 'approved' : 'flagged',
      reason: allIssues.join('; '),
      confidence: result.confidence,
      url_valid: urlValid,
      low_effort_issues: lowEffortIssues,
      coupon_id
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});