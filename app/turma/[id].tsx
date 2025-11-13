import React, { useEffect, useState } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/Colors';
import { getJson, postJson, putJson, deleteJson } from '../../services/api';
import { useAccessibility } from '../../context/AccessibilityContext';

export default function TurmaScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const turmaId = Number(params.id);
  const { transformText } = useAccessibility();

  const [turma, setTurma] = useState<any | null>(null);
  const [criancas, setCriancas] = useState<any[]>([]);
  const [diagnosticos, setDiagnosticos] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // criar criança
  const [showCriancaModal, setShowCriancaModal] = useState(false);
  const [novoNome, setNovoNome] = useState('');
  const [novaIdade, setNovaIdade] = useState<string>('');
  const [novoDiagnostico, setNovoDiagnostico] = useState<number | null>(null);

  // editar turma
  const [showEditarModal, setShowEditarModal] = useState(false);
  const [nomeTurmaEdit, setNomeTurmaEdit] = useState('');

  // menu de ações
  const [showMenu, setShowMenu] = useState(false);

  const carregar = async () => {
    setLoading(true);
    try {
      const t = await getJson(`/turmas/${turmaId}`);
      setTurma(t);

      const todos = await getJson('/criancas');
      const lista = Array.isArray(todos) ? todos.filter((c: any) => Number(c.turma_id) === Number(turmaId)) : [];
      setCriancas(lista);

      const diag = await getJson('/diagnosticos');
      setDiagnosticos(Array.isArray(diag) ? diag : []);
    } catch (e) {
  console.error('Erro ao carregar turma/crianças:', e);
  Alert.alert(transformText('Erro'), transformText('Falha ao carregar dados da turma.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isNaN(turmaId)) carregar();
  }, [turmaId]);

  const abrirCrianca = (c: any) => {
    // navegar para a tela de perfil da criança passando id como query param
  router.push(`/CriancaProfileScreen?id=${c.id}`);
  };

  const criarCrianca = async () => {
    if (!novoNome.trim() || !novaIdade.trim() || !novoDiagnostico) {
      Alert.alert(transformText('Validação'), transformText('Preencha nome, idade e diagnóstico'));
      return;
    }

    try {
      // Criar já associando à turma e diagnóstico
      const body = {
        nome: novoNome,
        idade: Number(novaIdade),
        turma_id: turmaId,
        diagnostico_id: Number(novoDiagnostico),
      };
      const res = await postJson('/criancas', body);
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`${res.status} ${txt}`);
      }
      await res.json();

      setShowCriancaModal(false);
      setNovoNome('');
      setNovaIdade('');
      setNovoDiagnostico(null);
      Alert.alert(transformText('Sucesso'), transformText('Criança criada e atribuída à turma'));
      await carregar();
    } catch (e: any) {
      console.error('Erro ao criar criança:', e);
      Alert.alert(transformText('Erro'), transformText(`Falha ao criar criança: ${e.message || e}`));
    }
  };

  const abrirEditarTurma = () => {
    setNomeTurmaEdit(turma?.nome || '');
    setShowMenu(false);
    setShowEditarModal(true);
  };

  const salvarEdicaoTurma = async () => {
    if (!nomeTurmaEdit.trim()) {
      Alert.alert(transformText('Validação'), transformText('Informe o nome da turma.'));
      return;
    }

    try {
      const res = await putJson(`/turmas/${turmaId}`, { nome: nomeTurmaEdit });
      if (res.ok) {
        setShowEditarModal(false);
        Alert.alert(transformText('Sucesso'), transformText('Turma atualizada com sucesso.'));
        await carregar();
      } else {
        const txt = await res.text();
        Alert.alert(transformText('Erro'), transformText(`Falha ao atualizar: ${res.status} ${txt}`));
      }
    } catch (e: any) {
      console.error('Erro ao atualizar turma:', e);
      Alert.alert(transformText('Erro'), transformText(`Falha ao atualizar turma: ${e.message || e}`));
    }
  };

  const confirmarDeletarTurma = () => {
    setShowMenu(false);
    Alert.alert(
      transformText('Confirmar'),
      transformText('Deseja realmente deletar esta turma? Todas as crianças associadas ficarão sem turma.'),
      [
        { text: transformText('Cancelar'), style: 'cancel' },
        { text: transformText('Deletar'), style: 'destructive', onPress: deletarTurma },
      ]
    );
  };

  const deletarTurma = async () => {
    try {
      const res = await deleteJson(`/turmas/${turmaId}`);
      if (res.ok) {
        Alert.alert(transformText('Sucesso'), transformText('Turma deletada com sucesso.'));
        router.back();
      } else {
        const txt = await res.text();
        Alert.alert(transformText('Erro'), transformText(`Falha ao deletar: ${res.status} ${txt}`));
      }
    } catch (e: any) {
      console.error('Erro ao deletar turma:', e);
      Alert.alert(transformText('Erro'), transformText(`Falha ao deletar turma: ${e.message || e}`));
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
  <Text style={styles.title}>{transformText(turma?.nome ?? `Turma ${turmaId}`)}</Text>
        <TouchableOpacity onPress={() => setShowMenu(!showMenu)} style={{ padding: 8 }}>
          <Ionicons name="ellipsis-vertical" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {showMenu && (
        <View style={styles.menu}>
          <TouchableOpacity style={styles.menuItem} onPress={abrirEditarTurma}>
            <Ionicons name="pencil" size={20} color={Colors.light.primary} />
            <Text style={styles.menuText}>{transformText('Editar turma')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem} onPress={confirmarDeletarTurma}>
            <Ionicons name="trash" size={20} color="#ff4d4d" />
            <Text style={[styles.menuText, { color: '#ff4d4d' }]}>{transformText('Deletar turma')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ padding: 16 }}>
  <Text style={{ fontWeight: 'bold', marginBottom: 8 }}>{transformText('Crianças da turma')}</Text>
        <FlatList
          data={criancas}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => abrirCrianca(item)} style={styles.criancaItem}>
              <Text style={{ fontSize: 16 }}>{transformText(`${item.nome} (${item.idade} anos)`)}</Text>
            </TouchableOpacity>
          )}
        />

        <TouchableOpacity style={[styles.button, { marginTop: 12 }]} onPress={() => setShowCriancaModal(true)}>
          <Text style={{ color: 'white' }}>{transformText('+ Nova Criança')}</Text>
        </TouchableOpacity>
      </View>

      <Modal visible={showCriancaModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{transformText('Nova Criança')}</Text>
            <TextInput placeholder={transformText('Nome')} value={novoNome} onChangeText={setNovoNome} style={styles.input} />
            <TextInput placeholder={transformText('Idade')} value={novaIdade} onChangeText={setNovaIdade} keyboardType="numeric" style={styles.input} />

            <Text style={{ marginTop: 8 }}>{transformText('Diagnóstico')}</Text>
            <FlatList
              data={diagnosticos}
              keyExtractor={(d) => String(d.id)}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => setNovoDiagnostico(item.id)} style={[styles.option, novoDiagnostico === item.id && { backgroundColor: '#FBE8D4' }]}>
                  <Text>{transformText(item.tipo)}</Text>
                </TouchableOpacity>
              )}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <TouchableOpacity onPress={() => setShowCriancaModal(false)} style={[styles.button, { backgroundColor: 'white', borderWidth: 1, borderColor: Colors.light.primary }]}>
                <Text style={{ color: Colors.light.primary }}>{transformText('Cancelar')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={criarCrianca} style={styles.button}>
                <Text style={{ color: 'white' }}>{transformText('Criar')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Editar Turma */}
      <Modal visible={showEditarModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>{transformText('Editar Turma')}</Text>
            <TextInput
              placeholder={transformText('Nome da turma')}
              value={nomeTurmaEdit}
              onChangeText={setNomeTurmaEdit}
              style={styles.input}
            />

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 12 }}>
              <TouchableOpacity
                onPress={() => setShowEditarModal(false)}
                style={[styles.button, { backgroundColor: 'white', borderWidth: 1, borderColor: Colors.light.primary }]}
              >
                <Text style={{ color: Colors.light.primary }}>{transformText('Cancelar')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={salvarEdicaoTurma} style={styles.button}>
                <Text style={{ color: 'white' }}>{transformText('Salvar')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderColor: '#eee' },
  title: { flex: 1, textAlign: 'center', fontWeight: 'bold', fontSize: 18 },
  menu: {
    position: 'absolute',
    top: 60,
    right: 16,
    backgroundColor: 'white',
    borderRadius: 8,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 100,
    paddingVertical: 8,
    minWidth: 180,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    gap: 12,
  },
  menuText: {
    fontSize: 16,
    color: '#000',
  },
  criancaItem: { paddingVertical: 12, borderBottomWidth: 1, borderColor: '#eee' },
  button: { backgroundColor: Colors.light.primary, padding: 12, borderRadius: 8, alignItems: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalContainer: { backgroundColor: 'white', padding: 16, borderRadius: 12, width: '100%', maxHeight: '90%' },
  input: { borderWidth: 1, borderColor: '#ddd', padding: 8, borderRadius: 8, marginTop: 8 },
  option: { padding: 8, borderRadius: 8, marginTop: 6, borderWidth: 1, borderColor: '#eee' },
});
