import React from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../store/hooks';
import { OptionalEntityPicker } from './OptionalEntityPicker';

interface Props {
  value: number | null;
  onChange: (id: number | null) => void;
}

export const OptionalClientPicker: React.FC<Props> = ({ value, onChange }) => {
  const { t } = useTranslation();
  const clients = useAppSelector(state => state.clients.items);

  return (
    <OptionalEntityPicker
      title={t('transactions.client_title')}
      value={value}
      onChange={onChange}
      items={clients
        .filter(c => c.id != null)
        .map(c => ({ id: c.id!, label: c.name }))}
    />
  );
};
