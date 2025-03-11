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
    const { code } = data as CreatePartnerRequest

    // Procurar usuário pelo código
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('code', code)
      .single()

    if (userError) {
      console.error('Erro ao buscar usuário:', userError)
    }

    const { data: supaData, error: insertError } = await supabase
      .from('users')
      .insert([
        {
          name: data.name,
          code: userData.code
        }
      ])
      .select()

    if (insertError) throw insertError

    // ATT MEU PARCEIRO
    const { error: updatePartnerError } = await supabase
      .from('users')
      .update({
        relation_id: `${supaData[0].id}-${code}`
      })
      .eq('id', userData.id)

    const { error: updateMeError } = await supabase
      .from('users')
      .update({
        relation_id: `${userData.id}-${code}`
      })
      .eq('id', supaData[0].id)

    if (updateMeError) {
      console.error('Erro ao realizar update-me:', updateMeError)
    }

    if (updatePartnerError) {
      console.error('Erro ao realizar update-partner:', updatePartnerError)
    }
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
