import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Colors } from '../constants/Colors';

export default function SobreScreen() {
  const router = useRouter();

  const handleBackPress = () => {
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color={Colors.light.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>SOBRE O FUNNY</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Card Principal - Sobre o Funny */}
        <View style={styles.mainCard}>
          <Text style={styles.mainTitle}>SOBRE O FUNNY</Text>
          
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>O QUE É O FUNNY?</Text>
            <Text style={styles.sectionText}>
              Funny é um aplicativo educativo criado especialmente para apoiar o aprendizado de crianças com Transtorno do Espectro Autista (TEA). Utilizando jogos estruturados, personagens cativantes e uma interface adaptativa, o app transforma o processo de alfabetização em uma jornada divertida, segura e inclusiva.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PARA QUEM FOI FEITO?</Text>
            <Text style={styles.sectionText}>
              O Funny foi desenvolvido pensando nas necessidades de crianças neurodivergentes, especialmente aquelas que estão em fase de alfabetização. Também é uma ferramenta de apoio para professores, terapeutas e familiares que desejam acompanhar de perto o desenvolvimento da criança.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>COMO FUNCIONA?</Text>
            <Text style={styles.sectionText}>
              O app oferece atividades interativas divididas em categorias como Português, Lógica, Números e Cotidiano. Todas as atividades são pensadas para estimular habilidades como atenção, memória, raciocínio lógico e linguagem, com instruções claras, feedback positivo e controle de estímulos sensoriais.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>METODOLOGIA PEDAGÓGICA</Text>
            <Text style={styles.sectionText}>
              Baseado em práticas reconhecidas como TEACCH e ABA, o Funny utiliza reforço positivo, histórias sociais e pictogramas para facilitar a compreensão e tornar o aprendizado mais acessível. O conteúdo é gradual, respeitando o tempo e o ritmo de cada criança.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AMBIENTE SEGURO E PERSONALIZÁVEL</Text>
            <Text style={styles.sectionText}>
              O aplicativo permite configurar sons, cores e níveis de estímulo para melhor atender às sensibilidades sensoriais de cada criança, criando um ambiente acolhedor e seguro para o aprendizado.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>APOIO AO EDUCADOR E À FAMÍLIA</Text>
            <Text style={styles.sectionText}>
              Com relatórios de desempenho e progresso individuais, o Funny facilita o acompanhamento pedagógico e terapêutico, promovendo uma comunicação mais efetiva entre professores, responsáveis e profissionais da saúde.
            </Text>
          </View>
        </View>

        {/* Cards de Tecnologias */}
        <View style={styles.techGrid}>
          <View style={styles.techCard}>
            <Text style={styles.techTitle}>TECNOLOGIAS</Text>
            <Text style={styles.techText}>• React Native</Text>
            <Text style={styles.techText}>• Expo</Text>
            <Text style={styles.techText}>• TypeScript</Text>
            <Text style={styles.techText}>• Expo Router</Text>
          </View>

          <View style={styles.techCard}>
            <Text style={styles.techTitle}>DESIGN</Text>
            <Text style={styles.techText}>• Fonte Lexend</Text>
            <Text style={styles.techText}>• Paleta Laranja</Text>
            <Text style={styles.techText}>• Interface Inclusiva</Text>
            <Text style={styles.techText}>• UX Adaptativo</Text>
          </View>
        </View>

        <View style={styles.techGrid}>
          <View style={styles.techCard}>
            <Text style={styles.techTitle}>RECURSOS</Text>
            <Text style={styles.techText}>• Gamificação</Text>
            <Text style={styles.techText}>• Relatórios</Text>
            <Text style={styles.techText}>• Personalização</Text>
            <Text style={styles.techText}>• Acessibilidade</Text>
          </View>

          <View style={styles.techCard}>
            <Text style={styles.techTitle}>METODOLOGIAS</Text>
            <Text style={styles.techText}>• TEACCH</Text>
            <Text style={styles.techText}>• ABA</Text>
            <Text style={styles.techText}>• Pictogramas</Text>
            <Text style={styles.techText}>• Histórias Sociais</Text>
          </View>
        </View>

        {/* Versão e Créditos */}
        <View style={styles.footerCard}>
          <Text style={styles.footerTitle}>FUNNY v1.0</Text>
          <Text style={styles.footerText}>
            Desenvolvido com 💙 para promover inclusão e aprendizado
          </Text>
          <Text style={styles.footerText}>
            © 2024 - Aplicativo Educativo Inclusivo
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 30,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.primary,
    fontFamily: 'Lexend_700Bold',
  },
  placeholder: {
    width: 34, // Mesmo tamanho do botão de voltar para centralizar o título
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  mainCard: {
    backgroundColor: Colors.light.primaryLight,
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.light.brownDark,
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'Lexend_700Bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.brownDark,
    marginBottom: 8,
    fontFamily: 'Lexend_700Bold',
  },
  sectionText: {
    fontSize: 14,
    color: Colors.light.brownDark,
    lineHeight: 20,
    textAlign: 'justify',
    fontFamily: 'Lexend_400Regular',
  },
  techGrid: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 15,
  },
  techCard: {
    flex: 1,
    backgroundColor: Colors.light.secondary,
    borderRadius: 15,
    padding: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  techTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.light.brownDark,
    marginBottom: 12,
    textAlign: 'center',
    fontFamily: 'Lexend_700Bold',
  },
  techText: {
    fontSize: 14,
    color: Colors.light.brownDark,
    marginBottom: 6,
    fontFamily: 'Lexend_400Regular',
  },
  footerCard: {
    backgroundColor: Colors.light.secondary,
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  footerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: Colors.light.brownDark,
    marginBottom: 10,
    fontFamily: 'Lexend_700Bold',
  },
  footerText: {
    fontSize: 14,
    color: Colors.light.brownDark,
    textAlign: 'center',
    marginBottom: 5,
    fontFamily: 'Lexend_400Regular',
  },
}); 
