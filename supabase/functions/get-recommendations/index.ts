
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.4.0";

// Load environment variables
const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY") || "";
const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";

// Create a Supabase client (for accessing the database if needed)
const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Type definitions to match the ones used in the frontend
type MediaType = "movie" | "tv";
type RecommendationSource = "tmdb" | "ai";

interface TMDBMedia {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  release_date?: string;
  first_air_date?: string;
  media_type: MediaType;
  genre_ids: number[];
}

interface RequestBody {
  mediaId: number;
  mediaType: MediaType;
  count: number;
  source: RecommendationSource;
  title?: string;
  overview?: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to fetch TMDB recommendations
async function getTMDBRecommendations(
  mediaId: number,
  mediaType: MediaType,
  count: number
): Promise<TMDBMedia[]> {
  try {
    console.log(`Fetching ${count} TMDB recommendations for ${mediaType} ID ${mediaId}`);
    
    // We may need to fetch multiple pages to get the requested count
    const recommendationsPerPage = 20;
    const pagesToFetch = Math.ceil(count / recommendationsPerPage);
    let allResults: TMDBMedia[] = [];
    
    // First try to get recommendations
    for (let page = 1; page <= pagesToFetch && allResults.length < count; page++) {
      const response = await fetch(
        `https://api.themoviedb.org/3/${mediaType}/${mediaId}/recommendations?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`
      );

      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }

      const data = await response.json();
      const pageResults = data.results.map((item: any) => ({
        ...item,
        media_type: mediaType,
      }));
      
      allResults = [...allResults, ...pageResults];
    }

    // If we still don't have enough recommendations, fetch similar media
    if (allResults.length < count) {
      console.log(`Not enough recommendations, fetching similar ${mediaType}s...`);
      
      for (let page = 1; page <= pagesToFetch && allResults.length < count; page++) {
        const response = await fetch(
          `https://api.themoviedb.org/3/${mediaType}/${mediaId}/similar?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`
        );

        if (!response.ok) {
          throw new Error(`TMDB API error: ${response.status}`);
        }

        const data = await response.json();
        const pageResults = data.results
          .filter((item: any) => !allResults.some((existing) => existing.id === item.id))
          .map((item: any) => ({
            ...item,
            media_type: mediaType,
          }));
        
        allResults = [...allResults, ...pageResults];
      }
    }
    
    console.log(`TMDB returned ${allResults.length} recommendations, trimming to ${count} as requested`);
    // Trim to exact count requested
    return allResults.slice(0, count);
  } catch (error) {
    console.error("Error fetching TMDB recommendations:", error);
    return [];
  }
}

// Helper function to get AI-generated recommendations
async function getAIRecommendations(
  mediaId: number,
  mediaType: MediaType,
  count: number,
  title: string,
  overview: string
): Promise<TMDBMedia[]> {
  if (!DEEPSEEK_API_KEY) {
    console.error("DeepSeek API key not found");
    return await getTMDBRecommendations(mediaId, mediaType, count);
  }

  try {
    console.log(`Generating ${count} AI recommendations for "${title}" with source type "DeepSeek"`);
    
    // Prepare the prompt
    const prompt = `Based on ${mediaType} "${title}" with this description: "${overview}", suggest exactly ${count} similar ${mediaType}s that viewers might enjoy. For each recommendation, provide a title, a brief overview/description, and a rating out of 10. These should be real ${mediaType}s that exist, not made-up ones. Please provide results in valid JSON format with array of objects containing fields: title, overview, vote_average (between 1-10).`;

    // Call DeepSeek API
    const deepseekResponse = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "You are a recommendation engine for movies and TV shows. Return only JSON without markdown formatting. The JSON should be an array of objects, each with title, overview, and vote_average properties."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7
      })
    });

    if (!deepseekResponse.ok) {
      console.error(`DeepSeek API error: ${deepseekResponse.status}`);
      const errorText = await deepseekResponse.text();
      console.error(`DeepSeek error response: ${errorText}`);
      throw new Error(`DeepSeek API error: ${deepseekResponse.status}`);
    }

    const aiData = await deepseekResponse.json();
    const content = aiData.choices[0]?.message?.content;
    console.log("DeepSeek AI response received, processing...");

    // Parse the JSON response from AI
    let recommendations;
    try {
      // Try to extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = content.match(/```json\n([\s\S]*)\n```/) || content.match(/```\n([\s\S]*)\n```/);
      const jsonContent = jsonMatch ? jsonMatch[1] : content;
      recommendations = JSON.parse(jsonContent);
      console.log(`Successfully parsed ${Array.isArray(recommendations) ? recommendations.length : 0} AI recommendations`);
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", e);
      console.log("Raw AI response:", content);
      return await getTMDBRecommendations(mediaId, mediaType, count);
    }

    // Convert AI recommendations to TMDBMedia format
    const aiRecommendations = Array.isArray(recommendations) 
      ? recommendations 
      : recommendations.recommendations || [];
    
    console.log(`AI returned ${aiRecommendations.length} recommendations`);

    // Make sure we return exactly the requested count
    return aiRecommendations.slice(0, count).map((item: any, index: number) => ({
      id: mediaId + index + 1000000, // Generate unique IDs
      title: mediaType === "movie" ? item.title : undefined,
      name: mediaType === "tv" ? item.title : undefined,
      poster_path: null, // AI can't generate poster paths
      backdrop_path: null,
      overview: item.overview || "No overview available",
      vote_average: item.vote_average || 7.5,
      media_type: mediaType,
      genre_ids: [],
      release_date: mediaType === "movie" ? "2023" : undefined,
      first_air_date: mediaType === "tv" ? "2023" : undefined,
    }));
  } catch (error) {
    console.error("Error getting AI recommendations:", error);
    return await getTMDBRecommendations(mediaId, mediaType, count);
  }
}

// Main handler function
serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    const { mediaId, mediaType, count, source, title, overview } = await req.json() as RequestBody;
    
    console.log(`Received request for ${count} recommendations using "${source}" source for ${mediaType} ID ${mediaId}`);
    
    let recommendations: TMDBMedia[] = [];
    
    // Get recommendations based on source
    if (source === "ai" && title && overview) {
      console.log("Using AI recommendations source");
      recommendations = await getAIRecommendations(mediaId, mediaType, count, title, overview);
    } else {
      console.log("Using TMDB recommendations source");
      recommendations = await getTMDBRecommendations(mediaId, mediaType, count);
    }
    
    console.log(`Returning ${recommendations.length} recommendations to client`);
    
    return new Response(
      JSON.stringify({ 
        recommendations,
        source, // Return the source used so client can verify
        requested_count: count
      }),
      {
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  } catch (error) {
    console.error("Error in edge function:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", message: error.message }),
      {
        status: 500,
        headers: { 
          "Content-Type": "application/json",
          ...corsHeaders
        }
      }
    );
  }
});
