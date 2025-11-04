import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
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

    const aluno = {
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
                <View style={[styles.statsRow]}>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{aluno.performance}</Text>
                        <Text style={styles.statLabel}>Performance Média</Text>
                    </View>
                    <View style={styles.statBox}>
                        <Text style={styles.statValue}>{aluno.conclusao}%</Text>
                        <Text style={styles.statLabel}>Conclusão de atividades</Text>
                    </View>
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
