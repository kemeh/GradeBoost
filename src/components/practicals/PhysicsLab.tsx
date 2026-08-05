import React from 'react';
import { PracticalActivity } from '../../types';
import { VirtualLab3DContainer } from './3d/VirtualLab3DContainer';

interface PhysicsLabProps {
  practical: PracticalActivity;
  onSimulationUpdate?: (state: any) => void;
}

export const PhysicsLab: React.FC<PhysicsLabProps> = ({
  practical
}) => {
  return <VirtualLab3DContainer practical={practical} />;
};
