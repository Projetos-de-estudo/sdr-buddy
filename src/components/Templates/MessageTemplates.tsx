import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { 
  MessageSquare, 
  Plus, 
  Edit, 
  Trash2, 
  Copy,
  Save,
  X
} from "lucide-react";

interface Template {
  id: string;
  name: string;
  subject?: string;
  message: string;
  type: "whatsapp" | "email";
  variables: string[];
  createdAt: string;
}

export const MessageTemplates = () => {
  const [templates, setTemplates] = useState<Template[]>([
    {
      id: "1",
      name: "Apresentação Inicial",
      subject: "Oportunidade de parceria",
      message: "Olá {nome}! Sou {meu_nome} da {minha_empresa}. Gostaria de apresentar uma oportunidade de parceria que pode beneficiar o {nome_empresa}. Podemos conversar?",
      type: "whatsapp",
      variables: ["nome", "meu_nome", "minha_empresa", "nome_empresa"],
      createdAt: "2024-01-15"
    },
    {
      id: "2",
      name: "Follow-up Email",
      subject: "Retomando nossa conversa",
      message: "Olá {nome}, espero que esteja bem! Retomando nossa conversa sobre {assunto}, gostaria de agendar uma reunião para detalharmos melhor a proposta. Qual seria o melhor horário para você?",
      type: "email",
      variables: ["nome", "assunto"],
      createdAt: "2024-01-14"
    }
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    name: "",
    subject: "",
    message: "",
    type: "whatsapp" as "whatsapp" | "email"
  });

  const { toast } = useToast();

  const extractVariables = (text: string): string[] => {
    const matches = text.match(/{([^}]+)}/g);
    return matches ? matches.map(match => match.slice(1, -1)) : [];
  };

  const handleSave = () => {
    if (!newTemplate.name || !newTemplate.message) {
      toast({
        title: "Erro",
        description: "Nome e mensagem são obrigatórios",
        variant: "destructive"
      });
      return;
    }

    const variables = extractVariables(newTemplate.message);
    const template: Template = {
      id: Date.now().toString(),
      ...newTemplate,
      variables,
      createdAt: new Date().toISOString()
    };

    if (editingId) {
      setTemplates(prev => prev.map(t => t.id === editingId ? { ...template, id: editingId } : t));
      setEditingId(null);
    } else {
      setTemplates(prev => [...prev, template]);
    }

    setNewTemplate({ name: "", subject: "", message: "", type: "whatsapp" });
    setIsCreating(false);
    
    toast({
      title: "Sucesso",
      description: editingId ? "Template atualizado" : "Template criado"
    });
  };

  const handleEdit = (template: Template) => {
    setNewTemplate({
      name: template.name,
      subject: template.subject || "",
      message: template.message,
      type: template.type
    });
    setEditingId(template.id);
    setIsCreating(true);
  };

  const handleDelete = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
    toast({
      title: "Template removido",
      description: "O template foi excluído com sucesso"
    });
  };

  const handleCopy = (template: Template) => {
    navigator.clipboard.writeText(template.message);
    toast({
      title: "Copiado",
      description: "Mensagem copiada para a área de transferência"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Templates de Mensagem</h1>
          <p className="text-muted-foreground">Crie e gerencie seus templates personalizados</p>
        </div>
        <Button 
          onClick={() => setIsCreating(true)}
          className="bg-gradient-to-r from-primary to-primary-hover"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Template
        </Button>
      </div>

      {isCreating && (
        <Card className="border-0 bg-gradient-to-br from-card to-muted/30">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>
              {editingId ? "Editar Template" : "Criar Novo Template"}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setIsCreating(false);
                setEditingId(null);
                setNewTemplate({ name: "", subject: "", message: "", type: "whatsapp" });
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Nome do Template</label>
                <Input
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Ex: Apresentação Inicial"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Tipo</label>
                <select 
                  value={newTemplate.type}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, type: e.target.value as "whatsapp" | "email" }))}
                  className="w-full p-2 border border-input rounded-md bg-background"
                >
                  <option value="whatsapp">WhatsApp</option>
                  <option value="email">Email</option>
                </select>
              </div>
            </div>

            {newTemplate.type === "email" && (
              <div>
                <label className="text-sm font-medium">Assunto (Email)</label>
                <Input
                  value={newTemplate.subject}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="Assunto do email"
                />
              </div>
            )}

            <div>
              <label className="text-sm font-medium">Mensagem</label>
              <Textarea
                value={newTemplate.message}
                onChange={(e) => setNewTemplate(prev => ({ ...prev, message: e.target.value }))}
                placeholder="Digite sua mensagem aqui. Use {variavel} para campos dinâmicos."
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use {"{nome}"}, {"{empresa}"}, etc. para campos dinâmicos
              </p>
            </div>

            {newTemplate.message && (
              <div>
                <label className="text-sm font-medium">Variáveis Detectadas</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {extractVariables(newTemplate.message).map((variable, index) => (
                    <Badge key={index} variant="secondary">{variable}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-2" />
                {editingId ? "Atualizar" : "Salvar"} Template
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setIsCreating(false);
                  setEditingId(null);
                  setNewTemplate({ name: "", subject: "", message: "", type: "whatsapp" });
                }}
              >
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="border-0 bg-gradient-to-br from-card to-muted/30">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5" />
                <div>
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={template.type === "whatsapp" ? "default" : "secondary"}>
                      {template.type === "whatsapp" ? "WhatsApp" : "Email"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(template.createdAt).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => handleCopy(template)}>
                  <Copy className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleEdit(template)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(template.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {template.subject && (
                <div className="mb-2">
                  <span className="text-sm font-medium text-muted-foreground">Assunto: </span>
                  <span className="text-sm">{template.subject}</span>
                </div>
              )}
              <div className="mb-3">
                <span className="text-sm font-medium text-muted-foreground">Mensagem:</span>
                <p className="text-sm mt-1 p-3 bg-muted/50 rounded-md">{template.message}</p>
              </div>
              {template.variables.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Variáveis:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {template.variables.map((variable, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};