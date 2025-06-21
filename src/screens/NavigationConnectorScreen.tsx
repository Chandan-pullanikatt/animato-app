import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { useTheme } from '../contexts/ThemeContext';

type NavigationConnectorScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'NavigationConnector'>;

interface NavigationConnectorScreenProps {
  navigation: NavigationConnectorScreenNavigationProp;
  route: {
    params: {
      script: string;
      theme: string;
      nextScreen: keyof RootStackParamList;
    }
  }
}

/**
 * A simple screen that serves as a connector between different parts of the app flow.
 * It automatically redirects to the specified screen after a brief delay.
 */
const NavigationConnectorScreen: React.FC<NavigationConnectorScreenProps> = ({ navigation, route }) => {
  const theme = useTheme();
  const { script, theme: videoTheme, nextScreen } = route.params;

  useEffect(() => {
    // Automatically navigate to the next screen after a short delay
    const timer = setTimeout(() => {
      // Use type assertion to fix TypeScript error
      navigation.replace(nextScreen as any, {
        script,
        theme: videoTheme
      });
    }, 1500);

    return () => clearTimeout(timer);
  }, [navigation, script, videoTheme, nextScreen]);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Text style={[styles.text, { color: theme.colors.text }]}>
        Preparing {nextScreen.replace(/([A-Z])/g, ' $1').trim()}...
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  text: {
    marginTop: 20,
    fontSize: 18,
    textAlign: 'center'
  }
});

export default NavigationConnectorScreen;
