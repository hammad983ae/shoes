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
import ContactUs from "./pages/ContactUs";
import Cart from "./pages/Cart";
import SignIn from "./pages/SignIn";
import Profile from "./pages/Profile";
import Feed from "./pages/Feed";
import SneakerCatalog from "./components/SneakerCatalog";

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
                <Route path="/feed" element={<Feed />} />
                <Route path="/top-posts" element={<Feed />} />
                <Route path="/credits" element={<GetFreeCredits />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/signin" element={<SignIn />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Layout>
          </BrowserRouter>
        </TooltipProvider>
      </FavoritesProvider>
    </CartProvider>
  </AuthProvider>
);

export default App;
