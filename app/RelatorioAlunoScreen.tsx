import { gerarRelatorioCrianca, getJson, getProgressoCrianca } from '@/services/api';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RelatorioAlunoScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const alunoId = params.alunoId ? Number(params.alunoId) : null;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [relatorio, setRelatorio] = useState<any>(null);
    const [responsavel, setResponsavel] = useState<any>(null);
    const [activeTab, setActiveTab] = useState<'notas' | 'atividades' | 'relatorios'>('notas');
    const [progressEntries, setProgressEntries] = useState<any[]>([]);

    // Dados mockados como fallback
    const alunoMock = {
        nome: 'Ana Clara',
        idade: 6,
        tipo: 'T21',
        responsavel: {
            nome: 'Marina Souza',
            email: 'marina@gmail.com',
            telefone: '81 9 8591-8933',
        },
        performance: 72.9,
        conclusao: 90,
        tempoMedio: null as number | null,
        categorias: [
            { nome: 'Percepção', valor: 82, cor: '#7B61FF' },
            { nome: 'Cognição', valor: 74, cor: '#30C57B' },
            { nome: 'Linguagem', valor: 66, cor: '#5A6CFF' },
        ],
        atividades: [
            { nome: 'Atividade 1', categoria: 'Linguagem', pontuacao: 66 },
            { nome: 'Atividade 2', categoria: 'Cognição', pontuacao: 74 },
            { nome: 'Atividade 3', categoria: 'Percepção', pontuacao: 82 },
        ],
    };

    useEffect(() => {
        if (alunoId) {
            carregarRelatorio();
            carregarProgressos();
        }
    }, [alunoId]);

    const carregarRelatorio = async () => {
        if (!alunoId) return;

        setLoading(true);
        setError(null);

        try {
            // Buscar dados da criança e responsável primeiro
            const crianca = await getJson(`/criancas/${alunoId}`);
            
            // Buscar responsável se houver turma
            if (crianca.turma_id) {
                try {
                    const turma = await getJson(`/turmas/${crianca.turma_id}`);
                    if (turma.responsavel_id) {
                        const resp = await getJson(`/responsaveis/${turma.responsavel_id}`);
                        setResponsavel(resp);
                    }
                } catch (e) {
                    console.warn('Erro ao carregar responsável:', e);
                }
            }

            // Gerar relatório com IA
            const relatorioData = await gerarRelatorioCrianca({
                crianca_id: alunoId,
                incluir_progresso: true,
                incluir_atividades: true,
            });

            setRelatorio(relatorioData);
        } catch (e: any) {
            console.error('Erro ao carregar relatório:', e);
            setError(e.message || 'Erro ao carregar relatório');
            Alert.alert('Erro', 'Não foi possível gerar o relatório. Verifique sua conexão e tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const carregarProgressos = async () => {
        if (!alunoId) return;
        try {
            const res = await getProgressoCrianca(alunoId);
            setProgressEntries(Array.isArray(res) ? res : []);
        } catch (e) {
            console.warn('Erro ao carregar progressos da criança', e);
            setProgressEntries([]);
        }
    };

    // Mapear dados do relatório para estrutura visual
    const getAlunoData = () => {
        if (!relatorio) return alunoMock;

        // Mapear categorias da API para o formato visual
        const categoriasMap: { [key: string]: { nome: string; cor: string } } = {
            'Matemáticas': { nome: 'Cognição', cor: '#30C57B' },
            'Português': { nome: 'Linguagem', cor: '#5A6CFF' },
            'Lógica': { nome: 'Cognição', cor: '#30C57B' },
            'Cotidiano': { nome: 'Percepção', cor: '#7B61FF' },
        };

        // Usar desempenho_por_categoria
        const categoriasData = relatorio.desempenho_por_categoria || {};
        const categorias = Object.entries(categoriasData).map(([key, value]) => {
            const mapped = categoriasMap[key] || { nome: key, cor: '#7B61FF' };
            // Tentar extrair valor numérico do texto se possível, senão usar média do resumo
            // Se value for string, tentar extrair número, senão usar média geral
            let valor = relatorio.resumo_geral?.media_pontuacao || 0;
            if (typeof value === 'string' && value.match(/\d+/)) {
                // Tentar extrair número do texto
                const match = value.match(/(\d+\.?\d*)/);
                if (match) {
                    valor = parseFloat(match[1]);
                }
            } else if (typeof value === 'number') {
                valor = value;
            }
            return { nome: mapped.nome, valor: Math.round(valor * 10), cor: mapped.cor };
        });

        // Se não houver categorias, usar valores padrão baseados na média
        if (categorias.length === 0) {
            const media = relatorio.resumo_geral?.media_pontuacao || 0;
            categorias.push(
                { nome: 'Cognição', valor: Math.round(media * 10), cor: '#30C57B' },
                { nome: 'Linguagem', valor: Math.round(media * 10), cor: '#5A6CFF' },
                { nome: 'Percepção', valor: Math.round(media * 10), cor: '#7B61FF' }
            );
        }

        // Preparar atividades (usar dados do resumo se disponível)
        const atividades = relatorio.resumo_geral?.total_mini_jogos 
            ? [{ nome: 'Mini-jogos realizados', categoria: 'Geral', pontuacao: Math.round((relatorio.resumo_geral.media_pontuacao || 0) * 10) }]
            : alunoMock.atividades;

        return {
            nome: relatorio.nome_crianca || alunoMock.nome,
            idade: relatorio.idade || alunoMock.idade,
            tipo: relatorio.diagnostico || alunoMock.tipo,
            responsavel: responsavel ? {
                nome: responsavel.nome || alunoMock.responsavel.nome,
                email: responsavel.email || alunoMock.responsavel.email,
                telefone: responsavel.telefone || alunoMock.responsavel.telefone,
            } : alunoMock.responsavel,
            performance: Math.round((relatorio.resumo_geral?.media_pontuacao || 0) * 10) / 10,
            conclusao: Math.round(relatorio.resumo_geral?.taxa_sucesso || 0),
            tempoMedio: relatorio.resumo_geral?.tempo_medio_minutos ?? null,
            categorias: categorias.length > 0 ? categorias : alunoMock.categorias,
            atividades: atividades,
        };
    };

    const aluno = getAlunoData();

    const screenWidth = Dimensions.get('window').width - 48;

    // Helpers for notes tab
    const overallMean = () => {
        if (relatorio?.resumo_geral?.media_pontuacao) return Math.round(relatorio.resumo_geral.media_pontuacao * 10) / 10;
        if (progressEntries && progressEntries.length > 0) {
            const vals = progressEntries.map((p) => Number(p.pontuacao ?? 0));
            const mean = vals.reduce((s, v) => s + v, 0) / vals.length;
            return Math.round(mean * 10) / 10;
        }
        return 0;
    };

    const meanByCategory = () => {
        // Prefer relatorio.desempenho_por_categoria
        if (relatorio?.desempenho_por_categoria) {
            const raw = relatorio.desempenho_por_categoria;
            return Object.entries(raw).map(([k, v]) => {
                // Normalize numeric value from possible shapes
                let valorNum = relatorio.resumo_geral?.media_pontuacao || 0;
                if (typeof v === 'number') {
                    valorNum = Math.round(v * 10) / 10;
                } else if (typeof v === 'string') {
                    const m = String(v).match(/(\d+\.?\d*)/);
                    if (m) valorNum = Math.round(parseFloat(m[1]) * 10) / 10;
                } else if (typeof v === 'object' && v !== null) {
                    // common object shapes: { media_pontuacao: x } or { pontuacao_media: x }
                    const cand = (v as any).media_pontuacao ?? (v as any).pontuacao_media ?? (v as any).media ?? (v as any).valor ?? null;
                    if (typeof cand === 'number') valorNum = Math.round(cand * 10) / 10;
                    else if (typeof cand === 'string') {
                        const m2 = String(cand).match(/(\d+\.?\d*)/);
                        if (m2) valorNum = Math.round(parseFloat(m2[1]) * 10) / 10;
                    }
                }
                return { categoria: k, valor: valorNum };
            });
        }
        // Compute from progressEntries grouping by atividade.categoria
        const map: Record<string, { sum: number; count: number }> = {};
        progressEntries.forEach((p) => {
            const cat = p.atividade?.categoria || p.categoria || 'Geral';
            const score = Number(p.pontuacao ?? 0);
            if (!map[cat]) map[cat] = { sum: 0, count: 0 };
            map[cat].sum += score;
            map[cat].count += 1;
        });
        return Object.entries(map).map(([k, v]) => ({ categoria: k, valor: v.count ? Math.round((v.sum / v.count) * 10) / 10 : 0 }));
    };

    const activitiesCount = () => {
        if (relatorio?.resumo_geral?.total_mini_jogos) return relatorio.resumo_geral.total_mini_jogos;
        if (progressEntries && progressEntries.length > 0) return progressEntries.length;
        return 0;
    };

    const correctnessLevel = () => {
        // percent of concluidas / total
        let pct = 0;
        if (relatorio?.resumo_geral?.taxa_sucesso) pct = relatorio.resumo_geral.taxa_sucesso;
        else if (progressEntries && progressEntries.length > 0) {
            const concluidas = progressEntries.filter((p) => Boolean(p.concluida ?? p.finalizado ?? p.completed)).length;
            pct = (concluidas / progressEntries.length) * 100;
        }
        if (pct >= 80) return 'Acerta muito';
        if (pct >= 50) return 'Acerta moderadamente';
        return 'Erra muito';
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['top']}>
            {/* Cabeçalho */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Relatório</Text>
                <View style={styles.headerSpacer} />
            </View>

            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 48 }}>
                    <ActivityIndicator size="large" color="#E07612" />
                    <Text style={{ marginTop: 16, color: '#555' }}>Gerando relatório com IA...</Text>
                </View>
            ) : error ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 48 }}>
                    <Ionicons name="alert-circle" size={48} color="#E07612" />
                    <Text style={{ marginTop: 16, color: '#555', textAlign: 'center' }}>{error}</Text>
                    <TouchableOpacity
                        style={{ marginTop: 16, padding: 12, backgroundColor: '#E07612', borderRadius: 8 }}
                        onPress={carregarRelatorio}
                    >
                        <Text style={{ color: 'white', fontWeight: 'bold' }}>Tentar novamente</Text>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48, paddingTop: 8 }} showsVerticalScrollIndicator={false}>
                    <Text style={styles.title}>Relatório de Aluno</Text>
                    <Text style={styles.subtitle}>Acompanhamento individual, dados e recomendações</Text>

                    {/* TAB BAR */}
                    <View style={styles.tabBar}>
                        <TouchableOpacity onPress={() => setActiveTab('notas')} style={[styles.tabButton, activeTab === 'notas' && styles.tabActive]}>
                            <Text style={[styles.tabText, activeTab === 'notas' && styles.tabTextActive]}>Notas</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setActiveTab('atividades')} style={[styles.tabButton, activeTab === 'atividades' && styles.tabActive]}>
                            <Text style={[styles.tabText, activeTab === 'atividades' && styles.tabTextActive]}>Atividades</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setActiveTab('relatorios')} style={[styles.tabButton, activeTab === 'relatorios' && styles.tabActive]}>
                            <Text style={[styles.tabText, activeTab === 'relatorios' && styles.tabTextActive]}>Relatórios</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Perfil resumido */}
                    <View style={styles.box}>
                        <View style={styles.rowBetween}>
                            <Text style={styles.boxTitle}>{aluno.nome}</Text>
                            <Text style={styles.tag}>{aluno.tipo}</Text>
                        </View>
                        <Text style={[styles.infoText, { marginTop: 8 }]}>Idade: {aluno.idade} anos</Text>
                    </View>

                    {activeTab === 'notas' && (
                        <View>
                            <View style={styles.metricsContainer}>
                                <View style={styles.metricBox}>
                                    <Text style={styles.metricValue}>{overallMean()}</Text>
                                    <Text style={styles.metricLabel}>Média Geral</Text>
                                </View>
                                <View style={styles.metricBox}>
                                    <Text style={styles.metricValue}>{activitiesCount()}</Text>
                                    <Text style={styles.metricLabel}>Atividades realizadas</Text>
                                </View>
                                <View style={styles.metricBox}>
                                    <Text style={styles.metricValue}>{correctnessLevel()}</Text>
                                    <Text style={styles.metricLabel}>Nível de acerto/erro</Text>
                                </View>
                            </View>

                            <View style={{ marginTop: 24 }}>
                                <Text style={styles.sectionTitle}>Média por categoria</Text>
                                <View style={{ backgroundColor: '#fff', borderRadius: 10, padding: 8 }}>
                                    {(() => {
                                        const categoryMeans = meanByCategory();
                                        return categoryMeans.map((c: any, i: number) => (
                                            <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: i < categoryMeans.length - 1 ? 0.5 : 0, borderColor: '#EEE' }}>
                                                <Text style={{ fontWeight: '600' }}>{c.categoria}</Text>
                                                <Text style={{ color: '#555' }}>{String(c.valor)}</Text>
                                            </View>
                                        ));
                                    })()}
                                </View>
                            </View>
                        </View>
                    )}

                    {activeTab === 'atividades' && (
                        <View>
                            <Text style={styles.sectionTitle}>Atividades realizadas</Text>
                            <View style={{ backgroundColor: '#fff', borderRadius: 10, padding: 8 }}>
                                {progressEntries && progressEntries.length > 0 ? (
                                    progressEntries.map((p: any, idx: number) => (
                                        <View key={String(p.id ?? idx)} style={{ paddingVertical: 10, borderBottomWidth: idx < progressEntries.length - 1 ? 0.5 : 0, borderColor: '#EEE' }}>
                                            <Text style={{ fontWeight: '700' }}>{p.atividade?.titulo || p.atividade?.nome || p.titulo || p.nome_atividade || `Atividade ${p.atividade_id ?? ''}`}</Text>
                                            <Text style={{ color: '#555', marginTop: 4 }}>Nota: {p.pontuacao ?? p.score ?? '-' } • Tempo: {p.tempo_segundos ? `${p.tempo_segundos}s` : '-'}</Text>
                                            <Text style={{ color: '#777', marginTop: 4 }}>Data: {p.created_at ? new Date(p.created_at).toLocaleString() : '-'}</Text>
                                            {p.observacoes ? <Text style={{ marginTop: 6, color: '#333' }}>Observação: {p.observacoes}</Text> : null}
                                        </View>
                                    ))
                                ) : (
                                    <Text style={{ color: '#666' }}>Sem registros de atividades.</Text>
                                )}
                            </View>
                        </View>
                    )}

                    {activeTab === 'relatorios' && (
                        <View>
                            {relatorio?.resumo && (
                                <View style={styles.resumoContainer}>
                                    <Text style={styles.resumoTitle}>Resumo IA</Text>
                                    <Text style={styles.resumoText}>{relatorio.resumo}</Text>
                                </View>
                            )}

                            {/* Mostrar diagnóstico e idade */}
                            <View style={{ marginTop: 12 }}>
                                <Text style={styles.sectionTitle}>Informações da criança</Text>
                                <View style={{ backgroundColor: '#fff', borderRadius: 10, padding: 12 }}>
                                    <Text style={{ fontWeight: '600' }}>Diagnóstico: {aluno.tipo || 'Não especificado'}</Text>
                                    <Text style={{ color: '#555', marginTop: 6 }}>Idade: {aluno.idade} anos</Text>
                                </View>
                            </View>
                        </View>
                    )}

                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        backgroundColor: 'white',
    },
    backButton: { padding: 8 },
    headerTitle: {
        flex: 1,
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#000',
    },
    headerSpacer: { width: 40 },

    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 8,
        marginBottom: 8,
    },
    subtitle: { color: '#555', marginBottom: 24 },
    resumoContainer: {
        backgroundColor: '#F5F5F5',
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        borderLeftWidth: 4,
        borderLeftColor: '#E07612',
    },
    resumoTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 12,
    },
    resumoText: {
        fontSize: 14,
        color: '#333',
        lineHeight: 22,
    },

    box: {
        borderWidth: 1,
        borderColor: '#ccc',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
    },
    rowBetween: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    boxTitle: { fontWeight: 'bold', fontSize: 16 },
    infoText: { color: '#333', fontSize: 14 },
    tag: {
        backgroundColor: '#E6F6FF',
        color: '#00A3FF',
        borderRadius: 12,
        paddingVertical: 4,
        paddingHorizontal: 10,
        fontSize: 12,
        fontWeight: 'bold',
    },

    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
        flexWrap: 'wrap',
    },
    statBox: {
        flex: 1,
        borderWidth: 1,
        borderColor: '#E07612',
        borderRadius: 12,
        padding: 16,
    },
    statValue: { fontSize: 24, fontWeight: 'bold' },
    statLabel: { fontSize: 14, color: '#555', marginTop: 8 },

    sectionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 24,
    },

    metricsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    metricBox: {
        width: '48%',
        borderWidth: 1,
        borderColor: '#E07612',
        borderRadius: 12,
        paddingVertical: 16,
        paddingHorizontal: 12,
        marginBottom: 16,
    },
    metricValue: { fontSize: 20, fontWeight: 'bold', color: '#000' },
    metricLabel: { fontSize: 13, color: '#555' },

    tabBar: {
        flexDirection: 'row',
        marginTop: 8,
        marginBottom: 24,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#EEE',
    },
    tabButton: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabActive: {
        backgroundColor: '#E07612',
    },
    tabText: { color: '#666', fontWeight: '600' },
    tabTextActive: { color: '#fff' },

    tableHeader: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderColor: '#ccc',
        paddingBottom: 8,
        marginBottom: 8,
    },
    activityRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 0.5,
        borderColor: '#ccc',
        paddingVertical: 8,
    },
    tableText: {
        fontSize: 14,
        color: '#000',
    },
    bold: { fontWeight: 'bold' },

    // Colunas fixas e alinhadas
    colAtividade: { width: '35%' },
    colCategoria: { width: '35%' },
    colPontuacao: { width: '30%', textAlign: 'right' },

});
