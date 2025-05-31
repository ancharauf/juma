import React, { useState, useEffect, useCallback } from 'react';
    import { motion } from 'framer-motion';
    import { Rss, AlertTriangle } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { useAuth } from '@/contexts/AuthContext';
    import { supabase } from '@/lib/supabaseClient';
    import NewsCard from '@/components/news/NewsCard';
    import AdminNewsUpload from '@/components/news/AdminNewsUpload';
    import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

    const NewsPage = () => {
      const [newsArticles, setNewsArticles] = useState([]);
      const [isLoading, setIsLoading] = useState(true);
      const { isAdmin } = useAuth(); 
      const { toast } = useToast();

      const fetchNews = useCallback(async () => {
        if (!supabase) {
          setIsLoading(false);
          setNewsArticles([]);
          toast({ title: "Layanan Tidak Tersedia", description: "Fitur berita tidak aktif. Database tidak terhubung.", variant: "destructive", duration: 5000 });
          return;
        }
        setIsLoading(true);
        try {
          const { data, error } = await supabase
            .from('news_articles')
            .select(`
              *,
              author:author_id (full_name, avatar_url),
              news_comments (count)
            `)
            .eq('status', 'published')
            .order('published_at', { ascending: false });
          
          if (error) throw error;
          
          const articlesWithCommentCount = data.map(article => ({
            ...article,
            comment_count: article.news_comments && article.news_comments.length > 0 ? article.news_comments[0].count : 0
          }));
          setNewsArticles(articlesWithCommentCount || []);

        } catch (error) {
          console.error("Error fetching news:", error);
          setNewsArticles([]);
          toast({ title: "Gagal Memuat Berita", description: error.message, variant: "destructive"});
        } finally {
          setIsLoading(false);
        }
      }, [toast]);

      useEffect(() => {
        fetchNews();
      }, [fetchNews]);
      
      const handleAddNewsToList = (newArticleFull) => {
         const newArticleWithCommentCount = {
          ...newArticleFull,
          comment_count: 0 
        };
        setNewsArticles(prevNews => [newArticleWithCommentCount, ...prevNews]);
      };

      const handleCommentAddedToArticle = (articleId, newComment) => {
        setNewsArticles(prevArticles => 
          prevArticles.map(article => 
            article.id === articleId 
              ? { ...article, comment_count: (article.comment_count || 0) + 1 }
              : article
          )
        );
      };

      if (isLoading && supabase) {
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

      if (!supabase && !isLoading) {
        return (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="py-8"
          >
            <div className="text-center mb-12">
              <Rss size={48} className="mx-auto text-yellow-500 mb-4" />
              <h1 className="text-4xl md:text-5xl font-extrabold gradient-text mb-3">Juma Info Terkini</h1>
            </div>
            <div className="flex flex-col items-center justify-center text-center p-4 card-cheerful min-h-[300px]">
              <AlertTriangle size={64} className="text-yellow-500 mb-4" />
              <h2 className="text-3xl font-bold text-foreground mb-2">Layanan Berita Tidak Tersedia</h2>
              <p className="text-muted-foreground">Fitur ini tidak dapat dimuat karena koneksi ke database belum dikonfigurasi.</p>
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
            <Rss size={48} className="mx-auto text-primary mb-4" />
            <h1 className="text-4xl md:text-5xl font-extrabold gradient-text mb-3">Juma Info Terkini</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Dapatkan berita, event, dan informasi terbaru seputar Kota Makassar langsung di sini!
            </p>
          </div>
          
          {isAdmin && supabase && <AdminNewsUpload onAddNews={handleAddNewsToList} />}
          {isAdmin && !supabase && (
              <Card className="card-cheerful mb-12">
                 <CardHeader>
                    <CardTitle className="text-2xl gradient-text">Unggah Berita Baru</CardTitle>
                 </CardHeader>
                 <CardContent className="flex flex-col items-center justify-center text-center p-8">
                    <AlertTriangle size={32} className="text-yellow-500 mb-2" />
                    <p className="text-muted-foreground text-sm">Fitur unggah berita tidak tersedia (database tidak terhubung).</p>
                 </CardContent>
              </Card>
          )}


          {newsArticles.length > 0 && supabase ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {newsArticles.map((article, index) => (
                <NewsCard key={article.id} article={article} index={index} onCommentAdded={handleCommentAddedToArticle} />
              ))}
            </div>
          ) : (
            !isLoading && supabase && newsArticles.length === 0 && (
              <div className="text-center py-16">
                <p className="text-muted-foreground">Belum ada berita untuk ditampilkan saat ini.</p>
              </div>
            )
          )}
          
        </motion.div>
      );
    };

    export default NewsPage;