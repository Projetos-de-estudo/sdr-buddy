import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SyncRequest {
  campanhaId: string;
  spreadsheetId?: string;
  action: 'export' | 'import';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campanhaId, spreadsheetId, action }: SyncRequest = await req.json();
    
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

    console.log(`Starting Google Sheets ${action} for campaign:`, campanhaId);

    if (action === 'export') {
      // Buscar contatos da campanha
      const { data: contatos, error: contatosError } = await supabase
        .from('contatos')
        .select('*')
        .eq('campanha_id', campanhaId)
        .eq('user_id', user.id);

      if (contatosError) {
        console.error('Error fetching contacts:', contatosError);
        return new Response(JSON.stringify({ error: 'Failed to fetch contacts' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Buscar informações da campanha
      const { data: campanha, error: campanhaError } = await supabase
        .from('campanhas')
        .select('nome')
        .eq('id', campanhaId)
        .eq('user_id', user.id)
        .single();

      if (campanhaError) {
        console.error('Error fetching campaign:', campanhaError);
        return new Response(JSON.stringify({ error: 'Campaign not found' }), {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Simular exportação para Google Sheets
      const exportResult = await simulateGoogleSheetsExport(contatos, campanha.nome, spreadsheetId);
      
      if (exportResult.success) {
        // Salvar ID da planilha nas configurações do usuário
        await supabase
          .from('configuracoes_usuario')
          .upsert({
            user_id: user.id,
            google_sheets_id: exportResult.spreadsheetId,
            updated_at: new Date().toISOString()
          });
      }

      return new Response(JSON.stringify(exportResult), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else if (action === 'import') {
      // Simular importação do Google Sheets
      const importResult = await simulateGoogleSheetsImport(spreadsheetId || '');
      
      if (importResult.success && importResult.data) {
        // Salvar contatos importados
        const contatosData = importResult.data.map((contato: any) => ({
          user_id: user.id,
          campanha_id: campanhaId,
          nome: contato.nome,
          endereco: contato.endereco,
          telefone: contato.telefone,
          email: contato.email,
          website: contato.website,
          categoria: contato.categoria,
          status: 'novo'
        }));

        const { data: contatos, error: insertError } = await supabase
          .from('contatos')
          .insert(contatosData)
          .select();

        if (insertError) {
          console.error('Error importing contacts:', insertError);
          return new Response(JSON.stringify({ error: 'Failed to import contacts' }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          });
        }

        // Atualizar contador na campanha
        await supabase
          .from('campanhas')
          .update({ total_contatos: contatos.length })
          .eq('id', campanhaId)
          .eq('user_id', user.id);

        return new Response(JSON.stringify({ 
          success: true, 
          imported: contatos.length,
          data: contatos 
        }), {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify(importResult), {
        status: importResult.success ? 200 : 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in google-sheets-sync function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Função para simular exportação para Google Sheets
async function simulateGoogleSheetsExport(contatos: any[], campanhaName: string, spreadsheetId?: string) {
  console.log('Simulating Google Sheets export for:', campanhaName);
  
  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 3000));

  // Simular criação ou atualização da planilha
  const newSpreadsheetId = spreadsheetId || `sim_sheet_${Date.now()}`;
  
  // Preparar dados para exportação
  const headers = ['Nome', 'Endereço', 'Telefone', 'Email', 'Website', 'Categoria', 'Status'];
  const rows = contatos.map(contato => [
    contato.nome,
    contato.endereco,
    contato.telefone || '',
    contato.email || '',
    contato.website || '',
    contato.categoria || '',
    contato.status
  ]);

  console.log(`Exported ${contatos.length} contacts to spreadsheet ${newSpreadsheetId}`);

  return {
    success: true,
    spreadsheetId: newSpreadsheetId,
    url: `https://docs.google.com/spreadsheets/d/${newSpreadsheetId}/edit`,
    exported: contatos.length,
    message: `Planilha "${campanhaName}" criada/atualizada com ${contatos.length} contatos`
  };
}

// Função para simular importação do Google Sheets
async function simulateGoogleSheetsImport(spreadsheetId: string) {
  console.log('Simulating Google Sheets import from:', spreadsheetId);
  
  if (!spreadsheetId) {
    return {
      success: false,
      error: 'Spreadsheet ID is required for import'
    };
  }

  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Simular dados importados
  const simulatedData = [
    {
      nome: 'Empresa Importada A',
      endereco: 'Rua Importada, 100',
      telefone: '(11) 98765-4321',
      email: 'contato@importada-a.com',
      website: 'https://www.importada-a.com',
      categoria: 'Serviços'
    },
    {
      nome: 'Negócio Importado B',
      endereco: 'Av. Importada, 200',
      telefone: '(11) 91234-5678',
      email: 'info@importado-b.com',
      website: 'https://www.importado-b.com',
      categoria: 'Comércio'
    }
  ];

  return {
    success: true,
    data: simulatedData,
    imported: simulatedData.length,
    message: `${simulatedData.length} contatos importados da planilha`
  };
}