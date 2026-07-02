import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, TrendingUp, Clock, ArrowRight, Store, Shield, Zap } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CouponCard from '@/components/CouponCard';
import SearchBar from '@/components/SearchBar';

const CATEGORIES = [
  { slug: 'food', label: 'Food & Dining', icon: '🍽️', gradient: 'from-[#E8500A] to-[#C94A00]' },
  { slug: 'shopping', label: 'Shopping', icon: '🛍️', gradient: 'from-[#C94A00] to-[#8B3300]' },
  { slug: 'travel', label: 'Travel', icon: '✈️', gradient: 'from-[#E8500A] to-[#FF6B1A]' },
  { slug: 'tech', label: 'Technology', icon: '💻', gradient: 'from-[#1A1A1A] to-[#3D3D3D]' },
  { slug: 'apps', label: 'Apps & Software', icon: '📱', gradient: 'from-[#C94A00] to-[#E8500A]' },
  { slug: 'health', label: 'Health & Fitness', icon: '💪', gradient: 'from-[#E8500A] to-[#1A1A1A]' },
  { slug: 'entertainment', label: 'Entertainment', icon: '🎬', gradient: 'from-[#8B3300] to-[#C94A00]' },
  { slug: 'home', label: 'Home & Garden', icon: '🏡', gradient: 'from-[#E8500A] to-[#C94A00]' },
  { slug: 'beauty', label: 'Beauty', icon: '✨', gradient: 'from-[#FF6B1A] to-[#E8500A]' }
];

export default function Home() {
  const [featuredCoupons, setFeaturedCoupons] = useState([]);
  const [trendingCoupons, setTrendingCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCoupons = async () => {
      try {
        const [featured, trending] = await Promise.all([
          base44.entities.Coupon.filter({ status: 'active', is_featured: true }, '-created_date', 8),
          base44.entities.Coupon.filter({ status: 'active' }, '-redemption_count', 8)
        ]);
        setFeaturedCoupons(featured);
        setTrendingCoupons(trending);
      } catch (e) {
        // If no coupons exist yet, show empty state
      }
      setLoading(false);
    };
    loadCoupons();
  }, []);

  return (
    <div className="min-h-screen bg-[#FFF8F2]">
      <Navbar />

      {/* Hero — Ignition Hub */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Heat-Haze background */}
        <div className="absolute inset-0 heat-haze pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[#E8500A]/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E8500A]/10 border border-[#E8500A]/20 mb-8">
            <Flame className="w-4 h-4 text-[#E8500A]" fill="currentColor" />
            <span className="text-sm font-medium text-[#C94A00]">Premium Deals, Ignited Daily</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-[#1A1A1A] mb-6 leading-[1.05]">
            Every Deal a
            <span className="relative inline-block mx-3">
              <span className="relative z-10 text-[#E8500A]">Spark</span>
              <span className="absolute bottom-2 left-0 right-0 h-3 bg-[#E8500A]/20 -z-0 rounded-full" />
            </span>
            of Value
          </h1>

          <p className="text-lg sm:text-xl text-[#1A1A1A]/60 mb-10 max-w-2xl mx-auto leading-relaxed">
            Discover exclusive coupons and promo codes from brands you love. Copy, redeem, and save — every transaction fuels growth for businesses and savings for you.
          </p>

          {/* Black Hole Search */}
          <div className="max-w-2xl mx-auto mb-8">
            <SearchBar large />
          </div>

          {/* Quick stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 mt-12">
            <div className="text-center">
              <p className="text-3xl font-bold text-[#E8500A]">{featuredCoupons.length + trendingCoupons.length}+</p>
              <p className="text-xs text-[#1A1A1A]/50 uppercase tracking-wider">Active Deals</p>
            </div>
            <div className="w-px h-12 bg-[#C94A00]/20" />
            <div className="text-center">
              <p className="text-3xl font-bold text-[#E8500A]">9</p>
              <p className="text-xs text-[#1A1A1A]/50 uppercase tracking-wider">Categories</p>
            </div>
            <div className="w-px h-12 bg-[#C94A00]/20" />
            <div className="text-center">
              <p className="text-3xl font-bold text-[#E8500A]">$1-7.50</p>
              <p className="text-xs text-[#1A1A1A]/50 uppercase tracking-wider">Per Redemption</p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Lattice */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-[#1A1A1A]">Browse by Category</h2>
              <p className="text-[#1A1A1A]/50 mt-1">Find deals tailored to what you love</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="group relative h-28 rounded-xl overflow-hidden border border-[#C94A00]/15 hover:border-[#E8500A]/40 transition-all duration-300 hover:shadow-[0_4px_20px_-2px_rgba(232,80,10,0.2)]"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.gradient} opacity-90`} />
                <div className="relative h-full flex flex-col items-center justify-center p-4">
                  <span className="text-3xl mb-1">{cat.icon}</span>
                  <span className="text-sm font-semibold text-white text-center">{cat.label}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Deals */}
      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-[#E8500A]/20 border-t-[#E8500A] rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {featuredCoupons.length > 0 && (
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-5 h-5 text-[#E8500A]" fill="currentColor" />
                      <span className="text-sm font-semibold text-[#E8500A] uppercase tracking-wider">Featured</span>
                    </div>
                    <h2 className="text-3xl font-bold text-[#1A1A1A]">Today's Hottest Deals</h2>
                  </div>
                  <Link to="/search" className="hidden sm:flex items-center gap-1 text-sm font-medium text-[#E8500A] hover:gap-2 transition-all">
                    View All <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {featuredCoupons.map((c) => <CouponCard key={c.id} coupon={c} />)}
                </div>
              </div>
            </section>
          )}

          {/* Trending */}
          {trendingCoupons.length > 0 && (
            <section className="py-16 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <TrendingUp className="w-5 h-5 text-[#E8500A]" />
                      <span className="text-sm font-semibold text-[#E8500A] uppercase tracking-wider">Trending</span>
                    </div>
                    <h2 className="text-3xl font-bold text-[#1A1A1A]">Most Redeemed This Week</h2>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {trendingCoupons.map((c) => <CouponCard key={c.id} coupon={c} />)}
                </div>
              </div>
            </section>
          )}

          {featuredCoupons.length === 0 && trendingCoupons.length === 0 && (
            <section className="py-20 px-4 text-center">
              <Flame className="w-16 h-16 text-[#E8500A]/20 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">Deals Coming Soon</h2>
              <p className="text-[#1A1A1A]/50 mb-6">We're igniting partnerships with top brands. Check back shortly!</p>
              <Link
                to="/business"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#E8500A] text-white font-semibold rounded-xl hover:bg-[#C94A00] transition-colors"
              >
                <Store className="w-5 h-5" /> List Your Business
              </Link>
            </section>
          )}
        </>
      )}

      {/* Business CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto bg-[#1A1A1A] rounded-3xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#E8500A]/15 rounded-full blur-[100px]" />
          <div className="relative p-10 sm:p-16 grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8500A]/20 mb-4">
                <Store className="w-4 h-4 text-[#E8500A]" />
                <span className="text-xs font-medium text-[#E8500A]">For Businesses</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold text-[#FFF8F2] mb-4">
                List Your Coupons.<br />Grow Your Revenue.
              </h2>
              <p className="text-[#FFF8F2]/60 mb-6 leading-relaxed">
                Reach thousands of deal-hunters. Pay only $1–$7.50 per redemption. AI-powered moderation keeps quality high.
              </p>
              <Link
                to="/business"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#E8500A] hover:bg-[#C94A00] text-white font-semibold rounded-xl transition-colors"
              >
                Get Started <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#FFF8F2]/5 rounded-2xl p-6 border border-[#FFF8F2]/10">
                <Shield className="w-8 h-8 text-[#E8500A] mb-3" />
                <p className="text-2xl font-bold text-[#FFF8F2]">AI Moderation</p>
                <p className="text-sm text-[#FFF8F2]/50 mt-1">Smart screening on every submission</p>
              </div>
              <div className="bg-[#FFF8F2]/5 rounded-2xl p-6 border border-[#FFF8F2]/10">
                <TrendingUp className="w-8 h-8 text-[#E8500A] mb-3" />
                <p className="text-2xl font-bold text-[#FFF8F2]">Pay Per Use</p>
                <p className="text-sm text-[#FFF8F2]/50 mt-1">Only pay when customers redeem</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}