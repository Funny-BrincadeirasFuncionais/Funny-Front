import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TextInput, TouchableOpacity, View, StatusBar } from 'react-native';
import { ensureAtividadeExists, registrarProgresso, registrarMinijogo } from '../services/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import KeyboardSafeView from '@/components/KeyboardSafeView';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../constants/Colors';
import { useAccessibility } from '../context/AccessibilityContext';


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

export default function JogoContagem() {
  const { transformText, applyColor } = useAccessibility();
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
  const [atividadeId, setAtividadeId] = useState<number | null>(null);
  const [feedbackErro, setFeedbackErro] = useState('');
  const [mostrarErro, setMostrarErro] = useState(false);
  const [tempoInicio, setTempoInicio] = useState<number | null>(null);
  const router = useRouter();

  useEffect(() => {
    const carregarDados = async () => {
      const id = await AsyncStorage.getItem('criancaSelecionada');
      setCriancaId(id);
      if (!id) {
        Alert.alert('Selecione uma criança', 'Você precisa selecionar uma criança na Home antes de iniciar o jogo.', [
          { text: 'OK', onPress: () => router.back() },
        ]);
        return;
      }
      // Garantir que a Atividade exista
      const aid = await ensureAtividadeExists(
        'Desafio de Contagem',
        'Conte os objetos e selecione a quantidade correta',
        'Matemáticas',
        1
      );
      setAtividadeId(aid);
      setTempoInicio(Date.now()); // Registrar início do jogo
      gerarRodada();
    };
    carregarDados();
  }, []);

  // When modal opens (game finished) register a minijogo automatically
  const [minijogoRegistered, setMinijogoRegistered] = useState(false);
  useEffect(() => {
    (async () => {
      if (modalVisible && !minijogoRegistered && criancaId !== null) {
        setMinijogoRegistered(true);
        // Calcular tempo em segundos
        const tempoSegundos = tempoInicio ? Math.floor((Date.now() - tempoInicio) / 1000) : undefined;
        
        const res = await registrarMinijogo({
          pontuacao: Number(notaFinal),
          categoria: 'Matemáticas',
          crianca_id: Number(criancaId),
          titulo: 'Desafio de Contagem',
          descricao: 'Conte os objetos e selecione a quantidade correta',
          observacoes: null,
          tempo_segundos: tempoSegundos,
        });
        if (res.ok) {
          // Try to set atividade id from returned progresso
          const r: any = res;
          const atividadeIdFrom = r?.data?.atividade?.id ?? r?.data?.atividade_id ?? null;
          if (atividadeIdFrom) setAtividadeId(atividadeIdFrom);
        } else {
          const r: any = res;
          const message = r?.data?.error ?? r?.text ?? r?.error ?? `status ${r?.status}`;
          Alert.alert('Erro', `Falha ao registrar mini-jogo automático: ${message}`);
        }
      }
    })();
  }, [modalVisible, minijogoRegistered, criancaId, notaFinal]);

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
      setFeedbackErro('Você escolheu a opção errada!');
      setMostrarErro(true);
      setTimeout(() => setMostrarErro(false), 2000);
    }
  }

  async function enviarResultado() {
    if (!criancaId) {
      Alert.alert('Erro', 'Nenhuma criança selecionada.');
      return;
    }
    if (!atividadeId) {
      Alert.alert('Erro', 'Não foi possível identificar a atividade.');
      return;
    }

    try {
      const res = await registrarProgresso({
        crianca_id: Number(criancaId),
        atividade_id: Number(atividadeId),
        pontuacao: Number(notaFinal),
        observacoes: observacao || undefined,
        concluida: true,
      });

      if (res.ok) {
        Alert.alert('Enviado!', 'Resultado registrado com sucesso.');
        router.push('/(tabs)/home');
      } else {
        const r: any = res;
        const message = r?.data?.error ?? r?.text ?? r?.error ?? `status ${r?.status}`;
        Alert.alert('Erro ao enviar', `Servidor recusou os dados: ${message}`);
      }
    } catch (e) {
      Alert.alert('Erro de conexão', 'Falha ao enviar para o servidor.');
    }
  }

  return (
    <KeyboardSafeView>
      <SafeAreaView style={styles.container} edges={['top','bottom']}>
  <StatusBar barStyle="light-content" backgroundColor={applyColor(Colors.light.primary)} />

      {/* Background blobs */}
      <View style={styles.backgroundShapes}>
        <Svg width="100%" height="100%" viewBox="0 0 400 800" preserveAspectRatio="none" style={styles.blobSvg}>
          <Path d="M280,30 Q340,10 370,60 T360,140 Q330,170 280,150 T240,90 Q230,50 280,30 Z" fill={applyColor(Colors.light.primaryDark)} opacity={0.7}/>
          <Path d="M-20,680 Q30,660 50,700 T40,760 Q10,790 -20,770 T-50,720 Q-60,680 -20,680 Z" fill={applyColor(Colors.light.primaryDark)} opacity={0.65}/>
        </Svg>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
  <Text style={styles.headerTitle}>{transformText('Desafio de Contagem')}</Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.content}>
        {/* Rodada */}
        <View style={styles.badgeRow}>
          <Text style={styles.roundBadge}>{transformText(`Rodada ${rodada}/5`)}</Text>
        </View>

        {/* Mensagem */}
  <Text style={styles.instruction}>{transformText(mensagem)}</Text>

        {/* Área dos emojis */}
        <View style={styles.emojiArea}>
          <Text style={styles.emoji}>{emojisExibidos}</Text>
        </View>

        {/* Feedback de erro */}
        {mostrarErro && (
          <View style={styles.feedbackErro}>
            <Text style={styles.feedbackErroTexto}>{transformText(feedbackErro)}</Text>
          </View>
        )}

        {/* Opções */}
        <View style={styles.optionsGrid}>
          {opcoes.map((num, i) => (
            <TouchableOpacity key={i} style={styles.optionCard} onPress={() => selecionar(num)} activeOpacity={0.8}>
              <Text style={styles.optionNumber}>{num}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Modal salvar progresso */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{transformText('🎉 Parabéns!')}</Text>
            <Text style={styles.modalText}>
              {transformText('Nota final')}: {notaFinal.toFixed(1)} / 10
            </Text>
            <TextInput
              style={styles.input}
              placeholder={transformText('Observação (opcional)')}
              value={observacao}
              onChangeText={setObservacao}
            />
            <TouchableOpacity style={styles.submitButton} onPress={enviarResultado}>
              <Text style={styles.submitButtonText}>{transformText('Enviar')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.voltarButton}
              onPress={() => router.push('/(tabs)/home')}
            >
              <Text style={styles.voltarButtonText}>{transformText('Voltar para Home')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      </SafeAreaView>
    </KeyboardSafeView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.primary,
  },
  backgroundShapes: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  blobSvg: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Lexend_700Bold',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
    zIndex: 5,
  },
  badgeRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  roundBadge: {
    color: '#FFF',
    fontSize: 14,
    fontFamily: 'Lexend_600SemiBold',
    backgroundColor: '#FFFFFF22',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  instruction: {
    fontSize: 18,
    color: '#FFFFFF',
    textAlign: 'center',
    fontFamily: 'Lexend_600SemiBold',
    marginBottom: 16,
  },
  emojiArea: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E0E0E0',
    marginBottom: 16,
    alignItems: 'center',
  },
  emoji: {
    fontSize: 40,
    textAlign: 'center',
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  optionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    margin: 4,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderBottomWidth: 4,
    borderBottomColor: '#D0D0D0',
    minWidth: 60,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  optionNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    fontFamily: 'Lexend_700Bold',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalBox: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    padding: 24,
    width: '85%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'Lexend_700Bold',
    color: Colors.light.primary,
    marginBottom: 16,
  },
  modalText: {
    fontSize: 16,
    fontFamily: 'Lexend_400Regular',
    color: '#333',
    textAlign: 'center',
    marginBottom: 8,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    marginBottom: 16,
    fontSize: 16,
    fontFamily: 'Lexend_400Regular',
  },
  submitButton: {
    width: '100%',
    backgroundColor: Colors.light.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 12,
  },
  submitButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 16,
    fontFamily: 'Lexend_700Bold',
    textAlign: 'center',
  },
  voltarButton: {
    width: '100%',
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    paddingVertical: 14,
  },
  voltarButtonText: {
    color: '#333',
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'Lexend_600SemiBold',
    textAlign: 'center',
  },
  feedbackErro: {
    backgroundColor: '#FF5722',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  feedbackErroTexto: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    fontFamily: 'Lexend_600SemiBold',
  },
});
