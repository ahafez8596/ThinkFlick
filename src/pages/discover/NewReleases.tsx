import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { useUser } from "@/contexts/UserContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MediaCard } from "@/components/MediaCard";
import { MediaType, TMDBMedia } from "@/types";
import { getImageUrl } from "@/services/api";
import { Footer } from "@/components/Footer";

export default function NewReleases() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  
  const [mediaType, setMediaType] = useState<MediaType>("movie");
  const [timeWindow, setTimeWindow] = useState<string>("week");
  const [newReleases, setNewReleases] = useState<TMDBMedia[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  useEffect(() => {
    const fetchNewReleases = async () => {
      setLoading(true);
      try {
        let url;
        
        if (mediaType === "movie") {
          url = `https://api.themoviedb.org/3/movie/now_playing?api_key=b795d65c7179a5635df1d1a73f963c6c&page=${page}&include_adult=false`;
        } else {
          url = `https://api.themoviedb.org/3/tv/on_the_air?api_key=b795d65c7179a5635df1d1a73f963c6c&page=${page}&include_adult=false`;
        }
        
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
  }, [mediaType, page]);
  
  const handleTimeWindowChange = (value: string) => {
    setTimeWindow(value);
    setPage(1);
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
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Filters</h2>
              
              <div>
                <label className="block text-sm font-medium mb-2">Time Window</label>
                <Select value={timeWindow} onValueChange={handleTimeWindowChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select time window" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
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
            ) : newReleases.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed rounded-lg">
                <p className="text-muted-foreground">No new releases found</p>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-medium mb-4">
                  New {mediaType === "movie" ? "Movies" : "TV Shows"}
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
