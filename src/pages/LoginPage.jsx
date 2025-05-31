import React, { useState, useEffect } from 'react';
    import { useNavigate, Link } from 'react-router-dom';
    import { useAuth } from '@/contexts/AuthContext';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import { LogIn, Mail, Lock, AlertTriangle, Eye, EyeOff } from 'lucide-react';

    const LoginPage = () => {
      const [email, setEmail] = useState('');
      const [password, setPassword] = useState('');
      const [showPassword, setShowPassword] = useState(false);
      const [error, setError] = useState('');
      
      const { login, isAuthenticated, isAdmin, loading: authIsLoadingPageLevel, authLoading: authContextLoading } = useAuth();
      const navigate = useNavigate();
      const { toast } = useToast();

      // Use a local loading state for the submit button to avoid confusion with context's loading states
      const [isSubmitting, setIsSubmitting] = useState(false);

      useEffect(() => {
        // This effect handles redirection after login state changes.
        // It depends on isAuthenticated and isAdmin from the context.
        // authIsLoadingPageLevel is the initial loading state of the context.
        if (!authIsLoadingPageLevel) { // Ensure context has loaded initial auth state
          if (isAuthenticated) {
            if (isAdmin) {
              navigate('/admin-dashboard', { replace: true });
            } else {
              navigate('/dashboard', { replace: true });
            }
          }
        }
      }, [isAuthenticated, isAdmin, authIsLoadingPageLevel, navigate]);

      const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
          const loginResult = await login(email, password);
          if (loginResult.success) {
            // Toast for success is already handled in login function
            // Navigation is handled by the useEffect above.
            // If loginResult.profile.is_admin is available, we can navigate immediately
            // Otherwise, rely on useEffect once context updates.
            if (loginResult.profile?.is_admin) {
                navigate('/admin-dashboard', { replace: true });
            } else if (loginResult.user) { // Check if user exists to avoid navigating if loginResult.profile is null
                navigate('/dashboard', { replace: true });
            }
          } else {
            setError(loginResult.error || "Login gagal. Periksa kembali email dan password Anda.");
            // Toast for error is also handled in login function
          }
        } catch (err) {
          // This catch block might be redundant if login function handles all errors
          setError(err.message || "Terjadi kesalahan. Silakan coba lagi.");
          toast({
            title: "Login Error",
            description: err.message || "Terjadi kesalahan tak terduga.",
            variant: "destructive",
          });
        } finally {
          setIsSubmitting(false);
        }
      };

      // Disable button if local submission is in progress OR if the auth context is busy with an auth operation
      const isButtonDisabled = isSubmitting || authContextLoading;

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-gradient-to-br from-slate-900 via-slate-800 to-orange-900/30 py-12"
        >
          <Card className="w-full max-w-md bg-slate-800/70 backdrop-blur-lg border-slate-700 shadow-2xl text-slate-100">
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 260, damping: 20 }}
                className="inline-block p-3 bg-primary/20 rounded-full mb-4 mx-auto"
              >
                <LogIn className="h-10 w-10 text-primary" />
              </motion.div>
              <CardTitle className="text-3xl font-bold gradient-text">Selamat Datang Kembali!</CardTitle>
              <CardDescription className="text-slate-400">
                Masuk untuk melanjutkan ke Juma Makassar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300 flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-primary" /> Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="contoh@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input-modern"
                    disabled={isButtonDisabled}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300 flex items-center">
                    <Lock className="h-4 w-4 mr-2 text-primary" /> Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="input-modern pr-10"
                      disabled={isButtonDisabled}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-primary"
                      aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                      disabled={isButtonDisabled}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/20 border border-red-500 text-red-300 px-4 py-3 rounded-md text-sm flex items-start"
                  >
                    <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0" />
                    <p>{error}</p>
                  </motion.div>
                )}
                <Button type="submit" className="w-full friendly-button text-lg py-3" disabled={isButtonDisabled}>
                  {isButtonDisabled ? 'Memproses...' : 'Masuk Sekarang'}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col items-center space-y-3">
              <Link to="/lupa-password" className="text-sm text-primary hover:underline">
                Lupa Password?
              </Link>
              <p className="text-sm text-slate-400">
                Belum punya akun?{' '}
                <Link to="/register" className="font-semibold text-primary hover:underline">
                  Daftar di sini
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      );
    };

    export default LoginPage;