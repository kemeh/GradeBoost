import React from 'react';
import { PracticalActivity } from '../../types';
import { VirtualLab3DContainer } from './3d/VirtualLab3DContainer';

interface BiologyLabProps {
  practical: PracticalActivity;
  onSimulationUpdate?: (state: any) => void;
}

export const BiologyLab: React.FC<BiologyLabProps> = ({
  practical
}) => {
  return <VirtualLab3DContainer practical={practical} />;
};
