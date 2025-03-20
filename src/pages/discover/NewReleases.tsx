
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { useUser } from "@/contexts/UserContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaType, TMDBMedia } from "@/types";
import { Footer } from "@/components/Footer";
import { NewReleasesFilters } from "@/components/discover/NewReleasesFilters";
import { MediaResultsGrid } from "@/components/discover/MediaResultsGrid";
import { GenrePagination } from "@/components/discover/GenrePagination";

export default function NewReleases() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  
  const [mediaType, setMediaType] = useState<MediaType>("movie");
  const [timeWindow, setTimeWindow] = useState<string>("now_playing");
  const [sortBy, setSortBy] = useState<string>("popularity.desc");
  const [minRating, setMinRating] = useState(0);
  const [includeAdult, setIncludeAdult] = useState(false);
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [newReleases, setNewReleases] = useState<TMDBMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    const fetchNewReleases = async () => {
      setLoading(true);
      try {
        // Base parameters that apply to all endpoints
        let params = new URLSearchParams({
          api_key: 'b795d65c7179a5635df1d1a73f963c6c',
          page: page.toString(),
          include_adult: includeAdult.toString(),
        });
        
        // Add year filter if provided and not set to "all"
        if (yearFilter && yearFilter !== "all") {
          if (mediaType === "movie") {
            params.append('primary_release_year', yearFilter);
          } else {
            params.append('first_air_date_year', yearFilter);
          }
        }
        
        // Add min rating filter if set
        if (minRating > 0) {
          params.append('vote_average.gte', minRating.toString());
        }
        
        // For sorting the endpoint results (only for discover endpoints)
        let discoverParams = new URLSearchParams(params);
        if (sortBy) {
          discoverParams.append('sort_by', sortBy);
        }
        
        let url;
        let useDiscover = false;
        
        if (mediaType === "movie") {
          if (timeWindow === "upcoming") {
            url = `https://api.themoviedb.org/3/movie/upcoming?${params}`;
          } else if (timeWindow === "top_rated") {
            url = `https://api.themoviedb.org/3/movie/top_rated?${params}`;
          } else {
            url = `https://api.themoviedb.org/3/movie/now_playing?${params}`;
          }
          
          // If we have specific filters, we need to use discover endpoint instead
          if ((yearFilter && yearFilter !== "all") || minRating > 0 || sortBy !== "popularity.desc") {
            url = `https://api.themoviedb.org/3/discover/movie?${discoverParams}`;
            useDiscover = true;
          }
        } else {
          if (timeWindow === "top_rated") {
            url = `https://api.themoviedb.org/3/tv/top_rated?${params}`;
          } else if (timeWindow === "airing_today") {
            url = `https://api.themoviedb.org/3/tv/airing_today?${params}`;
          } else {
            url = `https://api.themoviedb.org/3/tv/on_the_air?${params}`;
          }
          
          // If we have specific filters, we need to use discover endpoint instead
          if ((yearFilter && yearFilter !== "all") || minRating > 0 || sortBy !== "popularity.desc") {
            url = `https://api.themoviedb.org/3/discover/tv?${discoverParams}`;
            useDiscover = true;
          }
        }
        
        console.log("Fetching new releases with URL:", url);
        const response = await fetch(url);
        const data = await response.json();
        
        setNewReleases(data.results.map((item: any) => ({
          ...item,
          media_type: mediaType,
        })));
        setTotalPages(Math.min(data.total_pages || 1, 20));
      } catch (error) {
        console.error("Error fetching new releases:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchNewReleases();
  }, [mediaType, timeWindow, page, sortBy, minRating, includeAdult, yearFilter]);
  
  // Event handlers for the filters
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
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  
  const handleResetFilters = () => {
    setMinRating(0);
    setSortBy("popularity.desc");
    setYearFilter("");
    setIncludeAdult(false);
    setTimeWindow(mediaType === "movie" ? "now_playing" : "on_the_air");
    setPage(1);
  };
  
  const categoryLabel = mediaType === "movie" ? "Movies" : "TV Shows";
  
  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader 
        user={user} 
        onLogout={logout} 
        onProfile={() => navigate("/profile")}
        onLogin={() => navigate("/auth")}
        onHome={() => navigate("/")}
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
          {/* Filters sidebar */}
          <div className="w-full md:w-64">
            <NewReleasesFilters 
              mediaType={mediaType}
              timeWindow={timeWindow}
              onTimeWindowChange={handleTimeWindowChange}
              sortBy={sortBy}
              onSortChange={handleSortChange}
              minRating={minRating}
              onRatingChange={handleRatingChange}
              includeAdult={includeAdult}
              onAdultContentChange={setIncludeAdult}
              yearFilter={yearFilter}
              onYearChange={handleYearChange}
              onResetFilters={handleResetFilters}
            />
          </div>
          
          {/* Results grid */}
          <div className="flex-1">
            <MediaResultsGrid 
              loading={loading}
              mediaByGenre={newReleases}
              selectedGenre="new-releases"
              genreName={categoryLabel}
              yearFilter={yearFilter}
              minRating={minRating}
            />
            
            {/* Pagination */}
            {!loading && newReleases.length > 0 && (
              <GenrePagination 
                currentPage={page}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
