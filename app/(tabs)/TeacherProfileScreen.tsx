import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getJson, postJson, putJson, deleteJson } from '../../services/api';
import { useAccessibility } from '../../context/AccessibilityContext';

export default function ProfessorScreen() {
  const router = useRouter();
  const { transformText } = useAccessibility();

  type ListItem = Turma | { id: number; nome: string; idade: number };

  const [reportType, setReportType] = useState<'Turma' | 'Aluno' | null>(null);
  const [showSelect, setShowSelect] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<number | null>(null);

  type Turma = {
    id: number;
    nome: string;
    responsavel_id: number;
    responsavel?: {
      id: number;
      nome: string;
      email: string;
      telefone: string;
      turmas: number[];
    };
    criancas?: Array<{
      id: number;
      nome: string;
      idade: number;
      diagnostico_id: number;
    }>;
  };

  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [alunos, setAlunos] = useState<Array<{id: number; nome: string; idade: number}>>([]);
  const [loading, setLoading] = useState(false);
  const [responsavelNome, setResponsavelNome] = useState<string | null>(null);
  const [responsavelEmail, setResponsavelEmail] = useState<string | null>(null);

  const handleSelectType = (type: 'Turma' | 'Aluno') => {
    setReportType(type);
    setShowSelect(false);
    setShowDialog(true);
  };

  // carregar turmas do responsavel atual (declarado no escopo para reutilizar)
  const carregarTurmas = async () => {
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        setTurmas([]);
        setAlunos([]);
        setLoading(false);
        return;
      }
      // Buscar info do responsável (nome/email) — não assume que o endpoint traga turmas como objetos
      try {
        const resp = await getJson(`/responsaveis/${userId}`);
        if (resp) {
          // resp.turmas geralmente é uma lista de IDs (segundo o backend), então apenas usamos nome/email
          setResponsavelNome(resp.nome ?? null);
          setResponsavelEmail(resp.email ?? null);
        }
      } catch (err) {
        // não bloqueante — apenas logamos
        console.debug('Não foi possível carregar responsavel:', err);
      }

      // Buscar todas as turmas e todas as crianças e então montar as turmas do usuário
      const [allTurmas, allCriancas] = await Promise.all([getJson('/turmas'), getJson('/criancas')]);
      const listaTurmas: any[] = Array.isArray(allTurmas) ? allTurmas : [];
      const listaCriancas: any[] = Array.isArray(allCriancas) ? allCriancas : [];

      // filtrar turmas do responsavel
      const minhasTurmas = listaTurmas
        .filter((t: any) => Number(t.responsavel_id) === Number(userId) || (t.responsavel && Number(t.responsavel.id) === Number(userId)))
        .map((t: any) => ({
          id: Number(t.id),
          nome: t.nome,
          responsavel_id: Number(t.responsavel_id),
          responsavel: t.responsavel,
          // associar crianças por turma_id
          criancas: listaCriancas.filter((c: any) => Number(c.turma_id) === Number(t.id)).map((c: any) => ({
            id: Number(c.id),
            nome: c.nome,
            idade: c.idade,
            diagnostico_id: c.diagnostico_id
          }))
        }));

      setTurmas(minhasTurmas);
      const allAlunos = minhasTurmas.flatMap(t =>
        (t.criancas || []).map((c: any) => ({ id: c.id, nome: c.nome, idade: c.idade }))
      );
      setAlunos(allAlunos);
    } catch (e) {
      console.error('Erro ao carregar turmas:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarTurmas();
  }, []);

  // CRUD de turmas
  const [modalTurmaVisible, setModalTurmaVisible] = useState(false);
  const [turmaNome, setTurmaNome] = useState('');
  const [editingTurmaId, setEditingTurmaId] = useState<number | null>(null);

  const abrirNovaTurma = () => {
    setEditingTurmaId(null);
    setTurmaNome('');
    setModalTurmaVisible(true);
  };

  const abrirEditarTurma = (t: Turma) => {
    setEditingTurmaId(t.id);
    setTurmaNome(t.nome || '');
    setModalTurmaVisible(true);
  };

  const salvarTurma = async () => {
    if (!turmaNome.trim()) {
      Alert.alert('Validação', 'Informe o nome da turma.');
      return;
    }
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Erro', 'Usuário não identificado.');
        return;
      }

      let response;
      if (editingTurmaId) {
        response = await putJson(`/turmas/${editingTurmaId}`, {
          nome: turmaNome,
          responsavel_id: Number(userId)
        });
      } else {
        response = await postJson('/turmas', {
          nome: turmaNome,
          responsavel_id: Number(userId)
        });
      }

      if (response.ok) {
        setModalTurmaVisible(false);
        setTurmaNome('');
        setEditingTurmaId(null);
        Alert.alert('Sucesso', `Turma ${editingTurmaId ? 'atualizada' : 'criada'} com sucesso.`);
        await carregarTurmas();
      } else {
        const text = await response.text();
        Alert.alert('Erro', `Falha ao salvar turma: ${response.status} ${text}`);
      }
    } catch (e) {
      console.error('Erro ao salvar turma', e);
      Alert.alert('Erro', 'Falha ao salvar turma.');
    }
  };

  const confirmarRemoverTurma = (id: number) => {
    Alert.alert('Confirmar', 'Deseja remover esta turma?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Remover', style: 'destructive', onPress: () => { void removerTurma(id); } },
    ]);
  };

  const removerTurma = async (id: number) => {
    try {
      const response = await deleteJson(`/turmas/${id}`);
      if (response.ok) {
        Alert.alert('Removido', 'Turma removida com sucesso.');
        await carregarTurmas();
      } else {
        const text = await response.text();
        Alert.alert('Erro', `Falha ao remover turma: ${response.status} ${text}`);
      }
    } catch (e) {
      console.error('Erro ao remover turma', e);
      Alert.alert('Erro', 'Falha ao remover turma.');
    }
  };

  const handleEmitir = () => {
    setShowDialog(false);
    console.log(`Emitindo relatório de ${reportType}: ID ${selectedItem}`);
    // aqui pode ir para outra tela futuramente
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{transformText('Professor')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 0, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Perfil */}
        <View style={styles.profileContainer}>
          <View style={styles.avatarWrapper}>
            <Ionicons name="person-circle" size={120} color={Colors.light.primary} />
          </View>
          <Text style={styles.name}>{transformText(responsavelNome ?? 'Nome e Sobrenome')}</Text>
          <Text style={styles.email}>{responsavelEmail ?? 'email@gmail.com'}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push('/EditarPerfilScreen')}
            >
              <Text style={styles.editText}>{transformText('Editar Perfil')}</Text>
            </TouchableOpacity>

            {/* Select de relatório */}
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                style={styles.reportButton}
                onPress={() => setShowSelect(!showSelect)}
              >
                <Text style={styles.reportText}>{transformText('Gerar relatório')}</Text>
                <Ionicons name="chevron-down" size={16} color="white" style={{ marginLeft: 4 }} />
              </TouchableOpacity>

              {showSelect && (
                <View style={styles.dropdown}>
                  <Pressable onPress={() => handleSelectType('Turma')} style={styles.dropdownItem}>
                    <Text style={styles.dropdownText}>{transformText('Turma')}</Text>
                  </Pressable>
                  <Pressable onPress={() => handleSelectType('Aluno')} style={styles.dropdownItem}>
                    <Text style={styles.dropdownText}>{transformText('Aluno')}</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Painel de controle */}
        <View style={styles.panelContainer}>
          <Text style={styles.sectionTitle}>{transformText('Painel de controle:')}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{alunos.length}</Text>
              <Text style={styles.statLabel}>{transformText('Alunos Ativos')}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{turmas.length}</Text>
              <Text style={styles.statLabel}>{transformText('Número de Turmas')}</Text>
            </View>
          </View>
        </View>

        {/* Minhas turmas */}
        <View style={styles.classesContainer}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={styles.sectionTitle}>{transformText('Minhas Turmas:')}</Text>
            <TouchableOpacity onPress={() => router.push('/minhasTurmas' as any)}>
              <Text style={{ color: Colors.light.primary, fontSize: 14, fontWeight: '600' }}>{transformText('Ver todas')} →</Text>
            </TouchableOpacity>
          </View>
          {turmas.slice(0, 3).map((turma) => (
            <TouchableOpacity key={turma.id} style={styles.classItem} onPress={() => router.push(`/turma/${turma.id}` as any)}>
              <View style={{ flex: 1 }}>
                <Text style={styles.classText}>{transformText(turma.nome)}</Text>
                <Text style={{ fontSize: 12, color: '#777', marginTop: 4 }}>
                  {turma.criancas?.length || 0} {turma.criancas?.length === 1 ? transformText('criança') : transformText('crianças')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#000" />
            </TouchableOpacity>
          ))}

          {loading && <Text style={{ marginTop: 8 }}>{transformText('Carregando turmas...')}</Text>}
          {!loading && turmas.length === 0 && <Text style={{ marginTop: 8 }}>{transformText('Nenhuma turma encontrada.')}</Text>}
        </View>
      </ScrollView>

      {/* Modal de seleção */}
      <Modal visible={showDialog} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {reportType === 'Turma' ? transformText('Selecione a turma') : transformText('Selecione o aluno')}
            </Text>
            <Text style={styles.modalSubtitle}>
              {transformText('Escolha alguma das opções abaixo para seguir com a emissão do relatório')}
            </Text>

            <FlatList<ListItem>
              data={reportType === 'Turma' ? turmas : alunos}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => setSelectedItem(item.id)}
                  style={[
                    styles.optionItem,
                    selectedItem === item.id && { backgroundColor: '#FBE8D4' },
                  ]}
                >
                  <Text style={styles.optionText}>{item.nome}</Text>
                </Pressable>
              )}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowDialog(false)}
              >
                <Text style={[styles.modalButtonText, { color: '#E07612' }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleEmitir}
                disabled={!selectedItem}
              >
                <Text style={[styles.modalButtonText, { color: 'white' }]}>
                  Emitir relatório
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Criar / Editar Turma */}
      <Modal visible={modalTurmaVisible} transparent animationType="fade" onRequestClose={() => setModalTurmaVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{editingTurmaId ? 'Editar Turma' : 'Nova Turma'}</Text>
            <TextInput
              placeholder="Nome da turma"
              value={turmaNome}
              onChangeText={setTurmaNome}
              style={{
                borderWidth: 1,
                borderColor: '#E07612',
                borderRadius: 8,
                padding: 10,
                marginTop: 12,
                marginBottom: 12,
              }}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={[styles.modalButton, styles.cancelButton]} onPress={() => setModalTurmaVisible(false)}>
                <Text style={[styles.modalButtonText, { color: '#E07612' }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalButton, styles.confirmButton]} onPress={salvarTurma}>
                <Text style={[styles.modalButtonText, { color: 'white' }]}>{editingTurmaId ? 'Salvar' : 'Criar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  headerSpacer: { width: 40 },
  profileContainer: { alignItems: 'center', marginTop: 20 },
  avatarWrapper: { position: 'relative' },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  name: { fontSize: 18, fontWeight: 'bold', marginTop: 12, marginBottom: 4 },
  email: { fontSize: 14, color: '#555', marginBottom: 12 },
  buttonRow: { flexDirection: 'row', gap: 12, marginTop: 12, marginHorizontal: 24 },
  editButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E07612',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  editText: { color: '#E07612', fontSize: 14, fontWeight: 'bold' },
  reportButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E07612',
    paddingVertical: 12,
    borderRadius: 10,
  },
  reportText: { color: 'white', fontSize: 14, fontWeight: 'bold' },
  dropdown: {
    position: 'absolute',
    top: 48,
    right: 0,
    left: 0,
    backgroundColor: 'white',
    borderRadius: 10,
    elevation: 6,
    zIndex: 100, // garante que fique acima do resto
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    overflow: 'hidden',
  },
  dropdownItem: { padding: 12 },
  dropdownText: { fontSize: 14, color: '#000' },
  panelContainer: { marginTop: 24, marginHorizontal: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 12 },
  statsRow: { flexDirection: 'row', gap: 12, justifyContent: 'space-between' },
  statBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E07612',
    borderRadius: 10,
    padding: 16,
    alignItems: 'flex-start',
  },
  statValue: { fontSize: 24, fontWeight: 'bold', marginBottom: 6 },
  statLabel: { fontSize: 14, color: '#555', textAlign: 'left' },
  classesContainer: { marginTop: 20, marginHorizontal: 24 },
  classItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E07612',
    borderRadius: 10,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  classText: { fontSize: 16 },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    width: '88%',
    maxHeight: 420, // limita o tamanho total do modal
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 6 },
  modalSubtitle: { color: '#555', marginBottom: 16 },
  optionItem: {
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  optionText: { fontSize: 16 },
  modalButtons: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16, gap: 8 },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E07612',
  },
  cancelButton: { backgroundColor: 'white' },
  confirmButton: { backgroundColor: '#E07612', borderWidth: 0 },
  modalButtonText: { fontSize: 14, fontWeight: 'bold' },
});
