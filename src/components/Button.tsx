import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

type ButtonVariant = 'primary' | 'secondary' | 'outline';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: object;
  textStyle?: object;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
}) => {
  const theme = useTheme();

  const getButtonStyle = () => {
    switch (variant) {
      case 'secondary':
        return {
          backgroundColor: theme.colors.card,
          borderWidth: 1,
          borderColor: theme.colors.border,
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: theme.colors.primary,
        };
      case 'primary':
      default:
        return {
          backgroundColor: disabled ? theme.colors.disabled : theme.colors.primary,
          borderWidth: 0,
          elevation: disabled ? 0 : 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 1 },
          shadowOpacity: 0.2,
          shadowRadius: 2,
        };
    }
  };

  const getTextStyle = () => {
    switch (variant) {
      case 'primary':
        return { 
          color: disabled ? '#ffffff' : '#ffffff',
          fontWeight: '600' as const,
          fontFamily: 'System',
        };
      case 'secondary':
        return { 
          color: theme.colors.text,
          fontWeight: '500' as const,
          fontFamily: 'System',
        };
      case 'outline':
        return { 
          color: theme.colors.primary,
          fontWeight: '500' as const,
          fontFamily: 'System',
        };
      default:
        return { 
          color: theme.colors.text,
          fontWeight: '500' as const,
          fontFamily: 'System',
        };
    }
  };

  return (
    <TouchableOpacity
      style={[styles.button, getButtonStyle(), style]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextStyle().color} />
      ) : (
        <Text style={[styles.buttonText, getTextStyle(), textStyle]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 140,
    minHeight: 40,
  },
  buttonText: {
    fontSize: 15,
    textAlign: 'center',
    fontFamily: 'System',
  },
});
