import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, FileText, Fingerprint, Eye } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showBiometric, setShowBiometric] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const result = await login(username, password);
    if (result.success) {
      setShowBiometric(true);
      // Simulate biometric verification
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } else {
      setError(result.error);
    }
  };

  const BiometricModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <Card className="w-96">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center space-x-2">
            <Fingerprint className="h-6 w-6 text-[#5d87ff]" />
            <span>Biometric Verification</span>
          </CardTitle>
          <CardDescription>Please verify your identity</CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="flex justify-center space-x-4">
            <div className="bg-[#5d87ff] bg-opacity-10 p-4 rounded-full animate-pulse">
              <Fingerprint className="h-8 w-8 text-[#5d87ff]" />
            </div>
            <div className="bg-[#5d87ff] bg-opacity-10 p-4 rounded-full animate-pulse">
              <Eye className="h-8 w-8 text-[#5d87ff]" />
            </div>
          </div>
          <p className="text-sm text-gray-600">Verifying biometric data...</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div className="bg-[#5d87ff] h-2 rounded-full animate-pulse" style={{width: '70%'}}></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      {showBiometric && <BiometricModal />}
      
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="bg-[#5d87ff] p-3 rounded-full">
              <FileText className="h-8 w-8 text-white" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold">Smart Filing System</CardTitle>
          <CardDescription>Digital & IoT-Driven Archive Management</CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert className="border-red-200 bg-red-50">
                <AlertDescription className="text-red-800">{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-[#5d87ff] hover:bg-[#4c75e8] text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</p>
            <div className="text-xs text-gray-600 space-y-1">
              <div>Archivist: <span className="font-mono">archivist1 / password</span></div>
              <div>Admin: <span className="font-mono">admin1 / admin123</span></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;