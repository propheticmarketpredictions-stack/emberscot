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

    // AI moderation: screen coupon for spam, fake codes, inappropriate content
    const moderationPrompt = `You are a content moderation AI for Emberscot, a premium coupon marketplace. 
Review this coupon submission and determine if it should be auto-approved or flagged for human review.

Coupon Details:
- Title: ${title}
- Promo Code: ${promo_code || 'N/A'}
- Description: ${description || 'N/A'}
- Landing URL: ${landing_url || 'N/A'}
- Business: ${business_name || 'N/A'}
- Category: ${category || 'N/A'}

Flag the coupon if ANY of these are true:
1. The title or description contains spam, misleading claims, or inappropriate content
2. The promo code looks fake or is a placeholder (e.g., "TEST", "XXX", "YOUR CODE")
3. The landing URL is missing or looks suspicious
4. The business name is missing or looks fake
5. The description is too short (under 10 characters) or copy-pasted spam
6. The deal seems too good to be true (e.g., "100% off everything")

Auto-approve if the coupon looks legitimate with a real promo code, real business name, proper URL, and reasonable discount.

Respond with a JSON object containing:
- "approved": boolean (true if auto-approved, false if flagged)
- "reason": string (brief explanation)
- "confidence": number (0-1)`;

    const aiResponse = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: moderationPrompt,
      response_json_schema: {
        type: "object",
        properties: {
          approved: { type: "boolean" },
          reason: { type: "string" },
          confidence: { type: "number" }
        },
        required: ["approved", "reason", "confidence"]
      }
    });

    const result = aiResponse;
    const isApproved = result.approved;

    // Update the coupon based on moderation result
    const updateData = {
      ai_flagged: !isApproved,
      ai_moderation_notes: `Confidence: ${result.confidence} - ${result.reason}`,
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
            body: `A coupon has been flagged by AI moderation and needs your review.\n\nCoupon: ${title}\nBusiness: ${business_name || 'N/A'}\nPromo Code: ${promo_code || 'N/A'}\nReason: ${result.reason}\nConfidence: ${result.confidence}\n\nReview it in the Emberscot admin dashboard.`
          });
        } catch (emailErr) {
          // Email failure shouldn't block the flow
          console.error('Failed to send admin notification:', emailErr.message);
        }
      }
    }

    return Response.json({
      status: isApproved ? 'approved' : 'flagged',
      reason: result.reason,
      confidence: result.confidence,
      coupon_id
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});