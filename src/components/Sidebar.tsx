import { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Search, CalendarDays, ChartBar as BarChart3, LogOut, LogIn, Leaf, CalendarCheck, Sun, Moon } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useApp } from '../context/AppContext';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', color: '#3dba7e' },
  { to: '/food', icon: Search, label: 'Food Browser', color: '#f47c3c' },
  { to: '/today', icon: CalendarCheck, label: "Today's Plan", color: '#f5c842' },
  { to: '/planner', icon: CalendarDays, label: 'Meal Planner', color: '#4da3e8' },
  { to: '/tracker', icon: BarChart3, label: 'Nutrition', color: '#f472b6' },
];

export default function Sidebar() {
  const { user, guestMode, setGuestMode } = useApp();
  const [expanded, setExpanded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDark, setIsDark] = useState(true);
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved === 'light') {
      setIsDark(false);
      document.documentElement.classList.add('light');
    }
  }, []);

  useEffect(() => {
    function checkMobile() {
      setIsMobile(window.innerWidth <= 640);
    }
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!isMobile) return;
    function handleClickOutside(e: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setExpanded(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile]);

  function handleMouseEnter() {
    if (!isMobile) setExpanded(true);
  }

  function handleMouseLeave() {
    if (!isMobile) setExpanded(false);
  }

  function handleClick() {
    if (isMobile) setExpanded(v => !v);
  }

  function toggleTheme() {
    const next = !isDark;
    setIsDark(next);
    if (next) {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    setGuestMode(false);
  }

  function handleSignIn() {
    setGuestMode(false);
  }

  return (
    <aside
      ref={sidebarRef}
      className={`sidebar ${expanded ? 'sidebar--expanded' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={isMobile ? handleClick : undefined}
    >
      <div className="sidebar__logo">
        <Leaf size={22} className="sidebar__logo-icon" />
        {expanded && <span className="sidebar__logo-text">Synergeatz</span>}
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map(({ to, icon: Icon, label, color }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={() => isMobile && setExpanded(false)}
            className={({ isActive }) =>
              `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
            }
          >
            <Icon size={20} className="sidebar__link-icon" style={{ color: expanded ? color : undefined }} />
            {expanded && <span className="sidebar__link-label">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar__bottom">
        <button
          type="button"
          className="sidebar__theme-btn"
          onClick={e => { e.stopPropagation(); toggleTheme(); }}
          title={isDark ? 'Light Mode' : 'Dark Mode'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
          {expanded && <span>{isDark ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {user ? (
          <button type="button" className="sidebar__signout" onClick={handleSignOut} title="Sign out">
            <LogOut size={20} />
            {expanded && <span>Sign Out</span>}
          </button>
        ) : guestMode ? (
          <button type="button" className="sidebar__guest-btn" onClick={handleSignIn} title="Sign in">
            <LogIn size={20} />
            {expanded && <span>Sign In</span>}
          </button>
        ) : null}
      </div>
    </aside>
  );
}
