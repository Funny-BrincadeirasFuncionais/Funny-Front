import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getJson, putJson, deleteJson } from '../../services/api';
import { getProgressoCrianca, listAtividades } from '../../services/api';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';
import { useAccessibility } from '../../context/AccessibilityContext';

export default function CriancaProfileScreen() {
  const [modalDiagnostico, setModalDiagnostico] = useState(false);
  const [diagnosticoSelecionado, setDiagnosticoSelecionado] = useState<number | null>(null);
  const router = useRouter();
  const params = useLocalSearchParams();
  const criancaId = params.id ? Number(params.id) : null;
  const { transformText } = useAccessibility();

  const [diagList, setDiagList] = useState<any[]>([]);
  const [turmas, setTurmas] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // editable fields
  const [nome, setNome] = useState<string>('');
  const [idade, setIdade] = useState<string>('');
  const [diagnosticoId, setDiagnosticoId] = useState<number | null>(null);
  const [turmaId, setTurmaId] = useState<number | null>(null);
  const [diagnosticoNome, setDiagnosticoNome] = useState<string>('Não especificado');
  const [turmaNome, setTurmaNome] = useState<string>('Sem turma');
  const [progressos, setProgressos] = useState<any[]>([]);
  const [atividadesMap, setAtividadesMap] = useState<Record<number, any>>({});

  useEffect(() => {
    const carregar = async () => {
      if (!criancaId) return;
      setLoading(true);
      try {
        const c = await getJson(`/criancas/${criancaId}`);
        setNome(c.nome ?? '');
        setIdade(String(c.idade ?? ''));
        setDiagnosticoId(c.diagnostico_id ?? null);
        setTurmaId(c.turma_id ?? null);

        // Buscar nome do diagnóstico
        const diag = await getJson('/diagnosticos');
        setDiagList(Array.isArray(diag) ? diag : []);
        if (c.diagnostico_id) {
          const d = diag.find((item: any) => item.id === c.diagnostico_id);
          setDiagnosticoNome(d?.tipo ?? 'Não especificado');
        }

        // Buscar nome da turma
        if (c.turma_id) {
          try {
            const t = await getJson(`/turmas/${c.turma_id}`);
            setTurmaNome(t.nome ?? 'Sem turma');
          } catch {
            setTurmaNome('Sem turma');
          }
        }

        const allTurmas = await getJson('/turmas');
        setTurmas(Array.isArray(allTurmas) ? allTurmas : []);

        // Carregar progresso e atividades
        try {
          const [progs, atividades] = await Promise.all([
            getProgressoCrianca(criancaId),
            listAtividades(),
          ]);
          setProgressos(progs);
          const map: Record<number, any> = {};
          (Array.isArray(atividades) ? atividades : []).forEach((a: any) => {
            map[a.id] = a;
          });
          setAtividadesMap(map);
        } catch (e) {
          console.warn('Falha ao carregar progresso/atividades', e);
        }
      } catch (e) {
        console.error('Erro ao carregar criança:', e);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, [criancaId]);

  // Dados estáticos para exibição visual
  const crianca = {
    nome: nome || 'Nome da Criança',
    idade: Number(idade) || 0,
  };

  // Diagnosticos estáticos para o modal visual
  const diagnosticos = diagList.length ? diagList : [
    { id: 1, tipo: 'Autismo de Nível 1' },
    { id: 2, tipo: 'Autismo de Nível 2' },
    { id: 3, tipo: 'Autismo de Nível 3' },
    { id: 4, tipo: 'Não especificado' },
  ];

  const concluidasCount = progressos.filter((p) => p.concluida).length;

  // Jogos são acessados pelas telas de categorias (Matemática/Português)

  const atualizarDiagnostico = async () => {
    if (!criancaId || !diagnosticoSelecionado) {
      setModalDiagnostico(false);
      return;
    }
    try {
      const res = await putJson(`/criancas/${criancaId}`, { diagnostico_id: diagnosticoSelecionado });
      if (res.ok) {
        const escolhido = diagList.find((d) => d.id === diagnosticoSelecionado);
        setDiagnosticoId(diagnosticoSelecionado);
        setDiagnosticoNome(escolhido?.tipo ?? 'Não especificado');
        Alert.alert('Sucesso', 'Diagnóstico atualizado com sucesso.');
      } else {
        const txt = await res.text();
        Alert.alert('Erro', `Falha ao atualizar: ${res.status} ${txt}`);
      }
    } catch (e) {
      console.error('Erro ao atualizar diagnóstico', e);
      Alert.alert('Erro', 'Falha ao atualizar diagnóstico');
    } finally {
      setModalDiagnostico(false);
    }
  };

  const salvarCrianca = async () => {
    if (!criancaId) return;
    try {
      const body: any = { nome, idade: Number(idade) };
      if (diagnosticoId) body.diagnostico_id = diagnosticoId;
      if (turmaId) body.turma_id = turmaId;
      const res = await putJson(`/criancas/${criancaId}`, body);
      if (res.ok) {
        Alert.alert('Sucesso', 'Dados da criança atualizados');
      } else {
        const t = await res.text();
        Alert.alert('Erro', `Falha ao atualizar: ${res.status} ${t}`);
      }
    } catch (e) {
      console.error('Erro ao salvar criança:', e);
      Alert.alert('Erro', 'Falha ao salvar criança');
    }
  };

  const deletarCrianca = async () => {
    if (!criancaId) return;
    Alert.alert('Confirmar', 'Deseja deletar esta criança?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Deletar', style: 'destructive', onPress: () => {
        void (async () => {
          try {
            const res = await deleteJson(`/criancas/${criancaId}`);
            if (res.ok || res.status === 204) {
              Alert.alert('Removido', 'Criança removida');
              router.back();
            } else {
              const txt = await res.text();
              Alert.alert('Erro', `Falha ao remover: ${res.status} ${txt}`);
            }
          } catch (e) {
            console.error('Erro ao deletar criança:', e);
            Alert.alert('Erro', 'Falha ao deletar criança');
          }
        })();
      } }
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/TeacherProfileScreen')}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{transformText('Perfil da Criança')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 0, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Perfil */}
        <View style={styles.profileContainer}>
          <View style={styles.avatarWrapper}>
            <Ionicons name="person-circle" size={120} color={Colors.light.primary} />
          </View>
          <Text style={styles.name}>{transformText(crianca.nome)}</Text>
          <Text style={styles.age}>{transformText('Idade')}: {crianca.idade} {transformText('anos')}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setModalDiagnostico(true)}
            >
              <Text style={styles.editText}>{transformText('Editar Diagnóstico')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButtonTop}
              onPress={deletarCrianca}
            >
              <Ionicons name="trash" size={18} color="#fff" />
              <Text style={styles.deleteButtonTextTop}>{transformText('Deletar')}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Painel de controle */}
        <View style={styles.panelContainer}>
          <Text style={styles.sectionTitle}>{transformText('Informações:')}</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{concluidasCount}</Text>
              <Text style={styles.statLabel}>{transformText('Atividades Concluídas')}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{transformText(diagnosticoNome)}</Text>
              <Text style={styles.statLabel}>{transformText('Diagnóstico')}</Text>
            </View>
          </View>
          <View style={[styles.statBox, { marginTop: 12 }]}>
            <Text style={styles.statValue}>{transformText(turmaNome)}</Text>
            <Text style={styles.statLabel}>{transformText('Turma')}</Text>
          </View>
        </View>

        {/* Atividades (Progresso) */}
        <View style={styles.activitiesContainer}>
          <Text style={styles.sectionTitle}>{transformText('Atividades (histórico):')}</Text>
          {progressos.length === 0 ? (
            <Text style={{ color: '#666' }}>{transformText('Nenhuma atividade registrada ainda.')}</Text>
          ) : (
            progressos.map((p) => {
              const atividade = p.atividade || atividadesMap[p.atividade_id] || null;
              const titulo = atividade?.titulo || `Atividade #${p.atividade_id}`;
              return (
                <View key={p.id} style={styles.activityItem}>
                  <View style={styles.activityContent}>
                    <Ionicons
                      name={p.concluida ? 'checkmark-circle' : 'ellipse-outline'}
                      size={24}
                      color={p.concluida ? '#4CAF50' : '#999'}
                    />
                    <View style={styles.activityInfo}>
                      <Text style={styles.activityTitle}>{transformText(titulo)}</Text>
                      <Text style={styles.activityNote}>{transformText('Pontuação')}: {p.pontuacao}</Text>
                      {p.observacoes ? (
                        <Text style={[styles.activityNote, { marginTop: 2 }]}>{transformText('Obs.')}: {p.observacoes}</Text>
                      ) : null}
                    </View>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>

      {/* Modal de Diagnóstico */}
      <Modal visible={modalDiagnostico} transparent animationType="fade" onRequestClose={() => setModalDiagnostico(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{transformText('Selecione o Diagnóstico')}</Text>
            <FlatList
              data={diagnosticos}
              keyExtractor={(item) => item.id.toString()}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => setDiagnosticoSelecionado(item.id)}
                  style={[
                    styles.optionItem,
                    diagnosticoSelecionado === item.id && { backgroundColor: '#FBE8D4' },
                  ]}
                >
                  <Text style={styles.optionText}>{transformText(item.tipo)}</Text>
                </Pressable>
              )}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalDiagnostico(false)}
              >
                <Text style={[styles.modalButtonText, { color: '#E07612' }]}>{transformText('Cancelar')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={atualizarDiagnostico}
              >
                <Text style={[styles.modalButtonText, { color: 'white' }]}>{transformText('Confirmar')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Jogo removido (perfil mostra histórico, jogos acessados pelas telas de categorias) */}
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
  age: { fontSize: 14, color: '#555', marginBottom: 12 },
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
  deleteButtonTop: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ff4d4d',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 6,
  },
  deleteButtonTextTop: { color: 'white', fontSize: 14, fontWeight: 'bold' },
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
  statValue: { fontSize: 16, fontWeight: 'bold', marginBottom: 6 },
  statLabel: { fontSize: 14, color: '#555', textAlign: 'left' },
  infoContainer: { marginTop: 20, marginHorizontal: 24 },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E07612',
    borderRadius: 10,
    padding: 16,
    gap: 12,
  },
  infoTextContainer: { flex: 1 },
  infoLabel: { fontSize: 14, color: '#555', marginBottom: 4 },
  infoText: { fontSize: 16, fontWeight: '500', color: '#333', minHeight: 40 },
  textInput: {
    borderWidth: 1,
    borderColor: '#E07612',
    borderRadius: 10,
    padding: 12,
    minHeight: 150,
    maxHeight: 200,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#f9f9f9',
    marginBottom: 16,
  },
  activitiesContainer: { marginTop: 20, marginHorizontal: 24, marginBottom: 24 },
  activityItem: {
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
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  activityInfo: { flex: 1 },
  activityTitle: { fontSize: 16, fontWeight: '500', marginBottom: 4 },
  activityNote: { fontSize: 14, color: '#555' },
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
    maxHeight: 420,
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
