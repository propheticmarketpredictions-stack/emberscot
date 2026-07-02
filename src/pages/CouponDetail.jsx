import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Flame, Copy, Check, Clock, Store, Tag, ExternalLink, Shield, TrendingUp, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CouponCard from '@/components/CouponCard';
import moment from 'moment';

export default function CouponDetail() {
  const { slug } = useParams();
  const [coupon, setCoupon] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [flashFire, setFlashFire] = useState(false);

  useEffect(() => {
    const loadCoupon = async () => {
      setLoading(true);
      try {
        let result = await base44.entities.Coupon.filter({ seo_slug: slug, status: 'active' });
        if (result.length === 0) {
          result = await base44.entities.Coupon.filter({ id: slug });
        }
        if (result.length > 0) {
          const c = result[0];
          setCoupon(c);
          // Increment view count
          try {
            await base44.asServiceRole.entities.Coupon.update(c.id, { view_count: (c.view_count || 0) + 1 });
          } catch (e) { /* view count is best-effort */ }
          // Load related
          const relatedDeals = await base44.entities.Coupon.filter(
            { status: 'active', category: c.category },
            '-redemption_count',
            4
          );
          setRelated(relatedDeals.filter(r => r.id !== c.id).slice(0, 3));
        }
      } catch (e) { /* not found */ }
      setLoading(false);
    };
    loadCoupon();
  }, [slug]);

  const handleCopyCode = async () => {
    if (!coupon) return;
    navigator.clipboard.writeText(coupon.promo_code);
    setCopied(true);
    setFlashFire(true);
    setTimeout(() => setCopied(false), 3000);
    setTimeout(() => setFlashFire(false), 500);

    // Log redemption event
    try {
      const user = await base44.auth.me().catch(() => null);
      await base44.asServiceRole.entities.Redemption.create({
        coupon_id: coupon.id,
        coupon_title: coupon.title,
        business_profile_id: coupon.business_profile_id || '',
        business_name: coupon.business_name || '',
        customer_id: user?.id || '',
        customer_email: user?.email || '',
        status: user ? 'pending' : 'self_reported',
        fee_amount: coupon.fee_per_redemption || 0
      });
      // Update redemption count
      await base44.asServiceRole.entities.Coupon.update(coupon.id, {
        redemption_count: (coupon.redemption_count || 0) + 1
      });
    } catch (e) { /* tracking is best-effort */ }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F2] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#E8500A]/20 border-t-[#E8500A] rounded-full animate-spin" />
      </div>
    );
  }

  if (!coupon) {
    return (
      <div className="min-h-screen bg-[#FFF8F2]">
        <Navbar />
        <div className="pt-32 pb-20 text-center px-4">
          <Flame className="w-16 h-16 text-[#E8500A]/20 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Deal Not Found</h1>
          <p className="text-[#1A1A1A]/50 mb-6">This coupon may have expired or been removed.</p>
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[#E8500A] text-white font-semibold rounded-xl hover:bg-[#C94A00] transition-colors">
            Back to Home
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const expired = coupon.expiry_date && moment(coupon.expiry_date).isBefore(moment());

  return (
    <div className="min-h-screen bg-[#FFF8F2]">
      <Navbar />

      {/* Breadcrumbs */}
      <div className="pt-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-sm text-[#1A1A1A]/50">
          <Link to="/" className="hover:text-[#E8500A]">Home</Link>
          <ChevronRight className="w-4 h-4" />
          <Link to={`/category/${coupon.category}`} className="hover:text-[#E8500A] capitalize">{coupon.category}</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-[#1A1A1A] truncate">{coupon.title}</span>
        </div>
      </div>

      {/* Split-pane layout */}
      <section className="py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-5 gap-8">
          {/* Left: SEO Content (60%) */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-3 py-1 rounded-full bg-[#E8500A]/10 text-[#E8500A] text-xs font-semibold uppercase tracking-wider">
                  {coupon.discount_type.replace(/_/g, ' ')}
                </span>
                <span className="flex items-center gap-1 text-xs text-[#1A1A1A]/50">
                  <Store className="w-3.5 h-3.5" /> {coupon.business_name}
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-bold text-[#1A1A1A] leading-tight mb-4">
                {coupon.title}
              </h1>
              {coupon.discount_value && (
                <p className="text-2xl font-bold text-[#E8500A] mb-4">
                  Save {coupon.discount_value}
                </p>
              )}
              {coupon.short_description && (
                <p className="text-lg text-[#1A1A1A]/70 leading-relaxed">
                  {coupon.short_description}
                </p>
              )}
            </div>

            {coupon.image_url && (
              <div className="rounded-2xl overflow-hidden h-64 bg-[#FFE8D6]">
                <img src={coupon.image_url} alt={coupon.title} className="w-full h-full object-cover" />
              </div>
            )}

            {coupon.seo_description && (
              <div className="prose prose-lg max-w-none">
                <h2 className="text-2xl font-bold text-[#1A1A1A] mb-3">About This Deal</h2>
                <p className="text-[#1A1A1A]/70 leading-relaxed whitespace-pre-line">
                  {coupon.seo_description}
                </p>
              </div>
            )}

            <div className="grid sm:grid-cols-3 gap-4 pt-4">
              <div className="bg-white rounded-xl p-5 border border-[#C94A00]/10">
                <Shield className="w-6 h-6 text-[#E8500A] mb-2" />
                <p className="text-sm font-semibold text-[#1A1A1A]">Verified Deal</p>
                <p className="text-xs text-[#1A1A1A]/50">AI-screened and quality-checked</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-[#C94A00]/10">
                <TrendingUp className="w-6 h-6 text-[#E8500A] mb-2" />
                <p className="text-sm font-semibold text-[#1A1A1A]">{coupon.redemption_count || 0} Redeemed</p>
                <p className="text-xs text-[#1A1A1A]/50">Used by savvy shoppers</p>
              </div>
              <div className="bg-white rounded-xl p-5 border border-[#C94A00]/10">
                <Clock className="w-6 h-6 text-[#E8500A] mb-2" />
                <p className="text-sm font-semibold text-[#1A1A1A]">
                  {expired ? 'Expired' : coupon.expiry_date ? `Expires ${moment(coupon.expiry_date).format('MMM D, YYYY')}` : 'No Expiry'}
                </p>
                <p className="text-xs text-[#1A1A1A]/50">{expired ? 'This deal has ended' : 'Use it before it\'s gone'}</p>
              </div>
            </div>
          </div>

          {/* Right: Sticky Thermal Card (40%) */}
          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-24">
              <div className="bg-white rounded-2xl border-2 border-[#E8500A]/20 overflow-hidden ember-glow-strong">
                {/* Header */}
                <div className="bg-gradient-to-br from-[#E8500A] to-[#C94A00] p-5 text-white">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold uppercase tracking-wider opacity-90">Your Promo Code</span>
                    <Flame className="w-5 h-5" fill="currentColor" />
                  </div>
                  <p className="text-3xl font-bold">{coupon.discount_value || 'Exclusive Deal'}</p>
                </div>

                {/* Code section with Heat Shield */}
                <div className="p-6">
                  <p className="text-xs text-[#1A1A1A]/50 mb-2 text-center uppercase tracking-wider font-semibold">
                    Tap to Reveal & Copy
                  </p>
                  <div className={`relative rounded-xl overflow-hidden ${flashFire ? 'flash-fire' : ''}`}>
                    <button
                      onClick={handleCopyCode}
                      disabled={expired}
                      className={`w-full relative py-6 px-4 border-2 border-dashed transition-all ${
                        expired
                          ? 'border-[#1A1A1A]/20 cursor-not-allowed'
                          : copied
                          ? 'border-[#E8500A] bg-[#E8500A]/5'
                          : 'border-[#E8500A]/40 hover:border-[#E8500A] bg-[#FFF8F2]'
                      }`}
                    >
                      {/* Heat Shield blur before copy */}
                      {!copied && !expired && (
                        <div className="absolute inset-0 backdrop-blur-md bg-[#FFF8F2]/30 flex items-center justify-center">
                          <div className="flex items-center gap-2 text-[#E8500A]">
                            <Flame className="w-5 h-5 animate-pulse" fill="currentColor" />
                            <span className="text-sm font-semibold">Reveal Code</span>
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-center gap-2">
                        {copied ? (
                          <Check className="w-5 h-5 text-[#E8500A]" />
                        ) : (
                          <Tag className="w-5 h-5 text-[#1A1A1A]/40" />
                        )}
                        <span className={`text-2xl font-bold tracking-wider ${copied ? 'text-[#E8500A]' : 'text-[#1A1A1A]'}`}>
                          {expired ? 'EXPIRED' : coupon.promo_code}
                        </span>
                      </div>
                    </button>
                  </div>

                  {copied && (
                    <p className="text-center text-sm text-[#E8500A] font-medium mt-3 flex items-center justify-center gap-1">
                      <Check className="w-4 h-4" /> Code copied! Now paste it at checkout.
                    </p>
                  )}

                  {coupon.landing_url && !expired && (
                    <a
                      href={coupon.landing_url.startsWith('http') ? coupon.landing_url : `https://${coupon.landing_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-4 w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#1A1A1A] hover:bg-[#E8500A] text-[#FFF8F2] font-semibold rounded-xl transition-colors"
                    >
                      Go to {coupon.business_name} <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  <div className="mt-4 pt-4 border-t border-[#C94A00]/10 space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#1A1A1A]/50">Discount Type</span>
                      <span className="font-medium text-[#1A1A1A] capitalize">{coupon.discount_type.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-[#1A1A1A]/50">Category</span>
                      <Link to={`/category/${coupon.category}`} className="font-medium text-[#E8500A] capitalize hover:underline">{coupon.category}</Link>
                    </div>
                    {coupon.expiry_date && (
                      <div className="flex justify-between text-xs">
                        <span className="text-[#1A1A1A]/50">Expires</span>
                        <span className="font-medium text-[#1A1A1A]">{moment(coupon.expiry_date).format('MMM D, YYYY')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <p className="text-xs text-[#1A1A1A]/40 text-center mt-3 px-4">
                Copy the code and paste it at checkout on {coupon.business_name}'s website to claim your discount.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related Deals */}
      {related.length > 0 && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-2xl font-bold text-[#1A1A1A] mb-6">More Deals in {coupon.category}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {related.map((c) => <CouponCard key={c.id} coupon={c} />)}
            </div>
          </div>
        </section>
      )}

      <Footer />
    </div>
  );
}