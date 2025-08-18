import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Search, User } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  user_id: string;
  display_name: string;
  email?: string;
}

interface AddCreatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddCreatorModal({ isOpen, onClose, onSuccess }: AddCreatorModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [tier, setTier] = useState("tier1");
  const [couponCode, setCouponCode] = useState("");
  const [startingCredits, setStartingCredits] = useState("");
  const [tiktokUsername, setTiktokUsername] = useState("");
  const [followers, setFollowers] = useState("");
  const [customersAcquired, setCustomersAcquired] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  
  const { toast } = useToast();

  // Mock users for demonstration - in real app, this would be fetched from API
  const mockUsers: User[] = [
    { id: "1", user_id: "user-1", display_name: "John Doe", email: "john@example.com" },
    { id: "2", user_id: "user-2", display_name: "Jane Smith", email: "jane@example.com" },
    { id: "3", user_id: "user-3", display_name: "Alex Johnson", email: "alex@example.com" },
  ];

  const filteredUsers = mockUsers.filter(user =>
    user.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserSelect = (user: User) => {
    setSelectedUser(user);
    setSearchTerm(user.display_name);
    setShowSuggestions(false);
    // Auto-generate coupon code based on name
    const baseCode = user.display_name.split(' ')[0].toUpperCase();
    setCouponCode(`${baseCode}15`);
  };

  const handleSubmit = async () => {
    if (!selectedUser) {
      toast({
        title: "Error",
        description: "Please select a user first",
        variant: "destructive",
      });
      return;
    }

    if (!couponCode.trim()) {
      toast({
        title: "Error",
        description: "Coupon code is required",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Here you would call your API to promote user to creator
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call
      
      toast({
        title: "Success",
        description: `${selectedUser.display_name} has been promoted to creator`,
      });
      
      onSuccess?.();
      onClose();
      resetForm();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create creator",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSearchTerm("");
    setSelectedUser(null);
    setTier("tier1");
    setCouponCode("");
    setStartingCredits("");
    setTiktokUsername("");
    setFollowers("");
    setCustomersAcquired("");
    setNotes("");
  };

  const handleClose = () => {
    onClose();
    resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>Add Creator</DialogTitle>
              <DialogDescription>
                Promote a user to creator with initial setup
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* User Search */}
          <div className="space-y-2">
            <Label>Search User</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(true);
                  if (!e.target.value) setSelectedUser(null);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="pl-10"
              />
              
              {/* Suggestions Dropdown */}
              {showSuggestions && searchTerm && (
                <div className="absolute z-10 w-full mt-1 bg-background border rounded-md shadow-lg max-h-40 overflow-y-auto">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className="flex items-center space-x-3 p-3 hover:bg-muted cursor-pointer"
                        onClick={() => handleUserSelect(user)}
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{user.display_name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-sm text-muted-foreground">No users found</div>
                  )}
                </div>
              )}
            </div>
            
            {selectedUser && (
              <div className="flex items-center space-x-2 p-3 bg-muted/50 rounded-lg">
                <User className="h-4 w-4" />
                <div>
                  <p className="font-medium">{selectedUser.display_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                </div>
                <Badge variant="outline">Selected</Badge>
              </div>
            )}
          </div>

          {/* Creator Setup Form */}
          {selectedUser && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tier">Commission Tier</Label>
                  <Select value={tier} onValueChange={setTier}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tier1">Tier 1 (10%)</SelectItem>
                      <SelectItem value="tier2">Tier 2 (15%)</SelectItem>
                      <SelectItem value="tier3">Tier 3 (20%)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="coupon">Coupon Code</Label>
                  <Input
                    id="coupon"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="e.g., ALEX15"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="credits">Starting Credits</Label>
                  <Input
                    id="credits"
                    type="number"
                    value={startingCredits}
                    onChange={(e) => setStartingCredits(e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div>
                  <Label htmlFor="customers">Starting Customers Acquired</Label>
                  <Input
                    id="customers"
                    type="number"
                    value={customersAcquired}
                    onChange={(e) => setCustomersAcquired(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tiktok">TikTok Username</Label>
                  <Input
                    id="tiktok"
                    value={tiktokUsername}
                    onChange={(e) => setTiktokUsername(e.target.value)}
                    placeholder="@username"
                  />
                </div>

                <div>
                  <Label htmlFor="followers">TikTok Followers</Label>
                  <Input
                    id="followers"
                    type="number"
                    value={followers}
                    onChange={(e) => setFollowers(e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Internal Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any internal notes about this creator..."
                  rows={3}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={!selectedUser || loading}
            >
              {loading ? "Creating..." : "Create Creator"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}