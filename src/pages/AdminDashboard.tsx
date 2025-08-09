import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
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
  type: string;
  created_at: string;
  user_id: string | null;
}

const AdminDashboard = () => {
  const { user, userRole } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredUsers, setFilteredUsers] = useState<UserRow[]>([]);

  useEffect(() => {
    if (!user || userRole !== 'admin') {
      navigate('/');
      return;
    }
    loadData();
    
    // Set up real-time subscriptions
    const usersChannel = supabase
      .channel('admin-users')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, loadData)
      .subscribe();

    const messagesChannel = supabase
      .channel('admin-messages')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages' }, loadData)
      .subscribe();

    return () => {
      supabase.removeChannel(usersChannel);
      supabase.removeChannel(messagesChannel);
    };
  }, [user, userRole, navigate]);

  useEffect(() => {
    // Filter users based on search term
    const filtered = users.filter(user => 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.display_name && user.display_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredUsers(filtered);
  }, [users, searchTerm]);

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

  const toggleCreatorStatus = async (userId: string, currentStatus: boolean) => {
    try {
      if (currentStatus) {
        const { error } = await supabase.rpc('demote_from_creator', { target_user_id: userId });
        if (error) throw error;
        toast({ title: 'Success', description: 'Creator status revoked' });
      } else {
        const { error } = await supabase.rpc('promote_to_creator', { target_user_id: userId });
        if (error) throw error;
        toast({ title: 'Success', description: 'User promoted to creator' });
      }
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
              <div className="mt-4">
                <Input
                  placeholder="Search users by email or display name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="max-w-md"
                />
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Email</TableHead>
                    <TableHead>Display Name</TableHead>
                    <TableHead>Creator</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.display_name || 'N/A'}</TableCell>
                      <TableCell>
                        {user.role !== 'admin' ? (
                          <Checkbox
                            checked={user.is_creator}
                            onCheckedChange={() => toggleCreatorStatus(user.id, user.is_creator)}
                          />
                        ) : (
                          <Badge variant="destructive">Admin</Badge>
                        )}
                      </TableCell>
                      <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
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
                    <TableHead>Type</TableHead>
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
                        <Badge variant={msg.type === 'request' ? 'default' : 'secondary'}>
                          {msg.type || 'contacting'}
                        </Badge>
                      </TableCell>
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