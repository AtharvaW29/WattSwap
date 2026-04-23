import { useContext } from 'react';
import { HardwareStatusContext } from '../context/HardwareStatusContext';

export const useHardwareStatus = () => {
  const context = useContext(HardwareStatusContext);
  if (!context) {
    throw new Error('useHardwareStatus must be used within HardwareStatusProvider');
  }
  return context;
};
