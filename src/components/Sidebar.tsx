import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Search,
  CalendarDays,
  BarChart3,
  LogOut,
  Leaf,
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const NAV_ITEMS = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/food', icon: Search, label: 'Food Browser' },
  { to: '/planner', icon: CalendarDays, label: 'Meal Planner' },
  { to: '/tracker', icon: BarChart3, label: 'Nutrition' },
];

export default function Sidebar() {
  const [expanded, setExpanded] = useState(false);

  async function handleSignOut() {
    await supabase.auth.signOut();
  }

  return (
    <aside
      className={`sidebar ${expanded ? 'sidebar--expanded' : ''}`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      <div className="sidebar__logo">
        <Leaf size={22} className="sidebar__logo-icon" />
        {expanded && <span className="sidebar__logo-text">Synergeatz</span>}
      </div>

      <nav className="sidebar__nav">
        {NAV_ITEMS.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `sidebar__link${isActive ? ' sidebar__link--active' : ''}`
            }
          >
            <Icon size={20} className="sidebar__link-icon" />
            {expanded && <span className="sidebar__link-label">{label}</span>}
          </NavLink>
        ))}
      </nav>

      <button className="sidebar__signout" onClick={handleSignOut} title="Sign out">
        <LogOut size={20} />
        {expanded && <span>Sign Out</span>}
      </button>
    </aside>
  );
}
