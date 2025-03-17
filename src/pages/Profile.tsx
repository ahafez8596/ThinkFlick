
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/PageHeader";
import { MediaCard } from "@/components/MediaCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useUser } from "@/contexts/UserContext";
import { HeartIcon, Trash2Icon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const Profile = () => {
  const navigate = useNavigate();
  const { user, logout, removeLikedMedia } = useUser();
  const { toast } = useToast();
  
  if (!user) {
    navigate("/");
    return null;
  }

  const handleRemoveFavorite = (mediaId: number) => {
    removeLikedMedia(mediaId);
    toast({
      title: "Removed from Favorites",
      description: "Item has been removed from your favorites.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader 
        user={user} 
        onLogout={logout}
      />

      <main className="flex-grow flex flex-col p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto w-full space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">Your Profile</h1>
            <p className="text-muted-foreground">
              {user.isGuest 
                ? "You're currently using the app as a guest" 
                : `Signed in as ${user.email}`}
            </p>
          </div>

          <Tabs defaultValue="favorites" className="w-full">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-2">
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="history">Watch History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="favorites" className="mt-6">
              {(!user.likedMedia || user.likedMedia.length === 0) ? (
                <div className="text-center py-12">
                  <HeartIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No favorites yet</h3>
                  <p className="text-muted-foreground mb-6">
                    Movies and shows you like will appear here
                  </p>
                  <Button onClick={() => navigate("/selection")}>
                    Find Something to Watch
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {user.likedMedia.map((item) => (
                    <div key={item.id} className="relative group">
                      <MediaCard media={item} />
                      <div className="absolute top-2 right-2">
                        <Button
                          variant="destructive"
                          size="icon"
                          className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleRemoveFavorite(item.id)}
                        >
                          <Trash2Icon className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="history" className="mt-6">
              {(!user.preferences?.recentlyWatched) ? (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">No watch history</h3>
                  <p className="text-muted-foreground mb-6">
                    Items you use for recommendations will appear here
                  </p>
                  <Button onClick={() => navigate("/selection")}>
                    Get Started
                  </Button>
                </div>
              ) : (
                <div className="max-w-md mx-auto">
                  <h3 className="font-medium mb-2">Recently watched:</h3>
                  <MediaCard media={user.preferences.recentlyWatched} />
                </div>
              )}
            </TabsContent>
          </Tabs>

          <Separator className="my-8" />

          <div className="text-center max-w-md mx-auto">
            <h2 className="text-xl font-semibold mb-4">Account Settings</h2>
            {user.isGuest ? (
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  You're currently using CineSuggest as a guest. Sign up to save your preferences and favorite items.
                </p>
                <Button className="w-full" onClick={() => toast({
                  title: "Feature Coming Soon",
                  description: "User account creation will be available in a future update.",
                })}>
                  Create Account
                </Button>
              </div>
            ) : (
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={logout}
              >
                Log Out
              </Button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
