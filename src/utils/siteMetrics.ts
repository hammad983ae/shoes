import { supabase } from '@/lib/supabaseDirectFetch';

/**
 * Ensures the site_metrics table has the required browsing_now key
 * This is a fallback in case the database migrations didn't run properly
 */
export const ensureSiteMetrics = async () => {
  try {
    // Check if browsing_now key exists
    const { data: existingData, error: checkError } = await supabase
      .from('site_metrics')
      .select('value')
      .eq('key', 'browsing_now')
      .single();
    
    if (checkError && checkError.code === 'PGRST116') {
      // Key doesn't exist, create it
      console.log('Creating browsing_now key in site_metrics table...');
      
      const { error: insertError } = await supabase
        .from('site_metrics')
        .insert([{
          key: 'browsing_now',
          value: 37
        }]);
      
      if (insertError) {
        console.error('Failed to create browsing_now key:', insertError);
        return false;
      }
      
      console.log('Successfully created browsing_now key with value 37');
      return true;
    } else if (checkError) {
      console.error('Error checking browsing_now key:', checkError);
      return false;
    } else {
      console.log('browsing_now key already exists with value:', existingData?.value);
      return true;
    }
  } catch (error) {
    console.error('Error ensuring site metrics:', error);
    return false;
  }
};

/**
 * Gets the current browsing count with fallback
 */
export const getBrowsingCount = async (): Promise<number> => {
  try {
    const { data, error } = await supabase
      .from('site_metrics')
      .select('value')
      .eq('key', 'browsing_now')
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Try to create the key
        await ensureSiteMetrics();
        return 37; // Return fallback value
      }
      throw error;
    }
    
    return parseInt(data?.value?.toString() || '37');
  } catch (error) {
    console.error('Error getting browsing count:', error);
    return 37; // Return fallback value
  }
};

/**
 * Seeds the site_metrics table with initial data if it's empty
 */
export const seedSiteMetrics = async () => {
  try {
    console.log('Checking if site_metrics table needs seeding...');
    
    // Check if table has any data
    const { data: allMetrics, error: countError } = await supabase
      .from('site_metrics')
      .select('key')
      .limit(1);
    
    if (countError) {
      console.error('Error checking site_metrics table:', countError);
      return false;
    }
    
    // If table is empty, seed it
    if (!allMetrics || allMetrics.length === 0) {
      console.log('Site_metrics table is empty, seeding with initial data...');
      
      const { error: insertError } = await supabase
        .from('site_metrics')
        .insert([
          { key: 'browsing_now', value: 37 },
          { key: 'total_users', value: 0 },
          { key: 'total_orders', value: 0 }
        ]);
      
      if (insertError) {
        console.error('Failed to seed site_metrics table:', insertError);
        return false;
      }
      
      console.log('Successfully seeded site_metrics table');
      return true;
    } else {
      console.log('Site_metrics table already has data:', allMetrics.length, 'entries');
      
      // Check if browsing_now key exists
      const { data: browsingData, error: browsingError } = await supabase
        .from('site_metrics')
        .select('value')
        .eq('key', 'browsing_now')
        .single();
      
      if (browsingError && browsingError.code === 'PGRST116') {
        console.log('browsing_now key missing, adding it...');
        const { error: insertError } = await supabase
          .from('site_metrics')
          .insert([{ key: 'browsing_now', value: 37 }]);
        
        if (insertError) {
          console.error('Failed to add browsing_now key:', insertError);
          return false;
        }
        
        console.log('Successfully added browsing_now key');
        return true;
      }
      
      return true;
    }
  } catch (error) {
    console.error('Error seeding site metrics:', error);
    return false;
  }
};

/**
 * Force refresh the site metrics data
 */
export const refreshSiteMetrics = async () => {
  try {
    console.log('Force refreshing site metrics...');
    
    // Clear existing data
    const { error: deleteError } = await supabase
      .from('site_metrics')
      .delete()
      .neq('key', 'nonexistent'); // Delete all rows
    
    if (deleteError) {
      console.error('Failed to clear site_metrics table:', deleteError);
      return false;
    }
    
    // Re-seed with fresh data
    return await seedSiteMetrics();
  } catch (error) {
    console.error('Error refreshing site metrics:', error);
    return false;
  }
};
