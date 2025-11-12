import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    Animated,
    Modal,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../constants/Colors';
import { useAccessibility } from '../context/AccessibilityContext';
import { ensureAtividadeExists, registrarProgresso } from '../services/api';

interface FamiliaPalavras {
    termino: string;
    palavrasCorretas: string[];
    palavrasDistratoras: string[];
    cor: string;
}

const familiasPalavras: FamiliaPalavras[] = [
    {
        termino: '-asa',
        palavrasCorretas: ['CASA', 'ASA', 'BRASA', 'GASA'],
        palavrasDistratoras: ['MESA', 'CÃO', 'LUA', 'SOL', 'CAMA', 'GATO'],
        cor: '#4CAF50'
    },
    {
        termino: '-ato',
        palavrasCorretas: ['GATO', 'RATO', 'PATO', 'PRATO'],
        palavrasDistratoras: ['MÃO', 'PÃO', 'SOL', 'MAR', 'CÉU', 'LUA'],
        cor: '#2196F3'
    },
    {
        termino: '-ada',
        palavrasCorretas: ['ENTRADA', 'SAÍDA', 'CHEGADA', 'PASSADA'],
        palavrasDistratoras: ['CASA', 'MESA', 'CAMA', 'PORTA', 'JANELA', 'BANCO'],
        cor: '#FF9800'
    },
    {
        termino: '-ão',
        palavrasCorretas: ['MÃO', 'PÃO', 'CÃO', 'CHÃO'],
        palavrasDistratoras: ['SOL', 'LUA', 'MAR', 'CÉU', 'RIO', 'MONTANHA'],
        cor: '#9C27B0'
    },
    {
        termino: '-inho',
        palavrasCorretas: ['MENINO', 'CAMINHO', 'CARINHO', 'PEQUENINHO'],
        palavrasDistratoras: ['CASA', 'GATO', 'PATO', 'BOLA', 'BRINQUEDO', 'ESCOLA'],
        cor: '#E91E63'
    }
];

interface PalavraItem {
    id: string;
    palavra: string;
    pertenceFamilia: boolean;
}

export default function JogoFamiliaPalavras() {
    const router = useRouter();
    const { transformText } = useAccessibility();
    const [faseAtual, setFaseAtual] = useState(0);
    const [palavrasDisponiveis, setPalavrasDisponiveis] = useState<PalavraItem[]>([]);
    const [palavrasNaFamilia, setPalavrasNaFamilia] = useState<PalavraItem[]>([]);
    const [palavrasSelecionadas, setPalavrasSelecionadas] = useState<Set<string>>(new Set());
    const [familiaCompleta, setFamiliaCompleta] = useState(false);
    const [mostrarFeedback, setMostrarFeedback] = useState(false);
    const [mensagemFeedback, setMensagemFeedback] = useState('');
    const [animacao] = useState(new Animated.Value(0));
    const [acertos, setAcertos] = useState(0);
    const [tentativas, setTentativas] = useState(0);
    const [jogoFinalizado, setJogoFinalizado] = useState(false);
    const [notaFinal, setNotaFinal] = useState(0);
    const [criancaId, setCriancaId] = useState<string | null>(null);
    const [faseAcertada, setFaseAcertada] = useState<boolean[]>([]); // Rastrear quais fases já foram acertadas
    const [mostrarAjuda, setMostrarAjuda] = useState(false);
    const [atividadeId, setAtividadeId] = useState<number | null>(null);
    const [observacao, setObservacao] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    const familiaAtual = familiasPalavras[faseAtual];

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
            const aid = await ensureAtividadeExists(
                'Família de Palavras',
                'Selecione palavras que pertencem à mesma família (mesma terminação).',
                'Português',
                1
            );
            setAtividadeId(aid);
        };
        carregarDados();
    }, []);

    // Util: normalizar e checar terminação (ignora acentos)
    const normalize = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const matchesTerm = (palavra: string, termino: string) => {
        const suf = termino.replace(/^-/, '').toLowerCase();
        return normalize(palavra).toLowerCase().endsWith(suf);
    };

    useEffect(() => {
        if (familiaAtual) {
            // Criar array com todas as palavras (corretas + distratoras)
            // pertenceFamilia é TRUE apenas se está na lista "palavrasCorretas"
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
                }))
            ];
            
            // Embaralhar palavras
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

    const verificarFamilia = useCallback(() => {
        const totalCorretas = familiaAtual.palavrasCorretas.length;
        const palavrasCorretasNaFamilia = palavrasNaFamilia.filter(p => p.pertenceFamilia).length;
        const palavrasErradasNaFamilia = palavrasNaFamilia.filter(p => !p.pertenceFamilia).length;

        // Evitar incrementar acertos múltiplas vezes para a mesma fase
        const jaAcertouEstaFase = faseAcertada[faseAtual] === true;

        // Família completa se tiver todas as palavras corretas e nenhuma errada
        if (palavrasCorretasNaFamilia === totalCorretas && palavrasErradasNaFamilia === 0) {
            setFamiliaCompleta(true);
            if (!jaAcertouEstaFase) {
                setAcertos(prev => prev + 1);
                setFaseAcertada(prev => {
                    const novo = [...prev];
                    novo[faseAtual] = true;
                    return novo;
                });
            }
            mostrarMensagemFeedback(true);
        } else if (palavrasNaFamilia.length > 0) {
            // Só contar tentativa se ainda não acertou esta fase
            if (!jaAcertouEstaFase) {
                setTentativas(prev => prev + 1);
            }
            mostrarMensagemFeedback(false);
        }
    }, [palavrasNaFamilia, familiaAtual, faseAtual, faseAcertada]);

    useEffect(() => {
        if (palavrasNaFamilia.length > 0) {
            verificarFamilia();
        }
    }, [palavrasNaFamilia, verificarFamilia]);

    const calcularNotaFinal = useCallback(() => {
        const totalFases = familiasPalavras.length;
        const percentualAcertos = (acertos / totalFases) * 100;
        
        // Penalizar tentativas extras de forma mais rigorosa
        const tentativasExtras = tentativas - acertos; // Tentativas além das necessárias
        const penalidadeTentativas = Math.min(tentativasExtras * 0.8, 4); // Máximo de 4 pontos
        
        // Calcular nota baseada no percentual de acertos
        let nota = (percentualAcertos / 10) - (penalidadeTentativas / 10);
        
        // Se não acertou todas as fases, reduzir nota adicionalmente
        if (acertos < totalFases) {
            const fasesErradas = totalFases - acertos;
            nota -= fasesErradas * 0.5; // Cada fase errada reduz 0.5 pontos
        }
        
        nota = Math.max(0, Math.min(10, nota));
        
        return Math.round(nota * 10) / 10;
    }, [acertos, tentativas]);

    const finalizarJogo = useCallback(() => {
        const nota = calcularNotaFinal();
        setNotaFinal(nota);
        setJogoFinalizado(true);
    }, [calcularNotaFinal]);

    const avancarFase = useCallback(() => {
        setFaseAtual(prev => {
            if (prev < familiasPalavras.length - 1) {
                return prev + 1;
            } else {
                // Usar setTimeout para garantir que o estado foi atualizado antes de finalizar
                setTimeout(() => {
                    finalizarJogo();
                }, 100);
                return prev;
            }
        });
    }, [finalizarJogo]);

    const mostrarMensagemFeedback = useCallback((correto: boolean) => {
        if (correto) {
            setMensagemFeedback('Parabéns! Você formou a família! 🌟');
        } else {
            const palavrasErradas = palavrasNaFamilia.filter(p => !p.pertenceFamilia).length;
            if (palavrasErradas > 0) {
                setMensagemFeedback('Algumas palavras não pertencem à família. Tente novamente! 😊');
            } else {
                setMensagemFeedback('Ainda faltam palavras! Continue! 💪');
            }
        }
        setMostrarFeedback(true);
        
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
        ]).start(() => {
            if (correto) {
                setTimeout(() => {
                    setMostrarFeedback(false);
                    // Usar setTimeout para garantir que o estado foi atualizado
                    setTimeout(() => {
                        avancarFase();
                    }, 100);
                }, 500);
            }
        });
    }, [animacao, palavrasNaFamilia, avancarFase]);

    const selecionarPalavra = (palavra: PalavraItem) => {
        if (familiaCompleta) return;

        if (palavrasSelecionadas.has(palavra.id)) {
            // Remover palavra da família
            setPalavrasNaFamilia(prev => prev.filter(p => p.id !== palavra.id));
            setPalavrasSelecionadas(prev => {
                const novo = new Set(prev);
                novo.delete(palavra.id);
                return novo;
            });
        } else {
            // Adicionar palavra à família
            setPalavrasNaFamilia(prev => [...prev, palavra]);
            setPalavrasSelecionadas(prev => {
                const novo = new Set(prev);
                novo.add(palavra.id);
                return novo;
            });
        }
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
                observacoes: (observacao || `Formou ${acertos} de ${familiasPalavras.length} famílias corretamente.`),
                concluida: true,
            });
            if (res.ok) {
                Alert.alert('Sucesso', 'Progresso registrado.');
                setModalVisible(false);
                router.push('/(tabs)/home');
            } else {
                const r: any = res;
                const message = r?.data?.error ?? r?.text ?? r?.error ?? `status ${r?.status}`;
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

    // Removido o popup de "Jogo Finalizado" para evitar sobreposição; usaremos apenas o modal.

    return (
        <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
            <StatusBar barStyle="light-content" backgroundColor="#F78F3F" />
            
            {/* Background Blob Shapes */}
            <View style={styles.backgroundShapes}>
                <Svg width="100%" height="100%" viewBox="0 0 400 800" preserveAspectRatio="none" style={styles.blobSvg}>
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
                <Text style={styles.headerTitle}>Forme a Família</Text>
                <TouchableOpacity 
                    style={styles.headerButton}
                    onPress={() => setMostrarAjuda(true)}
                >
                    <View style={styles.helpButton}>
                        <Text style={styles.helpButtonText}>?</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <View style={styles.content}>
                {/* Instrução */}
                <View style={styles.instrucaoContainer}>
                    <Text style={styles.instrucaoTexto}>
                        {transformText('Arraste palavras que terminam com')}
                    </Text>
                    <View style={[styles.terminoBadge, { backgroundColor: familiaAtual.cor }]}>
                        <Text style={styles.terminoTexto}>{familiaAtual.termino}</Text>
                    </View>
                    <Text style={styles.instrucaoTexto}>{transformText('para formar a família!')}</Text>
                </View>

                {/* Área da Família */}
                <View style={styles.familiaContainer}>
                    <Text style={styles.familiaLabel}>{transformText('Família de Palavras:')}</Text>
                    <View style={styles.familiaArea}>
                        {palavrasNaFamilia.length === 0 ? (
                            <Text style={styles.familiaVazia}>
                                {transformText('Arraste palavras aqui')}
                            </Text>
                        ) : (
                            <View style={styles.palavrasNaFamilia}>
                                {palavrasNaFamilia.map((palavra) => (
                                    <TouchableOpacity
                                        key={palavra.id}
                                        style={[
                                            styles.palavraFamiliaCard,
                                            { 
                                                backgroundColor: palavra.pertenceFamilia 
                                                    ? familiaAtual.cor 
                                                    : '#FF5722'
                                            }
                                        ]}
                                        onPress={() => selecionarPalavra(palavra)}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={styles.palavraFamiliaTexto}>{palavra.palavra}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        )}
                    </View>
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
                                familiaCompleta ? styles.feedbackCorreto : styles.feedbackIncorreto,
                            ]}
                        >
                            {mensagemFeedback}
                        </Text>
                    </Animated.View>
                )}

                {/* Palavras Disponíveis */}
                <View style={styles.palavrasDisponiveisContainer}>
                    <Text style={styles.palavrasLabel}>{transformText('Palavras Disponíveis:')}</Text>
                    <View style={styles.palavrasGrid}>
                        {palavrasDisponiveis.map((palavra) => {
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
                                    <Text style={[
                                        styles.palavraTexto,
                                        selecionada && styles.palavraTextoSelecionada
                                    ]}>
                                        {palavra.palavra}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Botão Continuar (só quando formar a família corretamente) */}
                {familiaCompleta && (
                    <TouchableOpacity
                        style={styles.enviarButton}
                        onPress={avancarFase}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.enviarButtonText}>{transformText('Continuar')}</Text>
                    </TouchableOpacity>
                )}

                {/* Progresso */}
                <View style={styles.progressoContainer}>
                    <Text style={styles.progressoTexto}>
                        {transformText(`Fase ${faseAtual + 1} de ${familiasPalavras.length}`)}
                    </Text>
                </View>
            </View>

            {/* Modal de Ajuda */}
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
                                <Text style={styles.modalTextBold}>Objetivo:</Text> Forme famílias de palavras que terminam com a mesma terminação!
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
        zIndex: 5,
    },
    instrucaoContainer: {
        alignItems: 'center',
        marginBottom: 24,
    },
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
    familiaContainer: {
        marginBottom: 24,
    },
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
    palavrasNaFamilia: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
    },
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
        fontSize: 18,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontFamily: 'Lexend_700Bold',
    },
    feedbackContainer: {
        marginBottom: 20,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 16,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E0E0E0',
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
    palavrasDisponiveisContainer: {
        flex: 1,
        marginBottom: 16,
    },
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
        paddingHorizontal: 16,
        paddingVertical: 12,
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
    palavraCardSelecionada: {
        opacity: 0.5,
        borderColor: '#F78F3F',
    },
    palavraTexto: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333333',
        fontFamily: 'Lexend_700Bold',
    },
    palavraTextoSelecionada: {
        color: '#999999',
    },
    progressoContainer: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    progressoTexto: {
        fontSize: 16,
        color: '#FFFFFF',
        fontFamily: 'Lexend_600SemiBold',
    },
    resultadoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 40,
    },
    resultadoEmoji: {
        fontSize: 80,
        marginBottom: 20,
    },
    resultadoTitulo: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontFamily: 'Lexend_700Bold',
        marginBottom: 12,
    },
    resultadoTexto: {
        fontSize: 20,
        color: '#FFFFFF',
        fontFamily: 'Lexend_400Regular',
        textAlign: 'center',
        marginBottom: 24,
    },
    notaContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        paddingHorizontal: 32,
        paddingVertical: 16,
        marginBottom: 24,
    },
    notaLabel: {
        fontSize: 16,
        color: '#666666',
        fontFamily: 'Lexend_400Regular',
        textAlign: 'center',
        marginBottom: 4,
    },
    notaValor: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#F78F3F',
        fontFamily: 'Lexend_700Bold',
        textAlign: 'center',
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
    modalTitleEnvio: {
        fontSize: 24,
        fontWeight: 'bold',
        fontFamily: 'Lexend_700Bold',
        color: Colors.light.primary,
        marginBottom: 16,
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
    modalCloseButton: {
        padding: 4,
    },
    modalBody: {
        marginBottom: 24,
    },
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
});

