
    import React, { useState, useEffect } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import { UserPlus, User, Mail, Lock, Phone } from 'lucide-react';
    import { Link, useNavigate } from 'react-router-dom';
    import { useAuth } from '@/contexts/AuthContext';

    const RegisterPage = () => {
      const { toast } = useToast();
      const navigate = useNavigate();
      const { register, isAuthenticated, loading: authLoading, isAdmin } = useAuth(); // Renamed loading to authLoading
      const [fullName, setFullName] = useState('');
      const [email, setEmail] = useState('');
      const [phoneNumber, setPhoneNumber] = useState('');
      const [password, setPassword] = useState('');
      const [confirmPassword, setConfirmPassword] = useState('');
      const [isSubmitting, setIsSubmitting] = useState(false);

      useEffect(() => {
        if (!authLoading && isAuthenticated) {
          toast({
            title: "Anda Sudah Login",
            description: `Mengarahkan ke ${isAdmin ? 'Admin Dashboard' : 'Dashboard'}...`,
            className: "bg-blue-600 text-white border-none"
          });
          if (isAdmin) {
            navigate('/admin-dashboard', { replace: true });
          } else {
            navigate('/dashboard', { replace: true });
          }
        }
      }, [isAuthenticated, authLoading, navigate, isAdmin, toast]);


      const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!fullName || !email || !phoneNumber || !password || !confirmPassword) {
          toast({
            title: "Formulir Tidak Lengkap",
            description: "Mohon isi semua field yang tersedia.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        if (password !== confirmPassword) {
          toast({
            title: "Password Tidak Cocok",
            description: "Password dan konfirmasi password harus sama.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }
        
        if (password.length < 6) {
          toast({
            title: "Password Terlalu Pendek",
            description: "Password minimal harus 6 karakter.",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }

        if (!/^\+?[0-9\s-]{10,15}$/.test(phoneNumber)) {
          toast({
            title: "Nomor Handphone Tidak Valid",
            description: "Mohon masukkan nomor handphone yang valid (contoh: 081234567890 atau +6281234567890).",
            variant: "destructive",
          });
          setIsSubmitting(false);
          return;
        }


        try {
          const { data, error } = await register(email, password, fullName, phoneNumber);

          if (error) {
            toast({
              title: "Registrasi Gagal",
              description: error.message || "Terjadi kesalahan saat mendaftar. Email mungkin sudah digunakan atau ada masalah jaringan.",
              variant: "destructive",
            });
          } else if (data && data.user) { // Memastikan data dan data.user ada
            toast({
              title: "Registrasi Berhasil!",
              description: `Selamat datang di Juma, ${fullName}! ${data.session ? 'Anda akan diarahkan...' : 'Mohon konfirmasi email Anda (jika diperlukan) untuk melanjutkan.'}`,
              className: "bg-green-600 text-white border-none"
            });
            // Navigasi akan ditangani oleh useEffect jika isAuthenticated berubah
            // atau jika Anda ingin navigasi langsung setelah registrasi berhasil (bahkan sebelum konfirmasi email jika ada)
            // navigate('/dashboard'); // Contoh navigasi langsung
          } else {
            // Kasus di mana tidak ada error, tapi user juga tidak ada (seharusnya jarang terjadi dengan Supabase signUp)
             toast({
              title: "Registrasi Diproses",
              description: "Permintaan registrasi Anda telah dikirim. Mohon periksa email Anda untuk langkah selanjutnya.",
              variant: "default",
            });
          }
        } catch (error) {
          toast({
            title: "Terjadi Kesalahan Sistem",
            description: error.message || "Gagal memproses registrasi. Silakan coba lagi nanti.",
            variant: "destructive",
          });
        } finally {
          setIsSubmitting(false);
        }
      };
      
      if (authLoading && !isAuthenticated) {
        return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><p className="text-lg text-slate-300">Memuat...</p></div>;
      }
      // Kondisi ini sudah ditangani oleh useEffect, tapi bisa tetap ada sebagai fallback
      if (isAuthenticated && !authLoading) {
         return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><p className="text-lg text-slate-300">Anda sudah login. Mengarahkan...</p></div>;
      }

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="py-8 flex items-center justify-center min-h-[calc(100vh-200px)]"
        >
          <Card className="card-cheerful w-full max-w-md">
            <CardHeader className="text-center">
              <UserPlus size={48} className="mx-auto text-primary mb-4" />
              <CardTitle className="text-3xl font-bold gradient-text">Buat Akun Juma</CardTitle>
              <CardDescription className="text-muted-foreground">
                Daftar sekarang dan nikmati kemudahan jual beli di Makassar!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <Label htmlFor="fullName" className="text-foreground flex items-center"><User size={16} className="mr-2 text-primary" />Nama Lengkap</Label>
                  <Input 
                    id="fullName" 
                    value={fullName} 
                    onChange={(e) => setFullName(e.target.value)} 
                    placeholder="Nama Lengkap Anda" 
                    className="input-modern" 
                    required 
                  />
                </div>

                <div>
                  <Label htmlFor="email" className="text-foreground flex items-center"><Mail size={16} className="mr-2 text-primary" />Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="email@contoh.com" 
                    className="input-modern" 
                    required 
                  />
                </div>

                <div>
                  <Label htmlFor="phoneNumber" className="text-foreground flex items-center"><Phone size={16} className="mr-2 text-primary" />Nomor Handphone</Label>
                  <Input 
                    id="phoneNumber" 
                    type="tel"
                    value={phoneNumber} 
                    onChange={(e) => setPhoneNumber(e.target.value)} 
                    placeholder="081234567890" 
                    className="input-modern" 
                    required 
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-foreground flex items-center"><Lock size={16} className="mr-2 text-primary" />Password</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    placeholder="Minimal 6 karakter" 
                    className="input-modern" 
                    required 
                    minLength={6}
                  />
                </div>

                <div>
                  <Label htmlFor="confirmPassword" className="text-foreground flex items-center"><Lock size={16} className="mr-2 text-primary" />Konfirmasi Password</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    placeholder="Ulangi password" 
                    className="input-modern" 
                    required 
                    minLength={6}
                  />
                </div>
                
                <Button type="submit" size="lg" className="w-full friendly-button" disabled={isSubmitting || authLoading}>
                  {isSubmitting ? 'Memproses...' : <> <UserPlus size={18} className="mr-2" /> Daftar Sekarang </>}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col items-center">
              <p className="text-sm text-muted-foreground">
                Sudah punya akun?{' '}
                <Link to="/login" className="font-semibold text-primary hover:underline">
                  Login di sini
                </Link>
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      );
    };

    export default RegisterPage;
  