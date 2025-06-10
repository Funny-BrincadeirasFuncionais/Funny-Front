import React from 'react';
import { Text, TextInput } from 'react-native';

// Força o TypeScript a aceitar o uso de `.render`
const TextRender = (Text as any).render;
const InputRender = (TextInput as any).render;

(Text as any).render = function (...args: any[]) {
  const origin = TextRender.call(this, ...args);
  return React.cloneElement(origin, {
    style: [{ fontFamily: 'Lexend_400Regular' }, origin.props.style],
  });
};

(TextInput as any).render = function (...args: any[]) {
  const origin = InputRender.call(this, ...args);
  return React.cloneElement(origin, {
    style: [{ fontFamily: 'Lexend_400Regular' }, origin.props.style],
  });
};
