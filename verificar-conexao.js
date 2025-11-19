/**
 * Script simples para verificar se o backend está acessível
 * Execute: node verificar-conexao.js
 */

const BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';

async function verificarBackend() {
  console.log('🔍 Verificando conexão com o backend...\n');
  console.log(`📍 URL configurada: ${BASE_URL}\n`);

  try {
    const response = await fetch(`${BASE_URL}/health`);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Backend está rodando!');
      console.log('📊 Resposta:', JSON.stringify(data, null, 2));
      console.log('\n🎉 Tudo pronto! Você pode rodar o frontend agora.');
      return true;
    } else {
      console.log('❌ Backend respondeu com erro:', response.status);
      return false;
    }
  } catch (error) {
    console.log('❌ Erro ao conectar com o backend:');
    console.log('   ', error.message);
    console.log('\n💡 Verifique se:');
    console.log('   1. O backend está rodando (python run.py)');
    console.log('   2. A URL está correta:', BASE_URL);
    console.log('   3. Não há firewall bloqueando a porta 8000');
    return false;
  }
}

verificarBackend();

