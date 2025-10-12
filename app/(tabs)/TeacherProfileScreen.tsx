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
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/Colors';

export default function ProfessorScreen() {
  const router = useRouter();

  const [reportType, setReportType] = useState<'Turma' | 'Aluno' | null>(null);
  const [showSelect, setShowSelect] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  const turmas = ['Turma 1', 'Turma 2', 'Turma 3', 'Turma 4', 'Turma 5'];
  const alunos = ['Aluno 1', 'Aluno 2', 'Aluno 3', 'Aluno 4', 'Aluno 5'];

  const handleSelectType = (type: 'Turma' | 'Aluno') => {
    setReportType(type);
    setShowSelect(false);
    setShowDialog(true);
  };

  const handleEmitir = () => {
    setShowDialog(false);
    console.log(`Emitindo relatório de ${reportType}: ${selectedItem}`);
    // aqui pode ir para outra tela futuramente
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Professor</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 0, flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* Perfil */}
        <View style={styles.profileContainer}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: 'https://i.pravatar.cc/300' }} style={styles.avatar} />
          </View>
          <Text style={styles.name}>Nome e Sobrenome</Text>
          <Text style={styles.email}>email@gmail.com</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => router.push('/EditarPerfilScreen')}
            >
              <Text style={styles.editText}>Editar Perfil</Text>
            </TouchableOpacity>

            {/* Select de relatório */}
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                style={styles.reportButton}
                onPress={() => setShowSelect(!showSelect)}
              >
                <Text style={styles.reportText}>Gerar relatório</Text>
                <Ionicons name="chevron-down" size={16} color="white" style={{ marginLeft: 4 }} />
              </TouchableOpacity>

              {showSelect && (
                <View style={styles.dropdown}>
                  <Pressable onPress={() => handleSelectType('Turma')} style={styles.dropdownItem}>
                    <Text style={styles.dropdownText}>Turma</Text>
                  </Pressable>
                  <Pressable onPress={() => handleSelectType('Aluno')} style={styles.dropdownItem}>
                    <Text style={styles.dropdownText}>Aluno</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* Painel de controle */}
        <View style={styles.panelContainer}>
          <Text style={styles.sectionTitle}>Painel de controle:</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>0</Text>
              <Text style={styles.statLabel}>Alunos Ativos</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>0%</Text>
              <Text style={styles.statLabel}>Média de Progresso</Text>
            </View>
          </View>
        </View>

        {/* Minhas turmas */}
        <View style={styles.classesContainer}>
          <Text style={styles.sectionTitle}>Minhas Turmas:</Text>
          {turmas.map((turma, index) => (
            <TouchableOpacity key={index} style={styles.classItem}>
              <Text style={styles.classText}>{turma}</Text>
              <Ionicons name="chevron-forward" size={20} color="#000" />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Modal de seleção */}
      <Modal visible={showDialog} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {reportType === 'Turma' ? 'Selecione a turma' : 'Selecione o aluno'}
            </Text>
            <Text style={styles.modalSubtitle}>
              Escolha alguma das opções abaixo para seguir com a emissão do relatório
            </Text>

            <FlatList
              data={reportType === 'Turma' ? turmas : alunos}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => setSelectedItem(item)}
                  style={[
                    styles.optionItem,
                    selectedItem === item && { backgroundColor: '#FBE8D4' },
                  ]}
                >
                  <Text style={styles.optionText}>{item}</Text>
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
