import React, { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Flame, Heart, ArrowRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CouponCard from '@/components/CouponCard';

export default function Favorites() {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (!authed) { setLoading(false); return; }
        const u = await base44.auth.me();
        setUser(u);

        const favs = await base44.entities.Favorite.list('-created_date', 100);
        setFavorites(favs);

        // Load full coupon details for each favorite
        const couponPromises = favs.map(f =>
          base44.entities.Coupon.get(f.coupon_id).catch(() => null)
        );
        const couponResults = await Promise.all(couponPromises);
        setCoupons(couponResults.filter(c => c !== null));
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

  return (
    <div className="min-h-screen bg-[#FFF8F2]">
      <Navbar />

      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Heart className="w-6 h-6 text-[#E8500A]" fill="currentColor" />
            <span className="text-sm font-medium text-[#C94A00]">Your Saved Deals</span>
          </div>
          <h1 className="text-4xl font-bold text-[#1A1A1A]">My Favorites</h1>
          <p className="text-[#1A1A1A]/60 mt-1">
            {coupons.length > 0
              ? `${coupons.length} ${coupons.length === 1 ? 'deal' : 'deals'} saved for later`
              : 'Save deals you love and find them here anytime'}
          </p>
        </div>
      </section>

      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {coupons.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {coupons.map((c) => <CouponCard key={c.id} coupon={c} />)}
            </div>
          ) : (
            <div className="py-20 text-center">
              <Heart className="w-16 h-16 text-[#E8500A]/20 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">No Favorites Yet</h2>
              <p className="text-[#1A1A1A]/50 mb-6">Tap the heart icon on any deal to save it here.</p>
              <Link
                to="/"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#E8500A] text-white font-semibold rounded-xl hover:bg-[#C94A00] transition-colors"
              >
                <Flame className="w-5 h-5" fill="currentColor" /> Browse Deals
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}