'use client';

import { useState, useEffect } from 'react';
import { Delivery } from '@typings';
import { Modal } from './Modal';

interface UpdateLocationModalProps {
  delivery: Delivery | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (id: string, location: string) => Promise<void>;
}

export function UpdateLocationModal({
  delivery,
  open,
  onOpenChange,
  onUpdate,
}: UpdateLocationModalProps) {
  const [location, setLocation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!delivery) return;

    setLoading(true);
    try {
      await onUpdate(delivery.id, location);
      setLocation('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating location:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenChange = (open: boolean) => {
    if (open && delivery) {
      setLocation('');
    } else {
      setLocation('');
    }
    onOpenChange(open);
  };

  if (!delivery) return null;

  return (
    <Modal open={open} onClose={() => onOpenChange(false)} title="Update Delivery Location">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-3 mb-4">
          <div className="text-sm text-gray-600">Current location:</div>
          <div className="text-sm text-gray-600 mt-1">
            <span className="font-medium">{delivery.currentLocation}</span>
          </div>
        </div>

        <div>
          <label htmlFor="location" className="block text-sm font-semibold text-gray-700 mb-1">
            Update Location
          </label>
          <input
            id="location"
            type="text"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g., Chicago, IL"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Enter the city or location where this delivery currently is
          </p>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Location'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
