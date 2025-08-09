import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

interface UserRow {
  id: string;
  email: string;
  display_name: string | null;
  role: 'user' | 'creator' | 'admin';
  is_creator: boolean;
  created_at: string;
}

interface MessageRow {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string;
  created_at: string;
  user_id: string | null;
}

const AdminDashboard = () => {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);

  useEffect(() => {
    if (!user || userRole !== 'admin') {
      navigate('/');
      return;
    }
    loadData();
  }, [user, userRole, navigate]);

  const loadData = async () => {
    try {
      // Fetch users via edge function
      const { data: userData } = await supabase.functions.invoke('admin-users');
      setUsers(userData?.users || []);

      // Fetch messages
      const { data: messagesData } = await supabase
        .from('messages')
        .select('*')
        .order('created_at', { ascending: false });
      setMessages(messagesData || []);
    } catch (error) {
      console.error('Failed to load admin data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load admin data',
        variant: 'destructive',
      });
    }
  };

  const promoteToCreator = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('promote_to_creator', { target_user_id: userId });
      if (error) throw error;
      toast({ title: 'Success', description: 'User promoted to creator' });
      loadData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const demoteFromCreator = async (userId: string) => {
    try {
      const { error } = await supabase.rpc('demote_from_creator', { target_user_id: userId });
      if (error) throw error;
      toast({ title: 'Success', description: 'Creator status revoked' });
      loadData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const setUserRole = async (userId: string, newRole: 'user' | 'creator') => {
    try {
      const { error } = await supabase.rpc('set_user_role', { target_user_id: userId, new_role: newRole });
      if (error) throw error;
      toast({ title: 'Success', description: `Role changed to ${newRole}` });
      loadData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  const markMessageReviewed = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ status: 'reviewed' })
        .eq('id', messageId);
      if (error) throw error;
      toast({ title: 'Success', description: 'Message marked as reviewed' });
      loadData();
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  if (userRole !== 'admin') {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Access Denied</h1>
        <p>You don't have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Users Management</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Display Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.display_name || 'N/A'}</TableCell>
                      <TableCell>
                        <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'creator' ? 'default' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.is_creator ? 'default' : 'secondary'}>
                          {user.is_creator ? 'Yes' : 'No'}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {!user.is_creator && user.role !== 'admin' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => promoteToCreator(user.id)}
                            >
                              Promote to Creator
                            </Button>
                          )}
                          {user.is_creator && user.role !== 'admin' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => demoteFromCreator(user.id)}
                            >
                              Revoke Creator
                            </Button>
                          )}
                          {user.role === 'user' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setUserRole(user.id, 'creator')}
                            >
                              Set Creator Role
                            </Button>
                          )}
                          {user.role === 'creator' && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setUserRole(user.id, 'user')}
                            >
                              Set User Role
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages">
          <Card>
            <CardHeader>
              <CardTitle>Contact Messages</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {messages.map((msg) => (
                    <TableRow key={msg.id}>
                      <TableCell>{msg.name}</TableCell>
                      <TableCell>{msg.email}</TableCell>
                      <TableCell className="max-w-xs truncate">{msg.message}</TableCell>
                      <TableCell>
                        <Badge variant={msg.status === 'reviewed' ? 'default' : 'secondary'}>
                          {msg.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(msg.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {msg.status !== 'reviewed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => markMessageReviewed(msg.id)}
                          >
                            Mark Reviewed
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;