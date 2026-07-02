import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Flame, Plus, TrendingUp, DollarSign, Clock, CheckCircle, Store, Tag, ChevronRight, BarChart3 } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import moment from 'moment';

export default function BusinessDashboard() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');

  useEffect(() => {
    const loadData = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        if (u.role !== 'business') { setLoading(false); return; }

        const profiles = await base44.entities.BusinessProfile.filter({ user_id: u.id });
        if (profiles.length > 0) {
          const p = profiles[0];
          setProfile(p);
          const [cps, reds] = await Promise.all([
            base44.entities.Coupon.filter({ business_profile_id: p.id }, '-created_date', 100),
            base44.entities.Redemption.filter({ business_profile_id: p.id }, '-created_date', 100)
          ]);
          setCoupons(cps);
          setRedemptions(reds);
        }
      } catch (e) { /* not logged in */ }
      setLoading(false);
    };
    loadData();
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

  const activeCoupons = coupons.filter(c => c.status === 'active');
  const pendingCoupons = coupons.filter(c => c.status === 'pending_review' || c.status === 'flagged');
  const pendingRedemptions = redemptions.filter(r => r.status === 'pending');
  const confirmedRedemptions = redemptions.filter(r => r.status === 'confirmed');
  const totalFees = confirmedRedemptions.reduce((sum, r) => sum + (r.fee_amount || 0), 0);

  const confirmRedemption = async (redemptionId) => {
    try {
      await base44.entities.Redemption.update(redemptionId, {
        status: 'confirmed',
        confirmed_date: new Date().toISOString()
      });
      setRedemptions(reds => reds.map(r => r.id === redemptionId ? { ...r, status: 'confirmed', confirmed_date: new Date().toISOString() } : r));
    } catch (e) {
      console.error('Failed to confirm redemption:', e);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'coupons', label: 'My Coupons', icon: Tag },
    { id: 'redemptions', label: 'Redemptions', icon: CheckCircle }
  ];

  return (
    <div className="min-h-screen bg-[#FFF8F2]">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Store className="w-5 h-5 text-[#E8500A]" />
                <span className="text-sm font-medium text-[#C94A00]">Business Dashboard</span>
              </div>
              <h1 className="text-3xl font-bold text-[#1A1A1A]">{profile.company_name}</h1>
            </div>
            <Link
              to="/business/submit"
              className="inline-flex items-center gap-2 px-5 py-3 bg-[#E8500A] hover:bg-[#C94A00] text-white font-semibold rounded-xl transition-colors ember-glow"
            >
              <Plus className="w-5 h-5" /> Submit New Coupon
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 border border-[#C94A00]/10">
              <div className="flex items-center justify-between mb-2">
                <Tag className="w-5 h-5 text-[#E8500A]" />
                <span className="text-xs text-[#1A1A1A]/40 uppercase">Active</span>
              </div>
              <p className="text-3xl font-bold text-[#1A1A1A]">{activeCoupons.length}</p>
              <p className="text-xs text-[#1A1A1A]/50">Live coupons</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-[#C94A00]/10">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle className="w-5 h-5 text-[#E8500A]" />
                <span className="text-xs text-[#1A1A1A]/40 uppercase">Pending</span>
              </div>
              <p className="text-3xl font-bold text-[#1A1A1A]">{pendingRedemptions.length}</p>
              <p className="text-xs text-[#1A1A1A]/50">Awaiting confirmation</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-[#C94A00]/10">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-[#E8500A]" />
                <span className="text-xs text-[#1A1A1A]/40 uppercase">Total</span>
              </div>
              <p className="text-3xl font-bold text-[#1A1A1A]">{redemptions.length}</p>
              <p className="text-xs text-[#1A1A1A]/50">All-time redemptions</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-[#C94A00]/10">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-5 h-5 text-[#E8500A]" />
                <span className="text-xs text-[#1A1A1A]/40 uppercase">Fees</span>
              </div>
              <p className="text-3xl font-bold text-[#1A1A1A]">${totalFees.toFixed(2)}</p>
              <p className="text-xs text-[#1A1A1A]/50">Total accrued</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-[#C94A00]/10 w-fit">
            {tabs.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    tab === t.id ? 'bg-[#E8500A] text-white' : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
                  }`}
                >
                  <Icon className="w-4 h-4" /> {t.label}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          {tab === 'overview' && (
            <div className="space-y-6">
              {/* Thermal Growth Chart */}
              <div className="bg-white rounded-2xl p-6 border border-[#C94A00]/10">
                <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">Redemption Activity</h2>
                <div className="flex items-end gap-2 h-40">
                  {Array.from({ length: 14 }).map((_, i) => {
                    const date = moment().subtract(13 - i, 'days');
                    const count = redemptions.filter(r => moment(r.created_date).isSame(date, 'day')).length;
                    const maxCount = Math.max(...Array.from({ length: 14 }).map((_, j) =>
                      redemptions.filter(r => moment(r.created_date).isSame(moment().subtract(13 - j, 'days'), 'day')).length
                    ), 1);
                    const height = count > 0 ? (count / maxCount) * 100 : 4;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                        <span className="text-[10px] text-[#1A1A1A]/0 group-hover:text-[#1A1A1A]/60 transition-colors">{count}</span>
                        <div
                          className="w-full rounded-t-md transition-all hover:opacity-80"
                          style={{
                            height: `${height}%`,
                            background: count > 0 ? `linear-gradient(to top, #C94A00, #E8500A)` : '#C94A0015'
                          }}
                        />
                        <span className="text-[10px] text-[#1A1A1A]/40">{date.format('D')}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-[#1A1A1A]/40 mt-2 text-center">Last 14 days</p>
              </div>

              {/* Recent Redemptions */}
              <div className="bg-white rounded-2xl p-6 border border-[#C94A00]/10">
                <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">Recent Redemptions</h2>
                {redemptions.length === 0 ? (
                  <p className="text-sm text-[#1A1A1A]/50 py-8 text-center">No redemptions yet. Submit a coupon to get started!</p>
                ) : (
                  <div className="space-y-2">
                    {redemptions.slice(0, 5).map(r => (
                      <div key={r.id} className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-[#FFF8F2] transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${r.status === 'confirmed' ? 'bg-[#E8500A]' : r.status === 'pending' ? 'bg-[#C94A00]/40' : 'bg-[#1A1A1A]/20'}`} />
                          <div>
                            <p className="text-sm font-medium text-[#1A1A1A]">{r.coupon_title}</p>
                            <p className="text-xs text-[#1A1A1A]/50">{moment(r.created_date).format('MMM D, h:mm a')}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-[#1A1A1A]">${(r.fee_amount || 0).toFixed(2)}</p>
                          <p className="text-xs text-[#1A1A1A]/50 capitalize">{r.status.replace(/_/g, ' ')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === 'coupons' && (
            <div className="bg-white rounded-2xl p-6 border border-[#C94A00]/10">
              {coupons.length === 0 ? (
                <div className="text-center py-12">
                  <Tag className="w-12 h-12 text-[#E8500A]/20 mx-auto mb-3" />
                  <p className="text-[#1A1A1A]/50 mb-4">You haven't submitted any coupons yet.</p>
                  <Link to="/business/submit" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E8500A] text-white font-semibold rounded-xl hover:bg-[#C94A00] transition-colors">
                    <Plus className="w-4 h-4" /> Submit Your First Coupon
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {coupons.map(c => (
                    <div key={c.id} className="flex items-center justify-between py-4 px-4 rounded-xl border border-[#C94A00]/10 hover:border-[#E8500A]/30 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-[#E8500A]/10 flex items-center justify-center">
                          <Flame className="w-5 h-5 text-[#E8500A]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-[#1A1A1A]">{c.title}</p>
                          <p className="text-xs text-[#1A1A1A]/50">
                            {c.discount_value || c.discount_type} · {c.redemption_count || 0} redemptions
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          c.status === 'active' ? 'bg-[#E8500A]/10 text-[#E8500A]' :
                          c.status === 'flagged' ? 'bg-red-100 text-red-600' :
                          c.status === 'pending_review' ? 'bg-amber-100 text-amber-600' :
                          'bg-[#1A1A1A]/5 text-[#1A1A1A]/50'
                        }`}>
                          {c.status.replace(/_/g, ' ')}
                        </span>
                        <Link to={`/coupon/${c.seo_slug || c.id}`} className="text-[#1A1A1A]/40 hover:text-[#E8500A]">
                          <ChevronRight className="w-5 h-5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'redemptions' && (
            <div className="bg-white rounded-2xl p-6 border border-[#C94A00]/10">
              <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">Pending Confirmations</h2>
              {pendingRedemptions.length === 0 ? (
                <p className="text-sm text-[#1A1A1A]/50 py-8 text-center">No pending redemptions to confirm.</p>
              ) : (
                <div className="space-y-3 mb-8">
                  {pendingRedemptions.map(r => (
                    <div key={r.id} className="flex items-center justify-between py-4 px-4 rounded-xl bg-[#FFF8F2] hover:bg-[#FFE8D6] transition-colors group">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-[#C94A00]" />
                        <div>
                          <p className="text-sm font-semibold text-[#1A1A1A]">{r.coupon_title}</p>
                          <p className="text-xs text-[#1A1A1A]/50">
                            {r.customer_email || 'Anonymous'} · {moment(r.created_date).format('MMM D, h:mm a')}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-[#1A1A1A]">${(r.fee_amount || 0).toFixed(2)}</span>
                        <button
                          onClick={() => confirmRedemption(r.id)}
                          className="px-4 py-2 bg-[#1A1A1A] hover:bg-[#E8500A] text-white text-sm font-semibold rounded-lg transition-colors"
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {confirmedRedemptions.length > 0 && (
                <>
                  <h3 className="text-sm font-semibold text-[#1A1A1A]/60 uppercase tracking-wider mb-3">Confirmed</h3>
                  <div className="space-y-2">
                    {confirmedRedemptions.slice(0, 10).map(r => (
                      <div key={r.id} className="flex items-center justify-between py-3 px-4 rounded-lg">
                        <div className="flex items-center gap-3">
                          <CheckCircle className="w-4 h-4 text-[#E8500A]" />
                          <p className="text-sm text-[#1A1A1A]">{r.coupon_title}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-[#1A1A1A]">${(r.fee_amount || 0).toFixed(2)}</p>
                          <p className="text-xs text-[#1A1A1A]/40">{r.confirmed_date ? moment(r.confirmed_date).format('MMM D') : ''}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}