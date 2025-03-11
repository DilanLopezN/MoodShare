import { NextApiRequest, NextApiResponse } from 'next'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

interface CreatePartnerRequest {
  user_Id: string
  name: string
  code: string
}

export async function POST(request: any, response: any) {
  try {
    const data = await request.json()

    const { data: supaData, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          name: data.name,
          code: data.code
        }
      ])
      .select()

    if (insertError) throw insertError

    return new Response(JSON.stringify(supaData), {
      status: 200
    })
  } catch (error: any) {
    console.error('Erro ao criar parceiro:', error)
    return new Response(JSON.stringify(error.message), {
      status: 400
    })
  }
}
