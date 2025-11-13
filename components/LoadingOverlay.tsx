import React from 'react';
import { Modal, View, StyleSheet, ActivityIndicator, Text } from 'react-native';

type Props = {
  visible: boolean;
  message?: string;
};

export default function LoadingOverlay({ visible, message }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop} pointerEvents="auto">
        <View style={styles.container} accessibilityRole="alert">
          <ActivityIndicator size="large" color="#ffffff" />
          {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: 120,
    height: 120,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  message: {
    marginTop: 12,
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
});
