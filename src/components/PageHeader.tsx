
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { User } from "@/types";

interface PageHeaderProps {
  user: User | null;
  onLogin?: () => void;
  onLogout?: () => void;
  onProfile?: () => void;
}

export function PageHeader({ user, onLogin, onLogout, onProfile }: PageHeaderProps) {
  return (
    <header className="w-full py-4 px-4 sm:px-6 flex justify-between items-center border-b">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold mr-2">ThinkFlick</h1>
        <span className="text-accent font-semibold">AI</span>
      </div>
      
      <div className="flex items-center space-x-2">
        {user ? (
          <>
            <Button variant="ghost" onClick={onProfile}>
              {user.isGuest ? "Guest" : user.email || "Profile"}
            </Button>
            <Button variant="outline" onClick={onLogout}>
              Logout
            </Button>
          </>
        ) : (
          <Button onClick={onLogin}>Login</Button>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
