import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X, User, Package, Gift, FileText, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface User {
  id: string;
  user_id: string;
  display_name: string;
  email?: string;
  role: string;
  account_status: string;
  credits: number;
  total_spent?: number;
  created_at: string;
  last_login_at?: string;
  admin_notes?: string;
  tiktok_username?: string;
  tiktok_followers?: number;
  is_creator?: boolean;
  coupon_code?: string;
}

interface Order {
  id: string;
  order_total: number;
  status: string;
  created_at: string;
  items_count?: number;
}

interface CouponUsage {
  id: string;
  coupon_code: string;
  discount_amount: number;
  order_id: string | null;
  created_at: string | null;
}

interface DetailedUserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  onUpdate?: (userId: string, updates: Partial<User>) => void;
}

export function DetailedUserEditModal({ isOpen, onClose, user, onUpdate }: DetailedUserEditModalProps) {
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("user");
  const [accountStatus, setAccountStatus] = useState("active");
  const [creditsAdjustment, setCreditsAdjustment] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [couponUsage, setCouponUsage] = useState<CouponUsage[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  
  const { toast } = useToast();

  useEffect(() => {
    if (user && isOpen) {
      setDisplayName(user.display_name || "");
      setRole(user.role);
      setAccountStatus(user.account_status || "active");
      setAdminNotes(user.admin_notes || "");
      setCreditsAdjustment("");
      
      fetchUserData();
    }
  }, [user, isOpen]);

  const fetchUserData = async () => {
    if (!user) return;
    
    setLoadingData(true);
    try {
      // Fetch user orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          id,
          order_total,
          status,
          created_at,
          order_items(*)
        `)
        .eq('user_id', user.user_id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (ordersError) throw ordersError;

      const formattedOrders = (ordersData || []).map(order => ({
        id: order.id,
        order_total: order.order_total,
        status: order.status,
        created_at: order.created_at,
        items_count: (order as any).order_items?.length || 0
      }));

      setOrders(formattedOrders);

      // Fetch coupon usage
      const { data: couponsData, error: couponsError } = await supabase
        .from('coupon_usage')
        .select('*')
        .eq('user_id', user.user_id)
        .order('created_at', { ascending: false });

      if (couponsError) throw couponsError;
      setCouponUsage(couponsData || []);

    } catch (error) {
      console.error('Error fetching user data:', error);
    } finally {
      setLoadingData(false);
    }
  };

  if (!user) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates: any = {
        display_name: displayName,
        role,
        account_status: accountStatus,
        admin_notes: adminNotes,
        is_creator: role === 'creator', // Set is_creator based on role
      };

      // Handle credits adjustment
      if (creditsAdjustment) {
        const adjustment = parseInt(creditsAdjustment);
        if (!isNaN(adjustment)) {
          const newCredits = Math.max(0, user.credits + adjustment);
          updates.credits = newCredits;
          
          // Record the credit transaction
          await supabase
            .from('credits_ledger')
            .insert({
              user_id: user.user_id,
              amount: adjustment,
              type: 'admin_adjustment',
              notes: `Admin adjustment: ${adjustment > 0 ? '+' : ''}${adjustment} credits`,
              admin_id: (await supabase.auth.getUser()).data.user?.id
            });
        }
      }

      // Update user profile
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_id', user.user_id);

      if (error) throw error;

      onUpdate?.(user.user_id, updates);
      
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      
      onClose();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'active' ? 'default' : 'destructive';
    return <Badge variant={variant}>{status}</Badge>;
  };

  const getOrderStatusColor = (status: string) => {
    switch (status) {
      case 'paid': case 'delivered': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Edit User - {user.display_name}</DialogTitle>
              <DialogDescription>
                Comprehensive user management and account details
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">Account Details</TabsTrigger>
            <TabsTrigger value="orders">Order History ({orders.length})</TabsTrigger>
            <TabsTrigger value="coupons">Coupons Used ({couponUsage.length})</TabsTrigger>
            <TabsTrigger value="notes">Admin Notes</TabsTrigger>
          </TabsList>

          {/* Account Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Read-Only Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span>Account Information (Read-Only)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-3">
                    <div>
                      <Label className="text-xs text-muted-foreground">User ID (Supabase UUID)</Label>
                      <p className="font-mono text-sm bg-muted p-2 rounded">{user.user_id}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Email Address</Label>
                      <p className="font-medium">{user.email || 'Not available'}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Date Joined</Label>
                      <p className="font-medium">{new Date(user.created_at).toLocaleDateString()}</p>
                    </div>
                     <div>
                       <Label className="text-xs text-muted-foreground">Last Login</Label>
                       <p className="font-medium">{user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}</p>
                     </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Auth Method</Label>
                      <p className="font-medium">Email/Password</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">IP Address (if tracked)</Label>
                      <p className="font-medium text-muted-foreground">Not available</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Device Info</Label>
                      <p className="font-medium text-muted-foreground">Not available</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Total Spent</Label>
                      <p className="font-medium text-green-600">${(user.total_spent || 0).toFixed(2)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Editable Fields */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <span>Admin Controls (Editable)</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="display-name">Name / Display Name</Label>
                    <Input
                      id="display-name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="User's display name"
                    />
                  </div>

                  <div>
                    <Label>Wallet Credits</Label>
                    <div className="flex space-x-2">
                      <div className="flex-1">
                        <Label className="text-xs text-muted-foreground">Current Balance</Label>
                        <Input
                          value={`${user.credits || 0} credits`}
                          readOnly
                          className="bg-muted"
                        />
                      </div>
                      <div className="w-32">
                        <Label className="text-xs text-muted-foreground">Add/Subtract</Label>
                        <Input
                          placeholder="+/-"
                          value={creditsAdjustment}
                          onChange={(e) => setCreditsAdjustment(e.target.value)}
                          type="number"
                        />
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Enter positive number to add credits, negative to subtract
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="role">User Role</Label>
                    <Select value={role} onValueChange={setRole}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="creator">Creator</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="status">Account Status</Label>
                    <div className="flex items-center space-x-4">
                      <Select value={accountStatus} onValueChange={setAccountStatus}>
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="banned">Banned</SelectItem>
                          <SelectItem value="suspended">Suspended</SelectItem>
                          <SelectItem value="pending">Pending Verification</SelectItem>
                        </SelectContent>
                      </Select>
                      {getStatusBadge(accountStatus)}
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs text-muted-foreground">Total Spent (Read-only)</Label>
                    <Input
                      value={`$${(user.total_spent || 0).toFixed(2)}`}
                      readOnly
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Calculated from completed orders
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Order History Tab */}
          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Package className="h-4 w-4" />
                  <span>Order History Preview</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="text-center py-8">Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No orders found for this user
                  </div>
                ) : (
                  <div className="space-y-3">
                    {orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">#{order.id.slice(-8)}</p>
                           <p className="text-sm text-muted-foreground">
                             {order.created_at ? new Date(order.created_at).toLocaleDateString() : 'No date'} • {order.items_count} items
                           </p>
                        </div>
                        <div className="text-right flex items-center space-x-3">
                          <div>
                            <p className="font-medium">${order.order_total.toFixed(2)}</p>
                            <Badge className={getOrderStatusColor(order.status)} variant="secondary">
                              {order.status}
                            </Badge>
                          </div>
                          <Button variant="outline" size="sm">
                            View Order
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Coupons Used Tab */}
          <TabsContent value="coupons" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gift className="h-4 w-4" />
                  <span>Coupon Usage History</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingData ? (
                  <div className="text-center py-8">Loading coupon usage...</div>
                ) : couponUsage.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No coupon codes used
                  </div>
                ) : (
                  <div className="space-y-3">
                    {couponUsage.map((coupon) => (
                      <div key={coupon.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div>
                          <p className="font-medium">{coupon.coupon_code}</p>
                           <p className="text-sm text-muted-foreground">
                             Used on {coupon.created_at ? new Date(coupon.created_at).toLocaleDateString() : 'No date'}
                           </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">
                            ${coupon.discount_amount.toFixed(2)} saved
                          </p>
                          <Button variant="link" size="sm" className="p-0">
                            View Order
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Notes Tab */}
          <TabsContent value="notes" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-4 w-4" />
                  <span>Internal Admin Notes</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add internal notes about this user (only visible to admins)..."
                  rows={12}
                  className="resize-none"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  These notes are stored in the database and only visible to administrators.
                  They can include customer service interactions, payment issues, or other relevant information.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}