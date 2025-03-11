'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Head from 'next/head'
import { Suspense } from 'react'

function Join() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get('id')
  const name = searchParams.get('name')

  useEffect(() => {
    if (id && name) {
      // Guardar os dados do parceiro
      localStorage.setItem('partnerId', id as string)

      // Redirecionar para a página inicial para cadastrar o nome
      router.push(`/?partnerId=${id}&partnerName=${name}`)
    }
  }, [id, name, router])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
      <Head>
        <title>Conectando... | App de Humor para Casais</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="bg-white rounded-lg shadow-md p-8 max-w-md text-center">
        <h1 className="text-2xl font-bold text-pink-600 mb-4">
          Conectando você com {name}...
        </h1>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto my-6"></div>
        <p className="text-gray-600">
          Aguarde um momento enquanto preparamos tudo para vocês.
        </p>
      </div>
    </div>
  )
}

export default function SuspenseWrapper() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <Join />
    </Suspense>
  )
}
