import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/lib/firebase';
import { onAuthChange, isAdmin } from '@/lib/firebase';
import { toast } from '@/components/ui/sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  setUser: (user: User | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isUserAdmin, setIsUserAdmin] = useState<boolean>(false);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthChange((authUser) => {
      setUser(authUser);
      const adminStatus = isAdmin(authUser);
      console.log('Auth state changed:', { authUser, adminStatus });
      setIsUserAdmin(adminStatus);
      setLoading(false);

      if (authUser) {
        toast.success(`Welcome, ${authUser.email}${adminStatus ? ' (Admin)' : ''}`);
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      isAdmin: isUserAdmin,
      setUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
