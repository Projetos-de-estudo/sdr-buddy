-- Criar tabela para campanhas de prospecção
CREATE TABLE public.campanhas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  descricao TEXT,
  palavras_chave TEXT[] NOT NULL,
  status TEXT DEFAULT 'ativa' CHECK (status IN ('ativa', 'pausada', 'finalizada')),
  total_contatos INTEGER DEFAULT 0,
  mensagens_enviadas INTEGER DEFAULT 0,
  respostas_recebidas INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para contatos
CREATE TABLE public.contatos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  campanha_id UUID REFERENCES public.campanhas(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  endereco TEXT,
  telefone TEXT,
  email TEXT,
  website TEXT,
  categoria TEXT,
  status TEXT DEFAULT 'novo' CHECK (status IN ('novo', 'contatado', 'respondeu', 'interessado', 'nao_interessado')),
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para templates de mensagens
CREATE TABLE public.templates_mensagem (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome TEXT NOT NULL,
  tipo TEXT DEFAULT 'whatsapp' CHECK (tipo IN ('whatsapp', 'email')),
  assunto TEXT, -- Para emails
  conteudo TEXT NOT NULL,
  variaveis TEXT[], -- Array de variáveis disponíveis: nome, empresa, etc.
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para logs de envio
CREATE TABLE public.logs_envio (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  campanha_id UUID REFERENCES public.campanhas(id) ON DELETE CASCADE,
  contato_id UUID REFERENCES public.contatos(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.templates_mensagem(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('whatsapp', 'email')),
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'enviado', 'falhado', 'entregue', 'lido')),
  mensagem_enviada TEXT,
  erro TEXT,
  enviado_em TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela para configurações do usuário
CREATE TABLE public.configuracoes_usuario (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  google_sheets_id TEXT,
  intervalo_envio INTEGER DEFAULT 30, -- segundos entre envios
  whatsapp_ativo BOOLEAN DEFAULT false,
  email_ativo BOOLEAN DEFAULT false,
  configuracoes_extras JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.campanhas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contatos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.templates_mensagem ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logs_envio ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.configuracoes_usuario ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para campanhas
CREATE POLICY "Usuários podem ver suas próprias campanhas" 
ON public.campanhas 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias campanhas" 
ON public.campanhas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias campanhas" 
ON public.campanhas 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar suas próprias campanhas" 
ON public.campanhas 
FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas RLS para contatos
CREATE POLICY "Usuários podem ver seus próprios contatos" 
ON public.contatos 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios contatos" 
ON public.contatos 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios contatos" 
ON public.contatos 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios contatos" 
ON public.contatos 
FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas RLS para templates
CREATE POLICY "Usuários podem ver seus próprios templates" 
ON public.templates_mensagem 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios templates" 
ON public.templates_mensagem 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios templates" 
ON public.templates_mensagem 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios templates" 
ON public.templates_mensagem 
FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas RLS para logs
CREATE POLICY "Usuários podem ver seus próprios logs" 
ON public.logs_envio 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar seus próprios logs" 
ON public.logs_envio 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios logs" 
ON public.logs_envio 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Políticas RLS para configurações
CREATE POLICY "Usuários podem ver suas próprias configurações" 
ON public.configuracoes_usuario 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar suas próprias configurações" 
ON public.configuracoes_usuario 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas próprias configurações" 
ON public.configuracoes_usuario 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Função para atualizar timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para atualizar timestamps automaticamente
CREATE TRIGGER update_campanhas_updated_at
  BEFORE UPDATE ON public.campanhas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_contatos_updated_at
  BEFORE UPDATE ON public.contatos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_templates_updated_at
  BEFORE UPDATE ON public.templates_mensagem
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_configuracoes_updated_at
  BEFORE UPDATE ON public.configuracoes_usuario
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();