
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { useUser } from "@/contexts/UserContext";
import { MediaCard } from "@/components/MediaCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { HeartIcon, TrashIcon } from "lucide-react";

export default function Profile() {
  const { user, logout, removeLikedMedia } = useUser();
  const navigate = useNavigate();

  if (!user) {
    navigate("/");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader 
        user={user} 
        onLogout={logout} 
        onProfile={() => navigate("/profile")}
      />

      <main className="flex-grow container max-w-6xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground mt-2">
              Manage your ThinkFlick account and preferences
            </p>
          </div>

          <Tabs defaultValue="favorites" className="w-full">
            <TabsList className="grid w-full md:w-[400px] grid-cols-2">
              <TabsTrigger value="favorites">Favorites</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
            </TabsList>
            
            <TabsContent value="favorites" className="space-y-6 mt-6">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <HeartIcon className="h-5 w-5 text-red-500" />
                My Favorites
              </h2>
              
              {user.likedMedia && user.likedMedia.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {user.likedMedia.map((media) => (
                    <div key={media.id} className="relative group">
                      <MediaCard media={media} />
                      <button 
                        onClick={() => removeLikedMedia(media.id)}
                        className="absolute top-2 right-2 bg-black/70 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove from favorites"
                      >
                        <TrashIcon className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-muted/30 rounded-lg">
                  <p className="text-muted-foreground mb-4">You haven't added any favorites yet.</p>
                  <Button 
                    variant="outline" 
                    onClick={() => navigate("/selection")}
                  >
                    Find Something to Watch
                  </Button>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="account" className="space-y-6 mt-6">
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Account Information</h2>
                <div className="grid gap-4 p-6 border rounded-lg bg-card">
                  <div>
                    <h3 className="font-medium text-muted-foreground">Account Type</h3>
                    <p className="text-lg">{user.isGuest ? "Guest Account" : "Registered Account"}</p>
                  </div>
                  
                  {user.email && (
                    <div>
                      <h3 className="font-medium text-muted-foreground">Email</h3>
                      <p className="text-lg break-all">{user.email}</p>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-medium text-muted-foreground">User ID</h3>
                    <p className="text-sm break-all opacity-50">{user.id}</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Account Actions</h2>
                <div className="flex flex-col md:flex-row gap-4">
                  {user.isGuest && (
                    <Button 
                      variant="outline" 
                      onClick={() => navigate("/auth")}
                    >
                      Create an Account
                    </Button>
                  )}
                  
                  <Button 
                    variant="destructive" 
                    onClick={logout}
                  >
                    Log Out
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
