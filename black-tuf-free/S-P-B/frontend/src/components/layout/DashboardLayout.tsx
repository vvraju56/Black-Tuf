import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, ChevronRight } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { SITE_NAME } from '@/lib/constants';

export interface DashNavItem {
  to: string;
  label: string;
  icon: React.ReactNode;
}

interface DashboardLayoutProps {
  title: string;
  navItems: DashNavItem[];
  indexLabel: string;
  topRight?: React.ReactNode;
}

export const DashboardLayout = ({ title, navItems, indexLabel, topRight }: DashboardLayoutProps) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const NavContent = (
    <div className="flex h-full flex-col">
      <Link to="/" className="flex items-center gap-2 px-4 py-4 text-lg font-bold text-primary">
        {SITE_NAME}
        <span className="rounded bg-secondary/20 px-1.5 py-0.5 text-[10px] font-medium uppercase text-secondary">{title}</span>
      </Link>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2">
        <NavLink
          to="."
          end
          className={({ isActive }) => `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${isActive ? 'bg-primary/15 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'}`}
        >
          {navItems.find((i) => i.to === '.')?.icon || <ChevronRight className="h-4 w-4" />}
          {indexLabel}
        </NavLink>
        {navItems.filter((i) => i.to !== '.').map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={() => setOpen(false)}
            className={({ isActive }) => `flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${isActive ? 'bg-primary/15 text-primary font-medium' : 'text-muted-foreground hover:bg-muted'}`}
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="border-t border-border p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-danger/10 hover:text-danger"
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-60 border-r border-border bg-card/60 backdrop-blur lg:block">
        {NavContent}
      </aside>

      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-64 bg-card shadow-2xl">
            <button className="absolute right-3 top-3" onClick={() => setOpen(false)} aria-label="Close menu">
              <X className="h-5 w-5" />
            </button>
            {NavContent}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col lg:pl-60">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu">
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
          <div className="flex items-center gap-3">{topRight}</div>
        </header>
        <main className="flex-1 p-4 pb-24 lg:pb-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
