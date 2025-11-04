import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  StatusBar,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const symbols = ['⭐', '🌙', '☀️', '🌸', '🍀', '🎵', '🦕', '🦖'];

interface Card {
  id: string;
  symbol: string;
  flipped: boolean;
  matched: boolean;
}

export default function JogoMemoria() {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<{ symbol: string; index: number }[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [moves, setMoves] = useState(0);
  const [canFlip, setCanFlip] = useState(true);
  const animacao = useRef(new Animated.Value(0)).current;

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

          if (matchedPairs + 1 === symbols.length) {
            setTimeout(() => {
              Alert.alert('🎉 Parabéns!', `Você venceu em ${moves + 1} tentativas!`, [
                { text: 'Jogar novamente', onPress: initGame },
                { text: 'Sair', onPress: () => router.back() },
              ]);
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

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#F78F3F" />

      {/* Fundo decorativo simples */}
      <View style={styles.backgroundShapes}>
        <Svg width="100%" height="100%" viewBox="0 0 400 800" preserveAspectRatio="none">
          <Path d="M0,700 Q200,600 400,750 L400,800 L0,800 Z" fill="#E07612" opacity={0.7} />
          <Path d="M0,100 Q150,50 400,120 L400,0 L0,0 Z" fill="#E07612" opacity={0.65} />
        </Svg>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Jogo da Memória</Text>
        <TouchableOpacity style={styles.headerButton} onPress={initGame}>
          <Ionicons name="refresh" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.stats}>
        <Text style={styles.statsText}>Movimentos: {moves}</Text>
        <Text style={styles.statsText}>Pares: {matchedPairs}/{symbols.length}</Text>
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
          <Text style={styles.buttonText}>Reiniciar</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
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
});