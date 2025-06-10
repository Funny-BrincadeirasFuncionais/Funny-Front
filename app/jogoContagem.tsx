import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const objetos = [
  { emoji: '🍎', nome: 'maçãs' },
  { emoji: '🚗', nome: 'carros' },
  { emoji: '🌳', nome: 'árvores' },
  { emoji: '🐶', nome: 'cachorros' },
  { emoji: '🐱', nome: 'gatos' },
  { emoji: '🎈', nome: 'balões' },
  { emoji: '🧸', nome: 'ursos' },
  { emoji: '🦋', nome: 'borboletas' },
  { emoji: '🐠', nome: 'peixes' },
  { emoji: '🍌', nome: 'bananas' },
];

export default function ConteToque() {
  const [rodada, setRodada] = useState(1);
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);
  const [quantidade, setQuantidade] = useState(0);
  const [opcoes, setOpcoes] = useState<number[]>([]);
  const [emojiAtual, setEmojiAtual] = useState({ emoji: '🍎', nome: 'maçãs' });
  const [mensagem, setMensagem] = useState('');
  const [emojisExibidos, setEmojisExibidos] = useState('');

  useEffect(() => {
    gerarRodada();
  }, []);

  function gerarRodada() {
    const novo = objetos[Math.floor(Math.random() * objetos.length)];
    const valor = Math.floor(Math.random() * 6) + 5; // de 5 a 10
    setEmojiAtual(novo);
    setQuantidade(valor);
    setMensagem(`Quantos ${novo.nome} tem na imagem?`);
    setEmojisExibidos(novo.emoji.repeat(valor));
    const opcoes = [valor - 2, valor - 1, valor, valor + 1, valor + 2];

    const embaralhadas = opcoes.sort(() => Math.random() - 0.5);
    setOpcoes(embaralhadas);
  }

  function selecionar(num: number) {
    if (num === quantidade) {
      setAcertos(a => a + 1);
      if (rodada < 5) {
        setRodada(r => r + 1);
        gerarRodada();
      } else {
        const pontuacao = Math.max(0, 10 - erros);
        enviarResultado(pontuacao);
      }
    } else {
      setErros(e => e + 1);
    }
  }

  function enviarResultado(pontuacao: number) {
    fetch('https://funny-back-fq78skku2-lianas-projects-1c0ab9bd.vercel.app/progresso/registrar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        criancaId: 1,
        atividadeId: 1,
        pontuacao,
        observacoes: 'Participou com '+pontuacao+' pontos',
        concluida: true,
      }),
    })
      .then(res => {
        if (res.ok) {
          Alert.alert('Atividade concluída', `Nota: ${pontuacao}`, [
            { text: 'OK', style: 'default' },
          ]);
        } else {
          Alert.alert('Nota: ' + pontuacao, 'Não foi possível enviar o resultado (servidor).');
        }
      })
      .catch(() => {
        Alert.alert('Nota: ' + pontuacao, 'Erro de conexão ao enviar resultado.');
      });
  }

  return (
    <View style={styles.container}>
      <Text style={styles.rodada}>Rodada {rodada}/5</Text>
      <Text style={styles.mensagem}>{mensagem}</Text>
      <Text style={styles.emoji}>{emojisExibidos}</Text>
      <View style={styles.opcoes}>
        {opcoes.map((num, i) => (
          <TouchableOpacity key={i} style={styles.botao} onPress={() => selecionar(num)}>
            <Text style={styles.numero}>{num}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFA500', // fundo laranja
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  rodada: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#fff',
  },
  mensagem: {
    fontSize: 22,
    marginBottom: 20,
    textAlign: 'center',
    color: '#fff',
  },
  emoji: {
    fontSize: 40,
    textAlign: 'center',
    marginBottom: 30,
  },
  opcoes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  botao: {
    backgroundColor: '#fff',
    padding: 18,
    margin: 10,
    borderRadius: 10,
    minWidth: 60,
    alignItems: 'center',
  },
  numero: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});
