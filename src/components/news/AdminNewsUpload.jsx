import React, { useState } from 'react';
    import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Textarea } from '@/components/ui/textarea';
    import { Label } from '@/components/ui/label';
    import { motion } from 'framer-motion';
    import { UploadCloud, Send, AlertTriangle } from 'lucide-react';
    import { useToast } from '@/components/ui/use-toast';
    import { useAuth } from '@/contexts/AuthContext';
    import { supabase } from '@/lib/supabaseClient';

    const AdminNewsUpload = ({ onAddNews }) => {
      const [title, setTitle] = useState('');
      const [category, setCategory] = useState('');
      const [excerpt, setExcerpt] = useState('');
      const [content, setContent] = useState('');
      const [imageFile, setImageFile] = useState(null);
      const [isSubmitting, setIsSubmitting] = useState(false);
      const { toast } = useToast();
      const { user } = useAuth();

      const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file && file.size > 5 * 1024 * 1024) {
            toast({ title: "Ukuran Gambar Terlalu Besar", description: "Maksimal ukuran gambar 5MB.", variant: "destructive" });
            setImageFile(null);
            e.target.value = null; 
            return;
        }
        setImageFile(file);
      };
      
      const generateSlug = (title) => {
        return title
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '') 
          .replace(/\s+/g, '-')        
          .replace(/-+/g, '-');        
      };


      const handleSubmit = async (e) => {
        e.preventDefault();
        if (!supabase) {
          toast({ title: "Layanan Tidak Tersedia", description: "Fitur unggah berita tidak aktif. Database tidak terhubung.", variant: "destructive"});
          return;
        }
        if (!title || !category || !excerpt || !content || !user) {
          toast({ title: "Form Tidak Lengkap", description: "Harap isi semua field berita dan pastikan Anda login.", variant: "destructive"});
          return;
        }
        setIsSubmitting(true);
        let imageUrl = null;

        try {
          if (imageFile) {
            const fileName = `news_images/${user.id}/${Date.now()}_${imageFile.name}`;
            const { data: uploadData, error: uploadError } = await supabase.storage
              .from('general_storage') 
              .upload(fileName, imageFile);
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('general_storage').getPublicUrl(uploadData.path);
            imageUrl = publicUrl;
          }

          const slug = generateSlug(title);

          const { data: newsData, error: newsError } = await supabase
            .from('news_articles')
            .insert({
              author_id: user.id,
              title,
              slug,
              category,
              excerpt,
              content,
              image_url: imageUrl,
              status: 'published',
              published_at: new Date().toISOString()
            })
            .select(`
              *,
              author:author_id (full_name, avatar_url)
            `)
            .single();
          
          if (newsError) throw newsError;
          
          onAddNews(newsData);
          setTitle(''); setCategory(''); setExcerpt(''); setContent(''); setImageFile(null);
          const fileInput = document.getElementById('newsImageAdmin');
          if (fileInput) fileInput.value = null;
          toast({ title: "Berita Ditambahkan!", description: `Berita "${title}" berhasil diunggah.`, className: "bg-green-600 text-white border-none"});

        } catch (error) {
          console.error("Error uploading news:", error);
          toast({ title: "Gagal Unggah Berita", description: error.message, variant: "destructive"});
        } finally {
          setIsSubmitting(false);
        }
      };

      if (!supabase) {
        return (
          <Card className="card-cheerful mb-12">
            <CardHeader>
              <CardTitle className="text-2xl gradient-text">Unggah Berita Baru</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center text-center p-8">
              <AlertTriangle size={48} className="text-yellow-500 mb-4" />
              <p className="text-muted-foreground">Fitur unggah berita tidak tersedia.</p>
              <p className="text-sm text-slate-400">Koneksi ke database belum dikonfigurasi.</p>
            </CardContent>
          </Card>
        );
      }

      return (
        <Card className="card-cheerful mb-12">
          <CardHeader>
            <CardTitle className="text-2xl gradient-text">Unggah Berita Baru</CardTitle>
            <CardDescription className="text-muted-foreground">Bagikan informasi terkini kepada pengguna Juma.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Judul Berita" className="input-modern" disabled={isSubmitting} />
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Kategori (e.g., Event, Info Lokal)" className="input-modern" disabled={isSubmitting} />
              <Textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} placeholder="Kutipan Singkat (Ringkasan)" className="input-modern min-h-[80px]" disabled={isSubmitting} />
              <Textarea value={content} onChange={(e) => setContent(e.target.value)} placeholder="Isi Berita Lengkap" className="input-modern min-h-[150px]" disabled={isSubmitting} />
              <div>
                <Label htmlFor="newsImageAdmin" className="text-foreground flex items-center mb-1"><UploadCloud size={16} className="mr-2 text-primary" />Gambar Berita (Opsional, Maks 5MB)</Label>
                <Input id="newsImageAdmin" type="file" accept="image/*" onChange={handleImageUpload} className="input-modern file:text-primary file:bg-input file:border-none file:px-3 file:py-2 file:mr-3 file:rounded-md hover:file:bg-accent/20" disabled={isSubmitting} />
              </div>
              <Button type="submit" className="friendly-button w-full" disabled={isSubmitting || !user}>
                {isSubmitting ? <motion.div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> : <Send size={18} className="mr-2" />}
                {isSubmitting ? 'Mengunggah...' : 'Unggah Berita'}
              </Button>
            </form>
          </CardContent>
        </Card>
      );
    };

    export default AdminNewsUpload;