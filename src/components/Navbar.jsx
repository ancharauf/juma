import React, { useState } from 'react';
    import { Link, useNavigate } from 'react-router-dom';
    import { motion } from 'framer-motion';
    import { Button } from '@/components/ui/button.jsx';
    import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar.jsx';
    import {
      DropdownMenu,
      DropdownMenuContent,
      DropdownMenuItem,
      DropdownMenuLabel,
      DropdownMenuSeparator,
      DropdownMenuTrigger,
    } from '@/components/ui/dropdown-menu.jsx';
    import { LogIn, LogOut, UserPlus, LayoutDashboard, Newspaper, ShoppingBag, DollarSign, Home, Zap, Settings, ShieldCheck } from 'lucide-react';
    import { useAuth } from '@/contexts/AuthContext';

    const Navbar = () => {
      const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
      const { user, profile, logout, loading: initialAuthLoading, authLoading: operationAuthLoading, isAuthenticated, isAdmin } = useAuth();
      const navigate = useNavigate();
      const logoUrl = "https://storage.googleapis.com/hostinger-horizons-assets-prod/d8114f4f-a4c9-48ed-99ab-0a7f8fa4e8f7/fa5db91197e732c8bbf31057f29b0149.png";

      const handleLogout = async () => {
        await logout();
        navigate('/'); 
      };

      const navLinks = [
        { href: '/', label: 'Beranda', icon: <Home size={18} /> },
        { href: '/pasang-iklan', label: 'Iklan', icon: <ShoppingBag size={18} /> },
        { href: '/berita', label: 'Berita', icon: <Newspaper size={18} /> },
        { href: '/pembayaran', label: 'Bayar Tagihan', icon: <Zap size={18} /> },
      ];

      const UserAvatar = () => (
        <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-primary/70 hover:ring-primary transition-all">
          <AvatarImage src={profile?.avatar_url || `https://avatar.iran.liara.run/username?username=${user?.email || 'JumaUser'}`} alt={profile?.full_name || user?.email} />
          <AvatarFallback>{profile?.full_name ? profile.full_name.substring(0, 2).toUpperCase() : (user?.email ? user.email.substring(0, 2).toUpperCase() : 'JU')}</AvatarFallback>
        </Avatar>
      );

      const renderAuthButtons = () => {
        if (initialAuthLoading && !isAuthenticated) { // Still determining auth state on page load
          return <Button variant="outline" className="friendly-button-outline" disabled>Memuat...</Button>;
        }

        if (isAuthenticated && user) {
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="p-0 rounded-full">
                  <UserAvatar />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-slate-800 border-slate-700 text-slate-200 shadow-xl w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{profile?.full_name || user.email}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {isAdmin ? 'Administrator' : 'Pengguna'}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem asChild className="cursor-pointer hover:!bg-slate-700/80 focus:!bg-slate-700/80">
                  <Link to={isAdmin ? "/admin-dashboard" : "/dashboard"}>
                    {isAdmin ? <ShieldCheck size={16} className="mr-2 text-primary" /> : <LayoutDashboard size={16} className="mr-2 text-primary" />}
                    Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer hover:!bg-slate-700/80 focus:!bg-slate-700/80">
                  <Link to="/beli-token">
                    <DollarSign size={16} className="mr-2 text-primary" /> Beli Token
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="cursor-pointer hover:!bg-slate-700/80 focus:!bg-slate-700/80">
                  <Link to="/pengaturan-akun"> {/* Consider creating this page */}
                    <Settings size={16} className="mr-2 text-primary" /> Pengaturan Akun
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-slate-700" />
                <DropdownMenuItem onClick={handleLogout} disabled={operationAuthLoading} className="cursor-pointer hover:!bg-red-600/30 focus:!bg-red-600/30 text-red-400 hover:!text-red-300">
                  <LogOut size={16} className="mr-2" />
                  {operationAuthLoading ? 'Memproses...' : 'Logout'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        }
        
        // Not initial loading and not authenticated
        return (
          <div className="flex items-center space-x-2">
            <Button asChild variant="outline" className="friendly-button-outline" disabled={operationAuthLoading}>
              <Link to="/login"><LogIn size={16} className="mr-2" /> Login</Link>
            </Button>
            <Button asChild className="friendly-button" disabled={operationAuthLoading}>
              <Link to="/register"><UserPlus size={16} className="mr-2" /> Daftar</Link>
            </Button>
          </div>
        );
      };
      
      const MobileMenuIcon = () => (
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden p-2 rounded-md text-slate-300 hover:text-primary hover:bg-slate-700 transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            <motion.svg initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></motion.svg>
          ) : (
            <motion.svg initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0, opacity: 0 }} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></motion.svg>
          )}
        </button>
      );


      return (
        <motion.nav 
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
          className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-lg shadow-lg border-b border-slate-700/50"
        >
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <Link to="/" className="flex items-center space-x-2 text-2xl font-bold text-primary hover:opacity-80 transition-opacity">
                <img src={logoUrl} alt="Juma Logo" className="h-10 w-auto" />
              </Link>

              <div className="hidden md:flex items-center space-x-2">
                {navLinks.map((link) => (
                  <Button key={link.href} asChild variant="ghost" className="text-slate-300 hover:text-primary hover:bg-slate-700/50">
                    <Link to={link.href} className="flex items-center">
                      {link.icon && React.cloneElement(link.icon, { className: "mr-2" })}
                      {link.label}
                    </Link>
                  </Button>
                ))}
              </div>

              <div className="hidden md:flex items-center">
                {renderAuthButtons()}
              </div>
              
              <div className="md:hidden flex items-center">
                 {isAuthenticated && user && !isMobileMenuOpen && !initialAuthLoading && (
                   <div className="mr-2"> <UserAvatar /> </div>
                )}
                <MobileMenuIcon />
              </div>

            </div>
          </div>

          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-slate-800/90 border-t border-slate-700"
            >
              <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {navLinks.map((link) => (
                  <Button key={link.href} asChild variant="ghost" className="w-full justify-start text-slate-300 hover:text-primary hover:bg-slate-700">
                    <Link to={link.href} onClick={() => setIsMobileMenuOpen(false)} className="flex items-center">
                      {link.icon && React.cloneElement(link.icon, { className: "mr-3" })}
                      {link.label}
                    </Link>
                  </Button>
                ))}
              </div>
              <div className="pt-2 pb-3 border-t border-slate-700 px-2">
                {initialAuthLoading && !isAuthenticated ? (
                    <Button variant="outline" className="w-full friendly-button-outline" disabled>Memuat...</Button>
                ) : isAuthenticated && user ? (
                  <>
                    <DropdownMenuItem asChild className="cursor-pointer hover:!bg-slate-700/80 focus:!bg-slate-700/80 text-slate-300 w-full justify-start mb-1">
                      <Link to={isAdmin ? "/admin-dashboard" : "/dashboard"} onClick={() => setIsMobileMenuOpen(false)}>
                        {isAdmin ? <ShieldCheck size={18} className="mr-3 text-primary" /> : <LayoutDashboard size={18} className="mr-3 text-primary" />}
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="cursor-pointer hover:!bg-slate-700/80 focus:!bg-slate-700/80 text-slate-300 w-full justify-start mb-1">
                      <Link to="/beli-token" onClick={() => setIsMobileMenuOpen(false)}>
                        <DollarSign size={18} className="mr-3 text-primary" /> Beli Token
                      </Link>
                    </DropdownMenuItem>
                     <DropdownMenuItem asChild className="cursor-pointer hover:!bg-slate-700/80 focus:!bg-slate-700/80 text-slate-300 w-full justify-start mb-1">
                      <Link to="/pengaturan-akun" onClick={() => setIsMobileMenuOpen(false)}>
                        <Settings size={18} className="mr-3 text-primary" /> Pengaturan Akun
                      </Link>
                    </DropdownMenuItem>
                    <Button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} disabled={operationAuthLoading} className="w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-600/30 bg-transparent">
                      <LogOut size={18} className="mr-3" />
                      {operationAuthLoading ? 'Memproses...' : 'Logout'}
                    </Button>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Button asChild variant="outline" className="w-full friendly-button-outline" disabled={operationAuthLoading}>
                      <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}><LogIn size={16} className="mr-2" /> Login</Link>
                    </Button>
                    <Button asChild className="w-full friendly-button" disabled={operationAuthLoading}>
                      <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}><UserPlus size={16} className="mr-2" /> Daftar</Link>
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </motion.nav>
      );
    };

    export default Navbar;