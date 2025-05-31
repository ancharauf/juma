import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false); 
  const [authLoading, setAuthLoading] = useState(false); 
  const { toast } = useToast();

  const fetchProfile = useCallback(async (userId) => {
    if (!supabase || !userId) {
      setProfile(null);
      setAuthLoading(false); 
      return null;
    }
    setAuthLoading(true); 
    try {
      const { data, error, status } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, is_admin, phone_number, email, username')
        .eq('id', userId)
        .single();

      if (error && status !== 406) { 
        console.error('AuthContext: Error fetching profile:', error);
        setProfile(null);
        return null;
      }
      setProfile(data || null);
      return data || null;
    } catch (error) {
      console.error('AuthContext: Catch Error fetching profile:', error.message);
      setProfile(null);
      return null;
    } finally {
      setAuthLoading(false); 
    }
  }, [toast]);
  
  const fetchUserTokens = useCallback(async () => {
    if (!supabase || !user) {
        return;
    }
    try {
      await supabase.from('user_tokens').select('balance').eq('user_id', user.id).single();
    } catch (error) {
      console.error("Error fetching/creating user tokens in AuthContext:", error);
    }
  }, [user, supabase]);


  useEffect(() => {
    setLoading(true); 
    setAuthLoading(true);

    if (!supabase) {
      setUser(null);
      setProfile(null);
      setLoading(false);
      setAuthLoading(false);
      console.warn("AuthContext: Supabase client not available. Auth features disabled.");
      return () => {};
    }
    
    let isMounted = true;

    const initializeAuth = async () => {
      if (!isMounted) return;
      
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("AuthContext: Error getting session:", sessionError.message);
        }

        const currentUser = session?.user ?? null;
        if (isMounted) setUser(currentUser);

        if (currentUser) {
          await fetchProfile(currentUser.id);
        } else {
          if (isMounted) setProfile(null);
        }
      } catch (error) {
        console.error("AuthContext: Error in initializeAuth", error);
      } finally {
        if (isMounted) {
          setLoading(false);
          setAuthLoading(false); 
        }
      }
    };

    initializeAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return;
        setAuthLoading(true); 
        
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        if (currentUser) {
          await fetchProfile(currentUser.id); 
        } else {
          setProfile(null); 
          setAuthLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [fetchProfile, supabase]);
  
  const login = async (email, password) => {
    if (!supabase) {
      toast({ title: "Layanan Tidak Tersedia", description: "Fitur login tidak aktif saat ini. Database tidak terhubung.", variant: "destructive" });
      return { success: false, error: "Supabase client not available", user: null, profile: null };
    }
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        toast({ title: "Login Gagal", description: error.message || "Email atau password salah.", variant: "destructive" });
        return { success: false, error: error.message, user: null, profile: null };
      }
      if (data.user) {
        const userProfileData = await fetchProfile(data.user.id);
        toast({ title: "Login Berhasil!", description: "Selamat datang kembali!", className: "bg-green-500 text-white border-none shadow-lg" });
        return { success: true, user: data.user, profile: userProfileData };
      }
    } catch (error) {
      toast({ title: "Login Error", description: "Terjadi kesalahan tak terduga saat login.", variant: "destructive" });
    } finally {
      setAuthLoading(false);
    }
    return { success: false, error: "Terjadi kesalahan tak terduga.", user: null, profile: null };
  };

  const register = async (email, password, fullName, phoneNumber) => {
    if (!supabase) {
      toast({ title: "Layanan Tidak Tersedia", description: "Fitur registrasi tidak aktif saat ini. Database tidak terhubung.", variant: "destructive" });
      return { success: false, error: "Supabase client not available" };
    }
    setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, phone_number: phoneNumber } },
      });
      if (error) {
        toast({ title: "Registrasi Gagal", description: error.message || "Tidak dapat mendaftarkan pengguna.", variant: "destructive" });
        return { success: false, error: error.message };
      }
      if (data.user) {
        toast({ title: "Registrasi Berhasil!", description: "Silakan cek email Anda untuk verifikasi.", className: "bg-green-500 text-white border-none shadow-lg" });
        return { success: true, user: data.user };
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast({ title: "Registrasi Error", description: "Terjadi kesalahan tak terduga saat registrasi.", variant: "destructive" });
    } finally {
      setAuthLoading(false);
    }
    return { success: false, error: "Terjadi kesalahan tak terduga saat registrasi." };
  };

  const logout = async () => {
    if (!supabase) {
      setUser(null);
      setProfile(null);
      setAuthLoading(false);
      toast({ title: "Logout Berhasil (Lokal)", description: "Anda telah keluar dari sesi lokal." });
      return;
    }
    setAuthLoading(true); 
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({ title: "Logout Gagal", description: error.message, variant: "destructive" });
         setAuthLoading(false); 
      } else {
        toast({ title: "Logout Berhasil", description: "Anda telah berhasil keluar." });
      }
    } catch (error) {
        toast({ title: "Logout Error", description: "Terjadi kesalahan tak terduga saat logout.", variant: "destructive" });
        setAuthLoading(false); 
    }
  };
  
  const isAuthenticated = !!user;
  const isAdmin = !!user && !!profile && profile.is_admin === true;

  const value = {
    user,
    profile,
    loading, 
    authLoading, 
    login,
    register,
    logout,
    fetchProfile,
    fetchUserTokens,
    isAuthenticated,
    isAdmin,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};