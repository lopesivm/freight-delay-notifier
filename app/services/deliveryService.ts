import { Delivery, CreateDeliveryInput, UpdateLocationInput } from '@typings';
import axios from 'axios';

const API_BASE_URL = '/api/deliveries';

class DeliveryService {
  async getDeliveries(): Promise<Delivery[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}`);
      if (response.data.success) {
        return response.data.deliveries;
      }
      throw new Error('Failed to fetch deliveries');
    } catch (error) {
      console.error('Error fetching deliveries:', error);
      throw error;
    }
  }

  async createDelivery(input: Omit<CreateDeliveryInput, 'id'>): Promise<{ workflowId: string }> {
    try {
      const response = await axios.post(`${API_BASE_URL}`, input);
      if (response.data.success) {
        return { workflowId: response.data.workflowId };
      }
      throw new Error('Failed to create delivery');
    } catch (error) {
      console.error('Error creating delivery:', error);
      throw error;
    }
  }

  async markDelivered(id: string): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/${id}/mark-delivered`);
    } catch (error) {
      console.error('Error marking delivered:', error);
      throw error;
    }
  }

  async updateLocation(id: string, input: UpdateLocationInput): Promise<void> {
    try {
      await axios.patch(`${API_BASE_URL}/${id}/location`, {
        location: input.location,
      });
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  }
}

export const deliveryService = new DeliveryService();
