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

interface CategoryPickerProps {
  selectedCategory: string;
  onCategorySelect: (category: string) => void;
  disabled?: boolean;
}

const EXPENSE_CATEGORIES = [
  { name: 'Food & Drinks', icon: 'restaurant' },
  { name: 'Transport', icon: 'car' },
  { name: 'Utilities', icon: 'flash' },
  { name: 'Shopping', icon: 'bag' },
  { name: 'Electronics & Gadgets', icon: 'phone-portrait' },
  { name: 'Healthcare', icon: 'medical' },
  { name: 'Education', icon: 'school' },
  { name: 'Rent', icon: 'home' },
  { name: 'Bills', icon: 'receipt' },
  { name: 'Entertainment', icon: 'game-controller' },
  { name: 'Investments', icon: 'trending-up' },
  { name: 'Personal Care', icon: 'cut' },
  { name: 'Family & Kids', icon: 'people' },
  { name: 'Charity & Donations', icon: 'heart' },
  { name: 'Miscellaneous', icon: 'ellipsis-horizontal' },
];

const CategoryPicker: React.FC<CategoryPickerProps> = ({
  selectedCategory,
  onCategorySelect,
  disabled = false,
}) => {
  const [showModal, setShowModal] = useState(false);

  const selectedCategoryData = EXPENSE_CATEGORIES.find(
    cat => cat.name === selectedCategory
  );

  const handleCategorySelect = (category: string) => {
    onCategorySelect(category);
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
          {selectedCategoryData && (
            <Ionicons
              name={selectedCategoryData.icon as any}
              size={20}
              color={disabled ? '#9CA3AF' : '#6B7280'}
              style={styles.categoryIcon}
            />
          )}
          <Text style={[styles.pickerText, disabled && styles.disabledText]}>
            {selectedCategory || 'Select category'}
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
            <Text style={styles.modalTitle}>Select Category</Text>
            <View style={styles.placeholder} />
          </View>

          <ScrollView style={styles.categoriesList}>
            {EXPENSE_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.name}
                style={[
                  styles.categoryItem,
                  selectedCategory === category.name && styles.selectedCategoryItem,
                ]}
                onPress={() => handleCategorySelect(category.name)}
              >
                <View style={styles.categoryItemContent}>
                  <Ionicons
                    name={category.icon as any}
                    size={24}
                    color={selectedCategory === category.name ? '#3B82F6' : '#6B7280'}
                  />
                  <Text
                    style={[
                      styles.categoryItemText,
                      selectedCategory === category.name && styles.selectedCategoryText,
                    ]}
                  >
                    {category.name}
                  </Text>
                </View>
                {selectedCategory === category.name && (
                  <Ionicons name="checkmark" size={20} color="#3B82F6" />
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
  categoryIcon: {
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
  categoriesList: {
    flex: 1,
    padding: 20,
  },
  categoryItem: {
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
  selectedCategoryItem: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  categoryItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryItemText: {
    fontSize: 16,
    color: '#1F2937',
    marginLeft: 12,
  },
  selectedCategoryText: {
    color: '#3B82F6',
    fontWeight: '500',
  },
});

export default CategoryPicker;