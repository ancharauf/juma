import React, { useEffect, useState, useCallback } from 'react';
    import { useLocation, useNavigate, Link } from 'react-router-dom';
    import { useAuth } from '@/contexts/AuthContext';
    import { supabase } from '@/lib/supabaseClient';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import { CheckCircle, XCircle, AlertTriangle, Loader2, Home, ShoppingBag } from 'lucide-react';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

    const PaymentStatusPage = () => {
      const location = useLocation();
      const navigate = useNavigate();
      const { user, isAuthenticated, loading: authLoading, fetchUserTokens: refreshAuthContextTokens } = useAuth();
      const { toast } = useToast();
      const [status, setStatus] = useState('processing'); 
      const [message, setMessage] = useState('Memproses status pembayaran Anda...');
      const [transactionDetails, setTransactionDetails] = useState(null);
      const [isLoading, setIsLoading] = useState(true);

      const processPayment = useCallback(async (params) => {
        if (!supabase) {
          setStatus('error');
          setMessage('Layanan pembayaran tidak tersedia. Koneksi database belum dikonfigurasi.');
          setIsLoading(false);
          toast({ title: "Layanan Tidak Tersedia", description: "Pembayaran tidak dapat diproses. Database tidak terhubung.", variant: "destructive"});
          return;
        }
        if (!user) {
          setStatus('error');
          setMessage('Pengguna tidak terautentikasi. Tidak dapat memproses pembayaran.');
          setIsLoading(false);
          return;
        }

        const pendingPurchaseString = localStorage.getItem('pendingTokenPurchase');
        if (!pendingPurchaseString) {
          setStatus('error');
          setMessage('Data pembelian tidak ditemukan. Sesi mungkin berakhir atau ada kesalahan. Silakan coba lagi dari halaman pembelian token.');
          setIsLoading(false);
          return;
        }
        
        let pendingPurchase;
        try {
          pendingPurchase = JSON.parse(pendingPurchaseString);
        } catch (e) {
          setStatus('error');
          setMessage('Gagal memparsing data pembelian. Silakan coba lagi atau hubungi dukungan.');
          localStorage.removeItem('pendingTokenPurchase');
          setIsLoading(false);
          return;
        }

        if (pendingPurchase.userId !== user.id) {
          setStatus('error');
          setMessage('Data pembelian tidak sesuai dengan pengguna saat ini.');
          localStorage.removeItem('pendingTokenPurchase');
          setIsLoading(false);
          return;
        }
        
        const MAX_PENDING_PURCHASE_AGE = 60 * 60 * 1000; 
        if (Date.now() - pendingPurchase.timestamp > MAX_PENDING_PURCHASE_AGE) {
            setStatus('error');
            setMessage('Sesi pembelian telah kedaluwarsa. Silakan ulangi proses pembelian token.');
            localStorage.removeItem('pendingTokenPurchase');
            setIsLoading(false);
            return;
        }
        
        const gatewayTransactionId = params.get('transaction_no') || params.get('payment_token') || `MAYARID-${Date.now()}`; 
        const gatewayStatusFromParam = params.get('status') || 'unknown'; 

        let internalStatus;
        switch (gatewayStatusFromParam.toLowerCase()) {
            case 'paid':
            case 'success': 
                internalStatus = 'success';
                break;
            case 'unpaid':
            case 'pending': 
                internalStatus = 'pending';
                break;
            case 'expired':
            case 'cancelled':
            case 'failed': 
                internalStatus = 'failed';
                break;
            default:
                internalStatus = 'unknown'; 
        }
        
        const gatewayResponse = {};
        for (const [key, value] of params.entries()) {
            gatewayResponse[key] = value;
        }
        
        try {
          const { data: rpcData, error: rpcError } = await supabase.rpc('process_token_purchase', {
            user_id_param: user.id,
            package_id_param: pendingPurchase.packageId,
            gateway_transaction_id_param: gatewayTransactionId,
            gateway_status_param: internalStatus, 
            gateway_response_param: gatewayResponse
          });

          localStorage.removeItem('pendingTokenPurchase'); 

          if (rpcError) throw rpcError;

          if (rpcData.success && internalStatus === 'success') {
            setStatus('success');
            setMessage(rpcData.message || `Pembelian token ${pendingPurchase.packageName} berhasil!`);
            setTransactionDetails({
              tokensAdded: rpcData.tokens_added,
              newBalance: rpcData.new_balance,
              packageName: pendingPurchase.packageName,
            });
            toast({
              title: "Pembayaran Berhasil!",
              description: `Token ${pendingPurchase.packageName} (${rpcData.tokens_added} token) telah ditambahkan. Saldo baru: ${rpcData.new_balance}.`,
              className: "bg-green-600 text-white border-none",
              duration: 7000,
            });
            if (refreshAuthContextTokens) refreshAuthContextTokens(); 
          } else {
            setStatus(internalStatus === 'pending' ? 'pending' : 'failed');
            setMessage(rpcData.message || `Pembayaran token ${pendingPurchase.packageName} ${internalStatus === 'pending' ? 'masih tertunda' : 'gagal'}.`);
            toast({
              title: `Pembayaran ${internalStatus === 'pending' ? 'Tertunda' : 'Gagal'}`,
              description: rpcData.message || `Status pembayaran: ${gatewayStatusFromParam}. Token belum ditambahkan.`,
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Error processing payment RPC:", error);
          setStatus('error');
          setMessage(`Terjadi kesalahan teknis: ${error.message}. Silakan hubungi dukungan jika token belum masuk.`);
          toast({
            title: "Error Pemrosesan",
            description: "Gagal memproses pembayaran Anda. Silakan hubungi dukungan.",
            variant: "destructive",
          });
        } finally {
          setIsLoading(false);
        }
      }, [user, toast, navigate, refreshAuthContextTokens]);

      useEffect(() => {
        if (authLoading) return; 

        if (!isAuthenticated) {
          toast({ title: "Harap Login", description: "Sesi Anda mungkin telah berakhir. Silakan login kembali.", variant: "destructive" });
          navigate('/login', { state: { from: location, message: "Selesaikan login untuk melihat status pembayaran." } });
          return;
        }
        
        const queryParams = new URLSearchParams(location.search);
        if (queryParams.toString() && supabase && user) {
            processPayment(queryParams);
        } else if (!supabase) {
             setStatus('error');
             setMessage('Layanan pembayaran tidak tersedia. Koneksi database belum dikonfigurasi.');
             setIsLoading(false);
        } else {
            setStatus('error');
            setMessage('Tidak ada informasi pembayaran yang diterima atau pengguna tidak valid.');
            setIsLoading(false);
            toast({
                title: "Informasi Tidak Lengkap",
                description: "Tidak ada detail pembayaran yang diterima dari payment gateway atau pengguna tidak valid.",
                variant: "destructive"
            });
        }

      }, [authLoading, isAuthenticated, location, navigate, toast, processPayment, supabase, user]);

      const renderIcon = () => {
        if (isLoading || status === 'processing') return <Loader2 className="h-16 w-16 text-primary animate-spin" />;
        switch (status) {
          case 'success':
            return <CheckCircle className="h-16 w-16 text-green-500" />;
          case 'failed':
            return <XCircle className="h-16 w-16 text-red-500" />;
          case 'pending':
            return <AlertTriangle className="h-16 w-16 text-yellow-500" />;
          case 'error':
            return <AlertTriangle className="h-16 w-16 text-red-700" />;
          default: 
            return <AlertTriangle className="h-16 w-16 text-muted-foreground" />;
        }
      };
      
      const cardBorderColor = () => {
        if (isLoading || status === 'processing') return 'border-primary';
        switch (status) {
          case 'success': return 'border-green-500';
          case 'failed': return 'border-red-500';
          case 'pending': return 'border-yellow-500';
          case 'error': return 'border-red-700';
          default: return 'border-muted-foreground';
        }
      };

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center justify-center min-h-[calc(100vh-250px)] py-8 px-4"
        >
          <Card className={`w-full max-w-md shadow-xl card-cheerful border-2 ${cardBorderColor()}`}>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4">
                {renderIcon()}
              </div>
              <CardTitle className="text-2xl">
                {status === 'success' && 'Pembayaran Berhasil!'}
                {status === 'failed' && 'Pembayaran Gagal'}
                {status === 'pending' && 'Pembayaran Tertunda'}
                {(status === 'processing' || isLoading) && 'Memproses Pembayaran...'}
                {status === 'error' && 'Terjadi Kesalahan'}
                {status === 'unknown' && 'Status Pembayaran Tidak Dikenali'}
              </CardTitle>
              <CardDescription className="px-2">{message}</CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {status === 'success' && transactionDetails && (
                <div className="text-left bg-green-500/10 p-4 rounded-md border border-green-500/30">
                  <p className="font-semibold text-green-700 dark:text-green-300">Detail Transaksi:</p>
                  <ul className="list-disc list-inside text-sm text-green-600 dark:text-green-400">
                    <li>Paket: {transactionDetails.packageName}</li>
                    <li>Token Ditambahkan: {transactionDetails.tokensAdded}</li>
                    <li>Saldo Token Baru: {transactionDetails.newBalance}</li>
                  </ul>
                </div>
              )}
              {(status === 'failed' || status === 'error' || status === 'unknown') && (
                <p className="text-sm text-muted-foreground">
                  Jika Anda merasa ini adalah kesalahan atau memerlukan bantuan, silakan hubungi dukungan kami atau coba lagi.
                </p>
              )}
              {status === 'pending' && (
                 <p className="text-sm text-muted-foreground">
                  Kami akan memproses token Anda setelah pembayaran dikonfirmasi. Anda dapat memeriksa saldo token Anda di dashboard.
                </p>
              )}

              {!isLoading && (
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button asChild className="w-full friendly-button">
                    <Link to="/dashboard">
                      <Home size={18} className="mr-2" /> Ke Dashboard
                    </Link>
                  </Button>
                  {(status === 'failed' || status === 'error' || status === 'unknown') && (
                    <Button asChild variant="outline" className="w-full" disabled={!supabase}>
                      <Link to="/beli-token">
                        <ShoppingBag size={18} className="mr-2" /> Coba Beli Lagi
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      );
    };

    export default PaymentStatusPage;