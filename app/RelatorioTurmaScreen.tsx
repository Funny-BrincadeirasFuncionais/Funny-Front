import { gerarRelatorioTurma, getJson } from '@/services/api';
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

export default function RelatorioTurmaScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const turmaId = params.turmaId ? Number(params.turmaId) : null;
  const screenWidth = Dimensions.get('window').width - 48;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [relatorio, setRelatorio] = useState<any>(null);
  const [turmaNome, setTurmaNome] = useState<string>('Turma');
  const [criancas, setCriancas] = useState<any[]>([]);

  // Dados mockados como fallback
  const turmaMock = {
    nome: 'Turma 2',
    totalCriancas: 5,
    performanceMedia: 72.9,
    taxaConclusao: 82,
    atividadesCadastradas: 5,
    diagnosticos: [
      { name: 'TEA', count: 5, color: '#FF9BDB' },
      { name: 'TDAH', count: 2, color: '#B49EFF' },
      { name: 'T21', count: 2, color: '#9CE7FF' },
    ],
    atividades: [
      { nome: 'Atividade 1', categoria: 'Matemática', execucoes: 2 },
      { nome: 'Atividade 2', categoria: 'Português', execucoes: 2 },
      { nome: 'Atividade 3', categoria: 'Lógica', execucoes: 2 },
      { nome: 'Atividade 4', categoria: 'Cotidiano', execucoes: 2 },
    ],
    criancas: [
      { nome: 'Leilá Barbosa', idade: 10, diagnostico: 'TEA', tagBg: '#FFEAF6', tagColor: '#C63CCF' },
      { nome: 'Bruno Escuro', idade: 8, diagnostico: 'TDAH', tagBg: '#F0EAFE', tagColor: '#6A0DAD' },
      { nome: 'Ana Clara', idade: 6, diagnostico: 'T21', tagBg: '#E6F6FF', tagColor: '#00A3FF' },
    ],
  };

  useEffect(() => {
    carregarRelatorio();
  }, []);

  const carregarRelatorio = async () => {
    setLoading(true);
    setError(null);

    try {
      // Buscar nome da turma se turmaId fornecido
      if (turmaId) {
        try {
          const turmaData = await getJson(`/turmas/${turmaId}`);
          setTurmaNome(turmaData.nome || 'Turma');
          
          // Buscar crianças da turma
          const todasCriancas = await getJson('/criancas');
          const criancasTurma = Array.isArray(todasCriancas)
            ? todasCriancas.filter((c: any) => Number(c.turma_id) === Number(turmaId))
            : [];
          setCriancas(criancasTurma);
        } catch (e) {
          console.warn('Erro ao carregar dados da turma:', e);
        }
      }

      // Gerar relatório com IA
      const relatorioData = await gerarRelatorioTurma({
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
  const getTurmaData = () => {
    if (!relatorio) return turmaMock;

    // Mapear distribuição de diagnósticos
    const diagnosticos = Object.entries(relatorio.distribuicao_diagnosticos || {}).map(([name, count], index) => {
      const colors = ['#FF9BDB', '#B49EFF', '#9CE7FF', '#FFD93D', '#6BCB77'];
      return {
        name,
        count: Number(count),
        color: colors[index % colors.length],
      };
    });

    // Mapear atividades mais efetivas
    const atividades = (relatorio.atividades_mais_efetivas || []).slice(0, 4).map((a: any) => ({
      nome: a.titulo || 'Atividade',
      categoria: a.categoria || 'Geral',
      execucoes: Math.round(a.media_pontuacao || 0),
    }));

    // Mapear crianças se disponível
    // Nota: A API retorna apenas diagnostico_id, não o objeto diagnóstico completo
    // Por enquanto, usamos um placeholder. Para obter o nome do diagnóstico,
    // seria necessário buscar separadamente ou modificar o backend para incluir no response
    const criancasMapeadas = criancas.length > 0
      ? criancas.map((c: any) => {
          // Se o backend retornar o objeto diagnostico (via relacionamento), usar
          // Caso contrário, usar placeholder baseado no ID ou 'Não especificado'
          const diagNome = c.diagnostico?.tipo || (c.diagnostico_id ? `Diagnóstico #${c.diagnostico_id}` : 'Não especificado');
          const tagColors: { [key: string]: { bg: string; text: string } } = {
            'TEA': { bg: '#FFEAF6', text: '#C63CCF' },
            'TDAH': { bg: '#F0EAFE', text: '#6A0DAD' },
            'T21': { bg: '#E6F6FF', text: '#00A3FF' },
          };
          // Tentar extrair o nome do diagnóstico se estiver no formato "Diagnóstico #ID"
          const diagKey = diagNome.replace(/Diagnóstico #\d+/, '').trim() || diagNome;
          const colors = tagColors[diagKey] || { bg: '#E0E0E0', text: '#555' };
          return {
            nome: c.nome,
            idade: c.idade,
            diagnostico: diagNome,
            tagBg: colors.bg,
            tagColor: colors.text,
          };
        })
      : turmaMock.criancas;

    return {
      nome: turmaNome,
      totalCriancas: relatorio.total_criancas || turmaMock.totalCriancas,
      performanceMedia: Math.round((relatorio.performance_media?.pontuacao_media || 0) * 10) / 10,
      taxaConclusao: Math.round(relatorio.performance_media?.taxa_conclusao || 0),
      atividadesCadastradas: relatorio.resumo_geral_turma?.total_atividades || turmaMock.atividadesCadastradas,
      diagnosticos: diagnosticos.length > 0 ? diagnosticos : turmaMock.diagnosticos,
      atividades: atividades.length > 0 ? atividades : turmaMock.atividades,
      criancas: criancasMapeadas,
    };
  };

  const turma = getTurmaData();
  const totalDiagnosticos = turma.diagnosticos.reduce((acc, d) => acc + d.count, 0);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['top']}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{turma.nome}</Text>
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
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Relatório da Turma</Text>
        <Text style={styles.subtitle}>Visão geral de dados agregados (todas as crianças)</Text>

        {/* MÉTRICAS */}
        <View style={styles.metricsContainer}>
          {[
            { value: turma.totalCriancas, label: 'Total de Crianças' },
            { value: turma.performanceMedia, label: 'Performance Média' },
            { value: `${turma.taxaConclusao}%`, label: 'Taxa de conclusão' },
            { value: turma.atividadesCadastradas, label: 'Atividades Cadastradas' },
          ].map((m, i) => (
            <View key={i} style={styles.metricBox}>
              <Text style={styles.metricValue}>{m.value}</Text>
              <Text style={styles.metricLabel}>{m.label}</Text>
            </View>
          ))}
        </View>

        {/* Gráfico */}
        <View style={{ marginTop: 16 }}>
          <Text style={styles.sectionTitle}>Distribuição de Diagnósticos</Text>
          <BarChart
            data={{
              labels: turma.diagnosticos.map((d) => d.name),
              datasets: [
                {
                  data: turma.diagnosticos.map((d) => d.count),
                  colors: turma.diagnosticos.map((d) => () => d.color),
                },
              ],
            }}
            width={screenWidth}
            height={220}
            fromZero
            yAxisLabel=""
            yAxisSuffix=""
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

          {/* Total */}
          <Text style={[styles.chartCenterText, { marginTop: 12 }]}>{totalDiagnosticos}</Text>
          <Text style={[styles.chartSubtext, { marginTop: 4, marginBottom: 6 }]}>Contagens</Text>

          {/* Legenda */}
          <View style={styles.legendRowContainer}>
            {turma.diagnosticos.map((d, i) => (
              <View key={i} style={styles.legendRow}>
                <View style={[styles.legendDot, { backgroundColor: d.color }]} />
                <Text style={styles.legendText}>{d.name}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* ATIVIDADES MAIS REALIZADAS */}
        <View style={{ marginTop: 32 }}>
          <Text style={styles.sectionTitle}>Atividades mais realizadas</Text>

          <View style={styles.tableHeader}>
            <Text style={[styles.tableText, { flex: 1, fontWeight: 'bold' }]}>Atividade</Text>
            <Text style={[styles.tableText, { flex: 1, fontWeight: 'bold', textAlign: 'center' }]}>Categoria</Text>
            <Text style={[styles.tableText, { width: 80, fontWeight: 'bold', textAlign: 'right' }]}>Execuções</Text>
          </View>

          {turma.atividades.map((a, i) => (
            <View key={i} style={styles.activityRow}>
              <Text style={[styles.tableText, { flex: 1 }]}>{a.nome}</Text>
              <Text style={[styles.tableText, { flex: 1, textAlign: 'center' }]}>{a.categoria}</Text>
              <Text style={[styles.tableText, { width: 80, textAlign: 'right' }]}>{a.execucoes}</Text>
            </View>
          ))}
        </View>

        {/* LISTA DE CRIANÇAS */}
        <View style={{ marginTop: 32 }}>
          <Text style={styles.sectionTitle}>Lista de Crianças</Text>

          {turma.criancas.map((c, i) => (
            <View key={i} style={styles.childRow}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{c.nome.split(' ').map(n => n[0]).join('').slice(0, 2)}</Text>
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.childName}>{c.nome}</Text>
                <Text style={styles.childInfo}>Idade: {c.idade} anos</Text>
              </View>

              <View style={[styles.tag, { backgroundColor: c.tagBg }]}>
                <Text style={[styles.tagText, { color: c.tagColor }]}>{c.diagnostico}</Text>
              </View>
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
    paddingVertical: 15,
    backgroundColor: 'white',
  },
  backButton: { padding: 8 },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#000' },
  headerSpacer: { width: 40 },

  title: { fontSize: 16, fontWeight: 'bold', marginTop: 24 },
  subtitle: { color: '#555', marginTop: 4, marginBottom: 24 },

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

  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 20 },

  chartCenterText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  chartSubtext: {
    fontSize: 12,
    color: '#555',
    textAlign: 'center',
  },

  legendRowContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 16,
    marginTop: 16,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
  },
  legendText: {
    fontSize: 13,
    color: '#000',
    fontWeight: '500',
  },

  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#ccc',
    paddingBottom: 8,
    marginBottom: 8,
  },
  tableText: { fontSize: 14, color: '#000' },
  activityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderColor: '#ccc',
  },

  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 0.5,
    borderColor: '#E0E0E0',
    paddingVertical: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#EEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { fontWeight: 'bold', color: '#555' },
  childName: { fontWeight: 'bold', fontSize: 14 },
  childInfo: { color: '#555', fontSize: 13 },

  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: { fontSize: 12, fontWeight: 'bold' },
});