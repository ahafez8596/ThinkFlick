
import { FilmIcon, TvIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { MediaType } from "@/types";

interface MediaTypeSelectorProps {
  onSelect: (type: MediaType) => void;
}

export function MediaTypeSelector({ onSelect }: MediaTypeSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
      <Card 
        className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg flex flex-col"
        onClick={() => onSelect("movie")}
      >
        <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
          <FilmIcon className="h-16 w-16 text-accent" />
          <div className="text-center">
            <h3 className="text-xl font-bold">Movies</h3>
            <p className="text-muted-foreground mt-2">
              Get personalized movie recommendations based on what you've watched
            </p>
          </div>
        </CardContent>
      </Card>

      <Card 
        className="cursor-pointer transition-all hover:scale-105 hover:shadow-lg flex flex-col"
        onClick={() => onSelect("tv")}
      >
        <CardContent className="p-6 flex flex-col items-center justify-center space-y-4">
          <TvIcon className="h-16 w-16 text-accent" />
          <div className="text-center">
            <h3 className="text-xl font-bold">TV Shows</h3>
            <p className="text-muted-foreground mt-2">
              Discover new TV series based on your viewing history
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
