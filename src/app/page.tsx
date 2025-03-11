'use client'
import { useState, FormEvent, useEffect } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import axios from 'axios'

// Inicializar cliente Supabase - substitua com suas credenciais reais
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey)

export default function Home() {
  const [name, setName] = useState<string>('')
  const [partnerId, setPartnerId] = useState<string>('')
  const [hasAccount, setHasAccount] = useState<boolean>(true)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const router = useRouter()

  // useEffect(() => {
  //   // Verificar se já existe um usuário logado
  //   const storedUserId = localStorage.getItem('userId')
  //   const storedUserName = localStorage.getItem('userName')

  //   if (storedUserId && storedUserName) {
  //     router.push('/mood')
  //   }
  // }, [router])

  // Usuário que JÁ POSSUI um código
  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!name) {
        throw new Error('Nome é obrigatório')
      }

      if (!partnerId) {
        throw new Error('Código do parceiro é obrigatório')
      }

      const data = {
        name,
        code: partnerId
      }

      await axios
        .post('/api/login', data)
        .then(async response => {
          const data = await response.data[0]

          localStorage.setItem('userName', data.name)
          localStorage.setItem('userId', data.id)
          localStorage.setItem('userCode', data.code)

          router.push('/mood')
        })
        .catch(err => console.error('Erro ao criar conta:', err))
    } catch (err) {
      console.error('Erro de login:', err)
      setError(err instanceof Error ? err.message : 'Erro ao fazer login')
    } finally {
      setLoading(false)
    }
  }

  // PRIMEIRO ACESSO - cria um usuário com código novo
  const handleCreateAccount = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (!name) {
        throw new Error('Nome é obrigatório')
      }

      // Gerar ID de usuário e código aleatórios
      const user_Id = Math.random().toString(36).substring(2, 15)
      const code = Math.random().toString(36).substring(2, 10).toUpperCase()

      const data = {
        user_Id,
        name,
        code
      }

      await axios
        .post('/api/partner', data)
        .then(async response => {
          const data = await response.data[0]
          localStorage.setItem('userName', data.name)
          localStorage.setItem('userId', data.id)
          localStorage.setItem('userCode', data.code)

          router.push('/mood')
        })
        .catch(err => console.error('Erro ao criar conta:', err))
    } catch (err) {
      console.error('Erro na criação da conta:', err)
      setError(err instanceof Error ? err.message : 'Erro ao criar conta')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <Head>
        <title>App de Humor para Casais</title>
        <meta
          name="description"
          content="Compartilhe seu humor com seu parceiro"
        />
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <main className="flex flex-col items-center w-full max-w-md">
        <h1 className="text-4xl font-bold text-pink-600 mb-2 text-center">
          💕 Humor de Casal 💕
        </h1>

        <p className="text-xl text-gray-700 mb-8 text-center">
          Compartilhe seu humor atual com seu parceiro
        </p>

        <div className="w-full bg-white rounded-lg shadow-md p-8">
          <div className="flex mb-6">
            <button
              className={`flex-1 py-2 text-center font-medium ${
                hasAccount
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-500'
              }`}
              onClick={() => setHasAccount(true)}
            >
              Já tenho código
            </button>
            <button
              className={`flex-1 py-2 text-center font-medium ${
                !hasAccount
                  ? 'text-pink-600 border-b-2 border-pink-600'
                  : 'text-gray-500'
              }`}
              onClick={() => setHasAccount(false)}
            >
              Primeiro acesso
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}

          {hasAccount ? (
            <form onSubmit={handleLogin}>
              <div className="mb-6">
                <label
                  htmlFor="name"
                  className="block mb-2 font-medium text-gray-700"
                >
                  Seu nome:
                </label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Digite seu nome"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <div className="mb-6">
                <label
                  htmlFor="partnerId"
                  className="block mb-2 font-medium text-gray-700"
                >
                  Código do parceiro:
                </label>
                <input
                  type="text"
                  id="partnerId"
                  value={partnerId}
                  onChange={e => setPartnerId(e.target.value)}
                  placeholder="Digite o código do parceiro"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-pink-600 text-white py-3 px-4 rounded-md hover:bg-pink-700 transition duration-200 font-medium disabled:bg-pink-400"
              >
                {loading ? 'Entrando...' : 'Entrar'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleCreateAccount}>
              <div className="mb-6">
                <label
                  htmlFor="newName"
                  className="block mb-2 font-medium text-gray-700"
                >
                  Seu nome:
                </label>
                <input
                  type="text"
                  id="newName"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Digite seu nome"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-pink-600 text-white py-3 px-4 rounded-md hover:bg-pink-700 transition duration-200 font-medium disabled:bg-pink-400"
              >
                {loading ? 'Criando perfil...' : 'Criar meu perfil'}
              </button>
            </form>
          )}
        </div>
      </main>
    </div>
  )
}
