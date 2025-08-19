import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/components/Auth/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { 
  Send, 
  MessageSquare, 
  Users,
  CheckCircle,
  XCircle,
  Clock,
  Loader2
} from 'lucide-react';

interface Campaign {
  id: string;
  nome: string;
  total_contatos: number;
}

interface Template {
  id: string;
  nome: string;
  tipo: string;
}

export const SendMessages = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [sending, setSending] = useState(false);
  const [sendResults, setSendResults] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchCampaigns();
      fetchTemplates();
    }
  }, [user]);

  const fetchCampaigns = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('campanhas')
      .select('id, nome, total_contatos')
      .eq('user_id', user.id)
      .eq('status', 'ativa')
      .gt('total_contatos', 0);
      
    setCampaigns(data || []);
  };

  const fetchTemplates = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('templates_mensagem')
      .select('id, nome, tipo')
      .eq('user_id', user.id)
      .eq('ativo', true);
      
    setTemplates(data || []);
  };

  const handleSendMessages = async () => {
    if (!selectedCampaign || !selectedTemplate) {
      toast({
        title: "Erro",
        description: "Selecione uma campanha e um template",
        variant: "destructive"
      });
      return;
    }

    setSending(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('send-messages', {
        body: {
          campanhaId: selectedCampaign,
          templateId: selectedTemplate,
          sendToAll: true
        }
      });

      if (error) throw error;

      setSendResults(data);
      toast({
        title: "Envio concluído",
        description: `${data.sucessos} mensagens enviadas com sucesso!`
      });
    } catch (error: any) {
      console.error('Erro no envio:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao enviar mensagens",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Enviar Mensagens</h1>
        <p className="text-muted-foreground">Configure e envie mensagens em massa para suas campanhas</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="border-0 bg-gradient-to-br from-card to-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Selecionar Campanha
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="w-full p-3 border border-input rounded-md bg-background"
            >
              <option value="">Selecione uma campanha</option>
              {campaigns.map(campaign => (
                <option key={campaign.id} value={campaign.id}>
                  {campaign.nome} ({campaign.total_contatos} contatos)
                </option>
              ))}
            </select>
            
            {campaigns.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhuma campanha com contatos disponível
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 bg-gradient-to-br from-card to-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Selecionar Template
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full p-3 border border-input rounded-md bg-background"
            >
              <option value="">Selecione um template</option>
              {templates.map(template => (
                <option key={template.id} value={template.id}>
                  {template.nome} ({template.tipo})
                </option>
              ))}
            </select>
            
            {templates.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Nenhum template disponível. Crie um template primeiro.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 bg-gradient-to-br from-card to-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Envio de Mensagens
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <Button 
              onClick={handleSendMessages}
              disabled={sending || !selectedCampaign || !selectedTemplate}
              className="bg-gradient-to-r from-primary to-primary-hover px-8 py-3 text-lg"
            >
              {sending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Enviar Mensagens
                </>
              )}
            </Button>
          </div>
          
          {sendResults && (
            <div className="mt-6 p-4 border border-border rounded-lg bg-background/50">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-success" />
                Resultados do Envio
              </h3>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-success">{sendResults.sucessos}</p>
                  <p className="text-sm text-muted-foreground">Enviadas</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-destructive">{sendResults.falhas}</p>
                  <p className="text-sm text-muted-foreground">Falharam</p>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-foreground">{sendResults.total}</p>
                  <p className="text-sm text-muted-foreground">Total</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};