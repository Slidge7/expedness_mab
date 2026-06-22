import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useNavigation, useRoute, useIsFocused } from '@react-navigation/native';
import {
  clientService,
  ClientDTO,
  ContactDTO,
} from '../api/clientService';
import { theme } from '../../../theme';
import { useTranslation } from 'react-i18next';

export const ClientDetailScreen = () => {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const route = useRoute<any>();
  const clientId = route.params?.clientId as number;
  const isFocused = useIsFocused();

  const [client, setClient] = useState<ClientDTO | null>(null);
  const [contacts, setContacts] = useState<ContactDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<ContactDTO | null>(null);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    notes: '',
  });

  const loadData = async () => {
    try {
      const [clientData, contactData] = await Promise.all([
        clientService.getById(clientId),
        clientService.getContacts(clientId),
      ]);
      setClient(clientData);
      setContacts(contactData);
    } catch (e) {
      Alert.alert(t('common.error'), 'Failed to load client details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [clientId, isFocused]);

  const openAddContact = () => {
    setEditingContact(null);
    setContactForm({ name: '', email: '', phone: '', role: '', notes: '' });
    setModalOpen(true);
  };

  const openEditContact = (contact: ContactDTO) => {
    setEditingContact(contact);
    setContactForm({
      name: contact.name,
      email: contact.email || '',
      phone: contact.phone || '',
      role: contact.role || '',
      notes: contact.notes || '',
    });
    setModalOpen(true);
  };

  const saveContact = async () => {
    if (!contactForm.name.trim()) {
      Alert.alert(t('common.error'), 'Contact name is required');
      return;
    }
    try {
      if (editingContact?.id) {
        await clientService.updateContact(clientId, editingContact.id, contactForm);
      } else {
        await clientService.createContact(clientId, contactForm);
      }
      setModalOpen(false);
      await loadData();
    } catch (e) {
      Alert.alert(t('common.error'), 'Failed to save contact.');
    }
  };

  const handleDeleteClient = () => {
    Alert.alert(t('common.delete'), `Remove ${client?.name}? This cannot be undone.`, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await clientService.delete(clientId);
            navigation.goBack();
          } catch {
            Alert.alert(t('common.error'), 'Failed to delete client.');
          }
        },
      },
    ]);
  };

  const deleteContact = (contact: ContactDTO) => {
    Alert.alert(t('common.delete'), `Remove ${contact.name}?`, [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await clientService.deleteContact(clientId, contact.id!);
            await loadData();
          } catch (e) {
            Alert.alert(t('common.error'), 'Failed to delete contact.');
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <ActivityIndicator
        size="large"
        color={theme.colors.primary}
        style={{ flex: 1 }}
      />
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.title}>{client?.name}</Text>
      {client?.company ? <Text style={styles.subtitle}>{client.company}</Text> : null}
      {client?.description ? (
        <Text style={styles.description}>{client.description}</Text>
      ) : null}
      {(client?.city || client?.address) && (
        <Text style={styles.meta}>
          {[client?.city, client?.address].filter(Boolean).join(' · ')}
        </Text>
      )}

      <TouchableOpacity
        style={styles.editBtn}
        onPress={() => navigation.navigate('EditClient', { clientId })}
      >
        <Text style={styles.editText}>{t('common.edit')}</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteClient}>
        <Text style={styles.deleteText}>{t('common.delete')}</Text>
      </TouchableOpacity>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>{t('management.contacts')} ({contacts.length})</Text>
        <TouchableOpacity onPress={openAddContact}>
          <Text style={styles.addLink}>+ {t('management.add_contact')}</Text>
        </TouchableOpacity>
      </View>

      {contacts.length === 0 ? (
        <Text style={styles.empty}>{t('management.no_contacts')}</Text>
      ) : (
        contacts.map(contact => (
          <TouchableOpacity
            key={contact.id}
            style={styles.contactCard}
            onPress={() => openEditContact(contact)}
            onLongPress={() => deleteContact(contact)}
          >
            <Text style={styles.contactName}>{contact.name}</Text>
            {contact.role ? <Text style={styles.contactRole}>{contact.role}</Text> : null}
            {contact.email ? <Text style={styles.contactMeta}>{contact.email}</Text> : null}
            {contact.phone ? <Text style={styles.contactMeta}>{contact.phone}</Text> : null}
          </TouchableOpacity>
        ))
      )}

      <Modal visible={modalOpen} transparent animationType="slide">
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {editingContact ? t('management.edit_contact') : t('management.new_contact')}
            </Text>
            {(['name', 'email', 'phone', 'role', 'notes'] as const).map(field => (
              <View key={field}>
                <Text style={styles.label}>{t(`common.${field}`)}</Text>
                <TextInput
                  style={styles.input}
                  value={contactForm[field]}
                  onChangeText={text =>
                    setContactForm(prev => ({ ...prev, [field]: text }))
                  }
                  placeholder={field === 'name' ? t('management.required') : t('management.optional')}
                />
              </View>
            ))}
            <TouchableOpacity style={styles.saveButton} onPress={saveContact}>
              <Text style={styles.saveText}>{t('common.save')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalOpen(false)}
            >
              <Text style={styles.cancelText}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  title: { fontSize: 24, fontWeight: '700', color: '#1E293B' },
  subtitle: { fontSize: 16, color: '#64748B', marginTop: 4 },
  description: { fontSize: 14, color: '#475569', marginTop: 8 },
  meta: { fontSize: 13, color: '#94A3B8', marginTop: 8 },
  editBtn: {
    backgroundColor: theme.colors.primary,
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  editText: { color: '#fff', fontWeight: '700' },
  deleteBtn: { padding: 14, alignItems: 'center', marginTop: 4 },
  deleteText: { color: '#DC2626', fontWeight: '600' },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#334155' },
  addLink: { color: theme.colors.primary, fontWeight: '700' },
  empty: { color: '#94A3B8', textAlign: 'center', paddingVertical: 20 },
  contactCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
  contactName: { fontSize: 16, fontWeight: '600', color: '#1E293B' },
  contactRole: { fontSize: 13, color: theme.colors.primary, marginTop: 2 },
  contactMeta: { fontSize: 13, color: '#64748B', marginTop: 2 },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#475569', marginTop: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    padding: 10,
    marginTop: 4,
  },
  saveButton: {
    backgroundColor: theme.colors.primary,
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  saveText: { color: '#fff', fontWeight: '700' },
  cancelButton: { padding: 14, alignItems: 'center' },
  cancelText: { color: '#64748B', fontWeight: '600' },
});
