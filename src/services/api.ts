import { MediaType, TMDBMedia, RecommendationSource } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// TMDB API configuration
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

// Search for movies or TV shows based on user query
export async function searchMedia(query: string, type: MediaType): Promise<TMDBMedia[]> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/${type}?api_key=b795d65c7179a5635df1d1a73f963c6c&query=${encodeURIComponent(query)}`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results.map((item: any) => ({
      ...item,
      media_type: type,
    }));
  } catch (error) {
    console.error("Error searching media:", error);
    return [];
  }
}

// Get recommendations based on user preferences
export async function getRecommendations(
  mediaId: number, 
  mediaType: MediaType, 
  count: number = 5,
  source: RecommendationSource = "tmdb"
): Promise<TMDBMedia[]> {
  try {
    // Get the details of the media to pass to the AI model
    let title = "";
    let overview = "";
    
    if (source === "ai") {
      const details = await fetch(
        `${TMDB_BASE_URL}/${mediaType}/${mediaId}?api_key=b795d65c7179a5635df1d1a73f963c6c`
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
    
    return data.recommendations || [];
  } catch (error) {
    console.error("Error getting recommendations:", error);
    // Fallback to mockRecommendations if there's an error
    return mockRecommendations(mediaType, count);
  }
}

// Mock recommendations for fallback
function mockRecommendations(type: MediaType, count: number): TMDBMedia[] {
  const mockMovies: TMDBMedia[] = [
    {
      id: 1,
      title: "Inception",
      poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
      backdrop_path: "/s3TBrRGB1iav7gFOCNx3H31MoES.jpg",
      overview: "Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets.",
      vote_average: 8.2,
      release_date: "2010-07-16",
      media_type: "movie",
      genre_ids: [28, 878, 12]
    },
    {
      id: 2,
      title: "The Shawshank Redemption",
      poster_path: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
      backdrop_path: "/wPU78OPN4BYEgWYdXyg0phMee64.jpg",
      overview: "Framed in the 1940s for the double murder of his wife and her lover, banker Andy Dufresne begins a new life at Shawshank prison.",
      vote_average: 8.7,
      release_date: "1994-09-23",
      media_type: "movie",
      genre_ids: [18, 80]
    },
    {
      id: 3,
      title: "The Dark Knight",
      poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
      backdrop_path: "/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg",
      overview: "Batman raises the stakes in his war on crime when he sets out to dismantle the remaining criminal organizations.",
      vote_average: 8.5,
      release_date: "2008-07-16",
      media_type: "movie",
      genre_ids: [28, 80, 18]
    },
    {
      id: 4,
      title: "Pulp Fiction",
      poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
      backdrop_path: "/suaEOtk1N1sgg2QM528GluxMcAd.jpg",
      overview: "The lives of two mob hitmen, a boxer, a gangster and his wife intertwine in four tales of violence and redemption.",
      vote_average: 8.5,
      release_date: "1994-09-10",
      media_type: "movie",
      genre_ids: [53, 80]
    },
    {
      id: 5,
      title: "The Matrix",
      poster_path: "/f89U3ADr1oiB1s9GkdPOEpXUk5H.jpg",
      backdrop_path: "/fNG7i7Z7N0pPP3oyFx9xhKkNRJS.jpg",
      overview: "A computer hacker learns about the true nature of reality and his role in the war against its controllers.",
      vote_average: 8.1,
      release_date: "1999-03-30",
      media_type: "movie",
      genre_ids: [28, 878]
    }
  ];

  const mockTVShows: TMDBMedia[] = [
    {
      id: 101,
      name: "Breaking Bad",
      poster_path: "/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
      backdrop_path: "/tsRy63Mu5cu8etL1X7ZLyf7UP1M.jpg",
      overview: "A high school chemistry teacher diagnosed with terminal lung cancer turns to manufacturing and selling methamphetamine.",
      vote_average: 8.7,
      first_air_date: "2008-01-20",
      media_type: "tv",
      genre_ids: [18, 80]
    },
    {
      id: 102,
      name: "Game of Thrones",
      poster_path: "/u3bZgnGQ9T01sWNhyveQz0wH0Hl.jpg",
      backdrop_path: "/suopoADq0k8YZr4dQXcU6pToj6s.jpg",
      overview: "Nine noble families fight for control over the lands of Westeros, while an ancient enemy returns.",
      vote_average: 8.4,
      first_air_date: "2011-04-17",
      media_type: "tv",
      genre_ids: [10765, 18, 10759]
    },
    {
      id: 103,
      name: "Stranger Things",
      poster_path: "/49WJfeN0moxb9IPfGn8AIqMGskD.jpg",
      backdrop_path: "/56v2KjBlU4XaOv9rVYEQypROD7P.jpg",
      overview: "When a young boy disappears, his mother and friends must confront terrifying supernatural forces.",
      vote_average: 8.6,
      first_air_date: "2016-07-15",
      media_type: "tv",
      genre_ids: [10765, 9648, 18]
    },
    {
      id: 104,
      name: "The Mandalorian",
      poster_path: "/sWgBv7LV2PRoQgkxwlibdGXKz1S.jpg",
      backdrop_path: "/o7qi2v4uWQ8bZ1tW3KI0Ztn2epk.jpg",
      overview: "After the fall of the Empire, a lone gunfighter makes his way through the lawless galaxy.",
      vote_average: 8.5,
      first_air_date: "2019-11-12",
      media_type: "tv",
      genre_ids: [10765, 10759, 18]
    },
    {
      id: 105,
      name: "The Office",
      poster_path: "/qWnJzyZhyy74gjpSjIXWmuk0ifX.jpg",
      backdrop_path: "/vNpuAxGTl9HsUbHqam3E9CzqCvX.jpg",
      overview: "A mockumentary on a group of typical office workers at a paper company.",
      vote_average: 8.5,
      first_air_date: "2005-03-24",
      media_type: "tv",
      genre_ids: [35]
    }
  ];

  return type === "movie" 
    ? mockMovies.slice(0, count) 
    : mockTVShows.slice(0, count);
}

// Get image URL for posters and backdrops
export function getImageUrl(path: string | null, size: string = "w500"): string {
  if (!path) return "/placeholder.svg";
  return `https://image.tmdb.org/t/p/${size}${path}`;
}
