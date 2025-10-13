import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Switch,
  Image,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "../contexts/ThemeContext";
import type {
  InspectionTemplate,
  InspectionField,
  InspectionMediaUpload,
} from "@services/jobs";

export type InspectionFormValues = Record<string, Record<string, any>>;

interface InspectionFormProps {
  template: InspectionTemplate;
  values: InspectionFormValues;
  mediaByField: Record<string, InspectionMediaUpload[]>;
  onChange: (sectionId: string, fieldId: string, value: any) => void;
  onAddMedia: (fieldId: string, media: InspectionMediaUpload) => void;
  onRemoveMedia: (fieldId: string, index: number) => void;
  notes: string;
  onNotesChange: (val: string) => void;
  editable?: boolean;
}

const InspectionForm: React.FC<InspectionFormProps> = ({
  template,
  values,
  mediaByField,
  onChange,
  onAddMedia,
  onRemoveMedia,
  notes,
  onNotesChange,
  editable = true,
}) => {
  const { theme } = useTheme();

  const handlePickImage = async (
    field: InspectionField,
    currentCount: number
  ) => {
    if (!editable) return;

    const maxPhotos =
      typeof field.metadata?.max === "number" ? field.metadata.max : undefined;
    if (maxPhotos && currentCount >= maxPhotos) {
      Alert.alert(
        "Limit reached",
        `You can attach up to ${maxPhotos} photo${
          maxPhotos > 1 ? "s" : ""
        } for ${field.label}.`
      );
      return;
    }
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission required",
        "Camera roll permission is needed to attach inspection photos."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: false,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled && result.assets?.length) {
      const asset = result.assets[0];
      const media: InspectionMediaUpload = {
        uri: asset.uri,
        name:
          asset.fileName ||
          `${field.id}-${Date.now()}.${asset.mimeType?.split("/").pop() || "jpg"}`,
        type: asset.mimeType || "image/jpeg",
        size: asset.fileSize,
      };
      onAddMedia(field.id, media);
    }
  };

  const toggleBoolean = (sectionId: string, fieldId: string, current: boolean) => {
    onChange(sectionId, fieldId, !current);
  };

  const toggleMultiSelect = (
    sectionId: string,
    field: InspectionField,
    optionValue: string
  ) => {
    const current = values[sectionId]?.[field.id] || [];
    const exists = current.includes(optionValue);
    const nextValue = exists
      ? current.filter((val: string) => val !== optionValue)
      : [...current, optionValue];
    onChange(sectionId, field.id, nextValue);
  };

  const renderField = (sectionId: string, field: InspectionField) => {
    const sectionValues = values[sectionId] || {};
    const fieldValue = sectionValues[field.id];
    const mediaForField = mediaByField[field.id] || [];

    switch (field.type) {
      case "text":
      case "textarea":
        return (
          <TextInput
            style={[styles.textInput, { borderColor: theme.border, color: theme.text }]}
            value={fieldValue ?? ""}
            onChangeText={(text) => onChange(sectionId, field.id, text)}
            placeholder={field.placeholder || "Enter value"}
            placeholderTextColor={theme.placeholder}
            multiline={field.type === "textarea"}
            numberOfLines={field.type === "textarea" ? 4 : 1}
            editable={editable}
          />
        );
      case "number":
        return (
          <TextInput
            style={[styles.textInput, { borderColor: theme.border, color: theme.text }]}
            value={fieldValue !== undefined ? String(fieldValue) : ""}
            onChangeText={(text) => {
              const numeric = text === "" ? null : Number(text.replace(/[^0-9.-]/g, ""));
              onChange(sectionId, field.id, isNaN(numeric as number) ? null : numeric);
            }}
            keyboardType="numeric"
            placeholder={field.placeholder || "0"}
            placeholderTextColor={theme.placeholder}
            editable={editable}
          />
        );
      case "boolean":
        return (
          <View style={styles.booleanRow}>
            <Switch
              value={!!fieldValue}
              onValueChange={() => toggleBoolean(sectionId, field.id, !!fieldValue)}
              trackColor={{ false: theme.disabled, true: theme.primary }}
              thumbColor={!!fieldValue ? theme.surface : theme.textSecondary}
              disabled={!editable}
            />
            <Text style={[styles.booleanLabel, { color: theme.textSecondary }]}>
              {fieldValue ? "Yes" : "No"}
            </Text>
          </View>
        );
      case "select":
        return (
          <View style={styles.optionList}>
            {(field.options || []).map((option) => {
              const isSelected = fieldValue === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionChip,
                    {
                      borderColor: isSelected ? theme.primary : theme.border,
                      backgroundColor: isSelected
                        ? theme.primary
                        : theme.card,
                    },
                  ]}
                  onPress={() => editable && onChange(sectionId, field.id, option.value)}
                  disabled={!editable}
                >
                  <Text
                    style={{
                      color: isSelected ? "#fff" : theme.text,
                      fontWeight: isSelected ? "600" : "500",
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      case "multi-select":
        return (
          <View style={styles.optionList}>
            {(field.options || []).map((option) => {
              const selectedValues = fieldValue || [];
              const isSelected = selectedValues.includes(option.value);
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.optionChip,
                    {
                      borderColor: isSelected ? theme.primary : theme.border,
                      backgroundColor: isSelected
                        ? theme.primary
                        : theme.card,
                    },
                  ]}
                  onPress={() => editable && toggleMultiSelect(sectionId, field, option.value)}
                  disabled={!editable}
                >
                  <Text
                    style={{
                      color: isSelected ? "#fff" : theme.text,
                      fontWeight: isSelected ? "600" : "500",
                    }}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        );
      case "photo":
      case "photo-multi": {
        const maxPhotos =
          typeof field.metadata?.max === "number" ? field.metadata.max : undefined;
        const canAdd = maxPhotos ? mediaForField.length < maxPhotos : true;
        return (
          <View>
            <View style={styles.mediaRow}>
              {mediaForField.map((item, index) => (
                <View key={`${item.uri}-${index}`} style={styles.mediaThumb}>
                  <Image source={{ uri: item.uri }} style={styles.mediaImage} />
                  {editable && (
                    <TouchableOpacity
                      style={styles.mediaRemove}
                      onPress={() => onRemoveMedia(field.id, index)}
                    >
                      <MaterialCommunityIcons
                        name="close-circle"
                        size={18}
                        color={theme.error}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              ))}
              {editable && (
                <TouchableOpacity
                  style={[styles.mediaAddButton, { borderColor: theme.border }]}
                  onPress={() => handlePickImage(field, mediaForField.length)}
                  disabled={!canAdd}
                >
                  <MaterialCommunityIcons
                    name="camera-plus"
                    size={24}
                    color={canAdd ? theme.primary : theme.textSecondary}
                  />
                </TouchableOpacity>
              )}
            </View>
            {field.helpText && (
              <Text style={[styles.helpText, { color: theme.textSecondary }]}>
                {field.helpText}
              </Text>
            )}
          </View>
        );
      }
      default:
        return (
          <Text style={[styles.unsupported, { color: theme.textSecondary }]}>
            {`Field type "${field.type}" is not yet supported on mobile.`}
          </Text>
        );
    }
  };

  return (
    <View>
      {template.sections.map((section) => (
        <View
          key={section.id}
          style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}> {section.title} </Text>
          {section.description ? (
            <Text style={[styles.sectionDescription, { color: theme.textSecondary }]}>
              {section.description}
            </Text>
          ) : null}

          {section.fields.map((field) => (
            <View key={field.id} style={styles.fieldBlock}>
              <View style={styles.fieldLabelRow}>
                <Text style={[styles.fieldLabel, { color: theme.text }]}>
                  {field.label}
                  {field.required ? " *" : ""}
                </Text>
              </View>
              {field.helpText ? (
                <Text style={[styles.helpText, { color: theme.textSecondary }]}>
                  {field.helpText}
                </Text>
              ) : null}
              {renderField(section.id, field)}
            </View>
          ))}
        </View>
      ))}

      <View
        style={[styles.sectionCard, { backgroundColor: theme.card, borderColor: theme.border }]}
      >
        <Text style={[styles.sectionTitle, { color: theme.text }]}>Technician Notes</Text>
        <TextInput
          style={[styles.textArea, { borderColor: theme.border, color: theme.text }]}
          placeholder="Add any additional observations"
          placeholderTextColor={theme.placeholder}
          value={notes}
          onChangeText={onNotesChange}
          multiline
          numberOfLines={5}
          editable={editable}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sectionCard: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 13,
    marginBottom: 12,
  },
  fieldBlock: {
    marginBottom: 16,
  },
  fieldLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    minHeight: 120,
    textAlignVertical: "top",
  },
  booleanRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  booleanLabel: {
    marginLeft: 12,
    fontSize: 14,
  },
  optionList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  mediaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  mediaThumb: {
    width: 72,
    height: 72,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  mediaImage: {
    width: "100%",
    height: "100%",
  },
  mediaRemove: {
    position: "absolute",
    top: -6,
    right: -6,
  },
  mediaAddButton: {
    width: 72,
    height: 72,
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
  },
  helpText: {
    fontSize: 12,
    marginTop: 4,
  },
  unsupported: {
    fontSize: 13,
    fontStyle: "italic",
  },
});

export default InspectionForm;
