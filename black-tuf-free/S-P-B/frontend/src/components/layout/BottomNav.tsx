import { NavLink, useLocation } from 'react-router-dom';
import { Home, LayoutGrid, Search, ShoppingCart, UserCircle } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';

const items = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/products', label: 'Categories', icon: LayoutGrid },
  { to: '/search', label: 'Search', icon: Search },
  { to: '/cart', label: 'Cart', icon: ShoppingCart },
  { to: '/login', label: 'Account', icon: UserCircle },
];

export const BottomNav = () => {
  const { totalItems } = useCart();
  const { authenticated } = useAuth();
  const location = useLocation();

  const accountTo = authenticated ? '/account' : '/login';
  const finalItems = items.map((i) => (i.label === 'Account' ? { ...i, to: accountTo } : i));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/90 backdrop-blur-md md:hidden">
      <div className="flex items-center justify-around px-2">
        {finalItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.to === '/' ? location.pathname === '/' : location.pathname.startsWith(item.to);
          return (
            <NavLink key={item.label} to={item.to} className="relative flex flex-col items-center gap-0.5 py-2.5 text-[10px]">
              {item.label === 'Cart' && totalItems > 0 && (
                <span className="absolute right-1/2 top-1 ml-3 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-danger px-1 text-[9px] font-semibold text-white">
                  {totalItems}
                </span>
              )}
              <Icon className={`h-5 w-5 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
              <span className={isActive ? 'text-primary' : 'text-muted-foreground'}>{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
