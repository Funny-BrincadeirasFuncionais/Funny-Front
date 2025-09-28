import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Dimensions, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
const LogoFunny = require('../assets/images/logo.png');

const { width } = Dimensions.get('window');

const slides = [
  {
    id: '1',
    image: require('../assets/images/funny_alegre.png'),
    title: 'Funny',
    text: 'Aplicativo de comunicação alternativa para ajudar crianças e adolescentes com autismo a transmitirem seus desejos, emoções e necessidades.',
  },
  {
    id: '2',
    image: require('../assets/images/funny_celular.png'),
    title: 'Fácil de usar',
    text: 'A comunicação é feita através de figuras e que, ao serem clicadas, fazem com que uma voz reproduza o que a criança deseja transmitir.',
  },
  {
    id: '3',
    image: require('../assets/images/funny_coelho.png'),
    title: 'Facilita a expressão',
    text: 'A comunicação eficiente reduz frustrações e ajuda a criança a se sentir compreendida, fortalecendo vínculos com a família, professores e amigos.',
  },
];

export default function Onboarding() {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList>(null);
  const insets = useSafeAreaInsets();

  const handleNext = () => {
    if (currentIndex < slides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      router.replace('/login');
    }
  };

  const handleSkip = () => {
    router.replace('/login');
  };

  const renderItem = ({ item }: any) => (
    <View style={[styles.slide, { width }]}>
      {/* Imagem do slide */}
      <Image source={item.image} style={styles.image} resizeMode="contain" />

      {/* Dots logo abaixo da imagem */}
      <View style={styles.dotsContainer}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[styles.dot, currentIndex === index && styles.dotActive]}
          />
        ))}
      </View>

      {/* Texto do slide */}
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.text}>{item.text}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      {/* Logo fixa no topo */}
      <View style={styles.logoContainer}>
        <Image source={LogoFunny} style={styles.logo} resizeMode="contain" />
      </View>

      {/* Background atrás dos slides */}
      <Image
        source={require('../assets/images/background.png')} // sua imagem de background
        style={styles.backgroundImage}
        resizeMode="cover"
      />

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
        contentContainerStyle={{ paddingTop: 20 }}
        style={{ flex: 1 }}
      />

      {/* Botões fixos no final */}
      <View style={[styles.buttonsContainer, { marginBottom: insets.bottom + -24 }]}>
        <Pressable style={styles.skipButton} onPress={handleSkip}>
          <Text style={styles.skipText}>Pular</Text>
        </Pressable>
        <Pressable style={styles.nextButton} onPress={handleNext}>
          <Text style={styles.nextText}>
            {currentIndex === slides.length - 1 ? 'Começar' : 'Próximo'}
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>

  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  logo: {
    width: 94,
    height: 24,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    overflow: 'hidden', // <--- corta qualquer parte da imagem que ultrapassa
  },
  image: {
    width: '70%',
    height: 300,
    marginBottom: 12,
  },
  dotsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
    marginHorizontal: 4,
  },
  dotActive: {
    backgroundColor: '#E07612',
  },
  title: {
    fontSize: 22,
    fontFamily: 'Inter_700Bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 16,
  },
  text: {
    fontSize: 16,
    color: '#59626E',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '90%',
    zIndex: -1, // garante que fique atrás de tudo
  },

  skipButton: {
    flex: 1,
    borderColor: '#E07612',
    borderWidth: 1,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#E07612',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  skipText: {
    color: '#E07612',
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
  nextText: {
    color: 'white',
    fontFamily: 'Inter_700Bold',
    fontSize: 16,
  },
});
