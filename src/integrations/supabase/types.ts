export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      campanhas: {
        Row: {
          created_at: string
          descricao: string | null
          id: string
          mensagens_enviadas: number | null
          nome: string
          palavras_chave: string[]
          respostas_recebidas: number | null
          status: string | null
          total_contatos: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          descricao?: string | null
          id?: string
          mensagens_enviadas?: number | null
          nome: string
          palavras_chave: string[]
          respostas_recebidas?: number | null
          status?: string | null
          total_contatos?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          descricao?: string | null
          id?: string
          mensagens_enviadas?: number | null
          nome?: string
          palavras_chave?: string[]
          respostas_recebidas?: number | null
          status?: string | null
          total_contatos?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      configuracoes_usuario: {
        Row: {
          configuracoes_extras: Json | null
          created_at: string
          email_ativo: boolean | null
          google_sheets_id: string | null
          id: string
          intervalo_envio: number | null
          updated_at: string
          user_id: string
          whatsapp_ativo: boolean | null
        }
        Insert: {
          configuracoes_extras?: Json | null
          created_at?: string
          email_ativo?: boolean | null
          google_sheets_id?: string | null
          id?: string
          intervalo_envio?: number | null
          updated_at?: string
          user_id: string
          whatsapp_ativo?: boolean | null
        }
        Update: {
          configuracoes_extras?: Json | null
          created_at?: string
          email_ativo?: boolean | null
          google_sheets_id?: string | null
          id?: string
          intervalo_envio?: number | null
          updated_at?: string
          user_id?: string
          whatsapp_ativo?: boolean | null
        }
        Relationships: []
      }
      contatos: {
        Row: {
          campanha_id: string | null
          categoria: string | null
          created_at: string
          email: string | null
          endereco: string | null
          id: string
          nome: string
          notas: string | null
          status: string | null
          telefone: string | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          campanha_id?: string | null
          categoria?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome: string
          notas?: string | null
          status?: string | null
          telefone?: string | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          campanha_id?: string | null
          categoria?: string | null
          created_at?: string
          email?: string | null
          endereco?: string | null
          id?: string
          nome?: string
          notas?: string | null
          status?: string | null
          telefone?: string | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contatos_campanha_id_fkey"
            columns: ["campanha_id"]
            isOneToOne: false
            referencedRelation: "campanhas"
            referencedColumns: ["id"]
          },
        ]
      }
      logs_envio: {
        Row: {
          campanha_id: string | null
          contato_id: string | null
          created_at: string
          enviado_em: string | null
          erro: string | null
          id: string
          mensagem_enviada: string | null
          status: string | null
          template_id: string | null
          tipo: string
          user_id: string
        }
        Insert: {
          campanha_id?: string | null
          contato_id?: string | null
          created_at?: string
          enviado_em?: string | null
          erro?: string | null
          id?: string
          mensagem_enviada?: string | null
          status?: string | null
          template_id?: string | null
          tipo: string
          user_id: string
        }
        Update: {
          campanha_id?: string | null
          contato_id?: string | null
          created_at?: string
          enviado_em?: string | null
          erro?: string | null
          id?: string
          mensagem_enviada?: string | null
          status?: string | null
          template_id?: string | null
          tipo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "logs_envio_campanha_id_fkey"
            columns: ["campanha_id"]
            isOneToOne: false
            referencedRelation: "campanhas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "logs_envio_contato_id_fkey"
            columns: ["contato_id"]
            isOneToOne: false
            referencedRelation: "contatos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "logs_envio_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates_mensagem"
            referencedColumns: ["id"]
          },
        ]
      }
      templates_mensagem: {
        Row: {
          assunto: string | null
          ativo: boolean | null
          conteudo: string
          created_at: string
          id: string
          nome: string
          tipo: string | null
          updated_at: string
          user_id: string
          variaveis: string[] | null
        }
        Insert: {
          assunto?: string | null
          ativo?: boolean | null
          conteudo: string
          created_at?: string
          id?: string
          nome: string
          tipo?: string | null
          updated_at?: string
          user_id: string
          variaveis?: string[] | null
        }
        Update: {
          assunto?: string | null
          ativo?: boolean | null
          conteudo?: string
          created_at?: string
          id?: string
          nome?: string
          tipo?: string | null
          updated_at?: string
          user_id?: string
          variaveis?: string[] | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_sample_business_data: {
        Args: { keywords: string; num_results: number }
        Returns: {
          categoria: string
          email: string
          endereco: string
          nome: string
          telefone: string
          website: string
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
