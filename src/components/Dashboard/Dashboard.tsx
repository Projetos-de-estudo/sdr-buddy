import { StatsCard } from "./StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Users, 
  Send, 
  MessageCircle, 
  TrendingUp,
  Play,
  Pause,
  RefreshCw
} from "lucide-react";

interface DashboardProps {
  onViewChange: (view: string) => void;
}

export const Dashboard = ({ onViewChange }: DashboardProps) => {
  const stats = [
    {
      title: "Total de Contatos",
      value: "2,450",
      description: "Contatos coletados",
      icon: Users,
      trend: { value: 12, isPositive: true }
    },
    {
      title: "Mensagens Enviadas",
      value: "1,823",
      description: "Este mês",
      icon: Send,
      trend: { value: 8, isPositive: true }
    },
    {
      title: "Taxa de Resposta",
      value: "24.8%",
      description: "Média mensal",
      icon: MessageCircle,
      trend: { value: 3, isPositive: true }
    },
    {
      title: "Conversões",
      value: "127",
      description: "Leads qualificados",
      icon: TrendingUp,
      trend: { value: 15, isPositive: true }
    }
  ];

  const activeCampaigns = [
    {
      name: "Restaurantes - São Paulo",
      progress: 65,
      sent: 324,
      total: 500,
      status: "ativa"
    },
    {
      name: "Lojas de Roupas - RJ",
      progress: 100,
      sent: 200,
      total: 200,
      status: "concluída"
    },
    {
      name: "Academias - Salvador",
      progress: 25,
      sent: 50,
      total: 200,
      status: "pausada"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral das suas campanhas SDR</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button 
            onClick={() => onViewChange("search")}
            className="bg-gradient-to-r from-primary to-primary-hover"
          >
            <Play className="w-4 h-4 mr-2" />
            Nova Busca
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            icon={stat.icon}
            trend={stat.trend}
          />
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 bg-gradient-to-br from-card to-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Campanhas Ativas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeCampaigns.map((campaign, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{campaign.name}</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    campaign.status === 'ativa' ? 'bg-success/20 text-success' :
                    campaign.status === 'concluída' ? 'bg-primary/20 text-primary' :
                    'bg-warning/20 text-warning'
                  }`}>
                    {campaign.status}
                  </span>
                </div>
                <Progress value={campaign.progress} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{campaign.sent}/{campaign.total} enviadas</span>
                  <span>{campaign.progress}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-card to-muted/30">
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => onViewChange("search")}
            >
              <Users className="w-4 h-4 mr-2" />
              Buscar Novos Contatos
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => onViewChange("templates")}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Criar Template
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => onViewChange("campaigns")}
            >
              <Send className="w-4 h-4 mr-2" />
              Iniciar Campanha
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => onViewChange("analytics")}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Ver Relatórios
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};