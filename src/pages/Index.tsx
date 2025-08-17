import { useState } from "react";
import { Sidebar } from "@/components/Layout/Sidebar";
import { Dashboard } from "@/components/Dashboard/Dashboard";
import { SearchContacts } from "@/components/Search/SearchContacts";
import { ContactsList } from "@/components/Contacts/ContactsList";
import { MessageTemplates } from "@/components/Templates/MessageTemplates";
import { useToast } from "@/hooks/use-toast";

const Index = () => {
  const [currentView, setCurrentView] = useState("dashboard");
  const { toast } = useToast();

  const handleViewChange = (view: string) => {
    setCurrentView(view);
    
    // Mostrar aviso sobre funcionalidades que precisam de backend
    if (["campaigns", "analytics", "settings"].includes(view)) {
      toast({
        title: "Funcionalidade Backend",
        description: "Esta funcionalidade requer integração com Supabase para APIs, banco de dados e automações. Conecte ao Supabase para ativar todos os recursos.",
        duration: 4000
      });
    }
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
      case "analytics":
      case "settings":
        return (
          <div className="flex items-center justify-center h-96">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold">Funcionalidade em Desenvolvimento</h2>
              <p className="text-muted-foreground max-w-md">
                Esta funcionalidade requer integração com Supabase para automações, APIs e banco de dados. 
                Conecte ao Supabase para ativar todos os recursos do agente SDR.
              </p>
            </div>
          </div>
        );
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