import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, View } from 'react-native';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';

const palavrasPorTamanho: Record<number, string[]> = {
  3: [
    'SOL', 'LUA', 'CÃO', 'MAR', 'RÉU', 'DIA', 'MÃE', 'PÃO', 'RIO',
    'CÉU', 'VÃO', 'TÉU', 'LEI', 'OLÁ', 'COR', 'PAZ'
  ],
  4: [
    'GATO', 'BOLA', 'MESA', 'SAPO', 'RATO', 'PATO',
    'LUVA', 'MATO', 'NATA', 'SETA', 'VIDA', 'PORT', 'SELO', 'FITA'
  ],
  5: [
    'PEDRA', 'FOLHA', 'PLUMA', 'SALTO', 
    'NAVIO', 'LIMÃO', 'TIGRE', 'COBRA', 'PRATO',
    'JOGAR', 'NORTE', 'MUNDO'
  ]
};

const TOTAL_RODADAS = 6;

export default function Jogo3() {
  const [rodadaAtual, setRodadaAtual] = useState(0);
  const [palavraAtual, setPalavraAtual] = useState<string[]>([]);
  const [letras, setLetras] = useState<{ key: string; letra: string }[]>([]);
  const [movimentosPorRodada, setMovimentosPorRodada] = useState<number[]>([]);
  const [movimentosRodada, setMovimentosRodada] = useState(0);
  const [finalizado, setFinalizado] = useState(false);

  const gerarNovaPalavra = () => {
    let tamanhoDesejado = 3;
    if (rodadaAtual >= 2 && rodadaAtual < 4) tamanhoDesejado = 4;
    else if (rodadaAtual >= 4) tamanhoDesejado = 5;

 const pool = palavrasPorTamanho[tamanhoDesejado as 3 | 4 | 5];
    const aleatoria = pool[Math.floor(Math.random() * pool.length)];
    const palavra = aleatoria.toUpperCase().split('');

    setPalavraAtual(palavra);
    setLetras(
      palavra
        .map((l, i) => ({ key: String(i), letra: l }))
        .sort(() => Math.random() - 0.5)
    );
    setMovimentosRodada(0);
  };

  useEffect(() => {
    if (rodadaAtual < TOTAL_RODADAS) {
      gerarNovaPalavra();
    } else {
      setFinalizado(true);
    }
  }, [rodadaAtual]);

  const verificarPalavra = (letrasAtualizadas: { letra: string }[]) => {
    const formada = letrasAtualizadas.map((l) => l.letra).join('');
    const correta = palavraAtual.join('');
    if (formada === correta) {
      setMovimentosPorRodada([...movimentosPorRodada, movimentosRodada]);
      setTimeout(() => {
        setRodadaAtual((prev) => prev + 1);
      }, 1000);
    }
  };

  const renderItem = ({ item, drag, isActive }: RenderItemParams<{ key: string; letra: string }>) => (
    <View
      style={[
        styles.bloco,
        { backgroundColor: isActive ? '#ccc' : '#add8e6', width: blocoWidth, height: blocoWidth }
      ]}
      onTouchStart={drag}
    >
      <Text style={styles.blocoTexto}>{item.letra}</Text>
    </View>
  );

  const calcularNotaFinal = () => {
    const totalMovimentos = movimentosPorRodada.reduce((a, b) => a + b, 0);
    const totalLetras = movimentosPorRodada.reduce((acc, _, i) => {
      if (i < 2) return acc + 3;
      if (i < 4) return acc + 4;
      return acc + 5;
    }, 0);

    const mediaPonderada = totalMovimentos / TOTAL_RODADAS;
    const nota = Math.max(0, 10 - mediaPonderada); // quanto menos movimentos, maior a nota

    return {
      media: mediaPonderada.toFixed(1),
      nota: nota.toFixed(1)
    };
  };

  const { width } = Dimensions.get('window');
  const blocoWidth = Math.min(60, (width - 80) / Math.max(5, palavraAtual.length));

  return (
    <View style={styles.container}>
      {!finalizado ? (
        <>
          <Text style={styles.instrucao}>Monte a palavra:</Text>
          <Text style={styles.palavra}>{palavraAtual.join('')}</Text>

          <View style={styles.listaWrapper}>
            <DraggableFlatList
              data={letras}
              onDragEnd={({ data }) => {
                if (finalizado) return;
                setLetras(data);
                setMovimentosRodada((m) => m + 1);
                verificarPalavra(data);
              }}
              keyExtractor={(item) => item.key}
              horizontal
              renderItem={renderItem}
              contentContainerStyle={styles.lista}
              showsHorizontalScrollIndicator={false}
            />
          </View>

          <Text style={styles.rodada}>Rodada {rodadaAtual + 1} de {TOTAL_RODADAS}</Text>
        </>
      ) : (
        <>
          <Text style={styles.fim}>✅ Atividade Concluída!</Text>
          <Text style={styles.resultado}>
            Média de movimentos: {calcularNotaFinal().media}
          </Text>
          <Text style={styles.resultado}>
            Nota final: {calcularNotaFinal().nota} / 10
          </Text>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'orange',
    paddingHorizontal: 20
  },
  instrucao: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center'
  },
  palavra: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333'
  },
  listaWrapper: {
    height: 80,
    justifyContent: 'center'
  },
  lista: {
    justifyContent: 'center'
  },
  bloco: {
    marginHorizontal: 5,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    backgroundColor: 'linear-gradient(180deg, #ffffff, #e0e0e0)',
    padding: 10
  },
  blocoTexto: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'fff'
    
  },
  rodada: {
    marginTop: 30,
    fontSize: 16,
    color: '#666'
  },
  fim: {
    fontSize: 26,
    color: 'green',
    fontWeight: 'bold',
    marginBottom: 20
  },
  resultado: {
    fontSize: 20,
    marginBottom: 10,
    textAlign: 'center'
  }
});
