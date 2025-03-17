
import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="py-6 border-t">
      <div className="container flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-6">
        <div className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} ThinkFlick. All rights reserved.
        </div>
        
        <div className="flex flex-wrap justify-center gap-4">
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/legal/privacy-policy" className="text-muted-foreground hover:text-foreground transition">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/legal/terms-of-service" className="text-muted-foreground hover:text-foreground transition">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/legal/cookie-policy" className="text-muted-foreground hover:text-foreground transition">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/legal/dmca" className="text-muted-foreground hover:text-foreground transition">
                  DMCA
                </Link>
              </li>
            </ul>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-sm font-medium">Discover</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/discover/genres" className="text-muted-foreground hover:text-foreground transition">
                  Genres
                </Link>
              </li>
              <li>
                <Link to="/discover/new-releases" className="text-muted-foreground hover:text-foreground transition">
                  New Releases
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
