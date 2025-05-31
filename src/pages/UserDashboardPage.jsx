import React, { useState, useEffect, useCallback } from 'react';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
    import { motion } from 'framer-motion';
    import { UserCircle, ShoppingBag, Coins, Settings, Edit3, Trash2, Eye, LogOut, AlertTriangle } from 'lucide-react';
    import { Link, useNavigate } from 'react-router-dom';
    import { useToast } from '@/components/ui/use-toast';
    import { useAuth } from '@/contexts/AuthContext';
    import { supabase } from '@/lib/supabaseClient';

    const UserDashboardPage = () => {
      const [userTokens, setUserTokens] = useState(0);
      const [userAds, setUserAds] = useState([]);
      const [pageLoading, setPageLoading] = useState(true); 
      const { toast } = useToast();
      const { user, profile: authProfile, logout, isAuthenticated, loading: authContextLoading, isAdmin } = useAuth(); 
      const navigate = useNavigate();

      const fetchDashboardData = useCallback(async () => {
        if (!supabase || !user || !authProfile) { 
            if(!authContextLoading) setPageLoading(false); 
            if (!supabase) {
                toast({ title: "Layanan Tidak Tersedia", description: "Data dashboard tidak dapat dimuat. Database tidak terhubung.", variant: "destructive", duration: 5000 });
                setUserTokens(0);
                setUserAds([]);
            }
            return;
        }
        setPageLoading(true);
        try {
          const { data: tokenData, error: tokenError } = await supabase
            .from('user_tokens')
            .select('balance')
            .eq('user_id', user.id)
            .single();
          if (tokenError && tokenError.code !== 'PGRST116') throw tokenError;
          setUserTokens(tokenData ? tokenData.balance : 0);

          const { data: adsData, error: adsError } = await supabase
            .from('ads')
            .select('*, category:category_id(name)')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false });
          if (adsError) throw adsError;
          setUserAds(adsData || []);

        } catch (error) {
          console.error("Error fetching dashboard data:", error);
           setUserTokens(0);
           setUserAds([]);
           if (error.message.includes("relation") && (error.message.includes("user_tokens") || error.message.includes("ads"))) {
             toast({ title: "Fitur Belum Siap", description: "Beberapa tabel data belum ada. Harap coba lagi nanti.", variant: "destructive" });
           } else {
            toast({ title: "Gagal memuat data dashboard", description: error.message, variant: "destructive" });
           }
        } finally {
          setPageLoading(false);
        }
      }, [user, authProfile, toast, authContextLoading]);


      useEffect(() => {
        if (authContextLoading) {
          setPageLoading(true); 
          return;
        }

        if (!isAuthenticated) {
          navigate('/login', { replace: true });
          toast({
            title: "Akses Ditolak",
            description: "Anda harus login untuk mengakses dashboard.",
            variant: "destructive"
          });
          return; 
        }

        if (isAdmin) {
            navigate('/admin-dashboard', {replace: true});
             toast({
                title: "Mengalihkan ke Admin",
                description: "Anda adalah admin, mengarahkan ke dashboard admin.",
                className: "bg-blue-600 text-white"
            });
            return;
        }
        
        if(user && authProfile && supabase) { 
            fetchDashboardData();
        } else if (!authContextLoading && !user) { 
            setPageLoading(false); 
        } else if (!supabase) {
            setPageLoading(false);
            setUserTokens(0);
            setUserAds([]);
        }

      }, [isAuthenticated, isAdmin, user, authProfile, authContextLoading, navigate, toast, fetchDashboardData, supabase]);

      const handleDeleteAd = async (adId) => {
        if (!supabase) {
          toast({ title: "Layanan Tidak Tersedia", description: "Fitur hapus iklan tidak aktif. Database tidak terhubung.", variant: "destructive" });
          return;
        }
        if (!window.confirm("Anda yakin ingin menghapus iklan ini?")) return;
        try {
          const { error } = await supabase
            .from('ads')
            .delete()
            .eq('id', adId);
          if (error) throw error;

          setUserAds(prevAds => prevAds.filter(ad => ad.id !== adId));
          toast({
            title: "Iklan Dihapus",
            description: "Iklan Anda telah berhasil dihapus.",
            className: "bg-green-600 text-white border-none"
          });
        } catch (error) {
          console.error("Error deleting ad:", error);
          toast({ title: "Gagal Menghapus Iklan", description: error.message, variant: "destructive" });
        }
      };

      const handleLogout = async () => {
        await logout(); 
        navigate('/', { replace: true }); 
      };
      
      const displayUser = authProfile || user;
      const userDisplayName = displayUser?.full_name || displayUser?.email?.split('@')[0] || "Pengguna Juma";
      const userDisplayEmail = displayUser?.email;
      const userDisplayAvatar = displayUser?.avatar_url || `https://avatar.iran.liara.run/public/boy?username=${displayUser?.id || 'JumaUser'}`;


      if (authContextLoading || (pageLoading && supabase)) {
        return (
          <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
            />
          </div>
        );
      }
      
      if (!user && !authContextLoading) { 
         return <div className="flex justify-center items-center min-h-[calc(100vh-200px)]"><p className="text-slate-300">Sesi tidak ditemukan. Mengarahkan ke login...</p></div>; 
      }

      if (!supabase && !authContextLoading && !pageLoading) {
         return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="py-8"
          >
            <div className="text-center mb-12">
              <Avatar className="h-20 w-20 mx-auto mb-4 ring-2 ring-yellow-500 ring-offset-4 ring-offset-background">
                <AvatarImage src={userDisplayAvatar} alt={userDisplayName} />
                <AvatarFallback>{userDisplayName.substring(0,1).toUpperCase()}</AvatarFallback>
              </Avatar>
              <h1 className="text-4xl md:text-5xl font-extrabold gradient-text mb-1">Dashboard {userDisplayName}</h1>
              <p className="text-md text-muted-foreground">{userDisplayEmail}</p>
            </div>
            <div className="flex flex-col items-center justify-center text-center p-4 card-cheerful max-w-md mx-auto">
                <AlertTriangle size={48} className="text-yellow-500 mb-4" />
                <h2 className="text-2xl font-semibold text-foreground mb-2">Layanan Dashboard Tidak Tersedia</h2>
                <p className="text-muted-foreground">Fitur dashboard tidak dapat dimuat sepenuhnya karena koneksi ke database belum dikonfigurasi.</p>
                <p className="text-sm text-slate-400 mt-1">Anda masih bisa logout dari sesi saat ini.</p>
                <Button onClick={handleLogout} variant="destructive" size="sm" className="w-full max-w-xs mt-6">
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </Button>
            </div>
          </motion.div>
        );
      }

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="py-8"
        >
          <div className="text-center mb-12">
            <Avatar className="h-20 w-20 mx-auto mb-4 ring-2 ring-primary ring-offset-4 ring-offset-background">
              <AvatarImage src={userDisplayAvatar} alt={userDisplayName} />
              <AvatarFallback>{userDisplayName.substring(0,1).toUpperCase()}</AvatarFallback>
            </Avatar>
            <h1 className="text-4xl md:text-5xl font-extrabold gradient-text mb-1">Dashboard {userDisplayName}</h1>
            <p className="text-md text-muted-foreground">{userDisplayEmail}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="card-cheerful">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Saldo Token</CardTitle>
                <Coins className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{userTokens}</div>
                <p className="text-xs text-muted-foreground mt-1">Token tersedia untuk pasang iklan.</p>
                <Button asChild size="sm" className="mt-3 friendly-button w-full" disabled={!supabase}>
                  <Link to="/beli-token">Beli Token</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="card-cheerful">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Iklan Saya</CardTitle>
                <ShoppingBag className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{userAds.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Total iklan yang pernah Anda pasang.</p>
                 <Button asChild size="sm" className="mt-3 friendly-button w-full" disabled={!supabase}>
                  <Link to="/buat-iklan">Pasang Iklan Baru</Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card className="card-cheerful">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-foreground">Pengaturan Akun</CardTitle>
                <Settings className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent className="flex flex-col space-y-2">
                <Button variant="outline" size="sm" className="border-primary text-primary hover:bg-primary/10 w-full" disabled>
                  <UserCircle className="h-4 w-4 mr-2" /> Edit Profil (Segera)
                </Button>
                 <Button onClick={handleLogout} variant="destructive" size="sm" className="w-full">
                  <LogOut className="h-4 w-4 mr-2" /> Logout
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="card-cheerful">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Daftar Iklan Saya</CardTitle>
              <CardDescription className="text-muted-foreground">Kelola semua iklan yang pernah Anda pasang.</CardDescription>
            </CardHeader>
            <CardContent>
              {userAds.length > 0 && supabase ? (
                <div className="space-y-4">
                  {userAds.map(ad => (
                    <motion.div 
                      key={ad.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="flex flex-col md:flex-row items-center justify-between p-4 bg-input rounded-lg shadow-md"
                    >
                      <div className="flex items-center space-x-3 mb-3 md:mb-0 flex-grow">
                        <img  alt={ad.title} className="w-16 h-16 object-cover rounded-md flex-shrink-0"  src="https://images.unsplash.com/photo-1593577873421-61ce84e3895a" />
                        <div className="flex-grow">
                          <h3 className="font-semibold text-foreground">{ad.title}</h3>
                          <p className="text-xs text-muted-foreground">Kategori: {ad.category?.name || 'N/A'} | Harga: {ad.price ? `Rp ${Number(ad.price).toLocaleString('id-ID')}` : 'N/A'}</p>
                          <p className="text-xs text-muted-foreground">Durasi: {ad.duration_days} hari | Biaya: {ad.token_cost} Token | Status: <span className={`capitalize ${ad.status === 'active' ? 'text-green-400' : ad.status === 'pending_payment' || ad.status === 'pending_activation' ? 'text-yellow-400' : 'text-red-400'}`}>{ad.status?.replace(/_/g, ' ') || 'N/A'}</span></p>
                           <p className="text-xs text-muted-foreground">Tayang hingga: {ad.expires_at ? new Date(ad.expires_at).toLocaleDateString('id-ID') : 'N/A'}</p>
                        </div>
                      </div>
                      <div className="flex space-x-2 flex-shrink-0">
                        <Button variant="outline" size="icon" className="border-blue-500 text-blue-500 hover:bg-blue-500/10" onClick={() => navigate(`/pasang-iklan/${ad.id}`)} disabled> 
                          <Eye size={16} />
                        </Button>
                        <Button variant="outline" size="icon" className="border-yellow-500 text-yellow-500 hover:bg-yellow-500/10" disabled>
                          <Edit3 size={16} />
                        </Button>
                        <Button variant="destructive" size="icon" onClick={() => handleDeleteAd(ad.id)} disabled={!supabase}>
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-8">
                  {supabase ? <>Anda belum memiliki iklan. <Link to="/buat-iklan" className="text-primary hover:underline">Pasang iklan sekarang!</Link></> : "Fitur daftar iklan tidak tersedia."}
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      );
    };

    export default UserDashboardPage;