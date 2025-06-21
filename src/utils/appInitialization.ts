/**
 * App Initialization Service
 * Handles initialization of all services when the app starts
 */

import { initializeVideoProviders, getAvailableProviders } from './cloudVideoService';

/**
 * Initialize all app services
 */
export const initializeApp = async (): Promise<void> => {
  try {
    console.log('🚀 Initializing Animato app services...');
    
    // Initialize video providers
    console.log('📹 Initializing video providers...');
    await initializeVideoProviders();
    
    const availableProviders = getAvailableProviders();
    console.log(`✅ Video providers initialized: ${availableProviders.length} available`);
    
    if (availableProviders.length > 0) {
      console.log('Available providers:', availableProviders.map(p => p.name).join(', '));
    } else {
      console.log('⚠️ No cloud video providers available - using mock generation');
    }
    
    // Add other service initializations here as needed
    // await initializeOtherServices();
    
    console.log('✅ App initialization complete!');
    
  } catch (error) {
    console.error('❌ App initialization failed:', error);
    // Don't throw - app should still work with fallbacks
  }
};

/**
 * Get initialization status
 */
export const getInitializationStatus = (): {
  videoProvidersAvailable: boolean;
  availableProviders: string[];
} => {
  try {
    const availableProviders = getAvailableProviders();
    return {
      videoProvidersAvailable: availableProviders.length > 0,
      availableProviders: availableProviders.map(p => p.name),
    };
  } catch (error) {
    console.error('Error getting initialization status:', error);
    return {
      videoProvidersAvailable: false,
      availableProviders: [],
    };
  }
}; 