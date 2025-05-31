import React from 'react';
    import { Button } from '@/components/ui/button';
    import { Link } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { ArrowRight, Search, Tag, Zap, Rss, ShoppingBag, CreditCard, MessageSquare } from 'lucide-react';

    const FeatureCard = ({ icon, title, description, delay }) => (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay }}
        className="card-cheerful p-6 flex flex-col items-center text-center h-full"
      >
        <div className="p-4 bg-primary/20 rounded-full mb-4 text-primary">
          {icon}
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm flex-grow">{description}</p>
      </motion.div>
    );

    const HomePage = () => {
      const logoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/d8114f4f-a4c9-48ed-99ab-0a7f8fa4e8f7/f5f7efefa9d5c664535e047fa17a9d08.png";

      return (
        <div className="space-y-20 md:space-y-28 py-8">
          <motion.section 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="text-center py-20 md:py-32 rounded-3xl bg-cover bg-center relative overflow-hidden"
            style={{ backgroundImage: "linear-gradient(rgba(10, 10, 20, 0.7), rgba(10, 10, 20, 0.85)), url('https://images.unsplash.com/photo-1570063870409-0904e03709a3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8bWFrYXNzYXJ8ZW58MHx8MHx8fDA%3D&auto=format&fit=crop&w=1200&q=80')" }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60"></div>
            <div className="relative z-10 px-4 flex flex-col items-center">
              <motion.div
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="mb-6"
              >
                <img src={logoUrl} alt="Logo Juma Makassar" className="h-36 md:h-48 mx-auto" />
              </motion.div>
              <motion.h1 
                initial={{ opacity: 0, y: -30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-5xl sm:text-6xl md:text-7xl font-extrabold mb-6"
              >
                <span className="gradient-text">Juma:</span> Jualin Makassar
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-xl md:text-2xl text-slate-200 mb-10 max-w-3xl mx-auto"
              >
                Jualan lancar, urusan lainnya pun beres. Temukan semua kebutuhanmu di sini, <span className="font-semibold text-secondary">lebih mudah dan ceria!</span>
              </motion.p>
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="space-y-4 sm:space-y-0 sm:space-x-4 flex flex-col sm:flex-row justify-center items-center"
              >
                <Button size="lg" asChild className="friendly-button px-8 py-4 text-lg w-full sm:w-auto">
                  <Link to="/pasang-iklan">
                    Lihat Iklan <Search className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-primary text-primary hover:bg-primary/10 hover:text-accent shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-300 px-8 py-4 text-lg w-full sm:w-auto">
                  <Link to="/buat-iklan">
                    Pasang Iklan <Tag className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
            </div>
             <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-background to-transparent"></div>
          </motion.section>

          <section className="py-12">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-3xl md:text-4xl font-bold text-center mb-16 gradient-text"
            >
              Kenapa Harus Juma?
            </motion.h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard 
                icon={<ShoppingBag size={36} />} 
                title="Jual Beli Ceria" 
                description="Pasang iklan gratis atau premium dengan token. Temukan barang & jasa impianmu dengan mudah dan menyenangkan."
                delay={0.3}
              />
              <FeatureCard 
                icon={<Zap size={36} />} 
                title="Promosi Token Cerdas" 
                description="Gunakan sistem token fleksibel untuk durasi tayang iklanmu. Lebih banyak dilihat, lebih cepat laku!"
                delay={0.4}
              />
              <FeatureCard 
                icon={<CreditCard size={36} />} 
                title="Bayar Tagihan Praktis" 
                description="Akses layanan pembayaran PLN, PDAM, BPJS, Pulsa & lainnya. Semua dalam satu aplikasi!"
                delay={0.5}
              />
              <FeatureCard 
                icon={<Rss size={36} />} 
                title="Info Makassar Terkini" 
                description="Ikuti berita, event, dan informasi terbaru di Kota Makassar. Jangan sampai ketinggalan!"
                delay={0.6}
              />
            </div>
          </section>
          
          <motion.section 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="card-cheerful p-8 md:p-16 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Sudah Siap Bergabung dengan Juma?</h2>
            <p className="text-muted-foreground mb-10 max-w-xl mx-auto text-lg">
              Jadilah bagian dari komunitas jual beli paling seru di Makassar! Pasang iklan pertamamu atau temukan penawaran terbaik sekarang juga.
            </p>
            <Button size="lg" asChild className="friendly-button px-10 py-5 text-xl">
              <Link to="/buat-iklan">
                Mulai Sekarang Juga <ArrowRight className="ml-2 h-6 w-6" />
              </Link>
            </Button>
          </motion.section>

          <section className="py-12">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-16 gradient-text">Kategori Paling Populer</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
              {['Elektronik', 'Properti', 'Mobil Bekas', 'Jasa Servis', 'Fashion Wanita', 'Rumah Tangga', 'Motor Bekas', 'Lowongan Kerja', 'Sewa Kost', 'Kuliner Makassar'].map((category, index) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="p-4 md:p-6 bg-card/70 hover:bg-primary/20 rounded-xl shadow-lg hover:shadow-primary/30 transition-all duration-300 text-center cursor-pointer group"
                >
                  <p className="text-foreground group-hover:text-primary font-semibold text-sm md:text-base">{category}</p>
                </motion.div>
              ))}
            </div>
          </section>

          <section className="text-center py-10">
            <MessageSquare size={48} className="mx-auto text-primary mb-4" />
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-foreground">Ada Pertanyaan atau Butuh Bantuan?</h2>
            <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Tim support Juma yang ramah siap membantu Anda. Jangan ragu untuk menghubungi kami melalui WhatsApp!</p>
            <Button 
              variant="outline" 
              className="friendly-button bg-green-500 hover:bg-green-600 border-none px-8 py-4 text-lg"
              onClick={() => window.open('https://wa.me/6281234567890?text=Halo%20Juma,%20saya%20butuh%20bantuan.', '_blank')}
            >
              Chat via WhatsApp
            </Button>
          </section>
        </div>
      );
    };

    export default HomePage;