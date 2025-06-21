import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, Dimensions } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

const { width } = Dimensions.get('window');

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  buttons?: Array<{
    text: string;
    onPress: () => void;
    style?: 'default' | 'primary' | 'secondary';
  }>;
  onClose: () => void;
}

const CustomAlert: React.FC<CustomAlertProps> = ({
  visible,
  title,
  message,
  type = 'info',
  buttons = [{ text: 'OK', onPress: () => {}, style: 'primary' }],
  onClose
}) => {
  const theme = useTheme();

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          icon: '✅',
          iconColor: '#4CAF50',
          borderColor: '#4CAF50',
          backgroundColor: '#E8F5E8'
        };
      case 'warning':
        return {
          icon: '⚠️',
          iconColor: '#FF9800',
          borderColor: '#FF9800',
          backgroundColor: '#FFF3E0'
        };
      case 'error':
        return {
          icon: '❌',
          iconColor: '#F44336',
          borderColor: '#F44336',
          backgroundColor: '#FFEBEE'
        };
      default: // info
        return {
          icon: 'ℹ️',
          iconColor: '#2196F3',
          borderColor: '#2196F3',
          backgroundColor: '#E3F2FD'
        };
    }
  };

  const typeStyles = getTypeStyles();

  const handleButtonPress = (button: any) => {
    button.onPress();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={[
          styles.alertContainer,
          { 
            backgroundColor: theme.colors.background,
            borderColor: typeStyles.borderColor
          }
        ]}>
          {/* Header with icon */}
          <View style={[styles.header, { backgroundColor: typeStyles.backgroundColor }]}>
            <Text style={styles.icon}>{typeStyles.icon}</Text>
            <Text style={[styles.title, { color: theme.colors.text }]}>{title}</Text>
          </View>

          {/* Message */}
          <View style={styles.content}>
            <Text style={[styles.message, { color: theme.colors.text }]}>{message}</Text>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            {buttons.map((button, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.button,
                  button.style === 'primary' && { backgroundColor: theme.colors.primary },
                  button.style === 'secondary' && { backgroundColor: theme.colors.secondary },
                  button.style === 'default' && { backgroundColor: theme.colors.surface, borderWidth: 1, borderColor: theme.colors.border }
                ]}
                onPress={() => handleButtonPress(button)}
              >
                <Text style={[
                  styles.buttonText,
                  button.style === 'primary' && { color: '#FFFFFF' },
                  button.style === 'secondary' && { color: '#FFFFFF' },
                  button.style === 'default' && { color: theme.colors.text }
                ]}>
                  {button.text}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    width: width * 0.85,
    maxWidth: 400,
    borderRadius: 16,
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingBottom: 16,
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    flex: 1,
    fontFamily: 'System',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
    fontFamily: 'System',
  },
  buttonContainer: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
});

export default CustomAlert; 