import React from 'react';
import { ThemedText } from '@/components/ThemedText';
import { MaterialIcons } from '@expo/vector-icons';
import { useEffect, useState, useCallback } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, TextInput, Modal, View, ActivityIndicator, ScrollView, RefreshControl } from 'react-native';
import { criancaService, atividadeService, diagnosticoService } from '../services/gerenciamento';
import type { Crianca, Atividade, Diagnostico } from '../services/types';
import { useAuth } from '../contexts/auth'; // Make sure this path is correct

export default function GerenciamentoScreen() {
  const { user } = useAuth();

  const [criancas, setCriancas] = useState<Crianca[]>([]);
  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [diagnosticos, setDiagnosticos] = useState<Diagnostico[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [modalCrianca, setModalCrianca] = useState(false);
  const [modalAtividade, setModalAtividade] = useState(false);
  const [modalDiagnostico, setModalDiagnostico] = useState(false);
  const [criancaEdit, setCriancaEdit] = useState<Crianca>({ nome: '', idade: 0, responsavelId: user?.id || 0 });
  const [atividadeEdit, setAtividadeEdit] = useState<Atividade>({ titulo: '', descricao: '', categoria: '', nivelDificuldade: 1 });
  const [diagnosticoEdit, setDiagnosticoEdit] = useState<Diagnostico>({ tipo: '', criancaId: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const carregarDados = useCallback(async () => {
    try {
      setIsLoading(true);
      const [criancasData, atividadesData, diagnosticosData] = await Promise.all([
        criancaService.listar(),
        atividadeService.listar(),
        diagnosticoService.listar()
      ]);
      setCriancas(criancasData);
      setAtividades(atividadesData);
      setDiagnosticos(diagnosticosData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      Alert.alert('Erro', 'Não foi possível carregar os dados. Por favor, tente novamente.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    carregarDados();
  }, [carregarDados]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  const salvarCrianca = async () => {
    if (!criancaEdit.nome || !criancaEdit.idade) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    try {
      setIsSaving(true);
      console.log('Tentando criar criança com dados:', criancaEdit);
      if (criancaEdit.id) {
        await criancaService.atualizar(criancaEdit.id, criancaEdit);
      } else {
        await criancaService.criar(criancaEdit);
      }
      await carregarDados();
      setModalCrianca(false);
      setCriancaEdit({ nome: '', idade: 0, responsavelId: user?.id || 0 });
    } catch (error: any) {
      console.error('Erro ao salvar criança:', error);
      if (error.response?.data) {
        console.error('Detalhes do erro:', error.response.data);
      }
      Alert.alert('Erro', 'Não foi possível salvar a criança. Por favor, tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const salvarAtividade = async () => {
    if (!atividadeEdit.titulo || !atividadeEdit.descricao || !atividadeEdit.categoria || !atividadeEdit.nivelDificuldade) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    try {
      setIsSaving(true);
      if (atividadeEdit.id) {
        await atividadeService.atualizar(atividadeEdit.id, atividadeEdit);
      } else {
        await atividadeService.criar(atividadeEdit);
      }
      await carregarDados();
      setModalAtividade(false);
      setAtividadeEdit({ titulo: '', descricao: '', categoria: '', nivelDificuldade: 1 });
    } catch (error) {
      console.error('Erro ao salvar atividade:', error);
      Alert.alert('Erro', 'Não foi possível salvar a atividade. Por favor, tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const salvarDiagnostico = async () => {
    if (!diagnosticoEdit.tipo || !diagnosticoEdit.criancaId) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos e selecione uma criança.');
      return;
    }

    try {
      setIsSaving(true);
      if (diagnosticoEdit.id) {
        await diagnosticoService.atualizar(diagnosticoEdit.id, diagnosticoEdit);
      } else {
        await diagnosticoService.criar(diagnosticoEdit);
      }
      await carregarDados();
      setModalDiagnostico(false);
      setDiagnosticoEdit({ tipo: '', criancaId: 0 });
    } catch (error) {
      console.error('Erro ao salvar diagnóstico:', error);
      Alert.alert('Erro', 'Não foi possível salvar o diagnóstico. Por favor, tente novamente.');
    } finally {
      setIsSaving(false);
    }
  };

  const excluirCrianca = async (id: number) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir esta criança?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSaving(true);
              await criancaService.excluir(id);
              await carregarDados();
            } catch (error) {
              console.error('Erro ao excluir criança:', error);
              Alert.alert('Erro', 'Não foi possível excluir a criança. Por favor, tente novamente.');
            } finally {
              setIsSaving(false);
            }
          }
        }
      ]
    );
  };

  const excluirAtividade = async (id: number) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir esta atividade?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSaving(true);
              await atividadeService.excluir(id);
              await carregarDados();
            } catch (error) {
              console.error('Erro ao excluir atividade:', error);
              Alert.alert('Erro', 'Não foi possível excluir a atividade. Por favor, tente novamente.');
            } finally {
              setIsSaving(false);
            }
          }
        }
      ]
    );
  };

  const excluirDiagnostico = async (id: number) => {
    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este diagnóstico?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsSaving(true);
              await diagnosticoService.excluir(id);
              await carregarDados();
            } catch (error) {
              console.error('Erro ao excluir diagnóstico:', error);
              Alert.alert('Erro', 'Não foi possível excluir o diagnóstico. Por favor, tente novamente.');
            } finally {
              setIsSaving(false);
            }
          }
        }
      ]
    );
  };

  const renderSection = (title: string, data: any[], onAdd: () => void, renderItem: any) => (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
        <Pressable 
          onPress={onAdd}
          style={({ pressed }) => [
            styles.addButton,
            pressed && { opacity: 0.7 }
          ]} 
        >
          <MaterialIcons name="add" size={24} color="#FFFFFF" />
        </Pressable>
      </View>
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        scrollEnabled={false}
        ListEmptyComponent={() => (
          <View style={styles.emptyList}>
            <ThemedText style={styles.emptyText}>Nenhum item encontrado</ThemedText>
          </View>
        )}
      />
    </View>
  );

  const renderCriancaItem = ({ item }: { item: Crianca }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <ThemedText style={styles.cardTitle}>{item.nome}</ThemedText>
        <View style={styles.cardActions}>
          <Pressable 
            style={({ pressed }) => [
              styles.actionButton,
              pressed && { opacity: 0.7 }
            ]} 
            onPress={() => {
              setCriancaEdit(item);
              setModalCrianca(true);
            }}
          >
            <MaterialIcons name="edit" size={24} color="#4D81E7" />
          </Pressable>
          <Pressable 
            style={({ pressed }) => [
              styles.actionButton,
              pressed && { opacity: 0.7 }
            ]} 
            onPress={() => excluirCrianca(item.id!)}
          >
            <MaterialIcons name="delete" size={24} color="#EF4444" />
          </Pressable>
        </View>
      </View>
      <ThemedText style={styles.cardText}>Idade: {item.idade} anos</ThemedText>
    </View>
  );

  const renderAtividadeItem = ({ item }: { item: Atividade }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <ThemedText style={styles.cardTitle}>{item.titulo}</ThemedText>
        <View style={styles.cardActions}>
          <Pressable 
            style={({ pressed }) => [
              styles.actionButton,
              pressed && { opacity: 0.7 }
            ]} 
            onPress={() => {
              setAtividadeEdit(item);
              setModalAtividade(true);
            }}
          >
            <MaterialIcons name="edit" size={24} color="#4D81E7" />
          </Pressable>
          <Pressable 
            style={({ pressed }) => [
              styles.actionButton,
              pressed && { opacity: 0.7 }
            ]} 
            onPress={() => excluirAtividade(item.id!)}
          >
            <MaterialIcons name="delete" size={24} color="#EF4444" />
          </Pressable>
        </View>
      </View>
      <ThemedText style={styles.cardText}>Categoria: {item.categoria}</ThemedText>
      <ThemedText style={styles.cardText}>Nível de Dificuldade: {item.nivelDificuldade}</ThemedText>
      <ThemedText style={styles.cardText}>Descrição: {item.descricao}</ThemedText>
    </View>
  );

  const renderDiagnosticoItem = ({ item }: { item: Diagnostico }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <ThemedText style={styles.cardTitle}>{item.tipo}</ThemedText>
        <View style={styles.cardActions}>
          <Pressable 
            style={({ pressed }) => [
              styles.actionButton,
              pressed && { opacity: 0.7 }
            ]} 
            onPress={() => {
              setDiagnosticoEdit(item);
              setModalDiagnostico(true);
            }}
          >
            <MaterialIcons name="edit" size={24} color="#4D81E7" />
          </Pressable>
          <Pressable 
            style={({ pressed }) => [
              styles.actionButton,
              pressed && { opacity: 0.7 }
            ]} 
            onPress={() => excluirDiagnostico(item.id!)}
          >
            <MaterialIcons name="delete" size={24} color="#EF4444" />
          </Pressable>
        </View>
      </View>
      <ThemedText style={styles.cardText}>Criança: {criancas.find(c => c.id === item.criancaId)?.nome || 'Não encontrada'}</ThemedText>
    </View>
  );

  const fecharModalCrianca = () => {
    if (criancaEdit.nome || criancaEdit.idade) {
      Alert.alert(
        'Descartar alterações',
        'Tem certeza que deseja sair sem salvar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sair',
            style: 'destructive',
            onPress: () => {
              setModalCrianca(false);
              setCriancaEdit({ nome: '', idade: 0, responsavelId: user?.id || 0 });
            }
          }
        ]
      );
    } else {
      setModalCrianca(false);
      setCriancaEdit({ nome: '', idade: 0, responsavelId: user?.id || 0 });
    }
  };

  const fecharModalAtividade = () => {
    if (atividadeEdit.titulo || atividadeEdit.descricao || atividadeEdit.categoria || atividadeEdit.nivelDificuldade !== 1) {
      Alert.alert(
        'Descartar alterações',
        'Tem certeza que deseja sair sem salvar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sair',
            style: 'destructive',
            onPress: () => {
              setModalAtividade(false);
              setAtividadeEdit({ titulo: '', descricao: '', categoria: '', nivelDificuldade: 1 });
            }
          }
        ]
      );
    } else {
      setModalAtividade(false);
      setAtividadeEdit({ titulo: '', descricao: '', categoria: '', nivelDificuldade: 1 });
    }
  };

  const fecharModalDiagnostico = () => {
    if (diagnosticoEdit.tipo || diagnosticoEdit.criancaId) {
      Alert.alert(
        'Descartar alterações',
        'Tem certeza que deseja sair sem salvar?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Sair',
            style: 'destructive',
            onPress: () => {
              setModalDiagnostico(false);
              setDiagnosticoEdit({ tipo: '', criancaId: 0 });
            }
          }
        ]
      );
    } else {
      setModalDiagnostico(false);
      setDiagnosticoEdit({ tipo: '', criancaId: 0 });
    }
  };

  const renderModalCrianca = () => (
    <Modal
      visible={modalCrianca}
      animationType="slide"
      transparent={true}
      onRequestClose={fecharModalCrianca}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ThemedText style={styles.modalTitle}>
            {criancaEdit.id ? 'Editar Criança' : 'Nova Criança'}
          </ThemedText>
          
          <TextInput
            style={[
              styles.input,
              isSaving && styles.inputDisabled
            ]}
            placeholder="Nome da criança"
            value={criancaEdit.nome}
            onChangeText={(text) => setCriancaEdit({ ...criancaEdit, nome: text })}
            editable={!isSaving}
          />
          
          <TextInput
            style={[
              styles.input,
              isSaving && styles.inputDisabled
            ]}
            placeholder="Idade"
            value={criancaEdit.idade?.toString()}
            keyboardType="numeric"
            onChangeText={(text) => setCriancaEdit({ ...criancaEdit, idade: parseInt(text) || 0 })}
            editable={!isSaving}
          />

          <View style={styles.modalButtons}>
            <Pressable
              style={[
                styles.button,
                styles.buttonCancel,
                isSaving && styles.buttonDisabled
              ]}
              onPress={fecharModalCrianca}
              disabled={isSaving}
            >
              <ThemedText style={styles.buttonText}>Cancelar</ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.button,
                styles.buttonSave,
                isSaving && styles.buttonDisabled
              ]}
              onPress={salvarCrianca}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <ThemedText style={styles.buttonText}>Salvar</ThemedText>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderModalAtividade = () => (
    <Modal
      visible={modalAtividade}
      animationType="slide"
      transparent={true}
      onRequestClose={fecharModalAtividade}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ThemedText style={styles.modalTitle}>
            {atividadeEdit.id ? 'Editar Atividade' : 'Nova Atividade'}
          </ThemedText>
          
          <TextInput
            style={[
              styles.input,
              isSaving && styles.inputDisabled
            ]}
            placeholder="Título"
            value={atividadeEdit.titulo}
            onChangeText={(text) => setAtividadeEdit({ ...atividadeEdit, titulo: text })}
            editable={!isSaving}
          />
          
          <TextInput
            style={[
              styles.input,
              isSaving && styles.inputDisabled
            ]}
            placeholder="Descrição"
            value={atividadeEdit.descricao}
            multiline
            numberOfLines={3}
            onChangeText={(text) => setAtividadeEdit({ ...atividadeEdit, descricao: text })}
            editable={!isSaving}
          />

          <TextInput
            style={[
              styles.input,
              isSaving && styles.inputDisabled
            ]}
            placeholder="Categoria"
            value={atividadeEdit.categoria}
            onChangeText={(text) => setAtividadeEdit({ ...atividadeEdit, categoria: text })}
            editable={!isSaving}
          />

          <TextInput
            style={[
              styles.input,
              isSaving && styles.inputDisabled
            ]}
            placeholder="Nível de Dificuldade (1-5)"
            value={atividadeEdit.nivelDificuldade?.toString()}
            keyboardType="numeric"
            onChangeText={(text) => {
              const nivel = parseInt(text) || 1;
              setAtividadeEdit({ ...atividadeEdit, nivelDificuldade: Math.min(Math.max(nivel, 1), 5) });
            }}
            editable={!isSaving}
          />

          <View style={styles.modalButtons}>
            <Pressable
              style={[
                styles.button,
                styles.buttonCancel,
                isSaving && styles.buttonDisabled
              ]}
              onPress={fecharModalAtividade}
              disabled={isSaving}
            >
              <ThemedText style={styles.buttonText}>Cancelar</ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.button,
                styles.buttonSave,
                isSaving && styles.buttonDisabled
              ]}
              onPress={salvarAtividade}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <ThemedText style={styles.buttonText}>Salvar</ThemedText>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderModalDiagnostico = () => (
    <Modal
      visible={modalDiagnostico}
      animationType="slide"
      transparent={true}
      onRequestClose={fecharModalDiagnostico}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <ThemedText style={styles.modalTitle}>
            {diagnosticoEdit.id ? 'Editar Diagnóstico' : 'Novo Diagnóstico'}
          </ThemedText>
          
          <TextInput
            style={[
              styles.input,
              isSaving && styles.inputDisabled
            ]}
            placeholder="Tipo do diagnóstico"
            value={diagnosticoEdit.tipo}
            onChangeText={(text) => setDiagnosticoEdit({ ...diagnosticoEdit, tipo: text })}
            editable={!isSaving}
          />

          <View style={styles.selectContainer}>
            <ThemedText style={styles.selectLabel}>Selecione a criança:</ThemedText>
            <FlatList
              data={criancas}
              horizontal
              showsHorizontalScrollIndicator={false}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              renderItem={({ item }) => (
                <Pressable
                  style={[
                    styles.childOption,
                    diagnosticoEdit.criancaId === item.id && styles.childOptionSelected,
                    isSaving && styles.buttonDisabled
                  ]}
                  onPress={() => setDiagnosticoEdit({ ...diagnosticoEdit, criancaId: item.id! })}
                  disabled={isSaving}
                >
                  <ThemedText style={[
                    styles.childOptionText,
                    diagnosticoEdit.criancaId === item.id && styles.childOptionTextSelected
                  ]}>
                    {item.nome}
                  </ThemedText>
                </Pressable>
              )}
              ListEmptyComponent={() => (
                <ThemedText style={styles.emptyText}>
                  Nenhuma criança cadastrada
                </ThemedText>
              )}
            />
          </View>

          <View style={styles.modalButtons}>
            <Pressable
              style={[
                styles.button,
                styles.buttonCancel,
                isSaving && styles.buttonDisabled
              ]}
              onPress={fecharModalDiagnostico}
              disabled={isSaving}
            >
              <ThemedText style={styles.buttonText}>Cancelar</ThemedText>
            </Pressable>
            <Pressable
              style={[
                styles.button,
                styles.buttonSave,
                isSaving && styles.buttonDisabled
              ]}
              onPress={salvarDiagnostico}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <ThemedText style={styles.buttonText}>Salvar</ThemedText>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4D81E7" />
        <ThemedText style={styles.loadingText}>Carregando...</ThemedText>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#4D81E7']}
          tintColor="#4D81E7"
        />
      }
    >
      {renderSection('Crianças', criancas, () => {
        setCriancaEdit({ nome: '', idade: 0, responsavelId: user?.id || 0 });
        setModalCrianca(true);
      }, renderCriancaItem)}

      {renderSection('Diagnósticos', diagnosticos, () => {
        setDiagnosticoEdit({ tipo: '', criancaId: 0 });
        setModalDiagnostico(true);
      }, renderDiagnosticoItem)}

      {renderSection('Atividades', atividades, () => {
        setAtividadeEdit({ titulo: '', descricao: '', categoria: '', nivelDificuldade: 1 });
        setModalAtividade(true);
      }, renderAtividadeItem)}

      {renderModalCrianca()}
      {renderModalDiagnostico()}
      {renderModalAtividade()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFFFF',
  },
  section: {
    marginBottom: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
  },
  addButton: {
    backgroundColor: '#4D81E7',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
    flex: 1,
  },
  cardText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 4,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxWidth: 500,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#111827',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  inputDisabled: {
    backgroundColor: '#F3F4F6',
    color: '#6B7280',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 24,
  },
  button: {
    flex: 1,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  buttonCancel: {
    backgroundColor: '#EF4444',
  },
  buttonSave: {
    backgroundColor: '#4D81E7',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4D81E7',
  },
  emptyList: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
  },
  selectContainer: {
    marginBottom: 16,
  },
  selectLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  childOption: {
    backgroundColor: '#F3F4F6',
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  childOptionSelected: {
    backgroundColor: '#4D81E7',
  },
  childOptionText: {
    fontSize: 14,
    color: '#374151',
  },
  childOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
}); 