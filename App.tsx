import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { initializeApp } from './src/utils/appInitialization';

export default function App() {
  useEffect(() => {
    // Initialize app services when the app starts
    initializeApp();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <SafeAreaView style={styles.container}>
          <StatusBar style="dark" backgroundColor="#ffffff" />
          <AppNavigator />
        </SafeAreaView>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
});