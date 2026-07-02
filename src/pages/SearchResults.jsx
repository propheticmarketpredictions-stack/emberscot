import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Flame, Search, ChevronRight } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CouponCard from '@/components/CouponCard';

export default function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [localQuery, setLocalQuery] = useState(query);

  useEffect(() => {
    setLocalQuery(query);
    const search = async () => {
      if (!query.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }
      try {
        const all = await base44.entities.Coupon.filter({ status: 'active' }, '-redemption_count', 100);
        const q = query.toLowerCase();
        const filtered = all.filter(c =>
          c.title?.toLowerCase().includes(q) ||
          c.business_name?.toLowerCase().includes(q) ||
          c.short_description?.toLowerCase().includes(q) ||
          c.category?.toLowerCase().includes(q) ||
          c.discount_value?.toLowerCase().includes(q)
        );
        setResults(filtered);
      } catch (e) { setResults([]); }
      setLoading(false);
    };
    search();
  }, [query]);

  return (
    <div className="min-h-screen bg-[#FFF8F2]">
      <Navbar />

      <section className="pt-32 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-[#1A1A1A]/50 mb-4">
            <Link to="/" className="hover:text-[#E8500A]">Home</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-[#1A1A1A]">Search</span>
          </div>

          <h1 className="text-4xl font-bold text-[#1A1A1A] mb-2">
            {query ? <>Search results for "<span className="text-[#E8500A]">{query}</span>"</> : 'Search Deals'}
          </h1>
          {!loading && (
            <p className="text-[#1A1A1A]/60">
              {results.length} {results.length === 1 ? 'deal' : 'deals'} found
            </p>
          )}
        </div>
      </section>

      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="w-8 h-8 border-4 border-[#E8500A]/20 border-t-[#E8500A] rounded-full animate-spin" />
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {results.map((c) => <CouponCard key={c.id} coupon={c} />)}
            </div>
          ) : (
            <div className="py-20 text-center">
              <Search className="w-16 h-16 text-[#E8500A]/20 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[#1A1A1A] mb-2">No Deals Found</h2>
              <p className="text-[#1A1A1A]/50 mb-6">
                {query ? `We couldn't find any deals matching "${query}".` : 'Start typing to search for deals.'}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link to="/category/food" className="px-5 py-2.5 rounded-xl bg-white border border-[#C94A00]/20 text-sm font-medium text-[#1A1A1A] hover:border-[#E8500A] transition-colors">🍽️ Food</Link>
                <Link to="/category/shopping" className="px-5 py-2.5 rounded-xl bg-white border border-[#C94A00]/20 text-sm font-medium text-[#1A1A1A] hover:border-[#E8500A] transition-colors">🛍️ Shopping</Link>
                <Link to="/category/tech" className="px-5 py-2.5 rounded-xl bg-white border border-[#C94A00]/20 text-sm font-medium text-[#1A1A1A] hover:border-[#E8500A] transition-colors">💻 Tech</Link>
                <Link to="/category/travel" className="px-5 py-2.5 rounded-xl bg-white border border-[#C94A00]/20 text-sm font-medium text-[#1A1A1A] hover:border-[#E8500A] transition-colors">✈️ Travel</Link>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}