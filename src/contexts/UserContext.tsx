
import { createContext, useState, useContext, ReactNode } from "react";
import { User, TMDBMedia, MediaType, RecommendationSource } from "@/types";

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loginAsGuest: () => void;
  logout: () => void;
  updatePreferences: (preferences: Partial<User["preferences"]>) => void;
  addLikedMedia: (media: TMDBMedia) => void;
  removeLikedMedia: (mediaId: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const loginAsGuest = () => {
    setUser({
      id: `guest-${Date.now()}`,
      isGuest: true,
      preferences: {
        mediaType: null,
        recentlyWatched: null,
        recommendationCount: 5,
        recommendationSource: "tmdb",
      },
      likedMedia: [],
    });
  };

  const logout = () => {
    setUser(null);
  };

  const updatePreferences = (preferences: Partial<User["preferences"]>) => {
    if (!user) return;
    
    setUser({
      ...user,
      preferences: {
        ...user.preferences,
        ...preferences,
      } as User["preferences"],
    });
  };

  const addLikedMedia = (media: TMDBMedia) => {
    if (!user) return;
    
    setUser({
      ...user,
      likedMedia: [...(user.likedMedia || []), media],
    });
  };

  const removeLikedMedia = (mediaId: number) => {
    if (!user || !user.likedMedia) return;
    
    setUser({
      ...user,
      likedMedia: user.likedMedia.filter((item) => item.id !== mediaId),
    });
  };

  return (
    <UserContext.Provider
      value={{
        user,
        setUser,
        loginAsGuest,
        logout,
        updatePreferences,
        addLikedMedia,
        removeLikedMedia,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
