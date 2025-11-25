import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  Animated,
  Modal,
  TextInput
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import KeyboardSafeView from '@/components/KeyboardSafeView';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAccessibility } from '../context/AccessibilityContext';
import { ensureAtividadeExists, registrarProgresso, registrarMinijogo } from '../services/api';
import { playCorrect } from './utils/playSfx';
import { Colors } from '../constants/Colors';

const symbols = ['⭐', '🌙', '☀️', '🌸', '🍀', '🎵', '🦕', '🦖'];

interface Card {
  id: string;
  symbol: string;
  flipped: boolean;
  matched: boolean;
}

export default function JogoMemoria() {
  const router = useRouter();
  const { transformText, applyColor } = useAccessibility();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<{ symbol: string; index: number }[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [canFlip, setCanFlip] = useState(true);
  const [criancaId, setCriancaId] = useState<string | null>(null);
  const [atividadeId, setAtividadeId] = useState<number | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [observacao, setObservacao] = useState('');
  const [mostrarAjuda, setMostrarAjuda] = useState(false);
  const [tempoInicio, setTempoInicio] = useState<number | null>(null);
  const animacao = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Garantir criança selecionada e atividade existente
    (async () => {
      const id = await AsyncStorage.getItem('criancaSelecionada');
      setCriancaId(id);
      if (!id) {
        Alert.alert(
          transformText('Selecione uma criança'),
          transformText('Você precisa selecionar uma criança na Home antes de iniciar o jogo.'),
          [{ text: transformText('OK'), onPress: () => router.back() }]
        );
        return;
      }
      const aid = await ensureAtividadeExists(
        'Jogo da Memória',
        'Encontre os pares de símbolos',
        'Lógica',
        1
      );
      setAtividadeId(aid);
      setTempoInicio(Date.now()); // Registrar início do jogo
    })();
  }, []);

  // register a minijogo automatically when modal opens
  const [minijogoRegistered, setMinijogoRegistered] = useState(false);
  useEffect(() => {
    (async () => {
        if (modalVisible && !minijogoRegistered && criancaId !== null) {
        setMinijogoRegistered(true);
        // calcularPontuacao agora retorna a pontuação no formato 0-10 (float)
        const effectiveScore = Number(calcularPontuacao());
        // Calcular tempo em segundos
        const tempoSegundos = tempoInicio ? Math.floor((Date.now() - tempoInicio) / 1000) : undefined;
        const res = await registrarMinijogo({
          pontuacao: effectiveScore,
          movimentos: moves,
          categoria: 'Lógica',
          crianca_id: Number(criancaId),
          titulo: 'Jogo da Memória',
          descricao: 'Encontre os pares de símbolos',
          observacoes: null,
          tempo_segundos: tempoSegundos,
        });
        if (res.ok) {
          const r: any = res;
          const atividadeIdFrom = r?.data?.atividade?.id ?? r?.data?.atividade_id ?? null;
          if (atividadeIdFrom) setAtividadeId(atividadeIdFrom);
        } else {
          const r: any = res;
          const message = r?.data?.error ?? r?.text ?? r?.error ?? `status ${r?.status}`;
          Alert.alert('Erro', `${transformText('Falha ao registrar mini-jogo automático')}: ${message}`);
        }
      }
    })();
  }, [modalVisible, minijogoRegistered, criancaId, tempoInicio]);

  const initGame = () => {
    const duplicated = [...symbols, ...symbols];
    const shuffled = duplicated.sort(() => Math.random() - 0.5);
    const initialCards = shuffled.map((symbol, index) => ({
      id: index.toString(),
      symbol,
      flipped: false,
      matched: false,
    }));

    setCards(initialCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setMoves(0);
    setCanFlip(false);

    // Mostrar todas as cartas brevemente
    setTimeout(() => {
      setCards((prev) => prev.map((c) => ({ ...c, flipped: true })));
      setTimeout(() => {
        setCards((prev) => prev.map((c) => ({ ...c, flipped: false })));
        setCanFlip(true);
      }, 3000);
    }, 500);
  };

  useEffect(() => {
    initGame();
  }, []);

  const handleCardPress = (index: number) => {
    if (!canFlip) return;

    const selectedCard = cards[index];
    if (selectedCard.flipped || selectedCard.matched) return;

    const updatedCards = [...cards];
    updatedCards[index].flipped = true;
    const newFlipped = [...flippedCards, { symbol: updatedCards[index].symbol, index }];
    setCards(updatedCards);
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setCanFlip(false);
      setMoves((prev) => prev + 1);

      setTimeout(() => {
        const [first, second] = newFlipped;

        if (first.symbol === second.symbol) {
          updatedCards[first.index].matched = true;
          updatedCards[second.index].matched = true;
          setMatchedPairs((prev) => prev + 1);

          // Animação de sucesso
          Animated.sequence([
            Animated.timing(animacao, { toValue: 1, duration: 300, useNativeDriver: true }),
            Animated.timing(animacao, { toValue: 0, duration: 300, useNativeDriver: true }),
          ]).start();
          // Play a short per-pair success SFX
          try { playCorrect(); } catch (e) {}

          if (matchedPairs + 1 === symbols.length) {
            setTimeout(() => {
              // Final completion modal (keep a small delay so per-pair SFX doesn't collide)
              setModalVisible(true);
            }, 500);
          }
        } else {
          updatedCards[first.index].flipped = false;
          updatedCards[second.index].flipped = false;
        }

        setCards(updatedCards);
        setFlippedCards([]);
        setCanFlip(true);
      }, 1000);
    }
  };

  const calcularPontuacao = () => {
    // Regra solicitada: pontuação máxima 10.0; reduzir 0.1 por movimento após o 8º movimento.
    // `moves` conta tentativas de pares.
    const extra = Math.max(0, moves - 8);
    const score = Math.max(0, 10 - extra * 0.1);
    // Retornar com uma casa decimal (e.g. 9.9)
    return Math.round(score * 10) / 10;
  };

  const salvarProgresso = async () => {
    if (!criancaId || !atividadeId) {
      Alert.alert(transformText('Erro'), transformText('Faltam informações para registrar o progresso.'));
      return;
    }

    // Calcula pontuação no intervalo 0-10 usando a regra canônica
    const pontuacao = calcularPontuacao();

    try {
      const res = await registrarProgresso({
        crianca_id: Number(criancaId),
        atividade_id: Number(atividadeId),
        pontuacao: Number(pontuacao),
        movimentos: moves,
        observacoes: observacao || undefined,
        concluida: true,
      });

      if (res.ok) {
        Alert.alert(transformText('Sucesso'), transformText('Progresso registrado.'));
        setModalVisible(false);
        router.push('/(tabs)/home');
      } else {
        const r: any = res;
        const message = r?.data?.error ?? r?.text ?? r?.error ?? `status ${r?.status}`;
        Alert.alert(transformText('Erro'), `${transformText('Falha ao registrar')}: ${message}`);
      }
    } catch (e) {
      Alert.alert(transformText('Erro'), transformText('Falha de conexão ao registrar.'));
    }
  };

  return (
    <KeyboardSafeView>
      <SafeAreaView style={[styles.container, { backgroundColor: applyColor(Colors.light.primary) }]} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={applyColor(Colors.light.primary)} />

      {/* Fundo decorativo simples */}
      <View style={styles.backgroundShapes}>
        <Svg width="100%" height="100%" viewBox="0 0 400 800" preserveAspectRatio="none">
          <Path d="M0,700 Q200,600 400,750 L400,800 L0,800 Z" fill={applyColor(Colors.light.primaryDark)} opacity={0.7} />
          <Path d="M0,100 Q150,50 400,120 L400,0 L0,0 Z" fill={applyColor(Colors.light.primaryDark)} opacity={0.65} />
        </Svg>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{transformText('Jogo da Memória')}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <TouchableOpacity style={styles.headerButton} onPress={initGame}>
            <Ionicons name="refresh" size={22} color="#FFFFFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton} onPress={() => setMostrarAjuda(true)}>
            <View style={styles.helpButton}>
              <Text style={[styles.helpButtonText, { color: applyColor(Colors.light.primary) }]}>?</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.stats}>
        <Text style={styles.statsText}>{transformText('Movimentos')}: {moves}</Text>
        <Text style={styles.statsText}>{transformText('Pares')}: {matchedPairs}/{symbols.length}</Text>
      </View>

      <View style={styles.grid}>
        {cards.map((card, index) => (
          <TouchableOpacity
            key={card.id}
            style={[
              styles.card,
              card.flipped || card.matched ? styles.cardFlipped : styles.cardBack,
              card.matched && styles.cardMatched,
            ]}
            onPress={() => handleCardPress(index)}
            activeOpacity={0.8}
          >
            <Text style={styles.cardText}>
              {card.flipped || card.matched ? card.symbol : '❓'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.footer}>
        <TouchableOpacity onPress={initGame} style={styles.fullButton}>
          <Text style={[styles.buttonText, { color: applyColor(Colors.light.primary) }]}>{transformText('Reiniciar')}</Text>
        </TouchableOpacity>
      </View>

      {/* Modal de finalização */}
      {/* Modal de Ajuda */}
      <Modal visible={mostrarAjuda} transparent animationType="fade" onRequestClose={() => setMostrarAjuda(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <View style={{flexDirection:'row', justifyContent:'space-between', alignItems:'center', width:'100%'}}>
              <Text style={styles.modalTitle}>{transformText('Como Jogar')}</Text>
              <TouchableOpacity onPress={() => setMostrarAjuda(false)} style={{padding:6}}>
                <Ionicons name="close" size={22} color="#666666" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalText}>{transformText('Vire as cartas e encontre os pares iguais. Cada par encontrado aumenta sua pontuação.')}</Text>
            <Text style={styles.modalText}>• {transformText('Toque em duas cartas para revelar os símbolos.')}</Text>
            <Text style={styles.modalText}>• {transformText('Se as cartas forem iguais, elas permanecem reveladas.')}</Text>
            <Text style={styles.modalText}>• {transformText('Tente completar o jogo com o menor número de movimentos possível.')}</Text>

            <TouchableOpacity style={[styles.submitButton, {marginTop:12}]} onPress={() => setMostrarAjuda(false)}>
              <Text style={styles.submitButtonText}>{transformText('Entendi!')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.modalBox}>
            <Text style={[styles.modalTitle, { color: applyColor(Colors.light.primary) }]}>{transformText('🎉 Parabéns!')}</Text>
            <Text style={styles.modalText}>
              {transformText('Você completou o jogo em')} {moves} {transformText('tentativas!')}
            </Text>
            <Text style={styles.modalText}>
              {transformText('Pontuação')}: {calcularPontuacao()}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={transformText('Observação (opcional)')}
              value={observacao}
              onChangeText={setObservacao}
            />
            <TouchableOpacity style={styles.submitButton} onPress={salvarProgresso}>
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
  container: { flex: 1, backgroundColor: '#F78F3F' },
  backgroundShapes: { position: 'absolute', width: '100%', height: '100%' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Lexend_700Bold',
  },
  headerButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  statsText: {
    color: '#FFF',
    fontSize: 16,
    fontFamily: 'Lexend_600SemiBold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 10,
    marginTop: 10,
  },
  card: {
    width: 70,
    height: 70,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 4,
    borderColor: '#D0D0D0',
  },
  cardBack: {
    backgroundColor: '#4A5568',
    borderColor: '#2D3748',
  },
  cardFlipped: {
    backgroundColor: '#FFF',
    borderColor: '#E0E0E0',
  },
  cardMatched: {
    backgroundColor: '#90EE90',
    borderColor: '#228B22',
  },
  cardText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
  },
  footer: {
    marginTop: 20,
    paddingHorizontal: 16, // 🔹 margem de 16px dos dois lados
  },
  fullButton: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderBottomWidth: 4,
    borderBottomColor: '#D0D0D0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  buttonText: {
    color: '#F78F3F',
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: 'Lexend_700Bold',
    textAlign: 'center',
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
  helpButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F78F3F',
  },
});