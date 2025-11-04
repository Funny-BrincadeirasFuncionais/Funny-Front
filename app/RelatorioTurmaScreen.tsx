import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';

export default function RelatorioTurmaScreen() {
  const router = useRouter();
  const screenWidth = Dimensions.get('window').width - 48;

  const turma = {
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