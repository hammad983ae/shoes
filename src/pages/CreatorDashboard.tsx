import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';


interface ReferralRow {
  created_at: string;
  credits_earned: number | null;
  referred_user_id: string;
  status: string | null;
}

interface PostRow {
  id: string;
  title: string | null;
  created_at: string;
  engagement_score: number | null;
  like_count: number | null;
  view_count: number | null;
}

const CreatorDashboard = () => {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState<ReferralRow[]>([]);
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const [{ data: r }, { data: p }] = await Promise.all([
        supabase.from('referrals').select('created_at, credits_earned, referred_user_id, status').eq('referrer_user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('posts').select('id, title, created_at, engagement_score, like_count, view_count').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);
      setReferrals(r || []);
      setPosts(p || []);
      setLoading(false);
    };
    load();
  }, [user]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Creator Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Earnings Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Coming soon</p>
            <Button className="mt-4" disabled>Withdraw funds</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Referred Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-2">Recent referrals</p>
            <ul className="space-y-2 max-h-56 overflow-auto">
              {referrals.map((r, idx) => (
                <li key={idx} className="flex justify-between text-sm">
                  <span>{new Date(r.created_at).toLocaleString()}</span>
                  <span>{r.credits_earned ?? 0} credits</span>
                </li>
              ))}
              {!loading && referrals.length === 0 && (
                <li className="text-sm text-muted-foreground">No referrals yet.</li>
              )}
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Manage Payout</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Connect your payout info to enable withdrawals.</p>
            <div className="mt-4 space-x-2">
              <Button variant="outline" disabled>Connect Payout</Button>
              <Button variant="outline">Learn More</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Posts/Products</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-border">
            {posts.map((p) => (
              <li key={p.id} className="py-3 flex items-center justify-between">
                <div>
                  <div className="font-medium">{p.title || 'Untitled'}</div>
                  <div className="text-xs text-muted-foreground">{new Date(p.created_at).toLocaleString()}</div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {p.view_count ?? 0} views • {p.like_count ?? 0} likes • score {p.engagement_score ?? 0}
                </div>
              </li>
            ))}
            {!loading && posts.length === 0 && (
              <li className="py-3 text-sm text-muted-foreground">No posts yet.</li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreatorDashboard;
