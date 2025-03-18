
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.4.0";

// Load environment variables
const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY") || "b795d65c7179a5635df1d1a73f963c6c";
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY") || "";
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

async function getTMDBRecommendations(
  mediaId: number,
  mediaType: MediaType,
  count: number
): Promise<TMDBMedia[]> {
  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/${mediaType}/${mediaId}/recommendations?api_key=${TMDB_API_KEY}&language=en-US&page=1`
    );

    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    const results = data.results.slice(0, count).map((item: any) => ({
      ...item,
      media_type: mediaType,
    }));

    return results;
  } catch (error) {
    console.error("Error fetching TMDB recommendations:", error);
    return [];
  }
}

async function getAIRecommendations(
  mediaId: number,
  mediaType: MediaType,
  count: number,
  title: string,
  overview: string
): Promise<TMDBMedia[]> {
  if (!OPENAI_API_KEY) {
    console.error("OpenAI API key not found");
    return await getTMDBRecommendations(mediaId, mediaType, count);
  }

  try {
    // Prepare the prompt
    const prompt = `Based on ${mediaType} "${title}" with this description: "${overview}", suggest ${count} similar ${mediaType}s that viewers might enjoy. Provide results in JSON format with fields: title, overview, vote_average (between 1-10).`;

    // Call OpenAI API
    const openAIResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a recommendation engine for movies and TV shows. Return only JSON without markdown formatting."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7
      })
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const aiData = await openAIResponse.json();
    const content = aiData.choices[0]?.message?.content;

    // Parse the JSON response from AI
    let recommendations;
    try {
      // Try to extract JSON if it's wrapped in markdown code blocks
      const jsonMatch = content.match(/```json\n([\s\S]*)\n```/) || content.match(/```\n([\s\S]*)\n```/);
      const jsonContent = jsonMatch ? jsonMatch[1] : content;
      recommendations = JSON.parse(jsonContent);
    } catch (e) {
      console.error("Failed to parse AI response as JSON:", e);
      return await getTMDBRecommendations(mediaId, mediaType, count);
    }

    // Convert AI recommendations to TMDBMedia format
    const aiRecommendations = Array.isArray(recommendations) 
      ? recommendations 
      : recommendations.recommendations || [];

    return aiRecommendations.map((item: any, index: number) => ({
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

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }

  try {
    const { mediaId, mediaType, count, source, title, overview } = await req.json() as RequestBody;
    
    let recommendations: TMDBMedia[] = [];
    
    // Get recommendations based on source
    if (source === "ai" && title && overview) {
      recommendations = await getAIRecommendations(mediaId, mediaType, count, title, overview);
    } else {
      recommendations = await getTMDBRecommendations(mediaId, mediaType, count);
    }
    
    return new Response(
      JSON.stringify({ recommendations }),
      {
        headers: { 
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*"
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
          "Access-Control-Allow-Origin": "*"
        }
      }
    );
  }
});
