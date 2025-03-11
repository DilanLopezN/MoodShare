import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

// Configuração do Supabase (banco de dados gratuito)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

interface MoodRequestBody {
  userId: string
  partnerId: string
  mood: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    // Atualizar o humor
    const { userId, mood } = req.body as MoodRequestBody

    if (!userId || !mood) {
      return res.status(400).json({ error: 'Parâmetros obrigatórios ausentes' })
    }

    const { error } = await supabase.from('moods').upsert([
      {
        user_id: userId,
        mood: mood,
        updated_at: new Date().toISOString()
      }
    ])

    if (error) {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({ success: true })
  } else if (req.method === 'GET') {
    // Buscar o humor do parceiro
    const { partnerId } = req.query

    if (!partnerId) {
      return res.status(400).json({ error: 'ID do parceiro não fornecido' })
    }

    const { data, error } = await supabase
      .from('moods')
      .select('mood, updated_at')
      .eq('user_id', partnerId as string)
      .single()

    if (error && error.code !== 'PGRST116') {
      return res.status(500).json({ error: error.message })
    }

    return res.status(200).json({
      partnerMood: data?.mood || 'Desconhecido',
      updatedAt: data?.updated_at || null
    })
  }

  return res.status(405).json({ error: 'Método não permitido' })
}
