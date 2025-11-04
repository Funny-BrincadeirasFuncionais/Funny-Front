import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../constants/Colors';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getResponsavel, updateResponsavel } from '../services/api';
import { useAccessibility } from '../context/AccessibilityContext';

export default function EditarPerfilScreen() {
  const router = useRouter();
  const { transformText } = useAccessibility();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);

  const [nomeFocused, setNomeFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [telefoneFocused, setTelefoneFocused] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const uid = await AsyncStorage.getItem('userId');
        if (!uid) return;
        setUserId(Number(uid));
        setLoading(true);
        const data = await getResponsavel(Number(uid));
        if (data) {
          setNome(data.nome || '');
          setEmail(data.email || '');
          setTelefone(data.telefone || '');
        }
      } catch (e) {
        console.warn('Falha ao carregar perfil', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const salvar = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await updateResponsavel(userId, { nome, email, telefone });
      if ('ok' in res) {
        // when using putJson, res is Response
        if ((res as any).ok) {
          Alert.alert(transformText('Sucesso'), transformText('Perfil atualizado.'));
          router.back();
        } else {
          const txt = await (res as any).text();
          Alert.alert(transformText('Erro'), transformText(`Falha ao salvar: ${txt}`));
        }
      } else {
        // fallback if api returns json directly
        Alert.alert(transformText('Sucesso'), transformText('Perfil atualizado.'));
        router.back();
      }
    } catch (e) {
      Alert.alert(transformText('Erro'), transformText('Não foi possível atualizar o perfil.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{transformText('Editar Perfil')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Foto */}
      <View style={styles.profileContainer}>
        <View style={styles.avatarWrapper}>
          <Ionicons name="person-circle" size={120} color={Colors.light.primary} />
        </View>
      </View>

      {/* Inputs */}
      <View style={styles.form}>
        <TextInput
          placeholder={transformText("Nome")}
          value={nome}
          onChangeText={setNome}
          style={[styles.input, nomeFocused && styles.inputFocused]}
          onFocus={() => setNomeFocused(true)}
          onBlur={() => setNomeFocused(false)}
        />

        <TextInput
          placeholder={transformText("E-mail")}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={[styles.input, emailFocused && styles.inputFocused]}
          onFocus={() => setEmailFocused(true)}
          onBlur={() => setEmailFocused(false)}
        />

        <TextInput
          placeholder={transformText("Telefone")}
          value={telefone}
          onChangeText={setTelefone}
          keyboardType="phone-pad"
          style={[styles.input, telefoneFocused && styles.inputFocused]}
          onFocus={() => setTelefoneFocused(true)}
          onBlur={() => setTelefoneFocused(false)}
        />
      </View>

      {/* Ações */}
      <TouchableOpacity style={styles.saveButton} onPress={salvar} disabled={loading}>
        <Text style={styles.saveText}>{transformText(loading ? 'Salvando...' : 'Salvar')}</Text>
      </TouchableOpacity>
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
  profileContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: -6,
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 6,
    borderWidth: 1,
    borderColor: '#E07612',
  },
  form: {
    marginTop: 24,
    paddingHorizontal: 24,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputFocused: {
    borderColor: '#E07612',
    borderWidth: 2,
  },
  passwordButton: {
    borderWidth: 1,
    borderColor: '#E07612',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 16,
  },
  passwordText: {
    color: '#E07612',
    fontFamily: 'Lexend_700Bold',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#E07612',
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginHorizontal: 24,
    marginTop: 16,
  },
  saveText: {
    color: 'white',
    fontFamily: 'Lexend_700Bold',
    fontSize: 16,
  },
});