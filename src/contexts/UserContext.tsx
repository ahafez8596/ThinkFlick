
import { createContext, useState, useContext, ReactNode } from "react";
import { User, TMDBMedia } from "@/types";
import { Session } from "@supabase/supabase-js";
import { useAuth } from "@/hooks/useAuth";
import { useUserPreferences } from "@/hooks/useUserPreferences";
import { useLikedMedia } from "@/hooks/useLikedMedia";
import { useUserData } from "@/hooks/useUserData";

interface UserContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  loginAsGuest: () => void;
  logout: () => void;
  updatePreferences: (preferences: Partial<User["preferences"]>) => void;
  addLikedMedia: (media: TMDBMedia) => void;
  removeLikedMedia: (mediaId: number) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { 
    user, 
    session, 
    loading, 
    setUser, 
    loginAsGuest, 
    logout 
  } = useAuth();
  
  const { updatePreferences } = useUserPreferences(user, setUser);
  const { addLikedMedia, removeLikedMedia } = useLikedMedia(user, setUser);
  
  // Load user data when session changes
  useUserData(user, session, setUser);

  return (
    <UserContext.Provider
      value={{
        user,
        session,
        loading,
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
