import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Send,
  Edit,
  Trash2,
  Mail,
  Phone
} from "lucide-react";

interface Contact {
  id: string;
  name: string;
  address: string;
  phone?: string;
  website?: string;
  email?: string;
  category: string;
  status: "novo" | "contatado" | "respondeu" | "convertido";
  dateAdded: string;
}

export const ContactsList = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);

  // Mock data
  const contacts: Contact[] = [
    {
      id: "1",
      name: "Restaurante Bella Vista",
      address: "Rua Augusta, 1234 - São Paulo, SP",
      phone: "(11) 98765-4321",
      website: "www.bellavista.com.br",
      email: "contato@bellavista.com.br",
      category: "Restaurante",
      status: "convertido",
      dateAdded: "2024-01-15"
    },
    {
      id: "2",
      name: "Pizzaria Don Luigi",
      address: "Av. Paulista, 567 - São Paulo, SP",
      phone: "(11) 91234-5678",
      website: "www.donluigi.com.br",
      category: "Restaurante",
      status: "respondeu",
      dateAdded: "2024-01-14"
    },
    {
      id: "3",
      name: "Bistrô Central",
      address: "Rua Oscar Freire, 890 - São Paulo, SP",
      phone: "(11) 99876-5432",
      email: "contato@bistrocentral.com.br",
      category: "Restaurante",
      status: "contatado",
      dateAdded: "2024-01-13"
    },
    {
      id: "4",
      name: "Loja Fashion Style",
      address: "Shopping Ibirapuera - São Paulo, SP",
      phone: "(11) 94567-8901",
      category: "Loja de Roupas",
      status: "novo",
      dateAdded: "2024-01-12"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "novo": return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "contatado": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "respondeu": return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "convertido": return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Lista de Contatos</h1>
          <p className="text-muted-foreground">Gerencie todos os seus leads</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
          <Button variant="default" size="sm">
            <Send className="w-4 h-4 mr-2" />
            Enviar Campanha
          </Button>
        </div>
      </div>

      <Card className="border-0 bg-gradient-to-br from-card to-muted/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Total: {filteredContacts.length} contatos
            </CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar contatos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead>Nome</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredContacts.map((contact) => (
                  <TableRow key={contact.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">
                      <div>
                        <div className="font-semibold">{contact.name}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {contact.address}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{contact.category}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        {contact.phone && (
                          <div className="flex items-center gap-1 text-sm">
                            <Phone className="w-3 h-3" />
                            {contact.phone}
                          </div>
                        )}
                        {contact.email && (
                          <div className="flex items-center gap-1 text-sm">
                            <Mail className="w-3 h-3" />
                            {contact.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(contact.status)}>
                        {contact.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(contact.dateAdded).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Send className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};