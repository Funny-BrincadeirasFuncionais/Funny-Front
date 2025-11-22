import { gerarRelatorioCrianca, getJson } from '@/services/api';
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
import { BarChart } from 'react-native-chart-kit';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RelatorioAlunoScreen() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const alunoId = params.alunoId ? Number(params.alunoId) : null;

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [relatorio, setRelatorio] = useState<any>(null);
    const [responsavel, setResponsavel] = useState<any>(null);

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

            {/* Conteúdo principal */}
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
            <ScrollView
                contentContainerStyle={{
                    paddingHorizontal: 24,
                    paddingBottom: 48,
                    paddingTop: 8,
                }}
                showsVerticalScrollIndicator={false}
            >
                {/* Título principal */}
                <Text style={styles.title}>Relatório de Aluno</Text>
                <Text style={styles.subtitle}>
                    Acompanhamento individual, dados e recomendações
                </Text>

                {/* RESUMO */}
                {relatorio?.resumo && (
                    <View style={styles.resumoContainer}>
                        <Text style={styles.resumoTitle}>Resumo</Text>
                        <Text style={styles.resumoText}>{relatorio.resumo}</Text>
                    </View>
                )}

                {/* Perfil do aluno */}
                <View style={styles.box}>
                    <View style={styles.rowBetween}>
                        <Text style={styles.boxTitle}>{aluno.nome}</Text>
                        <Text style={styles.tag}>{aluno.tipo}</Text>
                    </View>
                    <Text style={[styles.infoText, { marginTop: 8 }]}>
                        Idade: {aluno.idade} anos
                    </Text>
                </View>

                {/* Responsável */}
                <View style={styles.box}>
                    <Text style={styles.boxTitle}>{aluno.responsavel.nome}</Text>
                    <Text style={[styles.infoText, { marginTop: 8 }]}>
                        E-mail: {aluno.responsavel.email}
                    </Text>
                    <Text style={[styles.infoText, { marginTop: 8 }]}>
                        Telefone: {aluno.responsavel.telefone}
                    </Text>
                </View>

                {/* Indicadores */}
                <View>
                    <View style={[styles.statsRow]}>
                        <View style={styles.statBox}>
                            <Text style={styles.statValue}>{aluno.performance}</Text>
                            <Text style={styles.statLabel}>Performance Média</Text>
                        </View>
                        {aluno.tempoMedio !== null && aluno.tempoMedio !== undefined && (
                            <View style={styles.statBox}>
                                <Text style={styles.statValue}>{aluno.tempoMedio.toFixed(1)}</Text>
                                <Text style={styles.statLabel}>Tempo médio (min)</Text>
                            </View>
                        )}
                    </View>
                    <View style={[styles.statBox, { marginTop: 12 }]}>
                        <Text style={styles.statValue}>{aluno.conclusao}%</Text>
                        <Text style={styles.statLabel}>Conclusão de atividades</Text>
                    </View>
                    {aluno.tempoMedio !== null && aluno.tempoMedio !== undefined && (
                        <View style={styles.statBox}>
                            <Text style={styles.statValue}>{aluno.tempoMedio.toFixed(1)}</Text>
                            <Text style={styles.statLabel}>Tempo médio (min)</Text>
                        </View>
                    )}
                </View>

                {/* Gráfico */}
                <View style={{ marginTop: 24 }}>
                    <Text style={styles.sectionTitle}>Média por categorias</Text>
                    <BarChart
                        data={{
                            labels: aluno.categorias.map((c) => c.nome),
                            datasets: [
                                {
                                    data: aluno.categorias.map((c) => c.valor),
                                    colors: aluno.categorias.map((c) => () => c.cor),
                                },
                            ],
                        }}
                        width={screenWidth}
                        height={220}
                        yAxisLabel=""
                        yAxisSuffix=""
                        fromZero
                        withCustomBarColorFromData
                        flatColor={false}
                        showValuesOnTopOfBars
                        chartConfig={{
                            backgroundColor: '#fff',
                            backgroundGradientFrom: '#fff',
                            backgroundGradientTo: '#fff',
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(224, 118, 18, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            barPercentage: 0.5,
                        }}
                        style={{
                            borderRadius: 10,
                            marginVertical: 8,
                        }}
                    />
                </View>

                {/* Detalhamento */}
                <View style={{ marginTop: 24 }}>
                    <Text style={styles.sectionTitle}>Detalhamento por atividades</Text>

                    {/* Cabeçalho */}
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableText, styles.colAtividade, styles.bold]}>
                            Atividade
                        </Text>
                        <Text style={[styles.tableText, styles.colCategoria, styles.bold]}>
                            Categoria
                        </Text>
                        <Text style={[styles.tableText, styles.colPontuacao, styles.bold]}>
                            Pontuação
                        </Text>
                    </View>

                    {/* Linhas */}
                    {aluno.atividades.map((a, i) => (
                        <View key={i} style={styles.activityRow}>
                            <Text style={[styles.tableText, styles.colAtividade]}>{a.nome}</Text>
                            <Text style={[styles.tableText, styles.colCategoria]}>{a.categoria}</Text>
                            <Text style={[styles.tableText, styles.colPontuacao]}>{a.pontuacao}</Text>
                        </View>
                    ))}
                </View>

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
