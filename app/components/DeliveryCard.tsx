'use client';

import { Delivery } from '@typings';
import { DeliveryStatus } from '@prisma/client';

interface DeliveryCardProps {
  delivery: Delivery;
  onClick: () => void;
}

export function DeliveryCard({ delivery, onClick }: DeliveryCardProps) {
  const getStatusColor = (status: DeliveryStatus) => {
    switch (status) {
      case DeliveryStatus.ON_ROUTE:
        return 'bg-gray-100 text-gray-800';
      case DeliveryStatus.DELAYED:
        return 'bg-yellow-100 text-yellow-800';
      case DeliveryStatus.DELIVERED:
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div
      className="bg-white border-2 border-gray-300 rounded-lg p-5 shadow-md hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Header with status */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-bold text-gray-900">{delivery.name}</h3>
          <div className="text-xs text-gray-500">ID: {delivery.id}</div>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(delivery.status)}`}
        >
          {delivery.status.replace('_', ' ')}
        </span>
      </div>

      {/* Route info */}
      <div className="space-y-2 mb-3">
        <div className="text-sm">
          <span className="font-medium text-gray-700">Origin:</span>
          <span className="text-gray-600 ml-2">{delivery.origin}</span>
        </div>
        <div className="text-sm">
          <span className="font-medium text-gray-700">Destination:</span>
          <span className="text-gray-600 ml-2">{delivery.destination}</span>
        </div>
      </div>

      {/* Current ETA */}
      <div className="bg-gray-100 border border-gray-300 rounded-md p-3 mb-3">
        <div className="text-sm font-medium text-gray-700 mb-1">Current ETA</div>
        <div className="text-sm text-gray-600">
          {Math.round(delivery.currentRouteDurationSeconds / 60)} minutes
        </div>
      </div>

      {/* Notification badge */}
      {delivery.notified && (
        <div className="bg-orange-100 border border-orange-300 rounded-md p-2">
          <div className="text-xs font-medium text-orange-800">⚠️ Delay Notified</div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Updated: {new Date(delivery.updatedAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
}
