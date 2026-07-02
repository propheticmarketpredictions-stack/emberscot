import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { jsPDF } from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { business_profile_id, month } = body;

    if (!business_profile_id) {
      return Response.json({ error: 'business_profile_id is required' }, { status: 400 });
    }

    // Load business profile
    const profile = await base44.asServiceRole.entities.BusinessProfile.get(business_profile_id);
    if (!profile) {
      return Response.json({ error: 'Business profile not found' }, { status: 404 });
    }

    // Only allow the business owner or an admin
    if (profile.user_id !== user.id && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Load all redemptions for this business
    const redemptions = await base44.asServiceRole.entities.Redemption.filter(
      { business_profile_id },
      '-created_date',
      500
    );

    // Filter to the requested month (defaults to last month)
    const now = new Date();
    const targetMonth = month ? new Date(month + '-01') : new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const monthStart = new Date(targetMonth.getFullYear(), targetMonth.getMonth(), 1);
    const monthEnd = new Date(targetMonth.getFullYear(), targetMonth.getMonth() + 1, 0, 23, 59, 59);

    const monthlyRedemptions = redemptions.filter(r => {
      const d = new Date(r.created_date);
      return d >= monthStart && d <= monthEnd;
    });

    const confirmed = monthlyRedemptions.filter(r => r.status === 'confirmed');
    const pending = monthlyRedemptions.filter(r => r.status === 'pending');
    const totalFees = confirmed.reduce((sum, r) => sum + (r.fee_amount || 0), 0);
    const monthLabel = monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    // Build PDF
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(232, 80, 10);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Emberscot', 14, 20);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Monthly Redemption Report', 14, 30);

    // Business info
    doc.setTextColor(26, 26, 26);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(profile.company_name, 14, 55);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Report Period: ${monthLabel}`, 14, 63);
    doc.text(`Generated: ${now.toLocaleDateString()} at ${now.toLocaleTimeString()}`, 14, 69);

    // Summary box
    doc.setDrawColor(201, 74, 0);
    doc.setLineWidth(0.5);
    doc.roundedRect(14, 78, pageWidth - 28, 40, 3, 3);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 20, 88);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(`Total Redemptions: ${monthlyRedemptions.length}`, 20, 97);
    doc.text(`Confirmed: ${confirmed.length}`, 20, 104);
    doc.text(`Pending: ${pending.length}`, 20, 111);

    doc.text(`Total Fees Accrued: $${totalFees.toFixed(2)}`, pageWidth - 80, 97);
    const avgFee = confirmed.length > 0 ? (totalFees / confirmed.length).toFixed(2) : '0.00';
    doc.text(`Avg Fee/Redemption: $${avgFee}`, pageWidth - 80, 104);

    // Table header
    let y = 135;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setFillColor(255, 248, 242);
    doc.rect(14, y - 6, pageWidth - 28, 8, 'F');
    doc.text('Date', 16, y);
    doc.text('Coupon', 60, y);
    doc.text('Customer', 130, y);
    doc.text('Fee', 175, y);
    doc.text('Status', pageWidth - 25, y);
    y += 8;

    // Table rows
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    monthlyRedemptions.slice(0, 40).forEach((r) => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const date = new Date(r.created_date).toLocaleDateString();
      doc.text(date, 16, y);
      const title = (r.coupon_title || '').substring(0, 35);
      doc.text(title, 60, y);
      const email = (r.customer_email || 'Anonymous').substring(0, 25);
      doc.text(email, 130, y);
      doc.text(`$${(r.fee_amount || 0).toFixed(2)}`, 175, y);
      doc.text(r.status, pageWidth - 25, y);
      y += 6;
    });

    if (monthlyRedemptions.length > 40) {
      doc.text(`... and ${monthlyRedemptions.length - 40} more redemptions`, 16, y + 4);
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, doc.internal.pageSize.getHeight() - 8);
      doc.text('Emberscot - Premium Deals Marketplace', 14, doc.internal.pageSize.getHeight() - 8);
    }

    const pdfBytes = doc.output('arraybuffer');
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${monthLabel.replace(/\s/g, '_')}_report.pdf"`
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});