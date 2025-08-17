import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Campaign {
  id: string;
  type: 'meta_ads' | 'tiktok_ads' | 'email' | 'discount';
  platform?: string;
  name: string;
  spend: number;
  revenue: number;
  roas: number;
  clicks: number;
  conversions: number;
  status: 'active' | 'paused' | 'completed';
  created_at: string;
  updated_at: string;
}

interface CampaignSummary {
  totalROAS: number;
  totalSpend: number;
  totalImpressions: number;
  totalConversionRate: number;
}

export const useCampaigns = () => {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [summary, setSummary] = useState<CampaignSummary>({
    totalROAS: 0,
    totalSpend: 0,
    totalImpressions: 0,
    totalConversionRate: 0
  });

  const fetchCampaigns = async () => {
    try {
      setLoading(true);

      const { data: campaignsData, error } = await supabase
        .from('campaigns')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setCampaigns((campaignsData || []).map(campaign => ({
        ...campaign,
        type: campaign.type as 'meta_ads' | 'tiktok_ads' | 'email' | 'discount',
        platform: campaign.platform || '',
        spend: campaign.spend || 0,
        revenue: campaign.revenue || 0,
        roas: campaign.roas || 0,
        clicks: campaign.clicks || 0,
        conversions: campaign.conversions || 0,
        status: campaign.status as 'active' | 'paused' | 'completed' || 'active',
        created_at: campaign.created_at || '',
        updated_at: campaign.updated_at || ''
      })));

      // Calculate summary
      const totalSpend = (campaignsData || []).reduce((sum, campaign) => sum + Number(campaign.spend), 0);
      const totalRevenue = (campaignsData || []).reduce((sum, campaign) => sum + Number(campaign.revenue), 0);
      const totalROAS = totalSpend > 0 ? totalRevenue / totalSpend : 0;
      const totalClicks = (campaignsData || []).reduce((sum, campaign) => sum + Number(campaign.clicks), 0);
      const totalConversions = (campaignsData || []).reduce((sum, campaign) => sum + Number(campaign.conversions), 0);
      const totalConversionRate = totalClicks > 0 ? (totalConversions / totalClicks) * 100 : 0;

      setSummary({
        totalROAS,
        totalSpend,
        totalImpressions: totalClicks * 10, // Simplified assumption
        totalConversionRate
      });

    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async (campaignData: Omit<Campaign, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data, error } = await supabase
        .from('campaigns')
        .insert([campaignData])
        .select()
        .single();

      if (error) throw error;

      await fetchCampaigns(); // Refresh the list
      return { success: true, data };
    } catch (error) {
      console.error('Error creating campaign:', error);
      return { success: false, error };
    }
  };

  const updateCampaign = async (id: string, updates: Partial<Campaign>) => {
    try {
      const { error } = await supabase
        .from('campaigns')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      await fetchCampaigns(); // Refresh the list
      return { success: true };
    } catch (error) {
      console.error('Error updating campaign:', error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return {
    loading,
    campaigns,
    summary,
    createCampaign,
    updateCampaign,
    refetch: fetchCampaigns
  };
};