
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TMDBMedia } from "@/types";
import { getImageUrl } from "@/services/api";

interface MediaCardProps {
  media: TMDBMedia;
  onClick?: () => void;
}

export function MediaCard({ media, onClick }: MediaCardProps) {
  const title = media.title || media.name || "Unknown Title";
  const releaseDate = media.release_date || media.first_air_date;
  const year = releaseDate ? new Date(releaseDate).getFullYear() : null;
  
  return (
    <Card 
      className="overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 h-full flex flex-col"
      onClick={onClick}
    >
      <div className="movie-poster">
        <img
          src={getImageUrl(media.poster_path)}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          loading="lazy"
        />
      </div>
      <CardContent className="p-4 flex flex-col flex-grow">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{title}</h3>
        <div className="flex justify-between items-center mb-2">
          {year && <span className="text-sm text-muted-foreground">{year}</span>}
          <Badge variant={media.vote_average >= 7 ? "default" : "secondary"}>
            {media.vote_average.toFixed(1)}
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground line-clamp-3 mt-auto">{media.overview}</p>
      </CardContent>
    </Card>
  );
}
