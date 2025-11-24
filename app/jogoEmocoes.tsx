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
import { registrarMinijogo } from '../services/api';

type Emotion = {
    id: string;
    label: string;
    emoji: string;
};

type Level = {
    id: number;
    name: string;
    emotions: Emotion[];
};

// Emoções por nível (mais simples -> mais complexas)
// Nota: Os níveis não são exibidos, mas são usados para calcular a média ponderada
const LEVELS: Level[] = [
    {
        id: 1,
        name: 'Nível 1',
        emotions: [
            { id: 'feliz', label: 'Feliz', emoji: '😊' },
            { id: 'triste', label: 'Triste', emoji: '😢' },
            { id: 'bravo', label: 'Bravo', emoji: '😡' },
            { id: 'cansado', label: 'Cansado', emoji: '🥱' },
            { id: 'rir', label: 'Rindo muito', emoji: '🤣' },
        ],
    },
    {
        id: 2,
        name: 'Nível 2',
        emotions: [
            { id: 'assustado', label: 'Assustado', emoji: '😱' },
            { id: 'chorando', label: 'Chorando', emoji: '😭' },
            { id: 'surpreso', label: 'Surpreso', emoji: '😲' },
            { id: 'chateado', label: 'Chateado', emoji: '😒' },
        ],
    },
    {
        id: 3,
        name: 'Nível 3',
        emotions: [
            { id: 'apaixonado', label: 'Apaixonado', emoji: '😍' },
            { id: 'pensativo', label: 'Pensativo', emoji: '🤔' },
            { id: 'carente', label: 'Carente', emoji: '🥺' },
        ],
    },
    {
        id: 4,
        name: 'Nível 4',
        emotions: [
            { id: 'indiferente', label: 'Indiferente', emoji: '😐' },
            { id: 'dormindo', label: 'Dormindo', emoji: '😴' },
            { id: 'emocionado', label: 'Emocionado', emoji: '🥹' },
        ],
    },
    {
        id: 5,
        name: 'Nível 5',
        emotions: [
            { id: 'confiante', label: 'Confiante', emoji: '😎' },
            { id: 'preocupado', label: 'Preocupado', emoji: '😟' },
            { id: 'ansioso', label: 'Ansioso', emoji: '😰' },
        ],
    },
];

// Embaralhar array simples
function shuffle<T>(array: T[]): T[] {
    const copy = [...array];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
}

export default function JogoEmocoes() {
    const router = useRouter();
    const { transformText } = useAccessibility();
    const [currentLevelIndex, setCurrentLevelIndex] = useState(0); // 0..4
    const [currentEmotion, setCurrentEmotion] = useState<Emotion | null>(null);
    const [options, setOptions] = useState<Emotion[]>([]);
    const [attemptInLevel, setAttemptInLevel] = useState<1 | 2>(1);
    const [gameFinished, setGameFinished] = useState(false);
    const [feedback, setFeedback] = useState<string | null>(null);
    const [criancaId, setCriancaId] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [observacao, setObservacao] = useState('');
    const [animacao] = useState(new Animated.Value(0));
    // Rastrear acertos e erros por nível para calcular média ponderada
    const [acertosPorNivel, setAcertosPorNivel] = useState<number[]>(new Array(5).fill(0));
    const [totalTentativasPorNivel, setTotalTentativasPorNivel] = useState<number[]>(new Array(5).fill(0));
    // Rastrear emoções já usadas em cada nível para garantir ordem aleatória
    const [emoesUsadasPorNivel, setEmoesUsadasPorNivel] = useState<Set<string>[]>(new Array(5).fill(null).map(() => new Set()));
    // Rastrear tempo de início do jogo
    const [tempoInicio, setTempoInicio] = useState<number | null>(null);

    // Inicializar primeiro nível
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
        };
        carregarDados();
        setTempoInicio(Date.now()); // Registrar início do jogo
        startLevel(0);
    }, []);

    // Quando o jogo termina, abrir modal
    useEffect(() => {
        if (gameFinished) {
            setModalVisible(true);
        }
    }, [gameFinished]);

    function startLevel(levelIndex: number) {
        const level = LEVELS[levelIndex];
        if (!level) return;
    
        // Embaralha as emoções do nível e escolhe uma aleatória
        const emoesEmbaralhadas = shuffle(level.emotions);
        const emotion = emoesEmbaralhadas[0];
    
        // Marca essa emoção como usada no nível
        setEmoesUsadasPorNivel((prev) => {
            const novo = [...prev];
            novo[levelIndex] = new Set([emotion.id]);
            return novo;
        });
    
        const opts = buildOptionsForEmotion(levelIndex, emotion);
    
        setCurrentLevelIndex(levelIndex);
        setCurrentEmotion(emotion);
        setOptions(opts);
        setAttemptInLevel(1);
        setFeedback(null);
    }

    function getRandomEmotion(emotions: Emotion[]): Emotion {
        const index = Math.floor(Math.random() * emotions.length);
        return emotions[index];
    }

    function buildOptionsForEmotion(levelIndex: number, correctEmotion: Emotion): Emotion[] {
        // Pool de opções: todos os níveis até o nível atual
        const pool = LEVELS.slice(0, levelIndex + 1).flatMap((lvl) => lvl.emotions);
        const uniqueById: { [id: string]: Emotion } = {};

        pool.forEach((e) => {
            uniqueById[e.id] = e;
        });

        const allUnique = Object.values(uniqueById).filter((e) => e.id !== correctEmotion.id);

        // Tamanho de alternativas cresce com a dificuldade (máx 6)
        const totalOptions = Math.min(3 + levelIndex, 6, allUnique.length + 1);

        const shuffledOthers = shuffle(allUnique);
        const picked = shuffledOthers.slice(0, totalOptions - 1);

        const combined = shuffle([correctEmotion, ...picked]);
        return combined;
    }

    function handleAnswer(selectedId: string) {
        if (!currentEmotion || gameFinished) return;

        const isCorrect = selectedId === currentEmotion.id;

        // Registrar tentativa no nível atual
        setTotalTentativasPorNivel(prev => {
            const novo = [...prev];
            novo[currentLevelIndex] = novo[currentLevelIndex] + 1;
            return novo;
        });

        if (isCorrect) {
            // Acertou: registrar acerto no nível atual
            setAcertosPorNivel(prev => {
                const novo = [...prev];
                novo[currentLevelIndex] = novo[currentLevelIndex] + 1;
                return novo;
            });
            setFeedback('Muito bem! Você acertou! 🌟');
            mostrarFeedbackAnimacao(true);
            goToNextLevel();
        } else {
            if (attemptInLevel === 1) {
                // Primeira tentativa errada -> nova expressão do mesmo nível (entre as não usadas)
                setFeedback('Quase! Vamos tentar outra carinha desse mesmo tipo.');
                mostrarFeedbackAnimacao(false);
            
                const currentLevel = LEVELS[currentLevelIndex];
            
                // Usa o estado atual de emoções usadas
                const usadas = emoesUsadasPorNivel[currentLevelIndex] || new Set<string>();
            
                // Filtra emoções ainda não usadas no nível atual
                const naoUsadas = currentLevel.emotions.filter((e) => !usadas.has(e.id));
            
                let nextEmotion: Emotion;
            
                if (naoUsadas.length > 0) {
                    const embaralhadas = shuffle(naoUsadas);
                    nextEmotion = embaralhadas[0];
                } else {
                    // Se já usou todas, pega qualquer uma diferente da atual
                    const remaining = currentLevel.emotions.filter(
                        (e) => e.id !== currentEmotion.id
                    );
                    nextEmotion = remaining.length > 0 ? getRandomEmotion(remaining) : currentEmotion;
                }
            
                // Atualiza estado de emoções usadas
                const novoSet = new Set(usadas);
                novoSet.add(nextEmotion.id);
            
                setEmoesUsadasPorNivel((prev) => {
                    const novo = [...prev];
                    novo[currentLevelIndex] = novoSet;
                    return novo;
                });
            
                // Atualiza emoção e opções
                const newOptions = buildOptionsForEmotion(currentLevelIndex, nextEmotion);
                setCurrentEmotion(nextEmotion);
                setOptions(newOptions);
                setAttemptInLevel(2);
            } else {
                // Segunda tentativa errada -> pula para próxima fase
                setFeedback('Tudo bem, vamos para a próxima fase!');
                mostrarFeedbackAnimacao(false);
                goToNextLevel();
            }
            
        }
    }

    function mostrarFeedbackAnimacao(correto: boolean) {
        Animated.sequence([
            Animated.timing(animacao, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.delay(1500),
            Animated.timing(animacao, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start();
    }

    // Calcular nota final como média ponderada dos acertos por nível
    // Níveis mais difíceis têm mais peso (nível 1 = peso 1, nível 5 = peso 5)
    const calcularNotaFinal = useCallback(() => {
        let somaPonderada = 0;
        let somaPesos = 0;

        for (let i = 0; i < LEVELS.length; i++) {
            const peso = i + 0.1; // Nível 1 = peso 0.1, nível 5 = peso 0.5
            const acertos = acertosPorNivel[i];
            const tentativas = totalTentativasPorNivel[i];

            if (tentativas > 0) {
                const taxaAcerto = acertos / tentativas; // 0 a 1
                somaPonderada += taxaAcerto * peso;
                somaPesos += peso;
            }
        }

        if (somaPesos === 0) return 0;

        // Média ponderada (0 a 1) convertida para escala 0-10
        const mediaPonderada = somaPonderada / somaPesos;
        const notaFinal = mediaPonderada * 10;

        // Limitar entre 0 e 10 e arredondar para 1 casa decimal
        return Math.max(0, Math.min(10, Math.round(notaFinal * 10) / 10));
    }, [acertosPorNivel, totalTentativasPorNivel]);

    const salvarProgresso = async () => {
        if (!criancaId) return;
        
        const notaFinal = calcularNotaFinal();
        // Calcular tempo em segundos
        const tempoSegundos = tempoInicio ? Math.floor((Date.now() - tempoInicio) / 1000) : undefined;
        
        try {
            await registrarMinijogo({
                pontuacao: notaFinal,
                categoria: 'Cotidiano',
                crianca_id: Number(criancaId),
                titulo: 'Jogo das Emoções',
                descricao: 'Identifique as emoções representadas pelos emojis.',
                observacoes: observacao || null,
                tempo_segundos: tempoSegundos,
            });
        } catch (e) {
            console.warn('Erro ao registrar mini-jogo:', e);
        }
    };

    function goToNextLevel() {
        setTimeout(() => {
            const nextIndex = currentLevelIndex + 1;
            if (nextIndex >= LEVELS.length) {
                // Fim do jogo
                setGameFinished(true);
            } else {
                startLevel(nextIndex);
            }
        }, 2000);
    }

    function resetGame() {
        setGameFinished(false);
        setModalVisible(false);
        setObservacao('');
        setAcertosPorNivel(new Array(5).fill(0));
        setTotalTentativasPorNivel(new Array(5).fill(0));
        setEmoesUsadasPorNivel(new Array(5).fill(null).map(() => new Set()));
        startLevel(0);
    }

    const currentLevel = LEVELS[currentLevelIndex];

    if (gameFinished && !modalVisible) {
        return null; // Aguardar modal abrir
    }

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar barStyle="light-content" backgroundColor="#F78F3F" />

            {/* Background Blob Shapes */}
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
                        fill="#E07612"
                        opacity={0.7}
                    />
                    <Path
                        d="M-20,680 Q30,660 50,700 T40,760 Q10,790 -20,770 T-50,720 Q-60,680 -20,680 Z"
                        fill="#E07612"
                        opacity={0.65}
                    />
                </Svg>
            </View>

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                    <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{transformText('Jogo das Emoções')}</Text>
                <View style={styles.headerButton} />
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
                {!gameFinished ? (
                    <>
                        <View style={styles.levelInfo}>
                            <Text style={styles.levelProgress}>
                                {transformText(`Fase ${currentLevelIndex + 1} de ${LEVELS.length}`)}
                            </Text>
                        </View>

                        {currentEmotion && (
                            <View style={styles.emojiContainer}>
                                <Text style={styles.emoji}>{currentEmotion.emoji}</Text>
                            </View>
                        )}

                        <Text style={styles.question}>
                            {transformText('Como ele(a) está se sentindo?')}
                        </Text>

                        <View style={styles.optionsGrid}>
                            {options.map((emotion) => (
                                <TouchableOpacity
                                    key={emotion.id}
                                    style={styles.optionButton}
                                    onPress={() => handleAnswer(emotion.id)}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.optionText}>{transformText(emotion.label)}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {feedback && (
                            <Animated.View
                                style={[
                                    styles.feedbackContainer,
                                    {
                                        opacity: animacao.interpolate({
                                            inputRange: [0, 1],
                                            outputRange: [0, 1],
                                        }),
                                    },
                                ]}
                            >
                                <Text style={styles.feedbackText}>{transformText(feedback)}</Text>
                            </Animated.View>
                        )}
                    </>
                ) : (
                    <View style={styles.finishedContainer}>
                        <Text style={styles.finishedTitle}>
                            {transformText('Você terminou todas as fases! 🌟')}
                        </Text>
                        <Text style={styles.finishedText}>
                            {transformText('Agora o adulto pode escolher outra atividade ou jogar novamente.')}
                        </Text>
                    </View>
                )}
            </ScrollView>

            {/* Modal de Finalização */}
            <Modal
                visible={modalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>
                            {transformText('Jogo Finalizado!')}
                        </Text>
                        <Text style={styles.modalText}>
                            {transformText('Parabéns por completar o Jogo das Emoções!')}
                        </Text>
                        <View style={styles.notaContainer}>
                            <Text style={styles.notaLabel}>
                                {transformText('Sua nota:')}
                            </Text>
                            <Text style={styles.notaValue}>
                                {calcularNotaFinal().toFixed(1)}/10
                            </Text>
                        </View>
                        <Text style={styles.modalSubtext}>
                            {transformText('(A nota foi salva no sistema)')}
                        </Text>

                        <TextInput
                            style={styles.observacaoInput}
                            placeholder={transformText('Observações (opcional)')}
                            placeholderTextColor="#999"
                            value={observacao}
                            onChangeText={setObservacao}
                            multiline
                            numberOfLines={3}
                        />

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonSecondary]}
                                onPress={async () => {
                                    await salvarProgresso();
                                    setModalVisible(false);
                                    router.back();
                                }}
                            >
                                <Text style={styles.modalButtonTextSecondary}>
                                    {transformText('Voltar')}
                                </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.modalButtonPrimary]}
                                onPress={async () => {
                                    await salvarProgresso();
                                    resetGame();
                                }}
                            >
                                <Text style={styles.modalButtonTextPrimary}>
                                    {transformText('Jogar de novo')}
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F78F3F',
    },
    backgroundShapes: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
    },
    blobSvg: {
        position: 'absolute',
        top: 0,
        left: 0,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
        zIndex: 1,
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
        fontFamily: 'Lexend_700Bold',
        color: '#FFFFFF',
    },
    content: {
        flex: 1,
        zIndex: 1,
    },
    contentInner: {
        padding: 20,
        paddingBottom: 40,
    },
    levelInfo: {
        alignItems: 'center',
        marginBottom: 24,
    },
    levelName: {
        fontSize: 18,
        fontWeight: 'bold',
        fontFamily: 'Lexend_700Bold',
        color: Colors.light.textPrimary,
        marginBottom: 4,
    },
    levelProgress: {
        fontSize: 14,
        fontFamily: 'Lexend_400Regular',
        color: '#FFFFFF',
    },
    emojiContainer: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginVertical: 32,
        padding: 20,
    },
    emoji: {
        fontSize: 120,
    },
    question: {
        fontSize: 18,
        fontFamily: 'Lexend_600SemiBold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 24,
    },
    optionsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    optionButton: {
        width: '48%',
        padding: 16,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 50,
    },
    optionText: {
        fontSize: 16,
        fontFamily: 'Lexend_400Regular',
        color: Colors.light.textPrimary,
    },
    feedbackContainer: {
        marginTop: 24,
        padding: 16,
        borderRadius: 12,
        backgroundColor: '#E8F5E9',
        alignItems: 'center',
    },
    feedbackText: {
        fontSize: 16,
        fontFamily: 'Lexend_400Regular',
        color: '#2E7D32',
        textAlign: 'center',
        fontStyle: 'italic',
    },
    finishedContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    finishedTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: 'Lexend_700Bold',
        color: Colors.light.textPrimary,
        marginBottom: 16,
        textAlign: 'center',
    },
    finishedText: {
        fontSize: 16,
        fontFamily: 'Lexend_400Regular',
        color: Colors.light.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        padding: 24,
        width: '85%',
        maxWidth: 400,
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        fontFamily: 'Lexend_700Bold',
        color: Colors.light.textPrimary,
        marginBottom: 12,
        textAlign: 'center',
    },
    modalText: {
        fontSize: 16,
        fontFamily: 'Lexend_400Regular',
        color: Colors.light.textSecondary,
        textAlign: 'center',
        marginBottom: 8,
    },
    notaContainer: {
        alignItems: 'center',
        marginVertical: 16,
        padding: 16,
        backgroundColor: '#FFF3E0',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#F78F3F',
    },
    notaLabel: {
        fontSize: 14,
        fontFamily: 'Lexend_400Regular',
        color: Colors.light.textSecondary,
        marginBottom: 4,
    },
    notaValue: {
        fontSize: 32,
        fontWeight: 'bold',
        fontFamily: 'Lexend_700Bold',
        color: '#F78F3F',
    },
    modalSubtext: {
        fontSize: 12,
        fontFamily: 'Lexend_400Regular',
        color: '#999',
        textAlign: 'center',
        marginBottom: 20,
        fontStyle: 'italic',
    },
    observacaoInput: {
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderRadius: 8,
        padding: 12,
        fontSize: 14,
        fontFamily: 'Lexend_400Regular',
        color: Colors.light.textPrimary,
        marginBottom: 20,
        minHeight: 80,
        textAlignVertical: 'top',
    },
    modalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    modalButton: {
        flex: 1,
        padding: 14,
        borderRadius: 10,
        alignItems: 'center',
    },
    modalButtonPrimary: {
        backgroundColor: '#F78F3F',
    },
    modalButtonSecondary: {
        backgroundColor: '#F5F5F5',
    },
    modalButtonTextPrimary: {
        fontSize: 16,
        fontWeight: 'bold',
        fontFamily: 'Lexend_700Bold',
        color: '#FFFFFF',
    },
    modalButtonTextSecondary: {
        fontSize: 16,
        fontFamily: 'Lexend_600SemiBold',
        color: Colors.light.textPrimary,
    },
});
