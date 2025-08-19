   import { Toaster } from "@/components/ui/toaster";
   import { Toaster as Sonner } from "@/components/ui/sonner";
   import { TooltipProvider } from "@/components/ui/tooltip";
   import { BrowserRouter, Routes, Route } from "react-router-dom";
   import { CartProvider } from "@/contexts/CartContext";
   import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { PostHogProvider } from "@/contexts/PostHogProvider";
import Layout from "./components/Layout";
import GlobalCartProvider from "./components/GlobalCartProvider";
import CartAddNotification from "./components/CartAddNotification";
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
   import ResetPassword from "./pages/ResetPassword";
   import Catalog from "./pages/Catalog";
   import FullCatalog from "./pages/FullCatalog";
   import ProductDetail from "./pages/ProductDetail";
   import { ReferralDiscountNotification } from "./components/ReferralDiscountNotification";
import ReturnPolicy from "./pages/ReturnPolicy";
import OptInPolicy from "./pages/OptInPolicy";
import ReferralRedirect from "./components/ReferralRedirect";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import OrderHistory from "./pages/OrderHistory";
import CreatorDashboard from "./pages/CreatorDashboard";
import { DashboardLayout } from "./components/DashboardLayout";
import Dashboard from "./pages/admin/Dashboard";
import Analytics from "./pages/admin/Analytics";
import Marketing from "./pages/admin/Marketing";
import Orders from "./pages/admin/Orders";
import Products from "./pages/admin/Products";
import Users from "./pages/admin/Users";
import AdminNotFound from "./pages/admin/NotFound";
import RouteGuard from "./components/RouteGuard";

const App = () => (
  <PostHogProvider>
    <AuthProvider>
      <CartProvider>
         <FavoritesProvider>
           <TooltipProvider>
             <Toaster />
             <Sonner />
             <BrowserRouter>
               <Layout>
                 <GlobalCartProvider>
                   <Routes>
                     <Route path="/" element={<Index />} />
                     <Route path="/catalog" element={<Catalog />} />
                     <Route path="/full-catalog" element={<FullCatalog />} />
                     <Route path="/product/:slug" element={<ProductDetail />} />
                     <Route path="/profile" element={<Profile />} />
                     <Route path="/edit-profile" element={<EditProfile />} />
                     <Route path="/settings" element={<Settings />} />
                     <Route path="/wallet" element={<Wallet />} />
                     <Route path="/feed" element={<Feed />} />
                     <Route path="/top-posts" element={<Feed />} />
                     <Route path="/credits" element={<GetFreeCredits />} />
                     <Route path="/socials" element={<Socials />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="/order-confirmation" element={<OrderConfirmation />} />
                      <Route path="/order-history" element={<OrderHistory />} />
                      <Route path="/signin" element={<SignIn />} />
                     <Route path="/reset-password" element={<ResetPassword />} />
                     <Route path="/privacy" element={<Privacy />} />
                     <Route path="/terms" element={<Terms />} />
                     <Route path="/return-policy" element={<ReturnPolicy />} />
                     <Route path="/opt-in-policy" element={<OptInPolicy />} />
                     <Route path="/ref/:referralCode" element={<ReferralRedirect />} />
                     <Route path="/creator" element={
                       <RouteGuard requireCreator>
                         <CreatorDashboard />
                       </RouteGuard>
                     } />
                      <Route path="/admin/*" element={
                        <RouteGuard requireRole="admin">
                          <Routes>
                            <Route path="/" element={<DashboardLayout currentPage="dashboard"><Dashboard /></DashboardLayout>} />
                            <Route path="/analytics" element={<DashboardLayout currentPage="analytics"><Analytics /></DashboardLayout>} />
                            <Route path="/marketing" element={<DashboardLayout currentPage="marketing"><Marketing /></DashboardLayout>} />
                            <Route path="/orders" element={<DashboardLayout currentPage="orders"><Orders /></DashboardLayout>} />
                            <Route path="/products" element={<DashboardLayout currentPage="products"><Products /></DashboardLayout>} />
                            <Route path="/users" element={<DashboardLayout currentPage="users"><Users /></DashboardLayout>} />
                            <Route path="*" element={<AdminNotFound />} />
                          </Routes>
                        </RouteGuard>
                      } />
                     <Route path="*" element={<NotFound />} />
                   </Routes>
                   <ReferralDiscountNotification />
                   <CartAddNotification /> {/* Add this line */}
                 </GlobalCartProvider>
               </Layout>
             </BrowserRouter>
           </TooltipProvider>
         </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </PostHogProvider>
  );

   export default App;