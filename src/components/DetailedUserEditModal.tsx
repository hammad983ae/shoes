import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, User, Package, Gift, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  user_id: string;
  display_name: string;
  email?: string;
  role: string;
  account_status: string;
  credits: number;
  total_spent: number;
  created_at: string;
  last_login_at?: string;
  admin_notes?: string;
}

interface Order {
  id: string;
  date: string;
  total: number;
  status: string;
}

interface CouponUsage {
  code: string;
  creator: string;
  discount: number;
  order_link: string;
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
  
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      setDisplayName(user.display_name || "");
      setRole(user.role);
      setAccountStatus(user.account_status);
      setAdminNotes(user.admin_notes || "");
    }
  }, [user]);

  if (!user) return null;

  // Mock data for demonstration
  const recentOrders: Order[] = [
    { id: "ORD-001", date: "2024-01-15", total: 299.99, status: "delivered" },
    { id: "ORD-002", date: "2024-01-10", total: 159.99, status: "shipped" },
    { id: "ORD-003", date: "2024-01-05", total: 89.99, status: "delivered" },
  ];

  const couponUsage: CouponUsage[] = [
    { code: "ALEX15", creator: "Alex Johnson", discount: 15, order_link: "/admin/orders/ORD-001" },
    { code: "SAVE20", creator: "Sarah Wilson", discount: 20, order_link: "/admin/orders/ORD-002" },
  ];

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates: Partial<User> = {
        display_name: displayName,
        role,
        account_status: accountStatus,
        admin_notes: adminNotes,
      };

      // Handle credits adjustment
      if (creditsAdjustment) {
        const adjustment = parseInt(creditsAdjustment);
        if (!isNaN(adjustment)) {
          updates.credits = user.credits + adjustment;
        }
      }

      onUpdate?.(user.user_id, updates);
      
      toast({
        title: "Success",
        description: "User updated successfully",
      });
      
      onClose();
    } catch (error) {
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Edit User - {user.display_name}</DialogTitle>
              <DialogDescription>
                Comprehensive user management and details
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="details" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="details">User Details</TabsTrigger>
            <TabsTrigger value="orders">Order History</TabsTrigger>
            <TabsTrigger value="coupons">Coupons Used</TabsTrigger>
            <TabsTrigger value="notes">Admin Notes</TabsTrigger>
          </TabsList>

          {/* User Details Tab */}
          <TabsContent value="details" className="space-y-6">
            {/* Read-Only Information */}
            <div className="space-y-4">
              <h3 className="font-semibold flex items-center space-x-2">
                <User className="h-4 w-4" />
                <span>Account Information (Read-Only)</span>
              </h3>
              
              <div className="grid md:grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg">
                <div>
                  <Label className="text-xs text-muted-foreground">User ID</Label>
                  <p className="font-mono text-sm">{user.user_id}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Email Address</Label>
                  <p className="font-medium">{user.email || 'No email provided'}</p>
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
                  <Label className="text-xs text-muted-foreground">Total Spent</Label>
                  <p className="font-medium">${(user.total_spent || 0).toFixed(2)}</p>
                </div>
              </div>
            </div>

            {/* Editable Fields */}
            <div className="space-y-4">
              <h3 className="font-semibold">Editable Fields</h3>
              
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input
                    id="display-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
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
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="credits">Current Credits</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={user.credits.toString()}
                      readOnly
                      className="bg-muted"
                    />
                    <Input
                      placeholder="+/-"
                      value={creditsAdjustment}
                      onChange={(e) => setCreditsAdjustment(e.target.value)}
                      className="w-24"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Enter +/- amount to adjust credits
                  </p>
                </div>

                <div>
                  <Label htmlFor="status">Account Status</Label>
                  <div className="flex items-center space-x-4">
                    <Select value={accountStatus} onValueChange={setAccountStatus}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="banned">Banned</SelectItem>
                      </SelectContent>
                    </Select>
                    {getStatusBadge(accountStatus)}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Order History Tab */}
          <TabsContent value="orders" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center space-x-2">
                <Package className="h-4 w-4" />
                <span>Recent Orders</span>
              </h3>
              <Badge variant="outline">{recentOrders.length} orders</Badge>
            </div>
            
            <div className="space-y-3">
              {recentOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{order.id}</p>
                    <p className="text-sm text-muted-foreground">{order.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${order.total}</p>
                    <Badge variant="outline">{order.status}</Badge>
                  </div>
                  <Button variant="outline" size="sm">
                    View Order
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Coupons Used Tab */}
          <TabsContent value="coupons" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center space-x-2">
                <Gift className="h-4 w-4" />
                <span>Coupon Usage History</span>
              </h3>
              <Badge variant="outline">{couponUsage.length} codes used</Badge>
            </div>
            
            <div className="space-y-3">
              {couponUsage.map((coupon, index) => (
                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{coupon.code}</p>
                    <p className="text-sm text-muted-foreground">Creator: {coupon.creator}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{coupon.discount}% off</p>
                    <Button variant="link" size="sm" className="p-0">
                      View Order
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Admin Notes Tab */}
          <TabsContent value="notes" className="space-y-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <h3 className="font-semibold">Internal Admin Notes</h3>
            </div>
            
            <Textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add internal notes about this user (only visible to admins)..."
              rows={8}
            />
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