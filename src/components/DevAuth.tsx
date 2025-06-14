
import React, { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

const DevAuth = ({ children }: { children: React.ReactNode }) => {
  const { setUser } = useAuth();

  useEffect(() => {
    // Set a mock user with proper UUID format for development
    setUser({
      id: '00000000-0000-0000-0000-000000000123', // Proper UUID format
      email: 'dev@example.com',
    });
  }, [setUser]);

  return <>{children}</>;
};

export default DevAuth;
