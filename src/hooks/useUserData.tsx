
import { useEffect } from "react";
import { User, TMDBMedia, MediaType, RecommendationSource } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { toast } from "@/components/ui/use-toast";

export async function fetchUserData(session: Session): Promise<User> {
  try {
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
    const likedMedia = likedMediaRows 
      ? likedMediaRows.map(row => row.media_data as TMDBMedia) 
      : [];

    return {
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
    };
  } catch (error) {
    console.error('Error fetching user data:', error);
    toast({
      title: "Error",
      description: "Failed to load user data",
      variant: "destructive",
    });
    return {
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
    };
  }
}

export function useUserData(user: User | null, session: Session | null, setUser: (user: User | null) => void) {
  useEffect(() => {
    const loadUserData = async () => {
      if (session) {
        const userData = await fetchUserData(session);
        setUser(userData);
      }
    };

    if (session && (!user || user.isGuest)) {
      loadUserData();
    }
  }, [session, user, setUser]);
}
