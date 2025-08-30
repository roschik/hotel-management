import { httpClient } from './httpClient';

export interface PaymentStatusDTO {
  id: number;
  name: string;
  description: string;
}

class PaymentStatusService {
  async getPaymentStatuses(): Promise<PaymentStatusDTO[]> {
    return httpClient.get<PaymentStatusDTO[]>('/paymentstatuses');
  }

  async getPaymentStatusById(id: number): Promise<PaymentStatusDTO> {
    return httpClient.get<PaymentStatusDTO>(`/paymentstatuses/${id}`);
  }
}

export const paymentStatusService = new PaymentStatusService();
export default paymentStatusService;