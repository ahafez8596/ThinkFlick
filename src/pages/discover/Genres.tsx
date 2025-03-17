
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { MediaCard } from "@/components/MediaCard";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MediaType, TMDBMedia } from "@/types";
import { getImageUrl } from "@/services/api";

interface Genre {
  id: number;
  name: string;
}

export default function Genres() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  
  const [mediaType, setMediaType] = useState<MediaType>("movie");
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);
  const [mediaByGenre, setMediaByGenre] = useState<TMDBMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Fetch genres for the selected media type
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/genre/${mediaType}/list?api_key=b795d65c7179a5635df1d1a73f963c6c&language=en-US`
        );
        const data = await response.json();
        setGenres(data.genres || []);
        
        // Reset selection when changing media type
        setSelectedGenre(null);
        setMediaByGenre([]);
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };
    
    fetchGenres();
  }, [mediaType]);
  
  // Fetch media by genre
  useEffect(() => {
    if (!selectedGenre) return;
    
    const fetchMediaByGenre = async () => {
      setLoading(true);
      try {
        const url = `https://api.themoviedb.org/3/discover/${mediaType}?api_key=b795d65c7179a5635df1d1a73f963c6c&with_genres=${selectedGenre}&page=${page}&include_adult=false&sort_by=popularity.desc`;
        const response = await fetch(url);
        const data = await response.json();
        
        setMediaByGenre(data.results.map((item: any) => ({
          ...item,
          media_type: mediaType,
        })));
        setTotalPages(Math.min(data.total_pages, 20)); // Cap at 20 pages
      } catch (error) {
        console.error("Error fetching media by genre:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMediaByGenre();
  }, [selectedGenre, mediaType, page]);
  
  const handleGenreChange = (value: string) => {
    setSelectedGenre(value);
    setPage(1); // Reset to page 1 when changing genre
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader 
        user={user} 
        onLogout={logout} 
        onProfile={() => navigate("/profile")}
        onLogin={() => navigate("/auth")}
      />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-2">Browse by Genre</h1>
        <p className="text-muted-foreground mb-6">Discover movies and TV shows by genre</p>
        
        <Tabs
          defaultValue="movie"
          value={mediaType}
          onValueChange={(value) => setMediaType(value as MediaType)}
          className="mb-8"
        >
          <TabsList>
            <TabsTrigger value="movie">Movies</TabsTrigger>
            <TabsTrigger value="tv">TV Shows</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="flex flex-col md:flex-row gap-6 mb-8">
          <div className="w-full md:w-64">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Filters</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">Genre</label>
                <Select value={selectedGenre || ""} onValueChange={handleGenreChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a genre" />
                  </SelectTrigger>
                  <SelectContent>
                    {genres.map((genre) => (
                      <SelectItem key={genre.id} value={genre.id.toString()}>
                        {genre.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            {loading ? (
              <div className="text-center py-20">
                <p>Loading...</p>
              </div>
            ) : !selectedGenre ? (
              <div className="text-center py-20 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground mb-4">Select a genre to see content</p>
              </div>
            ) : mediaByGenre.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No results found for this genre</p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-medium mb-4">
                  {genres.find(g => g.id.toString() === selectedGenre)?.name || "Results"}
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {mediaByGenre.map((item) => (
                    <div key={item.id} className="cursor-pointer" onClick={() => {}}>
                      <MediaCard media={item} />
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center mt-8">
                  <Button 
                    variant="outline" 
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    Previous
                  </Button>
                  
                  <span className="text-sm">
                    Page {page} of {totalPages}
                  </span>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
