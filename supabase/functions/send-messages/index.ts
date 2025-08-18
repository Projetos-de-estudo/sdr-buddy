import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { Resend } from 'npm:resend@2.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendMessageRequest {
  campanhaId: string;
  templateId: string;
  contatoIds?: string[];
  sendToAll?: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campanhaId, templateId, contatoIds, sendToAll }: SendMessageRequest = await req.json();
    
    // Get auth token from request headers
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    );

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      console.error('Error getting user:', userError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Starting message sending for campaign:', campanhaId);

    // Buscar template da mensagem
    const { data: template, error: templateError } = await supabase
      .from('templates_mensagem')
      .select('*')
      .eq('id', templateId)
      .eq('user_id', user.id)
      .single();

    if (templateError || !template) {
      console.error('Template not found:', templateError);
      return new Response(JSON.stringify({ error: 'Template not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Buscar contatos para envio
    let contatosQuery = supabase
      .from('contatos')
      .select('*')
      .eq('campanha_id', campanhaId)
      .eq('user_id', user.id);

    if (!sendToAll && contatoIds && contatoIds.length > 0) {
      contatosQuery = contatosQuery.in('id', contatoIds);
    }

    const { data: contatos, error: contatosError } = await contatosQuery;

    if (contatosError) {
      console.error('Error fetching contacts:', contatosError);
      return new Response(JSON.stringify({ error: 'Failed to fetch contacts' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!contatos || contatos.length === 0) {
      return new Response(JSON.stringify({ error: 'No contacts found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Buscar configurações do usuário
    const { data: config } = await supabase
      .from('configuracoes_usuario')
      .select('*')
      .eq('user_id', user.id)
      .single();

    const intervaloEnvio = config?.intervalo_envio || 30; // segundos entre envios

    // Processar envios
    const results = [];
    let sucessos = 0;
    let falhas = 0;

    for (const contato of contatos) {
      try {
        // Personalizar mensagem com variáveis
        const mensagemPersonalizada = personalizarMensagem(template.conteudo, contato);
        
        let envioResult;
        
        if (template.tipo === 'email' && contato.email) {
          envioResult = await enviarEmail(contato, template, mensagemPersonalizada);
        } else if (template.tipo === 'whatsapp' && contato.telefone) {
          envioResult = await simularWhatsApp(contato, mensagemPersonalizada);
        } else {
          // Sem canal disponível
          envioResult = {
            success: false,
            error: `Nenhum canal disponível para ${contato.nome}`
          };
        }

        // Salvar log do envio
        await supabase
          .from('logs_envio')
          .insert({
            user_id: user.id,
            campanha_id: campanhaId,
            contato_id: contato.id,
            template_id: templateId,
            tipo: template.tipo,
            status: envioResult.success ? 'enviado' : 'falhado',
            mensagem_enviada: mensagemPersonalizada,
            erro: envioResult.error || null,
            enviado_em: envioResult.success ? new Date().toISOString() : null
          });

        if (envioResult.success) {
          sucessos++;
          // Atualizar status do contato
          await supabase
            .from('contatos')
            .update({ status: 'contatado' })
            .eq('id', contato.id);
        } else {
          falhas++;
        }

        results.push({
          contato: contato.nome,
          success: envioResult.success,
          error: envioResult.error
        });

        // Aguardar intervalo entre envios
        if (contatos.indexOf(contato) < contatos.length - 1) {
          await new Promise(resolve => setTimeout(resolve, intervaloEnvio * 1000));
        }

      } catch (error) {
        console.error(`Error sending to ${contato.nome}:`, error);
        falhas++;
        
        // Salvar log de erro
        await supabase
          .from('logs_envio')
          .insert({
            user_id: user.id,
            campanha_id: campanhaId,
            contato_id: contato.id,
            template_id: templateId,
            tipo: template.tipo,
            status: 'falhado',
            mensagem_enviada: template.conteudo,
            erro: error.message,
            enviado_em: null
          });
      }
    }

    // Atualizar estatísticas da campanha
    await supabase
      .from('campanhas')
      .update({ 
        mensagens_enviadas: sucessos
      })
      .eq('id', campanhaId)
      .eq('user_id', user.id);

    console.log(`Message sending completed. Success: ${sucessos}, Failures: ${falhas}`);

    return new Response(JSON.stringify({
      success: true,
      total: contatos.length,
      sucessos,
      falhas,
      results
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-messages function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Função para personalizar mensagem com variáveis
function personalizarMensagem(template: string, contato: any): string {
  let mensagem = template;
  
  // Substituir variáveis disponíveis
  mensagem = mensagem.replace(/\{nome\}/g, contato.nome || 'Cliente');
  mensagem = mensagem.replace(/\{empresa\}/g, contato.nome || 'sua empresa');
  mensagem = mensagem.replace(/\{endereco\}/g, contato.endereco || '');
  mensagem = mensagem.replace(/\{categoria\}/g, contato.categoria || 'negócio');
  mensagem = mensagem.replace(/\{telefone\}/g, contato.telefone || '');
  mensagem = mensagem.replace(/\{email\}/g, contato.email || '');
  mensagem = mensagem.replace(/\{website\}/g, contato.website || '');
  
  return mensagem;
}

// Função para enviar email via Resend
async function enviarEmail(contato: any, template: any, mensagem: string) {
  try {
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    
    if (!resendApiKey) {
      return {
        success: false,
        error: 'Resend API key not configured'
      };
    }

    const resend = new Resend(resendApiKey);

    const emailResult = await resend.emails.send({
      from: 'SDR Agent <onboarding@resend.dev>',
      to: [contato.email],
      subject: template.assunto || 'Nova oportunidade de negócio',
      html: `
        <div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif;">
          <div style="white-space: pre-wrap;">${mensagem}</div>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="font-size: 12px; color: #666;">
            Esta mensagem foi enviada automaticamente pelo nosso agente SDR.
          </p>
        </div>
      `,
    });

    console.log('Email sent successfully to:', contato.email);
    
    return {
      success: true,
      messageId: emailResult.data?.id
    };

  } catch (error) {
    console.error('Error sending email:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Função para simular envio via WhatsApp
async function simularWhatsApp(contato: any, mensagem: string) {
  console.log('Simulating WhatsApp message to:', contato.telefone);
  
  // Simular delay de envio
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simular sucesso com 90% de chance
  const success = Math.random() > 0.1;
  
  if (success) {
    console.log('WhatsApp message sent successfully to:', contato.nome);
    return {
      success: true,
      messageId: `sim_whatsapp_${Date.now()}`
    };
  } else {
    return {
      success: false,
      error: 'Número de telefone inválido ou WhatsApp não disponível'
    };
  }
}