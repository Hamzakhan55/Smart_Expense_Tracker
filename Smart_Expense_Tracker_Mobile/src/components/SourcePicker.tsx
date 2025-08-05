import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SourcePickerProps {
  selectedSource: string;
  onSourceSelect: (source: string) => void;
  disabled?: boolean;
}

const INCOME_SOURCES = [
  { name: 'Salary', icon: 'briefcase' },
  { name: 'Freelance Work', icon: 'laptop' },
  { name: 'Business Income', icon: 'business' },
  { name: 'Investment Returns', icon: 'trending-up' },
  { name: 'Rental Income', icon: 'home' },
  { name: 'Side Hustle', icon: 'flash' },
  { name: 'Bonus', icon: 'gift' },
  { name: 'Commission', icon: 'card' },
  { name: 'Dividend', icon: 'stats-chart' },
  { name: 'Interest', icon: 'cash' },
  { name: 'Refund', icon: 'return-up-back' },
  { name: 'Gift/Donation', icon: 'heart' },
  { name: 'Other', icon: 'ellipsis-horizontal' },
];

const SourcePicker: React.FC<SourcePickerProps> = ({
  selectedSource,
  onSourceSelect,
  disabled = false,
}) => {
  const [showModal, setShowModal] = useState(false);

  const selectedSourceData = INCOME_SOURCES.find(
    source => source.name === selectedSource
  );

  const handleSourceSelect = (source: string) => {
    onSourceSelect(source);
    setShowModal(false);
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.picker, disabled && styles.disabledPicker]}
        onPress={() => !disabled && setShowModal(true)}
        disabled={disabled}
      >
        <View style={styles.pickerContent}>
          {selectedSourceData && (
            <Ionicons
              name={selectedSourceData.icon as any}
              size={20}
              color={disabled ? '#9CA3AF' : '#6B7280'}
              style={styles.sourceIcon}
            />
          )}
          <Text style={[styles.pickerText, disabled && styles.disabledText]}>
            {selectedSource || 'Select income source'}
          </Text>
        </View>
        {!disabled && (
          <Ionicons name="chevron-down" size={20} color="#6B7280" />
        )}
      </TouchableOpacity>

      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowModal(false)}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Select Income Source</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.sourcesList}>
            {INCOME_SOURCES.map((source) => (
              <TouchableOpacity
                key={source.name}
                style={[
                  styles.sourceItem,
                  selectedSource === source.name && styles.selectedSourceItem,
                ]}
                onPress={() => handleSourceSelect(source.name)}
              >
                <View style={styles.sourceItemContent}>
                  <Ionicons
                    name={source.icon as any}
                    size={24}
                    color={selectedSource === source.name ? '#10B981' : '#6B7280'}
                  />
                  <Text
                    style={[
                      styles.sourceItemText,
                      selectedSource === source.name && styles.selectedSourceText,
                    ]}
                  >
                    {source.name}
                  </Text>
                </View>
                {selectedSource === source.name && (
                  <Ionicons name="checkmark" size={20} color="#10B981" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  picker: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  disabledPicker: {
    backgroundColor: '#F3F4F6',
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sourceIcon: {
    marginRight: 12,
  },
  pickerText: {
    fontSize: 16,
    color: '#1F2937',
  },
  disabledText: {
    color: '#9CA3AF',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  cancelText: {
    fontSize: 16,
    color: '#6B7280',
  },
  placeholder: {
    width: 60,
  },
  sourcesList: {
    flex: 1,
    padding: 20,
  },
  sourceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  selectedSourceItem: {
    borderColor: '#10B981',
    backgroundColor: '#ECFDF5',
  },
  sourceItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sourceItemText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
  selectedSourceText: {
    color: '#10B981',
    fontWeight: '500',
  },
});

export default SourcePicker;