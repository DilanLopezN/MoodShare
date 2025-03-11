'use client'
import { useState, useEffect, useCallback } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { MoodOption } from '@/types'
import toast, { Toaster } from 'react-hot-toast'

// Supabase configuration using environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// Constants
const REFRESH_INTERVAL = 30000 // 30 seconds
const LOCAL_STORAGE_KEYS = {
  userName: localStorage.getItem('userName'),
  userCode: localStorage.getItem('userCode'),
  userId: localStorage.getItem('userId')
}

export default function Mood() {
  const [user, setUser] = useState({
    name: '',
    id: '',
    mood: ''
  })

  const [partner, setPartner] = useState({
    name: '',
    id: '',
    code: '',
    mood: '',
    lastUpdate: ''
  })

  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function fetchMeData() {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', LOCAL_STORAGE_KEYS.userId)
        .single()

      console.log('DATA FOM SP', data)
      const { data: moodData, error: moodError } = await supabase
        .from('moods')
        .select('mood, updated_at')
        .eq('user_id', data.id)

      if (moodError) {
        console.log('ERRO NO MOOD', moodError)
        return
      }

      const latestMood = moodData[moodData?.length - 1]

      setUser({
        name: data?.name || '',
        id: data?.id || '',
        mood: latestMood?.mood || ''
      })
    } catch (error) {
      toast.error('Erro ao buscar suas informações. Tente novamente.', {
        duration: 3000,
        style: {
          background: '#FEE2E2',
          color: '#B91C1C',
          fontWeight: 'bold'
        }
      })
    }
  }

  async function fetchPartnerData() {
    try {
      const relationalId = `${LOCAL_STORAGE_KEYS.userId}-${LOCAL_STORAGE_KEYS.userCode}`

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('relation_id', relationalId)
        .single()

      if (error) {
        toast.error(
          'Não foi possível salvar humor de seu parceiro. Tente novamente.',
          {
            duration: 3000,
            style: {
              background: '#FEE2E2',
              color: '#B91C1C',
              fontWeight: 'bold'
            }
          }
        )
        return
      }

      const { data: moodData, error: moodError } = await supabase
        .from('moods')
        .select('mood, updated_at')
        .eq('user_id', data.id)

      if (moodError) {
        console.log('ERRO NO MOOD', moodError)
        return
      }

      const latestMood = moodData[moodData?.length - 1]

      setPartner({
        name: data?.name || '',
        id: data?.id || '',
        mood: latestMood?.mood || '',
        code: data?.code || '',
        lastUpdate: latestMood?.updated_at || ''
      })
    } catch (error) {
      toast.error(
        'Erro ao buscar informações do seu parceiro. Tente novamente.',
        {
          duration: 3000,
          style: {
            background: '#FEE2E2',
            color: '#B91C1C',
            fontWeight: 'bold'
          }
        }
      )
    }
  }

  const updateMood = async (mood: string) => {
    try {
      const { error, data } = await supabase.from('moods').upsert([
        {
          user_id: user.id,
          mood: mood
        }
      ])

      if (error) {
        console.error('Error updating mood:', error)

        // Show error toast
        toast.error('Não foi possível salvar seu humor. Tente novamente.', {
          duration: 3000,
          style: {
            background: '#FEE2E2',
            color: '#B91C1C',
            fontWeight: 'bold'
          }
        })
      }
      setUser(prev => ({ ...prev, mood }))

      toast.success(`Humor atualizado para "${mood}"`, {
        duration: 3000,
        style: {
          background: '#ECFDF5',
          color: '#047857',
          fontWeight: 'bold'
        }
      })
    } catch (error) {
      toast.error('Erro ao atualizar seu humor. Tente novamente.', {
        duration: 3000,
        style: {
          background: '#FEE2E2',
          color: '#B91C1C',
          fontWeight: 'bold'
        }
      })
    }
  }

  const moodOptions: MoodOption[] = [
    { emoji: '😊', label: 'Feliz' },
    { emoji: '😍', label: 'Apaixonado' },
    { emoji: '😢', label: 'Triste' },
    { emoji: '😡', label: 'Irritado' },
    { emoji: '🥱', label: 'Cansado' },
    { emoji: '🤔', label: 'Pensativo' },
    { emoji: '🥺', label: 'Carente' },
    { emoji: '🤒', label: 'Doente' },
    { emoji: '🍔', label: 'Com fome' },
    { emoji: '🎮', label: 'Entediado' }
  ]

  // Helper function to get emoji for a mood
  const getMoodEmoji = (moodLabel: string) => {
    return moodOptions.find(m => m.label === moodLabel)?.emoji || '❓'
  }

  useEffect(() => {
    fetchMeData().then(() => fetchPartnerData())
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Head>
        <title>Seu Humor Atual</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      {/* Toast container */}
      <Toaster position="bottom-center" />

      <main className="max-w-md mx-auto py-6 flex flex-col items-center">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">
          Olá, {user.name}!
        </h1>

        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* User's current mood */}
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-lg font-medium text-gray-600 mb-4">
              Seu humor atual
            </h2>
            <div className="min-h-24 flex flex-col items-center justify-center">
              {user.mood ? (
                <div className="flex flex-col items-center">
                  <span className="text-5xl mb-2">
                    {getMoodEmoji(user.mood)}
                  </span>
                  <span className="text-xl font-medium">{user.mood}</span>
                </div>
              ) : (
                <p className="text-gray-500">Selecione seu humor abaixo</p>
              )}
            </div>
          </div>

          {/* Partner's mood */}
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <h2 className="text-lg font-medium text-gray-600 mb-4">
              Humor de {partner.name || 'Parceiro'}
            </h2>
            {partner.id ? (
              loading ? (
                <p className="text-gray-500">Carregando...</p>
              ) : (
                <div className="flex flex-col items-center">
                  <span className="text-5xl mb-2">
                    {partner.mood !== 'Desconhecido'
                      ? getMoodEmoji(partner.mood)
                      : '❓'}
                  </span>
                  <span className="text-xl font-medium">{partner.mood}</span>
                  {partner.lastUpdate && (
                    <span className="text-xs text-gray-500 mt-2">
                      Atualizado às{' '}
                      {new Date(partner.lastUpdate).toLocaleTimeString(
                        'pt-BR',
                        {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit'
                        }
                      )}
                    </span>
                  )}
                </div>
              )
            ) : (
              <div>
                <p className="text-gray-500 mb-3">Nenhum parceiro conectado</p>
                <button
                  onClick={() => router.push('/create-partner')}
                  className="bg-pink-600 text-white px-4 py-2 rounded-md text-sm hover:bg-pink-700 transition duration-200"
                >
                  Conectar parceiro
                </button>
              </div>
            )}
            {partner.id && (
              <button
                onClick={async () => {
                  try {
                    await fetchPartnerData()
                    toast.success('Humor do parceiro atualizado!', {
                      duration: 3000,
                      style: {
                        background: '#ECFDF5',
                        color: '#047857',
                        fontWeight: 'bold'
                      }
                    })
                  } catch (error) {
                    toast.error('Erro ao atualizar humor do parceiro', {
                      duration: 3000,
                      style: {
                        background: '#FEE2E2',
                        color: '#B91C1C',
                        fontWeight: 'bold'
                      }
                    })
                  }
                }}
                className="mt-4 px-4 py-2 bg-gray-100 text-gray-700 rounded border border-gray-300 text-sm hover:bg-gray-200 transition duration-200"
              >
                Atualizar agora
              </button>
            )}
          </div>
        </div>

        {/* Mood selection */}
        <div className="w-full bg-white rounded-lg shadow p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-600 mb-4 text-center">
            Como você está se sentindo?
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {moodOptions.map(mood => (
              <button
                key={mood.label}
                className={`flex flex-col items-center p-3 rounded-lg border transition duration-200 
                  ${
                    user.mood === mood.label
                      ? 'border-pink-500 bg-pink-50'
                      : 'border-gray-200 hover:bg-gray-50 hover:-translate-y-1'
                  }`}
                onClick={() => updateMood(mood.label)}
                aria-label={`Selecionar humor: ${mood.label}`}
              >
                <span className="text-3xl mb-1">{mood.emoji}</span>
                <span className="text-xs">{mood.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Connection codes */}
        <div className="w-full bg-white rounded-lg shadow p-6">
          <div className="flex justify-between mb-4">
            <div>
              <p className="mb-1 text-sm font-medium text-gray-600">
                Seu código:
              </p>
              <p className="font-mono text-sm bg-gray-100 p-1 rounded">
                {user.id}
              </p>
            </div>
            {partner.code && (
              <div className="text-right">
                <p className="mb-1 text-sm font-medium text-gray-600">
                  Código do parceiro:
                </p>
                <p className="font-mono text-sm bg-gray-100 p-1 rounded">
                  {partner.code}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-center mt-4">
            <button
              onClick={() => router.push('/create-partner')}
              className="text-pink-600 hover:text-pink-800 font-medium text-sm"
            >
              {partner.id ? 'Alterar parceiro' : 'Conectar com um parceiro'}
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}
