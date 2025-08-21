import { supabase } from '@/lib/supabaseDirectFetch';

/**
 * Checks if a table exists in the database
 */
export const checkTableExists = async (tableName: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
    
    return !error || error.code !== 'PGRST205';
  } catch (error) {
    return false;
  }
};

/**
 * Checks if a column exists in a table
 */
export const checkColumnExists = async (tableName: string, columnName: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from(tableName)
      .select(columnName)
      .limit(1);
    
    return !error || error.code !== '42703';
  } catch (error) {
    return false;
  }
};

/**
 * Creates a basic table structure for missing tables
 * Note: This is a fallback - proper migrations should be used in production
 */
export const createMissingTables = async () => {
  const results: { [key: string]: boolean } = {};
  
  try {
    // Check and create notifications table
    if (!(await checkTableExists('notifications'))) {
      console.log('Creating notifications table...');
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.notifications (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            title TEXT NOT NULL,
            message TEXT NOT NULL,
            type TEXT DEFAULT 'info',
            is_read BOOLEAN DEFAULT false,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
          
          ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Users can view their own notifications"
          ON public.notifications FOR SELECT
          USING (auth.uid() = user_id);
          
          CREATE POLICY "Users can update their own notifications"
          ON public.notifications FOR UPDATE
          USING (auth.uid() = user_id);
        `
      });
      
      results.notifications = !error;
      if (error) {
        console.error('Failed to create notifications table:', error);
      } else {
        console.log('✅ Notifications table created successfully');
      }
    } else {
      results.notifications = true;
    }
    
    // Check and create posts table
    if (!(await checkTableExists('posts'))) {
      console.log('Creating posts table...');
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.posts (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            title TEXT,
            content TEXT,
            media_urls TEXT[],
            like_count INTEGER DEFAULT 0,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
          
          ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Anyone can view posts"
          ON public.posts FOR SELECT
          USING (true);
          
          CREATE POLICY "Users can create their own posts"
          ON public.posts FOR INSERT
          WITH CHECK (auth.uid() = user_id);
          
          CREATE POLICY "Users can update their own posts"
          ON public.posts FOR UPDATE
          USING (auth.uid() = user_id);
          
          CREATE POLICY "Users can delete their own posts"
          ON public.posts FOR DELETE
          USING (auth.uid() = user_id);
        `
      });
      
      results.posts = !error;
      if (error) {
        console.error('Failed to create posts table:', error);
      } else {
        console.log('✅ Posts table created successfully');
      }
    } else {
      results.posts = true;
    }
    
    // Check and create purchase_history table
    if (!(await checkTableExists('purchase_history'))) {
      console.log('Creating purchase_history table...');
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.purchase_history (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            product_id TEXT NOT NULL,
            product_name TEXT NOT NULL,
            purchase_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
            amount DECIMAL(10,2),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
          );
          
          ALTER TABLE public.purchase_history ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Users can view their own purchase history"
          ON public.purchase_history FOR SELECT
          USING (auth.uid() = user_id);
          
          CREATE POLICY "Users can insert their own purchase history"
          ON public.purchase_history FOR INSERT
          WITH CHECK (auth.uid() = user_id);
        `
      });
      
      results.purchase_history = !error;
      if (error) {
        console.error('Failed to create purchase_history table:', error);
      } else {
        console.log('✅ Purchase history table created successfully');
      }
    } else {
      results.purchase_history = true;
    }
    
    // Check and create post_likes table
    if (!(await checkTableExists('post_likes'))) {
      console.log('Creating post_likes table...');
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS public.post_likes (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
            post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            UNIQUE(user_id, post_id)
          );
          
          ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
          
          CREATE POLICY "Anyone can view post likes"
          ON public.post_likes FOR SELECT
          USING (true);
          
          CREATE POLICY "Users can manage their own likes"
          ON public.post_likes FOR ALL
          USING (auth.uid() = user_id);
        `
      });
      
      results.post_likes = !error;
      if (error) {
        console.error('Failed to create post_likes table:', error);
      } else {
        console.log('✅ Post likes table created successfully');
      }
    } else {
      results.post_likes = true;
    }
    
  } catch (error) {
    console.error('Error creating missing tables:', error);
  }
  
  return results;
};

/**
 * Adds missing columns to existing tables
 */
export const addMissingColumns = async () => {
  const results: { [key: string]: boolean } = {};
  
  try {
    // Check and add coupon_code column to profiles table
    if (!(await checkColumnExists('profiles', 'coupon_code'))) {
      console.log('Adding coupon_code column to profiles table...');
      const { error } = await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE public.profiles 
          ADD COLUMN IF NOT EXISTS coupon_code TEXT;
        `
      });
      
      results.coupon_code = !error;
      if (error) {
        console.error('Failed to add coupon_code column:', error);
      } else {
        console.log('✅ coupon_code column added successfully');
      }
    } else {
      results.coupon_code = true;
    }
    
  } catch (error) {
    console.error('Error adding missing columns:', error);
  }
  
  return results;
};

/**
 * Comprehensive database setup function
 */
export const setupDatabase = async () => {
  console.log('🚀 Starting database setup...');
  
  try {
    // Create missing tables
    const tableResults = await createMissingTables();
    console.log('📊 Table creation results:', tableResults);
    
    // Add missing columns
    const columnResults = await addMissingColumns();
    console.log('📊 Column addition results:', columnResults);
    
    // Check overall status
    const allTablesCreated = Object.values(tableResults).every(result => result);
    const allColumnsAdded = Object.values(columnResults).every(result => result);
    
    if (allTablesCreated && allColumnsAdded) {
      console.log('✅ Database setup completed successfully!');
      return true;
    } else {
      console.log('⚠️ Database setup completed with some issues');
      return false;
    }
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    return false;
  }
};
