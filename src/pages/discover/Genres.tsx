
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
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

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
  const [sortBy, setSortBy] = useState<string>("popularity.desc");
  const [minRating, setMinRating] = useState(0);
  const [includeAdult, setIncludeAdult] = useState(false);
  const [yearFilter, setYearFilter] = useState<string>("");
  
  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/genre/${mediaType}/list?api_key=b795d65c7179a5635df1d1a73f963c6c&language=en-US`
        );
        const data = await response.json();
        setGenres(data.genres || []);
        
        setSelectedGenre(null);
        setMediaByGenre([]);
      } catch (error) {
        console.error("Error fetching genres:", error);
      }
    };
    
    fetchGenres();
  }, [mediaType]);
  
  useEffect(() => {
    if (!selectedGenre) return;
    
    const fetchMediaByGenre = async () => {
      setLoading(true);
      try {
        // Build the query parameters
        let params = new URLSearchParams({
          api_key: 'b795d65c7179a5635df1d1a73f963c6c',
          with_genres: selectedGenre,
          page: page.toString(),
          include_adult: includeAdult.toString(),
          sort_by: sortBy,
          'vote_average.gte': minRating.toString()
        });
        
        // Add year filter if provided
        if (yearFilter) {
          if (mediaType === "movie") {
            params.append('primary_release_year', yearFilter);
          } else {
            params.append('first_air_date_year', yearFilter);
          }
        }
        
        const url = `https://api.themoviedb.org/3/discover/${mediaType}?${params}`;
        console.log("Fetching genres with URL:", url);
        
        const response = await fetch(url);
        const data = await response.json();
        
        setMediaByGenre(data.results.map((item: any) => ({
          ...item,
          media_type: mediaType,
        })));
        setTotalPages(Math.min(data.total_pages, 20));
      } catch (error) {
        console.error("Error fetching media by genre:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMediaByGenre();
  }, [selectedGenre, mediaType, page, sortBy, minRating, includeAdult, yearFilter]);
  
  const handleGenreChange = (value: string) => {
    setSelectedGenre(value);
    setPage(1);
  };
  
  const handleSortChange = (value: string) => {
    setSortBy(value);
    setPage(1);
  };
  
  const handleRatingChange = (value: number[]) => {
    setMinRating(value[0]);
    setPage(1);
  };
  
  const handleYearChange = (value: string) => {
    setYearFilter(value);
    setPage(1);
  };
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 50 }, (_, i) => (currentYear - i).toString());
  
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
            <div className="space-y-6 sticky top-6">
              <h2 className="text-xl font-semibold mb-4">Filters</h2>
              
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
              
              {selectedGenre && (
                <>
                  <div>
                    <label className="block text-sm font-medium mb-2">Sort By</label>
                    <Select value={sortBy} onValueChange={handleSortChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="popularity.desc">Popularity (High to Low)</SelectItem>
                        <SelectItem value="popularity.asc">Popularity (Low to High)</SelectItem>
                        <SelectItem value="vote_average.desc">Rating (High to Low)</SelectItem>
                        <SelectItem value="vote_average.asc">Rating (Low to High)</SelectItem>
                        <SelectItem value="release_date.desc">Release Date (Newest)</SelectItem>
                        <SelectItem value="release_date.asc">Release Date (Oldest)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Year</label>
                    <Select value={yearFilter} onValueChange={handleYearChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Filter by year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Years</SelectItem>
                        {years.map(year => (
                          <SelectItem key={year} value={year}>{year}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Minimum Rating: {minRating}</label>
                    <Slider
                      value={[minRating]}
                      min={0}
                      max={10}
                      step={0.5}
                      onValueChange={handleRatingChange}
                      className="my-4"
                    />
                    <div className="flex justify-between text-xs">
                      <span>0</span>
                      <span>5</span>
                      <span>10</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="adult-content"
                      checked={includeAdult} 
                      onCheckedChange={(checked) => {
                        setIncludeAdult(checked === true);
                        setPage(1);
                      }}
                    />
                    <Label htmlFor="adult-content">Include Adult Content</Label>
                  </div>
                  
                  <Separator />
                  
                  <Button 
                    onClick={() => {
                      setMinRating(0);
                      setSortBy("popularity.desc");
                      setYearFilter("");
                      setIncludeAdult(false);
                      setPage(1);
                    }}
                    variant="outline"
                    className="w-full"
                  >
                    Reset Filters
                  </Button>
                </>
              )}
            </div>
          </div>
          
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="h-[400px] animate-pulse bg-secondary rounded-lg"></div>
                ))}
              </div>
            ) : !selectedGenre ? (
              <div className="text-center py-20 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground mb-4">Select a genre to see content</p>
              </div>
            ) : mediaByGenre.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No results found for this genre with the current filters</p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-medium mb-4 flex justify-between items-center">
                  <span>
                    {genres.find(g => g.id.toString() === selectedGenre)?.name || "Results"}
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
