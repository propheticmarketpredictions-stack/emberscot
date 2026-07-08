import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Flame, Search, Menu, X, LayoutDashboard, LogOut, User as UserIcon, Heart, Sparkles } from 'lucide-react';
import { base44 } from '@/api/base44Client';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const u = await base44.auth.me();
          setUser(u);
          if (u.role === 'business') {
            const profiles = await base44.entities.BusinessProfile.filter({ user_id: u.id });
            if (profiles.length > 0) setProfile(profiles[0]);
          }
        }
      } catch (e) { /* not logged in */ }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout();
    window.location.href = '/';
  };

  const dashboardLink = user?.role === 'admin' ? '/admin' : user?.role === 'business' ? '/business' : null;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-[#FFF8F2]/85 backdrop-blur-xl border-b-2 border-[#E8500A]/20 shadow-sm'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-300 ${scrolled ? 'h-14' : 'h-20'}`}>
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="relative">
              <Flame className="w-8 h-8 text-[#E8500A] transition-transform group-hover:scale-110" fill="currentColor" />
              <div className="absolute inset-0 bg-[#E8500A]/30 blur-lg rounded-full -z-10" />
            </div>
            <span className="text-xl font-bold text-[#1A1A1A] tracking-tight">
              Ember<span className="text-[#E8500A]">scot</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/category/food" className="text-sm font-medium text-[#1A1A1A]/70 hover:text-[#E8500A] transition-colors">Food</Link>
            <Link to="/category/shopping" className="text-sm font-medium text-[#1A1A1A]/70 hover:text-[#E8500A] transition-colors">Shopping</Link>
            <Link to="/category/travel" className="text-sm font-medium text-[#1A1A1A]/70 hover:text-[#E8500A] transition-colors">Travel</Link>
            <Link to="/category/tech" className="text-sm font-medium text-[#1A1A1A]/70 hover:text-[#E8500A] transition-colors">Tech</Link>
            <Link to="/category/apps" className="text-sm font-medium text-[#1A1A1A]/70 hover:text-[#E8500A] transition-colors">Apps</Link>

            <Link
              to="/search"
              className="flex items-center gap-1.5 text-sm font-medium text-[#1A1A1A]/70 hover:text-[#E8500A] transition-colors"
            >
              <Search className="w-4 h-4" /> Search
            </Link>

            <Link
              to="/prompt-library"
              className="flex items-center gap-1.5 text-sm font-medium text-[#1A1A1A]/70 hover:text-[#E8500A] transition-colors"
            >
              <Sparkles className="w-4 h-4" /> Playbook
            </Link>

            {user ? (
              <div className="flex items-center gap-3">
                {!dashboardLink && (
                  <Link
                    to="/favorites"
                    className="p-2 rounded-lg text-[#1A1A1A]/60 hover:text-[#E8500A] hover:bg-[#E8500A]/10 transition-colors"
                    title="My Favorites"
                  >
                    <Heart className="w-5 h-5" />
                  </Link>
                )}
                {dashboardLink && (
                  <Link
                    to={dashboardLink}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#1A1A1A] text-[#FFF8F2] text-sm font-semibold hover:bg-[#E8500A] transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4" /> Dashboard
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg text-[#1A1A1A]/60 hover:text-[#E8500A] hover:bg-[#E8500A]/10 transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#E8500A] text-white text-sm font-semibold hover:bg-[#C94A00] transition-colors ember-glow"
              >
                <UserIcon className="w-4 h-4" /> Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-[#1A1A1A] hover:bg-[#E8500A]/10"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#FFF8F2] border-t border-[#E8500A]/20 px-4 py-4 space-y-3">
          <Link to="/search" className="block py-2 text-[#1A1A1A] font-medium" onClick={() => setMobileOpen(false)}>Search Coupons</Link>
          <Link to="/prompt-library" className="block py-2 text-[#1A1A1A] font-medium" onClick={() => setMobileOpen(false)}>AI Playbook</Link>
          {['food', 'shopping', 'travel', 'tech', 'apps'].map((cat) => (
            <Link key={cat} to={`/category/${cat}`} className="block py-2 text-[#1A1A1A]/70 capitalize" onClick={() => setMobileOpen(false)}>{cat}</Link>
          ))}
          {user ? (
            <>
              {!dashboardLink && <Link to="/favorites" className="block py-2 text-[#E8500A] font-semibold" onClick={() => setMobileOpen(false)}>My Favorites</Link>}
              {dashboardLink && <Link to={dashboardLink} className="block py-2 text-[#E8500A] font-semibold" onClick={() => setMobileOpen(false)}>Dashboard</Link>}
              <button onClick={handleLogout} className="block py-2 text-[#1A1A1A]/60">Log Out</button>
            </>
          ) : (
            <Link to="/login" className="block py-2 text-[#E8500A] font-semibold" onClick={() => setMobileOpen(false)}>Sign In</Link>
          )}
        </div>
      )}
    </nav>
  );
}