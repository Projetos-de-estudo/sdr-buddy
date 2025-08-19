import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/Auth/AuthContext";
import { 
  Home, 
  Search, 
  Users, 
  MessageSquare, 
  Play,
  Send,
  BarChart3, 
  Settings, 
  LogOut,
  Menu,
  X
} from "lucide-react";

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard", icon: Home },
  { id: "search", label: "Buscar Contatos", icon: Search },
  { id: "contacts", label: "Lista de Contatos", icon: Users },
  { id: "templates", label: "Templates", icon: MessageSquare },
  { id: "campaigns", label: "Campanhas", icon: Play },
  { id: "messages", label: "Enviar Mensagens", icon: Send },
  { id: "analytics", label: "Relatórios", icon: BarChart3 },
  { id: "settings", label: "Configurações", icon: Settings },
];

export const Sidebar = ({ currentView, onViewChange }: SidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { signOut, user } = useAuth();

  return (
    <div className={cn(
      "h-screen bg-card border-r border-border transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              SDR Agent
            </h1>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2"
          >
            {isCollapsed ? <Menu size={18} /> : <X size={18} />}
          </Button>
        </div>
      </div>

      <nav className="p-2 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={currentView === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start gap-3 h-11",
                isCollapsed && "px-2 justify-center"
              )}
              onClick={() => onViewChange(item.id)}
            >
              <Icon size={18} />
              {!isCollapsed && <span>{item.label}</span>}
            </Button>
          );
        })}
        
        <div className="absolute bottom-4 left-2 right-2">
          {!isCollapsed && user && (
            <div className="text-xs text-muted-foreground mb-2 px-2 truncate">
              {user.email}
            </div>
          )}
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start gap-3 h-11 text-muted-foreground hover:text-foreground",
              isCollapsed && "px-2 justify-center"
            )}
            onClick={signOut}
          >
            <LogOut size={18} />
            {!isCollapsed && <span>Sair</span>}
          </Button>
        </div>
      </nav>
    </div>
  );
};