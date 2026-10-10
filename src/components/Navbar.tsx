import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, Heart, Menu, X, User, Globe, LogOut, ShieldCheck, Store } from 'lucide-react';
import { Button } from '@project/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@project/components/ui/dropdown-menu';
import { useLang } from '@/lib/lang';
import { useCart } from '@/lib/cart';
import { useWishlist } from '@/lib/wishlist';
import Logo from '@/components/Logo';
import { useAuth } from '@project/components/lib/legacyAuth';
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const wishCount = useWishlist().items.length;
  const {
    lang,
    setLang,
    t
  } = useLang();
  const {
    totalItems
  } = useCart();
  const {
    user,
    isLoading,
    loginWithRedirect,
    logout
  } = useAuth();
  const navLinks = [{
    to: '/discover',
    label: t('nav.discover')
  }, {
    to: '/categories',
    label: t('nav.categories')
  }, {
    to: '/brands',
    label: t('nav.brands')
  }, {
    to: '/live',
    label: t('nav.live')
  }, {
    to: '/deals',
    label: t('nav.deals')
  }, {
    to: '/quiz',
    label: t('nav.quiz')
  }];
  return <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center"><Logo /></Link>

          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(l => <Link key={l.to} to={l.to} className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${location.pathname === l.to ? 'text-accent bg-accent/10' : 'text-muted-foreground hover:text-foreground'}`}>
                {l.label}
              </Link>)}
          </nav>

          <div className="flex items-center gap-1.5">
            <Button variant="ghost" size="sm" onClick={() => setLang(lang === 'en' ? 'ar' : 'en')} className="gap-1.5 text-xs font-semibold">
              <Globe className="h-4 w-4" />
              {lang === 'en' ? 'عربي' : 'EN'}
            </Button>
            <Button asChild variant="ghost" size="icon" className="hidden md:flex">
              <Link to="/discover"><Search className="h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="ghost" size="icon" className="relative">
              <Link to="/wishlist">
                <Heart className="h-4 w-4" />
                {wishCount > 0 && <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center font-bold">{wishCount}</span>}
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon" className="relative">
              <Link to="/cart">
                <ShoppingBag className="h-4 w-4" />
                {totalItems > 0 && <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center font-bold">{totalItems}</span>}
              </Link>
            </Button>

            {/* Auth */}
            {isLoading ? null : user ? <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="hidden md:flex">
                    <div className="h-7 w-7 rounded-full bg-accent/15 flex items-center justify-center">
                      <User className="h-3.5 w-3.5 text-accent" />
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium">{user.firstName || user.email}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="cursor-pointer"><User className="h-4 w-4 me-2" /> My Account</Link>
                  </DropdownMenuItem>
                  {(user.role === 'Supplier' || user.role === 'Admin') && <DropdownMenuItem asChild>
                      <Link to="/supplier" className="cursor-pointer"><Store className="h-4 w-4 me-2" /> My Store</Link>
                    </DropdownMenuItem>}
                  {user.role === 'Admin' && <DropdownMenuItem asChild>
                      <Link to="/admin" className="cursor-pointer"><ShieldCheck className="h-4 w-4 me-2" /> Admin</Link>
                    </DropdownMenuItem>}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logout({
                returnTo: '/'
              })} className="cursor-pointer text-destructive">
                    <LogOut className="h-4 w-4 me-2" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu> : <Button variant="ghost" size="sm" onClick={() => loginWithRedirect()} className="hidden md:flex text-xs font-semibold">
                Sign In
              </Button>}

            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </div>

      {mobileOpen && <div className="lg:hidden border-t border-border bg-background">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-1">
            {navLinks.map(l => <Link key={l.to} to={l.to} onClick={() => setMobileOpen(false)} className={`px-3 py-2.5 rounded-md text-sm font-medium ${location.pathname === l.to ? 'text-accent bg-accent/10' : 'text-muted-foreground'}`}>
                {l.label}
              </Link>)}
            <div className="border-t border-border my-2" />
            {user ? <>
                <Link to="/account" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm font-medium text-foreground">My Account</Link>
                {(user.role === 'Supplier' || user.role === 'Admin') && <Link to="/supplier" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm font-medium text-foreground">My Store</Link>}
                {user.role === 'Admin' && <Link to="/admin" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm font-medium text-foreground">Admin Dashboard</Link>}
                <button onClick={() => {
            logout({
              returnTo: '/'
            });
            setMobileOpen(false);
          }} className="px-3 py-2.5 text-sm font-medium text-destructive text-start">Sign Out</button>
              </> : <button onClick={() => {
          loginWithRedirect();
          setMobileOpen(false);
        }} className="px-3 py-2.5 text-sm font-semibold text-primary text-start">Sign In</button>}
            <Link to="/join-as-seller" onClick={() => setMobileOpen(false)} className="px-3 py-2.5 text-sm font-semibold text-primary">
              {t('nav.seller')}
            </Link>
          </nav>
        </div>}
    </header>;
}