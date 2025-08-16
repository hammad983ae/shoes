   import { Toaster } from "@/components/ui/toaster";
   import { Toaster as Sonner } from "@/components/ui/sonner";
   import { TooltipProvider } from "@/components/ui/tooltip";
   import { BrowserRouter, Routes, Route } from "react-router-dom";
   import { CartProvider } from "@/contexts/CartContext";
   import { FavoritesProvider } from "@/contexts/FavoritesContext";
   import { AuthProvider } from "@/contexts/AuthContext";
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
     <AuthProvider>
       <CartProvider>
         <FavoritesProvider>
           <TooltipProvider>
             <Toaster />
             <Sonner />
              <BrowserRouter>
                <GlobalCartProvider>
                  <Routes>
                    {/* Main app routes with Layout */}
                    <Route path="/" element={<Layout><Index /></Layout>} />
                    <Route path="/catalog" element={<Layout><Catalog /></Layout>} />
                    <Route path="/full-catalog" element={<Layout><FullCatalog /></Layout>} />
                    <Route path="/product/:id" element={<Layout><ProductDetail /></Layout>} />
                    <Route path="/profile" element={<Layout><Profile /></Layout>} />
                    <Route path="/edit-profile" element={<Layout><EditProfile /></Layout>} />
                    <Route path="/settings" element={<Layout><Settings /></Layout>} />
                    <Route path="/wallet" element={<Layout><Wallet /></Layout>} />
                    <Route path="/feed" element={<Layout><Feed /></Layout>} />
                    <Route path="/top-posts" element={<Layout><Feed /></Layout>} />
                    <Route path="/credits" element={<Layout><GetFreeCredits /></Layout>} />
                    <Route path="/socials" element={<Layout><Socials /></Layout>} />
                    <Route path="/cart" element={<Layout><Cart /></Layout>} />
                    <Route path="/checkout" element={<Layout><Checkout /></Layout>} />
                    <Route path="/signin" element={<Layout><SignIn /></Layout>} />
                    <Route path="/reset-password" element={<Layout><ResetPassword /></Layout>} />
                    <Route path="/privacy" element={<Layout><Privacy /></Layout>} />
                    <Route path="/terms" element={<Layout><Terms /></Layout>} />
                    <Route path="/return-policy" element={<Layout><ReturnPolicy /></Layout>} />
                    <Route path="/opt-in-policy" element={<Layout><OptInPolicy /></Layout>} />
                    <Route path="/ref/:referralCode" element={<Layout><ReferralRedirect /></Layout>} />
                    <Route path="/creator" element={
                      <Layout>
                        <RouteGuard requireCreator>
                          <CreatorDashboard />
                        </RouteGuard>
                      </Layout>
                    } />
                    
                    {/* Admin routes without Layout - only DashboardLayout */}
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
                    <Route path="*" element={<Layout><NotFound /></Layout>} />
                  </Routes>
                  <ReferralDiscountNotification />
                  <CartAddNotification />
                </GlobalCartProvider>
              </BrowserRouter>
           </TooltipProvider>
         </FavoritesProvider>
       </CartProvider>
     </AuthProvider>
   );

   export default App;