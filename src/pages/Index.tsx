
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/PageHeader";
import { useUser } from "@/contexts/UserContext";
import { useToast } from "@/components/ui/use-toast";

const Index = () => {
  const { user, loginAsGuest, logout } = useUser();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user) {
      navigate("/selection");
    } else {
      loginAsGuest();
      toast({
        title: "Welcome, Guest!",
        description: "You're now using CineSuggest as a guest.",
      });
      navigate("/selection");
    }
  };

  const handleLogin = () => {
    // In a real app, this would redirect to a login page
    // For now, we'll just log in as a guest
    loginAsGuest();
    toast({
      title: "Welcome, Guest!",
      description: "You're now using CineSuggest as a guest.",
    });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader 
        user={user} 
        onLogin={handleLogin} 
        onLogout={logout}
        onProfile={() => navigate("/profile")}
      />
      
      <main className="flex-grow flex flex-col">
        <section className="py-12 md:py-24 lg:py-32 flex flex-col items-center justify-center flex-grow px-4">
          <div className="container px-4 md:px-6 space-y-10 text-center">
            <div className="space-y-4">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                Discover Your Next Favorite{" "}
                <span className="text-accent">Watch</span>
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-500 md:text-xl dark:text-gray-400">
                CineSuggest AI uses advanced technology to recommend movies and TV shows 
                tailored specifically to your taste.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" onClick={handleGetStarted}>
                Get Started
              </Button>
              {!user && (
                <Button variant="outline" size="lg" onClick={handleLogin}>
                  Continue as Guest
                </Button>
              )}
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24 bg-muted/50">
          <div className="container px-4 md:px-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 2v8" />
                    <path d="m4.93 10.93 1.41 1.41" />
                    <path d="M2 18h2" />
                    <path d="M20 18h2" />
                    <path d="m19.07 10.93-1.41 1.41" />
                    <path d="M22 22H2" />
                    <path d="M16 6h-4l-2 6h4l-2 6h8" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">AI Powered</h3>
                <p className="text-sm text-muted-foreground">
                  Get smart recommendations powered by advanced AI algorithms
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14 2 14 8 20 8" />
                    <circle cx="10" cy="13" r="2" />
                    <path d="m20 17-1.09-1.09a2 2 0 0 0-2.82 0L10 22" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Personalized</h3>
                <p className="text-sm text-muted-foreground">
                  Recommendations tailored to your unique viewing preferences
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 text-center">
                <div className="rounded-full bg-primary/10 p-4">
                  <svg
                    className="h-6 w-6 text-primary"
                    fill="none"
                    height="24"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    width="24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold">Discover</h3>
                <p className="text-sm text-muted-foreground">
                  Find hidden gems and new releases that match your interests
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-6 border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row px-4 md:px-6">
          <p className="text-sm text-muted-foreground">
            © 2023 CineSuggest AI. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Button variant="ghost" size="sm">
              Terms
            </Button>
            <Button variant="ghost" size="sm">
              Privacy
            </Button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
