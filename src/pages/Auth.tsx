import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { signIn } from '@/lib/firebase';
import LoginForm from '@/components/auth/LoginForm';
import SignupForm from '@/components/auth/SignupForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/sonner';

interface AuthProps {
  adminMode?: boolean;
}

const Auth: React.FC<AuthProps> = ({ adminMode = false }) => {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>('login');
  const { user, loading, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  useEffect(() => {
    if (user && !loading) {
      if (adminMode) {
        // For admin mode, check if user is admin
        if (isAdmin) {
          navigate('/admin');
        } else {
          // If not admin, stay on the page
          toast.error('This account does not have admin privileges');
        }
      } else {
        // For regular mode, redirect to home
        navigate('/');
      }
    }
  }, [user, loading, navigate, adminMode, isAdmin]);

  const handleLoginSuccess = () => {
    if (adminMode) {
      if (isAdmin) {
        navigate('/admin');
      } else {
        toast.error('This account does not have admin privileges');
      }
    } else {
      navigate('/');
    }
  };

  const handleSignupSuccess = () => {
    if (adminMode) {
      toast.info('New accounts do not have admin privileges by default');
      navigate('/');
    } else {
      navigate('/');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-civic-purple"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold text-gray-900">Civic Eye</h1>
          <p className="mt-2 text-sm text-gray-600">
            {adminMode ? 'Admin portal for managing civic issues' : 'Report and track civic issues in your community'}
          </p>
          <div className="mt-4 flex gap-2 justify-center">
            {adminMode ? (
              <Button
                onClick={async () => {
                  try {
                    await signIn('admin@civiceye.com', 'admin123');
                    toast.success('Logged in as admin');
                    navigate('/admin');
                  } catch (error) {
                    toast.error('Failed to log in as admin');
                  }
                }}
                variant="outline"
                size="sm"
              >
                Quick Admin Login
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button
                  onClick={async () => {
                    try {
                      await signIn('user@example.com', 'password123');
                      toast.success('Logged in as user');
                      navigate('/');
                    } catch (error) {
                      toast.error('Failed to log in as user');
                    }
                  }}
                  variant="outline"
                  size="sm"
                >
                  Quick User Login
                </Button>
                <Button
                  onClick={() => navigate('/admin/auth')}
                  variant="outline"
                  size="sm"
                >
                  Go to Admin Login
                </Button>
              </div>
            )}
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'login' | 'signup')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm
              onSuccess={handleLoginSuccess}
              onSignUpClick={() => setActiveTab('signup')}
            />
          </TabsContent>
          <TabsContent value="signup">
            <SignupForm
              onSuccess={handleSignupSuccess}
              onLoginClick={() => setActiveTab('login')}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Auth;
