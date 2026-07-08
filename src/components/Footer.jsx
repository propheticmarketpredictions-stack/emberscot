import React from 'react';
import { Link } from 'react-router-dom';
import { Flame, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-[#1A1A1A] text-[#FFF8F2] mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <Flame className="w-7 h-7 text-[#E8500A]" fill="currentColor" />
              <span className="text-lg font-bold">Ember<span className="text-[#E8500A]">scot</span></span>
            </div>
            <p className="text-sm text-[#FFF8F2]/60 leading-relaxed">
              Premium coupons and exclusive deals from brands you love. Every spark of savings, ignited.
            </p>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#FFF8F2]/40 mb-4">Browse</h3>
            <ul className="space-y-2">
              <li><Link to="/category/food" className="text-sm text-[#FFF8F2]/80 hover:text-[#E8500A] transition-colors">Food & Dining</Link></li>
              <li><Link to="/category/shopping" className="text-sm text-[#FFF8F2]/80 hover:text-[#E8500A] transition-colors">Shopping</Link></li>
              <li><Link to="/category/travel" className="text-sm text-[#FFF8F2]/80 hover:text-[#E8500A] transition-colors">Travel</Link></li>
              <li><Link to="/category/tech" className="text-sm text-[#FFF8F2]/80 hover:text-[#E8500A] transition-colors">Technology</Link></li>
              <li><Link to="/category/apps" className="text-sm text-[#FFF8F2]/80 hover:text-[#E8500A] transition-colors">Apps & Software</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#FFF8F2]/40 mb-4">Company</h3>
            <ul className="space-y-2">
              <li><Link to="/about" className="text-sm text-[#FFF8F2]/80 hover:text-[#E8500A] transition-colors">About Us</Link></li>
              <li><Link to="/business" className="text-sm text-[#FFF8F2]/80 hover:text-[#E8500A] transition-colors">List Your Business</Link></li>
              <li><Link to="/how-it-works" className="text-sm text-[#FFF8F2]/80 hover:text-[#E8500A] transition-colors">How It Works</Link></li>
              <li><Link to="/prompt-library" className="text-sm text-[#FFF8F2]/80 hover:text-[#E8500A] transition-colors">AI Prompt Library</Link></li>
              <li><Link to="/contact" className="text-sm text-[#FFF8F2]/80 hover:text-[#E8500A] transition-colors">Contact</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#FFF8F2]/40 mb-4">Get In Touch</h3>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm text-[#FFF8F2]/80">
                <Mail className="w-4 h-4 text-[#E8500A]" /> hello@emberscot.com
              </li>
              <li className="flex items-center gap-2 text-sm text-[#FFF8F2]/80">
                <Phone className="w-4 h-4 text-[#E8500A]" /> (888) 362-3726
              </li>
              <li className="flex items-center gap-2 text-sm text-[#FFF8F2]/80">
                <MapPin className="w-4 h-4 text-[#E8500A]" /> United States
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-[#FFF8F2]/10 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-[#FFF8F2]/40">
            © {new Date().getFullYear()} Emberscot. All rights reserved.
          </p>
          <div className="flex gap-6">
            <Link to="/privacy" className="text-xs text-[#FFF8F2]/40 hover:text-[#E8500A] transition-colors">Privacy Policy</Link>
            <Link to="/terms" className="text-xs text-[#FFF8F2]/40 hover:text-[#E8500A] transition-colors">Terms of Service</Link>
          </div>
          <p className="text-xs text-[#C94A00]/40">Powered by Emberscot</p>
        </div>
      </div>
    </footer>
  );
}