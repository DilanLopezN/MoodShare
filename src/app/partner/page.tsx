'use client'
import { useState, useEffect, FormEvent } from 'react'
import Head from 'next/head'
import { useRouter } from 'next/navigation'

export default function CreatePartner() {
  const [userId, setUserId] = useState<string>('')
  const [userName, setUserName] = useState<string>('')
  const [partnerName, setPartnerName] = useState<string>('')
  const [inviteLink, setInviteLink] = useState<string>('')
  const [copied, setCopied] = useState<boolean>(false)
  const router = useRouter()

  useEffect(() => {
    // Verificar se está no navegador antes de acessar localStorage
    if (typeof window !== 'undefined') {
      const storedUserId = localStorage.getItem('userId')
      const storedUserName = localStorage.getItem('userName')

      if (storedUserId && storedUserName) {
        setUserId(storedUserId)
        setUserName(storedUserName)

        // Criar o link de convite
        const baseUrl = window.location.origin
        setInviteLink(
          `${baseUrl}/join?id=${storedUserId}&name=${encodeURIComponent(
            storedUserName
          )}`
        )
      } else {
        // Se não tiver os dados necessários, volta para a home
        router.push('/')
      }
    }
  }, [router])

  const handleCreatePartner = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (partnerName) {
      try {
        // Criar o parceiro no Supabase
        const response = await fetch('/api/create-partner', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId,
            userName,
            partnerName
          })
        })

        if (response.ok) {
          const data = await response.json()

          // Salvar o ID do parceiro
          localStorage.setItem('partnerId', data.partnerId)

          // Redirecionar para a página de humor
          router.push('/mood')
        }
      } catch (error) {
        console.error('Erro ao criar parceiro:', error)
      }
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Head>
        <title>Convidar Parceiro | App de Humor para Casais</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <main className="max-w-md mx-auto py-8">
        <h1 className="text-3xl font-bold text-pink-600 mb-6 text-center">
          Bem-vindo(a), {userName}!
        </h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Seu código único
          </h2>
          <div className="bg-gray-100 p-4 rounded-md mb-4">
            <p className="font-mono text-lg break-all">{userId}</p>
          </div>
          <p className="text-sm text-gray-600">
            Guarde este código com cuidado! Você precisará compartilhá-lo com
            seu parceiro.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Convide seu parceiro
          </h2>
          <p className="text-gray-600 mb-4">
            Compartilhe este link com seu parceiro para que ele possa se
            conectar diretamente com você:
          </p>

          <div className="flex mb-4">
            <input
              type="text"
              value={inviteLink}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50"
            />
            <button
              onClick={copyToClipboard}
              className="bg-pink-600 text-white px-4 py-2 rounded-r-md hover:bg-pink-700 transition duration-200"
            >
              {copied ? 'Copiado!' : 'Copiar'}
            </button>
          </div>

          <p className="text-sm text-gray-500">
            Ou você pode criar manualmente um parceiro abaixo:
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Criar parceiro manualmente
          </h2>

          <form onSubmit={handleCreatePartner}>
            <div className="mb-4">
              <label
                htmlFor="partnerName"
                className="block mb-2 font-medium text-gray-700"
              >
                Nome do seu parceiro:
              </label>
              <input
                type="text"
                id="partnerName"
                value={partnerName}
                onChange={e => setPartnerName(e.target.value)}
                placeholder="Digite o nome do seu parceiro"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-pink-600 text-white py-3 px-4 rounded-md hover:bg-pink-700 transition duration-200 font-medium"
            >
              Criar parceiro e continuar
            </button>
          </form>
        </div>

        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/mood')}
            className="text-pink-600 hover:text-pink-800 font-medium"
          >
            Pular esta etapa por enquanto
          </button>
        </div>
      </main>
    </div>
  )
}
