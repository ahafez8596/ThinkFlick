
import { MediaType, TMDBMedia, RecommendationSource } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { getMockRecommendations } from "@/mocks/mediaData";
import { searchMedia, getGenresById, getNewReleases, getMediaByGenre } from "./tmdbApi";
import { getImageUrl } from "@/utils/imageUtils";
import { TMDB_CONFIG } from "@/config/api";

// Re-export functions from sub-modules for backward compatibility
export { 
  searchMedia, 
  getGenresById, 
  getImageUrl,
  getNewReleases,
  getMediaByGenre
};

// Get recommendations based on user preferences
export async function getRecommendations(
  mediaId: number, 
  mediaType: MediaType, 
  count: number = 5,
  source: RecommendationSource = "tmdb"
): Promise<TMDBMedia[]> {
  try {
    console.log(`Requesting ${count} recommendations for ${mediaType} ID ${mediaId} from ${source}`);
    
    // Get the details of the media to pass to the AI model
    let title = "";
    let overview = "";
    
    if (source === "ai") {
      const details = await fetch(
        `${TMDB_CONFIG.BASE_URL}/${mediaType}/${mediaId}?api_key=${TMDB_CONFIG.API_KEY}`
      );
      
      if (details.ok) {
        const detailsData = await details.json();
        title = detailsData.title || detailsData.name || "";
        overview = detailsData.overview || "";
      }
    }
    
    // Call our edge function for recommendations
    const { data, error } = await supabase.functions.invoke("get-recommendations", {
      body: { 
        mediaId, 
        mediaType, 
        count, 
        source,
        title,
        overview
      }
    });
    
    if (error) {
      console.error("Edge function error:", error);
      throw new Error(error.message);
    }
    
    console.log(`Received ${data.recommendations?.length || 0} recommendations from edge function`);
    return data.recommendations || [];
  } catch (error) {
    console.error("Error getting recommendations:", error);
    // Fallback to mockRecommendations if there's an error
    return getMockRecommendations(mediaType, count);
  }
}
