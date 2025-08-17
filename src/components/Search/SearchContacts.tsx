import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
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
  const { toast } = useToast();

  // Mock data para demonstração
  const mockContacts: Contact[] = [
    {
      id: "1",
      name: "Restaurante Bella Vista",
      address: "Rua Augusta, 1234 - São Paulo, SP",
      phone: "(11) 98765-4321",
      website: "www.bellavista.com.br",
      email: "contato@bellavista.com.br",
      category: "Restaurante"
    },
    {
      id: "2",
      name: "Pizzaria Don Luigi",
      address: "Av. Paulista, 567 - São Paulo, SP",
      phone: "(11) 91234-5678",
      website: "www.donluigi.com.br",
      category: "Restaurante"
    },
    {
      id: "3",
      name: "Bistrô Central",
      address: "Rua Oscar Freire, 890 - São Paulo, SP",
      phone: "(11) 99876-5432",
      email: "contato@bistrocentral.com.br",
      category: "Restaurante"
    }
  ];

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Erro",
        description: "Digite um termo de busca",
        variant: "destructive"
      });
      return;
    }

    setIsSearching(true);
    
    // Simulação de busca no Google Maps
    setTimeout(() => {
      setContacts(mockContacts);
      setIsSearching(false);
      toast({
        title: "Busca concluída",
        description: `${mockContacts.length} contatos encontrados`
      });
    }, 3000);
  };

  const handleExport = () => {
    toast({
      title: "Funcionalidade Backend",
      description: "Para exportar para Google Sheets, conecte ao Supabase para configurar as integrações necessárias."
    });
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
          <div className="flex gap-2">
            <Input
              placeholder="Ex: restaurante em São Paulo, loja de roupas Salvador..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
            <Button 
              onClick={handleSearch}
              disabled={isSearching}
              className="bg-gradient-to-r from-primary to-primary-hover"
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
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