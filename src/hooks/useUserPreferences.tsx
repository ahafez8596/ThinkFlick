
import { User, UserPreferences } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export function useUserPreferences(user: User | null, setUser: (user: User | null) => void) {
  const updatePreferences = async (preferences: Partial<UserPreferences>) => {
    if (!user) return;
    
    const updatedPreferences = {
      ...user.preferences,
      ...preferences,
    } as UserPreferences;
    
    setUser({
      ...user,
      preferences: updatedPreferences,
    });

    // If not a guest, update preferences in the database
    if (!user.isGuest) {
      try {
        // Check if preferences entry exists
        const { data } = await supabase
          .from('user_preferences' as any)
          .select('id')
          .eq('user_id', user.id)
          .single();

        if (data) {
          // Update existing preferences
          await supabase
            .from('user_preferences' as any)
            .update({
              media_type: updatedPreferences.mediaType,
              recently_watched: updatedPreferences.recentlyWatched,
              recommendation_count: updatedPreferences.recommendationCount,
              recommendation_source: updatedPreferences.recommendationSource,
              updated_at: new Date(),
            } as any)
            .eq('user_id', user.id);
        } else {
          // Insert new preferences
          await supabase
            .from('user_preferences' as any)
            .insert({
              user_id: user.id,
              media_type: updatedPreferences.mediaType,
              recently_watched: updatedPreferences.recentlyWatched,
              recommendation_count: updatedPreferences.recommendationCount,
              recommendation_source: updatedPreferences.recommendationSource,
            } as any);
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

  return {
    updatePreferences,
  };
}
