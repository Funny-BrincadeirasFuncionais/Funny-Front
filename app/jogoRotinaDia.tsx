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
import { ensureAtividadeExists, registrarProgresso, registrarMinijogo } from '../services/api';

interface Acao {
    id: string;
    texto: string;
    emoji: string;
    ordemObrigatoria?: number; // Posição obrigatória na sequência (opcional)
}

interface RotinaPeriodo {
    nome: string;
    emoji: string;
    acoes: Acao[];
    cor: string;
    regraEspecial?: string; // Ex: "Acordar deve ser sempre o primeiro"
}

const rotinasPeriodos: RotinaPeriodo[] = [
    {
        nome: 'Manhã',
        emoji: '🌅',
        cor: '#FFD700',
        regraEspecial: 'Siga a ordem lógica: Acordar → Banho → Escovar → Café',
        acoes: [
            { id: 'acordar', texto: 'Acordar', emoji: '😴', ordemObrigatoria: 0 },
            { id: 'banho', texto: 'Tomar banho', emoji: '🚿', ordemObrigatoria: 1 },
            { id: 'vestir', texto: 'Vestir a roupa', emoji: '👕', ordemObrigatoria: 2 },
            { id: 'escovar', texto: 'Escovar os dentes', emoji: '🦷', ordemObrigatoria: 3 },
            { id: 'cafe', texto: 'Tomar café da manhã', emoji: '🥐', ordemObrigatoria: 4 },
            { id: 'mochila', texto: 'Preparar a mochila', emoji: '🎒', ordemObrigatoria: 5 },
        ]
    },
    {
        nome: 'Tarde',
        emoji: '☀️',
        cor: '#FFA500',
        regraEspecial: 'Almoçar primeiro, depois estudar e brincar',
        acoes: [
            { id: 'almoco', texto: 'Almoçar', emoji: '🍽️', ordemObrigatoria: 0 },
            { id: 'descansar', texto: 'Descansar um pouco', emoji: '😌', ordemObrigatoria: 1 },
            { id: 'estudar', texto: 'Fazer lição de casa', emoji: '📚', ordemObrigatoria: 2 },
            { id: 'brincar', texto: 'Brincar', emoji: '🎮', ordemObrigatoria: 3 },
            { id: 'exercicio', texto: 'Fazer exercícios', emoji: '⚽', ordemObrigatoria: 4 },
            { id: 'lanche', texto: 'Lanche da tarde', emoji: '🍎', ordemObrigatoria: 5 },
        ]
    },
    {
        nome: 'Noite',
        emoji: '🌙',
        cor: '#4B0082',
        regraEspecial: 'Jantar → Banho → Pijama → Escovar → Dormir',
        acoes: [
            { id: 'jantar', texto: 'Jantar', emoji: '🍝', ordemObrigatoria: 0 },
            { id: 'banho-noite', texto: 'Tomar banho', emoji: '🚿', ordemObrigatoria: 1 },
            { id: 'pijama', texto: 'Colocar pijama', emoji: '🛏️', ordemObrigatoria: 2 },
            { id: 'escovar-noite', texto: 'Escovar os dentes', emoji: '🦷', ordemObrigatoria: 3 },
            { id: 'historias', texto: 'Ler histórias', emoji: '📖', ordemObrigatoria: 4 },
            { id: 'dormir', texto: 'Dormir', emoji: '💤', ordemObrigatoria: 5 },
        ]
    }
];

interface AcaoNaSequencia {
    acao: Acao;
    posicao: number;
}

export default function JogoRotinaDia() {
    const router = useRouter();
    const { transformText } = useAccessibility();
    const [periodoAtual, setPeriodoAtual] = useState(0);
    const [sequencia, setSequencia] = useState<Acao[]>([]);
    const [acoesDisponiveis, setAcoesDisponiveis] = useState<Acao[]>([]);
    const [sequenciaValida, setSequenciaValida] = useState(false);
    const [mostrarFeedback, setMostrarFeedback] = useState(false);
    const [mensagemFeedback, setMensagemFeedback] = useState('');
    const [animacao] = useState(new Animated.Value(0));
    const [podeFinalizar, setPodeFinalizar] = useState(false);
    const [acertos, setAcertos] = useState(0);
    const [totalVerificacoes, setTotalVerificacoes] = useState(0);
    const [jogoFinalizado, setJogoFinalizado] = useState(false);
    const [notaFinal, setNotaFinal] = useState(0);
    const [criancaId, setCriancaId] = useState<string | null>(null);
    const [periodoAcertado, setPeriodoAcertado] = useState<boolean[]>([]); // Rastrear quais períodos já foram acertados
    const [mostrarAjuda, setMostrarAjuda] = useState(false);
    const [atividadeId, setAtividadeId] = useState<number | null>(null);
    const [observacao, setObservacao] = useState('');
    const [modalVisible, setModalVisible] = useState(false);

    const periodo = rotinasPeriodos[periodoAtual];

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
                'Rotina do Dia',
                'Organize as ações na sequência correta.',
                'Cotidiano',
                1
            );
            setAtividadeId(aid);
        };
        carregarDados();
    }, []);

    // register minijogo automatically when modal opens
    const [minijogoRegistered, setMinijogoRegistered] = useState(false);
    useEffect(() => {
        (async () => {
            if (modalVisible && !minijogoRegistered && criancaId !== null) {
                setMinijogoRegistered(true);
                const res = await registrarMinijogo({
                    pontuacao: Number(notaFinal),
                    categoria: 'Cotidiano',
                    crianca_id: Number(criancaId),
                    titulo: 'Rotina do Dia',
                    descricao: 'Organize as ações na sequência correta.',
                    observacoes: null,
                });
                if (res.ok) {
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
    }, [modalVisible, minijogoRegistered, criancaId]);

    useEffect(() => {
        if (periodo) {
            // Embaralhar ações disponíveis
            const embaralhadas = [...periodo.acoes].sort(() => Math.random() - 0.5);
            setAcoesDisponiveis(embaralhadas);
            setSequencia([]);
            setSequenciaValida(false);
            setMostrarFeedback(false);
            setMensagemFeedback('');
            setPodeFinalizar(false);
            animacao.setValue(0);
        }
    }, [periodoAtual, periodo, animacao]);

    const verificarSequencia = useCallback(() => {
        if (sequencia.length === 0) {
            setSequenciaValida(false);
            setPodeFinalizar(false);
            return;
        }

        if (sequencia.length < periodo.acoes.length) {
            setPodeFinalizar(false);
            return;
        }

        setTotalVerificacoes(prev => prev + 1);
        
        let pontos = 0;
        let maxPontos = 0;
        const erros: string[] = [];

        // Verificar regras obrigatórias
        periodo.acoes.forEach((acao) => {
            if (acao.ordemObrigatoria === 999) {
                // Deve estar sempre no final (dormir)
                maxPontos += 2;
                const posicaoNaSequencia = sequencia.findIndex(s => s.id === acao.id);
                if (posicaoNaSequencia === -1) {
                    erros.push(`${acao.texto} não está na sequência`);
                } else if (posicaoNaSequencia !== sequencia.length - 1) {
                    erros.push(`${acao.texto} deve ser a última ação`);
                } else {
                    pontos += 2;
                }
            } else if (acao.ordemObrigatoria !== undefined && acao.ordemObrigatoria >= 0) {
                // Verificar se está na posição correta obrigatória
                maxPontos += 2; // Regras obrigatórias valem mais pontos
                const posicaoNaSequencia = sequencia.findIndex(s => s.id === acao.id);
                
                if (posicaoNaSequencia === -1) {
                    erros.push(`${acao.texto} não está na sequência`);
                } else if (posicaoNaSequencia !== acao.ordemObrigatoria) {
                    erros.push(`${acao.texto} deve estar na ${acao.ordemObrigatoria + 1}ª posição`);
                } else {
                    pontos += 2;
                }
            } else if (acao.ordemObrigatoria === -1) {
                // Deve estar antes de dormir (escovar dentes na noite)
                maxPontos += 2;
                const posicaoNaSequencia = sequencia.findIndex(s => s.id === acao.id);
                const dormirIndex = sequencia.findIndex(s => s.id === 'dormir');
                if (posicaoNaSequencia === -1) {
                    erros.push(`${acao.texto} não está na sequência`);
                } else if (dormirIndex !== -1 && posicaoNaSequencia >= dormirIndex) {
                    erros.push(`${acao.texto} deve ser antes de dormir`);
                } else {
                    pontos += 2;
                }
            } else {
                // Ações opcionais - dar ponto se estiver presente
                maxPontos += 1;
                const posicaoNaSequencia = sequencia.findIndex(s => s.id === acao.id);
                if (posicaoNaSequencia !== -1) {
                    pontos += 1;
                }
            }
        });

        // Verificar ordem lógica adicional - todas as ações devem estar na ordem correta
        // Ações sem ordemObrigatoria definida não existem mais, mas mantemos a verificação
        // para garantir que todas as ações obrigatórias estão na posição certa

        const percentual = (pontos / maxPontos) * 100;
        
        if (erros.length === 0 && sequencia.length === periodo.acoes.length) {
            setSequenciaValida(true);
            setPodeFinalizar(true);
            
            // Evitar incrementar acertos múltiplas vezes para o mesmo período
            const jaAcertouEstePeriodo = periodoAcertado[periodoAtual] === true;
            if (!jaAcertouEstePeriodo) {
                setAcertos(prev => prev + 1);
                setPeriodoAcertado(prev => {
                    const novo = [...prev];
                    novo[periodoAtual] = true;
                    return novo;
                });
                mostrarMensagemFeedback(true, `Perfeito! Sequência completa! 🌟`);
            } else {
                // Já foi acertado, só mostrar feedback
                mostrarMensagemFeedback(true, `Perfeito! Sequência completa! 🌟`);
            }
        } else if (erros.length === 0) {
            setSequenciaValida(true);
            setPodeFinalizar(sequencia.length === periodo.acoes.length);
            mostrarMensagemFeedback(true, `Ótimo progresso! Continue! 💪`);
        } else {
            setSequenciaValida(false);
            setPodeFinalizar(false);
            const mensagem = erros.length > 0 
                ? erros[0] // Mostrar apenas o primeiro erro para não confundir
                : 'Ajuste algumas ações na sequência 😊';
            mostrarMensagemFeedback(false, mensagem);
        }
    }, [sequencia, periodo, periodoAtual, periodoAcertado]);

    useEffect(() => {
        if (sequencia.length > 0) {
            verificarSequencia();
        }
    }, [sequencia, verificarSequencia]);

    const mostrarMensagemFeedback = useCallback((correto: boolean, mensagem: string) => {
        setMensagemFeedback(mensagem);
        setMostrarFeedback(true);
        
        Animated.sequence([
            Animated.timing(animacao, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }),
            Animated.delay(2000),
            Animated.timing(animacao, {
                toValue: 0,
                duration: 300,
                useNativeDriver: true,
            }),
        ]).start(() => {
            if (correto && sequencia.length === periodo.acoes.length) {
                setTimeout(() => {
                    setMostrarFeedback(false);
                }, 500);
            }
        });
    }, [animacao, sequencia.length, periodo.acoes.length]);

    const adicionarAcao = (acao: Acao) => {
        if (sequencia.find(s => s.id === acao.id)) {
            return; // Ação já está na sequência
        }
        
        setSequencia(prev => [...prev, acao]);
    };

    const removerAcao = (index: number) => {
        setSequencia(prev => {
            const nova = [...prev];
            nova.splice(index, 1);
            return nova;
        });
    };


    const avancarPeriodo = () => {
        if (periodoAtual < rotinasPeriodos.length - 1) {
            setPeriodoAtual(prev => prev + 1);
        } else {
            finalizarJogo();
        }
    };

    const calcularNotaFinal = () => {
        const totalPeriodos = rotinasPeriodos.length;
        const percentualAcertos = (acertos / totalPeriodos) * 100;
        
        // Penalizar tentativas extras de forma mais rigorosa
        // Cada tentativa extra reduz mais a nota
        const tentativasExtras = totalVerificacoes - totalPeriodos;
        const penalidadeTentativas = Math.min(tentativasExtras * 0.8, 4); // Máximo de 4 pontos de penalidade
        
        // Calcular nota baseada no percentual de acertos
        // Nota começa do percentual de acertos, depois subtrai penalidades
        let nota = (percentualAcertos / 10) - (penalidadeTentativas / 10);
        
        // Se não acertou todos os períodos, reduzir nota adicionalmente
        if (acertos < totalPeriodos) {
            const periodosErrados = totalPeriodos - acertos;
            nota -= periodosErrados * 0.5; // Cada período errado reduz 0.5 pontos
        }
        
        nota = Math.max(0, Math.min(10, nota));
        
        return Math.round(nota * 10) / 10;
    };

    const finalizarJogo = () => {
        const nota = calcularNotaFinal();
        setNotaFinal(nota);
        setJogoFinalizado(true);
        setModalVisible(true);
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
                observacoes: (observacao || `Completou ${acertos} de ${rotinasPeriodos.length} períodos corretamente.`),
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

    if (jogoFinalizado) {
        return (
            <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
                <StatusBar barStyle="light-content" backgroundColor="#F78F3F" />
                
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

                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.headerButton}>
                        <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
                    </TouchableOpacity>
            <Text style={styles.headerTitle}>Jogo Finalizado!</Text>
                </View>

                <View style={styles.content}>
                    <View style={styles.resultadoContainer}>
                        <Text style={styles.resultadoEmoji}>🎉</Text>
                        <Text style={styles.resultadoTitulo}>Parabéns!</Text>
                        <Text style={styles.resultadoTexto}>
                            Você organizou {acertos} de {rotinasPeriodos.length} períodos do dia!
                        </Text>
                        <View style={styles.notaContainer}>
                            <Text style={styles.notaLabel}>Sua nota:</Text>
                            <Text style={styles.notaValor}>{notaFinal.toFixed(1)} / 10</Text>
                        </View>
                        
                        <TouchableOpacity
                            style={styles.enviarButton}
                            onPress={() => setModalVisible(true)}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.enviarButtonText}>Enviar Resultado</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                            style={styles.voltarButton}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.voltarButtonText}>Voltar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {/* Modal de envio */}
                <Modal visible={modalVisible} animationType="slide" transparent>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalBox}>
                            <Text style={styles.modalTitleEnvio}>{transformText('🎉 Parabéns!')}</Text>
                            <Text style={styles.modalTextEnvio}>
                              {transformText('Você completou a rotina!')}
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
        );
    }

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
                <Text style={styles.headerTitle}>A Rotina do Dia</Text>
                <TouchableOpacity 
                    style={styles.headerButton}
                    onPress={() => setMostrarAjuda(true)}
                >
                    <View style={styles.helpButton}>
                        <Text style={styles.helpButtonText}>?</Text>
                    </View>
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} contentContainerStyle={styles.contentInner}>
                {/* Período Atual */}
                <View style={[styles.periodoContainer, { backgroundColor: periodo.cor }]}>
                    <Text style={styles.periodoEmoji}>{periodo.emoji}</Text>
                    <Text style={styles.periodoNome}>Período: {periodo.nome}</Text>
                    {periodo.regraEspecial && (
                        <Text style={styles.regraEspecial}>{periodo.regraEspecial}</Text>
                    )}
                </View>

                {/* Instrução */}
                <Text style={styles.instrucao}>
                    Organize as ações na sequência correta arrastando-as para a linha do tempo!
                </Text>

                {/* Linha do Tempo (Sequência) */}
                <View style={styles.sequenciaContainer}>
                    <Text style={styles.sequenciaLabel}>Sua Rotina:</Text>
                    <View style={styles.sequenciaArea}>
                        {sequencia.length === 0 ? (
                            <Text style={styles.sequenciaVazia}>
                                Toque nas ações para organizar sua rotina
                            </Text>
                        ) : (
                            <View style={styles.sequenciaLista}>
                                {sequencia.map((acao, index) => (
                                    <View key={`${acao.id}-${index}`} style={styles.sequenciaItem}>
                                        <View style={styles.numeroSequencia}>
                                            <Text style={styles.numeroTexto}>{index + 1}</Text>
                                        </View>
                                        <View style={[styles.acaoCard, { borderLeftColor: periodo.cor }]}>
                                            <Text style={styles.acaoEmoji}>{acao.emoji}</Text>
                                            <Text style={styles.acaoTexto}>{acao.texto}</Text>
                                        </View>
                                        <TouchableOpacity
                                            style={styles.removerButton}
                                            onPress={() => removerAcao(index)}
                                            activeOpacity={0.7}
                                        >
                                            <Ionicons name="close-circle" size={24} color="#FF5722" />
                                        </TouchableOpacity>
                                    </View>
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
                                sequenciaValida ? styles.feedbackCorreto : styles.feedbackIncorreto,
                            ]}
                        >
                            {mensagemFeedback}
                        </Text>
                    </Animated.View>
                )}

                {/* Ações Disponíveis */}
                <View style={styles.acoesDisponiveisContainer}>
                    <Text style={styles.acoesLabel}>Ações Disponíveis:</Text>
                    <View style={styles.acoesGrid}>
                        {acoesDisponiveis.map((acao) => {
                            const jaNaSequencia = sequencia.find(s => s.id === acao.id);
                            return (
                                <TouchableOpacity
                                    key={acao.id}
                                    style={[
                                        styles.acaoDisponivelCard,
                                        jaNaSequencia && styles.acaoDisponivelCardUsada,
                                    ]}
                                    onPress={() => !jaNaSequencia && adicionarAcao(acao)}
                                    disabled={!!jaNaSequencia}
                                    activeOpacity={0.7}
                                >
                                    <Text style={styles.acaoDisponivelEmoji}>{acao.emoji}</Text>
                                    <Text style={[
                                        styles.acaoDisponivelTexto,
                                        jaNaSequencia && styles.acaoDisponivelTextoUsada
                                    ]}>
                                        {acao.texto}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* Botão Continuar */}
                {podeFinalizar && (
                    <TouchableOpacity
                        style={styles.continuarButton}
                        onPress={avancarPeriodo}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.continuarButtonText}>Continuar para Próximo Período</Text>
                    </TouchableOpacity>
                )}

                {/* Progresso */}
                <View style={styles.progressoContainer}>
                    <Text style={styles.progressoTexto}>
                        Período {periodoAtual + 1} de {rotinasPeriodos.length}
                    </Text>
                </View>
            </ScrollView>

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
                                <Text style={styles.modalTextBold}>Objetivo:</Text> Organize as ações do dia na sequência correta!
                            </Text>
                            
                            <Text style={styles.modalText}>
                                <Text style={styles.modalTextBold}>Como jogar:</Text>
                            </Text>
                            
                            <Text style={styles.modalText}>
                                • Você verá ações de um período do dia (Manhã, Tarde ou Noite)
                            </Text>
                            <Text style={styles.modalText}>
                                • Toque nas ações disponíveis para organizá-las na sequência
                            </Text>
                            <Text style={styles.modalText}>
                                • As ações aparecerão na linha do tempo numerada
                            </Text>
                            <Text style={styles.modalText}>
                                • Você pode remover ações clicando no X
                            </Text>
                            <Text style={styles.modalText}>
                                • Organize todas as ações na ordem correta para avançar!
                            </Text>
                            <Text style={styles.modalText}>
                                • Cada período tem regras especiais mostradas na tela
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
        zIndex: 5,
    },
    contentInner: {
        paddingHorizontal: 24,
        paddingTop: 20,
        paddingBottom: 24,
    },
    periodoContainer: {
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 20,
        borderRadius: 16,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 6,
    },
    periodoEmoji: {
        fontSize: 48,
        marginBottom: 8,
    },
    periodoNome: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontFamily: 'Lexend_700Bold',
        marginBottom: 4,
    },
    regraEspecial: {
        fontSize: 14,
        color: '#FFFFFF',
        fontFamily: 'Lexend_600SemiBold',
        textAlign: 'center',
        marginTop: 4,
    },
    instrucao: {
        fontSize: 16,
        color: '#FFFFFF',
        fontFamily: 'Lexend_400Regular',
        textAlign: 'center',
        marginBottom: 20,
    },
    sequenciaContainer: {
        marginBottom: 20,
    },
    sequenciaLabel: {
        fontSize: 18,
        color: '#FFFFFF',
        fontFamily: 'Lexend_600SemiBold',
        marginBottom: 12,
    },
    sequenciaArea: {
        minHeight: 150,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        borderWidth: 2,
        borderStyle: 'dashed',
        borderColor: '#E0E0E0',
    },
    sequenciaVazia: {
        fontSize: 16,
        color: '#999999',
        fontFamily: 'Lexend_400Regular',
        fontStyle: 'italic',
        textAlign: 'center',
        paddingVertical: 40,
    },
    sequenciaLista: {
        gap: 12,
    },
    sequenciaItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    numeroSequencia: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F78F3F',
        justifyContent: 'center',
        alignItems: 'center',
    },
    numeroTexto: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#FFFFFF',
        fontFamily: 'Lexend_700Bold',
    },
    acaoCard: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 12,
        borderLeftWidth: 4,
    },
    acaoEmoji: {
        fontSize: 24,
        marginRight: 12,
    },
    acaoTexto: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333333',
        fontFamily: 'Lexend_600SemiBold',
        flex: 1,
    },
    removerButton: {
        padding: 4,
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
    acoesDisponiveisContainer: {
        marginBottom: 16,
    },
    acoesLabel: {
        fontSize: 18,
        color: '#FFFFFF',
        fontFamily: 'Lexend_600SemiBold',
        marginBottom: 12,
    },
    acoesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
    },
    acaoDisponivelCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 14,
        margin: 4,
        alignItems: 'center',
        minWidth: 100,
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
    acaoDisponivelCardUsada: {
        opacity: 0.4,
        borderColor: '#999999',
    },
    acaoDisponivelEmoji: {
        fontSize: 32,
        marginBottom: 6,
    },
    acaoDisponivelTexto: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333333',
        fontFamily: 'Lexend_600SemiBold',
        textAlign: 'center',
    },
    acaoDisponivelTextoUsada: {
        color: '#999999',
    },
    continuarButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 18,
        paddingVertical: 18,
        paddingHorizontal: 32,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 6,
    },
    continuarButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#F78F3F',
        textAlign: 'center',
        fontFamily: 'Lexend_700Bold',
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

