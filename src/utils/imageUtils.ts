
import { TMDB_CONFIG } from "@/config/api";

// Get image URL for posters and backdrops
export function getImageUrl(path: string | null, size: string = "w500"): string {
  if (!path) return "/placeholder.svg";
  return `${TMDB_CONFIG.IMAGE_BASE_URL}/${size}${path}`;
}
