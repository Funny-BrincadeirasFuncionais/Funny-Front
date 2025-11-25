import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Animated,
    Modal,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../constants/Colors';
import { useAccessibility } from '../context/AccessibilityContext';
import { ensureAtividadeExists, registrarMinijogo, registrarProgresso } from '../services/api';

interface FamiliaPalavras {
  termino: string;
  palavrasCorretas: string[];
  palavrasDistratoras: string[];
  cor: string;
}

const todasFamilias: FamiliaPalavras[] = [
  {
    termino: '-asa',
    palavrasCorretas: ['CASA', 'ASA', 'BRASA'],
    palavrasDistratoras: ['MESA', 'CÃO', 'LUA', 'SOL', 'CAMA', 'GATO'],
    cor: '#4CAF50',
  },
  {
    termino: '-ato',
    palavrasCorretas: ['GATO', 'RATO', 'PATO', 'PRATO'],
    palavrasDistratoras: ['MÃO', 'PÃO', 'SOL', 'MAR', 'CÉU', 'LUA'],
    cor: '#2196F3',
  },
  {
    termino: '-ada',
    palavrasCorretas: ['ENTRADA', 'CHEGADA', 'PASSADA'],
    palavrasDistratoras: ['CASA', 'MESA', 'CAMA', 'PORTA', 'JANELA', 'BANCO'],
    cor: '#FF9800',
  },
  {
    termino: '-ão',
    palavrasCorretas: ['MÃO', 'PÃO', 'CÃO', 'CHÃO'],
    palavrasDistratoras: ['SOL', 'LUA', 'MAR', 'CÉU', 'RIO', 'MONTANHA'],
    cor: '#9C27B0',
  },
  {
    termino: '-inho',
    palavrasCorretas: ['CAMINHO', 'CARINHO', 'PEQUENINHO'],
    palavrasDistratoras: ['CASA', 'GATO', 'PATO', 'BOLA', 'BRINQUEDO', 'ESCOLA'],
    cor: '#E91E63',
  },
  {
    termino: '-ela',
    palavrasCorretas: ['PANELA', 'TELA', 'VELA', 'JANELA'],
    palavrasDistratoras: ['CASA', 'MESA', 'PORTA', 'BANCO', 'CADEIRA', 'SAPATO'],
    cor: '#00BCD4',
  },
  {
    termino: '-eiro',
    palavrasCorretas: ['CARTEIRO', 'BANQUEIRO', 'PADEIRO', 'CABELEIREIRO'],
    palavrasDistratoras: ['CASA', 'ESCOLA', 'HOSPITAL', 'PRAIA', 'PARQUE', 'MERCADO'],
    cor: '#FF5722',
  },
  {
    termino: '-ura',
    palavrasCorretas: ['ALTURA', 'TEXTURA', 'CULTURA'],
    palavrasDistratoras: ['CASA', 'MESA', 'PORTA', 'JANELA', 'BANCO', 'CADEIRA'],
    cor: '#795548',
  },
  {
    termino: '-eza',
    palavrasCorretas: ['BELEZA', 'TRISTEZA', 'RIQUEZA', 'PUREZA'],
    palavrasDistratoras: ['CASA', 'MESA', 'PORTA', 'JANELA', 'BANCO', 'CADEIRA'],
    cor: '#607D8B',
  },
  {
    termino: '-agem',
    palavrasCorretas: ['VIAGEM', 'IMAGEM', 'MENSAGEM', 'PASSAGEM'],
    palavrasDistratoras: ['CASA', 'MESA', 'PORTA', 'JANELA', 'BANCO', 'CADEIRA'],
    cor: '#9E9E9E',
  },
  {
    termino: '-uco',
    palavrasCorretas: ['SUCO', 'TRUCO', 'MUCO'],
    palavrasDistratoras: ['CASA', 'MESA', 'RUA', 'GATO', 'SAPATO', 'FLORESTA'],
    cor: '#8BC34A',
  },
  {
    termino: '-ente',
    palavrasCorretas: ['PRESENTE', 'DENTE', 'GENTE', 'CLIENTE'],
    palavrasDistratoras: ['CASA', 'PORTA', 'MESA', 'SOL', 'LUA', 'CARRO'],
    cor: '#03A9F4',
  },
  {
    termino: '-ilho',
    palavrasCorretas: ['FILHO', 'MILHO', 'TRILHO'],
    palavrasDistratoras: ['CASA', 'GATO', 'SAPATO', 'FLORESTA', 'RUA', 'BANCO'],
    cor: '#FFEB3B',
  },
  {
    termino: '-ete',
    palavrasCorretas: ['CHICLETE', 'SETE', 'PIQUETE'],
    palavrasDistratoras: ['CASA', 'JANELA', 'PORTA', 'CÃO', 'MAR', 'RIO'],
    cor: '#4CAF50',
  },
  {
    termino: '-ote',
    palavrasCorretas: ['POTE', 'CHICOTE', 'DOTE'],
    palavrasDistratoras: ['CASA', 'GATO', 'CARRO', 'FLORESTA', 'JANELA', 'SAPATO'],
    cor: '#00BCD4',
  },
  {
    termino: '-udo',
    palavrasCorretas: ['BARBUDO', 'CARRANCUDO', 'ORELHUDO'],
    palavrasDistratoras: ['CASA', 'MESA', 'GATO', 'PRAIA', 'BOLA', 'CAMINHÃO'],
    cor: '#009688',
  },
  {
    termino: '-al',
    palavrasCorretas: ['ANIMAL', 'JORNAL', 'SINAL', 'BANAL'],
    palavrasDistratoras: ['CASA', 'MESA', 'PORTA', 'RUA', 'SOL', 'GATO'],
    cor: '#CDDC39',
  },
];

const selecionarFamilias = (): FamiliaPalavras[] => {
  const embaralhadas = [...todasFamilias].sort(() => Math.random() - 0.5);
  return embaralhadas.slice(0, 5);
};

const familiasPalavras: FamiliaPalavras[] = selecionarFamilias();

interface PalavraItem {
  id: string;
  palavra: string;
  pertenceFamilia: boolean;
}

export default function JogoFamiliaPalavras() {
  const router = useRouter();
  const { transformText, applyColor } = useAccessibility();

  const [faseAtual, setFaseAtual] = useState(0);
  const [palavrasDisponiveis, setPalavrasDisponiveis] = useState<PalavraItem[]>([]);
  const [palavrasNaFamilia, setPalavrasNaFamilia] = useState<PalavraItem[]>([]);
  const [palavrasSelecionadas, setPalavrasSelecionadas] = useState<Set<string>>(new Set());
  const [familiaCompleta, setFamiliaCompleta] = useState(false);
  const [mostrarFeedback, setMostrarFeedback] = useState(false);
  const [mensagemFeedback, setMensagemFeedback] = useState('');
  const [animacao] = useState(new Animated.Value(0));
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);
  const [notaFinal, setNotaFinal] = useState(0);
  const [criancaId, setCriancaId] = useState<string | null>(null);
  const [faseAcertada, setFaseAcertada] = useState<boolean[]>(
    new Array(familiasPalavras.length).fill(false),
  );
  const [mostrarAjuda, setMostrarAjuda] = useState(false);
  const [atividadeId, setAtividadeId] = useState<number | null>(null);
  const [observacao, setObservacao] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [tempoInicio, setTempoInicio] = useState<number | null>(null);

  const familiaAtual = familiasPalavras[faseAtual];

  // carregar criança + atividade
  useEffect(() => {
    const carregarDados = async () => {
      const id = await AsyncStorage.getItem('criancaSelecionada');
      setCriancaId(id);

      if (!id) {
        Alert.alert(
          'Selecione uma criança',
          'Você precisa selecionar uma criança na Home antes de iniciar o jogo.',
          [{ text: 'OK', onPress: () => router.back() }],
        );
        return;
      }

      const aid = await ensureAtividadeExists(
        'Família de Palavras',
        'Selecione palavras que pertencem à mesma família (mesma terminação).',
        'Português',
        1,
      );
      setAtividadeId(aid);
      setTempoInicio(Date.now());
    };

    carregarDados();
  }, [router]);

  // montar palavras da fase
  useEffect(() => {
    if (familiaAtual) {
      const todasPalavras: PalavraItem[] = [
        ...familiaAtual.palavrasCorretas.map((p, i) => ({
          id: `correta-${faseAtual}-${i}-${Date.now()}`,
          palavra: p,
          pertenceFamilia: true,
        })),
        ...familiaAtual.palavrasDistratoras.map((p, i) => ({
          id: `distratora-${faseAtual}-${i}-${Date.now()}`,
          palavra: p,
          pertenceFamilia: false,
        })),
      ];

      const embaralhadas = [...todasPalavras].sort(() => Math.random() - 0.5);

      setPalavrasDisponiveis(embaralhadas);
      setPalavrasNaFamilia([]);
      setPalavrasSelecionadas(new Set());
      setFamiliaCompleta(false);
      setMostrarFeedback(false);
      setMensagemFeedback('');
      animacao.setValue(0);
    }
  }, [faseAtual, familiaAtual, animacao]);

  // anima o toast de feedback e depois some
  const animarFeedback = useCallback(() => {
    animacao.setValue(0);
    Animated.sequence([
      Animated.timing(animacao, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(animacao, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setMostrarFeedback(false);
      setMensagemFeedback('');
    });
  }, [animacao]);

  const verificarFamilia = useCallback(
    (palavras: PalavraItem[]) => {
      const totalCorretas = familiaAtual.palavrasCorretas.length;
      const palavrasCorretasNaFamilia = palavras.filter(p => p.pertenceFamilia).length;
      const palavrasErradasNaFamilia = palavras.filter(p => !p.pertenceFamilia).length;
      const jaAcertouEstaFase = faseAcertada[faseAtual];

      // nenhuma palavra selecionada: limpa feedback
      if (palavras.length === 0) {
        setFamiliaCompleta(false);
        setMostrarFeedback(false);
        setMensagemFeedback('');
        return;
      }

      const completa =
        palavrasCorretasNaFamilia === totalCorretas &&
        palavrasErradasNaFamilia === 0 &&
        palavras.length === totalCorretas;

      if (completa) {
        setFamiliaCompleta(true);
        setMensagemFeedback('Parabéns! Você formou a família! 🌟');
        setMostrarFeedback(true);
        animarFeedback();

        // pontuar só uma vez por fase
        if (!jaAcertouEstaFase) {
          setAcertos(prev => prev + 1);
          setFaseAcertada(prev => {
            const novo = [...prev];
            novo[faseAtual] = true;
            return novo;
          });
        }
      } else {
        setFamiliaCompleta(false);
        if (palavrasErradasNaFamilia > 0) {
          setMensagemFeedback('Algumas palavras não pertencem à família. Tente novamente! 😊');
        } else {
          setMensagemFeedback('Ainda faltam palavras! Continue! 💪');
        }
        setMostrarFeedback(true);
        animarFeedback();
      }
    },
    [familiaAtual, faseAtual, faseAcertada, animarFeedback],
  );

  useEffect(() => {
    verificarFamilia(palavrasNaFamilia);
  }, [palavrasNaFamilia, verificarFamilia]);

  // ✅ Nota começa em 10 e cada erro tira 0,5
  const calcularNotaFinal = useCallback(() => {
    const penalidadePorErro = 0.5;

    let nota = 10 - erros * penalidadePorErro;
    nota = Math.max(0, Math.min(10, nota));
    return Math.round(nota * 10) / 10;
  }, [erros]);

  const finalizarJogo = useCallback(async () => {
    const nota = calcularNotaFinal();
    setNotaFinal(nota);
    setModalVisible(true);

    if (criancaId) {
      const tempoSegundos = tempoInicio
        ? Math.floor((Date.now() - tempoInicio) / 1000)
        : undefined;

      try {
        const res = await registrarMinijogo({
          pontuacao: Number(nota),
          categoria: 'Português',
          crianca_id: Number(criancaId),
          titulo: 'Família de Palavras',
          descricao: 'Selecione palavras que pertencem à mesma família (mesma terminação).',
          observacoes: null,
          tempo_segundos: tempoSegundos,
        });

        if (res.ok) {
          const r: any = res;
          const atividadeIdFrom =
            r?.data?.atividade?.id ?? r?.data?.atividade_id ?? null;
          if (atividadeIdFrom) setAtividadeId(atividadeIdFrom);
        } else {
          const r: any = res;
          console.warn(
            'Falha ao registrar mini-jogo automático:',
            r?.data?.error ?? r?.text ?? r?.error,
          );
        }
      } catch (e) {
        console.warn('Falha ao registrar mini-jogo automático:', e);
      }
    }
  }, [calcularNotaFinal, criancaId, tempoInicio]);

  const avancarFase = useCallback(() => {
    setFamiliaCompleta(false);
    setMostrarFeedback(false);
    setMensagemFeedback('');

    setFaseAtual(prev => {
      const proxima = prev + 1;
      if (proxima < familiasPalavras.length) {
        return proxima;
      } else {
        setTimeout(() => {
          finalizarJogo();
        }, 100);
        return prev;
      }
    });
  }, [finalizarJogo]);

  // ✅ Conta erro quando a criança coloca palavra errada no quadro
  const selecionarPalavra = (palavra: PalavraItem) => {
    setPalavrasSelecionadas(prev => {
      const novo = new Set(prev);

      if (novo.has(palavra.id)) {
        // se já estava selecionada, remove da família
        novo.delete(palavra.id);
        setPalavrasNaFamilia(prevFamilia =>
          prevFamilia.filter(p => p.id !== palavra.id),
        );
      } else {
        // se não estava, adiciona à família
        novo.add(palavra.id);
        setPalavrasNaFamilia(prevFamilia => [...prevFamilia, palavra]);

        // se a palavra NÃO pertence à família, conta um erro
        if (!palavra.pertenceFamilia) {
          setErros(prevErros => prevErros + 1);
        }
      }

      return novo;
    });
  };

  const enviarResultado = async () => {
    if (!criancaId || !atividadeId) {
      Alert.alert('Erro', 'Faltam informações para registrar.');
      return;
    }

    try {
      const res = await registrarProgresso({
        crianca_id: Number(criancaId),
        atividade_id: Number(atividadeId),
        pontuacao: Number(notaFinal),
        observacoes:
          observacao ||
          `Formou ${acertos} de ${familiasPalavras.length} famílias corretamente.`,
        concluida: true,
      });

      if (res.ok) {
        Alert.alert('Sucesso', 'Progresso registrado.');
        setModalVisible(false);
        router.push('/(tabs)/home');
      } else {
        const r: any = res;
        const message =
          r?.data?.error ?? r?.text ?? r?.error ?? `status ${r?.status}`;
        Alert.alert('Erro', `Falha ao registrar: ${message}`);
      }
    } catch (e) {
      Alert.alert('Erro', 'Falha de conexão ao registrar.');
    }
  };

  const scaleAnim = animacao.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: applyColor(Colors.light.primary) }]} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor={applyColor(Colors.light.primary)} />

      <View style={styles.backgroundShapes}>
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 400 800"
          preserveAspectRatio="none"
          style={styles.blobSvg}
        >
          <Path
            d="M280,30 Q340,10 370,60 T360,140 Q330,170 280,150 T240,90 Q230,50 280,30 Z"
            fill={applyColor(Colors.light.primaryDark)}
            opacity={0.7}
          />
          <Path
            d="M-20,680 Q30,660 50,700 T40,760 Q10,790 -20,770 T-50,720 Q-60,680 -20,680 Z"
            fill={applyColor(Colors.light.primaryDark)}
            opacity={0.65}
          />
        </Svg>
      </View>

      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Forme a Família</Text>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setMostrarAjuda(true)}
        >
          <View style={styles.helpButton}>
            <Text style={[styles.helpButtonText, { color: applyColor(Colors.light.primary) }]}>?</Text>
          </View>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.instrucaoContainer}>
          <Text style={styles.instrucaoTexto}>
            {transformText('Selecione palavras que terminam com')}
          </Text>
          <View
            style={[styles.terminoBadge, { backgroundColor: applyColor(familiaAtual.cor) }]}
          >
            <Text style={styles.terminoTexto}>{familiaAtual.termino}</Text>
          </View>
          <Text style={styles.instrucaoTexto}>
            {transformText('para formar a família!')}
          </Text>
        </View>

        <View style={styles.familiaContainer}>
          <Text style={styles.familiaLabel}>
            {transformText('Família de Palavras:')}
          </Text>
          <View style={styles.familiaArea}>
            {palavrasNaFamilia.length === 0 ? (
              <Text style={styles.familiaVazia}>
                {transformText('Selecione palavras aqui')}
              </Text>
            ) : (
              <View style={styles.palavrasNaFamilia}>
                {palavrasNaFamilia.map(palavra => (
                  <TouchableOpacity
                    key={palavra.id}
                    style={[
                      styles.palavraFamiliaCard,
                      {
                        backgroundColor: palavra.pertenceFamilia
                          ? applyColor(familiaAtual.cor)
                          : applyColor('#FF5722'),
                      },
                    ]}
                    onPress={() => selecionarPalavra(palavra)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.palavraFamiliaTexto}>
                      {palavra.palavra}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        </View>

        <View style={styles.palavrasDisponiveisContainer}>
          <Text style={styles.palavrasLabel}>
            {transformText('Palavras Disponíveis:')}
          </Text>
          <View style={styles.palavrasGrid}>
            {palavrasDisponiveis.map(palavra => {
              const selecionada = palavrasSelecionadas.has(palavra.id);
              return (
                <TouchableOpacity
                  key={palavra.id}
                  style={[
                    styles.palavraCard,
                    selecionada && styles.palavraCardSelecionada,
                  ]}
                  onPress={() => selecionarPalavra(palavra)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.palavraTexto,
                      selecionada && styles.palavraTextoSelecionada,
                    ]}
                  >
                    {palavra.palavra}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {familiaCompleta && (
          <TouchableOpacity
            style={styles.enviarButton}
            onPress={avancarFase}
            activeOpacity={0.8}
          >
            <Text style={[styles.enviarButtonText, { color: applyColor(Colors.light.primary) }]}> 
              {transformText('Continuar')}
            </Text>
          </TouchableOpacity>
        )}

        <View style={styles.progressoContainer}>
          <Text style={styles.progressoTexto}>
            {transformText(`Fase ${faseAtual + 1} de ${familiasPalavras.length}`)}
          </Text>
        </View>
      </ScrollView>

      {/* Toast de feedback fixo no TOPO, por cima de tudo */}
      {mostrarFeedback && mensagemFeedback !== '' && (
        <Animated.View
          style={[
            styles.feedbackToast,
            {
              opacity: animacao,
              transform: [{ scale: scaleAnim }],
            },
          ]}
          pointerEvents="none"
        >
          <Text
            style={[
              styles.feedbackText,
              familiaCompleta ? styles.feedbackCorreto : styles.feedbackIncorreto,
            ]}
          >
            {mensagemFeedback}
          </Text>
        </Animated.View>
      )}

      {/* Modal Ajuda */}
      <Modal
        visible={mostrarAjuda}
        transparent
        animationType="fade"
        onRequestClose={() => setMostrarAjuda(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Como Jogar</Text>
              <TouchableOpacity
                onPress={() => setMostrarAjuda(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#666666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalText}>
                <Text style={styles.modalTextBold}>Objetivo:</Text> Forme famílias de
                palavras que terminam com a mesma terminação!
              </Text>

              <Text style={styles.modalText}>
                <Text style={styles.modalTextBold}>Como jogar:</Text>
              </Text>

              <Text style={styles.modalText}>
                • Observe o termo mostrado (ex: -asa, -ato, -ada)
              </Text>
              <Text style={styles.modalText}>
                • Toque nas palavras disponíveis que terminam com esse termo
              </Text>
              <Text style={styles.modalText}>
                • As palavras corretas aparecerão na área da família
              </Text>
              <Text style={styles.modalText}>
                • Você pode remover palavras clicando nelas novamente
              </Text>
              <Text style={styles.modalText}>
                • Complete a família quando tiver todas as palavras corretas!
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setMostrarAjuda(false)}
            >
              <Text style={styles.modalButtonText}>Entendi!</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal Resultado */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Jogo Finalizado!</Text>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalTextEnvio}>
                {transformText(
                  `Você formou ${acertos} de ${familiasPalavras.length} famílias corretamente!`,
                )}
              </Text>

              <Text style={styles.modalText}>
                {transformText(`Sua nota final: ${notaFinal.toFixed(1)} / 10`)}
              </Text>

              <Text style={styles.modalText}>
                {transformText('Observações (opcional):')}
              </Text>
              <TextInput
                style={styles.input}
                value={observacao}
                onChangeText={setObservacao}
                placeholder={transformText('Adicione uma observação...')}
                multiline
                numberOfLines={3}
              />
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={enviarResultado}
            >
              <Text style={styles.submitButtonText}>
                {transformText('Enviar Resultado')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.voltarButton}
              onPress={() => router.push('/(tabs)/home')}
            >
              <Text style={styles.voltarButtonText}>
                {transformText('Voltar para Home')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F78F3F' },
  backgroundShapes: { position: 'absolute', width: '100%', height: '100%', overflow: 'hidden' },
  blobSvg: { position: 'absolute', width: '100%', height: '100%' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: 'transparent',
    zIndex: 10,
  },
  headerButton: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center' },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Lexend_700Bold',
  },
  helpButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  helpButtonText: { fontSize: 18, fontWeight: 'bold', color: '#F78F3F' },
  content: { flex: 1, zIndex: 5 },
  contentContainer: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 20 },
  instrucaoContainer: { alignItems: 'center', marginBottom: 24 },
  instrucaoTexto: {
    fontSize: 18,
    color: '#FFFFFF',
    fontFamily: 'Lexend_600SemiBold',
    textAlign: 'center',
    marginBottom: 8,
  },
  terminoBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginVertical: 8,
  },
  terminoTexto: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Lexend_700Bold',
  },
  familiaContainer: { marginBottom: 24 },
  familiaLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Lexend_600SemiBold',
    marginBottom: 12,
  },
  familiaArea: {
    minHeight: 120,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  familiaVazia: {
    fontSize: 16,
    color: '#999999',
    fontFamily: 'Lexend_400Regular',
    fontStyle: 'italic',
  },
  palavrasNaFamilia: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 8 },
  palavraFamiliaCard: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    margin: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  palavraFamiliaTexto: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Lexend_700Bold',
  },

  // Toast fixo NO TOPO
  feedbackToast: {
    position: 'absolute',
    top: 70,               // logo abaixo do header / status bar
    left: 24,
    right: 24,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 10,
    zIndex: 50,            // garante que fica acima do conteúdo
  },
  feedbackText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: 'Lexend_600SemiBold',
  },
  feedbackCorreto: { color: '#4CAF50' },
  feedbackIncorreto: { color: '#FF9800' },

  palavrasDisponiveisContainer: { flex: 1, marginBottom: 16 },
  palavrasLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Lexend_600SemiBold',
    marginBottom: 12,
  },
  palavrasGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  palavraCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    margin: 4,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderBottomWidth: 4,
    borderBottomColor: '#D0D0D0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 5,
  },
  palavraCardSelecionada: { opacity: 0.5, borderColor: '#F78F3F' },

  // 👇 fonte menor nas palavras que o aluno precisa selecionar
  palavraTexto: {
    fontSize: 14, // era 18, agora menor
    fontWeight: 'bold',
    color: '#333333',
    fontFamily: 'Lexend_700Bold',
  },
  palavraTextoSelecionada: { color: '#999999' },

  progressoContainer: { alignItems: 'center', paddingVertical: 12 },
  progressoTexto: {
    fontSize: 16,
    color: '#FFFFFF',
    fontFamily: 'Lexend_600SemiBold',
  },
  enviarButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 32,
    marginBottom: 12,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  enviarButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#F78F3F',
    textAlign: 'center',
    fontFamily: 'Lexend_700Bold',
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    width: '100%',
    maxWidth: 400,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333333',
    fontFamily: 'Lexend_700Bold',
  },
  modalCloseButton: { padding: 4 },
  modalBody: { marginBottom: 24 },
  modalText: {
    fontSize: 16,
    color: '#666666',
    fontFamily: 'Lexend_400Regular',
    lineHeight: 24,
    marginBottom: 12,
  },
  modalTextBold: {
    fontWeight: 'bold',
    color: '#333333',
    fontFamily: 'Lexend_700Bold',
  },
  modalButton: {
    backgroundColor: '#F78F3F',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    fontFamily: 'Lexend_700Bold',
  },
  modalTextEnvio: {
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
});
