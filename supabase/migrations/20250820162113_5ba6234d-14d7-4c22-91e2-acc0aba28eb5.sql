-- Fix search_path security issues for the functions created in the previous migration
ALTER FUNCTION public.handle_new_user() SECURITY DEFINER SET search_path TO 'public';
ALTER FUNCTION public.generate_sample_business_data(TEXT, INTEGER) SECURITY DEFINER SET search_path TO 'public';