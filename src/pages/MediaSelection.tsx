
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { MediaTypeSelector } from "@/components/MediaTypeSelector";
import { MediaSearch } from "@/components/MediaSearch";
import { RecommendationOptions } from "@/components/RecommendationOptions";
import { Button } from "@/components/ui/button";
import { useUser } from "@/contexts/UserContext";
import { MediaType, TMDBMedia, RecommendationSource } from "@/types";
import { useToast } from "@/components/ui/use-toast";

const MediaSelection = () => {
  const navigate = useNavigate();
  const { user, logout, updatePreferences } = useUser();
  const { toast } = useToast();
  
  const [step, setStep] = useState<number>(1);
  const [mediaType, setMediaType] = useState<MediaType | null>(
    user?.preferences?.mediaType || null
  );
  const [selectedMedia, setSelectedMedia] = useState<TMDBMedia | null>(
    user?.preferences?.recentlyWatched || null
  );
  const [recommendationCount, setRecommendationCount] = useState<number>(
    user?.preferences?.recommendationCount || 5
  );
  const [recommendationSource, setRecommendationSource] = useState<RecommendationSource>(
    user?.preferences?.recommendationSource || "tmdb"
  );

  if (!user) {
    navigate("/");
    return null;
  }

  const handleMediaTypeSelected = (type: MediaType) => {
    setMediaType(type);
    updatePreferences({ mediaType: type });
    setStep(2);
  };

  const handleMediaSelected = (media: TMDBMedia) => {
    setSelectedMedia(media);
    updatePreferences({ recentlyWatched: media });
    setStep(3);
  };

  const handleGetRecommendations = () => {
    if (!mediaType || !selectedMedia) {
      toast({
        title: "Missing information",
        description: "Please select a media type and a recently watched item.",
        variant: "destructive",
      });
      return;
    }

    updatePreferences({
      recommendationCount,
      recommendationSource,
    });

    navigate("/recommendations");
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      navigate("/");
    }
  };

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
            <h1 className="text-3xl font-bold">
              {step === 1 && "What are you looking for?"}
              {step === 2 && `What ${mediaType === "movie" ? "movie" : "TV show"} have you recently watched?`}
              {step === 3 && "Customize your recommendations"}
            </h1>
            <p className="text-muted-foreground">
              {step === 1 && "Select whether you want movie or TV show recommendations"}
              {step === 2 && "Search for a title you've recently enjoyed"}
              {step === 3 && "Choose how many recommendations you want and the recommendation source"}
            </p>
          </div>

          <div className="mt-8">
            {step === 1 && (
              <MediaTypeSelector onSelect={handleMediaTypeSelected} />
            )}

            {step === 2 && mediaType && (
              <MediaSearch mediaType={mediaType} onSelect={handleMediaSelected} />
            )}

            {step === 3 && (
              <RecommendationOptions
                count={recommendationCount}
                setCount={setRecommendationCount}
                source={recommendationSource}
                setSource={setRecommendationSource}
                onSubmit={handleGetRecommendations}
              />
            )}
          </div>

          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            
            {step < 3 && selectedMedia && (
              <Button onClick={() => setStep(step + 1)}>
                Next
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default MediaSelection;
