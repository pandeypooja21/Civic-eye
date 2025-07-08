// Mock Firebase Auth for Hackathon Demo

// Define a User type similar to Firebase's User
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

// Mock user data
const MOCK_USERS: Record<string, { user: User; password: string }> = {
  'user@example.com': {
    user: {
      uid: 'user123',
      email: 'user@example.com',
      displayName: 'Demo User',
      photoURL: null
    },
    password: 'password123'
  },
  'admin@civiceye.com': {
    user: {
      uid: 'admin456',
      email: 'admin@civiceye.com',
      displayName: 'Admin User',
      photoURL: null
    },
    password: 'admin123'
  }
};

// For demo purposes, we'll create a list of admin emails
const ADMIN_EMAILS = ['admin@civiceye.com'];

// Mock auth state
let currentUser: User | null = null;
const authStateListeners: ((user: User | null) => void)[] = [];

// Mock auth object
export const auth = {
  currentUser,
  onAuthStateChanged: (callback: (user: User | null) => void) => {
    authStateListeners.push(callback);
    // Immediately call with current state
    callback(currentUser);
    // Return unsubscribe function
    return () => {
      const index = authStateListeners.indexOf(callback);
      if (index !== -1) authStateListeners.splice(index, 1);
    };
  }
};

// Helper to update auth state
const updateAuthState = (user: User | null) => {
  currentUser = user;
  localStorage.setItem('mockUser', user ? JSON.stringify(user) : '');
  authStateListeners.forEach(callback => callback(user));
};

// Initialize from localStorage if available
try {
  const savedUser = localStorage.getItem('mockUser');
  if (savedUser) {
    currentUser = JSON.parse(savedUser);
  }
} catch (error) {
  console.error('Error loading saved user:', error);
}

// Check if a user is an admin
export const isAdmin = (user: User | null): boolean => {
  if (!user) return false;
  console.log('Checking if user is admin:', user.email, ADMIN_EMAILS.includes(user.email || ''));
  return ADMIN_EMAILS.includes(user.email || '');
};

// Sign in with email and password
export const signIn = async (email: string, password: string) => {
  const userRecord = MOCK_USERS[email];

  if (!userRecord || userRecord.password !== password) {
    throw new Error('Invalid email or password');
  }

  updateAuthState(userRecord.user);

  return { user: userRecord.user };
};

// Sign up with email and password
export const signUp = async (email: string, password: string) => {
  if (MOCK_USERS[email]) {
    throw new Error('Email already in use');
  }

  const newUser: User = {
    uid: `user_${Date.now()}`,
    email,
    displayName: email.split('@')[0],
    photoURL: null
  };

  MOCK_USERS[email] = { user: newUser, password };
  updateAuthState(newUser);

  return { user: newUser };
};

// Sign out
export const signOut = async () => {
  updateAuthState(null);
};

// Get current user
export const getCurrentUser = (): User | null => {
  return currentUser;
};

// Subscribe to auth state changes
export const onAuthChange = (callback: (user: User | null) => void) => {
  return auth.onAuthStateChanged(callback);
};
