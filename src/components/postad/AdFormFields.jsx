import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tag, DollarSign, MapPin } from 'lucide-react';

const AdFormFields = ({
  title, onTitleChange,
  categoryId, onCategoryChange,
  price, onPriceChange,
  description, onDescriptionChange,
  location, onLocationChange,
  categories
}) => {
  return (
    <>
      <div>
        <Label htmlFor="title" className="text-foreground flex items-center">
          <Tag size={16} className="mr-2 text-primary" />Judul Iklan
        </Label>
        <Input id="title" value={title} onChange={onTitleChange} placeholder="Contoh: Dijual Cepat Rumah Hook" className="input-modern" required />
      </div>

      <div>
        <Label htmlFor="category" className="text-foreground">Kategori</Label>
        <Select onValueChange={onCategoryChange} value={categoryId}>
          <SelectTrigger className="w-full input-modern">
            <SelectValue placeholder="Pilih Kategori..." />
          </SelectTrigger>
          <SelectContent className="bg-popover border-border text-popover-foreground">
            {categories.length > 0 ? categories.map(cat => (
              <SelectItem key={cat.id} value={cat.id} className="hover:bg-accent/50 focus:bg-accent/50">{cat.name}</SelectItem>
            )) : <SelectItem value="no_category_placeholder" disabled>Tidak ada kategori tersedia</SelectItem>}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="price" className="text-foreground flex items-center">
          <DollarSign size={16} className="mr-2 text-primary" />Harga (Opsional)
        </Label>
        <Input id="price" type="text" value={price} onChange={onPriceChange} placeholder="Contoh: Rp 1.500.000 atau Nego" className="input-modern" />
      </div>

      <div>
        <Label htmlFor="description" className="text-foreground">Deskripsi</Label>
        <Textarea id="description" value={description} onChange={onDescriptionChange} placeholder="Jelaskan detail barang/jasa Anda..." className="input-modern min-h-[120px]" required />
      </div>

      <div>
        <Label htmlFor="location" className="text-foreground flex items-center">
          <MapPin size={16} className="mr-2 text-primary" />Lokasi
        </Label>
        <Input id="location" value={location} onChange={onLocationChange} placeholder="Contoh: Panakkukang, Makassar" className="input-modern" required />
      </div>
    </>
  );
};

export default AdFormFields;