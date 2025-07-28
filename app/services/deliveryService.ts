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

  async createDelivery(input: CreateDeliveryInput): Promise<Delivery> {
    try {
      const response = await axios.post(`${API_BASE_URL}`, input);
      if (response.data.success) {
        return response.data.delivery;
      }
      throw new Error('Failed to create delivery');
    } catch (error) {
      console.error('Error creating delivery:', error);
      throw error;
    }
  }

  async updateLocation(id: string, input: UpdateLocationInput): Promise<Delivery> {
    try {
      const response = await axios.patch(`${API_BASE_URL}/${id}/location`, {
        location: input.location,
      });
      
      if (response.data.success) {
        return response.data.delivery;
      }
      throw new Error('Failed to update location');
    } catch (error) {
      console.error('Error updating location:', error);
      throw error;
    }
  }
}

export const deliveryService = new DeliveryService();
