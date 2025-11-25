import React from 'react';
import { Image, ImageProps, StyleSheet, View } from 'react-native';
import { useAccessibility } from '../../context/AccessibilityContext';

export default function DesaturableImage(props: ImageProps) {
  const { lowSaturation } = useAccessibility();

  return (
    <View style={[styles.container, props.style as any]}>
      <Image {...props} style={[StyleSheet.absoluteFill, props.style]} />
      {lowSaturation && (
        <View pointerEvents="none" style={styles.overlay} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(136,136,136,0.45)',
  },
});
