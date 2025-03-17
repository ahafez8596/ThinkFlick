import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const TMDB_API_KEY = Deno.env.get("TMDB_API_KEY") || "b795d65c7179a5635df1d1a73f963c6c";
const DEEPSEEK_API_KEY = Deno.env.get("DEEPSEEK_API_KEY") || "sk-d1d79fd66bf142318de21896ce5f40c5";
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface RequestBody {
  mediaId: number;
  mediaType: string;
  count: number;
  source: string;
  title?: string;
  overview?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body: RequestBody = await req.json();
    console.log("Request body:", body);

    if (!body.mediaId || !body.mediaType || !body.source) {
      return new Response(
        JSON.stringify({ error: "Missing required parameters" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    let recommendations = [];

    if (body.source === "tmdb") {
      console.log("Fetching TMDB recommendations");
      const tmdbUrl = `${TMDB_BASE_URL}/${body.mediaType}/${body.mediaId}/recommendations?api_key=${TMDB_API_KEY}&page=1&include_adult=false`;
      const response = await fetch(tmdbUrl);
      
      if (!response.ok) {
        throw new Error(`TMDB API error: ${response.status}`);
      }
      
      const data = await response.json();
      recommendations = data.results.slice(0, body.count).map((item: any) => ({
        ...item,
        media_type: body.mediaType,
      }));
      
      console.log(`Returning ${recommendations.length} of ${data.results.length} available recommendations`);
    } else if (body.source === "ai") {
      console.log("Fetching AI recommendations");
      
      if (!body.title || !body.overview) {
        return new Response(
          JSON.stringify({ error: "Title and overview required for AI recommendations" }),
          { 
            status: 400, 
            headers: { ...corsHeaders, "Content-Type": "application/json" } 
          }
        );
      }

      const prompt = `
        You are an expert film and TV recommendation engine. 
        Based on the user's interest in the ${body.mediaType === "movie" ? "movie" : "TV show"} "${body.title}" with the following overview: "${body.overview}", 
        suggest EXACTLY ${body.count} similar ${body.mediaType === "movie" ? "movies" : "TV shows"} they might enjoy.
        Return a valid JSON array with objects containing these exact fields:
        - id (a random unique number)
        - title (for movies) or name (for TV shows)
        - overview (a brief synopsis)
        - media_type (either "movie" or "tv" matching the input type)
        - vote_average (a rating between 1-10)
        - release_date (for movies) or first_air_date (for TV shows) in YYYY-MM-DD format
        - poster_path (can be null)
        - backdrop_path (can be null)
        - genre_ids (an array of numbers)
      `;

      const aiResponse = await fetch("https://api.deepseek.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: "You are a film and TV recommendation expert that always returns valid JSON." },
            { role: "user", content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!aiResponse.ok) {
        const errorText = await aiResponse.text();
        console.error("DeepSeek API error:", errorText);
        throw new Error(`DeepSeek API error: ${aiResponse.status}`);
      }

      const aiData = await aiResponse.json();
      const content = aiData.choices[0].message.content;
      
      try {
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        const jsonStr = jsonMatch ? jsonMatch[0] : content;
        recommendations = JSON.parse(jsonStr);
        console.log(`AI returned ${recommendations.length} recommendations, requested ${body.count}`);
      } catch (error) {
        console.error("Error parsing AI response:", error);
        console.log("AI response content:", content);
        throw new Error("Failed to parse AI recommendations");
      }
    }

    console.log(`Returning ${recommendations.length} recommendations`);
    return new Response(
      JSON.stringify({ recommendations }),
      { 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in get-recommendations function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
