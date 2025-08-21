import { supabase } from '@/lib/supabaseDirectFetch';

interface TableStatus {
  exists: boolean;
  accessible: boolean;
  hasData: boolean;
  error?: string;
}

interface DatabaseHealthReport {
  site_metrics: TableStatus;
  profiles: TableStatus;
  notifications: TableStatus;
  posts: TableStatus;
  purchase_history: TableStatus;
  post_likes: TableStatus;
  overall: 'healthy' | 'degraded' | 'unhealthy';
  issues: string[];
  recommendations: string[];
}

/**
 * Comprehensive database health check utility
 */
export const performDatabaseHealthCheck = async (): Promise<DatabaseHealthReport> => {
  const report: DatabaseHealthReport = {
    site_metrics: { exists: false, accessible: false, hasData: false },
    profiles: { exists: false, accessible: false, hasData: false },
    notifications: { exists: false, accessible: false, hasData: false },
    posts: { exists: false, accessible: false, hasData: false },
    purchase_history: { exists: false, accessible: false, hasData: false },
    post_likes: { exists: false, accessible: false, hasData: false },
    overall: 'unhealthy',
    issues: [],
    recommendations: []
  };

  // Check site_metrics table
  try {
    const { data: metricsData, error: metricsError } = await supabase
      .from('site_metrics')
      .select('key, value')
      .limit(5);
    
    if (metricsError) {
      if (metricsError.code === 'PGRST205') {
        report.site_metrics.error = 'Table does not exist';
        report.issues.push('site_metrics table missing');
      } else {
        report.site_metrics.error = metricsError.message;
        report.issues.push('site_metrics table inaccessible');
      }
    } else {
      report.site_metrics.exists = true;
      report.site_metrics.accessible = true;
      report.site_metrics.hasData = (metricsData?.length || 0) > 0;
      
      if (!report.site_metrics.hasData) {
        report.issues.push('site_metrics table is empty');
      }
    }
  } catch (error) {
    report.site_metrics.error = 'Unexpected error';
    report.issues.push('site_metrics table check failed');
  }

  // Check profiles table
  try {
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('user_id, display_name, role, is_creator, coupon_code')
      .limit(1);
    
    if (profilesError) {
      if (profilesError.code === 'PGRST205') {
        report.profiles.error = 'Table does not exist';
        report.issues.push('profiles table missing');
      } else if (profilesError.code === '42703') {
        report.profiles.exists = true;
        report.profiles.accessible = true;
        report.issues.push('profiles table missing coupon_code column');
      } else {
        report.profiles.error = profilesError.message;
        report.issues.push('profiles table inaccessible');
      }
    } else {
      report.profiles.exists = true;
      report.profiles.accessible = true;
      report.profiles.hasData = (profilesData?.length || 0) > 0;
    }
  } catch (error) {
    report.profiles.error = 'Unexpected error';
    report.issues.push('profiles table check failed');
  }

  // Check notifications table
  try {
    const { data: notificationsData, error: notificationsError } = await supabase
      .from('notifications')
      .select('id')
      .limit(1);
    
    if (notificationsError) {
      if (notificationsError.code === 'PGRST205') {
        report.notifications.error = 'Table does not exist';
        report.issues.push('notifications table missing');
      } else {
        report.notifications.error = notificationsError.message;
        report.issues.push('notifications table inaccessible');
      }
    } else {
      report.notifications.exists = true;
      report.notifications.accessible = true;
      report.notifications.hasData = (notificationsData?.length || 0) > 0;
    }
  } catch (error) {
    report.notifications.error = 'Unexpected error';
    report.issues.push('notifications table check failed');
  }

  // Check posts table
  try {
    const { data: postsData, error: postsError } = await supabase
      .from('posts')
      .select('id')
      .limit(1);
    
    if (postsError) {
      if (postsError.code === 'PGRST205') {
        report.posts.error = 'Table does not exist';
        report.issues.push('posts table missing');
      } else {
        report.posts.error = postsError.message;
        report.issues.push('posts table inaccessible');
      }
    } else {
      report.posts.exists = true;
      report.posts.accessible = true;
      report.posts.hasData = (postsData?.length || 0) > 0;
    }
  } catch (error) {
    report.posts.error = 'Unexpected error';
    report.issues.push('posts table check failed');
  }

  // Check purchase_history table
  try {
    const { data: purchaseData, error: purchaseError } = await supabase
      .from('purchase_history')
      .select('id')
      .limit(1);
    
    if (purchaseError) {
      if (purchaseError.code === 'PGRST205') {
        report.purchase_history.error = 'Table does not exist';
        report.issues.push('purchase_history table missing');
      } else {
        report.purchase_history.error = purchaseError.message;
        report.issues.push('purchase_history table inaccessible');
      }
    } else {
      report.purchase_history.exists = true;
      report.purchase_history.accessible = true;
      report.purchase_history.hasData = (purchaseData?.length || 0) > 0;
    }
  } catch (error) {
    report.purchase_history.error = 'Unexpected error';
    report.issues.push('purchase_history table check failed');
  }

  // Check post_likes table
  try {
    const { data: likesData, error: likesError } = await supabase
      .from('post_likes')
      .select('id')
      .limit(1);
    
    if (likesError) {
      if (likesError.code === 'PGRST205') {
        report.post_likes.error = 'Table does not exist';
        report.post_likes.error = 'Table does not exist';
        report.issues.push('post_likes table missing');
      } else {
        report.post_likes.error = likesError.message;
        report.issues.push('post_likes table inaccessible');
      }
    } else {
      report.post_likes.exists = true;
      report.post_likes.accessible = true;
      report.post_likes.hasData = (likesData?.length || 0) > 0;
    }
  } catch (error) {
    report.post_likes.error = 'Unexpected error';
    report.issues.push('post_likes table check failed');
  }

  // Determine overall health
  const criticalTables = ['profiles', 'site_metrics'];
  const optionalTables = ['notifications', 'posts', 'purchase_history', 'post_likes'];
  
  const criticalHealthy = criticalTables.every(table => 
    report[table as keyof DatabaseHealthReport].exists && 
    report[table as keyof DatabaseHealthReport].accessible
  );
  
  const optionalHealthy = optionalTables.every(table => 
    report[table as keyof DatabaseHealthReport].exists || 
    !report[table as keyof DatabaseHealthReport].exists // Missing optional tables are OK
  );

  if (criticalHealthy && optionalHealthy) {
    report.overall = 'healthy';
  } else if (criticalHealthy) {
    report.overall = 'degraded';
  } else {
    report.overall = 'unhealthy';
  }

  // Generate recommendations
  if (report.issues.length > 0) {
    report.recommendations.push('Run database migrations to create missing tables');
    report.recommendations.push('Check database schema against migration files');
    report.recommendations.push('Verify database connection and permissions');
  }

  if (!report.site_metrics.hasData) {
    report.recommendations.push('Seed site_metrics table with initial data');
  }

  if (report.profiles.exists && report.profiles.accessible && !report.profiles.hasData) {
    report.recommendations.push('Create initial user profiles');
  }

  return report;
};

/**
 * Log the health check report to console
 */
export const logDatabaseHealthReport = (report: DatabaseHealthReport) => {
  console.group('🔍 Database Health Check Report');
  console.log('Overall Status:', report.overall);
  
  if (report.issues.length > 0) {
    console.group('❌ Issues Found:');
    report.issues.forEach(issue => console.log('•', issue));
    console.groupEnd();
  }
  
  if (report.recommendations.length > 0) {
    console.group('💡 Recommendations:');
    report.recommendations.forEach(rec => console.log('•', rec));
    console.groupEnd();
  }
  
  console.group('📊 Table Status:');
  Object.entries(report).forEach(([key, value]) => {
    if (key !== 'overall' && key !== 'issues' && key !== 'recommendations') {
      const status = value.exists ? (value.accessible ? (value.hasData ? '✅' : '⚠️') : '❌') : '❌';
      console.log(`${status} ${key}:`, value);
    }
  });
  console.groupEnd();
  
  console.groupEnd();
};
