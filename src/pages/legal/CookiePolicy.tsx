import { PageHeader } from "@/components/PageHeader";
import { Footer } from "@/components/Footer";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

export default function CookiePolicy() {
  const { user, logout } = useUser();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col">
      <PageHeader 
        user={user} 
        onLogout={logout} 
        onProfile={() => navigate("/profile")}
        onLogin={() => navigate("/auth")}
      />
      
      <main className="flex-grow container max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Cookie Policy</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. What Are Cookies</h2>
          <p>
            Cookies are small text files that are placed on your computer or mobile device when you visit a website.
            They are widely used to make websites work more efficiently and provide information to the owners of the site.
            Cookies can be "persistent" or "session" cookies.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Cookies</h2>
          <p>
            We use cookies for the following purposes:
          </p>
          <ul className="list-disc pl-5 mb-4">
            <li>To enable certain functions of the Service</li>
            <li>To provide analytics</li>
            <li>To store your preferences</li>
            <li>To enable advertisements delivery, including behavioral advertising</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Types of Cookies We Use</h2>
          <p>
            The Service uses the following types of cookies:
          </p>
          <ul className="list-disc pl-5 mb-4">
            <li><strong>Essential cookies:</strong> These cookies are essential to provide you with services available through the website and to enable you to use some of its features. Without these cookies, the services that you have asked for cannot be provided, and we only use these cookies to provide you with those services.</li>
            <li><strong>Functionality cookies:</strong> These cookies allow our website to remember choices you make when you use our website. The purpose of these cookies is to provide you with a more personal experience and to avoid you having to re-enter your preferences every time you visit our website.</li>
            <li><strong>Analytics cookies:</strong> These cookies are used to collect information about traffic to our website and how users use our website. The information gathered does not identify any individual visitor. We use this information to improve our website.</li>
            <li><strong>Advertising cookies:</strong> These cookies are used to make advertising messages more relevant to you. They perform functions like preventing the same ad from continuously reappearing, ensuring that ads are properly displayed, and in some cases selecting advertisements that are based on your interests.</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Your Choices Regarding Cookies</h2>
          <p>
            If you'd like to delete cookies or instruct your web browser to delete or refuse cookies, please visit the help pages of your web browser.
            Please note, however, that if you delete cookies or refuse to accept them, you might not be able to use all of the features we offer,
            you may not be able to store your preferences, and some of our pages might not display properly.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Contact Us</h2>
          <p>
            If you have any questions about our Cookie Policy, please contact us at:
            cookies@thinkflick.com
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
