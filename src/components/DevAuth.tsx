
import React from 'react';

// Mock user for development without authentication
const mockUser = {
  id: 'dev-user-123',
  email: 'dev@healthhuddle.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  aud: 'authenticated',
  role: 'authenticated'
};

const DevAuth = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export default DevAuth;
