import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Modal from 'react-native-modal';
import { Ionicons } from '@expo/vector-icons';
import { useNotifications } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';

interface NotificationModalProps {
  isVisible: boolean;
  onClose: () => void;
}

const NotificationModal: React.FC<NotificationModalProps> = ({ isVisible, onClose }) => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, removeNotification } = useNotifications();
  const { isDarkMode } = useTheme();

  const getIcon = (type: string) => {
    switch (type) {
      case 'budget': return 'warning';
      case 'goal': return 'trophy';
      case 'expense': return 'trending-up';
      default: return 'information-circle';
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'budget': return '#F59E0B';
      case 'goal': return '#3B82F6';
      case 'expense': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={onClose}
      style={styles.modal}
      backdropOpacity={0.5}
      animationIn="slideInRight"
      animationOut="slideOutRight"
    >
      <View style={[styles.container, isDarkMode && styles.containerDark]}>
        {/* Header */}
        <View style={[styles.header, isDarkMode && styles.headerDark]}>
          <View style={styles.headerLeft}>
            <Text style={[styles.title, isDarkMode && styles.titleDark]}>Notifications</Text>
            {unreadCount > 0 && (
              <TouchableOpacity onPress={markAllAsRead}>
                <Text style={styles.markAllRead}>Mark all read</Text>
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={isDarkMode ? '#9CA3AF' : '#6B7280'} />
          </TouchableOpacity>
        </View>

        {/* Notifications List */}
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {notifications.length > 0 ? (
            notifications.map((notification) => (
              <View
                key={notification.id}
                style={[
                  styles.notificationItem,
                  isDarkMode && styles.notificationItemDark,
                  !notification.read && styles.unreadItem,
                  !notification.read && isDarkMode && styles.unreadItemDark,
                ]}
              >
                <View style={styles.notificationContent}>
                  <View style={styles.notificationHeader}>
                    <View style={styles.iconContainer}>
                      <Ionicons
                        name={getIcon(notification.type)}
                        size={16}
                        color={getIconColor(notification.type)}
                      />
                    </View>
                    <View style={styles.notificationText}>
                      <Text style={[styles.notificationTitle, isDarkMode && styles.textDark]}>
                        {notification.title}
                      </Text>
                      <Text style={[styles.notificationMessage, isDarkMode && styles.textSecondaryDark]}>
                        {notification.message}
                      </Text>
                      <Text style={[styles.notificationTime, isDarkMode && styles.textSecondaryDark]}>
                        {formatTime(notification.timestamp)}
                      </Text>
                    </View>
                    <View style={styles.actions}>
                      {!notification.read && (
                        <TouchableOpacity
                          onPress={() => markAsRead(notification.id)}
                          style={styles.actionButton}
                        >
                          <Ionicons name="checkmark" size={16} color="#3B82F6" />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        onPress={() => removeNotification(notification.id)}
                        style={styles.actionButton}
                      >
                        <Ionicons name="close" size={16} color="#6B7280" />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-outline" size={48} color="#9CA3AF" />
              <Text style={[styles.emptyText, isDarkMode && styles.textSecondaryDark]}>
                No notifications
              </Text>
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    margin: 0,
    justifyContent: 'flex-end',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    minHeight: '50%',
  },
  containerDark: {
    backgroundColor: '#1F2937',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerDark: {
    borderBottomColor: '#374151',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  titleDark: {
    color: '#FFFFFF',
  },
  markAllRead: {
    fontSize: 14,
    fontWeight: '500',
    color: '#3B82F6',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  notificationItem: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  notificationItemDark: {
    backgroundColor: '#374151',
    borderColor: '#4B5563',
  },
  unreadItem: {
    backgroundColor: '#EBF8FF',
    borderColor: '#3B82F6',
  },
  unreadItemDark: {
    backgroundColor: '#1E3A8A',
    borderColor: '#3B82F6',
  },
  notificationContent: {
    padding: 12,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationText: {
    flex: 1,
  },
  notificationTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  notificationMessage: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 11,
    color: '#9CA3AF',
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
  textDark: {
    color: '#FFFFFF',
  },
  textSecondaryDark: {
    color: '#9CA3AF',
  },
});

export default NotificationModal;