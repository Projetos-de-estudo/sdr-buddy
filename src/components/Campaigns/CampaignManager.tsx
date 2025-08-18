import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/Auth/AuthContext';
import { Plus, Play, Pause, Trash2, Search } from 'lucide-react';

interface Campaign {
  id: string;
  nome: string;
  descricao: string;
  palavras_chave: string[];
  status: string;
  total_contatos: number;
  mensagens_enviadas: number;
  respostas_recebidas: number;
  created_at: string;
}

export const CampaignManager = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    palavras_chave: ''
  });
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchCampaigns = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('campanhas')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar campanhas',
        variant: 'destructive',
      });
    } else {
      setCampaigns(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCampaigns();
  }, [user]);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const { error } = await supabase
      .from('campanhas')
      .insert({
        nome: formData.nome,
        descricao: formData.descricao,
        palavras_chave: formData.palavras_chave.split(',').map(k => k.trim()),
        user_id: user.id,
        status: 'ativa'
      });

    if (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao criar campanha',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Sucesso',
        description: 'Campanha criada com sucesso!',
      });
      setFormData({ nome: '', descricao: '', palavras_chave: '' });
      setShowForm(false);
      fetchCampaigns();
    }
  };

  const handleScrapeContacts = async (campaignId: string, keywords: string[]) => {
    if (!user) return;

    try {
      const { data, error } = await supabase.functions.invoke('scrape-google-maps', {
        body: {
          keywords: keywords.join(' '),
          campanhaId: campaignId
        }
      });

      if (error) throw error;

      toast({
        title: 'Sucesso',
        description: `${data.contatos} contatos encontrados e salvos!`,
      });
      fetchCampaigns();
    } catch (error) {
      console.error('Error scraping contacts:', error);
      toast({
        title: 'Erro',
        description: 'Erro ao buscar contatos',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="p-6">Carregando campanhas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Campanhas</h1>
          <p className="text-muted-foreground">Gerencie suas campanhas de prospecção</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Campanha
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Campanha</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <Label htmlFor="nome">Nome da Campanha</Label>
                <Input
                  id="nome"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Ex: Restaurantes São Paulo"
                  required
                />
              </div>
              <div>
                <Label htmlFor="descricao">Descrição</Label>
                <Textarea
                  id="descricao"
                  value={formData.descricao}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  placeholder="Descreva o objetivo da campanha"
                />
              </div>
              <div>
                <Label htmlFor="palavras_chave">Palavras-chave (separadas por vírgula)</Label>
                <Input
                  id="palavras_chave"
                  value={formData.palavras_chave}
                  onChange={(e) => setFormData({ ...formData, palavras_chave: e.target.value })}
                  placeholder="restaurante, pizza, comida, São Paulo"
                  required
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Criar Campanha</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {campaigns.map((campaign) => (
          <Card key={campaign.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {campaign.nome}
                    <Badge variant={campaign.status === 'ativa' ? 'default' : 'secondary'}>
                      {campaign.status}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {campaign.descricao}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleScrapeContacts(campaign.id, campaign.palavras_chave)}
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Buscar Contatos
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <p className="font-medium">{campaign.total_contatos}</p>
                  <p className="text-muted-foreground">Contatos</p>
                </div>
                <div>
                  <p className="font-medium">{campaign.mensagens_enviadas}</p>
                  <p className="text-muted-foreground">Mensagens Enviadas</p>
                </div>
                <div>
                  <p className="font-medium">{campaign.respostas_recebidas}</p>
                  <p className="text-muted-foreground">Respostas</p>
                </div>
              </div>
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">
                  Palavras-chave: {campaign.palavras_chave.join(', ')}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};