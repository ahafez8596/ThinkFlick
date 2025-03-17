
import { useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MediaCard } from "@/components/MediaCard";
import { searchMedia } from "@/services/api";
import { MediaType, TMDBMedia } from "@/types";

interface MediaSearchProps {
  mediaType: MediaType;
  onSelect: (media: TMDBMedia) => void;
}

export function MediaSearch({ mediaType, onSelect }: MediaSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TMDBMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [debounced, setDebounced] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(query), 500);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const fetchResults = async () => {
      if (debounced.trim().length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const data = await searchMedia(debounced, mediaType);
        setResults(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [debounced, mediaType]);

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={`Search ${mediaType === "movie" ? "movies" : "TV shows"}...`}
          className="pl-10"
        />
      </div>

      {loading && (
        <div className="text-center py-4">
          <p>Searching...</p>
        </div>
      )}

      {!loading && results.length === 0 && debounced && (
        <div className="text-center py-4">
          <p>No results found. Try another search term.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {results.map((item) => (
          <div key={item.id} onClick={() => onSelect(item)}>
            <MediaCard media={item} />
          </div>
        ))}
      </div>
    </div>
  );
}
