import { useState } from "react";
import { Sidebar } from "@/components/Layout/Sidebar";
import { Dashboard } from "@/components/Dashboard/Dashboard";
import { SearchContacts } from "@/components/Search/SearchContacts";
import { ContactsList } from "@/components/Contacts/ContactsList";
import { MessageTemplates } from "@/components/Templates/MessageTemplates";
import { CampaignManager } from "@/components/Campaigns/CampaignManager";
import { SendMessages } from "@/components/Messages/SendMessages";
import { LoginForm } from "@/components/Auth/LoginForm";
import { UserSettings } from "@/components/Settings/UserSettings";
import { useAuth } from "@/components/Auth/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [currentView, setCurrentView] = useState("dashboard");
  const { user, loading } = useAuth();
  const { toast } = useToast();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const handleViewChange = (view: string) => {
    setCurrentView(view);
  };

  const renderContent = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard onViewChange={handleViewChange} />;
      case "search":
        return <SearchContacts />;
      case "contacts":
        return <ContactsList />;
      case "templates":
        return <MessageTemplates />;
      case "campaigns":
        return <CampaignManager />;
      case "messages":
        return <SendMessages />;
      case "analytics":
        return (
          <div className="p-8 text-center">
            <h2 className="text-2xl font-semibold mb-4">Em Desenvolvimento</h2>
            <p className="text-muted-foreground">Esta funcionalidade será disponibilizada em breve.</p>
          </div>
        );
      case "settings":
        return <UserSettings />;
      default:
        return <Dashboard onViewChange={handleViewChange} />;
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <Sidebar currentView={currentView} onViewChange={handleViewChange} />
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

export default Index;