import { PageHeader } from "@/components/PageHeader";
import { Footer } from "@/components/Footer";
import { useUser } from "@/contexts/UserContext";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

export default function DMCA() {
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
        <h1 className="text-3xl font-bold mb-6">DMCA Policy</h1>
        
        <div className="prose dark:prose-invert max-w-none">
          <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
          <p>
            ThinkFlick respects the intellectual property rights of others and expects its users to do the same.
            In accordance with the Digital Millennium Copyright Act of 1998 ("DMCA"), ThinkFlick will respond expeditiously to claims
            of copyright infringement that are reported to the designated copyright agent identified below.
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">2. Notification of Claimed Infringement</h2>
          <p>
            If you believe that your work has been copied in a way that constitutes copyright infringement,
            please provide ThinkFlick's copyright agent with the following information:
          </p>
          <ul className="list-disc pl-5 mb-4">
            <li>An electronic or physical signature of the person authorized to act on behalf of the owner of the copyright interest</li>
            <li>A description of the copyrighted work that you claim has been infringed</li>
            <li>A description of where the material that you claim is infringing is located on the site</li>
            <li>Your address, telephone number, and email address</li>
            <li>A statement by you that you have a good faith belief that the disputed use is not authorized by the copyright owner, its agent, or the law</li>
            <li>A statement by you, made under penalty of perjury, that the above information in your notice is accurate and that you are the copyright owner or authorized to act on the copyright owner's behalf</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">3. Counter-Notification</h2>
          <p>
            If you believe that your content that was removed (or to which access was disabled) is not infringing,
            or that you have the authorization from the copyright owner, the copyright owner's agent, or pursuant to the law,
            to post and use the material in your content, you may send a counter-notification containing the following information to the copyright agent:
          </p>
          <ul className="list-disc pl-5 mb-4">
            <li>Your physical or electronic signature</li>
            <li>Identification of the content that has been removed or to which access has been disabled and the location at which the content appeared before it was removed or disabled</li>
            <li>A statement that you have a good faith belief that the content was removed or disabled as a result of mistake or a misidentification of the content</li>
            <li>Your name, address, telephone number, and email address, and a statement that you will accept service of process from the person who provided notification of the alleged infringement</li>
          </ul>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">4. Copyright Agent</h2>
          <p>
            ThinkFlick's designated copyright agent to receive notifications of claimed infringement is:
          </p>
          <p>
            DMCA Agent<br />
            ThinkFlick<br />
            Email: dmca@thinkflick.com
          </p>
          
          <h2 className="text-2xl font-semibold mt-8 mb-4">5. Repeat Infringers</h2>
          <p>
            It is ThinkFlick's policy to terminate, in appropriate circumstances, the accounts of users who are repeat infringers.
          </p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
