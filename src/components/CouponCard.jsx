import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Clock, Tag, Heart } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import moment from 'moment';

const DISCOUNT_BADGES = {
  percent_off: { label: '% OFF', color: 'bg-[#E8500A] text-white' },
  dollar_off: { label: '$ OFF', color: 'bg-[#C94A00] text-white' },
  bogo: { label: 'BOGO', color: 'bg-[#1A1A1A] text-[#FFF8F2]' },
  free_shipping: { label: 'FREE SHIP', color: 'bg-[#E8500A]/90 text-white' },
  other: { label: 'DEAL', color: 'bg-[#C94A00] text-white' }
};

export default function CouponCard({ coupon }) {
  const badge = DISCOUNT_BADGES[coupon.discount_type] || DISCOUNT_BADGES.other;
  const expired = coupon.expiry_date && moment(coupon.expiry_date).isBefore(moment());
  const [isFavorited, setIsFavorited] = useState(false);
  const [checkingFav, setCheckingFav] = useState(true);

  useEffect(() => {
    const checkFav = async () => {
      try {
        const authed = await base44.auth.isAuthenticated();
        if (!authed) { setCheckingFav(false); return; }
        const existing = await base44.entities.Favorite.filter({ coupon_id: coupon.id });
        setIsFavorited(existing.length > 0);
      } catch (e) { /* not logged in */ }
      setCheckingFav(false);
    };
    checkFav();
  }, [coupon.id]);

  const toggleFavorite = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const authed = await base44.auth.isAuthenticated();
      if (!authed) {
        window.location.href = '/login';
        return;
      }
      if (isFavorited) {
        const existing = await base44.entities.Favorite.filter({ coupon_id: coupon.id });
        if (existing.length > 0) {
          await base44.entities.Favorite.delete(existing[0].id);
        }
        setIsFavorited(false);
      } else {
        await base44.entities.Favorite.create({
          coupon_id: coupon.id,
          coupon_title: coupon.title,
          business_name: coupon.business_name || '',
          category: coupon.category || ''
        });
        setIsFavorited(true);
      }
    } catch (err) {
      console.error('Favorite toggle failed:', err);
    }
  };

  return (
    <Link
      to={`/coupon/${coupon.seo_slug || coupon.id}`}
      className="group relative block bg-white rounded-xl coupon-notch overflow-hidden border border-[#C94A00]/15 hover:border-[#E8500A]/40 transition-all duration-300 hover:shadow-[0_8px_32px_-4px_rgba(232,80,10,0.2)] hover:-translate-y-0.5"
    >
      {/* Deal type vertical tag */}
      <div className={`absolute left-0 top-4 ${badge.color} text-[10px] font-bold tracking-wider px-2 py-1 rounded-r-md z-10`}>
        {badge.label}
      </div>

      {/* Favorite heart */}
      {!checkingFav && (
        <button
          onClick={toggleFavorite}
          className="absolute right-2 top-2 z-10 p-1.5 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
          aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
        >
          <Heart
            className={`w-4 h-4 transition-all ${isFavorited ? 'text-[#E8500A] fill-[#E8500A] scale-110' : 'text-[#1A1A1A]/40 hover:text-[#E8500A]'}`}
          />
        </button>
      )}

      {/* Image / gradient header */}
      <div className="h-32 bg-gradient-to-br from-[#FFF8F2] to-[#FFE8D6] relative overflow-hidden">
        {coupon.image_url ? (
          <img
            src={coupon.image_url}
            alt={coupon.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <Flame className="w-12 h-12 text-[#E8500A]/20 group-hover:text-[#E8500A]/40 transition-colors" />
          </div>
        )}
        {expired && (
          <div className="absolute inset-0 bg-[#1A1A1A]/60 flex items-center justify-center">
            <span className="text-[#FFF8F2] font-bold text-sm uppercase tracking-wider">Expired</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4 pt-3">
        <div className="flex items-center gap-1.5 mb-2">
          <Tag className="w-3 h-3 text-[#C94A00]" />
          <span className="text-xs font-medium text-[#C94A00] truncate">{coupon.business_name || 'Emberscot Deal'}</span>
        </div>
        <h3 className="text-sm font-bold text-[#1A1A1A] leading-snug mb-2 line-clamp-2 group-hover:text-[#E8500A] transition-colors">
          {coupon.title}
        </h3>
        {coupon.short_description && (
          <p className="text-xs text-[#1A1A1A]/60 line-clamp-2 mb-3 leading-relaxed">
            {coupon.short_description}
          </p>
        )}
        <div className="flex items-center justify-between">
          {coupon.discount_value && (
            <span className="text-lg font-bold text-[#E8500A]">{coupon.discount_value}</span>
          )}
          {coupon.expiry_date && !expired && (
            <span className="flex items-center gap-1 text-[10px] text-[#1A1A1A]/50">
              <Clock className="w-3 h-3" />
              {moment(coupon.expiry_date).format('MMM D')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}