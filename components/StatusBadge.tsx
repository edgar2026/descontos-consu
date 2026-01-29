
import React from 'react';
import { RequestStatus } from '../types';

interface StatusBadgeProps {
  status: RequestStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles = {
    [RequestStatus.EM_ANALISE]: 'bg-blue-100 text-blue-700',
    [RequestStatus.DEFERIDO]: 'bg-emerald-100 text-emerald-700',
    [RequestStatus.INDEFERIDO]: 'bg-rose-100 text-rose-700',
  };

  const labels = {
    [RequestStatus.EM_ANALISE]: 'Em Análise',
    [RequestStatus.DEFERIDO]: 'Deferido',
    [RequestStatus.INDEFERIDO]: 'Indeferido',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-wide ${styles[status]}`}>
      {labels[status]}
    </span>
  );
};

export default StatusBadge;
