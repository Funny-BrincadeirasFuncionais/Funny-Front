import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';

interface AccessibilityOption {
  id: string;
  title: string;
  description: string;
  icon: string;
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
}

export default function AcessibilidadeScreen() {
  const router = useRouter();

  const [acessibilidadeOptions, setAcessibilidadeOptions] = useState<AccessibilityOption[]>([
    {
      id: 'letras_maiusculas',
      title: 'Letras em Caixa-Alta',
      description: 'Exibe todo o texto do aplicativo em LETRAS MAIÚSCULAS para melhor legibilidade',
      icon: 'text',
      enabled: false,
      onToggle: (enabled: boolean) => {
        setAcessibilidadeOptions(prev => 
          prev.map(option => 
            option.id === 'letras_maiusculas' 
              ? { ...option, enabled }
              : option
          )
        );
      }
    },
    {
      id: 'baixa_saturacao',
      title: 'Baixa Saturação',
      description: 'Reduz a intensidade das cores para reduzir estímulos visuais excessivos',
      icon: 'color-palette',
      enabled: false,
      onToggle: (enabled: boolean) => {
        setAcessibilidadeOptions(prev => 
          prev.map(option => 
            option.id === 'baixa_saturacao' 
              ? { ...option, enabled }
              : option
          )
        );
      }
    },
    {
      id: 'animacoes_reduzidas',
      title: 'Animações Reduzidas',
      description: 'Diminui ou remove animações para reduzir distrações e melhorar o foco',
      icon: 'pause-circle',
      enabled: false,
      onToggle: (enabled: boolean) => {
        setAcessibilidadeOptions(prev => 
          prev.map(option => 
            option.id === 'animacoes_reduzidas' 
              ? { ...option, enabled }
              : option
          )
        );
      }
    }
  ]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.light.background} />

      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Acessibilidade</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.introContainer}>
          <Ionicons name="accessibility" size={48} color={Colors.light.primary} />
          <Text style={styles.introTitle}>Configurações de Acessibilidade</Text>
        </View>

        <View style={styles.optionsContainer}>
          {acessibilidadeOptions.map((option, index) => (
            <View key={option.id}>
              <View style={styles.optionItem}>
                <View style={styles.optionLeft}>
                  <View style={styles.iconContainer}>
                    <Ionicons name={option.icon as any} size={24} color={Colors.light.primary} />
                  </View>
                  <View style={styles.optionTextContainer}>
                    <Text style={styles.optionTitle}>{option.title}</Text>
                    <Text style={styles.optionDescription}>{option.description}</Text>
                  </View>
                </View>
                <Switch
                  value={option.enabled}
                  onValueChange={option.onToggle}
                  trackColor={{ false: '#E0E0E0', true: Colors.light.primary + '40' }}
                  thumbColor={option.enabled ? Colors.light.primary : '#F4F3F4'}
                  ios_backgroundColor="#E0E0E0"
                />
              </View>
              {index < acessibilidadeOptions.length - 1 && <View style={styles.separator} />}
            </View>
          ))}
        </View>

        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Ionicons name="information-circle" size={20} color={Colors.light.primary} />
            <Text style={styles.infoText}>
              As configurações serão aplicadas imediatamente em todo o aplicativo
            </Text>
          </View>
          <View style={styles.infoItem}>
            <Ionicons name="heart" size={20} color="#FF6B6B" />
            <Text style={styles.infoText}>
              Essas opções foram pensadas especialmente para crianças com TEA e outras necessidades especiais
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
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginTop: 16,
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
  optionsContainer: {
    backgroundColor: 'white',
    marginBottom: 24,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.light.primary + '15',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
    fontFamily: 'Lexend_600SemiBold',
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.light.textSecondary,
    lineHeight: 20,
    fontFamily: 'Lexend_400Regular',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginLeft: 80,
  },
  resetButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    paddingVertical: 16,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  resetButtonText: {
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
    fontFamily: 'Lexend_400Regular',
  },
  infoContainer: {
    paddingBottom: 32,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: Colors.light.textSecondary,
    marginLeft: 12,
    lineHeight: 20,
    fontFamily: 'Lexend_400Regular',
  },
});
