
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { MediaCard } from "@/components/MediaCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/contexts/UserContext";
import { TMDBMedia } from "@/types";
import { getRecommendations, getImageUrl } from "@/services/api";
import { BookmarkIcon, HeartIcon, RefreshCwIcon, Share2Icon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Recommendations = () => {
  const navigate = useNavigate();
  const { user, logout, addLikedMedia } = useUser();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<TMDBMedia[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!user || !user.preferences?.mediaType || !user.preferences?.recentlyWatched) {
      navigate("/selection");
      return;
    }

    const fetchRecommendations = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const { mediaType, recentlyWatched, recommendationCount, recommendationSource } = user.preferences;
        
        const results = await getRecommendations(
          recentlyWatched.id,
          mediaType,
          recommendationCount,
          recommendationSource
        );

        setRecommendations(results);
      } catch (err) {
        console.error("Failed to fetch recommendations:", err);
        setError("Failed to fetch recommendations. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [user, navigate]);

  const handleRefresh = () => {
    if (!user?.preferences) return;
    
    const { mediaType, recentlyWatched, recommendationCount, recommendationSource } = user.preferences;
    
    setLoading(true);
    getRecommendations(
      recentlyWatched!.id,
      mediaType!,
      recommendationCount,
      recommendationSource
    )
      .then(results => {
        setRecommendations(results);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to refresh recommendations:", err);
        setError("Failed to refresh recommendations. Please try again.");
        setLoading(false);
      });
  };

  const handleLike = (media: TMDBMedia) => {
    addLikedMedia(media);
    toast({
      title: "Added to Favorites",
      description: `${media.title || media.name} has been added to your favorites.`,
    });
  };

  const handleShare = (media: TMDBMedia) => {
    if (navigator.share) {
      navigator.share({
        title: `Check out ${media.title || media.name}`,
        text: media.overview,
        url: window.location.href,
      }).catch(err => console.error("Error sharing:", err));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link Copied",
        description: "Link has been copied to clipboard!",
      });
    }
  };

  if (!user) {
    navigate("/");
    return null;
  }

  const { recentlyWatched, recommendationSource } = user.preferences || {};
  const recentTitle = recentlyWatched?.title || recentlyWatched?.name;

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader 
        user={user} 
        onLogout={logout} 
        onProfile={() => navigate("/profile")}
      />

      <main className="flex-grow flex flex-col p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto w-full space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Your Recommendations</h1>
            {recentlyWatched && (
              <p className="text-muted-foreground">
                Based on your interest in <span className="font-medium text-foreground">{recentTitle}</span> using{" "}
                <span className="font-medium text-foreground">
                  {recommendationSource === "ai" ? "AI" : "TMDB"} recommendations
                </span>
              </p>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(user?.preferences?.recommendationCount || 5)].map((_, i) => (
                <div key={i} className="flex flex-col gap-2">
                  <Skeleton className="aspect-[2/3] w-full h-[320px] rounded-md" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={handleRefresh}>Try Again</Button>
            </div>
          ) : (
            <>
              {recentlyWatched && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold mb-4">Because you watched:</h2>
                  <div className="flex items-start space-x-4 p-4 glass-card rounded-lg">
                    <div className="w-20 md:w-32 flex-shrink-0">
                      <img 
                        src={getImageUrl(recentlyWatched.poster_path)} 
                        alt={recentTitle}
                        className="rounded-md w-full" 
                      />
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-medium mb-1">{recentTitle}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {recentlyWatched.overview}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">We think you'll like:</h2>
                <Button variant="outline" size="sm" onClick={handleRefresh}>
                  <RefreshCwIcon className="h-4 w-4 mr-2" />
                  Refresh
                </Button>
              </div>

              {recommendations.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">No recommendations found. Try a different title or refresh.</p>
                  <Button onClick={() => navigate("/selection")}>Try Another Title</Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {recommendations.map((item) => (
                    <div key={item.id} className="relative group">
                      <MediaCard media={item} />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-md">
                        <div className="flex space-x-2">
                          <Button 
                            variant="secondary" 
                            size="icon"
                            onClick={() => handleLike(item)}
                          >
                            <HeartIcon className="h-5 w-5" />
                          </Button>
                          <Button 
                            variant="secondary" 
                            size="icon" 
                            onClick={() => handleShare(item)}
                          >
                            <Share2Icon className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          <div className="mt-8 pt-4 flex justify-center">
            <Button variant="outline" onClick={() => navigate("/selection")}>
              Get New Recommendations
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Recommendations;
