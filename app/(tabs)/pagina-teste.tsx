import { router } from 'expo-router';
import { Button, Text, View } from 'react-native';

export default function PaginaTeste() {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ fontSize: 22 }}>Olá! Esta é a Página Teste.</Text>
      <Button title="Voltar" onPress={() => router.back()} />
    </View>
  );
}
