import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Config from '../config/env';
import { Container } from '../components/Container';

const APITestScreen = () => {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testAPI = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Initialize the Gemini API
        const genAI = new GoogleGenerativeAI(Config.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        
        // Make a simple test prompt
        const prompt = 'Hello, Gemini! Can you tell me a very short story in one sentence?';
        
        // Generate content
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        setResult(text);
      } catch (err) {
        console.error('API Test Error:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    testAPI();
  }, []);

  return (
    <Container>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.title, { color: theme.colors.text }]}>API Connection Test</Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>
              Testing Gemini API connection...
            </Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: theme.colors.error }]}>
              ❌ Connection Failed
            </Text>
            <Text style={[styles.errorDetail, { color: theme.colors.text }]}>
              {error}
            </Text>
            <Text style={[styles.hint, { color: theme.colors.textSecondary }]}>
              Please check your internet connection and API key in the .env file
            </Text>
          </View>
        ) : (
          <View style={styles.successContainer}>
            <Text style={[styles.successText, { color: theme.colors.success }]}>
              ✅ Connection Successful!
            </Text>
            <Text style={[styles.resultLabel, { color: theme.colors.text }]}>
              Gemini API Response:
            </Text>
            <View style={[styles.resultBox, { backgroundColor: theme.colors.card }]}>
              <Text style={[styles.resultText, { color: theme.colors.text }]}>{result}</Text>
            </View>
          </View>
        )}
      </ScrollView>
    </Container>
  );
};

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
  errorContainer: {
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  errorDetail: {
    fontSize: 14,
    marginBottom: 10,
  },
  hint: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  successContainer: {
    alignItems: 'center',
  },
  successText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  resultLabel: {
    fontSize: 16,
    marginBottom: 10,
    fontWeight: '500',
  },
  resultBox: {
    width: '100%',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  resultText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default APITestScreen;
