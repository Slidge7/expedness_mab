import React from 'react';
import { CatalogListScreen } from '../../catalog/screens/CatalogListScreen';

interface Props {
  isActive: boolean;
}

export const CatalogsPanel: React.FC<Props> = ({ isActive }) => {
  return <CatalogListScreen isActive={isActive} />;
};
