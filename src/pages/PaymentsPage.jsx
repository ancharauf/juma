import React, { useState } from 'react';
    import { Button } from '@/components/ui/button';
    import { Input } from '@/components/ui/input';
    import { Label } from '@/components/ui/label';
    import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
    import { useToast } from '@/components/ui/use-toast';
    import { motion } from 'framer-motion';
    import { Zap, Droplet, Smartphone, Wifi, Gamepad2, ShieldCheck, Receipt } from 'lucide-react';

    const PaymentServiceCard = ({ icon, name, serviceKey, onPay, placeholder }) => {
      const [customerId, setCustomerId] = useState('');
      const { toast } = useToast();

      const handlePayment = () => {
        if (!customerId) {
          toast({
            title: "ID/Nomor Kosong",
            description: `Mohon masukkan ID/Nomor untuk ${name}.`,
            variant: "destructive",
          });
          return;
        }
        onPay(serviceKey, customerId, name);
        setCustomerId('');
      };

      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full"
        >
          <Card className="card-cheerful h-full flex flex-col">
            <CardHeader className="flex flex-row items-center space-x-3 pb-3">
              <div className="p-3 bg-primary/20 rounded-lg text-primary">{icon}</div>
              <CardTitle className="text-xl text-foreground">{name}</CardTitle>
            </CardHeader>
            <CardContent className="flex-grow space-y-3">
              <Label htmlFor={`${serviceKey}-id`} className="text-muted-foreground">Nomor Pelanggan / ID / No. HP</Label>
              <Input 
                id={`${serviceKey}-id`} 
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder={placeholder || `Masukkan ID ${name}`} 
                className="input-modern" 
              />
            </CardContent>
            <CardFooter>
              <Button onClick={handlePayment} className="w-full friendly-button">
                <Receipt size={18} className="mr-2" /> Bayar Tagihan
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      );
    };

    const PaymentsPage = () => {
      const { toast } = useToast();

      const handlePaymentAction = (serviceKey, customerId, serviceName) => {
        console.log(`Processing payment for ${serviceName} (ID: ${customerId})`);
        toast({
          title: "Pembayaran Diproses",
          description: `Permintaan pembayaran untuk ${serviceName} dengan ID ${customerId} sedang diproses. (Simulasi)`,
          className: "bg-blue-600 text-white border-none"
        });
        // Placeholder for Tripay/Midtrans integration
      };

      const services = [
        { key: 'pln', name: 'Listrik PLN', icon: <Zap size={28} />, placeholder: "Contoh: 51234567890" },
        { key: 'pdam', name: 'Air PDAM', icon: <Droplet size={28} />, placeholder: "Contoh: 01234567" },
        { key: 'bpjs', name: 'BPJS Kesehatan', icon: <ShieldCheck size={28} />, placeholder: "Contoh: 0001234567890" },
        { key: 'pulsa', name: 'Pulsa Seluler', icon: <Smartphone size={28} />, placeholder: "Contoh: 081234567890" },
        { key: 'data', name: 'Paket Data', icon: <Wifi size={28} />, placeholder: "Contoh: 081234567890" },
        { key: 'game', name: 'Voucher Game', icon: <Gamepad2 size={28} />, placeholder: "Pilih Game & Masukkan ID" },
      ];

      return (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="py-8"
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-extrabold gradient-text mb-4">Layanan Pembayaran Juma</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Bayar semua tagihan bulanan dan kebutuhan digitalmu dengan mudah, cepat, dan aman di sini!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {services.map((service) => (
              <PaymentServiceCard 
                key={service.key}
                icon={service.icon}
                name={service.name}
                serviceKey={service.key}
                onPay={handlePaymentAction}
                placeholder={service.placeholder}
              />
            ))}
          </div>
          
          <Card className="mt-12 card-cheerful">
            <CardHeader>
              <CardTitle className="text-2xl text-foreground">Riwayat Transaksi</CardTitle>
              <CardDescription className="text-muted-foreground">Semua transaksi pembayaran Anda akan tercatat di sini.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-center py-8">
                Belum ada riwayat transaksi. <br/>
                Fitur ini akan segera tersedia setelah integrasi payment gateway!
              </p>
            </CardContent>
          </Card>
        </motion.div>
      );
    };

    export default PaymentsPage;