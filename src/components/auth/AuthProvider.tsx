"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/lib/types";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import AuthModal from "@/components/auth/AuthModal";

interface AuthContextValue {
  /** Supabase auth user (null = signed out / db not configured). */
  user: User | null;
  /** Own profile row (via my_profile RPC); null until loaded or signed out. */
  profile: Profile | null;
  /** True until the initial session check completes. */
  loading: boolean;
  /** True when Supabase env vars exist; interactive UI renders only then. */
  dbReady: boolean;
  isBureau: boolean;
  isAdmin: boolean;
  isBanned: boolean;
  openAuth: () => void;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const dbReady = isSupabaseConfigured();

  const refreshProfile = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setProfile(null);
      return;
    }
    const { data } = await supabase.rpc("my_profile");
    setProfile(((data as Profile[] | null) ?? [])[0] ?? null);
  }, []);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    supabase.auth.getSession().then(({ data }) => {
      if (cancelled) return;
      setUser(data.session?.user ?? null);
      if (!data.session) setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      setUser(session?.user ?? null);
      if (event === "SIGNED_OUT") {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => {
      cancelled = true;
      subscription.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    refreshProfile().finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [user, refreshProfile]);

  const openAuth = useCallback(() => setAuthModalOpen(true), []);

  const signOut = useCallback(async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      loading,
      dbReady,
      isBureau: profile?.role === "bureau" || profile?.role === "admin",
      isAdmin: profile?.role === "admin",
      isBanned: profile?.is_banned === true,
      openAuth,
      signOut,
      refreshProfile,
    }),
    [user, profile, loading, dbReady, openAuth, signOut, refreshProfile]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </AuthContext.Provider>
  );
}
