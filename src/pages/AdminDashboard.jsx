import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Flame, CheckCircle, XCircle, DollarSign, TrendingUp, Tag, AlertTriangle, Flag, BarChart3, Store, Download } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import moment from 'moment';

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [coupons, setCoupons] = useState([]);
  const [redemptions, setRedemptions] = useState([]);
  const [businesses, setBusinesses] = useState([]);
  const [tab, setTab] = useState('flagged');

  useEffect(() => {
    const loadData = async () => {
      try {
        const u = await base44.auth.me();
        setUser(u);
        if (u.role !== 'admin') { setLoading(false); return; }
        const [cps, reds, biz] = await Promise.all([
          base44.asServiceRole.entities.Coupon.list('-created_date', 200),
          base44.asServiceRole.entities.Redemption.list('-created_date', 200),
          base44.asServiceRole.entities.BusinessProfile.list('-created_date', 100)
        ]);
        setCoupons(cps);
        setRedemptions(reds);
        setBusinesses(biz);
      } catch (e) { /* not logged in */ }
      setLoading(false);
    };
    loadData();
  }, []);

  const updateCouponStatus = async (couponId, status) => {
    try {
      await base44.asServiceRole.entities.Coupon.update(couponId, { status });
      setCoupons(cps => cps.map(c => c.id === couponId ? { ...c, status } : c));
    } catch (e) {
      console.error('Failed to update coupon:', e);
    }
  };

  const batchUpdateStatus = async (status) => {
    const targetIds = shownCoupons.map(c => c.id);
    if (targetIds.length === 0) return;
    try {
      await base44.asServiceRole.entities.Coupon.bulkUpdate(
        targetIds.map(id => ({ id, status }))
      );
      setCoupons(cps => cps.map(c => targetIds.includes(c.id) ? { ...c, status } : c));
    } catch (e) {
      console.error('Batch update failed:', e);
    }
  };

  const downloadReport = async () => {
    try {
      const response = await base44.functions.invoke('generateMonthlyReport', {
        business_profile_id: businesses[0]?.id || ''
      });
      // Handle blob download
      if (response.data instanceof Blob) {
        const url = URL.createObjectURL(response.data);
        const a = window.document.createElement('a');
        a.href = url;
        a.download = 'emberscot_report.pdf';
        window.document.body.appendChild(a);
        a.click();
        window.document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (e) {
      console.error('Report download failed:', e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF8F2] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-[#E8500A]/20 border-t-[#E8500A] rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;

  const flaggedCoupons = coupons.filter(c => c.status === 'flagged');
  const activeCoupons = coupons.filter(c => c.status === 'active');
  const pendingCoupons = coupons.filter(c => c.status === 'pending_review');
  const confirmedRedemptions = redemptions.filter(r => r.status === 'confirmed');
  const totalRevenue = confirmedRedemptions.reduce((sum, r) => sum + (r.fee_amount || 0), 0);
  const totalViews = coupons.reduce((sum, c) => sum + (c.view_count || 0), 0);

  const tabs = [
    { id: 'flagged', label: 'Flagged', icon: Flag, count: flaggedCoupons.length },
    { id: 'pending', label: 'Pending', icon: AlertTriangle, count: pendingCoupons.length },
    { id: 'active', label: 'Active', icon: CheckCircle, count: activeCoupons.length },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 }
  ];

  const shownCoupons = tab === 'flagged' ? flaggedCoupons : tab === 'pending' ? pendingCoupons : tab === 'active' ? activeCoupons : [];

  return (
    <div className="min-h-screen bg-[#FFF8F2]">
      <Navbar />

      <div className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-6 h-6 text-[#E8500A]" fill="currentColor" />
            <span className="text-sm font-medium text-[#C94A00]">Admin Dashboard</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1A1A1A] mb-8">Emberscot Control Center</h1>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-5 border border-[#C94A00]/10">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-5 h-5 text-[#E8500A]" />
                <span className="text-xs text-[#1A1A1A]/40 uppercase">Revenue</span>
              </div>
              <p className="text-3xl font-bold text-[#1A1A1A]">${totalRevenue.toFixed(2)}</p>
              <p className="text-xs text-[#1A1A1A]/50">From {confirmedRedemptions.length} redemptions</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-[#C94A00]/10">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-[#E8500A]" />
                <span className="text-xs text-[#1A1A1A]/40 uppercase">Views</span>
              </div>
              <p className="text-3xl font-bold text-[#1A1A1A]">{totalViews.toLocaleString()}</p>
              <p className="text-xs text-[#1A1A1A]/50">Total coupon views</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-[#C94A00]/10">
              <div className="flex items-center justify-between mb-2">
                <Tag className="w-5 h-5 text-[#E8500A]" />
                <span className="text-xs text-[#1A1A1A]/40 uppercase">Coupons</span>
              </div>
              <p className="text-3xl font-bold text-[#1A1A1A]">{coupons.length}</p>
              <p className="text-xs text-[#1A1A1A]/50">{activeCoupons.length} active</p>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-[#C94A00]/10">
              <div className="flex items-center justify-between mb-2">
                <Store className="w-5 h-5 text-[#E8500A]" />
                <span className="text-xs text-[#1A1A1A]/40 uppercase">Businesses</span>
              </div>
              <p className="text-3xl font-bold text-[#1A1A1A]">{businesses.length}</p>
              <p className="text-xs text-[#1A1A1A]/50">Registered partners</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-white rounded-xl p-1 border border-[#C94A00]/10 w-fit overflow-x-auto">
            {tabs.map(t => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    tab === t.id ? 'bg-[#E8500A] text-white' : 'text-[#1A1A1A]/60 hover:text-[#1A1A1A]'
                  }`}
                >
                  <Icon className="w-4 h-4" /> {t.label}
                  {t.count !== undefined && t.count > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${tab === t.id ? 'bg-white/20' : 'bg-[#E8500A]/10 text-[#E8500A]'}`}>
                      {t.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          {tab === 'analytics' ? (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-[#C94A00]/10">
                <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">Redemption Activity (14 days)</h2>
                <div className="flex items-end gap-2 h-48">
                  {Array.from({ length: 14 }).map((_, i) => {
                    const date = moment().subtract(13 - i, 'days');
                    const dayRedemptions = redemptions.filter(r => moment(r.created_date).isSame(date, 'day'));
                    const count = dayRedemptions.length;
                    const revenue = dayRedemptions.reduce((s, r) => s + (r.fee_amount || 0), 0);
                    const maxCount = Math.max(...Array.from({ length: 14 }).map((_, j) =>
                      redemptions.filter(r => moment(r.created_date).isSame(moment().subtract(13 - j, 'days'), 'day')).length
                    ), 1);
                    const height = count > 0 ? (count / maxCount) * 100 : 3;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                        <span className="text-[10px] text-[#1A1A1A]/0 group-hover:text-[#1A1A1A]/60 transition-colors">
                          {count > 0 ? `$${revenue.toFixed(0)}` : ''}
                        </span>
                        <div
                          className="w-full rounded-t-md transition-all hover:opacity-80"
                          style={{
                            height: `${height}%`,
                            background: count > 0 ? 'linear-gradient(to top, #C94A00, #E8500A)' : '#C94A0015'
                          }}
                        />
                        <span className="text-[10px] text-[#1A1A1A]/40">{date.format('M/D')}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-[#C94A00]/10">
                <h2 className="text-lg font-bold text-[#1A1A1A] mb-4">Top Performing Coupons</h2>
                <div className="space-y-2">
                  {[...coupons].sort((a, b) => (b.redemption_count || 0) - (a.redemption_count || 0)).slice(0, 5).map((c, i) => (
                    <div key={c.id} className="flex items-center justify-between py-3 px-4 rounded-lg hover:bg-[#FFF8F2]">
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-[#E8500A]/10 text-[#E8500A] text-xs font-bold flex items-center justify-center">{i + 1}</span>
                        <div>
                          <p className="text-sm font-medium text-[#1A1A1A]">{c.title}</p>
                          <p className="text-xs text-[#1A1A1A]/50">{c.business_name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-[#1A1A1A]">{c.redemption_count || 0} redemptions</p>
                        <p className="text-xs text-[#1A1A1A]/50">{c.view_count || 0} views</p>
                      </div>
                    </div>
                  ))}
                  {coupons.length === 0 && <p className="text-sm text-[#1A1A1A]/50 py-4 text-center">No coupons yet.</p>}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-6 border border-[#C94A00]/10">
              {shownCoupons.length > 0 && (tab === 'flagged' || tab === 'pending') && (
                <div className="flex items-center justify-end gap-2 mb-4 pb-4 border-b border-[#C94A00]/10">
                  <span className="text-xs text-[#1A1A1A]/50 mr-auto">Batch actions for {shownCoupons.length} coupons:</span>
                  <button
                    onClick={() => batchUpdateStatus('active')}
                    className="flex items-center gap-1 px-3 py-2 bg-[#1A1A1A] hover:bg-[#E8500A] text-white text-xs font-semibold rounded-lg transition-colors"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Approve All
                  </button>
                  <button
                    onClick={() => batchUpdateStatus('rejected')}
                    className="flex items-center gap-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition-colors"
                  >
                    <XCircle className="w-3.5 h-3.5" /> Reject All
                  </button>
                </div>
              )}
              {shownCoupons.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-12 h-12 text-[#E8500A]/20 mx-auto mb-3" />
                  <p className="text-[#1A1A1A]/50">
                    {tab === 'flagged' ? 'No flagged coupons. All clear!' : tab === 'pending' ? 'No pending submissions.' : 'No active coupons yet.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {shownCoupons.map(c => (
                    <div key={c.id} className="border border-[#C94A00]/10 rounded-xl p-4 hover:border-[#E8500A]/30 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase ${
                              c.status === 'flagged' ? 'bg-red-100 text-red-600' :
                              c.status === 'pending_review' ? 'bg-amber-100 text-amber-600' :
                              'bg-[#E8500A]/10 text-[#E8500A]'
                            }`}>{c.status.replace(/_/g, ' ')}</span>
                            <span className="text-xs text-[#1A1A1A]/50 capitalize">{c.category}</span>
                            {c.ai_flagged && <Flag className="w-3.5 h-3.5 text-red-500" />}
                          </div>
                          <h3 className="text-sm font-semibold text-[#1A1A1A]">{c.title}</h3>
                          <p className="text-xs text-[#1A1A1A]/60 mt-1">{c.business_name} · Code: <span className="font-mono font-medium">{c.promo_code}</span></p>
                          {c.ai_moderation_notes && (
                            <p className="text-xs text-amber-600 mt-1 italic">AI: {c.ai_moderation_notes}</p>
                          )}
                          <div className="flex items-center gap-3 mt-2 text-xs text-[#1A1A1A]/40">
                            <span>${(c.fee_per_redemption || 0).toFixed(2)}/redemption</span>
                            <span>{c.redemption_count || 0} redemptions</span>
                            <span>{c.view_count || 0} views</span>
                            <span>{moment(c.created_date).format('MMM D')}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {(c.status === 'flagged' || c.status === 'pending_review') && (
                            <>
                              <button
                                onClick={() => updateCouponStatus(c.id, 'active')}
                                className="flex items-center gap-1 px-3 py-2 bg-[#1A1A1A] hover:bg-[#E8500A] text-white text-xs font-semibold rounded-lg transition-colors"
                              >
                                <CheckCircle className="w-3.5 h-3.5" /> Approve
                              </button>
                              <button
                                onClick={() => updateCouponStatus(c.id, 'rejected')}
                                className="flex items-center gap-1 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-semibold rounded-lg transition-colors"
                              >
                                <XCircle className="w-3.5 h-3.5" /> Reject
                              </button>
                            </>
                          )}
                          {c.status === 'active' && (
                            <Link
                              to={`/coupon/${c.seo_slug || c.id}`}
                              className="px-3 py-2 bg-[#FFF8F2] hover:bg-[#FFE8D6] text-[#1A1A1A] text-xs font-semibold rounded-lg transition-colors"
                            >
                              View
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}