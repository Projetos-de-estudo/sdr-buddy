import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapeRequest {
  keywords: string;
  campanhaId: string;
}

interface BusinessResult {
  name: string;
  address: string;
  phone?: string;
  website?: string;
  email?: string;
  category?: string;
  rating?: number;
  placeId?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { keywords, campanhaId }: ScrapeRequest = await req.json();
    
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

    console.log('Starting Google Maps scraping for keywords:', keywords);

    // Simular busca no Google Maps (substitua pela implementação real com Places API)
    const simulatedResults: BusinessResult[] = await simulateGoogleMapsSearch(keywords);
    
    // Salvar contatos no banco de dados
    const contatosData = simulatedResults.map(result => ({
      user_id: user.id,
      campanha_id: campanhaId,
      nome: result.name,
      endereco: result.address,
      telefone: result.phone || null,
      email: result.email || null,
      website: result.website || null,
      categoria: result.category || null,
      status: 'novo'
    }));

    const { data: contatos, error: contatosError } = await supabase
      .from('contatos')
      .insert(contatosData)
      .select();

    if (contatosError) {
      console.error('Error saving contacts:', contatosError);
      return new Response(JSON.stringify({ error: 'Failed to save contacts' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Atualizar contador na campanha
    const { error: updateError } = await supabase
      .from('campanhas')
      .update({ total_contatos: contatos.length })
      .eq('id', campanhaId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Error updating campaign:', updateError);
    }

    console.log(`Successfully scraped and saved ${contatos.length} contacts`);

    return new Response(JSON.stringify({ 
      success: true, 
      contatos: contatos.length,
      data: contatos 
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in scrape-google-maps function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Função para simular busca no Google Maps
// Em produção, substitua por chamadas reais à Places API
async function simulateGoogleMapsSearch(keywords: string): Promise<BusinessResult[]> {
  console.log('Simulating Google Maps search for:', keywords);
  
  // Simulação de resultados baseados nas palavras-chave
  const categories = [
    'Restaurante', 'Loja', 'Clínica', 'Escritório', 'Oficina', 
    'Salão de Beleza', 'Academia', 'Farmácia', 'Padaria', 'Lanchonete'
  ];
  
  const businessNames = [
    'Empresa A', 'Comércio B', 'Serviços C', 'Negócios D', 'Estabelecimento E',
    'Companhia F', 'Casa G', 'Centro H', 'Grupo I', 'Instituto J'
  ];

  const addresses = [
    'Rua das Flores, 123 - Centro',
    'Av. Principal, 456 - Bairro Novo',
    'Rua do Comércio, 789 - Vila Rica',
    'Praça Central, 101 - Centro Histórico',
    'Av. dos Trabalhadores, 202 - Distrito Industrial'
  ];

  const results: BusinessResult[] = [];
  const numResults = Math.floor(Math.random() * 15) + 5; // 5-20 resultados

  for (let i = 0; i < numResults; i++) {
    const name = businessNames[Math.floor(Math.random() * businessNames.length)] + ` ${i + 1}`;
    const category = categories[Math.floor(Math.random() * categories.length)];
    const address = addresses[Math.floor(Math.random() * addresses.length)];
    
    results.push({
      name,
      address,
      phone: Math.random() > 0.3 ? `(11) 9${Math.floor(Math.random() * 90000000) + 10000000}` : undefined,
      website: Math.random() > 0.5 ? `https://www.${name.toLowerCase().replace(/\s+/g, '')}.com.br` : undefined,
      email: Math.random() > 0.6 ? `contato@${name.toLowerCase().replace(/\s+/g, '')}.com.br` : undefined,
      category,
      rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // 3.0 - 5.0
      placeId: `simulated_place_${i}_${Date.now()}`
    });
  }

  // Simular delay de rede
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  return results;
}