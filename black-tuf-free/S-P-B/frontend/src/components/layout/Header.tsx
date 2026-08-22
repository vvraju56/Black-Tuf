import { Fragment, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Menu, Search, ShoppingCart, UserCircle, LogOut, Heart } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useCart } from '@/hooks/useCart';
import { useAppSelector } from '@/store/hooks';
import { navLinks, SITE_NAME } from '@/lib/constants';
import { fetchProducts } from '@/lib/products-api';
import { debounce } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

export const Header = () => {
  const { user, logout, authenticated } = useAuth();
  const { totalItems } = useCart();
  const wishlistCount = useAppSelector((s) => s.wishlist.items.length);
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);

  const handleSearch = debounce(async (q: string) => {
    setQuery(q);
    if (!q.trim()) {
      setResults([]);
      return;
    }
    try {
      const { products } = await fetchProducts({ q, limit: 8 });
      setResults(products);
    } catch {
      setResults([]);
    }
  }, 350);

  const submitSearch = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    setResults([]);
  };

  return (
    <header className="sticky top-0 z-40 bg-background border-b">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <button className="md:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-6 w-6" />
          </button>
          <Link to="/" className="text-xl font-bold text-primary">{SITE_NAME}</Link>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map((l) => (
            <NavLink key={l.href} to={l.href} className={({ isActive }) => (isActive ? 'text-primary font-medium' : 'text-muted-foreground hover:text-foreground')}>
              {l.name}
            </NavLink>
          ))}
        </nav>
        <form className="flex-1 max-w-lg mx-4" onSubmit={submitSearch}>
          <div className="relative">
            <input
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-md border pl-10 pr-3 h-9 text-sm"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          {results.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-popover border rounded-md shadow-lg max-h-72 overflow-y-auto z-40">
              {results.map((p: any) => (
                <button key={p._id} onClick={() => submitSearch()} className="w-full text-left px-3 py-2 hover:bg-accent flex items-center gap-2">
                  <img src={p.images?.[0]} alt={p.name} className="h-10 w-10 object-cover rounded" />
                  <span className="text-sm">{p.name}</span>
  </button>
                ))}
            </div>
          )}
        </form>
        <div className="flex items-center gap-3">
          <Link to="/wishlist" className="relative">
            <Heart className="h-6 w-6" />
            {wishlistCount > 0 && <span className="absolute -top-1 -right-1 h-5 min-w-[20px] rounded-full bg-danger text-[10px] leading-5 text-center text-white">{wishlistCount}</span>}
          </Link>
          <Link to="/cart" className="relative">
            <ShoppingCart className="h-6 w-6" />
            {totalItems > 0 && <Badge variant="danger" className="absolute -top-1 -right-1 h-5 min-w-[20px]">{totalItems}</Badge>}
          </Link>
          {authenticated && user ? (
            <div className="flex items-center gap-2">
              <Link to={user.role === 'admin' ? '/admin' : user.role === 'seller' ? '/seller' : '/account'}>
                <img src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || 'U')}&background=2563eb&color=fff`} alt={user.name} className="h-8 w-8 rounded-full object-cover" />
              </Link>
                <button onClick={logout} className="hidden sm:inline-block">
                  <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <Link to="/login" className="hidden sm:block">
              <UserCircle className="h-7 w-7" />
            </Link>
          )}
        </div>
      </div>
      <MobileHeader open={mobileOpen} onClose={() => setMobileOpen(false)} />
    </header>
  );
};

const MobileHeader = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const { user, logout, authenticated } = useAuth();
  return (
    <div className={`md:hidden transition-all duration-300 ${open ? 'max-h-screen' : 'max-h-0'} overflow-hidden bg-background border-t`}>
      <div className="flex flex-col gap-2 p-3">
        {navLinks.map((l) => (
          <NavLink key={l.href} to={l.href} onClick={onClose} className="px-3 py-2 text-sm">
            {l.name}
          </NavLink>
        ))}
        {authenticated ? (
          <>
            <Link to={user?.role === 'seller' ? '/seller' : '/account'} onClick={onClose} className="px-3 py-2 text-sm">Account</Link>
            <button onClick={() => { logout(); onClose(); }} className="w-full text-left px-3 py-2 text-sm">Logout</button>
          </>
        ) : (
          <Link to="/login" onClick={onClose} className="px-3 py-2 text-sm">Login</Link>
        )}
      </div>
    </div>
  );
};

export default Header;
