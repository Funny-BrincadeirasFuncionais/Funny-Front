import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, View } from 'react-native';

const ProfileScreen = () => {
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
          </View>
          <Text style={styles.name}>Nome da Criança</Text>
          <Text style={styles.age}>Idade: 8 anos</Text>
        </View>
      </LinearGradient>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Informações</Text>
        <View style={styles.infoList}>
          <View style={styles.infoItem}>
            <Ionicons name="medical-outline" size={24} color="#ff8c00" />
            <Text style={styles.infoText}>Diagnóstico: TDAH</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionsContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Progresso</Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressItem}>
              <Text style={styles.progressNumber}>75%</Text>
              <Text style={styles.progressLabel}>Progresso Geral</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Atividades</Text>
          <View style={styles.activitiesList}>
            <View style={styles.activityItem}>
              <Ionicons name="checkmark-circle" size={24} color="#4CAF50" />
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>Atividade 1</Text>
                <Text style={styles.activityDate}>Concluída - 90% de acerto</Text>
              </View>
            </View>
            <View style={styles.activityItem}>
              <Ionicons name="time-outline" size={24} color="#FFA500" />
              <View style={styles.activityInfo}>
                <Text style={styles.activityTitle}>Atividade 2</Text>
                <Text style={styles.activityDate}>Em andamento</Text>
              </View>
            </View>
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
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 15,
  },
  age: {
    fontSize: 18,
    color: 'white',
    marginTop: 5,
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  infoList: {
    gap: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  infoText: {
    fontSize: 16,
    color: '#34495e',
  },
  sectionsContainer: {
    padding: 15,
  },
  section: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  progressItem: {
    alignItems: 'center',
  },
  progressNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#ff8c00',
  },
  progressLabel: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
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
  activityInfo: {
    marginLeft: 15,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  activityDate: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
});

export default ProfileScreen; 