
import { User, TMDBMedia } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export function useLikedMedia(user: User | null, setUser: (user: User | null) => void) {
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
          .from('user_liked_media' as any)
          .insert({
            user_id: user.id,
            media_id: media.id,
            media_type: media.media_type,
            media_data: media,
          } as any);
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
          .from('user_liked_media' as any)
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

  return {
    addLikedMedia,
    removeLikedMedia,
  };
}
