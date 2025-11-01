import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

export default function CriancaProfileScreen() {
  const [diagnostico] = useState<string>('Não especificado');
  const [notaContar] = useState<string>('Ainda não fez');
  const [notaPalavras] = useState<string>('Ainda não fez');
  const [popup, setPopup] = useState<'contar' | 'palavras' | null>(null);
  const [totalAtividades] = useState<number>(0);
  const [modalDiagnostico, setModalDiagnostico] = useState(false);
  const [diagnosticoSelecionado, setDiagnosticoSelecionado] = useState<number | null>(null);
  const [anotacoes, setAnotacoes] = useState<string>('');
  const [modalAnotacoes, setModalAnotacoes] = useState(false);
  const [anotacoesTemp, setAnotacoesTemp] = useState<string>('');
  const router = useRouter();

  // Dados estáticos para exibição visual
  const crianca = {
    nome: 'Nome da Criança',
    idade: 8,
  };

  // Diagnosticos estáticos para o modal visual
  const diagnosticos = [
    { id: 1, tipo: 'Autismo de Nível 1' },
    { id: 2, tipo: 'Autismo de Nível 2' },
    { id: 3, tipo: 'Autismo de Nível 3' },
    { id: 4, tipo: 'Não especificado' },
  ];

  const atividades = [
    { id: 'contar', nome: 'Jogo de Contar', nota: notaContar },
  ];

  const acessarJogo = (tipo: 'contar' | 'palavras') => {
    setPopup(null);
    router.push(tipo === 'contar' ? '/jogoContagem' : '/jogoPalavra');
  };

  const atualizarDiagnostico = () => {
    setModalDiagnostico(false);
  };

  const abrirModalAnotacoes = () => {
    setAnotacoesTemp(anotacoes);
    setModalAnotacoes(true);
  };

  const salvarAnotacoes = () => {
    setAnotacoes(anotacoesTemp);
    setModalAnotacoes(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/TeacherProfileScreen')}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil da Criança</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 0, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Perfil */}
        <View style={styles.profileContainer}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: 'https://images.unsplash.com/photo-1560785496-3c9d27877182?ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&q=80&w=1074' }} style={styles.avatar} />
          </View>
          <Text style={styles.name}>{crianca.nome}</Text>
          <Text style={styles.age}>Idade: {crianca.idade} anos</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setModalDiagnostico(true)}
            >
              <Text style={styles.editText}>Editar Diagnóstico</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.deleteButtonTop}
              onPress={() => {
                router.push('/TeacherProfileScreen');
              }}
            >
              <Ionicons name="trash" size={18} color="#fff" />
              <Text style={styles.deleteButtonTextTop}>Deletar</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Painel de controle */}
        <View style={styles.panelContainer}>
          <Text style={styles.sectionTitle}>Progresso:</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{totalAtividades}</Text>
              <Text style={styles.statLabel}>Atividades Concluídas</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{diagnostico}</Text>
              <Text style={styles.statLabel}>Diagnóstico</Text>
            </View>
          </View>
        </View>

        {/* Anotações */}
        <View style={styles.infoContainer}>
          <Text style={styles.sectionTitle}>Anotações:</Text>
          <TouchableOpacity style={styles.infoItem} onPress={abrirModalAnotacoes}>
            <Ionicons name="document-text-outline" size={24} color="#E07612" />
            <View style={styles.infoTextContainer}>
              <Text style={styles.infoLabel}>Anotações sobre a criança</Text>
              <Text style={styles.infoText} numberOfLines={2}>
                {anotacoes || 'Clique para adicionar anotações...'}
              </Text>
            </View>
            <Ionicons name="pencil" size={20} color="#E07612" />
          </TouchableOpacity>
        </View>

        {/* Atividades */}
        <View style={styles.activitiesContainer}>
          <Text style={styles.sectionTitle}>Atividades:</Text>
          {atividades.map((atividade) => (
            <TouchableOpacity
              key={atividade.id}
              style={styles.activityItem}
              onPress={() => setPopup(atividade.id as 'contar' | 'palavras')}
            >
              <View style={styles.activityContent}>
                <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
                <View style={styles.activityInfo}>
                  <Text style={styles.activityTitle}>{atividade.nome}</Text>
                  <Text style={styles.activityNote}>Nota: {atividade.nota}</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#000" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Modal de Diagnóstico */}
      <Modal visible={modalDiagnostico} transparent animationType="fade" onRequestClose={() => setModalDiagnostico(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Selecione o Diagnóstico</Text>
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
                  <Text style={styles.optionText}>{item.tipo}</Text>
                </Pressable>
              )}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalDiagnostico(false)}
              >
                <Text style={[styles.modalButtonText, { color: '#E07612' }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={atualizarDiagnostico}
              >
                <Text style={[styles.modalButtonText, { color: 'white' }]}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Anotações */}
      <Modal visible={modalAnotacoes} transparent animationType="fade" onRequestClose={() => setModalAnotacoes(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Anotações sobre a criança</Text>
            <Text style={styles.modalSubtitle}>
              Escreva suas observações, notas ou comentários sobre a criança aqui.
            </Text>
            <TextInput
              style={styles.textInput}
              multiline
              numberOfLines={8}
              placeholder="Digite suas anotações aqui..."
              value={anotacoesTemp}
              onChangeText={setAnotacoesTemp}
              textAlignVertical="top"
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setModalAnotacoes(false)}
              >
                <Text style={[styles.modalButtonText, { color: '#E07612' }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={salvarAnotacoes}
              >
                <Text style={[styles.modalButtonText, { color: 'white' }]}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de Jogo */}
      <Modal visible={popup !== null} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {popup === 'contar' ? 'Jogo de Contar' : 'Jogo das Palavras'}
            </Text>
            <Text style={styles.modalSubtitle}>
              {popup === 'contar'
                ? 'Nesse jogo a criança deverá contar os elementos na tela e escolher a resposta correta.'
                : 'Nesse jogo a criança deverá adivinhar palavras com base em dicas visuais.'}
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setPopup(null)}
              >
                <Text style={[styles.modalButtonText, { color: '#E07612' }]}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={() => acessarJogo(popup!)}
              >
                <Text style={[styles.modalButtonText, { color: 'white' }]}>Acessar o jogo</Text>
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
