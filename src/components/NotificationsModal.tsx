import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter, X } from "lucide-react";

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: Notification[];
  loading?: boolean;
}

export function NotificationsModal({ isOpen, onClose, notifications, loading = false }: NotificationsModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDate = filterDate ? notification.time.includes(filterDate) : true;
    return matchesSearch && matchesDate;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'success': return 'bg-green-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>All Notifications</DialogTitle>
              <DialogDescription>
                View and manage all system notifications
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        {/* Search and Filter Controls */}
        <div className="flex items-center space-x-4 py-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="w-48"
          />
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto space-y-3">
          {loading ? (
            Array.from({ length: 10 }).map((_, index) => (
              <div key={index} className="flex space-x-3 p-4 rounded-lg border">
                <Skeleton className="w-2 h-2 rounded-full mt-2" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-64" />
                  <Skeleton className="h-3 w-20" />
                </div>
                <Skeleton className="h-6 w-16" />
              </div>
            ))
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || filterDate ? 'No notifications match your filters' : 'No notifications found'}
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div key={notification.id} className="flex space-x-3 p-4 rounded-lg border hover:bg-muted/50">
                <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${getTypeColor(notification.type)}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm font-medium">{notification.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                      <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={notification.type === 'error' ? 'destructive' : 'secondary'}>
                        {notification.type}
                      </Badge>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-primary rounded-full" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t">
          <span className="text-sm text-muted-foreground">
            {filteredNotifications.length} notifications
          </span>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              Mark All Read
            </Button>
            <Button variant="outline" size="sm">
              Export
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}