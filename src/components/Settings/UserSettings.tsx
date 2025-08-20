import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/components/Auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Settings, Save, Loader2 } from "lucide-react";

interface UserConfig {
  google_sheets_id: string;
  intervalo_envio: number;
  whatsapp_ativo: boolean;
  email_ativo: boolean;
  mensagem_padrao: string;
}

export const UserSettings = () => {
  const [config, setConfig] = useState<UserConfig>({
    google_sheets_id: '',
    intervalo_envio: 30,
    whatsapp_ativo: false,
    email_ativo: false,
    mensagem_padrao: 'Olá! Espero que esteja bem. Gostaria de conversar sobre uma oportunidade que pode ser interessante para seu negócio.'
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchUserConfig = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('configuracoes_usuario')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        const configExtras = data.configuracoes_extras as { mensagem_padrao?: string } | null;
        const mensagemPadrao = configExtras?.mensagem_padrao || 
          'Olá! Espero que esteja bem. Gostaria de conversar sobre uma oportunidade que pode ser interessante para seu negócio.';
        
        setConfig({
          google_sheets_id: data.google_sheets_id || '',
          intervalo_envio: data.intervalo_envio || 30,
          whatsapp_ativo: data.whatsapp_ativo || false,
          email_ativo: data.email_ativo || false,
          mensagem_padrao: mensagemPadrao
        });
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar configurações do usuário",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserConfig();
  }, [user]);

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const configuracoes_extras = {
        mensagem_padrao: config.mensagem_padrao
      };

      const { error } = await supabase
        .from('configuracoes_usuario')
        .upsert({
          user_id: user.id,
          google_sheets_id: config.google_sheets_id,
          intervalo_envio: config.intervalo_envio,
          whatsapp_ativo: config.whatsapp_ativo,
          email_ativo: config.email_ativo,
          configuracoes_extras: configuracoes_extras,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "Sucesso",
        description: "Configurações salvas com sucesso!"
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar configurações",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground">Configure suas preferências e integrações</p>
      </div>

      <div className="grid gap-6">
        {/* Integração Google Sheets */}
        <Card className="border-0 bg-gradient-to-br from-card to-muted/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Integração Google Sheets
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sheets-id">ID da Planilha Google Sheets</Label>
              <Input
                id="sheets-id"
                placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms"
                value={config.google_sheets_id}
                onChange={(e) => setConfig(prev => ({ ...prev, google_sheets_id: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">
                Encontre o ID na URL da sua planilha: docs.google.com/spreadsheets/d/[ID]/edit
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Configurações de Envio */}
        <Card className="border-0 bg-gradient-to-br from-card to-muted/30">
          <CardHeader>
            <CardTitle>Configurações de Envio</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="interval">Intervalo entre envios (segundos)</Label>
              <Input
                id="interval"
                type="number"
                min="10"
                max="300"
                value={config.intervalo_envio}
                onChange={(e) => setConfig(prev => ({ ...prev, intervalo_envio: parseInt(e.target.value) || 30 }))}
              />
              <p className="text-xs text-muted-foreground">
                Tempo de espera entre cada mensagem enviada (mínimo 10 segundos)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="mensagem">Mensagem Padrão</Label>
              <Textarea
                id="mensagem"
                placeholder="Digite a mensagem padrão para seus contatos..."
                value={config.mensagem_padrao}
                onChange={(e) => setConfig(prev => ({ ...prev, mensagem_padrao: e.target.value }))}
                rows={4}
              />
              <p className="text-xs text-muted-foreground">
                Esta mensagem será usada como base nos seus templates
              </p>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>WhatsApp</Label>
                  <p className="text-sm text-muted-foreground">
                    Ativar envio de mensagens via WhatsApp
                  </p>
                </div>
                <Switch
                  checked={config.whatsapp_ativo}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, whatsapp_ativo: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email</Label>
                  <p className="text-sm text-muted-foreground">
                    Ativar envio de mensagens via Email
                  </p>
                </div>
                <Switch
                  checked={config.email_ativo}
                  onCheckedChange={(checked) => setConfig(prev => ({ ...prev, email_ativo: checked }))}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informações da Conta */}
        <Card className="border-0 bg-gradient-to-br from-card to-muted/30">
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium">Email</Label>
                <p className="text-sm text-muted-foreground">{user?.email || 'N/A'}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Conta criada em</Label>
                <p className="text-sm text-muted-foreground">
                  {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleSave}
          disabled={saving}
          className="bg-gradient-to-r from-primary to-primary-hover"
        >
          {saving ? (
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {saving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </div>
    </div>
  );
};