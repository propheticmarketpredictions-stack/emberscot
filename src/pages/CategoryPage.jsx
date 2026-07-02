import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Flame, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CouponCard from '@/components/CouponCard';

const CATEGORY_INFO = {
  food: { label: 'Food & Dining', icon: '🍽️', description: 'Restaurant deals, food delivery discounts, and dining coupons.' },
  shopping: { label: 'Shopping', icon: '🛍️', description: 'Retail discounts, fashion deals, and online shopping coupons.' },
  travel: { label: 'Travel', icon: '✈️', description: 'Flight deals, hotel discounts, and travel booking coupons.' },
  tech: { label: 'Technology', icon: '💻', description: 'Gadgets, electronics, and tech accessory deals.' },
  apps: { label: 'Apps & Software', icon: '📱', description: 'App subscriptions, software licenses, and SaaS deals.' },
  health: { label: 'Health & Fitness', icon: '💪', description: 'Gym memberships, supplements, and wellness discounts.' },
  entertainment: { label: 'Entertainment', icon: '🎬', description: 'Streaming, events, and entertainment deals.' },
  home: { label: 'Home & Garden', icon: '🏡', description: 'Furniture, decor, and home improvement coupons.' },
  beauty: { label: 'Beauty', icon: '✨', description: 'Cosmetics, skincare, and beauty service deals.' },
  other: { label: 'Other Deals', icon: '🔥', description: 'Miscellaneous deals and special offers.' }
};

export default function CategoryPage() {
  const { category } = useParams();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  const catInfo = CATEGORY_INFO[category] || CATEGORY_INFO.other;

  useEffect(() => {
    const loadCoupons = async () => {
      setLoading(true);
      try {
        const results = await base44.entities.Coupon.filter(
          { status: 'active', category },
          '-redemption_count',
          50
        );
        setCoupons(results);
      } catch (e) { setCoupons([]); }
      setLoading(false);
    };
    loadCoupons();
  }, [category]);

  return (
    <div className="min-h-screen bg-[#FFF8F2]">
      <Navbar />

      {/* Category Header */}
      <section className="pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-[#1A1A1A]/50 mb-4">
            <Link to="/" className="hover:text-[#E8500A]">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[#1A1A1A]">{catInfo.label}</span>
          </div>

          <div className="flex items-center gap-4 mb-2">
            <span className="text-5xl">{catInfo.icon}</span>
            <div>
              <h1 className="text-4xl font-bold text-[#1A1A1A]">{catInfo.label} Coupons</h1>
              <p className="text-[#1A1A1A]/60 mt-1">{catInfo.description}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <Flame className="w-4 h-4 text-[#E8500A]" fill="currentColor" />
            <span className="text-sm text-[#1A1A1A]/60">
              {loading ? 'Loading deals...' : `${coupons.length} active ${coupons.length === 1 ? 'deal' : 'deals'} available`}
            </span>
          </div>
        </div>
      </section>

      {/* Coupons Grid */}
      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="w-8 h-8 border-4 border-[#E8500A]/20 border-t-[#E8500A] rounded-full animate-spin" />
            </div>
          ) : coupons.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {coupons.map((c) => <CouponCard key={c.id} coupon={c} />)}
            </div>
          ) : (
            <div className="py-20 text-center">
              <Flame className="w-16 h-16 text-[#E8500A]/20 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">No Deals Yet</h2>
              <p className="text-[#1A1A1A]/50 mb-6">We're adding new {catInfo.label.toLowerCase()} deals all the time. Check back soon!</p>
              <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[#E8500A] text-white font-semibold rounded-xl hover:bg-[#C94A00] transition-colors">
                Browse All Categories
              </Link>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}