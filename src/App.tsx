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
import EditCredentials from "./pages/EditCredentials";
import Feed from "./pages/Feed";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import SneakerCatalog from "./components/SneakerCatalog";
import { ReferralDiscountNotification } from "./components/ReferralDiscountNotification";
import ReturnPolicy from "./pages/ReturnPolicy";
import ChatBotWidget from "./components/ChatBotWidget";
import CheckoutInstructions from "./pages/CheckoutInstructions";

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
                <Route path="/catalog" element={<SneakerCatalog />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/edit-profile" element={<EditProfile />} />
                <Route path="/edit-credentials" element={<EditCredentials />} />
                <Route path="/feed" element={<Feed />} />
                <Route path="/top-posts" element={<Feed />} />
                <Route path="/credits" element={<GetFreeCredits />} />
                <Route path="/contact-us" element={<Socials />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout-instructions" element={<CheckoutInstructions />} />
                <Route path="/signin" element={<SignIn />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/return-policy" element={<ReturnPolicy />} />
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
