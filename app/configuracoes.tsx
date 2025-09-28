import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';

const LOGOFF_COLOR = '#ff4444';

export default function ConfiguracoesScreen() {
  const [searchText, setSearchText] = useState('');
  const router = useRouter();

  const configuracoes = [
    {
      id: 'conta',
      title: 'Conta',
      icon: 'person',
      onPress: () => {}
    },
    {
      id: 'acessibilidade',
      title: 'Acessibilidade',
      icon: 'accessibility',
      onPress: () => {
        router.push('/acessibilidade');
      }
    },
    {
      id: 'alunos',
      title: 'Alunos',
      icon: 'school',
      onPress: () => {}
    },
    {
      id: 'sobre',
      title: 'Sobre',
      icon: 'information-circle',
      onPress: () => {
        router.push('/sobre');
      }
    },
    {
      id: 'logoff',
      title: 'Fazer Log-off',
      icon: 'log-out',
      onPress: () => {
        router.push('/login');
      }
    }
  ];

  const handleLogoff = () => {
    console.log('Fazer log-off');
  };

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
        <Text style={styles.headerTitle}>Configurações</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={Colors.light.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Procurar..."
          placeholderTextColor={Colors.light.textSecondary}
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <View style={styles.configuracoesList}>
        {configuracoes.map((item, index) => {
          const isLogoff = item.id === 'logoff';
          const itemColor = isLogoff ? LOGOFF_COLOR : '#000';

          return (
            <View key={item.id}>
              <TouchableOpacity 
                style={styles.configuracaoItem}
                onPress={item.onPress}
              >
                <View style={styles.configuracaoLeft}>
                  <Ionicons name={item.icon as any} size={24} color={itemColor} />
                  <Text style={[styles.configuracaoTitle, { color: itemColor }]}>
                    {item.title}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={isLogoff ? itemColor : '#000'} />
              </TouchableOpacity>
              {index < configuracoes.length - 1 && <View style={styles.separator} />}
            </View>
          );
        })}
      </View>

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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    marginHorizontal: 24,
    marginVertical: 12,
    borderRadius: 16,
    paddingHorizontal: 15,
    paddingVertical: 4,
    borderWidth: 0.5,
    borderColor: '#E07612',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: Colors.light.textPrimary,
    fontFamily: 'Lexend_400Regular',
  },
  configuracoesList: {
    flex: 1,
    marginHorizontal: 24,
    marginTop: 20,
    paddingBottom: 100,
  },
  configuracaoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  configuracaoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  configuracaoTitle: {
    fontSize: 16,
    color: '#000',
    marginLeft: 12,
    fontFamily: 'Lexend_400Regular',
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    width: '100%',
  },
  logoffContainer: {
    position: 'absolute',
    bottom: 48,
    left: 24,
    right: 24,
  },
  logoffButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: 'center',
  },
  logoffText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Lexend_700Bold',
  },
});