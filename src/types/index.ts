
export type MediaType = "movie" | "tv";

export interface TMDBMedia {
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

export type RecommendationSource = "tmdb" | "ai";

export interface UserPreferences {
  mediaType: MediaType | null;
  recentlyWatched: TMDBMedia | null;
  recommendationCount: number;
  recommendationSource: RecommendationSource;
}

export interface User {
  id: string;
  email?: string;
  isGuest: boolean;
  preferences?: UserPreferences;
  likedMedia?: TMDBMedia[];
}
