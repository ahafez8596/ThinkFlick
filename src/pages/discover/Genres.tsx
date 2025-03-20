
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { useUser } from "@/contexts/UserContext";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MediaType, TMDBMedia } from "@/types";
import { Footer } from "@/components/Footer";
import { GenreFilters } from "@/components/discover/GenreFilters";
import { MediaResultsGrid } from "@/components/discover/MediaResultsGrid";
import { GenrePagination } from "@/components/discover/GenrePagination";

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
  const [yearFilter, setYearFilter] = useState<string>("all");
  
  // Fetch genres when media type changes
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
  
  // Fetch media by genre when filters change
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
        });
        
        // Add minimum rating filter if set
        if (minRating > 0) {
          params.append('vote_average.gte', minRating.toString());
        }
        
        // Add year filter if provided and not set to "all"
        if (yearFilter && yearFilter !== "all") {
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
        setTotalPages(Math.min(data.total_pages || 1, 20));
      } catch (error) {
        console.error("Error fetching media by genre:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMediaByGenre();
  }, [selectedGenre, mediaType, page, sortBy, minRating, includeAdult, yearFilter]);
  
  // Event handlers
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
  
  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };
  
  const handleResetFilters = () => {
    setMinRating(0);
    setSortBy("popularity.desc");
    setYearFilter("");
    setIncludeAdult(false);
    setPage(1);
  };
  
  // Get the selected genre name for display
  const selectedGenreName = genres.find(g => g.id.toString() === selectedGenre)?.name || "";
  
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
          {/* Filters sidebar */}
          <div className="w-full md:w-64">
            <GenreFilters 
              genres={genres}
              selectedGenre={selectedGenre}
              onGenreChange={handleGenreChange}
              sortBy={sortBy}
              onSortChange={handleSortChange}
              minRating={minRating}
              onRatingChange={handleRatingChange}
              includeAdult={includeAdult}
              onAdultContentChange={setIncludeAdult}
              yearFilter={yearFilter}
              onYearChange={handleYearChange}
              onResetFilters={handleResetFilters}
              mediaType={mediaType}
            />
          </div>
          
          {/* Results grid */}
          <div className="flex-1">
            <MediaResultsGrid 
              loading={loading}
              mediaByGenre={mediaByGenre}
              selectedGenre={selectedGenre}
              genreName={selectedGenreName}
              yearFilter={yearFilter}
              minRating={minRating}
            />
            
            {/* Pagination */}
            {!loading && selectedGenre && mediaByGenre.length > 0 && (
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
