import React, { useState, useEffect, useContext, createContext } from 'react';

// Mock user interface to match Supabase User type structure
interface MockUser {
  id: string;
  email: string;
  created_at: string;
  updated_at: string;
  aud: string;
  role: string;
}

interface AuthContextType {
  user: MockUser | null;
  session: any;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user for development
const mockUser: MockUser = {
  id: 'dev-user-123',
  email: 'dev@healthhuddle.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  aud: 'authenticated',
  role: 'authenticated'
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(mockUser);
  const [loading, setLoading] = useState(false);

  const signUp = async (email: string, password: string) => {
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    return { error: null };
  };

  const signOut = async () => {
    // Mock sign out - in development we'll keep the user logged in
  };

  return (
    <AuthContext.Provider value={{
      user,
      session: { user },
      loading,
      signUp,
      signIn,
      signOut,
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
