import React, { useState, useEffect, useCallback } from 'react';
    import { Button } from '@/components/ui/button';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import { Send, Info, AlertTriangle } from 'lucide-react';
    import { Link, useNavigate } from 'react-router-dom';
    import { useAuth } from '@/contexts/AuthContext';
    import { supabase } from '@/lib/supabaseClient';
    import ImageUploadPreview from '@/components/postad/ImageUploadPreview';
    import DurationSelector, { durationOptions } from '@/components/postad/DurationSelector';
    import AdFormFields from '@/components/postad/AdFormFields';

    const MAX_IMAGE_UPLOADS = 5;

    const PostAdPage = () => {
      const { toast } = useToast();
      const navigate = useNavigate();
      const { user, isAuthenticated, loading: authLoading } = useAuth();

      const [title, setTitle] = useState('');
      const [categoryId, setCategoryId] = useState(undefined);
      const [price, setPrice] = useState('');
      const [description, setDescription] = useState('');
      const [location, setLocation] = useState('');
      const [imagePreviews, setImagePreviews] = useState([]);
      const [imageFiles, setImageFiles] = useState([]);
      const [currentDurationDays, setCurrentDurationDays] = useState(durationOptions[0].value);
      const [tokenCost, setTokenCost] = useState(durationOptions[0].token);
      const [userTokens, setUserTokens] = useState(0);
      const [categories, setCategories] = useState([]);
      const [isSubmitting, setIsSubmitting] = useState(false);
      const [isLoadingData, setIsLoadingData] = useState(true);

      const fetchUserTokens = useCallback(async () => {
        if (!supabase || !user) {
          setUserTokens(0);
          return;
        }
        try {
          const { data, error } = await supabase
            .from('user_tokens')
            .select('balance')
            .eq('user_id', user.id)
            .single();
          
          if (error && error.code === 'PGRST116') {
             setUserTokens(0);
          } else if (error) {
            throw error;
          } else {
            setUserTokens(data ? data.balance : 0);
          }
        } catch (error) {
          console.error("Error fetching/creating user tokens:", error);
          setUserTokens(0);
          toast({ title: "Gagal memuat saldo token", description: error.message, variant: "destructive" });
        }
      }, [user, toast]);

      const fetchCategories = useCallback(async () => {
        if (!supabase) {
          setCategories([]);
          return;
        }
        try {
          const { data, error } = await supabase
            .from('categories')
            .select('id, name')
            .order('name', { ascending: true });
          if (error) throw error;
          setCategories(data || []);
        } catch (error) {
          console.error("Error fetching categories:", error);
          setCategories([]);
          toast({ title: "Gagal memuat kategori", description: error.message, variant: "destructive" });
        }
      }, [toast]);

      useEffect(() => {
        if (authLoading) return;

        if (!isAuthenticated) {
          toast({
            title: "Akses Ditolak",
            description: "Anda harus login untuk memasang iklan.",
            variant: "destructive"
          });
          navigate('/login', { replace: true });
          return;
        }
        
        if (supabase && user) {
            setIsLoadingData(true);
            Promise.all([fetchUserTokens(), fetchCategories()]).finally(() => setIsLoadingData(false));
        } else {
            setIsLoadingData(false);
            setUserTokens(0);
            setCategories([]);
            if(!supabase) {
                toast({ title: "Layanan Tidak Tersedia", description: "Fitur pasang iklan tidak aktif. Database tidak terhubung.", variant: "destructive", duration: 5000 });
            }
        }

      }, [isAuthenticated, navigate, toast, fetchUserTokens, fetchCategories, authLoading, user, supabase]);

      useEffect(() => {
        const selectedOption = durationOptions.find(opt => opt.value === currentDurationDays);
        if (selectedOption) {
          setTokenCost(selectedOption.token);
        }
      }, [currentDurationDays]);

      const handleImageUpload = (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        if (files.length + imageFiles.length > MAX_IMAGE_UPLOADS) {
          toast({
            title: "Batas Gambar Tercapai",
            description: `Anda hanya dapat mengunggah maksimal ${MAX_IMAGE_UPLOADS} gambar.`,
            variant: "destructive",
          });
          event.target.value = "";
          return;
        }
        
        const newImageFiles = files.slice(0, MAX_IMAGE_UPLOADS - imageFiles.length);
        setImageFiles(prev => [...prev, ...newImageFiles]);
        
        const newImagePreviewsData = newImageFiles.map(file => ({
          preview: URL.createObjectURL(file),
          name: file.name,
        }));
        setImagePreviews(prev => [...prev, ...newImagePreviewsData]);
        event.target.value = "";
      };

      const removeImage = (indexToRemove) => {
        URL.revokeObjectURL(imagePreviews[indexToRemove].preview);
        setImagePreviews(prevPreviews => prevPreviews.filter((_, i) => i !== indexToRemove));
        setImageFiles(prevImageFiles => prevImageFiles.filter((_,i) => i !== indexToRemove));
      };
      
      useEffect(() => {
        return () => {
          imagePreviews.forEach(file => URL.revokeObjectURL(file.preview));
        };
      }, [imagePreviews]);

      const uploadImagesToSupabase = async () => {
        if (!supabase || imageFiles.length === 0 || !user) return [];

        const uploadedImageUrls = [];
        for (const file of imageFiles) {
          const fileExt = file.name.split('.').pop();
          const fileName = `ad_images/${user.id}/${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
          
          const { data, error } = await supabase.storage
            .from('general_storage')
            .upload(fileName, file, {
              cacheControl: '3600',
              upsert: false
            });

          if (error) {
            console.error('Error uploading image:', error);
            toast({ title: "Gagal Upload Gambar", description: error.message, variant: "destructive" });
            throw error;
          }
          
          const { data: { publicUrl } } = supabase.storage.from('general_storage').getPublicUrl(data.path);
          uploadedImageUrls.push(publicUrl);
        }
        return uploadedImageUrls;
      };

      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!supabase) {
            toast({ title: "Layanan Tidak Tersedia", description: "Fitur pasang iklan tidak aktif. Database tidak terhubung.", variant: "destructive" });
            return;
        }
        if (!isAuthenticated || !user) {
            toast({ title: "Harap Login", description: "Anda perlu login untuk memasang iklan.", variant: "destructive" });
            navigate('/login');
            return;
        }

        if (!title || !categoryId || !description || !location) {
          toast({ title: "Formulir Tidak Lengkap", description: "Mohon isi semua field yang wajib diisi, termasuk kategori.", variant: "destructive"});
          return;
        }

        if (userTokens < tokenCost) {
          toast({
            title: "Token Tidak Cukup",
            description: (
              <div className="flex items-center">
                <Info size={16} className="mr-2 text-yellow-400" />
                <span>Anda memerlukan {tokenCost} token, saldo Anda {userTokens} token.</span>
                <Button variant="link" asChild className="p-0 ml-1 h-auto text-yellow-400 hover:text-yellow-300">
                  <Link to="/beli-token">Beli token.</Link>
                </Button>
              </div>
            ),
            variant: "destructive",
            className: "bg-yellow-600 border-yellow-700 text-white"
          });
          return;
        }
        
        setIsSubmitting(true);
        let adId = null;
        try {
          const imageUrls = await uploadImagesToSupabase();

          const { data: adData, error: adError } = await supabase
            .from('ads')
            .insert([{
              user_id: user.id,
              title,
              category_id: categoryId,
              price: price ? parseFloat(price.replace(/[^0-9.,]+/g,"").replace(",", ".")) : null,
              description,
              location,
              image_urls: imageUrls.length > 0 ? imageUrls : null,
              duration_days: currentDurationDays,
              token_cost: tokenCost,
              status: 'pending_payment'
            }])
            .select('id, title')
            .single();

          if (adError) throw adError;
          adId = adData.id;
          
          const { error: rpcError } = await supabase.rpc('deduct_tokens_and_activate_ad', {
            ad_id_param: adId,
            user_id_param: user.id,
            token_cost_param: tokenCost,
            duration_days_param: currentDurationDays
          });

          if (rpcError) throw rpcError;

          await fetchUserTokens();

          toast({
            title: "Iklan Berhasil Dipasang!",
            description: `Iklan "${adData.title}" Anda telah tayang.`,
            className: "bg-green-600 text-white border-none"
          });
          
          setTitle('');
          setCategoryId(undefined);
          setPrice('');
          setDescription('');
          setLocation('');
          setImagePreviews([]);
          setImageFiles([]);
          setCurrentDurationDays(durationOptions[0].value);
          navigate('/dashboard');

        } catch (error) {
          console.error("Error posting ad:", error);
          
          if (adId && error.message.toLowerCase().includes("insufficient token balance")) {
             await supabase.from('ads').update({ status: 'payment_failed' }).eq('id', adId);
             toast({ title: "Token Tidak Cukup", description: "Pengurangan token gagal. Iklan disimpan sebagai draf.", variant: "destructive" });
          } else if (error.message.includes("relation \"public.ads\" does not exist") || error.message.includes("relation \"public.categories\" does not exist") || error.message.includes("relation \"public.user_tokens\" does not exist")) {
            toast({ title: "Fitur Belum Siap", description: "Satu atau lebih tabel (iklan, kategori, token) belum ada. Harap hubungi admin.", variant: "destructive" });
          } else {
            toast({ title: "Gagal Memasang Iklan", description: error.message, variant: "destructive" });
          }
        } finally {
          setIsSubmitting(false);
        }
      };
      
      if (authLoading || (!isAuthenticated && !authLoading && !supabase)) {
        return (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mb-4"
            />
            <p className="text-lg text-muted-foreground">Memuat data pengguna...</p>
          </div>
        );
      }

      if (isLoadingData && supabase) {
         return (
          <div className="flex justify-center items-center min-h-[calc(100vh-200px)]">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full"
            />
             <p className="text-lg text-muted-foreground ml-4">Memuat data formulir...</p>
          </div>
        );
      }

      if (!supabase) {
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="py-8 max-w-2xl mx-auto"
          >
            <Card className="card-cheerful">
              <CardHeader>
                <CardTitle className="text-3xl font-bold gradient-text text-center">Pasang Iklan Baru</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center justify-center text-center p-8">
                <AlertTriangle size={48} className="text-yellow-500 mb-4" />
                <p className="text-xl text-muted-foreground">Layanan Pasang Iklan Tidak Tersedia</p>
                <p className="text-sm text-slate-400 mt-1">Fitur ini tidak dapat dimuat karena koneksi ke database belum dikonfigurasi.</p>
                <Link to="/dashboard" className="text-sm text-primary hover:underline mt-6">
                    Kembali ke Dashboard
                </Link>
              </CardContent>
            </Card>
          </motion.div>
        );
      }

      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="py-8 max-w-2xl mx-auto"
        >
          <Card className="card-cheerful">
            <CardHeader>
              <CardTitle className="text-3xl font-bold gradient-text text-center">Pasang Iklan Baru</CardTitle>
              <CardDescription className="text-center text-muted-foreground">
                Bagikan barang atau jasamu kepada ribuan pengguna di Makassar. Saldo token Anda: <span className="font-bold text-primary">{userTokens}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <AdFormFields
                  title={title} onTitleChange={(e) => setTitle(e.target.value)}
                  categoryId={categoryId} onCategoryChange={setCategoryId}
                  price={price} onPriceChange={(e) => setPrice(e.target.value)}
                  description={description} onDescriptionChange={(e) => setDescription(e.target.value)}
                  location={location} onLocationChange={(e) => setLocation(e.target.value)}
                  categories={categories}
                  disabled={!supabase}
                />
                
                <ImageUploadPreview
                  imagePreviews={imagePreviews}
                  imageFiles={imageFiles}
                  onImageUpload={handleImageUpload}
                  onRemoveImage={removeImage}
                  disabled={!supabase}
                />

                <DurationSelector
                  durationDays={currentDurationDays}
                  onDurationChange={setCurrentDurationDays}
                  tokenCost={tokenCost}
                  disabled={!supabase}
                />

                <Button type="submit" size="lg" className="w-full friendly-button flex items-center group" disabled={isSubmitting || isLoadingData || authLoading || !supabase}>
                  {isSubmitting ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                      />
                      Memasang Iklan...
                    </>
                  ) : (
                    <>
                      Pasang Iklan ({tokenCost} Token)
                      <Send size={18} className="ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter>
              <p className="text-xs text-muted-foreground text-center w-full">
                Dengan memasang iklan, Anda setuju dengan Syarat & Ketentuan kami.
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      );
    };

    export default PostAdPage;