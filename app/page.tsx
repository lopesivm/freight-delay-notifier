'use client';

import { useState, useEffect } from 'react';
import { Delivery } from '@typings';
import { deliveryService } from '@/app/services/deliveryService';
import { DeliveryCard } from '@/app/components/DeliveryCard';
import { CreateDeliveryModal } from '@/app/components/CreateDeliveryModal';
import { UpdateLocationModal } from '@/app/components/UpdateLocationModal';

export default function FreightStatusPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);

  useEffect(() => {
    loadDeliveries();
  }, []);

  const loadDeliveries = async () => {
    try {
      setLoading(true);
      const data = await deliveryService.getDeliveries();
      setDeliveries(data);
    } catch (error) {
      console.error('Error loading deliveries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDelivery = async (input: {
    name: string;
    origin: string;
    destination: string;
    contactPhone: string;
  }) => {
    try {
      const newDelivery = await deliveryService.createDelivery(input);
      setDeliveries((prev) => [...prev, newDelivery]);
    } catch (error) {
      console.error('Error creating delivery:', error);
    }
  };

  const handleUpdateLocation = async (id: string, location: string) => {
    try {
      const updatedDelivery = await deliveryService.updateLocation(id, { location });
      setDeliveries((prev) => prev.map((d) => (d.id === id ? updatedDelivery : d)));
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  const handleDeliveryClick = (delivery: Delivery) => {
    setSelectedDelivery(delivery);
    setUpdateModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">🚛 Freight Status</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Track and manage your freight deliveries in real-time
          </p>
        </div>

        {/* Action Bar */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border-2 border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <h2 className="text-2xl font-bold text-gray-900">📦 Active Deliveries</h2>
              <p className="text-gray-600">
                {deliveries.length} {deliveries.length === 1 ? 'delivery' : 'deliveries'} in
                progress
              </p>
            </div>
            <button
              onClick={() => setCreateModalOpen(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-md"
            >
              Create New Delivery
            </button>
          </div>
        </div>

        {/* Delivery List Container */}
        <div className="bg-gray-50 border-2 border-gray-300 rounded-xl p-6 shadow-inner">
          {loading ? (
            <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600 font-medium">Loading deliveries...</p>
            </div>
          ) : deliveries.length === 0 ? (
            <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No deliveries yet</h3>
              <p className="text-gray-600 mb-4">Create your first delivery to get started</p>
              <button
                onClick={() => setCreateModalOpen(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Create First Delivery
              </button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {deliveries.map((delivery) => (
                <DeliveryCard
                  key={delivery.id}
                  delivery={delivery}
                  onClick={() => handleDeliveryClick(delivery)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <CreateDeliveryModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onCreate={handleCreateDelivery}
      />

      <UpdateLocationModal
        delivery={selectedDelivery}
        open={updateModalOpen}
        onOpenChange={setUpdateModalOpen}
        onUpdate={handleUpdateLocation}
      />
    </div>
  );
}
