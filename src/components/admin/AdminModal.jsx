import React, { useState, useEffect } from 'react';
    import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Textarea } from '@/components/ui/textarea';
    import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
    import { motion } from 'framer-motion';

    const AdminModal = ({ isOpen, onClose, modalType, item, onSave, categories, currentUser }) => {
      const [formData, setFormData] = useState({});
      const [isSubmitting, setIsSubmitting] = useState(false);

      useEffect(() => {
        if (item) {
          setFormData({ ...item });
        } else {
          // Default form data for new items
          if (modalType === 'user') setFormData({ full_name: '', email: '', password: '', is_admin: false });
          else if (modalType === 'ad') setFormData({ title: '', description: '', price: 0, category_id: undefined, location: '', image_urls: [], user_id: currentUser?.id, duration_days: 7, token_cost: 5, is_active: true });
          else if (modalType === 'news') setFormData({ title: '', category: '', excerpt: '', content: '', author_id: currentUser?.id, image_url: '', status: 'published' });
          else if (modalType === 'category') setFormData({ name: '' });
          else if (modalType === 'token_package') setFormData({ name: '', tokens_amount: 0, price: 0, description: '', is_active: true });
          else setFormData({});
        }
      }, [item, modalType, categories, currentUser]);

      const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) : value) }));
      };

      const handleSelectChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
      };

      const handleSubmit = async () => {
        setIsSubmitting(true);
        const success = await onSave(formData);
        setIsSubmitting(false);
        if (success) {
          onClose();
        }
      };

      const renderFormFields = () => {
        switch (modalType) {
          case 'user':
            return (
              <>
                <DialogHeader>
                  <DialogTitle>{item ? 'Edit Pengguna' : 'Tambah Pengguna (Tidak Tersedia)'}</DialogTitle>
                  <DialogDescription>Kelola informasi pengguna. Fitur tambah pengguna baru tidak tersedia saat ini, silakan edit pengguna yang ada.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Label htmlFor="full_name">Nama Lengkap</Label><Input id="full_name" name="full_name" value={formData.full_name || ''} onChange={handleInputChange} className="input-modern" disabled={!item} />
                  <Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleInputChange} className="input-modern" disabled />
                  <div className="flex items-center space-x-2"><Input type="checkbox" id="is_admin" name="is_admin" checked={formData.is_admin || false} onChange={handleInputChange} disabled={!item} /><Label htmlFor="is_admin">Jadikan Admin?</Label></div>
                </div>
              </>
            );
          case 'ad':
            return (
              <>
                <DialogHeader><DialogTitle>{item ? 'Edit Iklan' : 'Tambah Iklan'}</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                  <Label htmlFor="title">Judul</Label><Input id="title" name="title" value={formData.title || ''} onChange={handleInputChange} className="input-modern" />
                  <Label htmlFor="description">Deskripsi</Label><Textarea id="description" name="description" value={formData.description || ''} onChange={handleInputChange} className="input-modern" />
                  <Label htmlFor="price">Harga (Rp)</Label><Input type="number" id="price" name="price" value={formData.price || 0} onChange={handleInputChange} className="input-modern" />
                  <Label htmlFor="location">Lokasi</Label><Input id="location" name="location" value={formData.location || ''} onChange={handleInputChange} className="input-modern" />
                  <Label htmlFor="category_id">Kategori</Label>
                  <Select name="category_id" value={formData.category_id} onValueChange={(value) => handleSelectChange('category_id', value)}>
                    <SelectTrigger className="input-modern"><SelectValue placeholder="Pilih Kategori" /></SelectTrigger>
                    <SelectContent>{categories.map(cat => <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>)}
                    {categories.length === 0 && <SelectItem value="no_cat_placeholder_modal" disabled>Tidak ada kategori</SelectItem>}
                    </SelectContent>
                  </Select>
                  <Label htmlFor="duration_days">Durasi (hari)</Label><Input type="number" id="duration_days" name="duration_days" value={formData.duration_days || 7} onChange={handleInputChange} className="input-modern" />
                  <Label htmlFor="token_cost">Biaya Token</Label><Input type="number" id="token_cost" name="token_cost" value={formData.token_cost || 5} onChange={handleInputChange} className="input-modern" />
                  <div className="flex items-center space-x-2"><Input type="checkbox" id="is_active" name="is_active" checked={formData.is_active === undefined ? true : formData.is_active} onChange={handleInputChange} /><Label htmlFor="is_active">Aktif?</Label></div>
                  <Label htmlFor="image_urls">URL Gambar (pisahkan dengan koma jika lebih dari satu)</Label><Input id="image_urls" name="image_urls" value={Array.isArray(formData.image_urls) ? formData.image_urls.join(',') : (formData.image_urls || '')} onChange={(e) => setFormData(prev => ({...prev, image_urls: e.target.value.split(',')}))} className="input-modern" />
                </div>
              </>
            );
          case 'news':
            return (
              <>
                <DialogHeader><DialogTitle>{item ? 'Edit Berita' : 'Tambah Berita'}</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                  <Label htmlFor="title">Judul</Label><Input id="title" name="title" value={formData.title || ''} onChange={handleInputChange} className="input-modern" />
                  <Label htmlFor="category">Kategori Berita</Label><Input id="category" name="category" value={formData.category || ''} onChange={handleInputChange} className="input-modern" />
                  <Label htmlFor="excerpt">Kutipan</Label><Textarea id="excerpt" name="excerpt" value={formData.excerpt || ''} onChange={handleInputChange} className="input-modern" />
                  <Label htmlFor="content">Konten Lengkap</Label><Textarea id="content" name="content" value={formData.content || ''} onChange={handleInputChange} className="input-modern min-h-[150px]" />
                  <Label htmlFor="image_url">URL Gambar</Label><Input id="image_url" name="image_url" value={formData.image_url || ''} onChange={handleInputChange} className="input-modern" />
                  <Label htmlFor="status">Status</Label>
                  <Select name="status" value={formData.status || 'published'} onValueChange={(value) => handleSelectChange('status', value)}>
                    <SelectTrigger className="input-modern"><SelectValue placeholder="Pilih Status" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            );
          case 'category':
            return (
              <>
                <DialogHeader><DialogTitle>{item ? 'Edit Kategori' : 'Tambah Kategori'}</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4">
                  <Label htmlFor="name">Nama Kategori</Label><Input id="name" name="name" value={formData.name || ''} onChange={handleInputChange} className="input-modern" />
                </div>
              </>
            );
          case 'token_package':
            return (
              <>
                <DialogHeader><DialogTitle>{item ? 'Edit Paket Token' : 'Tambah Paket Token'}</DialogTitle></DialogHeader>
                <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto custom-scrollbar pr-2">
                  <Label htmlFor="name">Nama Paket</Label><Input id="name" name="name" value={formData.name || ''} onChange={handleInputChange} className="input-modern" />
                  <Label htmlFor="tokens_amount">Jumlah Token</Label><Input type="number" id="tokens_amount" name="tokens_amount" value={formData.tokens_amount || 0} onChange={handleInputChange} className="input-modern" />
                  <Label htmlFor="price">Harga (IDR)</Label><Input type="number" id="price" name="price" value={formData.price || 0} onChange={handleInputChange} className="input-modern" />
                  <Label htmlFor="description">Deskripsi</Label><Textarea id="description" name="description" value={formData.description || ''} onChange={handleInputChange} className="input-modern" />
                  <div className="flex items-center space-x-2"><Input type="checkbox" id="is_active" name="is_active" checked={formData.is_active === undefined ? true : formData.is_active} onChange={handleInputChange} /><Label htmlFor="is_active">Aktif?</Label></div>
                </div>
              </>
            );
          default:
            return <p>Tipe modal tidak dikenal.</p>;
        }
      };

      return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
          <DialogContent className="sm:max-w-lg bg-slate-800 border-slate-700 text-slate-200">
            {renderFormFields()}
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" className="border-slate-600 hover:bg-slate-700" disabled={isSubmitting}>Batal</Button>
              </DialogClose>
              <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700 text-white" disabled={isSubmitting || (modalType === 'user' && !item)}>
                {isSubmitting ? <motion.div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" /> : null}
                {isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      );
    };

    export default AdminModal;