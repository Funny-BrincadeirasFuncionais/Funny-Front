import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Modal,
    TextInput,
    Animated,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../constants/Colors';
import { ensureAtividadeExists, registrarProgresso } from '../services/api';
import { useAccessibility } from '../context/AccessibilityContext';

interface Palavra {
    palavra: string;
    emoji: string;
}

const palavras: Palavra[] = [
    { palavra: 'SOL', emoji: '☀️' },
    { palavra: 'CARRO', emoji: '🚗' },
    { palavra: 'CASA', emoji: '🏠' },
    { palavra: 'GATO', emoji: '🐱' },
    { palavra: 'ÁRVORE', emoji: '🌳' },
];

export default function JogoMontaPalavra() {
    const router = useRouter();
    const { transformText } = useAccessibility();
    const [faseAtual, setFaseAtual] = useState(0);
    const [letrasEmbaralhadas, setLetrasEmbaralhadas] = useState<string[]>([]);
    const [letrasSelecionadas, setLetrasSelecionadas] = useState<string[]>([]);
    const [indicesUsados, setIndicesUsados] = useState<boolean[]>([]);
    const [mensagemFeedback, setMensagemFeedback] = useState<string>('');
    const [mostrarFeedback, setMostrarFeedback] = useState(false);
    const [palavraCorreta, setPalavraCorreta] = useState(false);
    const [animacao] = useState(new Animated.Value(0));
    const [pontuacao, setPontuacao] = useState(0);
    const [criancaId, setCriancaId] = useState<string | null>(null);
    const [atividadeId, setAtividadeId] = useState<number | null>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [observacao, setObservacao] = useState('');

    const palavraAtual = palavras[faseAtual];
    const palavraCorretaArray = palavraAtual.palavra.split('');

    useEffect(() => {
        // Garantir criança selecionada e atividade existente
        (async () => {
            const id = await AsyncStorage.getItem('criancaSelecionada');
            setCriancaId(id);
            if (!id) {
                Alert.alert(transformText('Selecione uma criança'), transformText('Você precisa selecionar uma criança na Home antes de iniciar o jogo.'), [
                    { text: transformText('OK'), onPress: () => router.back() },
                ]);
                return;
            }
            const aid = await ensureAtividadeExists(
                'Montar Palavra',
                'Arraste as letras para formar a palavra',
                'Português',
                1
            );
            setAtividadeId(aid);
        })();
    }, []);

    useEffect(() => {
        if (palavraAtual) {
            // Embaralhar letras
            const letras = palavraAtual.palavra.split('');
            const embaralhadas = [...letras].sort(() => Math.random() - 0.5);
            setLetrasEmbaralhadas(embaralhadas);
            setLetrasSelecionadas([]);
            setIndicesUsados(new Array(embaralhadas.length).fill(false));
            setPalavraCorreta(false);
            setMensagemFeedback('');
            setMostrarFeedback(false);
            animacao.setValue(0);
        }
    }, [faseAtual, palavraAtual, animacao]);

    const mostrarMensagemFeedback = useCallback((correto: boolean) => {
        if (correto) {
            setMensagemFeedback(transformText('Parabéns! Você acertou! 🌟'));
        } else {
            setMensagemFeedback(transformText('Quase lá! Tente novamente! 😊'));
        }
        setMostrarFeedback(true);
        
        // Animação de feedback
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
    }, [animacao]);

    useEffect(() => {
        const palavraEsperada = palavraAtual.palavra;
        if (letrasSelecionadas.length === palavraEsperada.length) {
            const palavraFormada = letrasSelecionadas.join('');
            
            if (palavraFormada === palavraEsperada) {
                setPalavraCorreta(true);
                mostrarMensagemFeedback(true);
                // pontuação simples: +2 por acerto
                setPontuacao((p) => p + 2);
            } else {
                setPalavraCorreta(false);
                mostrarMensagemFeedback(false);
            }
        } else {
            setPalavraCorreta(false);
            setMostrarFeedback(false);
        }
    }, [letrasSelecionadas, palavraAtual, mostrarMensagemFeedback]);

    const selecionarLetra = (letra: string, index: number) => {
        if (indicesUsados[index]) {
            // Remover letra se já foi selecionada
            // Encontrar a posição da letra que corresponde a este índice
            let posicaoParaRemover = -1;
            let letrasEncontradas = 0;
            
            for (let i = 0; i < letrasSelecionadas.length; i++) {
                if (letrasSelecionadas[i] === letra) {
                    // Verificar quantas letras iguais existem antes deste índice nas embaralhadas
                    const letrasAntesNoEmbaralhado = letrasEmbaralhadas.slice(0, index).filter(l => l === letra).length;
                    if (letrasEncontradas === letrasAntesNoEmbaralhado) {
                        posicaoParaRemover = i;
                        break;
                    }
                    letrasEncontradas++;
                }
            }
            
            if (posicaoParaRemover !== -1) {
                const novaSelecao = [...letrasSelecionadas];
                novaSelecao.splice(posicaoParaRemover, 1);
                const novosIndices = [...indicesUsados];
                novosIndices[index] = false;
                setIndicesUsados(novosIndices);
                setLetrasSelecionadas(novaSelecao);
            }
        } else {
            // Adicionar letra
            const novosIndices = [...indicesUsados];
            novosIndices[index] = true;
            setIndicesUsados(novosIndices);
            setLetrasSelecionadas([...letrasSelecionadas, letra]);
        }
    };

    const continuar = () => {
        if (palavraCorreta) {
            if (faseAtual < palavras.length - 1) {
                setFaseAtual(faseAtual + 1);
            } else {
                // Jogo finalizado - abrir modal para enviar progresso
                setModalVisible(true);
            }
        }
    };

    const reiniciarPalavra = () => {
        setLetrasSelecionadas([]);
        setIndicesUsados(new Array(letrasEmbaralhadas.length).fill(false));
        setPalavraCorreta(false);
        setMostrarFeedback(false);
        setMensagemFeedback('');
    };

    const scaleAnim = animacao.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 1.1],
    });

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar barStyle="light-content" backgroundColor="#F78F3F" />
            
            {/* Background Blob Shapes */}
            <View style={styles.backgroundShapes}>
                <Svg width="100%" height="100%" viewBox="0 0 400 800" preserveAspectRatio="none" style={styles.blobSvg}>
                    {/* Blob 1 - Top Right */}
                    <Path
                        d="M280,30 Q340,10 370,60 T360,140 Q330,170 280,150 T240,90 Q230,50 280,30 Z"
                        fill="#E07612"
                        opacity={0.7}
                    />
                    {/* Blob 2 - Bottom Left */}
                    <Path
                        d="M-20,680 Q30,660 50,700 T40,760 Q10,790 -20,770 T-50,720 Q-60,680 -20,680 Z"
                        fill="#E07612"
                        opacity={0.65}
                    />
                    {/* Blob 3 - Middle Left */}
                    <Path
                        d="M-10,280 Q30,260 50,300 T40,360 Q10,390 -10,370 T-40,320 Q-50,280 -10,280 Z"
                        fill="#E07612"
                        opacity={0.6}
                    />
                    {/* Blob 4 - Bottom Right */}
                    <Path
                        d="M340,580 Q370,560 390,600 T380,660 Q350,690 340,670 T310,620 Q300,580 340,580 Z"
                        fill="#E07612"
                        opacity={0.55}
                    />
                    {/* Blob 5 - Top Left */}
                    <Path
                        d="M30,120 Q60,100 85,140 T80,190 Q55,210 30,195 T10,150 Q5,120 30,120 Z"
                        fill="#E07612"
                        opacity={0.5}
                    />
                </Svg>
            </View>
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                    <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{transformText('Descubra a figura')}</Text>
                <TouchableOpacity style={styles.headerButton}>
                    <View style={styles.helpButton}>
                        <Text style={styles.helpButtonText}>?</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {/* Card com imagem/emoji */}
                <View style={styles.imageCardContainer}>
                    <View style={styles.imageCard}>
                        <Text style={styles.emoji}>{palavraAtual.emoji}</Text>
                    </View>
                </View>

                {/* Linhas indicadoras */}
                <View style={styles.linhasContainer}>
                    {palavraCorretaArray.map((_, index) => (
                        <View key={index} style={styles.linhaWrapper}>
                            <Text style={styles.linha}>
                                {letrasSelecionadas[index] || '_'}
                            </Text>
                        </View>
                    ))}
                </View>

                {/* Feedback */}
                {mostrarFeedback && (
                    <Animated.View
                        style={[
                            styles.feedbackContainer,
                            {
                                transform: [{ scale: scaleAnim }],
                                opacity: animacao,
                            },
                        ]}
                    >
                        <Text
                            style={[
                                styles.feedbackText,
                                palavraCorreta ? styles.feedbackCorreto : styles.feedbackIncorreto,
                            ]}
                        >
                            {mensagemFeedback}
                        </Text>
                    </Animated.View>
                )}

                {/* Botões com letras embaralhadas */}
                <View style={styles.letrasContainer}>
                    {letrasEmbaralhadas.map((letra, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.letraButtonContainer,
                                indicesUsados[index] && styles.letraButtonContainerUsada,
                            ]}
                            onPress={() => selecionarLetra(letra, index)}
                            disabled={indicesUsados[index] && !palavraCorreta}
                            activeOpacity={0.7}
                        >
                            <View style={[
                                styles.letraButton,
                                indicesUsados[index] && styles.letraButtonUsada,
                            ]}>
                                <Text style={styles.letraButtonText}>{letra}</Text>
                            </View>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Botão Continuar */}
                <View style={styles.continuarButtonContainer}>
                    <TouchableOpacity
                        style={[
                            styles.continuarButton,
                            !palavraCorreta && styles.continuarButtonDisabled,
                        ]}
                        onPress={continuar}
                        disabled={!palavraCorreta}
                        activeOpacity={0.8}
                    >
                        <Text
                            style={[
                                styles.continuarButtonText,
                                !palavraCorreta && styles.continuarButtonTextDisabled,
                            ]}
                        >
                            {transformText('Continuar')}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Botão Reiniciar */}
                {letrasSelecionadas.length > 0 && (
                    <TouchableOpacity style={styles.reiniciarButton} onPress={reiniciarPalavra}>
                        <Text style={styles.reiniciarButtonText}>{transformText('Tentar novamente')}</Text>
                    </TouchableOpacity>
                )}
            </View>
            {/* Modal de finalização */}
            <Modal visible={modalVisible} animationType="slide" transparent>
                <View style={styles.modalContainer}>
                    <View style={styles.modalBox}>
                        <Text style={styles.modalTitle}>{transformText('🎉 Parabéns!')}</Text>
                        <Text style={styles.modalText}>
                          {transformText('Pontuação')}: {pontuacao}
                        </Text>
                        <TextInput
                            style={styles.input}
                            placeholder={transformText('Observação (opcional)')}
                            value={observacao}
                            onChangeText={setObservacao}
                        />
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={async () => {
                                if (!criancaId || !atividadeId) {
                                    Alert.alert(transformText('Erro'), transformText('Faltam informações para registrar o progresso.'));
                                    return;
                                }
                                try {
                                    const res = await registrarProgresso({
                                        crianca_id: Number(criancaId),
                                        atividade_id: Number(atividadeId),
                                        pontuacao: Number(pontuacao),
                                        observacoes: observacao || undefined,
                                        concluida: true,
                                    });
                                    if (res.ok) {
                                        Alert.alert(transformText('Sucesso'), transformText('Progresso registrado.'));
                                        setModalVisible(false);
                                        router.push('/(tabs)/home');
                                    } else {
                                        const txt = await res.text();
                                        Alert.alert(transformText('Erro'), `${transformText('Falha ao registrar')}: ${txt}`);
                                    }
                                } catch (e) {
                                    Alert.alert(transformText('Erro'), transformText('Falha de conexão ao registrar.'));
                                }
                            }}
                        >
                            <Text style={styles.submitButtonText}>{transformText('Enviar')}</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.voltarButton} onPress={() => router.push('/(tabs)/home')}>
                            <Text style={styles.voltarButtonText}>{transformText('Voltar para Home')}</Text>
                        </TouchableOpacity>
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
    content: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: 20,
        alignItems: 'center',
        zIndex: 5,
    },
    imageCardContainer: {
        width: '100%',
        marginBottom: 30,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 6,
    },
    imageCard: {
        width: '100%',
        height: 200,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderBottomWidth: 4,
        borderBottomColor: '#D0D0D0',
    },
    emoji: {
        fontSize: 120,
    },
    linhasContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 30,
        gap: 16,
        flexWrap: 'nowrap',
        paddingHorizontal: 10,
    },
    linhaWrapper: {
        minWidth: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    linha: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#FFFFFF',
        letterSpacing: 2,
        fontFamily: 'Lexend_700Bold',
        textAlign: 'center',
    },
    feedbackContainer: {
        marginBottom: 20,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderBottomWidth: 3,
        borderBottomColor: '#D0D0D0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
    },
    feedbackText: {
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        fontFamily: 'Lexend_600SemiBold',
    },
    feedbackCorreto: {
        color: '#4CAF50',
    },
    feedbackIncorreto: {
        color: '#FF9800',
    },
    letrasContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        marginBottom: 30,
        gap: 10,
    },
    letraButtonContainer: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 4,
        elevation: 5,
    },
    letraButtonContainerUsada: {
        shadowOpacity: 0.05,
        elevation: 2,
    },
    letraButton: {
        width: 65,
        height: 65,
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderBottomWidth: 4,
        borderBottomColor: '#D0D0D0',
    },
    letraButtonUsada: {
        opacity: 0.4,
        backgroundColor: '#F5F5F5',
        borderBottomColor: '#C0C0C0',
    },
    letraButtonText: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333333',
        fontFamily: 'Lexend_700Bold',
    },
    continuarButtonContainer: {
        width: '100%',
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 6,
    },
    continuarButton: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        paddingVertical: 18,
        paddingHorizontal: 32,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderBottomWidth: 4,
        borderBottomColor: '#D0D0D0',
    },
    continuarButtonDisabled: {
        opacity: 0.5,
    },
    continuarButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#F78F3F',
        textAlign: 'center',
        fontFamily: 'Lexend_700Bold',
    },
    continuarButtonTextDisabled: {
        color: '#CCCCCC',
    },
    reiniciarButton: {
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
    reiniciarButtonText: {
        fontSize: 14,
        color: '#FFFFFF',
        textAlign: 'center',
        fontFamily: 'Lexend_400Regular',
        textDecorationLine: 'underline',
    },
    // Modal styles (reutilizados do jogo de contagem)
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

