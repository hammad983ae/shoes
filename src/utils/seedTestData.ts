// Utility to seed the database with test data for development
import { supabase } from '@/lib/supabaseDirectFetch';

export const seedTestData = async () => {
  if (process.env.NODE_ENV !== 'development') {
    console.log('Seeding only available in development mode');
    return;
  }

  try {
    console.log('🌱 Seeding test data...');

    // Check if we already have data
    const { data: existingProfiles } = await supabase
      .from('profiles')
      .select('user_id')
      .limit(1)
      .execute();

    if (existingProfiles && existingProfiles.length > 0) {
      console.log('✅ Test data already exists, skipping seed');
      return;
    }

    // Create a test profile (this should work with proper user context)
    const testProfile = {
      user_id: 'test-user-123',
      display_name: 'Test User',
      avatar_url: null,
      is_creator: false,
      referrals_count: 5,
      referral_code: 'TEST123',
      credits_cents: 1000,
      role: 'user'
    };

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .insert(testProfile)
      .execute();

    if (profileError) {
      console.error('❌ Error creating test profile:', profileError);
    } else {
      console.log('✅ Test profile created:', profileData);
    }

    // Create test user balance (this should work with proper user context)
    const testBalance = {
      user_id: 'test-user-123',
      lifetime_earned: 1000,
      available: 500
    };

    const { data: balanceData, error: balanceError } = await supabase
      .from('user_balances')
      .insert(testBalance)
      .execute();

    if (balanceError) {
      console.error('❌ Error creating test balance:', balanceError);
    } else {
      console.log('✅ Test balance created:', balanceData);
    }

    // Skip site_metrics seeding due to RLS policies
    console.log('⚠️ Skipping site_metrics seeding due to RLS policies');

    console.log('🎉 Test data seeding completed!');
  } catch (error) {
    console.error('💥 Error seeding test data:', error);
  }
};

// Auto-seed on import in development
if (process.env.NODE_ENV === 'development') {
  // Delay seeding to ensure app is fully loaded
  setTimeout(() => {
    seedTestData();
  }, 2000);
}
