import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated, TextInput, Alert, Modal } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { Button } from '../components/Button';
import { Container } from '../components/Container';
import { useTheme } from '../contexts/ThemeContext';
import { authService } from '../utils/auth';


type LandingScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Landing'>;

interface LandingScreenProps {
  navigation: LandingScreenNavigationProp;
}

interface Feature {
  icon: string;
  title: string;
  description: string;
}

const features: Feature[] = [
  {
    icon: '🎬',
    title: 'AI Scripts',
    description: 'Generate scripts instantly'
  },
  {
    icon: '🖼️',
    title: 'Smart Visuals',
    description: 'AI-matched images'
  },
  {
    icon: '⚡',
    title: 'Fast Creation',
    description: 'Videos in minutes'
  },
  {
    icon: '🎨',
    title: 'Multiple Genres',
    description: '8 content themes'
  }
];

const LandingScreen: React.FC<LandingScreenProps> = ({ navigation }) => {
  const theme = useTheme();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleGetStarted = () => {
    navigation.navigate('ThemeSelection');
  };

  const handleAuth = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { user, error } = await authService.signUp(email, password);
        if (error) {
          Alert.alert('Error', error.message);
        } else {
          Alert.alert('Success', 'Check your email for verification link!');
        }
      } else {
        const { user, error } = await authService.signIn(email, password);
        if (error) {
          Alert.alert('Error', error.message);
        } else {
          Alert.alert('Success', 'Welcome back!');
          setShowAuthModal(false);
          navigation.navigate('ThemeSelection');
        }
      }
    } catch (error: any) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <View style={styles.container}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Hero Section */}
          <Animated.View 
            style={[
              styles.heroSection,
              { opacity: fadeAnim }
            ]}
          >
            <View style={styles.logoContainer}>
                          <View style={styles.logoContainer}>
              <Text style={styles.logo}>Animato</Text>
            </View>
              <Text style={styles.version}>AI Studio</Text>
            </View>
          
            <Text style={styles.tagline}>
              AI Video Creator for Content Creators
            </Text>
            
            <Text style={styles.description}>
              Create professional videos with AI-generated scripts and visuals in minutes.
            </Text>
        </Animated.View>

          {/* Features Section */}
          <View style={styles.featuresSection}>
            <View style={styles.featuresGrid}>
              {features.map((feature, index) => (
                <View
                  key={index}
                  style={styles.featureCard}
                >
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                  <Text style={styles.featureTitle}>
                    {feature.title}
                  </Text>
                  <Text style={styles.featureDescription}>
                    {feature.description}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionSection}>
            <Button
              title="Get Started"
              onPress={handleGetStarted}
              variant="primary"
              style={styles.primaryButton}
            />
            
            <TouchableOpacity 
              style={styles.signUpButton}
              onPress={() => setShowAuthModal(true)}
            >
              <Text style={styles.signUpText}>Sign Up Free</Text>
            </TouchableOpacity>
          </View>


                  </ScrollView>

      {/* Authentication Modal */}
      <Modal
        visible={showAuthModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAuthModal(false)}
      >
        <View style={styles.modalOverlay}>
                     <View style={styles.modalContent}>
             <View style={styles.modalGradient}>
              <Text style={styles.modalTitle}>
                {isSignUp ? 'Join Animato' : 'Welcome Back'}
              </Text>
              
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#999"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#999"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
              
              <TouchableOpacity
                style={styles.authButton}
                onPress={handleAuth}
                disabled={loading}
              >
                <Text style={styles.authButtonText}>
                  {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setIsSignUp(!isSignUp)}
                style={styles.switchButton}
              >
                <Text style={styles.switchText}>
                  {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
                </Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                onPress={() => setShowAuthModal(false)}
                style={styles.closeButton}
                             >
                 <Text style={styles.closeText}>✕</Text>
               </TouchableOpacity>
             </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    paddingBottom: 24,
    alignItems: 'center',
  },
  heroSection: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    width: '100%',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    fontSize: 42,
    fontWeight: '700',
    letterSpacing: -0.5,
    textAlign: 'center',
    fontFamily: 'System',
    color: '#1e293b',
    marginBottom: 8,
  },
  version: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    fontFamily: 'System',
    color: '#64748b',
  },
  tagline: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
    lineHeight: 26,
    maxWidth: '90%',
    fontFamily: 'System',
    color: '#1e293b',
  },
  description: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
    paddingHorizontal: 12,
    maxWidth: '85%',
    fontFamily: 'System',
    color: '#475569',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 12,
    gap: 32,
  },
  statItem: {
    alignItems: 'center',
    minWidth: 50,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    fontFamily: 'System',
    color: '#3b82f6',
  },
  statLabel: {
    fontSize: 11,
    marginTop: 2,
    textAlign: 'center',
    fontFamily: 'System',
    color: '#64748b',
  },
  featuresSection: {
    paddingHorizontal: 20,
    marginBottom: 32,
    alignItems: 'center',
    width: '100%',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'System',
    color: '#1e293b',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 12,
    width: '100%',
  },
  featureCard: {
    width: width * 0.42,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 28,
    marginBottom: 8,
    textAlign: 'center',
  },
  featureTitle: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 6,
    fontFamily: 'System',
    color: '#1e293b',
  },
  featureDescription: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 14,
    fontFamily: 'System',
    color: '#64748b',
  },
  actionSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
    alignItems: 'center',
    width: '100%',
  },
  primaryButton: {
    marginBottom: 12,
    minWidth: 160,
  },
  credibilitySection: {
    alignItems: 'center',
    marginTop: 16,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    width: '100%',
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'System',
    color: '#64748b',
  },
  signUpButton: {
    marginTop: 12,
    marginBottom: 16,
    backgroundColor: '#3b82f6',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signUpText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
  credibilityText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 4,
    fontFamily: 'System',
    color: '#475569',
  },
  credibilitySubtext: {
    fontSize: 12,
    textAlign: 'center',
    fontFamily: 'System',
    color: '#64748b',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 20,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: 30,
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
    fontSize: 16,
    color: '#1e293b',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  authButton: {
    width: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  authButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  switchButton: {
    marginTop: 20,
  },
  switchText: {
    color: '#64748b',
    fontSize: 14,
    textAlign: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#64748b',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LandingScreen;