
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { User } from "@/types";
import { toast } from "@/components/ui/use-toast";

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initialize the auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setLoading(true);

        if (session) {
          try {
            // Get user profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            setUser({
              id: session.user.id,
              email: session.user.email,
              isGuest: false,
              preferences: {
                mediaType: null,
                recentlyWatched: null,
                recommendationCount: 5,
                recommendationSource: "tmdb",
              },
              likedMedia: [],
            });
          } catch (error) {
            console.error('Error fetching user data:', error);
            toast({
              title: "Error",
              description: "Failed to load user data",
              variant: "destructive",
            });
            setUser({
              id: session.user.id,
              email: session.user.email,
              isGuest: false,
              preferences: {
                mediaType: null,
                recentlyWatched: null,
                recommendationCount: 5,
                recommendationSource: "tmdb",
              },
              likedMedia: [],
            });
          }
        } else {
          // No active session
          setUser(null);
        }
        
        setLoading(false);
      }
    );

    // Get initial session
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session) {
        try {
          // Get user profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          setUser({
            id: session.user.id,
            email: session.user.email,
            isGuest: false,
            preferences: {
              mediaType: null,
              recentlyWatched: null,
              recommendationCount: 5,
              recommendationSource: "tmdb",
            },
            likedMedia: [],
          });
        } catch (error) {
          console.error('Error fetching user data:', error);
          toast({
            title: "Error",
            description: "Failed to load user data",
            variant: "destructive",
          });
          setUser({
            id: session.user.id,
            email: session.user.email,
            isGuest: false,
            preferences: {
              mediaType: null,
              recentlyWatched: null,
              recommendationCount: 5,
              recommendationSource: "tmdb",
            },
            likedMedia: [],
          });
        }
      }
      
      setLoading(false);
    };

    initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const loginAsGuest = () => {
    setUser({
      id: `guest-${Date.now()}`,
      isGuest: true,
      preferences: {
        mediaType: null,
        recentlyWatched: null,
        recommendationCount: 5,
        recommendationSource: "tmdb",
      },
      likedMedia: [],
    });
  };

  const logout = async () => {
    if (user && !user.isGuest) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
  };

  return {
    user,
    session,
    loading,
    setUser,
    loginAsGuest,
    logout,
  };
}
