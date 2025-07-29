'use client';

import { useState } from 'react';
import { CreateDeliveryRequest } from '@typings';
import { Modal } from './Modal';

interface CreateDeliveryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreate: (input: CreateDeliveryRequest) => Promise<void>;
}

export function CreateDeliveryModal({ open, onOpenChange, onCreate }: CreateDeliveryModalProps) {
  const [formData, setFormData] = useState<CreateDeliveryRequest>({
    name: '',
    origin: '',
    destination: '',
    contactPhone: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onCreate(formData);
      setFormData({ name: '', origin: '', destination: '', contactPhone: '' });
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating delivery:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateDeliveryRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Modal open={open} onClose={() => onOpenChange(false)} title="Create New Delivery">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-1">
            Delivery Name
          </label>
          <input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., Electronics Shipment #001"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="origin" className="block text-sm font-semibold text-gray-700 mb-1">
            Origin Address
          </label>
          <input
            id="origin"
            type="text"
            value={formData.origin}
            onChange={(e) => handleChange('origin', e.target.value)}
            placeholder="e.g., New York, New York, USA"
            required
            minLength={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="destination" className="block text-sm font-semibold text-gray-700 mb-1">
            Destination Address
          </label>
          <input
            id="destination"
            type="text"
            value={formData.destination}
            onChange={(e) => handleChange('destination', e.target.value)}
            placeholder="e.g., Los Angeles, California, USA"
            required
            minLength={10}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label htmlFor="contactPhone" className="block text-sm font-semibold text-gray-700 mb-1">
            Contact Phone (E.164 format)
          </label>
          <input
            id="contactPhone"
            type="tel"
            value={formData.contactPhone}
            onChange={(e) => handleChange('contactPhone', e.target.value)}
            placeholder="+14155552671"
            required
            // pattern="^\\+[1-9]\\d{1,14}$"
            title="Phone number must be in E.164 format starting with + followed by country code and number (e.g., +14155552671)"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Delivery'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
