
import { MediaType, TMDBMedia } from "@/types";
import { TMDB_CONFIG } from "@/config/api";

// Search for movies or TV shows based on user query
export async function searchMedia(query: string, type: MediaType): Promise<TMDBMedia[]> {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/search/${type}?api_key=${TMDB_CONFIG.API_KEY}&query=${encodeURIComponent(query)}`
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

// Get genres list by ID
export async function getGenresById(mediaType: MediaType): Promise<{[id: number]: string}> {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/genre/${mediaType}/list?api_key=${TMDB_CONFIG.API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    const genresMap: {[id: number]: string} = {};
    
    data.genres.forEach((genre: {id: number, name: string}) => {
      genresMap[genre.id] = genre.name;
    });
    
    return genresMap;
  } catch (error) {
    console.error("Error fetching genres:", error);
    return {};
  }
}

// Get new releases from TMDB
export async function getNewReleases(mediaType: MediaType, page: number = 1): Promise<TMDBMedia[]> {
  try {
    const endpoint = mediaType === "movie" ? "now_playing" : "on_the_air";
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/${mediaType}/${endpoint}?api_key=${TMDB_CONFIG.API_KEY}&page=${page}`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results.map((item: any) => ({
      ...item,
      media_type: mediaType,
    }));
  } catch (error) {
    console.error("Error fetching new releases:", error);
    return [];
  }
}

// Get movies or TV shows by genre
export async function getMediaByGenre(mediaType: MediaType, genreId: number, page: number = 1): Promise<TMDBMedia[]> {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/discover/${mediaType}?api_key=${TMDB_CONFIG.API_KEY}&with_genres=${genreId}&page=${page}`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data.results.map((item: any) => ({
      ...item,
      media_type: mediaType,
    }));
  } catch (error) {
    console.error("Error fetching media by genre:", error);
    return [];
  }
}

// Get media details from TMDB
export async function getMediaDetails(mediaId: number, mediaType: MediaType): Promise<any> {
  try {
    const response = await fetch(
      `${TMDB_CONFIG.BASE_URL}/${mediaType}/${mediaId}?api_key=${TMDB_CONFIG.API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error fetching media details:", error);
    return null;
  }
}
