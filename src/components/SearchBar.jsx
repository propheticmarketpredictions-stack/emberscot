import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Flame, X } from 'lucide-react';
import { base44 } from '@/api/base44Client';

const CATEGORIES = [
  { slug: 'food', label: 'Food & Dining' },
  { slug: 'shopping', label: 'Shopping' },
  { slug: 'travel', label: 'Travel' },
  { slug: 'tech', label: 'Technology' },
  { slug: 'apps', label: 'Apps & Software' },
  { slug: 'health', label: 'Health & Fitness' },
  { slug: 'entertainment', label: 'Entertainment' },
  { slug: 'home', label: 'Home & Garden' },
  { slug: 'beauty', label: 'Beauty' }
];

export default function SearchBar({ large = false }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        return;
      }
      try {
        const results = await base44.entities.Coupon.filter(
          { status: 'active', title: { $regex: query, $options: 'i' } },
          '-redemption_count',
          5
        );
        setSuggestions(results);
      } catch (e) {
        setSuggestions([]);
      }
    };
    const timer = setTimeout(fetchSuggestions, 200);
    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setShowSuggestions(false);
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <form onSubmit={handleSubmit} className="relative">
        <div className={`relative flex items-center ${large ? 'h-16' : 'h-12'} bg-[#1A1A1A] rounded-2xl overflow-hidden ember-glow-strong`}>
          <Search className={`absolute left-5 ${large ? 'w-6 h-6' : 'w-5 h-5'} text-[#FFF8F2]/40`} />
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            placeholder={large ? "Search for deals, brands, or categories..." : "Search deals..."}
            className={`flex-1 ${large ? 'h-16 text-lg pl-14 pr-32' : 'h-12 text-sm pl-12 pr-20'} bg-transparent text-[#FFF8F2] placeholder:text-[#FFF8F2]/40 focus:outline-none`}
          />
          <button
            type="submit"
            className={`absolute right-2 ${large ? 'h-12 px-6 text-base' : 'h-8 px-4 text-sm'} bg-[#E8500A] hover:bg-[#C94A00] text-white font-semibold rounded-xl transition-colors flex items-center gap-1.5`}
          >
            <Flame className={large ? 'w-5 h-5' : 'w-4 h-4'} fill="currentColor" />
            {large ? 'Find Deals' : 'Search'}
          </button>
        </div>
      </form>

      {/* Ember-Result dropdown */}
      {showSuggestions && (suggestions.length > 0 || query.length >= 2) && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-xl border border-[#C94A00]/20 shadow-lg overflow-hidden z-50">
          {suggestions.length > 0 ? (
            <>
              {suggestions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => { navigate(`/coupon/${s.seo_slug || s.id}`); setShowSuggestions(false); }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#FFF8F2] transition-colors text-left border-b border-[#C94A00]/5 last:border-0"
                >
                  <Flame className="w-4 h-4 text-[#E8500A] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#1A1A1A] truncate">{s.title}</p>
                    <p className="text-xs text-[#1A1A1A]/50">{s.business_name}</p>
                  </div>
                  {s.discount_value && <span className="text-sm font-bold text-[#E8500A]">{s.discount_value}</span>}
                </button>
              ))}
            </>
          ) : (
            <div className="px-4 py-6 text-center">
              <p className="text-sm text-[#1A1A1A]/50">No deals found for "{query}"</p>
              <p className="text-xs text-[#1A1A1A]/40 mt-1">Try a different search or browse categories</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}