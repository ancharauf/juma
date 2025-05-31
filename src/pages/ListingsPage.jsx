import React, { useState, useEffect, useCallback } from 'react';
    import { supabase } from '@/lib/supabaseClient';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { motion, AnimatePresence } from 'framer-motion';
    import { Search, Tag, MapPin, PhoneOutgoing, User, AlertTriangle, MessageSquare } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';

    const ListingsPage = () => {
      const [ads, setAds] = useState([]);
      const [categories, setCategories] = useState([]);
      const [searchTerm, setSearchTerm] = useState('');
      const [selectedCategory, setSelectedCategory] = useState(undefined); 
      const [loading, setLoading] = useState(true);
      const { toast } = useToast();

      const formatPhoneNumberForWhatsApp = (phoneNumber) => {
        if (!phoneNumber) return null;
        let cleaned = phoneNumber.replace(/\D/g, ''); 
        if (cleaned.startsWith('0')) {
          cleaned = '62' + cleaned.substring(1);
        } else if (!cleaned.startsWith('62')) {
          cleaned = '62' + cleaned;
        }
        return cleaned;
      };

      const fetchAdsAndCategories = useCallback(async () => {
        if (!supabase) {
          setLoading(false);
          setAds([]);
          setCategories([]);
          toast({ title: "Layanan Tidak Tersedia", description: "Fitur pencarian iklan tidak aktif. Database tidak terhubung.", variant: "destructive", duration: 5000 });
          return;
        }
        setLoading(true);
        try {
          let adsQuery = supabase
            .from('ads')
            .select(`
              id,
              title,
              description,
              price,
              location,
              condition,
              image_urls,
              created_at,
              category:category_id (id, name),
              profile:user_id (id, full_name, email, phone_number) 
            `)
            .eq('status', 'active')
            .order('created_at', { ascending: false });

          if (searchTerm) {
            adsQuery = adsQuery.ilike('title', `%${searchTerm}%`);
          }
          if (selectedCategory) { 
            adsQuery = adsQuery.eq('category_id', selectedCategory);
          }

          const { data: adsData, error: adsError } = await adsQuery;
          if (adsError) throw adsError;
          setAds(adsData || []);

          const { data: categoriesData, error: categoriesError } = await supabase
            .from('categories')
            .select('id, name')
            .order('name');
          if (categoriesError) throw categoriesError;
          setCategories(categoriesData || []);

        } catch (error) {
          console.error('Error fetching data:', error);
          setAds([]); 
          setCategories([]); 
          toast({
            title: 'Gagal Memuat Data',
            description: error.message,
            variant: 'destructive',
          });
        } finally {
          setLoading(false);
        }
      }, [searchTerm, selectedCategory, toast]);

      useEffect(() => {
        fetchAdsAndCategories();
      }, [fetchAdsAndCategories]);

      const handleWhatsAppClick = (phoneNumber, adTitle) => {
        const formattedNumber = formatPhoneNumberForWhatsApp(phoneNumber);
        if (formattedNumber) {
          const message = encodeURIComponent(`Halo, saya tertarik dengan iklan Anda "${adTitle}" di Juma.`);
          window.open(`https://wa.me/${formattedNumber}?text=${message}`, '_blank');
        } else {
          toast({
            title: 'Nomor Tidak Tersedia',
            description: 'Penjual ini belum mencantumkan nomor WhatsApp.',
            variant: 'destructive',
          });
        }
      };
      
      if (!supabase && !loading) {
        return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="container mx-auto px-4 py-8"
          >
            <header className="mb-12 text-center">
              <h1 className="text-5xl font-extrabold mb-4 gradient-text">Temukan Kebutuhanmu</h1>
              <p className="text-xl text-muted-foreground">
                Jelajahi ribuan iklan menarik dari seluruh Makassar.
              </p>
            </header>
            <div className="flex flex-col items-center justify-center text-center p-4 card-cheerful min-h-[300px]">
              <AlertTriangle size={64} className="text-yellow-500 mb-4" />
              <h2 className="text-3xl font-bold text-foreground mb-2">Layanan Iklan Tidak Tersedia</h2>
              <p className="text-muted-foreground">Fitur ini tidak dapat dimuat karena koneksi ke database belum dikonfigurasi.</p>
            </div>
           </motion.div>
        );
      }


      return (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 py-8"
        >
          <header className="mb-12 text-center">
            <h1 className="text-5xl font-extrabold mb-4 gradient-text">Temukan Kebutuhanmu</h1>
            <p className="text-xl text-muted-foreground">
              Jelajahi ribuan iklan menarik dari seluruh Makassar.
            </p>
          </header>

          <div className="mb-8 p-6 bg-slate-800/60 rounded-xl shadow-2xl backdrop-blur-md border border-slate-700/50">
            <div className="grid md:grid-cols-3 gap-4 items-end">
              <div className="md:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-slate-300 mb-1">
                  Cari Iklan
                </label>
                <div className="relative">
                  <Input
                    id="search"
                    type="text"
                    placeholder="Contoh: Mobil Bekas, Jasa Desain..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-modern pl-10"
                    disabled={!supabase || loading}
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-300 mb-1">
                  Kategori
                </label>
                <Select 
                  value={selectedCategory} 
                  onValueChange={(value) => setSelectedCategory(value === "all_categories" ? undefined : value)}
                  disabled={!supabase || categories.length === 0 || loading}
                >
                  <SelectTrigger className="input-modern">
                    <SelectValue placeholder="Semua Kategori" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700 text-slate-200">
                    <SelectItem value="all_categories" className="hover:bg-slate-700">Semua Kategori</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id} className="hover:bg-slate-700">
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {loading && supabase ? (
            <div className="flex justify-center items-center py-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full"
              />
            </div>
          ) : (
            <AnimatePresence>
              {ads.length > 0 && supabase ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
                  {ads.map((ad, index) => (
                    <motion.div
                      key={ad.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      layout
                    >
                      <Card className="card-cheerful h-full flex flex-col overflow-hidden transform hover:scale-[1.02] transition-transform duration-300 ease-out">
                        <CardHeader className="p-0 relative">
                          <div className="aspect-video bg-slate-700 overflow-hidden">
                            <img 
                              alt={ad.title || "Gambar iklan"}
                              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"  src="https://images.unsplash.com/photo-1698297249527-3b21afc862fe" />
                          </div>
                          <div className="absolute top-2 right-2 bg-primary/80 text-primary-foreground text-xs font-semibold px-2 py-1 rounded-full backdrop-blur-sm">
                            {ad.category?.name || 'Tanpa Kategori'}
                          </div>
                        </CardHeader>
                        <CardContent className="pt-4 flex-grow">
                          <CardTitle className="text-lg font-semibold mb-1 text-primary-foreground hover:text-primary transition-colors">
                            {ad.title}
                          </CardTitle>
                          <CardDescription className="text-sm text-muted-foreground mb-2 line-clamp-2">
                            {ad.description}
                          </CardDescription>
                          <p className="text-lg font-bold text-primary mb-2">
                            Rp {Number(ad.price).toLocaleString('id-ID')}
                          </p>
                          <div className="flex items-center text-xs text-muted-foreground mb-1">
                            <MapPin size={14} className="mr-1.5 text-primary/80" />
                            {ad.location || 'Makassar'}
                          </div>
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Tag size={14} className="mr-1.5 text-primary/80" />
                            Kondisi: {ad.condition || 'Tidak disebutkan'}
                          </div>
                           <div className="flex items-center text-xs text-muted-foreground mt-1">
                            <User size={14} className="mr-1.5 text-primary/80" />
                            Penjual: {ad.profile?.full_name || ad.profile?.email || 'Anonim'}
                          </div>
                        </CardContent>
                        <CardFooter className="pt-3 border-t border-slate-700/50 flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                          <Button 
                            variant="outline" 
                            className="friendly-button-outline w-full sm:flex-1 text-sm"
                            onClick={() => handleWhatsAppClick(ad.profile?.phone_number, ad.title)}
                            disabled={!ad.profile?.phone_number || !supabase}
                          >
                            <PhoneOutgoing size={16} className="mr-2" /> Hubungi via WhatsApp
                          </Button>
                        </CardFooter>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              ) : (
                !loading && supabase && ads.length === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center py-12"
                  >
                    <MessageSquare size={64} className="mx-auto text-muted-foreground mb-4" />
                    <p className="text-xl text-muted-foreground">
                      Belum ada iklan yang sesuai dengan pencarian Anda.
                    </p>
                    <p className="text-sm text-slate-400 mt-2">
                      Coba kata kunci atau kategori lain.
                    </p>
                  </motion.div>
                )
              )}
            </AnimatePresence>
          )}
        </motion.div>
      );
    };

    export default ListingsPage;