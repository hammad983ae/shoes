import { supabase } from '@/lib/supabaseDirectFetch';

export const fixAdminRole = async (userId: string) => {
  try {
    console.log('🔧 Fixing admin role for user:', userId);
    
    // First, check if profile exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .execute();
    
    if (checkError) {
      console.error('❌ Error checking profile:', checkError);
      return { error: checkError };
    }
    
    if (existingProfile && existingProfile.length > 0) {
      console.log('📋 Profile exists, updating role to admin...');
      
      // Update existing profile to admin
      const { data: updateData, error: updateError } = await supabase
        .from('profiles')
        .update({ 
          role: 'admin',
          is_creator: true,
          display_name: existingProfile[0].display_name || 'Admin User'
        })
        .eq('user_id', userId)
        .execute();
      
      if (updateError) {
        console.error('❌ Error updating profile:', updateError);
        return { error: updateError };
      }
      
      console.log('✅ Profile updated to admin:', updateData);
      return { data: updateData };
    } else {
      console.log('📋 No profile found, creating new admin profile...');
      
      // Create new profile with admin role
      const { data: createData, error: createError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          role: 'admin',
          is_creator: true,
          display_name: 'Admin User',
          credits_cents: 10000,
          credits: 100
        })
        .execute();
      
      if (createError) {
        console.error('❌ Error creating profile:', createError);
        return { error: createError };
      }
      
      console.log('✅ New admin profile created:', createData);
      return { data: createData };
    }
  } catch (error) {
    console.error('❌ Unexpected error in fixAdminRole:', error);
    return { error };
  }
};

// Auto-fix function that can be called from console
export const autoFixAdminRole = async () => {
  try {
    // Get current user from localStorage or auth
    const authData = localStorage.getItem('shoe-scape-auth');
    if (!authData) {
      console.error('❌ No auth data found');
      return;
    }
    
    const { user } = JSON.parse(authData);
    if (!user?.id) {
      console.error('❌ No user ID found');
      return;
    }
    
    console.log('🔧 Auto-fixing admin role for current user...');
    const result = await fixAdminRole(user.id);
    
    if (result.error) {
      console.error('❌ Failed to fix admin role:', result.error);
    } else {
      console.log('✅ Admin role fixed successfully!');
      console.log('🔄 Please refresh the page to see the admin dashboard');
    }
  } catch (error) {
    console.error('❌ Error in autoFixAdminRole:', error);
  }
};

// Make it available globally for console access
if (typeof window !== 'undefined') {
  (window as any).fixAdminRole = autoFixAdminRole;
  (window as any).fixAdminRoleForUser = fixAdminRole;
  
  console.log('🔧 Admin Role Fix Commands Available:');
  console.log('  - fixAdminRole() - Fix admin role for current user');
  console.log('  - fixAdminRoleForUser(userId) - Fix admin role for specific user');
  console.log('  - Or use the "🔧 Fix Admin Role" button on the home page');
}
