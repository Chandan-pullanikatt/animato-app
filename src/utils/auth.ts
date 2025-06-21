import { supabase } from '../config/supabase';

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthError {
  message: string;
}

// Now using custom Supabase authentication that works in React Native!
console.log('✅ Using custom Supabase authentication - data will be saved to your Supabase project');

export const authService = {
  // Sign up a new user
  signUp: async (email: string, password: string) => {
    try {
      const result = await supabase.auth.signUp({
        email,
        password,
      });
      
      console.log('✅ User signed up successfully:', email);
      return result;
    } catch (error: any) {
      console.log('❌ Sign up error:', error.message);
      return { user: null, error };
    }
  },

  // Sign in an existing user
  signIn: async (email: string, password: string) => {
    try {
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      console.log('✅ User signed in successfully:', email);
      return result;
    } catch (error: any) {
      console.log('❌ Sign in error:', error.message);
      return { user: null, error };
    }
  },

  // Sign out the current user
  signOut: async () => {
    try {
      const result = await supabase.auth.signOut();
      console.log('✅ User signed out successfully');
      return result;
    } catch (error: any) {
      console.log('❌ Sign out error:', error.message);
      return { error };
    }
  },

  // Get the current user
  getCurrentUser: async () => {
    try {
      const result = await supabase.auth.getUser();
      return result;
    } catch (error: any) {
      console.log('❌ Get user error:', error.message);
      return { user: null, error };
    }
  },

  // Listen to auth state changes
  onAuthStateChange: (callback: (user: any) => void) => {
    try {
      return supabase.auth.onAuthStateChange(callback);
    } catch (error: any) {
      console.log('❌ Auth state change error:', error.message);
      return { 
        data: { 
          subscription: { 
            unsubscribe: () => console.log('🔄 Auth state change listener removed') 
          } 
        } 
      };
    }
  }
}; 