-- Fix missing DELETE policies for user data management
CREATE POLICY "Users can delete their own configuration data" 
ON public.configuracoes_usuario 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own logs" 
ON public.logs_envio 
FOR DELETE 
USING (auth.uid() = user_id);

-- Ensure all users have default configuration settings
INSERT INTO public.configuracoes_usuario (user_id, google_sheets_id, intervalo_envio, whatsapp_ativo, email_ativo, configuracoes_extras)
SELECT 
    id,
    '',
    5,
    true,
    true,
    '{"mensagem_padrao": "Olá! Espero que esteja bem. Gostaria de conversar sobre uma oportunidade que pode ser interessante para seu negócio."}'::jsonb
FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM public.configuracoes_usuario WHERE user_id IS NOT NULL)
ON CONFLICT (user_id) DO NOTHING;

-- Create trigger to automatically create user configuration when new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.configuracoes_usuario (
        user_id, 
        google_sheets_id, 
        intervalo_envio, 
        whatsapp_ativo, 
        email_ativo, 
        configuracoes_extras
    )
    VALUES (
        NEW.id,
        '',
        5,
        true,
        true,
        '{"mensagem_padrao": "Olá! Espero que esteja bem. Gostaria de conversar sobre uma oportunidade que pode ser interessante para seu negócio."}'::jsonb
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for automatic user configuration creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Improve the simulated Google Maps function by ensuring better data variety
CREATE OR REPLACE FUNCTION public.generate_sample_business_data(keywords TEXT, num_results INTEGER)
RETURNS TABLE(
    nome TEXT,
    endereco TEXT,
    telefone TEXT,
    email TEXT,
    website TEXT,
    categoria TEXT
) AS $$
DECLARE
    business_types TEXT[] := ARRAY['Restaurante', 'Loja de Roupas', 'Clínica Médica', 'Academia', 'Salão de Beleza', 'Farmácia', 'Padaria', 'Escritório de Contabilidade', 'Oficina Mecânica', 'Pet Shop'];
    street_names TEXT[] := ARRAY['Rua das Flores', 'Av. Paulista', 'Rua do Comércio', 'Av. Brasil', 'Rua das Palmeiras', 'Av. Independência', 'Rua da Paz', 'Av. dos Trabalhadores', 'Rua Central', 'Av. das Nações'];
    neighborhoods TEXT[] := ARRAY['Centro', 'Vila Nova', 'Jardim Europa', 'Bairro Alto', 'Vila Rica', 'Setor Sul', 'Distrito Norte', 'Zona Oeste', 'Centro Histórico', 'Vila Industrial'];
    i INTEGER;
    random_name TEXT;
    random_category TEXT;
    random_street TEXT;
    random_neighborhood TEXT;
    random_number INTEGER;
BEGIN
    FOR i IN 1..num_results LOOP
        random_category := business_types[floor(random() * array_length(business_types, 1)) + 1];
        random_street := street_names[floor(random() * array_length(street_names, 1)) + 1];
        random_neighborhood := neighborhoods[floor(random() * array_length(neighborhoods, 1)) + 1];
        random_number := floor(random() * 9999) + 1;
        random_name := random_category || ' ' || chr(65 + floor(random() * 26)::int) || chr(65 + floor(random() * 26)::int);
        
        nome := random_name;
        endereco := random_street || ', ' || random_number || ' - ' || random_neighborhood;
        telefone := CASE WHEN random() > 0.2 THEN '(11) 9' || lpad((floor(random() * 90000000) + 10000000)::text, 8, '0') ELSE NULL END;
        email := CASE WHEN random() > 0.4 THEN 'contato@' || lower(replace(random_name, ' ', '')) || '.com.br' ELSE NULL END;
        website := CASE WHEN random() > 0.5 THEN 'https://www.' || lower(replace(random_name, ' ', '')) || '.com.br' ELSE NULL END;
        categoria := random_category;
        
        RETURN NEXT;
    END LOOP;
END;
$$ LANGUAGE plpgsql;