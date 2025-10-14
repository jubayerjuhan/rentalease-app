import React, { useEffect, useMemo, useState } from "react";
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
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import InspectionForm, { InspectionFormValues } from "./InspectionForm";
import type { InspectionTemplate, InspectionMediaUpload } from "@services/jobs";
import {
  fetchInspectionTemplates,
  submitInspectionReport,
} from "@services/jobs";

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
  inspectionReportId?: string;
  hasInvoice: boolean;
  invoiceData?: InvoiceData;
}

interface JobCompletionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (data: JobCompletionData) => Promise<void>;
  jobId: string;
  jobType: string;
  job?: {
    status: string;
    dueDate: string;
  };
}

const steps = [
  { key: "template", label: "Select Template" },
  { key: "form", label: "Inspection Form" },
  { key: "invoice", label: "Invoice & Submit" },
] as const;

type StepKey = (typeof steps)[number]["key"];

const defaultLineItem = (): InvoiceLineItem => ({
  id: `${Date.now()}`,
  name: "",
  quantity: 1,
  rate: 0,
  amount: 0,
});

const initializeFormValues = (
  template: InspectionTemplate
): InspectionFormValues => {
  return template.sections.reduce((acc, section) => {
    acc[section.id] = {};
    return acc;
  }, {} as InspectionFormValues);
};

const JobCompletionModal: React.FC<JobCompletionModalProps> = ({
  visible,
  onClose,
  onSubmit,
  jobId,
  jobType,
  job,
}) => {
  // Log jobId when modal is opened
  React.useEffect(() => {
    if (visible) {
      const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(jobId || '');
      console.log("[JobCompletionModal] Modal opened with:", {
        jobId: jobId,
        jobIdType: typeof jobId,
        jobIdLength: jobId?.length,
        isValidObjectId: isValidObjectId,
        jobType: jobType
      });

      if (!isValidObjectId) {
        console.warn("[JobCompletionModal] WARNING: Received invalid ObjectId format:", jobId);
      }
    }
  }, [visible, jobId, jobType]);

  // Job completion validation function
  const canCompleteJob = () => {
    if (!job) return true; // If no job data provided, assume it can be completed (fallback)

    // Only scheduled or in progress jobs can be completed
    if (job.status !== "Scheduled" && job.status !== "In Progress") {
      return false;
    }

    // Check if job is due (due date is today or past)
    const today = new Date();
    const dueDate = new Date(job.dueDate);
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate <= today;
  };

  const { theme, isDark } = useTheme();
  const styles = useMemo(() => createStyles(theme, isDark), [theme, isDark]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [templates, setTemplates] = useState<InspectionTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templateError, setTemplateError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<InspectionTemplate | null>(null);
  const [formValues, setFormValues] = useState<InspectionFormValues>({});
  const [mediaByField, setMediaByField] = useState<
    Record<string, InspectionMediaUpload[]>
  >({});
  const [notes, setNotes] = useState("");
  const [inspectionReportId, setInspectionReportId] = useState<string | null>(
    null
  );
  const [inspectionReportUrl, setInspectionReportUrl] = useState<
    string | undefined
  >(undefined);

  const [hasInvoice, setHasInvoice] = useState(false);
  const [invoiceDescription, setInvoiceDescription] = useState("");
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([
    defaultLineItem(),
  ]);
  const [taxPercentage, setTaxPercentage] = useState(10);
  const [invoiceNotes, setInvoiceNotes] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetState = () => {
    setCurrentStepIndex(0);
    setTemplates([]);
    setSelectedTemplate(null);
    setFormValues({});
    setMediaByField({});
    setNotes("");
    setInspectionReportId(null);
    setInspectionReportUrl(undefined);
    setHasInvoice(false);
    setInvoiceDescription("");
    setLineItems([defaultLineItem()]);
    setTaxPercentage(10);
    setInvoiceNotes("");
    setTemplateError(null);
    setLoadingTemplates(false);
  };

  useEffect(() => {
    if (visible) {
      loadTemplates();
    } else {
      resetState();
    }
  }, [visible]);

  const loadTemplates = async () => {
    try {
      setLoadingTemplates(true);
      setTemplateError(null);
      const fetched = await fetchInspectionTemplates();
      setTemplates(fetched);
      // Don't auto-select any template - let technician choose manually
      setSelectedTemplate(null);
      setFormValues({});
    } catch (error: any) {
      console.error("Failed to load templates", error);
      setTemplateError(error?.message || "Unable to load inspection templates");
    } finally {
      setLoadingTemplates(false);
    }
  };

  const goToStep = (stepIndex: number) => {
    const boundedIndex = Math.min(Math.max(stepIndex, 0), steps.length - 1);
    if (boundedIndex !== currentStepIndex) {
      if (boundedIndex < currentStepIndex) {
        // Navigating backwards invalidates generated report snapshot
        setInspectionReportId(null);
        setInspectionReportUrl(undefined);
      }
      setCurrentStepIndex(boundedIndex);
    }
  };

  const handleTemplateContinue = () => {
    if (!selectedTemplate) {
      Alert.alert(
        "Select Template",
        "Please choose an inspection template to continue."
      );
      return;
    }
    if (Object.keys(formValues).length === 0) {
      setFormValues(initializeFormValues(selectedTemplate));
    }
    goToStep(1);
  };

  const handleFormContinue = () => {
    if (!selectedTemplate) {
      Alert.alert("Template missing", "Select a template before proceeding.");
      return;
    }
    const missing = validateRequiredFields(
      selectedTemplate,
      formValues,
      mediaByField
    );
    if (missing.length) {
      Alert.alert(
        "Incomplete form",
        `Please complete required fields: ${missing.slice(0, 5).join(", ")}${
          missing.length > 5 ? "…" : ""
        }`
      );
      return;
    }
    goToStep(2);
  };

  const handleSubmit = async () => {
    if (!selectedTemplate) {
      Alert.alert("Template missing", "Select a template before submitting.");
      return;
    }
    const missing = validateRequiredFields(
      selectedTemplate,
      formValues,
      mediaByField
    );
    if (missing.length) {
      Alert.alert(
        "Incomplete form",
        `Please complete required fields: ${missing.slice(0, 5).join(", ")}${
          missing.length > 5 ? "…" : ""
        }`
      );
      goToStep(1);
      return;
    }

    if (hasInvoice && !invoiceDescription.trim()) {
      Alert.alert("Invoice required", "Please enter an invoice description.");
      return;
    }

    if (hasInvoice) {
      const validItems = lineItems.filter(
        (item) => item.name.trim() && item.quantity > 0 && item.rate > 0
      );
      if (validItems.length === 0) {
        Alert.alert(
          "Invoice items",
          "Add at least one line item with name, quantity, and rate."
        );
        return;
      }
    }

    try {
      setIsSubmitting(true);

      // Validate if job can be completed BEFORE creating inspection report
      if (!canCompleteJob()) {
        const today = new Date();
        const dueDate = job ? new Date(job.dueDate) : today;
        const isNotDue = dueDate > today;

        if (isNotDue) {
          Alert.alert(
            "Job Not Due",
            `This job can only be completed on or after ${dueDate.toLocaleDateString()}. Please wait until the due date to complete this job.`
          );
        } else if (job && job.status !== "Scheduled" && job.status !== "In Progress") {
          Alert.alert(
            "Invalid Job Status",
            `Only scheduled or in-progress jobs can be completed. Current status: ${job.status}`
          );
        } else {
          Alert.alert("Cannot Complete Job", "This job cannot be completed at this time.");
        }
        return;
      }

      let reportId = inspectionReportId;
      let reportUrl = inspectionReportUrl;

      if (!reportId) {
        console.log("[JobCompletionModal] Job validation passed. Submitting inspection report with jobId:", jobId);
        console.log("[JobCompletionModal] JobId type:", typeof jobId);
        console.log("[JobCompletionModal] JobId length:", jobId?.length);
        console.log("[JobCompletionModal] JobId is valid ObjectId format?:", /^[0-9a-fA-F]{24}$/.test(jobId));

        const submission = await submitInspectionReport(jobId, {
          template: selectedTemplate,
          formValues,
          mediaByField,
          notes,
        });
        reportId = submission.report.id;
        reportUrl = submission.pdf?.url;
        setInspectionReportId(reportId);
        setInspectionReportUrl(reportUrl);
      }

      const completionPayload: JobCompletionData = {
        inspectionReportId: reportId || undefined,
        hasInvoice,
      };

      if (hasInvoice) {
        const { subtotal, taxAmount, total } = calculateTotals();
        const validLineItems = lineItems
          .filter(
            (item) => item.name.trim() && item.quantity > 0 && item.rate > 0
          )
          .map((item) => ({
            ...item,
            name: item.name.trim(),
          }));

        completionPayload.invoiceData = {
          description: invoiceDescription.trim(),
          lineItems: validLineItems,
          taxPercentage,
          subtotal,
          taxAmount,
          total,
          notes: invoiceNotes.trim() || undefined,
        } as InvoiceData;
      }

      await onSubmit(completionPayload);

      Alert.alert(
        "Success",
        reportUrl
          ? "Inspection submitted and job completed successfully."
          : "Job completed successfully."
      );
      onClose();
    } catch (error: any) {
      console.log(error, "Error...RentalEase");
      console.error("Job completion failed", error);
      Alert.alert(
        "Unable to complete job",
        error?.message || "Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTemplateSelect = (template: InspectionTemplate) => {
    setSelectedTemplate(template);
    setFormValues(initializeFormValues(template));
    setMediaByField({});
    setNotes("");
    setInspectionReportId(null);
    setInspectionReportUrl(undefined);
  };

  const handleValueChange = (
    sectionId: string,
    fieldId: string,
    value: any
  ) => {
    setFormValues((prev) => ({
      ...prev,
      [sectionId]: {
        ...(prev[sectionId] || {}),
        [fieldId]: value,
      },
    }));
    setInspectionReportId(null);
    setInspectionReportUrl(undefined);
  };

  const handleAddMedia = (fieldId: string, media: InspectionMediaUpload) => {
    setMediaByField((prev) => ({
      ...prev,
      [fieldId]: [...(prev[fieldId] || []), media],
    }));
    setInspectionReportId(null);
    setInspectionReportUrl(undefined);
  };

  const handleRemoveMedia = (fieldId: string, index: number) => {
    setMediaByField((prev) => ({
      ...prev,
      [fieldId]: (prev[fieldId] || []).filter((_, i) => i !== index),
    }));
    setInspectionReportId(null);
    setInspectionReportUrl(undefined);
  };

  const calculateTotals = () => {
    const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = (subtotal * taxPercentage) / 100;
    const total = subtotal + taxAmount;
    return { subtotal, taxAmount, total };
  };

  const updateLineItem = (
    id: string,
    field: keyof InvoiceLineItem,
    value: string | number
  ) => {
    setLineItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === "quantity" || field === "rate") {
            const quantity = Number(updated.quantity) || 0;
            const rate = Number(updated.rate) || 0;
            updated.amount = quantity * rate;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const addLineItem = () => {
    setLineItems((prev) => [...prev, defaultLineItem()]);
  };

  const removeLineItem = (id: string) => {
    setLineItems((prev) =>
      prev.length === 1 ? prev : prev.filter((item) => item.id !== id)
    );
  };

  const renderStepContent = () => {
    if (loadingTemplates) {
      return (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[styles.loaderText, { color: theme.textSecondary }]}>
            Loading templates…
          </Text>
        </View>
      );
    }

    if (templateError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, { color: theme.error }]}>
            {templateError}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: theme.primary }]}
            onPress={loadTemplates}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const stepKey: StepKey = steps[currentStepIndex].key;

    switch (stepKey) {
      case "template":
        return (
          <ScrollView style={styles.stepScroll}>
            <Text style={[styles.stepHeading, { color: theme.text }]}>
              Choose inspection template
            </Text>
            <Text
              style={[styles.stepSubheading, { color: theme.textSecondary }]}
            >
              Select the form that matches the work carried out on this job.
            </Text>
            <View style={styles.templateGrid}>
              {templates.map((template) => {
                const isSelected =
                  selectedTemplate?.jobType === template.jobType &&
                  selectedTemplate?.version === template.version;
                const highlight = isSelected;
                return (
                  <TouchableOpacity
                    key={`${template.jobType}-${template.version}`}
                    style={[
                      styles.templateCard,
                      {
                        borderColor: highlight ? theme.primary : theme.border,
                        backgroundColor: highlight
                          ? theme.primary + "10"
                          : theme.card,
                      },
                    ]}
                    onPress={() => handleTemplateSelect(template)}
                  >
                    <View style={styles.templateHeader}>
                      <MaterialCommunityIcons
                        name={isSelected ? "clipboard-check" : "clipboard-text"}
                        size={24}
                        color={highlight ? theme.primary : theme.textSecondary}
                      />
                      <Text
                        style={[styles.templateJobType, { color: theme.text }]}
                      >
                        {template.jobType}
                      </Text>
                    </View>
                    <Text style={[styles.templateTitle, { color: theme.text }]}>
                      {template.title}
                    </Text>
                    <Text
                      style={[
                        styles.templateMeta,
                        { color: theme.textSecondary },
                      ]}
                    >
                      {`Version ${template.version}`}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              {templates.length === 0 && (
                <Text
                  style={[styles.emptyText, { color: theme.textSecondary }]}
                >
                  No templates configured yet.
                </Text>
              )}
            </View>
          </ScrollView>
        );
      case "form":
        if (!selectedTemplate) {
          return (
            <View style={styles.errorContainer}>
              <Text style={[styles.errorText, { color: theme.error }]}>
                Select a template to continue.
              </Text>
            </View>
          );
        }
        return (
          <ScrollView style={styles.stepScroll}>
            <View
              style={[
                styles.infoCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Text style={[styles.infoTitle, { color: theme.text }]}>
                {selectedTemplate.title}
              </Text>
              <Text style={[styles.infoSub, { color: theme.textSecondary }]}>
                {`Job Type: ${selectedTemplate.jobType} · Version ${selectedTemplate.version}`}
              </Text>
            </View>
            <InspectionForm
              template={selectedTemplate}
              values={formValues}
              mediaByField={mediaByField}
              onChange={handleValueChange}
              onAddMedia={handleAddMedia}
              onRemoveMedia={handleRemoveMedia}
              notes={notes}
              onNotesChange={(val) => {
                setNotes(val);
                setInspectionReportId(null);
                setInspectionReportUrl(undefined);
              }}
            />
          </ScrollView>
        );
      case "invoice":
      default:
        const { subtotal, taxAmount, total } = calculateTotals();
        return (
          <ScrollView style={styles.stepScroll}>
            {inspectionReportId && (
              <View
                style={[
                  styles.infoCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <View style={styles.infoRow}>
                  <MaterialCommunityIcons
                    name="file-check"
                    size={20}
                    color={theme.success || "#10B981"}
                  />
                  <Text style={[styles.infoTitle, { color: theme.text }]}>
                    Inspection saved
                  </Text>
                </View>
                <Text style={[styles.infoSub, { color: theme.textSecondary }]}>
                  {inspectionReportUrl
                    ? "A PDF report has been generated and linked to this job."
                    : "Inspection data is ready for submission."}
                </Text>
              </View>
            )}

            <View
              style={[
                styles.toggleCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Attach Invoice
                </Text>
                <Text
                  style={[
                    styles.sectionDescription,
                    { color: theme.textSecondary },
                  ]}
                >
                  Generate an invoice for additional charges or materials.
                </Text>
              </View>
              <Switch
                value={hasInvoice}
                onValueChange={setHasInvoice}
                trackColor={{ false: theme.disabled, true: theme.primary }}
                thumbColor={hasInvoice ? theme.surface : theme.textSecondary}
              />
            </View>

            {hasInvoice && (
              <View
                style={[
                  styles.invoiceContainer,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
              >
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  Invoice Details
                </Text>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>
                    Description *
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      { borderColor: theme.border, color: theme.text },
                    ]}
                    value={invoiceDescription}
                    onChangeText={setInvoiceDescription}
                    placeholder="Enter invoice description"
                    placeholderTextColor={theme.placeholder}
                    multiline
                  />
                </View>

                <Text
                  style={[
                    styles.sectionTitle,
                    { color: theme.text, marginTop: 12 },
                  ]}
                >
                  Line Items
                </Text>
                {lineItems.map((item, index) => (
                  <View
                    key={item.id}
                    style={[styles.lineItemCard, { borderColor: theme.border }]}
                  >
                    <View style={styles.lineItemHeader}>
                      <Text
                        style={[styles.lineItemTitle, { color: theme.text }]}
                      >
                        {`Item ${index + 1}`}
                      </Text>
                      {lineItems.length > 1 && (
                        <TouchableOpacity
                          onPress={() => removeLineItem(item.id)}
                        >
                          <MaterialCommunityIcons
                            name="delete-outline"
                            size={20}
                            color={theme.error}
                          />
                        </TouchableOpacity>
                      )}
                    </View>
                    <View style={styles.inputGroup}>
                      <Text style={[styles.inputLabel, { color: theme.text }]}>
                        Name *
                      </Text>
                      <TextInput
                        style={[
                          styles.textInput,
                          { borderColor: theme.border, color: theme.text },
                        ]}
                        value={item.name}
                        onChangeText={(text) =>
                          updateLineItem(item.id, "name", text)
                        }
                        placeholder="Line item description"
                        placeholderTextColor={theme.placeholder}
                      />
                    </View>
                    <View style={styles.lineItemRow}>
                      <View style={styles.lineItemInputSmall}>
                        <Text
                          style={[styles.inputLabel, { color: theme.text }]}
                        >
                          Qty *
                        </Text>
                        <TextInput
                          style={[
                            styles.textInput,
                            { borderColor: theme.border, color: theme.text },
                          ]}
                          value={String(item.quantity)}
                          keyboardType="numeric"
                          onChangeText={(text) =>
                            updateLineItem(
                              item.id,
                              "quantity",
                              parseInt(text, 10) || 0
                            )
                          }
                          placeholder="1"
                          placeholderTextColor={theme.placeholder}
                        />
                      </View>
                      <View style={styles.lineItemInputSmall}>
                        <Text
                          style={[styles.inputLabel, { color: theme.text }]}
                        >
                          Rate *
                        </Text>
                        <TextInput
                          style={[
                            styles.textInput,
                            { borderColor: theme.border, color: theme.text },
                          ]}
                          value={String(item.rate)}
                          keyboardType="decimal-pad"
                          onChangeText={(text) =>
                            updateLineItem(
                              item.id,
                              "rate",
                              parseFloat(text) || 0
                            )
                          }
                          placeholder="0.00"
                          placeholderTextColor={theme.placeholder}
                        />
                      </View>
                      <View style={styles.lineItemInputSmall}>
                        <Text
                          style={[styles.inputLabel, { color: theme.text }]}
                        >
                          Amount
                        </Text>
                        <TextInput
                          style={[
                            styles.textInput,
                            { borderColor: theme.border, color: theme.text },
                          ]}
                          value={`$${item.amount.toFixed(2)}`}
                          editable={false}
                        />
                      </View>
                    </View>
                  </View>
                ))}

                <TouchableOpacity
                  style={styles.addItemButton}
                  onPress={addLineItem}
                >
                  <MaterialCommunityIcons
                    name="plus-circle"
                    size={18}
                    color={theme.primary}
                  />
                  <Text style={[styles.addItemText, { color: theme.primary }]}>
                    Add line item
                  </Text>
                </TouchableOpacity>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>
                    Tax %
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      { borderColor: theme.border, color: theme.text },
                    ]}
                    value={String(taxPercentage)}
                    keyboardType="numeric"
                    onChangeText={(text) =>
                      setTaxPercentage(parseFloat(text) || 0)
                    }
                    placeholder="10"
                    placeholderTextColor={theme.placeholder}
                  />
                </View>

                <View style={styles.summaryRow}>
                  <Text
                    style={[
                      styles.summaryLabel,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Subtotal
                  </Text>
                  <Text style={[styles.summaryValue, { color: theme.text }]}>
                    ${subtotal.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text
                    style={[
                      styles.summaryLabel,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Tax
                  </Text>
                  <Text style={[styles.summaryValue, { color: theme.text }]}>
                    ${taxAmount.toFixed(2)}
                  </Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text
                    style={[
                      styles.summaryLabel,
                      styles.summaryTotal,
                      { color: theme.text },
                    ]}
                  >
                    Total
                  </Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      styles.summaryTotal,
                      { color: theme.text },
                    ]}
                  >
                    ${total.toFixed(2)}
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: theme.text }]}>
                    Notes
                  </Text>
                  <TextInput
                    style={[
                      styles.textInput,
                      { borderColor: theme.border, color: theme.text },
                    ]}
                    value={invoiceNotes}
                    onChangeText={setInvoiceNotes}
                    placeholder="Optional notes"
                    placeholderTextColor={theme.placeholder}
                    multiline
                  />
                </View>
              </View>
            )}
          </ScrollView>
        );
    }
  };

  const renderFooterActions = () => {
    const stepKey: StepKey = steps[currentStepIndex].key;

    const primaryLabel =
      stepKey === "template"
        ? "Continue"
        : stepKey === "form"
        ? "Continue"
        : "Complete Job";

    const primaryAction =
      stepKey === "template"
        ? handleTemplateContinue
        : stepKey === "form"
        ? handleFormContinue
        : handleSubmit;

    return (
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerSecondary}
          onPress={onClose}
          disabled={isSubmitting}
        >
          <Text
            style={[styles.footerSecondaryText, { color: theme.textSecondary }]}
          >
            Cancel
          </Text>
        </TouchableOpacity>

        {currentStepIndex > 0 && (
          <TouchableOpacity
            style={styles.footerSecondary}
            onPress={() => goToStep(currentStepIndex - 1)}
            disabled={isSubmitting}
          >
            <Text
              style={[
                styles.footerSecondaryText,
                { color: theme.textSecondary },
              ]}
            >
              Back
            </Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[
            styles.footerPrimary,
            { backgroundColor: theme.primary, opacity: isSubmitting ? 0.7 : 1 },
          ]}
          onPress={primaryAction}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.footerPrimaryText}>{primaryLabel}</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Complete Job
          </Text>
          <TouchableOpacity onPress={onClose}>
            <MaterialCommunityIcons name="close" size={24} color={theme.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.stepIndicator}>
          {steps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isCompleted = index < currentStepIndex;
            return (
              <View key={step.key} style={styles.stepItem}>
                <View
                  style={[
                    styles.stepCircle,
                    {
                      backgroundColor:
                        isCompleted || isActive ? theme.primary : theme.border,
                    },
                  ]}
                >
                  <Text style={styles.stepCircleText}>{index + 1}</Text>
                </View>
                <Text
                  style={[
                    styles.stepLabel,
                    {
                      color: isActive ? theme.primary : theme.textSecondary,
                      fontWeight: isActive ? "700" : "500",
                    },
                  ]}
                >
                  {step.label}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.content}>{renderStepContent()}</View>
        {renderFooterActions()}
      </View>
    </Modal>
  );
};

const validateRequiredFields = (
  template: InspectionTemplate,
  values: InspectionFormValues,
  media: Record<string, InspectionMediaUpload[]>
): string[] => {
  const missing: string[] = [];
  template.sections.forEach((section) => {
    const sectionValues = values[section.id] || {};
    section.fields.forEach((field) => {
      if (!field.required) return;
      const value = sectionValues[field.id];
      if (field.type === "photo" || field.type === "photo-multi") {
        const attachments = media[field.id] || [];
        if (!attachments.length) {
          missing.push(field.label);
        }
        return;
      }
      if (field.type === "table") {
        const rows = Array.isArray(value) ? value : [];
        if (!rows.length) {
          missing.push(field.label);
          return;
        }
        const requiredColumns = field.columns?.filter((column) => column.required);
        if (requiredColumns && requiredColumns.length) {
          const hasIncompleteRow = rows.some((row: Record<string, any>) =>
            requiredColumns.some(
              (column) =>
                row[column.id] === undefined || row[column.id] === null || row[column.id] === ""
            )
          );
          if (hasIncompleteRow) {
            missing.push(`${field.label} (complete required columns)`);
            return;
          }
        }
      }
      if (value === undefined || value === null || value === "") {
        missing.push(field.label);
        return;
      }
      if (Array.isArray(value) && value.length === 0) {
        missing.push(field.label);
      }
    });
  });
  return missing;
};

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderColor: theme.border,
    },
    headerTitle: {
      fontSize: 20,
      fontWeight: "700",
    },
    stepIndicator: {
      flexDirection: "row",
      justifyContent: "space-around",
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderColor: theme.border,
      backgroundColor: isDark ? theme.surface : theme.background,
    },
    stepItem: {
      alignItems: "center",
      flex: 1,
    },
    stepCircle: {
      width: 28,
      height: 28,
      borderRadius: 14,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 4,
    },
    stepCircleText: {
      color: "#fff",
      fontWeight: "700",
    },
    stepLabel: {
      fontSize: 12,
      textAlign: "center",
    },
    content: {
      flex: 1,
      padding: 20,
    },
    loaderContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 40,
    },
    loaderText: {
      marginTop: 12,
      fontSize: 14,
    },
    errorContainer: {
      alignItems: "center",
      paddingVertical: 40,
    },
    errorText: {
      fontSize: 14,
      marginBottom: 16,
      textAlign: "center",
    },
    retryButton: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 8,
    },
    retryText: {
      color: "#fff",
      fontWeight: "600",
    },
    stepScroll: {
      flex: 1,
    },
    stepHeading: {
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 4,
    },
    stepSubheading: {
      fontSize: 14,
      marginBottom: 16,
    },
    templateGrid: {
      gap: 12,
    },
    templateCard: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
    },
    templateHeader: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 8,
    },
    templateJobType: {
      fontSize: 16,
      fontWeight: "600",
    },
    templateTitle: {
      fontSize: 15,
      fontWeight: "600",
      marginBottom: 6,
    },
    templateMeta: {
      fontSize: 12,
    },
    emptyText: {
      textAlign: "center",
      marginTop: 24,
    },
    infoCard: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
    },
    infoTitle: {
      fontSize: 16,
      fontWeight: "700",
    },
    infoSub: {
      fontSize: 13,
      marginTop: 4,
    },
    infoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    toggleCard: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "600",
    },
    sectionDescription: {
      fontSize: 13,
      marginTop: 4,
    },
    invoiceContainer: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 16,
      gap: 16,
    },
    inputGroup: {
      gap: 6,
    },
    inputLabel: {
      fontSize: 13,
      fontWeight: "600",
    },
    textInput: {
      borderWidth: 1,
      borderRadius: 8,
      paddingHorizontal: 12,
      paddingVertical: 10,
      fontSize: 14,
    },
    lineItemCard: {
      borderWidth: 1,
      borderRadius: 10,
      padding: 12,
      gap: 12,
    },
    lineItemHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    lineItemTitle: {
      fontSize: 14,
      fontWeight: "600",
    },
    lineItemRow: {
      flexDirection: "row",
      gap: 12,
    },
    lineItemInputSmall: {
      flex: 1,
    },
    addItemButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      alignSelf: "flex-start",
    },
    addItemText: {
      fontWeight: "600",
    },
    summaryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginTop: 4,
    },
    summaryLabel: {
      fontSize: 14,
    },
    summaryValue: {
      fontSize: 14,
      fontWeight: "600",
    },
    summaryTotal: {
      fontSize: 15,
    },
    footer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderTopWidth: 1,
      borderColor: theme.border,
      gap: 12,
    },
    footerSecondary: {
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    footerSecondaryText: {
      fontWeight: "600",
    },
    footerPrimary: {
      flex: 1,
      borderRadius: 10,
      paddingVertical: 14,
      alignItems: "center",
      justifyContent: "center",
    },
    footerPrimaryText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "700",
    },
  });

export { JobCompletionModal };
export default JobCompletionModal;
