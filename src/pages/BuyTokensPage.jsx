import React, { useState, useEffect, useCallback } from 'react';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import { Coins, ShoppingCart, CheckCircle, ExternalLink, Info, AlertTriangle, XCircle } from 'lucide-react';
    import { Link, useNavigate } from 'react-router-dom';
    import { useAuth } from '@/contexts/AuthContext';
    import { supabase } from '@/lib/supabaseClient';

    const TokenPackageCard = ({ pkg, onSelectPackage, isSelected, isProcessing }) => {
      const hasValidLink = pkg.payment_gateway_url && pkg.payment_gateway_url.trim() !== '';
      
      return (
        <motion.div
          whileHover={{ scale: (isProcessing || !hasValidLink || !supabase) ? 1 : 1.03 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Card 
            className={`card-cheerful cursor-pointer transition-all duration-200 ${isSelected && hasValidLink ? 'ring-4 ring-primary shadow-primary/50' : 'hover:shadow-accent/30'} ${(isProcessing || !hasValidLink || !supabase) ? 'opacity-60 cursor-not-allowed' : ''}`}
            onClick={() => !(isProcessing || !hasValidLink || !supabase) && onSelectPackage(pkg)}
          >
            <CardHeader className="items-center text-center">
              <Coins size={48} className={`${pkg.tokens_amount <= 10 ? 'text-green-500' : pkg.tokens_amount <= 50 ? 'text-blue-500' : 'text-purple-500'} mb-2`} />
              <CardTitle className="text-2xl text-foreground">{pkg.name}</CardTitle>
              <CardDescription className="text-muted-foreground">{pkg.tokens_amount} Token</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-3xl font-bold text-primary">
                Rp {Number(pkg.price).toLocaleString('id-ID')}
              </p>
              {pkg.description && <p className="text-xs text-muted-foreground mt-1">{pkg.description}</p>}
              {!hasValidLink && (
                <div className="mt-3 text-xs text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30 p-2 rounded-md flex items-center justify-center">
                  <XCircle size={14} className="mr-1"/> Link Pembayaran Tidak Tersedia
                </div>
              )}
            </CardContent>
            {isSelected && hasValidLink && !isProcessing && supabase && (
              <CardFooter className="justify-center">
                <CheckCircle size={24} className="text-green-500" />
                <p className="ml-2 text-green-500 font-semibold">Paket Dipilih</p>
              </CardFooter>
            )}
          </Card>
        </motion.div>
      );
    };

    const BuyTokensPage = () => {
      const { toast } = useToast();
      const navigate = useNavigate();
      const { user, isAuthenticated, loading: authLoading } = useAuth();
      const [selectedPackage, setSelectedPackage] = useState(null);
      const [userTokens, setUserTokens] = useState(0);
      const [tokenPackages, setTokenPackages] = useState([]);
      const [isLoading, setIsLoading] = useState(true);
      const [isProcessingPayment, setIsProcessingPayment] = useState(false);

      const fetchPageData = useCallback(async () => {
        if (!supabase || !user) {
          setIsLoading(false);
          setUserTokens(0); 
          setTokenPackages([]);
          if (!supabase) {
            toast({ title: "Layanan Tidak Tersedia", description: "Fitur pembelian token tidak aktif. Database tidak terhubung.", variant: "destructive", duration: 5000 });
          }
          return;
        }
        setIsLoading(true);
        try {
          const { data: tokenData, error: tokenError } = await supabase
            .from('user_tokens')
            .select('balance')
            .eq('user_id', user.id)
            .single();

          if (tokenError && tokenError.code !== 'PGRST116') { 
             setUserTokens(0);
          } else if (tokenData) {
            setUserTokens(tokenData.balance);
          } else {
             const { data: newRecordWithZero, error: insertErrorZero } = await supabase
              .from('user_tokens')
              .insert({ user_id: user.id, balance: 0 })
              .select('balance')
              .single();
            if (insertErrorZero) throw insertErrorZero;
            setUserTokens(newRecordWithZero?.balance || 0);
          }


          const { data: packagesData, error: packagesError } = await supabase
            .from('token_packages')
            .select('id, name, description, tokens_amount, price, currency, is_active, payment_gateway_url')
            .eq('is_active', true)
            .order('price', { ascending: true });
          if (packagesError) throw packagesError;
          setTokenPackages(packagesData || []);

        } catch (error) {
          console.error("Error fetching page data:", error);
          setUserTokens(0);
          setTokenPackages([]);
          if (error.message.includes("relation \"public.token_packages\" does not exist")) {
            toast({ title: "Fitur Belum Siap", description: "Tabel paket token belum ada. Harap coba lagi nanti.", variant: "destructive" });
          } else if (error.message.includes("relation \"public.user_tokens\" does not exist")) {
            toast({ title: "Fitur Belum Siap", description: "Tabel token pengguna belum ada. Harap coba lagi nanti.", variant: "destructive" });
          } else {
            toast({ title: "Gagal Memuat Data", description: "Gagal memuat data paket token atau saldo. Coba refresh halaman.", variant: "destructive" });
          }
        } finally {
          setIsLoading(false);
        }
      }, [user, toast]);


      useEffect(() => {
        if (authLoading) return; 

        if (!isAuthenticated) {
          navigate('/login', {state: {from: '/beli-token'}});
          toast({
            title: "Akses Ditolak",
            description: "Anda harus login untuk membeli token.",
            variant: "destructive"
          });
        } else if (supabase && user) {
          fetchPageData();
        } else {
          setIsLoading(false);
          setUserTokens(0);
          setTokenPackages([]);
        }
      }, [isAuthenticated, authLoading, navigate, toast, fetchPageData, user, supabase]);


      const handleProceedToPayment = () => {
        if (!supabase) {
            toast({ title: "Layanan Tidak Tersedia", description: "Pembayaran tidak dapat diproses. Database tidak terhubung.", variant: "destructive" });
            return;
        }
        if (!selectedPackage) {
          toast({ title: "Pilih Paket", description: "Silakan pilih paket token terlebih dahulu.", variant: "destructive" });
          return;
        }
        
        const hasValidLink = selectedPackage.payment_gateway_url && selectedPackage.payment_gateway_url.trim() !== '';
        if (!hasValidLink) {
          toast({ 
            title: "Link Pembayaran Tidak Tersedia", 
            description: "Link pembayaran untuk paket ini belum diatur oleh admin. Silakan pilih paket lain atau hubungi dukungan.", 
            variant: "destructive" 
          });
          return;
        }

        setIsProcessingPayment(true);
        toast({
          title: "Mengarahkan ke Pembayaran...",
          description: `Anda akan diarahkan ke halaman pembayaran untuk ${selectedPackage.name}.`,
        });
        
        localStorage.setItem('pendingTokenPurchase', JSON.stringify({
          packageId: selectedPackage.id,
          packageName: selectedPackage.name,
          tokensAmount: selectedPackage.tokens_amount,
          price: selectedPackage.price,
          userId: user.id,
          timestamp: Date.now()
        }));

        window.location.href = selectedPackage.payment_gateway_url;
      };
      
      if (authLoading || (!isAuthenticated && !authLoading && isLoading)) {
         return (
          <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
            />
            <p className="ml-4 text-muted-foreground">Memuat data pengguna...</p>
          </div>
        );
      }
      
      if (isLoading && supabase) {
        return (
          <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
            />
             <p className="ml-4 text-muted-foreground">Memuat paket token...</p>
          </div>
        );
      }

      if (!supabase) {
        return (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="py-8 max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
                <Coins size={64} className="mx-auto text-yellow-500 mb-4" />
                <h1 className="text-4xl md:text-5xl font-extrabold gradient-text mb-3">Beli Token Juma</h1>
                <p className="text-lg text-muted-foreground">
                Saldo Anda saat ini: <span className="font-bold text-yellow-500">{userTokens} Token</span>.
                </p>
            </div>
             <div className="flex flex-col items-center justify-center text-center p-4 card-cheerful">
                <AlertTriangle size={48} className="text-yellow-500 mb-4" />
                <h2 className="text-2xl font-semibold text-foreground mb-2">Layanan Pembelian Token Tidak Tersedia</h2>
                <p className="text-muted-foreground">Fitur ini tidak dapat dimuat karena koneksi ke database belum dikonfigurasi.</p>
                <Link to="/dashboard" className="text-sm text-primary hover:underline mt-6">
                    Kembali ke Dashboard
                </Link>
            </div>
          </motion.div>
        );
      }


      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="py-8 max-w-4xl mx-auto"
        >
          <div className="text-center mb-12">
            <Coins size={64} className="mx-auto text-primary mb-4" />
            <h1 className="text-4xl md:text-5xl font-extrabold gradient-text mb-3">Beli Token Juma</h1>
            <p className="text-lg text-muted-foreground">
              Isi ulang saldo token Anda untuk memasang iklan. Saldo Anda saat ini: <span className="font-bold text-primary">{userTokens} Token</span>.
            </p>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">Pilih Paket Token</h2>
            {tokenPackages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tokenPackages.map(pkg => (
                  <TokenPackageCard 
                    key={pkg.id} 
                    pkg={pkg} 
                    onSelectPackage={setSelectedPackage}
                    isSelected={selectedPackage?.id === pkg.id}
                    isProcessing={isProcessingPayment}
                  />
                ))}
              </div>
            ) : (
               <div className="text-center py-10">
                 <AlertTriangle size={48} className="mx-auto text-yellow-500 mb-4" />
                 <p className="text-xl text-muted-foreground">Oops! Paket token tidak tersedia.</p>
                 <p className="text-sm text-muted-foreground mt-2">
                   Sepertinya belum ada paket token yang aktif saat ini. Silakan cek kembali nanti atau hubungi admin jika Anda merasa ini adalah kesalahan.
                 </p>
               </div>
            )}
          </section>

          {selectedPackage && (
            <motion.section 
              initial={{ opacity: 0, y:10 }} animate={{ opacity: 1, y:0 }}
              className="mb-12"
            >
              <h2 className="text-2xl font-semibold text-foreground mb-6 text-center">Konfirmasi Pembelian</h2>
              <Card className="card-cheerful p-6">
                <CardHeader>
                  <CardTitle className="text-xl text-foreground flex items-center">
                    <ShoppingCart size={24} className="text-primary mr-2"/> Detail Pilihan Anda
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-muted-foreground">
                    Anda telah memilih paket: <span className="font-bold text-primary">{selectedPackage.name} ({selectedPackage.tokens_amount} Token)</span>.
                  </p>
                  <div className="bg-primary/10 p-4 rounded-lg border border-primary/30">
                    <p className="text-sm text-muted-foreground">Total Pembayaran:</p>
                    <p className="text-2xl font-bold text-primary">
                      Rp {Number(selectedPackage.price).toLocaleString('id-ID')}
                    </p>
                  </div>
                   <div className="bg-yellow-100 dark:bg-yellow-900/30 border-l-4 border-yellow-500 text-yellow-700 dark:text-yellow-300 p-4 rounded-md" role="alert">
                    <div className="flex">
                      <div className="py-1"><Info className="h-5 w-5 text-yellow-500 mr-3" /></div>
                      <div>
                        <p className="font-bold">Penting!</p>
                        <p className="text-sm">Anda akan diarahkan ke halaman pembayaran {selectedPackage.payment_gateway_url?.includes('mayar.id') ? 'Mayar.id' : 'Payment Gateway External'}. Setelah pembayaran berhasil dan dikonfirmasi, Anda akan kembali ke aplikasi ini dan token akan ditambahkan ke akun Anda.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                   <Button 
                    onClick={handleProceedToPayment} 
                    size="lg" 
                    className="friendly-button w-full md:w-auto px-8 py-6 text-lg" 
                    disabled={isProcessingPayment || !(selectedPackage.payment_gateway_url && selectedPackage.payment_gateway_url.trim() !== '')}
                  >
                    {isProcessingPayment ? (
                        <>
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                            />
                            Memproses...
                        </>
                    ) : (
                      <>
                        Lanjut ke Pembayaran <ExternalLink size={20} className="ml-2" />
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            </motion.section>
          )}
          
          {!selectedPackage && tokenPackages.length > 0 && (
            <p className="text-center text-muted-foreground">Silakan pilih salah satu paket di atas untuk melanjutkan.</p>
          )}

          <div className="text-center mt-8">
            <Link to="/dashboard" className="text-sm text-primary hover:underline">
                Kembali ke Dashboard
            </Link>
          </div>
        </motion.div>
      );
    };

    export default BuyTokensPage;