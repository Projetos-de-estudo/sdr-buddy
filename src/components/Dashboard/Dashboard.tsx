import { useState, useEffect } from "react";
import { StatsCard } from "./StatsCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/components/Auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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

interface Campaign {
  id: string;
  nome: string;
  status: string;
  total_contatos: number;
  mensagens_enviadas: number;
  respostas_recebidas: number;
}

export const Dashboard = ({ onViewChange }: DashboardProps) => {
  const [stats, setStats] = useState({
    totalContatos: 0,
    mensagensEnviadas: 0,
    taxaResposta: "0%",
    conversoes: 0
  });
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchDashboardData = async () => {
    if (!user) return;
    
    try {
      // Buscar campanhas
      const { data: campaignsData } = await supabase
        .from('campanhas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(3);

      setCampaigns(campaignsData || []);

      // Buscar total de contatos
      const { count: totalContatos } = await supabase
        .from('contatos')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Buscar total de mensagens enviadas
      const { count: mensagensEnviadas } = await supabase
        .from('logs_envio')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'enviado');

      // Calcular taxa de resposta (simulação baseada em logs)
      const { count: respostas } = await supabase
        .from('logs_envio')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('status', 'respondido');

      const taxaResposta = mensagensEnviadas && mensagensEnviadas > 0 
        ? ((respostas || 0) / mensagensEnviadas * 100).toFixed(1) + '%'
        : '0%';

      setStats({
        totalContatos: totalContatos || 0,
        mensagensEnviadas: mensagensEnviadas || 0,
        taxaResposta,
        conversoes: Math.floor((respostas || 0) * 0.8) // Simulação de conversões
      });

    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [user]);

  const statsData = [
    {
      title: "Total de Contatos",
      value: loading ? "..." : stats.totalContatos.toString(),
      description: "Contatos coletados",
      icon: Users,
      trend: { value: 12, isPositive: true }
    },
    {
      title: "Mensagens Enviadas",
      value: loading ? "..." : stats.mensagensEnviadas.toString(),
      description: "Total enviadas",
      icon: Send,
      trend: { value: 8, isPositive: true }
    },
    {
      title: "Taxa de Resposta",
      value: loading ? "..." : stats.taxaResposta,
      description: "Média geral",
      icon: MessageCircle,
      trend: { value: 3, isPositive: true }
    },
    {
      title: "Conversões",
      value: loading ? "..." : stats.conversoes.toString(),
      description: "Leads qualificados",
      icon: TrendingUp,
      trend: { value: 15, isPositive: true }
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
        {statsData.map((stat, index) => (
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
              Campanhas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <p className="text-muted-foreground text-sm">Carregando campanhas...</p>
            ) : campaigns.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhuma campanha criada ainda.</p>
            ) : (
              campaigns.map((campaign) => {
                const progress = campaign.total_contatos > 0 
                  ? (campaign.mensagens_enviadas / campaign.total_contatos * 100)
                  : 0;
                
                return (
                  <div key={campaign.id} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{campaign.nome}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        campaign.status === 'ativa' ? 'bg-success/20 text-success' :
                        campaign.status === 'concluída' ? 'bg-primary/20 text-primary' :
                        'bg-warning/20 text-warning'
                      }`}>
                        {campaign.status}
                      </span>
                    </div>
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{campaign.mensagens_enviadas}/{campaign.total_contatos} enviadas</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                  </div>
                );
              })
            )}
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