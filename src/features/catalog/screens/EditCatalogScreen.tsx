import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { catalogService } from '../api/catalogService';
import { CatalogFormScreen } from './CatalogFormScreen';
import { useTheme } from '../../../theme/ThemeContext';

export const EditCatalogScreen = () => {
  const theme = useTheme();
  const route = useRoute<any>();
  const catalogId = route.params?.catalogId as number;
  const [loading, setLoading] = useState(true);
  const [initial, setInitial] = useState<React.ComponentProps<typeof CatalogFormScreen>['initial']>();

  useEffect(() => {
    catalogService
      .getById(catalogId)
      .then(catalog => {
        setInitial({
          name: catalog.name,
          description: catalog.description || '',
          contactType: catalog.contactType,
          contactValue: catalog.contactValue,
          active: catalog.active ?? true,
          itemIds: catalog.itemIds || [],
        });
      })
      .catch(() => Alert.alert('Error', 'Failed to load catalog'))
      .finally(() => setLoading(false));
  }, [catalogId]);

  if (loading || !initial) {
    return (
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return <CatalogFormScreen catalogId={catalogId} initial={initial} />;
};
