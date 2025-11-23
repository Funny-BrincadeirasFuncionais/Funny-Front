import { gerarRelatorioTurma, getJson, getProgressoTurma } from '@/services/api';
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
  Pressable,
  FlatList,
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
  const [activeTab, setActiveTab] = useState<'notas' | 'atividades' | 'ranking' | 'relatorios'>('notas');
  const [fetchedProgressEntries, setFetchedProgressEntries] = useState<any[] | null>(null);
  const [progressFetching, setProgressFetching] = useState<boolean>(false);
  

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
          // store local variable for later use
          var _criancasTurma = criancasTurma;
        } catch (e) {
          console.warn('Erro ao carregar dados da turma:', e);
        }
      }

      // Gerar relatório com IA - passar turma_id se disponível
      const relatorioData = await gerarRelatorioTurma({
        turma_id: turmaId || undefined,
        incluir_progresso: true,
        incluir_atividades: true,
      });

      setRelatorio(relatorioData);
      try {
        // If relatorio doesn't provide raw progress arrays, fetch per-child progress
        const hasProgressArray = Array.isArray(relatorioData.progressos) || Array.isArray(relatorioData.progresso) || Array.isArray(relatorioData.registros) || Array.isArray(relatorioData.atividades_executadas) || Array.isArray(relatorioData.progresso_list);
        if (!hasProgressArray && turmaId) {
          // use _criancasTurma if available, otherwise use state
          const childrenToFetch = typeof _criancasTurma !== 'undefined' ? _criancasTurma : (Array.isArray(criancas) ? criancas : []);
          if (childrenToFetch && childrenToFetch.length > 0) {
            fetchProgressForChildren(childrenToFetch);
          }
        }
      } catch (e) {}
      // If IA report doesn't include per-play progress entries, try fetching per-child progresso
      try {
        if ((!relatorioData.progressos && !relatorioData.progresso && !relatorioData.registros && !relatorioData.atividades_executadas) && turmaId) {
          // fetch children progress later after criancas state set
          // we'll trigger fetchProgressForChildren below
        }
      } catch (e) {}
      try {
        console.log('📦 relatorio (raw):', relatorioData);
      } catch (e) {}
    } catch (e: any) {
      console.error('Erro ao carregar relatório:', e);
      setError(e.message || 'Erro ao carregar relatório');
      Alert.alert('Erro', 'Não foi possível gerar o relatório. Verifique sua conexão e tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch per-child progress from the API when IA report lacks raw progress entries
  const fetchProgressForChildren = async (children: any[]) => {
    if (!children || children.length === 0) return;
    setProgressFetching(true);
    try {
      // Prefer server-side turma endpoint when available to avoid N requests
      if (turmaId) {
        try {
          const turmaProgress = await getProgressoTurma(turmaId);
          setFetchedProgressEntries(Array.isArray(turmaProgress) ? turmaProgress : []);
          console.log('🔎 fetchedProgressEntries (turma) count', (turmaProgress || []).length);
          return;
        } catch (e) {
          console.warn('getProgressoTurma failed, falling back to per-child fetch', e);
          // fallthrough to per-child fetch
        }
      }

      const all = await Promise.all(children.map(async (c: any) => {
        try {
          const res = await getJson(`/progresso/crianca/${c.id}`);
          return Array.isArray(res) ? res : [];
        } catch (e) {
          return [];
        }
      }));
      // flatten
      const flattened = all.flat();
      setFetchedProgressEntries(flattened);
      console.log('🔎 fetchedProgressEntries count', flattened.length);
    } catch (e) {
      console.warn('Erro fetchProgressForChildren', e);
      setFetchedProgressEntries([]);
    }
    finally {
      setProgressFetching(false);
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
      tempoMedio: relatorio.performance_media?.tempo_medio_minutos || null,
      atividadesCadastradas: relatorio.resumo_geral_turma?.total_atividades || turmaMock.atividadesCadastradas,
      diagnosticos: diagnosticos.length > 0 ? diagnosticos : turmaMock.diagnosticos,
      atividades: atividades.length > 0 ? atividades : turmaMock.atividades,
      criancas: criancasMapeadas,
    };
  };

  const turma = getTurmaData();
  const totalDiagnosticos = turma.diagnosticos.reduce((acc, d) => acc + d.count, 0);

  // Helpers: compute ranking and statistics
  // Normalize progress entries from possible fields in the AI report
  const getProgressEntries = (): any[] => {
    // Prefer fetched per-child entries if available
    if (Array.isArray(fetchedProgressEntries) && fetchedProgressEntries.length > 0) return fetchedProgressEntries;

    const candidates = [
      relatorio?.progressos,
      relatorio?.progresso,
      relatorio?.registros,
      relatorio?.atividades_executadas,
      relatorio?.progresso_list,
      relatorio?.atividades || null,
      relatorio?.atividades_mais_efetivas || null,
    ];
    for (const c of candidates) {
      if (Array.isArray(c) && c.length > 0) return c;
    }
    // If relatorio doesn't include progress, try to use relatorio.criancas entries that may include per-child scores
    if (Array.isArray(relatorio?.criancas) && relatorio.criancas.length > 0) {
      // If entries include pontuacao or atividades, convert to pseudo-progress
      const synthetic: any[] = [];
      relatorio.criancas.forEach((cr: any) => {
        if (cr.atividades && Array.isArray(cr.atividades)) {
          cr.atividades.forEach((a: any) => synthetic.push({ crianca_id: cr.id ?? cr.crianca_id, atividade: a.titulo || a.nome, pontuacao: a.pontuacao ?? a.pontuacao_media ?? a.media_pontuacao, concluida: a.concluida ?? true }));
        }
      });
      if (synthetic.length > 0) return synthetic;
    }
    return [];
  };

  const progressEntries = getProgressEntries();

  // Helper to normalize activity title values to safe strings
  const getActivityTitle = (t: any) => {
    if (t === null || t === undefined) return 'Atividade';
    if (typeof t === 'string') return t;
    if (typeof t === 'number') return String(t);
    if (typeof t === 'object') {
      // common shapes: { titulo: '...', nome: '...' } or nested
      if (typeof t.titulo === 'string') return t.titulo;
      if (typeof t.nome === 'string') return t.nome;
      if (t.id) return `Atividade ${t.id}`;
      try { return JSON.stringify(t); } catch (e) { return 'Atividade'; }
    }
    return String(t);
  };

  const findChildName = (id: any) => {
    if (!id) return null;
    const found = criancas.find((c: any) => Number(c.id) === Number(id) || String(c.id) === String(id));
    if (found) return found.nome || found.full_name || String(found.id);
    // try relatorio.creancas
    const found2 = (relatorio?.criancas || []).find((c: any) => Number(c.id) === Number(id) || String(c.id) === String(id));
    if (found2) return found2.nome || found2.full_name || String(found2.id);
    return null;
  };

  const computePerChildTotals = () => {
    const map: Record<string, { id: any; nome: string; total: number; count: number }> = {};
    // Prefer local `criancas` state when available, otherwise fall back to IA-provided list
    const sourceCriancas = (Array.isArray(criancas) && criancas.length > 0) ? criancas : (relatorio?.criancas || []);
    sourceCriancas.forEach((c: any) => {
      const id = c.id ?? c.crianca_id ?? null;
      const key = id ? String(id) : (c.nome ? String(c.nome) : null);
      if (key) {
        map[key] = { id: id ?? key, nome: c.nome || c.full_name || `Aluno ${id ?? key}`, total: Number(c.pontuacao ?? 0), count: 0 };
      } else if (c.nome) {
        map[String(c.nome)] = { id: String(c.nome), nome: c.nome, total: Number(c.pontuacao ?? 0), count: 0 };
      }
    });

    // Aggregate from progress entries
    progressEntries.forEach((p: any) => {
      const cid = p.crianca_id ?? p.responsavel_id ?? p.crianca?.id ?? p.player_id ?? p.user_id ?? p.id_crianca ?? p.owner_id ?? null;
      const nomeFromEntry = p.crianca_nome || p.nome || p.usuario_nome || p.user_name || null;
      const key = cid ? String(cid) : (nomeFromEntry ? String(nomeFromEntry) : (p.crianca && p.crianca.nome ? String(p.crianca.nome) : null));
      const score = Number(p.pontuacao ?? p.score ?? p.nota ?? p.pontos ?? p.media_pontuacao ?? 0) || 0;
      if (!key) return; // cannot map this entry
      if (!map[key]) {
        const foundName = findChildName(cid) || nomeFromEntry || (cid ? String(cid) : `Aluno`);
        map[key] = { id: cid ?? key, nome: foundName, total: 0, count: 0 };
      }
      map[key].total += score;
      map[key].count += 1;
    });

    return Object.values(map).map((v) => ({ id: v.id, nome: v.nome, total: v.total, count: v.count }));
  };

  const perChildTotals = computePerChildTotals();

  // Derived class-level metrics using local data when available
  const derivedTotalCriancas = (Array.isArray(criancas) && criancas.length > 0) ? criancas.length : (relatorio?.total_criancas || turmaMock.totalCriancas);
  const childrenWithProgress = perChildTotals.filter((c: any) => (c.count && c.count > 0) || (c.total && c.total > 0)).length;
  const derivedTaxaConclusao = derivedTotalCriancas > 0 ? Math.round((childrenWithProgress / derivedTotalCriancas) * 100) : Math.round(relatorio?.performance_media?.taxa_conclusao || turma.taxaConclusao || 0);

  // Debug placeholder (moved below after activitiesStats computed)

  const computeRanking = () => {
    const list = perChildTotals.map((c: any) => ({ nome: c.nome, id: c.id, pontuacao: Number(c.total || 0) }));
    return list.sort((a: any, b: any) => b.pontuacao - a.pontuacao);
  };

  const computeStdDev = () => {
    const items = computeRanking();
    if (!items || items.length === 0) return 0;
    const vals = items.map((i: any) => Number(i.pontuacao || 0));
    const mean = vals.reduce((s: number, v: number) => s + v, 0) / vals.length;
    const variance = vals.reduce((s: number, v: number) => s + Math.pow(v - mean, 2), 0) / vals.length;
    return Math.sqrt(variance);
  };

  const ranking = computeRanking();
  const stddev = computeStdDev();

  // Compute activities statistics from progress entries (fallback to relatorio.atividades)
  const computeActivitiesStats = () => {
    const map: Record<string, { titulo: string; totalRuns: number; totalScore: number; childrenCompleted: Set<string>; childrenPlayed: Set<string> }> = {};
    if (progressEntries.length > 0) {
      progressEntries.forEach((p: any) => {
        const rawTitulo = p.atividade || p.titulo || p.nome_atividade || p.game || (p.atividade_id ? `Atividade ${p.atividade_id}` : null);
        const titulo = getActivityTitle(rawTitulo);
        const key = titulo;
        const score = Number(p.pontuacao ?? p.score ?? p.nota ?? 0) || 0;
        const concluida = Boolean(p.concluida ?? p.finalizado ?? p.completed ?? p.concluded ?? false);
        // determine child key for uniqueness
        const cid = p.crianca_id ?? p.responsavel_id ?? p.crianca?.id ?? p.player_id ?? p.user_id ?? p.id_crianca ?? p.owner_id ?? null;
        const nomeFromEntry = p.crianca_nome || p.nome || p.usuario_nome || p.user_name || null;
        const childKey = cid ? String(cid) : (nomeFromEntry ? String(nomeFromEntry) : (p.crianca && p.crianca.nome ? String(p.crianca.nome) : null));
        if (!map[key]) map[key] = { titulo: titulo, totalRuns: 0, totalScore: 0, childrenCompleted: new Set<string>(), childrenPlayed: new Set<string>() };
        map[key].totalRuns += 1;
        map[key].totalScore += score;
        if (childKey) map[key].childrenPlayed.add(childKey);
        if (concluida && childKey) map[key].childrenCompleted.add(childKey);
      });
      // Compute taxa_conclusao as percent of children who completed this activity at least once
      return Object.values(map).map((v) => ({
        titulo: v.titulo,
        execucoes: v.totalRuns,
        taxa_conclusao: derivedTotalCriancas > 0 ? (v.childrenCompleted.size / derivedTotalCriancas) * 100 : (v.totalRuns ? (v.childrenCompleted.size / v.totalRuns) * 100 : 0),
        media_pontuacao: v.totalRuns ? v.totalScore / v.totalRuns : 0,
      }));
    }

    // Fallback: use relatorio.atividades or turma.atividades
    const raw = relatorio?.atividades || turma.atividades || [];
    return raw.map((a: any) => ({ titulo: getActivityTitle(a.titulo ?? a.nome), execucoes: a.execucoes ?? 0, taxa_conclusao: (a.taxa_conclusao ?? a.taxa ?? 0) * 100, media_pontuacao: a.media_pontuacao ?? a.execucoes ?? 0 }));
  };

  const activitiesStats = computeActivitiesStats();

  // Debug - print computed aggregates (safe place)
  try {
    console.log('🧭 progressEntries.length', progressEntries.length, 'activitiesStats', activitiesStats?.length, 'perChildTotals', perChildTotals.length);
    console.log('🧾 activitiesStats sample', activitiesStats.slice(0,5));
    console.log('👥 perChildTotals sample', perChildTotals.slice(0,5));
    console.log('🏷 ranking sample', computeRanking().slice(0,5));
  } catch (e) {}

  const screenPadding = 24;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['top']}>
      {/* Cabeçalho */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{turma.nome}</Text>
        <TouchableOpacity onPress={carregarRelatorio} style={{ padding: 8 }}>
          <Ionicons name="refresh" size={20} color="#E07612" />
        </TouchableOpacity>
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
        <Text style={styles.subtitle}>
          {turmaId ? `Visão geral de dados agregados da turma` : 'Visão geral de dados agregados (todas as crianças)'}
        </Text>

        {/* TAB BAR */}
        <View style={styles.tabBar}>
          <Pressable onPress={() => setActiveTab('notas')} style={[styles.tabButton, activeTab === 'notas' && styles.tabActive]}>
            <Text style={[styles.tabText, activeTab === 'notas' && styles.tabTextActive]}>Notas</Text>
          </Pressable>
          <Pressable onPress={() => setActiveTab('atividades')} style={[styles.tabButton, activeTab === 'atividades' && styles.tabActive]}>
            <Text style={[styles.tabText, activeTab === 'atividades' && styles.tabTextActive]}>Atividades</Text>
          </Pressable>
          <Pressable onPress={() => setActiveTab('ranking')} style={[styles.tabButton, activeTab === 'ranking' && styles.tabActive]}>
            <Text style={[styles.tabText, activeTab === 'ranking' && styles.tabTextActive]}>Ranking</Text>
          </Pressable>
          <Pressable onPress={() => setActiveTab('relatorios')} style={[styles.tabButton, activeTab === 'relatorios' && styles.tabActive]}>
            <Text style={[styles.tabText, activeTab === 'relatorios' && styles.tabTextActive]}>Relatórios</Text>
          </Pressable>
        </View>

        {/* CONTENT SWITCH */}
        {activeTab === 'notas' && (
          <View>
            {/* MÉTRICAS */}
            <View style={styles.metricsContainer}>
              {[
                { value: derivedTotalCriancas, label: 'Total de Crianças' },
                { value: turma.performanceMedia, label: 'Performance Média' },
                { value: `${derivedTaxaConclusao}%`, label: 'Taxa de conclusão' },
                { value: turma.atividadesCadastradas, label: 'Atividades Cadastradas' },
                ...(((turma as any).tempoMedio !== null && (turma as any).tempoMedio !== undefined)
                  ? [{ value: `${(turma as any).tempoMedio.toFixed(1)}`, label: 'Tempo médio (min)' }]
                  : []),
              ].map((m, i) => (
                <View key={i} style={styles.metricBox}>
                  <Text style={styles.metricValue}>{m.value}</Text>
                  <Text style={styles.metricLabel}>{m.label}</Text>
                </View>
              ))}
            </View>

            {/* Distribuição de Diagnósticos (estilo lista) */}
            <View style={{ marginTop: 16 }}>
              <Text style={styles.sectionTitle}>Distribuição de Diagnósticos</Text>
              <View style={{ backgroundColor: '#fff', borderRadius: 10, padding: 8 }}>
                {turma.diagnosticos && turma.diagnosticos.length > 0 ? (
                  turma.diagnosticos.map((d: any, i: number) => (
                    <View key={String(i)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: i < turma.diagnosticos.length - 1 ? 0.5 : 0, borderColor: '#EEE' }}>
                      <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: d.color, marginRight: 12 }} />
                      <Text style={{ flex: 1, fontWeight: '600' }}>{d.name}</Text>
                      <Text style={{ color: '#555' }}>{d.count}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={{ color: '#666' }}>Sem dados de diagnóstico.</Text>
                )}
              </View>
              <Text style={[styles.chartSubtext, { marginTop: 8 }]}>Total: {totalDiagnosticos}</Text>
            </View>

            {/* Distribuição de Pontuações por Criança (estilo lista) */}
            <View style={{ marginTop: 24 }}>
              <Text style={styles.sectionTitle}>Distribuição de Pontuações por Criança</Text>
              <View style={{ backgroundColor: '#fff', borderRadius: 10, padding: 8 }}>
                {perChildTotals && perChildTotals.length > 0 ? (
                  perChildTotals.map((c: any, idx: number) => (
                    <View key={String(c.id ?? idx)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: idx < perChildTotals.length - 1 ? 0.5 : 0, borderColor: '#EEE' }}>
                      <Text style={{ flex: 1 }}>{c.nome}</Text>
                      <Text style={{ width: 80, textAlign: 'right', fontWeight: '600' }}>{Math.round(c.total)}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={{ color: '#666' }}>Sem dados de pontuação por criança.</Text>
                )}
              </View>
            </View>
          </View>
        )}

        {activeTab === 'atividades' && (
          <View>
            <Text style={styles.sectionTitle}>Atividades — acertos / erros / taxa de conclusão</Text>
            <View style={styles.tableHeader}>
              <Text style={[styles.tableText, { flex: 1, fontWeight: 'bold' }]}>Atividade</Text>
              <Text style={[styles.tableText, { width: 120, fontWeight: 'bold', textAlign: 'center' }]}>Taxa Conclusão</Text>
              <Text style={[styles.tableText, { width: 80, fontWeight: 'bold', textAlign: 'right' }]}>Média</Text>
            </View>

            {activitiesStats.map((a: any, i: number) => (
              <View key={i} style={styles.activityRow}>
                <Text style={[styles.tableText, { flex: 1 }]}>{a.titulo}</Text>
                <Text style={[styles.tableText, { width: 120, textAlign: 'center' }]}>{(a.taxa_conclusao ?? 0).toFixed(1)}%</Text>
                <Text style={[styles.tableText, { width: 80, textAlign: 'right' }]}>{Math.round((a.media_pontuacao ?? 0) * 10) / 10}</Text>
              </View>
            ))}
          </View>
        )}

        {activeTab === 'ranking' && (
          <View>
            <Text style={styles.sectionTitle}>Ranking de Pontuações</Text>
            {ranking.length > 0 ? (
              ranking.map((item: any, index: number) => (
                <View key={String(item.id)} style={[styles.childRow, { justifyContent: 'space-between' }]}> 
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.avatar}><Text style={styles.avatarText}>{String(index+1)}</Text></View>
                    <View style={{ marginLeft: 8 }}>
                      <Text style={styles.childName}>{item.nome}</Text>
                      <Text style={styles.childInfo}>Pontuação: {item.pontuacao}</Text>
                    </View>
                  </View>
                  <Text style={{ fontWeight: 'bold' }}>{item.pontuacao}</Text>
                </View>
              ))
            ) : (
              <Text style={{ color: '#666' }}>Sem dados para ranking.</Text>
            )}

            <View style={{ marginTop: 12 }}>
              <Text style={[styles.metricLabel, { marginBottom: 6 }]}>Desvio padrão das notas</Text>
              <Text style={styles.metricValue}>{stddev.toFixed(2)}</Text>
            </View>
          </View>
        )}

        {activeTab === 'relatorios' && (
          <View>
            <Text style={styles.sectionTitle}>Relatórios IA</Text>
            {/* Resumo geral (moved from Notas) */}
            {relatorio?.resumo ? (
              <View style={styles.resumoContainer}>
                <Text style={styles.resumoTitle}>Resumo</Text>
                <Text style={styles.resumoText}>{relatorio.resumo}</Text>
                {/* discrepancy banner removed — backend enforces numeric aggregates */}
              </View>
            ) : null}

            {/* Distribuição de Diagnósticos - movida da aba 'Notas' para cá */}
            <View style={{ marginTop: 16 }}>
              <Text style={styles.sectionTitle}>Distribuição de Diagnósticos</Text>
              <View style={{ backgroundColor: '#fff', borderRadius: 10, padding: 8 }}>
                {turma.diagnosticos && turma.diagnosticos.length > 0 ? (
                  turma.diagnosticos.map((d: any, i: number) => (
                    <View key={String(i)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderBottomWidth: i < turma.diagnosticos.length - 1 ? 0.5 : 0, borderColor: '#EEE' }}>
                      <View style={{ width: 12, height: 12, borderRadius: 6, backgroundColor: d.color, marginRight: 12 }} />
                      <Text style={{ flex: 1, fontWeight: '600' }}>{d.name}</Text>
                      <Text style={{ color: '#555' }}>{d.count}</Text>
                    </View>
                  ))
                ) : (
                  <Text style={{ color: '#666' }}>Sem dados de diagnóstico.</Text>
                )}
              </View>
              <Text style={[styles.chartSubtext, { marginTop: 8 }]}>Total: {totalDiagnosticos}</Text>
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
    paddingVertical: 15,
    backgroundColor: 'white',
  },
  backButton: { padding: 8 },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: 'bold', textAlign: 'center', color: '#000' },
  headerSpacer: { width: 40 },

  title: { fontSize: 16, fontWeight: 'bold', marginTop: 24 },
  subtitle: { color: '#555', marginTop: 4, marginBottom: 24 },
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
  tabBar: {
    flexDirection: 'row',
    marginTop: 16,
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
});