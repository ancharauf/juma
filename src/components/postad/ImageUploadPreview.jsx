import React from 'react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { UploadCloud, XCircle, ImagePlus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const MAX_IMAGE_UPLOADS = 5;

const ImageUploadPreview = ({ imagePreviews, imageFiles, onImageUpload, onRemoveImage }) => {
  return (
    <div>
      <Label htmlFor="images" className="text-foreground flex items-center">
        <UploadCloud size={16} className="mr-2 text-primary" />
        Unggah Gambar (Maks. {MAX_IMAGE_UPLOADS}, Sisa: {MAX_IMAGE_UPLOADS - imageFiles.length})
      </Label>
      <Input
        id="images"
        type="file"
        multiple
        accept="image/*"
        onChange={onImageUpload}
        className="input-modern file:text-primary file:font-semibold file:bg-transparent file:border-none file:px-3 file:py-2 file:mr-3 file:rounded-md hover:file:bg-accent/10 cursor-pointer"
        disabled={imageFiles.length >= MAX_IMAGE_UPLOADS}
      />
      {imageFiles.length >= MAX_IMAGE_UPLOADS && (
        <p className="text-xs text-yellow-500 mt-1">Anda telah mencapai batas maksimal {MAX_IMAGE_UPLOADS} gambar.</p>
      )}
      {imagePreviews.length > 0 && (
        <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {imagePreviews.map((img, index) => (
            <motion.div
              key={img.preview}
              className="relative group aspect-square"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <img-replace src={img.preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover rounded-lg shadow-md border border-border" />
              <Button
                type="button"
                size="icon"
                variant="destructive"
                className="absolute -top-2 -right-2 h-7 w-7 p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
                onClick={() => onRemoveImage(index)}
                aria-label="Hapus gambar"
              >
                <XCircle size={18} />
              </Button>
            </motion.div>
          ))}
        </div>
      )}
      {imageFiles.length < MAX_IMAGE_UPLOADS && imagePreviews.length > 0 && imagePreviews.length < MAX_IMAGE_UPLOADS && (
        <Button
          type="button"
          variant="outline"
          className="mt-3 w-full border-dashed hover:border-primary hover:text-primary"
          onClick={() => document.getElementById('images')?.click()}
          disabled={imageFiles.length >= MAX_IMAGE_UPLOADS}
        >
          <ImagePlus size={16} className="mr-2" /> Tambah Gambar Lain ({MAX_IMAGE_UPLOADS - imageFiles.length} lagi)
        </Button>
      )}
    </div>
  );
};

export default ImageUploadPreview;