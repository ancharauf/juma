
    import React from 'react';
    import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
    import { motion } from 'framer-motion';

    const Footer = () => {
      return (
        <motion.footer 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-slate-900 border-t border-slate-700 py-12"
        >
          <div className="container mx-auto px-4 text-center text-slate-400">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
              <div>
                <p className="font-semibold text-slate-200 mb-2">Juma: Jualin Makassar</p>
                <p className="text-sm">Jualan lancar, urusan lainnya pun beres.</p>
                <p className="text-sm mt-2">Wadah digital untuk jual beli dan informasi di Makassar.</p>
              </div>
              <div>
                <p className="font-semibold text-slate-200 mb-2">Tautan Cepat</p>
                <ul className="space-y-1">
                  <li><a href="/pasang-iklan" className="hover:text-orange-400 transition-colors">Lihat Iklan</a></li>
                  <li><a href="/buat-iklan" className="hover:text-orange-400 transition-colors">Pasang Iklan</a></li>
                  <li><a href="/pembayaran" className="hover:text-orange-400 transition-colors">Layanan Pembayaran</a></li>
                  <li><a href="/berita" className="hover:text-orange-400 transition-colors">Berita Makassar</a></li>
                </ul>
              </div>
              <div>
                <p className="font-semibold text-slate-200 mb-2">Ikuti Kami</p>
                <div className="flex justify-center space-x-4">
                  <a href="#" className="hover:text-orange-400 transition-colors"><Facebook size={20} /></a>
                  <a href="#" className="hover:text-orange-400 transition-colors"><Instagram size={20} /></a>
                  <a href="#" className="hover:text-orange-400 transition-colors"><Twitter size={20} /></a>
                  <a href="#" className="hover:text-orange-400 transition-colors"><Youtube size={20} /></a>
                </div>
              </div>
            </div>
            <div className="border-t border-slate-700 pt-8">
              <p className="text-sm">&copy; {new Date().getFullYear()} Juma: Jualin Makassar. Semua hak cipta dilindungi.</p>
              <p className="text-xs mt-1">Dibuat dengan ❤️ di Makassar</p>
            </div>
          </div>
        </motion.footer>
      );
    };

    export default Footer;
  