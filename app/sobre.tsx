import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import { useAccessibility } from '../context/AccessibilityContext';

export default function SobreScreen() {
  const router = useRouter();
  const { transformText } = useAccessibility();

  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={handleBackPress}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{transformText('Sobre o Funny')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Introdução */}
        <View style={styles.introContainer}>
          <View style={styles.logoContainer}>
            <Ionicons name="school" size={64} color={Colors.light.primary} />
          </View>
          <Text style={styles.introTitle}>{transformText('Sobre o Funny')}</Text>
          <Text style={styles.introDescription}>
            {transformText('Um aplicativo educativo inclusivo criado especialmente para apoiar o aprendizado de crianças com Transtorno do Espectro Autista (TEA).')}
          </Text>
        </View>

        {/* Cards de Informações */}
        <View style={styles.infoCardsContainer}>
          <View style={styles.infoCard}>
            <View style={styles.cardIcon}>
              <Ionicons name="people" size={32} color={Colors.light.primary} />
            </View>
            <Text style={styles.cardTitle}>{transformText('Para Quem Foi Feito')}</Text>
            <Text style={styles.cardDescription}>
              {transformText('Crianças neurodivergentes em fase de alfabetização, professores, terapeutas e familiares que desejam acompanhar o desenvolvimento da criança.')}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.cardIcon}>
              <Ionicons name="game-controller" size={32} color={Colors.light.primary} />
            </View>
            <Text style={styles.cardTitle}>{transformText('Como Funciona')}</Text>
            <Text style={styles.cardDescription}>
              {transformText('Atividades interativas em categorias como Português, Lógica, Números e Cotidiano, com instruções claras e feedback positivo.')}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.cardIcon}>
              <Ionicons name="library" size={32} color={Colors.light.primary} />
            </View>
            <Text style={styles.cardTitle}>{transformText('Metodologia')}</Text>
            <Text style={styles.cardDescription}>
              {transformText('Baseado em práticas TEACCH e ABA, utiliza reforço positivo, histórias sociais e pictogramas para facilitar o aprendizado.')}
            </Text>
          </View>

          <View style={styles.infoCard}>
            <View style={styles.cardIcon}>
              <Ionicons name="settings" size={32} color={Colors.light.primary} />
            </View>
            <Text style={styles.cardTitle}>{transformText('Personalização')}</Text>
            <Text style={styles.cardDescription}>
              {transformText('Ambiente seguro e personalizável com configurações de sons, cores e níveis de estímulo sensorial.')}
            </Text>
          </View>
        </View>

        <View style={styles.techSection}>
          <Text style={styles.sectionTitle}>{transformText('Tecnologias e Recursos')}</Text>
          
          <View style={styles.techGrid}>
            <View style={styles.techCard}>
              <View style={styles.techIcon}>
                <Ionicons name="code-slash" size={24} color={Colors.light.primary} />
              </View>
              <Text style={styles.techTitle}>{transformText('Tecnologias')}</Text>
              <Text style={styles.techText}>{transformText('React Native • Expo • TypeScript • Expo Router')}</Text>
            </View>

            <View style={styles.techCard}>
              <View style={styles.techIcon}>
                <Ionicons name="color-palette" size={24} color={Colors.light.primary} />
              </View>
              <Text style={styles.techTitle}>{transformText('Design')}</Text>
              <Text style={styles.techText}>{transformText('Fonte Lexend • Interface Inclusiva • UX Adaptativo')}</Text>
            </View>

            <View style={styles.techCard}>
              <View style={styles.techIcon}>
                <Ionicons name="star" size={24} color={Colors.light.primary} />
              </View>
              <Text style={styles.techTitle}>{transformText('Recursos')}</Text>
              <Text style={styles.techText}>{transformText('Gamificação • Relatórios • Personalização • Acessibilidade')}</Text>
            </View>

            <View style={styles.techCard}>
              <View style={styles.techIcon}>
                <Ionicons name="book" size={24} color={Colors.light.primary} />
              </View>
              <Text style={styles.techTitle}>{transformText('Metodologias')}</Text>
              <Text style={styles.techText}>{transformText('TEACCH • ABA • Pictogramas • Histórias Sociais')}</Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footerContainer}>
          <View style={styles.footerCard}>
            <Text style={styles.footerTitle}>{transformText('Funny v1.0')}</Text>
            <Text style={styles.footerText}>
              {transformText('Desenvolvido com 💙 para promover inclusão e aprendizado')}
            </Text>
            <Text style={styles.footerText}>
              {transformText('© 2025 - Aplicativo Educativo Inclusivo')}
            </Text>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 15,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    fontFamily: 'Lexend_700Bold',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  introContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 16,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 12,
    fontFamily: 'Lexend_700Bold',
  },
  introDescription: {
    fontSize: 16,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    fontFamily: 'Lexend_400Regular',
  },
  infoCardsContainer: {
    marginBottom: 32,
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.light.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    fontFamily: 'Lexend_600SemiBold',
  },
  cardDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
    fontFamily: 'Lexend_400Regular',
  },
  techSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
    fontFamily: 'Lexend_700Bold',
  },
  techGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  techCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  techIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.light.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  techTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'Lexend_600SemiBold',
  },
  techText: {
    fontSize: 12,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    lineHeight: 16,
    fontFamily: 'Lexend_400Regular',
  },
  footerContainer: {
    paddingBottom: 32,
  },
  footerCard: {
    backgroundColor: Colors.light.primary + '10',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.light.primary + '20',
  },
  footerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.primary,
    marginBottom: 12,
    fontFamily: 'Lexend_700Bold',
  },
  footerText: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: 6,
    fontFamily: 'Lexend_400Regular',
  },
}); 
