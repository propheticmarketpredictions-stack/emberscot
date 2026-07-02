import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Admin-only scheduled task
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date();
    const inThreeDays = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);

    // Get all active coupons expiring within 3 days
    const activeCoupons = await base44.asServiceRole.entities.Coupon.filter({ status: 'active' }, '-expiry_date', 500);

    const expiringCoupons = activeCoupons.filter(c => {
      if (!c.expiry_date) return false;
      const expiry = new Date(c.expiry_date);
      return expiry > now && expiry <= inThreeDays;
    });

    let notificationsSent = 0;

    for (const coupon of expiringCoupons) {
      // Find all users who favorited this coupon
      const favorites = await base44.asServiceRole.entities.Favorite.filter({ coupon_id: coupon.id }, '-created_date', 100);

      for (const fav of favorites) {
        // Get the user who favorited
        try {
          const favUser = await base44.asServiceRole.entities.User.get(fav.created_by_id);
          if (favUser && favUser.email) {
            await base44.asServiceRole.integrations.Core.SendEmail({
              to: favUser.email,
              subject: `⏰ Your saved deal expires soon: ${coupon.title}`,
              body: `Good news — you saved a deal that's about to expire!

${coupon.title}
Discount: ${coupon.discount_value || coupon.discount_type}
Expires: ${new Date(coupon.expiry_date).toLocaleDateString()}

Don't miss out! Click below to grab your code and use it before it's gone:
https://${Deno.env.get("BASE44_APP_ID") || 'emberscot'}.base44.app/coupon/${coupon.seo_slug || coupon.id}

— The Emberscot Team`
            });
            notificationsSent++;
          }
        } catch (userErr) {
          // Skip if user not found
        }
      }
    }

    return Response.json({
      status: 'success',
      expiring_coupons: expiringCoupons.length,
      notifications_sent: notificationsSent
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});