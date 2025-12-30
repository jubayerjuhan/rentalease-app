import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Dimensions,
} from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';
import { useTheme } from '../contexts/ThemeContext';

interface SignatureModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (signatureData: string) => void;
  title?: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const SignatureModal: React.FC<SignatureModalProps> = ({
  visible,
  onClose,
  onSave,
  title = 'Technician Signature',
}) => {
  const { theme } = useTheme();
  const signatureRef = useRef<any>(null);
  const [isSignatureEmpty, setIsSignatureEmpty] = useState(true);

  const handleSignature = (signature: string) => {
    console.log('[SignatureModal] Signature captured:', signature?.substring(0, 50) + '...');
    onSave(signature);
    onClose();
  };

  const handleClear = () => {
    signatureRef.current?.clearSignature();
    setIsSignatureEmpty(true);
  };

  const handleSave = () => {
    if (isSignatureEmpty) {
      Alert.alert('Error', 'Please provide a signature before saving.');
      return;
    }
    signatureRef.current?.readSignature();
  };

  const handleBegin = () => {
    setIsSignatureEmpty(false);
  };

  const style = `
    .m-signature-pad {
      box-shadow: none;
      border: none;
      background-color: ${theme.surface || theme.card || '#ffffff'};
    }
    .m-signature-pad--body {
      border: 2px dashed ${theme.border || '#e5e7eb'};
      border-radius: 8px;
      background-color: ${theme.surface || theme.card || '#ffffff'};
    }
    .m-signature-pad--footer {
      display: none;
    }
    body {
      background-color: ${theme.surface || theme.card || '#ffffff'};
      margin: 0;
      padding: 16px;
    }
  `;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, { color: theme.textSecondary }]}>
              Cancel
            </Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: theme.text }]}>{title}</Text>
          <TouchableOpacity onPress={handleSave} style={styles.headerButton}>
            <Text style={[styles.headerButtonText, { color: theme.primary }]}>
              Save
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.instructionContainer}>
          <Text style={[styles.instruction, { color: theme.textSecondary }]}>
            Please sign in the box below using your finger or stylus
          </Text>
        </View>

        <View style={[styles.signatureContainer, { backgroundColor: theme.surface || theme.card }]}>
          <SignatureCanvas
            ref={signatureRef}
            onOK={handleSignature}
            onEmpty={() => setIsSignatureEmpty(true)}
            onBegin={handleBegin}
            descriptionText=""
            clearText="Clear"
          confirmText="Save"
          webStyle={style}
          autoClear={false}
          backgroundColor={theme.surface || theme.card || '#ffffff'}
          penColor={theme.text || '#000000'}
          minWidth={2}
          maxWidth={4}
          // @ts-expect-error canvasProps is not typed in signature-canvas
          canvasProps={{
            width: screenWidth - 40,
            height: 300,
          }}
        />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[
              styles.button,
              styles.clearButton,
              { borderColor: theme.border }
            ]}
            onPress={handleClear}
          >
            <Text style={[styles.buttonText, { color: theme.textSecondary }]}>
              Clear
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    paddingTop: 50, // Account for status bar
  },
  headerButton: {
    paddingVertical: 8,
    paddingHorizontal: 4,
    minWidth: 60,
  },
  headerButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  instructionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  instruction: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
  signatureContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    paddingTop: 16,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  clearButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SignatureModal;
