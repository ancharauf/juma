import React, { useState, useEffect, useCallback } from 'react';
    import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { motion, AnimatePresence } from 'framer-motion';
    import { CalendarDays, ArrowRight, MessageCircle, ThumbsUp, AlertTriangle } from 'lucide-react';
    import CommentSection from '@/components/news/CommentSection';
    import { useToast } from '@/components/ui/use-toast';
    import { supabase } from '@/lib/supabaseClient';


    const NewsCard = ({ article, index, onCommentAdded }) => {
      const [showComments, setShowComments] = useState(false);
      const [comments, setComments] = useState([]);
      const [isLoadingComments, setIsLoadingComments] = useState(false);
      const { toast } = useToast();

      const fetchComments = useCallback(async () => {
        if (!supabase || !article.id) return;
        setIsLoadingComments(true);
        try {
          const { data, error } = await supabase
            .from('news_comments')
            .select(`
              *,
              profile:user_id (full_name, avatar_url)
            `)
            .eq('article_id', article.id)
            .order('created_at', { ascending: false });
          if (error) throw error;
          setComments(data || []);
        } catch (error) {
          console.error("Error fetching comments:", error);
          toast({ title: "Gagal Memuat Komentar", description: error.message, variant: "destructive"});
        } finally {
          setIsLoadingComments(false);
        }
      }, [article.id, toast]);
      
      useEffect(() => {
        if (showComments && supabase) {
          fetchComments();
        } else if (!supabase) {
            setComments([]);
        }
      }, [showComments, fetchComments, supabase]);

      const handleNewComment = (newCommentFull) => {
        setComments(prev => [newCommentFull, ...prev]); 
        if (onCommentAdded) onCommentAdded(article.id, newCommentFull);
      };
      
      const displayImageUrl = article.image_url || "https://images.unsplash.com/photo-1595872018818-97555653a011";


      return (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
          className="w-full"
        >
          <Card className="card-cheerful overflow-hidden h-full flex flex-col group">
            <CardHeader className="p-0 relative">
              <img 
                alt={article.title} 
                className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-300"  src="https://images.unsplash.com/photo-1703505238284-00f1d6589c3d" />
              <div className="absolute top-2 left-2 bg-primary/80 text-primary-foreground px-2 py-1 rounded-md text-xs font-semibold backdrop-blur-sm">
                {article.category || 'Info'}
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-grow">
              <CardTitle className="text-xl font-semibold text-foreground mb-2 leading-tight group-hover:text-primary transition-colors cursor-pointer">{article.title}</CardTitle>
              <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{article.excerpt}</p>
              <div className="flex items-center text-xs text-muted-foreground">
                <CalendarDays size={14} className="mr-1 text-primary" /> {new Date(article.published_at || article.created_at).toLocaleDateString('id-ID')} &bull; {article.author?.full_name || 'Admin Juma'}
              </div>
            </CardContent>
            <CardFooter className="p-4 border-t border-border flex flex-col items-start">
              <div className="flex justify-between w-full items-center">
                <Button variant="link" className="text-primary hover:text-accent p-0 h-auto" disabled={!supabase}>
                  Baca Selengkapnya <ArrowRight size={16} className="ml-1" />
                </Button>
                <div className="flex items-center space-x-3">
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" disabled={!supabase}>
                    <ThumbsUp size={18} />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-primary" onClick={() => supabase && setShowComments(!showComments)} disabled={!supabase}>
                    <MessageCircle size={18} /> <span className="ml-1 text-xs">{comments.length > 0 ? comments.length : article.comment_count || 0}</span>
                  </Button>
                </div>
              </div>
              <AnimatePresence>
                {showComments && supabase && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="w-full overflow-hidden"
                  >
                  {isLoadingComments ? <p className="text-sm text-muted-foreground py-2">Memuat komentar...</p> : 
                    <CommentSection articleId={article.id} comments={comments} onAddComment={handleNewComment} />
                  }
                  </motion.div>
                )}
                 {showComments && !supabase && (
                     <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="w-full overflow-hidden mt-2 p-3 bg-yellow-500/10 rounded-md text-yellow-500 text-sm flex items-center"
                    >
                        <AlertTriangle size={16} className="mr-2"/> Fitur komentar tidak tersedia (database tidak terhubung).
                    </motion.div>
                 )}
              </AnimatePresence>
            </CardFooter>
          </Card>
        </motion.div>
      );
    };

    export default NewsCard;