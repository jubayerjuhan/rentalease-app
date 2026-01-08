import React, { useRef } from 'react';
import { View, Modal, StyleSheet, TouchableOpacity, Text } from 'react-native';
import SignatureCanvas from 'react-native-signature-canvas';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';

interface SignatureCaptureProps {
  visible: boolean;
  onClose: () => void;
  onSave: (base64Signature: string) => void;
}

const SignatureCapture: React.FC<SignatureCaptureProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const { theme } = useTheme();
  const signatureRef = useRef<any>(null);

  const handleOK = (signature: string) => {
    // Ensure proper base64 PNG format
    const base64Signature = signature.startsWith('data:image/png;base64,')
      ? signature
      : `data:image/png;base64,${signature}`;
    onSave(base64Signature);
    onClose();
  };

  const handleClear = () => {
    signatureRef.current?.clearSignature();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={[styles.header, { borderBottomColor: theme.border }]}>
          <Text style={[styles.title, { color: theme.text }]}>
            Draw Signature
          </Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.canvasContainer}>
          <SignatureCanvas
            ref={signatureRef}
            onOK={handleOK}
            onEmpty={() => console.log('Signature is empty')}
            descriptionText="Sign above"
            clearText="Clear"
            confirmText="Save"
            webStyle={`
              .m-signature-pad {
                box-shadow: none;
                border: none;
                background-color: ${theme.background};
              }
              .m-signature-pad--body {
                border: 2px dashed ${theme.border};
                border-radius: 8px;
                background-color: ${theme.surface};
              }
              .m-signature-pad--footer {
                display: none;
              }
            `}
            penColor={theme.text}
            backgroundColor={theme.surface}
          />
        </View>

        <View style={[styles.footer, { borderTopColor: theme.border }]}>
          <TouchableOpacity
            style={[styles.clearButton, { borderColor: theme.border }]}
            onPress={handleClear}
          >
            <MaterialCommunityIcons
              name="eraser"
              size={20}
              color={theme.textSecondary}
            />
            <Text style={[styles.clearText, { color: theme.textSecondary }]}>
              Clear
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.primary }]}
            onPress={() => signatureRef.current?.readSignature()}
          >
            <MaterialCommunityIcons name="check" size={20} color="white" />
            <Text style={styles.saveText}>Save Signature</Text>
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
    paddingTop: 60,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  canvasContainer: {
    flex: 1,
    padding: 16,
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  clearButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    borderWidth: 1,
    gap: 8,
  },
  clearText: {
    fontSize: 16,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  saveText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default SignatureCapture;
