import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/Auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Search, MapPin, Loader2, Download, Edit, Trash2 } from "lucide-react";

interface Contact {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  email?: string;
  category: string;
}

export const SearchContacts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("");
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  // Buscar campanhas do usuário
  const fetchCampaigns = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('campanhas')
      .select('id, nome')
      .eq('user_id', user.id)
      .eq('status', 'ativa');
      
    setCampaigns(data || []);
  };

  useEffect(() => {
    fetchCampaigns();
  }, [user]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Erro",
        description: "Digite um termo de busca",
        variant: "destructive"
      });
      return;
    }

    if (!selectedCampaign) {
      toast({
        title: "Erro",
        description: "Selecione uma campanha para associar os contatos",
        variant: "destructive"
      });
      return;
    }

    if (!user) return;

    setIsSearching(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('scrape-google-maps', {
        body: {
          keywords: searchTerm,
          campanhaId: selectedCampaign
        }
      });

      if (error) throw error;

      // Buscar os contatos recém-criados
      const { data: newContacts } = await supabase
        .from('contatos')
        .select('*')
        .eq('campanha_id', selectedCampaign)
        .order('created_at', { ascending: false })
        .limit(20);

      // Mapear os dados do banco para o formato esperado
      const mappedContacts = (newContacts || []).map(contact => ({
        id: contact.id,
        name: contact.nome,
        address: contact.endereco || '',
        phone: contact.telefone,
        website: contact.website,
        email: contact.email,
        category: contact.categoria || 'Sem categoria'
      }));

      setContacts(mappedContacts);
      toast({
        title: "Busca concluída",
        description: `${data.contatos} contatos encontrados e salvos!`
      });
    } catch (error: any) {
      console.error('Erro na busca:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao buscar contatos",
        variant: "destructive"
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleExport = async () => {
    if (contacts.length === 0) {
      toast({
        title: "Erro",
        description: "Nenhum contato para exportar",
        variant: "destructive"
      });
      return;
    }

    if (!selectedCampaign) {
      toast({
        title: "Erro", 
        description: "Selecione uma campanha primeiro",
        variant: "destructive"
      });
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('google-sheets-sync', {
        body: {
          action: 'export',
          campanhaId: selectedCampaign
        }
      });

      if (error) throw error;

      toast({
        title: "Exportação concluída",
        description: `${data.contatos} contatos exportados para Google Sheets!`
      });
    } catch (error: any) {
      console.error('Erro na exportação:', error);
      toast({
        title: "Erro",
        description: error.message || "Erro ao exportar para Google Sheets",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Buscar Contatos</h1>
        <p className="text-muted-foreground">Encontre novos leads no Google Maps</p>
      </div>

      <Card className="border-0 bg-gradient-to-br from-card to-muted/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Busca no Google Maps
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <Input
                placeholder="Ex: restaurante em São Paulo, loja de roupas Salvador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <div>
              <select
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                className="w-full p-2 border border-input rounded-md bg-background"
              >
                <option value="">Selecione uma campanha</option>
                {campaigns.map(campaign => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-center">
            <Button 
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-gradient-to-r from-primary to-primary-hover"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              {isSearching ? "Buscando..." : "Buscar"}
            </Button>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">restaurante em São Paulo</Badge>
            <Badge variant="secondary">loja de roupas Salvador</Badge>
            <Badge variant="secondary">academia fitness Rio de Janeiro</Badge>
            <Badge variant="secondary">clínica médica Brasília</Badge>
          </div>
        </CardContent>
      </Card>

      {contacts.length > 0 && (
        <Card className="border-0 bg-gradient-to-br from-card to-muted/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Resultados Encontrados ({contacts.length})
            </CardTitle>
            <Button 
              onClick={handleExport}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Exportar para Sheets
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {contacts.map((contact) => (
                <div key={contact.id} className="p-4 border border-border rounded-lg bg-background/50 hover:bg-background/80 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">{contact.name}</h3>
                        <Badge variant="outline">{contact.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {contact.address}
                      </p>
                      {contact.phone && (
                        <p className="text-sm text-foreground">📞 {contact.phone}</p>
                      )}
                      {contact.website && (
                        <p className="text-sm text-primary">🌐 {contact.website}</p>
                      )}
                      {contact.email && (
                        <p className="text-sm text-success">✉️ {contact.email}</p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};