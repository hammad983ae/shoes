// Data persistence utility to prevent data loss when switching tabs or navigating away
// This ensures critical app state is preserved locally and can be restored

export interface PersistedData {
  timestamp: number;
  version: string;
  data: Record<string, any>;
}

const PERSISTENCE_VERSION = '1.0.0';
const PERSISTENCE_KEY = 'shoe-scape-persisted-data';
const MAX_AGE_HOURS = 24; // Data expires after 24 hours

export class DataPersistence {
  private static instance: DataPersistence;
  private listeners: Set<(data: any) => void> = new Set();

  static getInstance(): DataPersistence {
    if (!DataPersistence.instance) {
      DataPersistence.instance = new DataPersistence();
    }
    return DataPersistence.instance;
  }

  // Save data with automatic cleanup
  save(key: string, data: any): void {
    try {
      const existing = this.loadAll();
      const now = Date.now();
      
      existing.data[key] = {
        value: data,
        timestamp: now
      };
      existing.timestamp = now;
      
      localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(existing));
      
      // Notify listeners
      this.listeners.forEach(listener => listener(existing.data));
    } catch (error) {
      console.warn('Failed to save data to persistence:', error);
    }
  }

  // Load specific data
  load<T>(key: string, defaultValue?: T): T | null {
    try {
      const all = this.loadAll();
      const item = all.data[key];
      
      if (!item) return defaultValue || null;
      
      // Check if data is expired
      const age = Date.now() - item.timestamp;
      const maxAge = MAX_AGE_HOURS * 60 * 60 * 1000;
      
      if (age > maxAge) {
        this.remove(key);
        return defaultValue || null;
      }
      
      return item.value as T;
    } catch (error) {
      console.warn('Failed to load data from persistence:', error);
      return defaultValue || null;
    }
  }

  // Load all persisted data
  loadAll(): PersistedData {
    try {
      const stored = localStorage.getItem(PERSISTENCE_KEY);
      if (!stored) {
        return {
          timestamp: Date.now(),
          version: PERSISTENCE_VERSION,
          data: {}
        };
      }
      
      const parsed = JSON.parse(stored);
      
      // Handle version migration if needed
      if (parsed.version !== PERSISTENCE_VERSION) {
        return this.migrateData(parsed);
      }
      
      return parsed;
    } catch (error) {
      console.warn('Failed to load persisted data:', error);
      return {
        timestamp: Date.now(),
        version: PERSISTENCE_VERSION,
        data: {}
      };
    }
  }

  // Remove specific data
  remove(key: string): void {
    try {
      const existing = this.loadAll();
      delete existing.data[key];
      existing.timestamp = Date.now();
      
      localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(existing));
      
      // Notify listeners
      this.listeners.forEach(listener => listener(existing.data));
    } catch (error) {
      console.warn('Failed to remove data from persistence:', error);
    }
  }

  // Clear all persisted data
  clear(): void {
    try {
      localStorage.removeItem(PERSISTENCE_KEY);
      this.listeners.forEach(listener => listener({}));
    } catch (error) {
      console.warn('Failed to clear persisted data:', error);
    }
  }

  // Subscribe to data changes
  subscribe(listener: (data: any) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Migrate data between versions
  private migrateData(oldData: any): PersistedData {
    // For now, just return fresh data
    // In the future, this could handle migration logic
    console.log('Migrating persisted data from version:', oldData.version);
    return {
      timestamp: Date.now(),
      version: PERSISTENCE_VERSION,
      data: {}
    };
  }

  // Clean up expired data
  cleanup(): void {
    try {
      const all = this.loadAll();
      const now = Date.now();
      const maxAge = MAX_AGE_HOURS * 60 * 60 * 1000;
      let hasChanges = false;
      
      Object.keys(all.data).forEach(key => {
        const item = all.data[key];
        if (now - item.timestamp > maxAge) {
          delete all.data[key];
          hasChanges = true;
        }
      });
      
      if (hasChanges) {
        all.timestamp = now;
        localStorage.setItem(PERSISTENCE_KEY, JSON.stringify(all));
        this.listeners.forEach(listener => listener(all.data));
      }
    } catch (error) {
      console.warn('Failed to cleanup expired data:', error);
    }
  }
}

// Convenience functions
export const saveData = (key: string, data: any) => DataPersistence.getInstance().save(key, data);
export const loadData = <T>(key: string, defaultValue?: T) => DataPersistence.getInstance().load<T>(key, defaultValue);
export const removeData = (key: string) => DataPersistence.getInstance().remove(key);
export const clearAllData = () => DataPersistence.getInstance().clear();

// Auto-cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    DataPersistence.getInstance().cleanup();
  });
  
  // Also cleanup periodically
  setInterval(() => {
    DataPersistence.getInstance().cleanup();
  }, 60 * 60 * 1000); // Every hour
}
