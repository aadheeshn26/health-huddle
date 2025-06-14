
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const DevAuth = ({ children }: { children: React.ReactNode }) => {
  const { user, loading, signUp, signIn } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const setupDevUser = async () => {
      if (!user && !loading) {
        const testEmail = 'dev@healthhuddle.com';
        const testPassword = 'devpassword123';

        console.log('Setting up development user...');
        
        // Try to sign in first
        const { error: signInError } = await signIn(testEmail, testPassword);
        
        if (signInError) {
          console.log('Sign in failed, trying to create account:', signInError.message);
          // If sign in fails, try to create the account
          const { error: signUpError } = await signUp(testEmail, testPassword);
          
          if (signUpError) {
            console.error('Failed to create dev account:', signUpError.message);
            toast({
              title: "Development Setup",
              description: "Failed to set up development account. You may need to sign up manually.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Development Account Created",
              description: "Logged in with development account for testing.",
            });
          }
        } else {
          console.log('Successfully signed in development user');
          toast({
            title: "Development Mode",
            description: "Logged in with development account for testing.",
          });
        }
      }
    };

    setupDevUser();
  }, [user, loading, signIn, signUp, toast]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Setting up your health companion...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default DevAuth;
