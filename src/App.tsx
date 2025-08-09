
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Layout from "./components/Layout";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import GetFreeCredits from "./pages/GetFreeCredits";
import Socials from "./pages/Socials";
import Cart from "./pages/Cart";
import SignIn from "./pages/SignIn";
import Profile from "./pages/Profile";
import EditProfile from "./pages/EditProfile";
import Settings from "./pages/Settings";
import Wallet from "./pages/Wallet";
import Feed from "./pages/Feed";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import Catalog from "./pages/Catalog";
import FullCatalog from "./pages/FullCatalog";
import ProductDetail from "./pages/ProductDetail";
import { ReferralDiscountNotification } from "./components/ReferralDiscountNotification";
import ReturnPolicy from "./pages/ReturnPolicy";
import OptInPolicy from "./pages/OptInPolicy";
import ReferralRedirect from "./components/ReferralRedirect";
import Checkout from "./pages/Checkout";

const App = () => (
  <AuthProvider>
    <CartProvider>
      <FavoritesProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Layout>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/catalog" element={<Catalog />} />
                <Route path="/full-catalog" element={<FullCatalog />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/edit-profile" element={<EditProfile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/wallet" element={<Wallet />} />
                <Route path="/feed" element={<Feed />} />
                <Route path="/top-posts" element={<Feed />} />
                <Route path="/credits" element={<GetFreeCredits />} />
                <Route path="/contact-us" element={<Socials />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/return-policy" element={<ReturnPolicy />} />
                <Route path="/opt-in-policy" element={<OptInPolicy />} />
                <Route path="/ref/:referralCode" element={<ReferralRedirect />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <ReferralDiscountNotification />
            </Layout>
          </BrowserRouter>
        </TooltipProvider>
      </FavoritesProvider>
    </CartProvider>
  </AuthProvider>
);

export default App;
