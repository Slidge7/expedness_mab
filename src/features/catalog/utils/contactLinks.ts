import { Linking, Platform } from 'react-native';
import {
  ContactType,
  SubmitOrderResponse,
} from '../api/catalogService';

const normalizePhone = (value: string) => value.replace(/[^\d+]/g, '');

export const buildContactDeepLink = (
  response: SubmitOrderResponse,
): string => {
  const { contactType, contactValue, orderSummary } = response;
  const encodedText = encodeURIComponent(orderSummary);

  switch (contactType) {
    case 'WHATSAPP': {
      const phone = normalizePhone(contactValue);
      return `https://wa.me/${phone}?text=${encodedText}`;
    }
    case 'TELEGRAM': {
      const username = contactValue.replace(/^@/, '');
      return `https://t.me/${username}?text=${encodedText}`;
    }
    case 'MESSENGER': {
      const pageId = contactValue.trim();
      return `https://m.me/${pageId}?text=${encodedText}`;
    }
    default:
      return '';
  }
};

export const openContactDeepLink = async (response: SubmitOrderResponse) => {
  const url = buildContactDeepLink(response);
  if (!url) return;

  if (Platform.OS === 'web') {
    window.open(url, '_blank', 'noopener,noreferrer');
    return;
  }

  const canOpen = await Linking.canOpenURL(url);
  if (canOpen) {
    await Linking.openURL(url);
  } else {
    await Linking.openURL(url);
  }
};

export const contactTypeLabel = (type: ContactType): string => {
  switch (type) {
    case 'WHATSAPP':
      return 'WhatsApp';
    case 'TELEGRAM':
      return 'Telegram';
    case 'MESSENGER':
      return 'Messenger';
    default:
      return type;
  }
};

export const contactValuePlaceholder = (type: ContactType): string => {
  switch (type) {
    case 'WHATSAPP':
      return 'Phone number (e.g. 212612345678)';
    case 'TELEGRAM':
      return 'Username (e.g. myshop)';
    case 'MESSENGER':
      return 'Page username or ID';
    default:
      return '';
  }
};
