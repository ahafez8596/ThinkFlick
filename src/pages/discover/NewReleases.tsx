
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { MediaCard } from "@/components/MediaCard";
import { MediaType, TMDBMedia } from "@/types";
import { getImageUrl } from "@/services/api";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";

export default function NewReleases() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  
  const [mediaType, setMediaType] = useState<MediaType>("movie");
  const [timeWindow, setTimeWindow] = useState<string>("week");
  const [sortBy, setSortBy] = useState<string>("popularity.desc");
  const [minRating, setMinRating] = useState(0);
  const [includeAdult, setIncludeAdult] = useState(false);
  const [yearFilter, setYearFilter] = useState<string>("");
  const [newReleases, setNewReleases] = useState<TMDBMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    const fetchNewReleases = async () => {
      setLoading(true);
      try {
        // Build the query parameters
        let params = new URLSearchParams({
          api_key: 'b795d65c7179a5635df1d1a73f963c6c',
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
        
        let url;
        if (mediaType === "movie") {
          if (timeWindow === "upcoming") {
            url = `https://api.themoviedb.org/3/movie/upcoming?${params}`;
          } else if (timeWindow === "top_rated") {
            url = `https://api.themoviedb.org/3/movie/top_rated?${params}`;
          } else {
            url = `https://api.themoviedb.org/3/movie/now_playing?${params}`;
          }
        } else {
          if (timeWindow === "top_rated") {
            url = `https://api.themoviedb.org/3/tv/top_rated?${params}`;
          } else if (timeWindow === "airing_today") {
            url = `https://api.themoviedb.org/3/tv/airing_today?${params}`;
          } else {
            url = `https://api.themoviedb.org/3/tv/on_the_air?${params}`;
          }
        }
        
        console.log("Fetching new releases with URL:", url);
        const response = await fetch(url);
        const data = await response.json();
        
        setNewReleases(data.results.map((item: any) => ({
          ...item,
          media_type: mediaType,
        })));
        setTotalPages(Math.min(data.total_pages, 20));
      } catch (error) {
        console.error("Error fetching new releases:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNewReleases();
  }, [mediaType, timeWindow, page, sortBy, minRating, includeAdult, yearFilter]);
  
  const handleTimeWindowChange = (value: string) => {
    setTimeWindow(value);
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
  
  const getTimeWindowOptions = () => {
    if (mediaType === "movie") {
      return (
        <>
          <SelectItem value="now_playing">Now Playing</SelectItem>
          <SelectItem value="upcoming">Upcoming</SelectItem>
          <SelectItem value="top_rated">Top Rated</SelectItem>
        </>
      );
    } else {
      return (
        <>
          <SelectItem value="on_the_air">On The Air</SelectItem>
          <SelectItem value="airing_today">Airing Today</SelectItem>
          <SelectItem value="top_rated">Top Rated</SelectItem>
        </>
      );
    }
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
        <h1 className="text-3xl font-bold mb-2">New Releases</h1>
        <p className="text-muted-foreground mb-6">Discover the latest movies and TV shows</p>
        
        <Tabs
          defaultValue="movie"
          value={mediaType}
          onValueChange={(value) => {
            setMediaType(value as MediaType);
            setTimeWindow(value === "movie" ? "now_playing" : "on_the_air");
            setPage(1);
          }}
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
                <label className="block text-sm font-medium mb-2">Category</label>
                <Select value={timeWindow} onValueChange={handleTimeWindowChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {getTimeWindowOptions()}
                  </SelectContent>
                </Select>
              </div>
              
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
                  setTimeWindow(mediaType === "movie" ? "now_playing" : "on_the_air");
                  setPage(1);
                }}
                variant="outline"
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>
          </div>
          
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[...Array(12)].map((_, i) => (
                  <div key={i} className="h-[400px] animate-pulse bg-secondary rounded-lg"></div>
                ))}
              </div>
            ) : newReleases.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No results found with the current filters</p>
                <Button variant="outline" className="mt-4" onClick={() => setPage(1)}>Reset Filters</Button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-medium mb-4 flex justify-between items-center">
                  <span>
                    {mediaType === "movie" ? "Movies" : "TV Shows"} 
                    {yearFilter && ` (${yearFilter})`}
                    {minRating > 0 && ` (${minRating}+ rating)`}
                  </span>
                  <Badge variant="outline">{newReleases.length} results</Badge>
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {newReleases.map((item) => (
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
