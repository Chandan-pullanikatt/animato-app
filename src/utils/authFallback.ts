// Fallback authentication system for development/testing
// This can be used if Supabase has bundling issues

export interface AuthUser {
  id: string;
  email: string;
}

export interface AuthError {
  message: string;
}

// Simple in-memory storage for development
let currentUser: AuthUser | null = null;
const users: { [email: string]: { password: string; id: string } } = {};

export const authFallbackService = {
  // Sign up a new user (mock implementation)
  signUp: async (email: string, password: string) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (users[email]) {
        return { user: null, error: { message: 'User already exists' } };
      }
      
      const user: AuthUser = {
        id: Math.random().toString(36).substring(2, 15),
        email
      };
      
      users[email] = { password, id: user.id };
      
      console.log('Mock sign up successful:', email);
      return { user, error: null };
    } catch (error: any) {
      return { user: null, error: { message: error.message } };
    }
  },

  // Sign in an existing user (mock implementation)
  signIn: async (email: string, password: string) => {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const userData = users[email];
      if (!userData || userData.password !== password) {
        return { user: null, error: { message: 'Invalid email or password' } };
      }
      
      const user: AuthUser = {
        id: userData.id,
        email
      };
      
      currentUser = user;
      console.log('Mock sign in successful:', email);
      return { user, error: null };
    } catch (error: any) {
      return { user: null, error: { message: error.message } };
    }
  },

  // Sign out the current user
  signOut: async () => {
    try {
      currentUser = null;
      console.log('Mock sign out successful');
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  },

  // Get the current user
  getCurrentUser: async () => {
    try {
      return { user: currentUser, error: null };
    } catch (error: any) {
      return { user: null, error: { message: error.message } };
    }
  },

  // Mock auth state change listener
  onAuthStateChange: (callback: (user: any) => void) => {
    // For development, just call immediately with current user
    callback(currentUser);
    
    // Return a mock unsubscribe function
    return {
      data: { subscription: { unsubscribe: () => {} } }
    };
  }
}; 