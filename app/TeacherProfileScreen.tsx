import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const TeacherProfileScreen = () => {
  return (
    <ScrollView style={styles.container}>
      <LinearGradient
        colors={['#ffd700', '#ffa500', '#ff8c00']}
        style={styles.header}
      >
        <View style={styles.profileHeader}>
          <View style={styles.profileImageContainer}>
            <Image
              source={{ uri: 'https://via.placeholder.com/150' }}
              style={styles.profileImage}
            />
            <TouchableOpacity style={styles.editImageButton}>
              <Ionicons name="camera" size={20} color="white" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>Professor(a)</Text>
          <Text style={styles.username}>@usuarioprofessor</Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Editar Perfil</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={styles.secondaryButtonText}>Relatórios</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Painel de Controle</Text>
        <View style={styles.dashboardGrid}>
          <View style={styles.dashboardItem}>
            <Ionicons name="people" size={24} color="#ff8c00" />
            <Text style={styles.dashboardNumber}>12</Text>
            <Text style={styles.dashboardLabel}>Alunos Ativos</Text>
          </View>
          <View style={styles.dashboardItem}>
            <Ionicons name="book" size={24} color="#ff8c00" />
            <Text style={styles.dashboardNumber}>45</Text>
            <Text style={styles.dashboardLabel}>Atividades</Text>
          </View>
          <View style={styles.dashboardItem}>
            <Ionicons name="trending-up" size={24} color="#ff8c00" />
            <Text style={styles.dashboardNumber}>78%</Text>
            <Text style={styles.dashboardLabel}>Média de Progresso</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Meus Alunos</Text>
          <TouchableOpacity style={styles.addButton}>
            <Ionicons name="add-circle" size={24} color="#ff8c00" />
          </TouchableOpacity>
        </View>
        <View style={styles.studentsList}>
          <View style={styles.studentCard}>
            <Image
              source={{ uri: 'https://via.placeholder.com/50' }}
              style={styles.studentAvatar}
            />
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>Aluno 1</Text>
              <Text style={styles.studentLevel}>Nível: Intermediário</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '75%' }]} />
              </View>
            </View>
            <TouchableOpacity style={styles.studentButton}>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <View style={styles.studentCard}>
            <Image
              source={{ uri: 'https://via.placeholder.com/50' }}
              style={styles.studentAvatar}
            />
            <View style={styles.studentInfo}>
              <Text style={styles.studentName}>Aluno 2</Text>
              <Text style={styles.studentLevel}>Nível: Iniciante</Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: '45%' }]} />
              </View>
            </View>
            <TouchableOpacity style={styles.studentButton}>
              <Ionicons name="chevron-forward" size={24} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Atividades Recentes</Text>
        <View style={styles.activitiesList}>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Ionicons name="create" size={24} color="#4CAF50" />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Nova Atividade Criada</Text>
              <Text style={styles.activityDate}>Reconhecimento de Vogais</Text>
              <Text style={styles.activityStatus}>5 alunos completaram</Text>
            </View>
          </View>
          <View style={styles.activityItem}>
            <View style={styles.activityIcon}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
            </View>
            <View style={styles.activityInfo}>
              <Text style={styles.activityTitle}>Atividade Avaliada</Text>
              <Text style={styles.activityDate}>Formação de Palavras</Text>
              <Text style={styles.activityStatus}>Média: 85% de acerto</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Próximas Ações</Text>
        <View style={styles.tasksList}>
          <View style={styles.taskItem}>
            <Ionicons name="alert-circle" size={24} color="#ff8c00" />
            <Text style={styles.taskText}>Avaliar progresso de 3 alunos</Text>
          </View>
          <View style={styles.taskItem}>
            <Ionicons name="calendar" size={24} color="#ff8c00" />
            <Text style={styles.taskText}>Planejar atividades da próxima semana</Text>
          </View>
          <View style={styles.taskItem}>
            <Ionicons name="mail" size={24} color="#ff8c00" />
            <Text style={styles.taskText}>Enviar relatórios aos responsáveis</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f6fa',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
  },
  profileHeader: {
    alignItems: 'center',
  },
  profileImageContainer: {
    position: 'relative',
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: 'white',
  },
  editImageButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#ff8c00',
    padding: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 15,
  },
  username: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    gap: 10,
  },
  primaryButton: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  primaryButtonText: {
    color: '#ff8c00',
    fontWeight: 'bold',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  secondaryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  infoSection: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  section: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  dashboardGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
  },
  dashboardItem: {
    alignItems: 'center',
  },
  dashboardNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ff8c00',
    marginTop: 5,
  },
  dashboardLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addButton: {
    padding: 5,
  },
  studentsList: {
    gap: 15,
  },
  studentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
  },
  studentAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  studentInfo: {
    flex: 1,
    marginLeft: 15,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  studentLevel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#ff8c00',
    borderRadius: 2,
  },
  studentButton: {
    padding: 5,
  },
  activitiesList: {
    gap: 15,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#e8f5e9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activityInfo: {
    flex: 1,
    marginLeft: 15,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  activityDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  activityStatus: {
    fontSize: 12,
    color: '#4CAF50',
    marginTop: 2,
  },
  tasksList: {
    gap: 15,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 10,
  },
  taskText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 15,
  },
});

export default TeacherProfileScreen; 