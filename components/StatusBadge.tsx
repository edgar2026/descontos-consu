
import React from 'react';
import { RequestStatus } from '../types';

interface StatusBadgeProps {
  status: RequestStatus;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const styles = {
    [RequestStatus.AGUARDANDO_DIRETOR]: 'bg-amber-100 text-amber-700',
    [RequestStatus.AGUARDANDO_COORDENADOR]: 'bg-indigo-100 text-indigo-700',
    [RequestStatus.DEFERIDO]: 'bg-emerald-100 text-emerald-700',
    [RequestStatus.INDEFERIDO]: 'bg-rose-100 text-rose-700',
  };

  const labels = {
    [RequestStatus.AGUARDANDO_DIRETOR]: 'Aguardando Direção',
    [RequestStatus.AGUARDANDO_COORDENADOR]: 'Aguardando Coordenador',
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
