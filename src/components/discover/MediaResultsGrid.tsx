
import { TMDBMedia } from "@/types";
import { MediaCard } from "@/components/MediaCard";
import { Badge } from "@/components/ui/badge";

interface MediaResultsGridProps {
  loading: boolean;
  mediaByGenre: TMDBMedia[];
  selectedGenre: string | null;
  genreName: string;
  yearFilter: string;
  minRating: number;
}

export function MediaResultsGrid({
  loading,
  mediaByGenre,
  selectedGenre,
  genreName,
  yearFilter,
  minRating
}: MediaResultsGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="h-[400px] animate-pulse bg-secondary rounded-lg"></div>
        ))}
      </div>
    );
  }
  
  if (!selectedGenre) {
    return (
      <div className="text-center py-20 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground mb-4">Select a genre to see content</p>
      </div>
    );
  }
  
  if (mediaByGenre.length === 0) {
    return (
      <div className="text-center py-20 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">No results found for this genre with the current filters</p>
      </div>
    );
  }
  
  return (
    <>
      <h3 className="text-lg font-medium mb-4 flex justify-between items-center">
        <span>
          {genreName || "Results"}
          {yearFilter && ` (${yearFilter})`}
          {minRating > 0 && ` (${minRating}+ rating)`}
        </span>
        <Badge variant="outline">{mediaByGenre.length} results</Badge>
      </h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {mediaByGenre.map((item) => (
          <div key={item.id} className="cursor-pointer" onClick={() => {}}>
            <MediaCard media={item} />
          </div>
        ))}
      </div>
    </>
  );
}
