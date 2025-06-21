import { useState } from 'react';

interface AlertConfig {
  title: string;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  buttons?: Array<{
    text: string;
    onPress: () => void;
    style?: 'default' | 'primary' | 'secondary';
  }>;
}

export const useCustomAlert = () => {
  const [alertConfig, setAlertConfig] = useState<AlertConfig | null>(null);
  const [visible, setVisible] = useState(false);

  const showAlert = (config: AlertConfig) => {
    setAlertConfig(config);
    setVisible(true);
  };

  const hideAlert = () => {
    setVisible(false);
    setAlertConfig(null);
  };

  // Convenience methods for different types
  const showSuccess = (title: string, message: string, onPress?: () => void) => {
    showAlert({
      title,
      message,
      type: 'success',
      buttons: [{ text: 'Great!', onPress: onPress || (() => {}), style: 'primary' }]
    });
  };

  const showError = (title: string, message: string, onPress?: () => void) => {
    showAlert({
      title,
      message,
      type: 'error',
      buttons: [{ text: 'Got it', onPress: onPress || (() => {}), style: 'primary' }]
    });
  };

  const showWarning = (title: string, message: string, onPress?: () => void) => {
    showAlert({
      title,
      message,
      type: 'warning',
      buttons: [{ text: 'Understood', onPress: onPress || (() => {}), style: 'primary' }]
    });
  };

  const showInfo = (title: string, message: string, onPress?: () => void) => {
    showAlert({
      title,
      message,
      type: 'info',
      buttons: [{ text: 'OK', onPress: onPress || (() => {}), style: 'primary' }]
    });
  };

  const showConfirm = (
    title: string, 
    message: string, 
    onConfirm: () => void, 
    onCancel?: () => void
  ) => {
    showAlert({
      title,
      message,
      type: 'info',
      buttons: [
        { text: 'Cancel', onPress: onCancel || (() => {}), style: 'default' },
        { text: 'Confirm', onPress: onConfirm, style: 'primary' }
      ]
    });
  };

  return {
    alertConfig,
    visible,
    showAlert,
    hideAlert,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showConfirm
  };
}; 