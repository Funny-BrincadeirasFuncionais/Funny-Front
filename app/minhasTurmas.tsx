import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
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
import { Colors } from '../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getJson, postJson } from '../services/api';
import { useAccessibility } from '../context/AccessibilityContext';

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

export default function MinhasTurmasScreen() {
  const router = useRouter();
  const { transformText } = useAccessibility();
  const [turmas, setTurmas] = useState<Turma[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [turmaNome, setTurmaNome] = useState('');

  const carregarTurmas = async () => {
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        setTurmas([]);
        setLoading(false);
        return;
      }

      const [allTurmas, allCriancas] = await Promise.all([
        getJson('/turmas'),
        getJson('/criancas'),
      ]);
      const listaTurmas: any[] = Array.isArray(allTurmas) ? allTurmas : [];
      const listaCriancas: any[] = Array.isArray(allCriancas) ? allCriancas : [];

      const minhasTurmas = listaTurmas
        .filter(
          (t: any) =>
            Number(t.responsavel_id) === Number(userId) ||
            (t.responsavel && Number(t.responsavel.id) === Number(userId))
        )
        .map((t: any) => ({
          id: Number(t.id),
          nome: t.nome,
          responsavel_id: Number(t.responsavel_id),
          responsavel: t.responsavel,
          criancas: listaCriancas
            .filter((c: any) => Number(c.turma_id) === Number(t.id))
            .map((c: any) => ({
              id: Number(c.id),
              nome: c.nome,
              idade: c.idade,
              diagnostico_id: c.diagnostico_id,
            })),
        }));

      setTurmas(minhasTurmas);
    } catch (e) {
      console.error('Erro ao carregar turmas:', e);
      Alert.alert(transformText('Erro'), transformText('Falha ao carregar turmas.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarTurmas();
  }, []);

  const abrirNovaTurma = () => {
    setTurmaNome('');
    setModalVisible(true);
  };

  const criarTurma = async () => {
    if (!turmaNome.trim()) {
      Alert.alert(transformText('Validação'), transformText('Informe o nome da turma.'));
      return;
    }

    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert(transformText('Erro'), transformText('Usuário não identificado.'));
        return;
      }

      const response = await postJson('/turmas', {
        nome: turmaNome,
        responsavel_id: Number(userId),
      });

      if (response.ok) {
        setModalVisible(false);
        setTurmaNome('');
        Alert.alert(transformText('Sucesso'), transformText('Turma criada com sucesso.'));
        await carregarTurmas();
      } else {
        const text = await response.text();
        Alert.alert(transformText('Erro'), `${transformText('Falha ao criar turma')}: ${response.status} ${text}`);
      }
    } catch (e) {
      console.error('Erro ao criar turma', e);
      Alert.alert(transformText('Erro'), transformText('Falha ao criar turma.'));
    }
  };

  const abrirTurma = (id: number) => {
    router.push(`/turma/${id}` as any);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />
      
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{transformText('Minhas Turmas')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 100 }}>
        {loading && <Text style={{ textAlign: 'center', marginTop: 20 }}>{transformText('Carregando turmas...')}</Text>}
        
        {!loading && turmas.length === 0 && (
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Text style={{ fontSize: 16, color: '#777', marginBottom: 20 }}>
              {transformText('Você ainda não tem turmas cadastradas.')}
            </Text>
          </View>
        )}

        {!loading && turmas.map((turma) => (
          <TouchableOpacity
            key={turma.id}
            style={styles.turmaCard}
            onPress={() => abrirTurma(turma.id)}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.turmaNome}>{turma.nome}</Text>
              <Text style={styles.turmaInfo}>
                {turma.criancas?.length || 0}{' '}
                {turma.criancas?.length === 1 ? transformText('criança') : transformText('crianças')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#000" />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.fab} onPress={abrirNovaTurma}>
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>{transformText('Nova Turma')}</Text>
            <TextInput
              placeholder={transformText('Nome da turma')}
              value={turmaNome}
              onChangeText={setTurmaNome}
              style={styles.input}
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalButtonText, { color: '#E07612' }]}>
                  {transformText('Cancelar')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={criarTurma}
              >
                <Text style={[styles.modalButtonText, { color: 'white' }]}>
                  {transformText('Criar')}
                </Text>
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
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  turmaCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E07612',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  turmaNome: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  turmaInfo: {
    fontSize: 14,
    color: '#777',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E07612',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
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
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E07612',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
  },
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
