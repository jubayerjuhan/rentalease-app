import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Switch,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useTheme } from '../contexts/ThemeContext';

export interface InvoiceLineItem {
  id: string;
  name: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface InvoiceData {
  description: string;
  lineItems: InvoiceLineItem[];
  taxPercentage: number;
  subtotal: number;
  taxAmount: number;
  total: number;
  notes?: string;
}

export interface JobCompletionData {
  reportFile?: {
    uri: string;
    name: string;
    type: string;
    size: number;
  };
  hasInvoice: boolean;
  invoiceData?: InvoiceData;
}

interface JobCompletionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: JobCompletionData) => Promise<void>;
  jobId: string;
  jobType: string;
}

export const JobCompletionModal: React.FC<JobCompletionModalProps> = ({
  visible,
  onClose,
  onSubmit,
  jobId,
  jobType,
}) => {
  const { theme, isDark } = useTheme();
  
  // PDF Report state
  const [reportFile, setReportFile] = useState<any>(null);
  
  // Invoice state
  const [hasInvoice, setHasInvoice] = useState(false);
  const [invoiceDescription, setInvoiceDescription] = useState('');
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    { id: '1', name: '', quantity: 1, rate: 0, amount: 0 }
  ]);
  const [taxPercentage, setTaxPercentage] = useState(10);
  const [invoiceNotes, setInvoiceNotes] = useState('');
  
  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);

  const styles = createStyles(theme, isDark);

  // Calculate invoice totals
  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = (subtotal * taxPercentage) / 100;
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  // Handle PDF file selection
  const handleSelectPDF = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        
        // Validate file size (10MB limit)
        if (file.size && file.size > 10 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Please select a PDF file smaller than 10MB');
          return;
        }

        setReportFile({
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/pdf',
          size: file.size || 0,
        });
      }
    } catch (error) {
      console.error('Error picking document:', error);
      Alert.alert('Error', 'Failed to select file. Please try again.');
    }
  };

  // Remove selected PDF
  const handleRemovePDF = () => {
    setReportFile(null);
  };

  // Handle line item changes
  const updateLineItem = (id: string, field: keyof InvoiceLineItem, value: string | number) => {
    setLineItems(prevItems => 
      prevItems.map(item => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // Recalculate amount when quantity or rate changes
          if (field === 'quantity' || field === 'rate') {
            updatedItem.amount = updatedItem.quantity * updatedItem.rate;
          }
          
          return updatedItem;
        }
        return item;
      })
    );
  };

  // Add new line item
  const addLineItem = () => {
    const newId = (lineItems.length + 1).toString();
    setLineItems(prev => [...prev, { 
      id: newId, 
      name: '', 
      quantity: 1, 
      rate: 0, 
      amount: 0 
    }]);
  };

  // Remove line item
  const removeLineItem = (id: string) => {
    if (lineItems.length > 1) {
      setLineItems(prev => prev.filter(item => item.id !== id));
    }
  };

  // Validate form data
  const validateForm = (): boolean => {
    if (hasInvoice) {
      if (!invoiceDescription.trim()) {
        Alert.alert('Validation Error', 'Please enter invoice description');
        return false;
      }

      const validLineItems = lineItems.filter(item => 
        item.name.trim() && item.quantity > 0 && item.rate > 0
      );

      if (validLineItems.length === 0) {
        Alert.alert('Validation Error', 'Please add at least one valid line item with name, quantity, and rate');
        return false;
      }

      // Additional validation for invoice data
      if (validLineItems.some(item => !item.name.trim())) {
        Alert.alert('Validation Error', 'All line items must have a name');
        return false;
      }

      if (validLineItems.some(item => item.quantity <= 0 || item.rate <= 0)) {
        Alert.alert('Validation Error', 'All line items must have positive quantity and rate');
        return false;
      }
    }

    return true;
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const completionData: JobCompletionData = {
        hasInvoice,
      };

      // Add report file if selected
      if (reportFile) {
        completionData.reportFile = reportFile;
      }

      // Add invoice data if enabled
      if (hasInvoice) {
        const { subtotal, taxAmount, total } = calculateTotals();
        const validLineItems = lineItems.filter(item => 
          item.name.trim() && item.quantity > 0 && item.rate > 0
        );

        const invoiceData = {
          description: invoiceDescription.trim(),
          items: validLineItems.map(item => ({
            name: item.name.trim(),
            quantity: item.quantity,
            rate: item.rate,
            amount: item.amount,
          })),
          lineItems: validLineItems, // Keep both for compatibility
          taxPercentage,
          subtotal,
          taxAmount,
          total,
          notes: invoiceNotes.trim() || undefined,
        };

        console.log('[JobCompletionModal] Invoice data being sent:', JSON.stringify(invoiceData, null, 2));
        completionData.invoiceData = invoiceData;
      }

      await onSubmit(completionData);
      
      // Reset form
      setReportFile(null);
      setHasInvoice(false);
      setInvoiceDescription('');
      setLineItems([{ id: '1', name: '', quantity: 1, rate: 0, amount: 0 }]);
      setTaxPercentage(10);
      setInvoiceNotes('');
      
      onClose();
    } catch (error) {
      console.error('Error submitting job completion:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Complete Job</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Job Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job Information</Text>
            <View style={styles.jobInfo}>
              <Text style={styles.jobId}>Job ID: {jobId}</Text>
              <Text style={styles.jobType}>Type: {jobType}</Text>
            </View>
          </View>

          {/* PDF Report Upload */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>PDF Report (Optional)</Text>
            <Text style={styles.sectionDescription}>
              Upload a PDF report documenting the completed work
            </Text>
            
            {reportFile ? (
              <View style={styles.filePreview}>
                <MaterialCommunityIcons name="file-pdf-box" size={32} color={theme.error} />
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName}>{reportFile.name}</Text>
                  <Text style={styles.fileSize}>
                    {(reportFile.size / 1024 / 1024).toFixed(2)} MB
                  </Text>
                </View>
                <TouchableOpacity onPress={handleRemovePDF} style={styles.removeButton}>
                  <MaterialCommunityIcons name="close" size={20} color={theme.error} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity style={styles.uploadButton} onPress={handleSelectPDF}>
                <MaterialCommunityIcons name="cloud-upload" size={32} color={theme.primary} />
                <Text style={styles.uploadText}>Select PDF File</Text>
                <Text style={styles.uploadSubtext}>Maximum file size: 10MB</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Invoice Toggle */}
          <View style={styles.section}>
            <View style={styles.invoiceToggle}>
              <View style={styles.toggleInfo}>
                <Text style={styles.sectionTitle}>Create Invoice</Text>
                <Text style={styles.sectionDescription}>
                  Generate an invoice for additional charges or materials
                </Text>
              </View>
              <Switch
                value={hasInvoice}
                onValueChange={setHasInvoice}
                trackColor={{ false: theme.disabled, true: theme.primary }}
                thumbColor={hasInvoice ? theme.surface : theme.textSecondary}
              />
            </View>
          </View>

          {/* Invoice Builder */}
          {hasInvoice && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Invoice Details</Text>
              
              {/* Invoice Description */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Description *</Text>
                <TextInput
                  style={styles.textInput}
                  value={invoiceDescription}
                  onChangeText={setInvoiceDescription}
                  placeholder="Enter invoice description"
                  placeholderTextColor={theme.placeholder}
                  multiline
                />
              </View>

              {/* Line Items */}
              <Text style={styles.subsectionTitle}>Line Items</Text>
              {lineItems.map((item, index) => (
                <View key={item.id} style={styles.lineItem}>
                  <View style={styles.lineItemHeader}>
                    <Text style={styles.lineItemTitle}>Item {index + 1}</Text>
                    {lineItems.length > 1 && (
                      <TouchableOpacity 
                        onPress={() => removeLineItem(item.id)}
                        style={styles.removeItemButton}
                      >
                        <MaterialCommunityIcons name="close" size={16} color={theme.error} />
                      </TouchableOpacity>
                    )}
                  </View>
                  
                  <View style={styles.lineItemInputs}>
                    <View style={styles.itemNameInput}>
                      <Text style={styles.inputLabel}>Item Name</Text>
                      <TextInput
                        style={styles.textInput}
                        value={item.name}
                        onChangeText={(text) => updateLineItem(item.id, 'name', text)}
                        placeholder="Item name"
                        placeholderTextColor={theme.placeholder}
                      />
                    </View>
                    
                    <View style={styles.itemRowInputs}>
                      <View style={styles.itemQtyInput}>
                        <Text style={styles.inputLabel}>Qty</Text>
                        <TextInput
                          style={styles.numberInput}
                          value={item.quantity.toString()}
                          onChangeText={(text) => updateLineItem(item.id, 'quantity', parseInt(text) || 0)}
                          placeholder="1"
                          placeholderTextColor={theme.placeholder}
                          keyboardType="numeric"
                        />
                      </View>
                      
                      <View style={styles.itemRateInput}>
                        <Text style={styles.inputLabel}>Rate ($)</Text>
                        <TextInput
                          style={styles.numberInput}
                          value={item.rate.toString()}
                          onChangeText={(text) => updateLineItem(item.id, 'rate', parseFloat(text) || 0)}
                          placeholder="0.00"
                          placeholderTextColor={theme.placeholder}
                          keyboardType="decimal-pad"
                        />
                      </View>
                      
                      <View style={styles.itemAmountInput}>
                        <Text style={styles.inputLabel}>Amount</Text>
                        <Text style={styles.amountText}>${item.amount.toFixed(2)}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              ))}

              <TouchableOpacity style={styles.addItemButton} onPress={addLineItem}>
                <MaterialCommunityIcons name="plus" size={20} color={theme.primary} />
                <Text style={styles.addItemText}>Add Item</Text>
              </TouchableOpacity>

              {/* Tax */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Tax Percentage (%)</Text>
                <TextInput
                  style={styles.numberInput}
                  value={taxPercentage.toString()}
                  onChangeText={(text) => setTaxPercentage(parseFloat(text) || 0)}
                  placeholder="10"
                  placeholderTextColor={theme.placeholder}
                  keyboardType="decimal-pad"
                />
              </View>

              {/* Invoice Totals */}
              <View style={styles.totalsSection}>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Subtotal:</Text>
                  <Text style={styles.totalValue}>${subtotal.toFixed(2)}</Text>
                </View>
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Tax ({taxPercentage}%):</Text>
                  <Text style={styles.totalValue}>${taxAmount.toFixed(2)}</Text>
                </View>
                <View style={[styles.totalRow, styles.finalTotal]}>
                  <Text style={styles.finalTotalLabel}>Total:</Text>
                  <Text style={styles.finalTotalValue}>${total.toFixed(2)}</Text>
                </View>
              </View>

              {/* Notes */}
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Notes (Optional)</Text>
                <TextInput
                  style={[styles.textInput, styles.notesInput]}
                  value={invoiceNotes}
                  onChangeText={setInvoiceNotes}
                  placeholder="Additional notes..."
                  placeholderTextColor={theme.placeholder}
                  multiline
                />
              </View>
            </View>
          )}
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.cancelButton, { borderColor: theme.border }]} 
            onPress={onClose}
            disabled={isSubmitting}
          >
            <Text style={[styles.cancelButtonText, { color: theme.textSecondary }]}>
              Cancel
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.submitButton, 
              { backgroundColor: theme.primary },
              isSubmitting && { opacity: 0.7 }
            ]} 
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <>
                <MaterialCommunityIcons name="check" size={20} color="white" />
                <Text style={styles.submitButtonText}>Complete Job</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const createStyles = (theme: any, isDark: boolean) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.surface,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.text,
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.text,
    marginBottom: 8,
  },
  subsectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 12,
    marginTop: 16,
  },
  sectionDescription: {
    fontSize: 14,
    color: theme.textSecondary,
    marginBottom: 16,
  },
  jobInfo: {
    backgroundColor: theme.card,
    padding: 16,
    borderRadius: 12,
  },
  jobId: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 4,
  },
  jobType: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  uploadButton: {
    backgroundColor: theme.card,
    borderWidth: 2,
    borderColor: theme.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.primary,
    marginTop: 8,
  },
  uploadSubtext: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 4,
  },
  filePreview: {
    backgroundColor: theme.card,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  fileInfo: {
    flex: 1,
    marginLeft: 12,
  },
  fileName: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },
  fileSize: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 2,
  },
  removeButton: {
    padding: 4,
  },
  invoiceToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleInfo: {
    flex: 1,
    marginRight: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: theme.text,
  },
  numberInput: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: theme.text,
    textAlign: 'right',
  },
  notesInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  lineItem: {
    backgroundColor: theme.card,
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: theme.border,
  },
  lineItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  lineItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.text,
  },
  removeItemButton: {
    padding: 4,
  },
  lineItemInputs: {
    gap: 12,
  },
  itemNameInput: {
    flex: 1,
  },
  itemRowInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  itemQtyInput: {
    flex: 1,
  },
  itemRateInput: {
    flex: 1,
  },
  itemAmountInput: {
    flex: 1,
  },
  amountText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
    textAlign: 'right',
    padding: 12,
    backgroundColor: theme.background,
    borderRadius: 8,
  },
  addItemButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.primary,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  addItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.primary,
    marginLeft: 8,
  },
  totalsSection: {
    backgroundColor: theme.card,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  totalLabel: {
    fontSize: 14,
    color: theme.textSecondary,
  },
  totalValue: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.text,
  },
  finalTotal: {
    borderTopWidth: 1,
    borderTopColor: theme.border,
    paddingTop: 8,
    marginTop: 8,
  },
  finalTotalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.text,
  },
  finalTotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.primary,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: theme.border,
    backgroundColor: theme.surface,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  submitButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    padding: 16,
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});