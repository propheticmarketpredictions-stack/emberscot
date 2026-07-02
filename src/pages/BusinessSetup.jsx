import React, { useState, useEffect } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Flame, Store, ArrowRight, Check } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function BusinessSetup() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [existingProfile, setExistingProfile] = useState(null);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    company_name: '',
    website: '',
    contact_email: '',
    contact_phone: '',
    description: ''
  });

  useEffect(() => {
    const check = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        if (u.role === 'business') {
          const profiles = await base44.entities.BusinessProfile.filter({ user_id: u.id });
          if (profiles.length > 0) setExistingProfile(profiles[0]);
        }
      } catch (e) { /* not logged in */ }
      setLoading(false);
    };
    check();
  }, []);

  // Pre-fill email
  useEffect(() => {
    if (user?.email && !form.contact_email) {
      setForm(f => ({ ...f, contact_email: user.email }));
    }
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F2] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#E8500A]/20 border-t-[#E8500A] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (existingProfile) return <Navigate to="/business" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (!form.company_name || !form.contact_email) {
        throw new Error('Company name and contact email are required.');
      }

      // Update user role to business
      await base44.auth.updateMe({ role: 'business' });

      // Create business profile
      await base44.entities.BusinessProfile.create({
        ...form,
        user_id: user.id
      });

      navigate('/business');
    } catch (err) {
      setError(err.message || 'Failed to set up business profile.');
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-[#FFF8F2]">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[#E8500A]/10 mb-4">
              <Store className="w-8 h-8 text-[#E8500A]" />
            </div>
            <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2">Set Up Your Business</h1>
            <p className="text-[#1A1A1A]/60">
              Create your business profile to start listing coupons on Emberscot.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 sm:p-8 border border-[#C94A00]/10 space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Company Name *</label>
              <input
                type="text"
                value={form.company_name}
                onChange={e => setForm(f => ({ ...f, company_name: e.target.value }))}
                placeholder="e.g. Acme Corp"
                className="w-full px-4 py-3 rounded-xl border border-[#C94A00]/20 bg-[#FFF8F2] focus:outline-none focus:border-[#E8500A] focus:ring-2 focus:ring-[#E8500A]/10 transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Website</label>
              <input
                type="url"
                value={form.website}
                onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
                placeholder="https://yourwebsite.com"
                className="w-full px-4 py-3 rounded-xl border border-[#C94A00]/20 bg-[#FFF8F2] focus:outline-none focus:border-[#E8500A] focus:ring-2 focus:ring-[#E8500A]/10 transition-colors"
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Contact Email *</label>
                <input
                  type="email"
                  value={form.contact_email}
                  onChange={e => setForm(f => ({ ...f, contact_email: e.target.value }))}
                  placeholder="contact@yourcompany.com"
                  className="w-full px-4 py-3 rounded-xl border border-[#C94A00]/20 bg-[#FFF8F2] focus:outline-none focus:border-[#E8500A] focus:ring-2 focus:ring-[#E8500A]/10 transition-colors"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Phone</label>
                <input
                  type="tel"
                  value={form.contact_phone}
                  onChange={e => setForm(f => ({ ...f, contact_phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                  className="w-full px-4 py-3 rounded-xl border border-[#C94A00]/20 bg-[#FFF8F2] focus:outline-none focus:border-[#E8500A] focus:ring-2 focus:ring-[#E8500A]/10 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">Business Description</label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Tell customers what your business does..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-[#C94A00]/20 bg-[#FFF8F2] focus:outline-none focus:border-[#E8500A] focus:ring-2 focus:ring-[#E8500A]/10 transition-colors resize-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#E8500A] hover:bg-[#C94A00] disabled:opacity-50 text-white font-semibold rounded-xl transition-colors ember-glow"
              >
                {submitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    Create Business Profile <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-[#1A1A1A]/50">
            <Flame className="w-4 h-4 text-[#E8500A]" fill="currentColor" />
            <span>Pay $1–$7.50 per redemption. No upfront fees.</span>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}