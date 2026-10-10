import WhatsAppFloat from '@/components/WhatsApp';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LangProvider } from '@/lib/lang';
import { CartProvider } from '@/lib/cart';
import { Toaster } from '@project/components/ui/sonner';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HomePage from '@/pages/HomePage';
import DiscoverPage from '@/pages/DiscoverPage';
import ProductPage from '@/pages/ProductPage';
import BrandPage from '@/pages/BrandPage';
import CategoriesPage from '@/pages/CategoriesPage';
import DealsPage from '@/pages/DealsPage';
import LivePage from '@/pages/LivePage';
import BrandsPage from '@/pages/BrandsPage';
import QuizPage from '@/pages/QuizPage';
import CartPage from '@/pages/CartPage';
import JoinSellerPage from '@/pages/JoinSellerPage';
import AboutPage from '@/pages/AboutPage';
import ContactPage from '@/pages/ContactPage';
import GuidePage from '@/pages/GuidePage';
import CheckoutPage from '@/pages/CheckoutPage';
import AccountPage from '@/pages/AccountPage';
import AdminPage from '@/pages/AdminPage';
import ScrollToTop from '@/components/ScrollToTop';
import WishlistPage from '@/pages/WishlistPage';
import SupplierPage from '@/pages/SupplierPage';
import { WishlistProvider } from '@/lib/wishlist';

export default function App() {
  return (
    <LangProvider>
      <CartProvider><WishlistProvider>
        <BrowserRouter>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/discover" element={<DiscoverPage />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/brand/:id" element={<BrandPage />} />
                <Route path="/categories" element={<CategoriesPage />} />
                <Route path="/deals" element={<DealsPage />} />
                <Route path="/live" element={<LivePage />} />
                <Route path="/brands" element={<BrandsPage />} />
                <Route path="/quiz" element={<QuizPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/join-as-seller" element={<JoinSellerPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/contact" element={<ContactPage />} />
                <Route path="/guide" element={<GuidePage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/wishlist" element={<WishlistPage />} />
                <Route path="/supplier" element={<SupplierPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
          <Toaster />
          <WhatsAppFloat />
        </BrowserRouter>
      </WishlistProvider></CartProvider>
    </LangProvider>
  );
}
