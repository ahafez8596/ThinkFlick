import { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { User, TMDBMedia, MediaType, RecommendationSource } from "@/types";
import { supabase, Tables } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { toast } from "@/components/ui/use-toast";

interface UserContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  loginAsGuest: () => void;
  logout: () => void;
  updatePreferences: (preferences: Partial<User["preferences"]>) => void;
  addLikedMedia: (media: TMDBMedia) => void;
  removeLikedMedia: (mediaId: number) => void;
}

// Define interfaces for database tables to help with TypeScript
type ProfileRow = Tables['profiles'];
type UserPreferenceRow = Tables['user_preferences'];
type UserLikedMediaRow = Tables['user_liked_media'];

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
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
          // Authenticated user
          try {
            // Get user profile
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            // Get user preferences
            const { data: userPrefs } = await supabase
              .from('user_preferences')
              .select('*')
              .eq('user_id', session.user.id)
              .single();

            // Get user's liked media
            const { data: likedMediaRows } = await supabase
              .from('user_liked_media')
              .select('*')
              .eq('user_id', session.user.id);

            // Extract media_data from each row
            const likedMedia = likedMediaRows ? likedMediaRows.map(row => row.media_data as TMDBMedia) : [];

            setUser({
              id: session.user.id,
              email: session.user.email,
              isGuest: false,
              preferences: userPrefs ? {
                mediaType: userPrefs.media_type as MediaType | null,
                recentlyWatched: userPrefs.recently_watched as TMDBMedia | null,
                recommendationCount: userPrefs.recommendation_count as number,
                recommendationSource: userPrefs.recommendation_source as RecommendationSource,
              } : {
                mediaType: null,
                recentlyWatched: null,
                recommendationCount: 5,
                recommendationSource: "tmdb",
              },
              likedMedia: likedMedia,
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

          // Get user preferences
          const { data: userPrefs } = await supabase
            .from('user_preferences')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          // Get user's liked media
          const { data: likedMediaRows } = await supabase
            .from('user_liked_media')
            .select('*')
            .eq('user_id', session.user.id);

          // Extract media_data from each row
          const likedMedia = likedMediaRows ? likedMediaRows.map(row => row.media_data as TMDBMedia) : [];

          setUser({
            id: session.user.id,
            email: session.user.email,
            isGuest: false,
            preferences: userPrefs ? {
              mediaType: userPrefs.media_type as MediaType | null,
              recentlyWatched: userPrefs.recently_watched as TMDBMedia | null,
              recommendationCount: userPrefs.recommendation_count as number,
              recommendationSource: userPrefs.recommendation_source as RecommendationSource,
            } : {
              mediaType: null,
              recentlyWatched: null,
              recommendationCount: 5,
              recommendationSource: "tmdb",
            },
            likedMedia: likedMedia,
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
    if (!user?.isGuest) {
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
  };

  const updatePreferences = async (preferences: Partial<User["preferences"]>) => {
    if (!user) return;
    
    const updatedPreferences = {
      ...user.preferences,
      ...preferences,
    } as User["preferences"];
    
    setUser({
      ...user,
      preferences: updatedPreferences,
    });

    // If not a guest, update preferences in the database
    if (!user.isGuest) {
      try {
        // Check if preferences entry exists
        const { data } = await supabase
          .from('user_preferences')
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (data) {
          // Update existing preferences
          await supabase
            .from('user_preferences')
            .update({
              media_type: updatedPreferences.mediaType,
              recently_watched: updatedPreferences.recentlyWatched,
              recommendation_count: updatedPreferences.recommendationCount,
              recommendation_source: updatedPreferences.recommendationSource,
              updated_at: new Date(),
            })
            .eq('user_id', user.id);
        } else {
          // Insert new preferences
          await supabase
            .from('user_preferences')
            .insert({
              user_id: user.id,
              media_type: updatedPreferences.mediaType,
              recently_watched: updatedPreferences.recentlyWatched,
              recommendation_count: updatedPreferences.recommendationCount,
              recommendation_source: updatedPreferences.recommendationSource,
            });
        }
      } catch (error) {
        console.error('Error updating preferences:', error);
        toast({
          title: "Error",
          description: "Failed to update preferences",
          variant: "destructive",
        });
      }
    }
  };

  const addLikedMedia = async (media: TMDBMedia) => {
    if (!user) return;
    
    // Update local state
    setUser({
      ...user,
      likedMedia: [...(user.likedMedia || []), media],
    });

    // If not a guest, update database
    if (!user.isGuest) {
      try {
        await supabase
          .from('user_liked_media')
          .insert({
            user_id: user.id,
            media_id: media.id,
            media_type: media.media_type,
            media_data: media,
          });
      } catch (error) {
        console.error('Error adding liked media:', error);
        toast({
          title: "Error",
          description: "Failed to save liked media",
          variant: "destructive",
        });
      }
    }
  };

  const removeLikedMedia = async (mediaId: number) => {
    if (!user || !user.likedMedia) return;
    
    // Update local state
    setUser({
      ...user,
      likedMedia: user.likedMedia.filter((item) => item.id !== mediaId),
    });

    // If not a guest, update database
    if (!user.isGuest) {
      try {
        await supabase
          .from('user_liked_media')
          .delete()
          .eq('user_id', user.id)
          .eq('media_id', mediaId);
      } catch (error) {
        console.error('Error removing liked media:', error);
        toast({
          title: "Error",
          description: "Failed to remove liked media",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        session,
        loading,
        setUser,
        loginAsGuest,
        logout,
        updatePreferences,
        addLikedMedia,
        removeLikedMedia,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
