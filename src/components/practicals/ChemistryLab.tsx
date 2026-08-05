import React from 'react';
import { PracticalActivity } from '../../types';
import { VirtualLab3DContainer } from './3d/VirtualLab3DContainer';

interface ChemistryLabProps {
  practical: PracticalActivity;
  onSimulationUpdate?: (state: any) => void;
}

export const ChemistryLab: React.FC<ChemistryLabProps> = ({
  practical
}) => {
  return <VirtualLab3DContainer practical={practical} />;
};
