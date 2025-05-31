import React, { useState } from 'react';
    import { Input } from '@/components/ui/input';
    import { Button } from '@/components/ui/button';
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
    import { motion } from 'framer-motion';
    import { Send, AlertTriangle } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { useAuth } from '@/contexts/AuthContext';
    import { supabase } from '@/lib/supabaseClient';

    const CommentSection = ({ articleId, comments, onAddComment }) => {
      const [newComment, setNewComment] = useState('');
      const { toast } = useToast();
      const { user, isAuthenticated } = useAuth();
      const [isSubmitting, setIsSubmitting] = useState(false);

      const handleAddComment = async () => {
        if (!supabase) {
          toast({ title: "Layanan Tidak Tersedia", description: "Fitur komentar tidak aktif. Database tidak terhubung.", variant: "destructive"});
          return;
        }
        if (!isAuthenticated || !user) {
          toast({ title: "Harap Login", description: "Anda perlu login untuk berkomentar.", variant: "destructive"});
          return;
        }
        if (!newComment.trim()) {
          toast({ title: "Komentar Kosong", description: "Harap isi komentar Anda.", variant: "destructive"});
          return;
        }
        setIsSubmitting(true);
        try {
          const { data, error } = await supabase
            .from('news_comments')
            .insert({ article_id: articleId, user_id: user.id, content: newComment })
            .select(`
              *,
              profile:user_id (full_name, avatar_url)
            `)
            .single();
          
          if (error) throw error;
          
          onAddComment(data); 
          setNewComment('');
          toast({ title: "Komentar Ditambahkan!", className: "bg-green-600 text-white border-none" });
        } catch (error) {
          console.error("Error adding comment:", error);
          toast({ title: "Gagal Menambah Komentar", description: error.message, variant: "destructive" });
        } finally {
          setIsSubmitting(false);
        }
      };

      return (
        <div className="mt-4 pt-4 border-t border-border">
          <h4 className="text-md font-semibold text-foreground mb-2">Komentar ({comments.length})</h4>
          <div className="space-y-3 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
            {comments.map((comment, index) => (
              <motion.div 
                key={comment.id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start space-x-2"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={comment.profile?.avatar_url || `https://avatar.iran.liara.run/public/${index % 2 === 0 ? 'boy' : 'girl'}`} alt={comment.profile?.full_name || 'User'} />
                  <AvatarFallback>{(comment.profile?.full_name || 'U').substring(0,1)}</AvatarFallback>
                </Avatar>
                <div className="bg-input p-2 rounded-lg flex-1">
                  <p className="text-xs font-semibold text-primary">{comment.profile?.full_name || 'Pengguna Juma'}</p>
                  <p className="text-sm text-foreground">{comment.content}</p>
                  <p className="text-xs text-muted-foreground mt-1">{new Date(comment.created_at).toLocaleString('id-ID')}</p>
                </div>
              </motion.div>
            ))}
            {comments.length === 0 && <p className="text-sm text-muted-foreground">Belum ada komentar.</p>}
          </div>
          {isAuthenticated && supabase && (
            <div className="mt-3 flex space-x-2">
              <Input 
                value={newComment} 
                onChange={(e) => setNewComment(e.target.value)} 
                placeholder="Tulis komentar..." 
                className="input-modern flex-grow"
                disabled={isSubmitting || !user}
              />
              <Button onClick={handleAddComment} size="icon" className="friendly-button aspect-square" disabled={isSubmitting || !user}>
                {isSubmitting ? <motion.div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={18} />}
              </Button>
            </div>
          )}
          {isAuthenticated && !supabase && (
             <div className="mt-3 flex items-center text-yellow-500 bg-yellow-500/10 p-2 rounded-md text-sm">
                <AlertTriangle size={16} className="mr-2"/> Fitur komentar tidak tersedia saat ini.
            </div>
          )}
          {!isAuthenticated && (
            <p className="text-sm text-muted-foreground mt-3">Silakan <a href="/login" className="text-primary hover:underline">login</a> untuk berkomentar.</p>
          )}
        </div>
      );
    };
    export default CommentSection;