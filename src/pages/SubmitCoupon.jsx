import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Flame, ArrowLeft, ArrowRight, Check, AlertCircle, Store, Tag, DollarSign } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const CATEGORIES = [
  { value: 'food', label: 'Food & Dining' },
  { value: 'shopping', label: 'Shopping' },
  { value: 'travel', label: 'Travel' },
  { value: 'tech', label: 'Technology' },
  { value: 'apps', label: 'Apps & Software' },
  { value: 'health', label: 'Health & Fitness' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'home', label: 'Home & Garden' },
  { value: 'beauty', label: 'Beauty' },
  { value: 'other', label: 'Other' }
];

const DISCOUNT_TYPES = [
  { value: 'percent_off', label: 'Percent Off (e.g. 20%)' },
  { value: 'dollar_off', label: 'Dollar Off (e.g. $15)' },
  { value: 'bogo', label: 'Buy One Get One' },
  { value: 'free_shipping', label: 'Free Shipping' },
  { value: 'other', label: 'Other Deal' }
];

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export default function SubmitCoupon() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const [form, setForm] = useState({
    title: '',
    promo_code: '',
    discount_type: 'percent_off',
    discount_value: '',
    category: 'shopping',
    short_description: '',
    seo_description: '',
    expiry_date: '',
    active_from: '',
    active_to: '',
    landing_url: '',
    image_url: '',
    fee_model: 'per_redemption',
    fee_per_redemption: 3.00
  });

  React.useEffect(() => {
    const check = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        if (u.role === 'business') {
          const profiles = await base44.entities.BusinessProfile.filter({ user_id: u.id });
          if (profiles.length > 0) setProfile(profiles[0]);
        }
      } catch (e) { /* not logged in */ }
      setLoading(false);
    };
    check();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F2] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#E8500A]/20 border-t-[#E8500A] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'business') return <Navigate to="/" replace />;
  if (!profile) return <Navigate to="/business/setup" replace />;

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (!form.title || !form.promo_code || !form.landing_url) {
        throw new Error('Please fill in all required fields.');
      }

      const seoSlug = `${slugify(form.title)}-${slugify(profile.company_name)}`;

      const coupon = await base44.entities.Coupon.create({
        ...form,
        fee_per_redemption: parseFloat(form.fee_per_redemption),
        business_name: profile.company_name,
        business_profile_id: profile.id,
        seo_slug: seoSlug,
        seo_title: `${form.title} – ${form.discount_value || 'Exclusive Deal'} | ${profile.company_name}`,
        status: 'pending_review',
        is_curated: false,
        redemption_count: 0,
        view_count: 0
      });

      // Trigger AI moderation
      let moderationResult = null;
      try {
        moderationResult = await base44.functions.invoke('moderateCoupon', {
          coupon_id: coupon.id,
          title: form.title,
          promo_code: form.promo_code,
          description: form.seo_description || form.short_description,
          landing_url: form.landing_url,
          business_name: profile.company_name,
          category: form.category
        });
      } catch (modErr) {
        // If moderation fails, coupon stays in pending_review
        console.error('Moderation error:', modErr);
      }

      setResult({
        coupon,
        moderation: moderationResult?.data || moderationResult
      });
    } catch (err) {
      setError(err.message || 'Failed to submit coupon. Please try again.');
    }
    setSubmitting(false);
  };

  if (result) {
    const isApproved = result.moderation?.status === 'approved';
    return (
      <div className="min-h-screen bg-[#FFF8F2]">
        <Navbar />
        <div className="pt-32 pb-20 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <div className={`w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center ${isApproved ? 'bg-[#E8500A]/10' : 'bg-amber-100'}`}>
              {isApproved ? <Check className="w-10 h-10 text-[#E8500A]" /> : <AlertCircle className="w-10 h-10 text-amber-500" />}
            </div>
            <h1 className="text-3xl font-bold text-[#1A1A1A] mb-3">
              {isApproved ? 'Coupon is Live!' : 'Coupon Submitted for Review'}
            </h1>
            <p className="text-[#1A1A1A]/60 mb-2 max-w-md mx-auto">
              {isApproved
                ? 'Your coupon passed AI moderation and is now visible to customers on Emberscot.'
                : 'Our AI flagged this coupon for manual review. An Emberscot admin will review it shortly.'}
            </p>
            {result.moderation?.reason && (
              <p className="text-sm text-[#1A1A1A]/40 mb-6 italic">"{result.moderation.reason}"</p>
            )}
            <div className="flex items-center justify-center gap-3 mt-8">
              <Link
                to={`/coupon/${result.coupon.seo_slug}`}
                className="inline-flex items-center gap-2 px-5 py-3 bg-[#E8500A] hover:bg-[#C94A00] text-white font-semibold rounded-xl transition-colors"
              >
                View Coupon <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/business"
                className="inline-flex items-center gap-2 px-5 py-3 bg-white border border-[#C94A00]/20 text-[#1A1A1A] font-semibold rounded-xl hover:border-[#E8500A] transition-colors"
              >
                Dashboard
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F2]">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <Link to="/business" className="inline-flex items-center gap-1 text-sm text-[#1A1A1A]/50 hover:text-[#E8500A] mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </Link>

          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-6 h-6 text-[#E8500A]" fill="currentColor" />
            <h1 className="text-3xl font-bold text-[#1A1A1A]">Submit a Coupon</h1>
          </div>
          <p className="text-[#1A1A1A]/60 mb-8">
            Fill in the details below. Our AI will review your submission instantly — clean deals go live automatically.
          </p>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2 text-sm text-red-700">
              <AlertCircle className="w-5 h-5 flex-shrink-0" /> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Coupon Details */}
            <div className="bg-white rounded-2xl p-6 border border-[#C94A00]/10 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-5 h-5 text-[#E8500A]" />
                <h2 className="text-lg font-bold text-[#1A1A1A]">Coupon Details</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Coupon Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => handleChange('title', e.target.value)}
                  placeholder="e.g. 20% Off Your First Order"
                  className="w-full px-4 py-3 rounded-xl border border-[#C94A00]/20 bg-[#FFF8F2] focus:outline-none focus:border-[#E8500A] focus:ring-2 focus:ring-[#E8500A]/10 transition-colors"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Promo Code *</label>
                  <input
                    type="text"
                    value={form.promo_code}
                    onChange={e => handleChange('promo_code', e.target.value.toUpperCase())}
                    placeholder="e.g. SAVE20"
                    className="w-full px-4 py-3 rounded-xl border border-[#C94A00]/20 bg-[#FFF8F2] focus:outline-none focus:border-[#E8500A] focus:ring-2 focus:ring-[#E8500A]/10 transition-colors uppercase tracking-wider font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Discount Type *</label>
                  <select
                    value={form.discount_type}
                    onChange={e => handleChange('discount_type', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#C94A00]/20 bg-[#FFF8F2] focus:outline-none focus:border-[#E8500A] transition-colors"
                  >
                    {DISCOUNT_TYPES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Discount Value</label>
                  <input
                    type="text"
                    value={form.discount_value}
                    onChange={e => handleChange('discount_value', e.target.value)}
                    placeholder="e.g. 20% or $15"
                    className="w-full px-4 py-3 rounded-xl border border-[#C94A00]/20 bg-[#FFF8F2] focus:outline-none focus:border-[#E8500A] transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Category *</label>
                  <select
                    value={form.category}
                    onChange={e => handleChange('category', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-[#C94A00]/20 bg-[#FFF8F2] focus:outline-none focus:border-[#E8500A] transition-colors"
                  >
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Landing URL *</label>
                <input
                  type="url"
                  value={form.landing_url}
                  onChange={e => handleChange('landing_url', e.target.value)}
                  placeholder="https://yourwebsite.com"
                  className="w-full px-4 py-3 rounded-xl border border-[#C94A00]/20 bg-[#FFF8F2] focus:outline-none focus:border-[#E8500A] transition-colors"
                  required
                />
                <p className="text-xs text-[#1A1A1A]/40 mt-1">Customers will be directed here after copying the code</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Expiry Date</label>
                <input
                  type="date"
                  value={form.expiry_date}
                  onChange={e => handleChange('expiry_date', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#C94A00]/20 bg-[#FFF8F2] focus:outline-none focus:border-[#E8500A] transition-colors"
                />
              </div>
            </div>

            {/* Scheduling */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Schedule Active From</label>
                <input
                  type="date"
                  value={form.active_from}
                  onChange={e => handleChange('active_from', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#C94A00]/20 bg-[#FFF8F2] focus:outline-none focus:border-[#E8500A] transition-colors"
                />
                <p className="text-xs text-[#1A1A1A]/40 mt-1">Optional — deal goes live on this date</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Schedule Active To</label>
                <input
                  type="date"
                  value={form.active_to}
                  onChange={e => handleChange('active_to', e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-[#C94A00]/20 bg-[#FFF8F2] focus:outline-none focus:border-[#E8500A] transition-colors"
                />
                <p className="text-xs text-[#1A1A1A]/40 mt-1">Optional — deal auto-expires on this date</p>
              </div>
            </div>

            {/* SEO Content */}
            <div className="bg-white rounded-2xl p-6 border border-[#C94A00]/10 space-y-4">
              <h2 className="text-lg font-bold text-[#1A1A1A]">Description & SEO</h2>

              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Short Description</label>
                <input
                  type="text"
                  value={form.short_description}
                  onChange={e => handleChange('short_description', e.target.value)}
                  placeholder="One-line summary shown on the coupon card"
                  maxLength={120}
                  className="w-full px-4 py-3 rounded-xl border border-[#C94A00]/20 bg-[#FFF8F2] focus:outline-none focus:border-[#E8500A] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Full Description (SEO)</label>
                <textarea
                  value={form.seo_description}
                  onChange={e => handleChange('seo_description', e.target.value)}
                  placeholder="Detailed description of the deal. This content boosts your coupon's visibility in search engines."
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl border border-[#C94A00]/20 bg-[#FFF8F2] focus:outline-none focus:border-[#E8500A] transition-colors resize-none"
                />
                <p className="text-xs text-[#1A1A1A]/40 mt-1">Write 2-3 sentences describing the offer, the brand, and why customers should use it.</p>
              </div>
            </div>

            {/* Fee Model */}
            <div className="bg-white rounded-2xl p-6 border border-[#C94A00]/10 space-y-4">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#E8500A]" />
                <h2 className="text-lg font-bold text-[#1A1A1A]">Pricing</h2>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Fee Per Redemption</label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="1"
                    max="7.5"
                    step="0.50"
                    value={form.fee_per_redemption}
                    onChange={e => handleChange('fee_per_redemption', parseFloat(e.target.value))}
                    className="flex-1 accent-[#E8500A]"
                  />
                  <div className="w-24 px-4 py-2 bg-[#E8500A]/10 rounded-xl text-center">
                    <span className="text-xl font-bold text-[#E8500A]">${form.fee_per_redemption.toFixed(2)}</span>
                  </div>
                </div>
                <p className="text-xs text-[#1A1A1A]/40 mt-2">
                  You pay this amount each time a customer redeems your coupon. Higher fees may prioritize your listing.
                </p>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end gap-3">
              <Link
                to="/business"
                className="px-5 py-3 text-[#1A1A1A]/60 font-medium hover:text-[#1A1A1A] transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#E8500A] hover:bg-[#C94A00] disabled:opacity-50 text-white font-semibold rounded-xl transition-colors ember-glow"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Flame className="w-5 h-5" fill="currentColor" /> Submit & Publish
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}