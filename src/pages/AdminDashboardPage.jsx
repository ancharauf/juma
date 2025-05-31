import React, { useEffect, useState, useCallback } from 'react';
    import { useNavigate } from 'react-router-dom';
    import { useAuth } from '@/contexts/AuthContext';
    import { useToast } from '@/components/ui/use-toast';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { ShieldCheck, Users, FileText, Coins, BarChart3, Tag, Newspaper, AlertTriangle } from 'lucide-react';
    import { motion } from 'framer-motion';
    import { supabase } from '@/lib/supabaseClient';
    import AdminModal from '@/components/admin/AdminModal';
    import AdminSectionCard from '@/components/admin/AdminSectionCard';

    const ADMIN_EMAIL = 'amanahdigitalstudio@gmail.com';

    const AdminDashboardPage = () => {
      const { isAdmin, user, loading: authLoading, isAuthenticated } = useAuth();
      const navigate = useNavigate();
      const { toast } = useToast();

      const [usersData, setUsersData] = useState([]);
      const [ads, setAds] = useState([]);
      const [news, setNews] = useState([]);
      const [categories, setCategories] = useState([]);
      const [tokenPackages, setTokenPackages] = useState([]);
      const [transactions, setTransactions] = useState([]);
      
      const [modalOpen, setModalOpen] = useState(false);
      const [modalType, setModalType] = useState(''); 
      const [editingItem, setEditingItem] = useState(null);
      const [isLoadingData, setIsLoadingData] = useState(true); 
      
      const fetchData = useCallback(async () => {
        if (!supabase || !user || !isAdmin) {
          setIsLoadingData(false); 
          if (!supabase) {
            toast({ title: "Layanan Admin Tidak Tersedia", description: "Koneksi ke database belum dikonfigurasi.", variant: "destructive", duration: 5000 });
          }
          return;
        }
        
        setIsLoadingData(true);
        try {
          const [
            usersRes, adsRes, newsRes, categoriesRes, tokenPackagesRes, transactionsRes
          ] = await Promise.all([
            supabase.from('profiles').select('id, full_name, email, is_admin, created_at').neq('id', user.id),
            supabase.from('ads').select('*, category:category_id(id, name), profile:user_id(id, full_name, email)').order('created_at', { ascending: false }),
            supabase.from('news_articles').select('*, author:author_id(id, full_name, email)').order('created_at', { ascending: false }),
            supabase.from('categories').select('*').order('name'),
            supabase.from('token_packages').select('*').order('price'),
            supabase.from('transactions').select('*, user:user_id(id, full_name, email), package:package_id(id, name)').order('created_at', { ascending: false })
          ]);

          if (usersRes.error) throw usersRes.error;
          setUsersData(usersRes.data || []);
          
          if (adsRes.error) throw adsRes.error;
          setAds(adsRes.data || []);

          if (newsRes.error) throw newsRes.error;
          setNews(newsRes.data || []);

          if (categoriesRes.error) throw categoriesRes.error;
          setCategories(categoriesRes.data || []);

          if (tokenPackagesRes.error) throw tokenPackagesRes.error;
          setTokenPackages(tokenPackagesRes.data || []);

          if (transactionsRes.error) throw transactionsRes.error;
          setTransactions(transactionsRes.data || []);

        } catch (error) {
          console.error("AdminDashboardPage: Error fetching admin data:", error);
          toast({ title: "Gagal memuat data admin", description: error.message, variant: "destructive" });
        } finally {
          setIsLoadingData(false);
        }
      }, [toast, user, isAdmin]); 

      useEffect(() => {
        if (!authLoading) { 
            if (!isAuthenticated) {
                toast({
                    title: "Akses Ditolak",
                    description: "Anda harus login untuk mengakses halaman ini.",
                    variant: "destructive",
                });
                navigate('/login', { replace: true });
            } else if (!isAdmin) {
                 toast({
                    title: "Akses Ditolak",
                    description: "Anda tidak memiliki izin untuk mengakses halaman admin.",
                    variant: "destructive",
                });
                navigate('/dashboard', { replace: true });
            } else if (supabase) {
                fetchData();
            } else {
                setIsLoadingData(false);
                 setUsersData([]); setAds([]); setNews([]); setCategories([]); setTokenPackages([]); setTransactions([]);
            }
        }
    }, [isAuthenticated, isAdmin, authLoading, navigate, toast, fetchData]);


      const openModalHandler = (type, item = null) => {
        if (!supabase) {
             toast({ title: "Fitur Tidak Tersedia", description: "Operasi ini memerlukan koneksi database.", variant: "destructive" });
             return;
        }
        setModalType(type);
        setEditingItem(item);
        setModalOpen(true);
      };

      const closeModalHandler = () => {
        setModalOpen(false);
        setModalType('');
        setEditingItem(null);
      };
      
      const handleSave = async (formDataToSave) => {
        if (!supabase || !user) {
            toast({ title: "Gagal Menyimpan", description: "Koneksi database tidak tersedia.", variant: "destructive" });
            return false;
        }
        
        let tableName = '';
        let successMessage = '';
        let dataToSubmit = { ...formDataToSave };
        let itemDataToUpdate = null;

        try {
            if (modalType === 'user') {
                tableName = 'profiles';
                const profileUpdate = { full_name: formDataToSave.full_name, is_admin: formDataToSave.is_admin };
                if (editingItem?.email === ADMIN_EMAIL && !formDataToSave.is_admin) {
                  toast({ title: "Operasi Ditolak", description: "Tidak dapat mengubah status admin untuk akun admin utama.", variant: "destructive" });
                  return false;
                }
                const { error } = await supabase.from(tableName).update(profileUpdate).eq('id', editingItem.id);
                if (error) throw error;
                successMessage = `Pengguna ${formDataToSave.full_name} diperbarui.`;
            } else if (modalType === 'ad') {
                tableName = 'ads';
                const { id, profile, category, ...adData } = formDataToSave; 
                dataToSubmit = adData;
                itemDataToUpdate = editingItem ? await supabase.from(tableName).update(dataToSubmit).eq('id', editingItem.id).select().single() : await supabase.from(tableName).insert(dataToSubmit).select().single();
                if (itemDataToUpdate.error) throw itemDataToUpdate.error;
                successMessage = `Iklan "${itemDataToUpdate.data.title}" ${editingItem ? 'diperbarui' : 'ditambahkan'}.`;
            } else if (modalType === 'news') {
                tableName = 'news_articles';
                const { id, author, ...newsData } = formDataToSave; 
                dataToSubmit = { ...newsData, author_id: newsData.author_id || user.id }; 
                itemDataToUpdate = editingItem ? await supabase.from(tableName).update(dataToSubmit).eq('id', editingItem.id).select().single() : await supabase.from(tableName).insert(dataToSubmit).select().single();
                if (itemDataToUpdate.error) throw itemDataToUpdate.error;
                successMessage = `Berita "${itemDataToUpdate.data.title}" ${editingItem ? 'diperbarui' : 'ditambahkan'}.`;
            } else if (modalType === 'category') {
                tableName = 'categories';
                const { id, ...catData } = formDataToSave;
                dataToSubmit = catData;
                itemDataToUpdate = editingItem ? await supabase.from(tableName).update(dataToSubmit).eq('id', editingItem.id).select().single() : await supabase.from(tableName).insert(dataToSubmit).select().single();
                if (itemDataToUpdate.error) throw itemDataToUpdate.error;
                successMessage = `Kategori "${itemDataToUpdate.data.name}" ${editingItem ? 'diperbarui' : 'ditambahkan'}.`;
            } else if (modalType === 'token_package') {
                tableName = 'token_packages';
                const { id, ...packageData } = formDataToSave;
                dataToSubmit = packageData;
                itemDataToUpdate = editingItem ? await supabase.from(tableName).update(dataToSubmit).eq('id', editingItem.id).select().single() : await supabase.from(tableName).insert(dataToSubmit).select().single();
                if (itemDataToUpdate.error) throw itemDataToUpdate.error;
                successMessage = `Paket token "${itemDataToUpdate.data.name}" ${editingItem ? 'diperbarui' : 'ditambahkan'}.`;
            }

            toast({ title: "Sukses!", description: successMessage });
            fetchData(); 
            return true; 
        } catch (error) {
            console.error(`Error saving ${modalType}:`, error);
            toast({ title: `Gagal Menyimpan ${modalType}`, description: error.message, variant: "destructive" });
            return false; 
        }
    };


      const handleDelete = async (type, itemToDelete) => {
        if (!supabase) {
          toast({ title: "Layanan Tidak Tersedia", description: "Fitur hapus tidak aktif. Database tidak terhubung.", variant: "destructive"});
          return;
        }
        if (type === 'user' && itemToDelete.email === ADMIN_EMAIL) {
          toast({ title: "Operasi Ditolak", description: "Tidak dapat menghapus akun admin utama.", variant: "destructive"});
          return;
        }
        if (!window.confirm(`Anda yakin ingin menghapus ${type} "${itemToDelete.title || itemToDelete.name || itemToDelete.email || itemToDelete.id}" ini? Tindakan ini tidak dapat diurungkan.`)) {
            return;
        }
        setIsLoadingData(true); 
        try {
          let tableName = '';
          let idField = 'id';

          if (type === 'user') {
            const { error } = await supabase.from('profiles').delete().eq('id', itemToDelete.id);
            if (error) throw error;
            toast({ title: "Pengguna Dihapus", description: "Profil pengguna telah dihapus dari database.", variant: "destructive" });
          } else {
            if (type === 'ad') tableName = 'ads';
            else if (type === 'news') tableName = 'news_articles';
            else if (type === 'category') tableName = 'categories';
            else if (type === 'token_package') tableName = 'token_packages';

            const { error } = await supabase.from(tableName).delete().eq(idField, itemToDelete[idField]);
            if (error) throw error;
            toast({ title: `${type.charAt(0).toUpperCase() + type.slice(1)} Dihapus`, description: `Item telah dihapus.`, variant: "destructive" });
          }
          fetchData();
        } catch (error) {
           console.error(`Error deleting ${type}:`, error);
           toast({ title: `Gagal Menghapus ${type}`, description: error.message, variant: "destructive" });
        } finally {
          setIsLoadingData(false);
        }
      };
      
      const showPageLoading = authLoading || (isAuthenticated && isAdmin && isLoadingData && supabase);

      if (showPageLoading) {
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

      if (!authLoading && (!isAuthenticated || !isAdmin)) {
         return (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
            <p className="text-lg text-muted-foreground mb-4">Mengarahkan atau memverifikasi akses...</p>
             <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full mt-4"
            />
          </div>
        );
      }

      if (!supabase) {
        return (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
            <AlertTriangle size={64} className="text-yellow-500 mb-4" />
            <h1 className="text-3xl font-bold text-foreground mb-2">Layanan Admin Tidak Tersedia</h1>
            <p className="text-muted-foreground">Dashboard admin tidak dapat dimuat karena koneksi ke database belum dikonfigurasi.</p>
            <p className="text-sm text-slate-400 mt-1">Harap hubungkan ke database untuk menggunakan fitur admin.</p>
          </div>
        );
      }

      const adminSectionsConfig = [
        { title: "Manajemen Pengguna", icon: <Users size={24} />, data: usersData, type: 'user', renderItem: (u) => <>{u.full_name || u.email} <span className={`text-xs px-1.5 py-0.5 rounded ${u.is_admin ? 'bg-green-600/70 text-green-100' : 'bg-slate-600/70 text-slate-200'}`}>{u.is_admin ? 'Admin' : 'User'}</span> ({u.email})</> },
        { title: "Manajemen Iklan", icon: <FileText size={24} />, data: ads, type: 'ad', renderItem: (ad) => <>{ad.title} <span className="text-xs text-muted-foreground">(oleh: {ad.profile?.full_name || ad.profile?.email || 'N/A'})</span></> },
        { title: "Manajemen Berita", icon: <Newspaper size={24} />, data: news, type: 'news', renderItem: (n) => <>{n.title} <span className="text-xs text-muted-foreground">(Kategori: {n.category || 'N/A'})</span></> },
        { title: "Kategori Iklan", icon: <Tag size={24} />, data: categories, type: 'category', renderItem: (cat) => cat.name },
        { title: "Paket Token", icon: <Coins size={24} />, data: tokenPackages, type: 'token_package', renderItem: (pkg) => <>{pkg.name} ({pkg.tokens_amount} token) - Rp {Number(pkg.price).toLocaleString('id-ID')}</> },
        { 
          title: "Statistik & Transaksi", 
          icon: <BarChart3 size={24} />, 
          description: "Pantau aktivitas aplikasi.", 
          type: 'stats_transactions',
          customContent: (
            <div className="space-y-3">
              <p className="font-semibold text-blue-400">Statistik Umum:</p>
              <p>Total Pengguna: <span className="font-bold text-blue-300">{usersData.length}</span></p>
              <p>Total Iklan: <span className="font-bold text-blue-300">{ads.length}</span></p>
              <p>Total Artikel Berita: <span className="font-bold text-blue-300">{news.length}</span></p>
              <p className="font-semibold text-blue-400 mt-3">Transaksi Token Terbaru:</p>
              {transactions.length > 0 ? transactions.slice(0,3).map(tx => (
                <div key={tx.id} className="text-xs bg-slate-700/50 p-1.5 rounded">
                  <p>{tx.user?.full_name || tx.user?.email} - {tx.package?.name} ({tx.tokens_purchased} token) - Rp {Number(tx.amount_paid).toLocaleString('id-ID')} - <span className={`capitalize ${tx.status === 'completed' ? 'text-green-400' : 'text-yellow-400'}`}>{tx.status}</span></p>
                  <p className="text-slate-400">{new Date(tx.created_at).toLocaleString('id-ID')}</p>
                </div>
              )) : <p className="text-xs text-slate-400">Belum ada transaksi.</p>}
            </div>
          )
        },
      ];

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="py-8 max-w-7xl mx-auto px-4"
        >
          <div className="text-center mb-12">
            <ShieldCheck size={64} className="mx-auto text-blue-600 mb-4" />
            <h1 className="text-4xl md:text-5xl font-extrabold gradient-text-admin mb-3">Admin Dashboard</h1>
            <p className="text-lg text-muted-foreground">
              Selamat datang, {user?.user_metadata?.full_name || user?.email || 'Admin'}!
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminSectionsConfig.map((section, index) => (
              <AdminSectionCard
                key={section.title}
                section={section}
                index={index}
                onEdit={(item) => openModalHandler(section.type, item)}
                onDelete={(item) => handleDelete(section.type, item)}
                onAdd={() => openModalHandler(section.type, null)}
                currentUserEmail={user?.email} 
                adminEmail={ADMIN_EMAIL}
                isSupabaseConnected={!!supabase}
              />
            ))}
          </div>
          
          {modalOpen && supabase && (
            <AdminModal
              isOpen={modalOpen}
              onClose={closeModalHandler}
              modalType={modalType}
              item={editingItem}
              onSave={handleSave}
              categories={categories} 
              currentUser={user}
            />
          )}
        </motion.div>
      );
    };
    export default AdminDashboardPage;