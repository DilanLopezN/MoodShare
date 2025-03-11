// src/app/api/users/[id]/route.js

export async function GET() {
  // Aqui você pode realizar uma busca no banco de dados ou outro processamento
  return new Response(JSON.stringify({ message: 'Hello World!' }), {
    status: 200
  })
}
