import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { postJson } from '../services/api';


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
  const [criancaId, setCriancaId] = useState<string | null>(null);
  const [rodada, setRodada] = useState(1);
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);
  const [quantidade, setQuantidade] = useState(0);
  const [opcoes, setOpcoes] = useState<number[]>([]);
  const [emojiAtual, setEmojiAtual] = useState({ emoji: '🍎', nome: 'maçãs' });
  const [mensagem, setMensagem] = useState('');
  const [emojisExibidos, setEmojisExibidos] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [observacao, setObservacao] = useState('');
  const [notaFinal, setNotaFinal] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const carregarDados = async () => {
      const id = await AsyncStorage.getItem('criancaSelecionada');
      setCriancaId(id);
      gerarRodada();
    };
    carregarDados();
  }, []);

  function gerarRodada() {
    const novo = objetos[Math.floor(Math.random() * objetos.length)];
    const valor = Math.floor(Math.random() * 6) + 5;
    setEmojiAtual(novo);
    setQuantidade(valor);
    setMensagem(`Quantos ${novo.nome} tem na imagem?`);
    setEmojisExibidos(novo.emoji.repeat(valor));
    const opcoes = [valor - 2, valor - 1, valor, valor + 1, valor + 2].sort(() => Math.random() - 0.5);
    setOpcoes(opcoes);
  }

  function selecionar(num: number) {
    if (num === quantidade) {
      setAcertos(a => a + 1);
      if (rodada < 5) {
        setRodada(r => r + 1);
        gerarRodada();
      } else {
        const pontuacao = Math.max(0, 10 - erros);
        setNotaFinal(pontuacao);
        setModalVisible(true);
      }
    } else {
      setErros(e => e + 1);
    }
  }

  async function enviarResultado() {
    if (!criancaId) {
      Alert.alert('Erro', 'Nenhuma criança selecionada.');
      return;
    }

    try {
      const res = await postJson('/progresso/registrar', {
        criancaId: Number(criancaId),
        atividadeId: 9,
        pontuacao: notaFinal,
        observacoes: observacao,
        concluida: true,
      });

      if (res.ok) {
        Alert.alert('Enviado!', 'Resultado registrado com sucesso.');
        router.push('/home');
      } else {
        Alert.alert('Erro ao enviar', 'Servidor recusou os dados.');
      }
    } catch (e) {
      Alert.alert('Erro de conexão', 'Falha ao enviar para o servidor.');
    }
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

      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Atividade Finalizada!</Text>
            <Text style={styles.modalText}>Nota final: {notaFinal}</Text>
            <TextInput
              style={styles.input}
              placeholder="Escreva uma observação..."
              value={observacao}
              onChangeText={setObservacao}
            />
            <TouchableOpacity style={styles.submitButton} onPress={enviarResultado}>
              <Text style={styles.submitButtonText}>Enviar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.voltarButton} onPress={() => router.push('/home')}>
              <Text style={styles.voltarButtonText}>Voltar para Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFA500',
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 30,
  },
  modalBox: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 18,
    marginBottom: 10,
  },
  input: {
    backgroundColor: '#eee',
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
  },
  submitButton: {
    backgroundColor: '#E07612',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
  },
  voltarButton: {
    alignItems: 'center',
  },
  voltarButtonText: {
    color: '#E07612',
    fontSize: 16,
  },
});
