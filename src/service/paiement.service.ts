import { createApi } from './api.config';

const api = createApi('paiement');

export interface InitFedaPayPaymentInput {
  produitIds: number[];
  quantites: number[];
  platform: 'mobile';
}

export interface FedaPayPaymentState {
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  purpose?: 'ORDER' | 'MISSION_PUBLICATION';
  vente?: { statut?: string };
  mission?: { statut?: string; publicationPayee?: boolean };
}

export async function initFedaPayPayment(input: InitFedaPayPaymentInput) {
  const response = await api.post<{ payment_url: string; reference: string; venteId: number }>(
    '/fedapay/init-payment',
    input,
  );
  return response.data;
}

export async function initMissionPublicationPayment(missionId: number) {
  const response = await api.post<{ payment_url: string; reference: string; missionId: number }>(
    `/fedapay/mission/${missionId}/publication`, { platform: 'mobile' },
  );
  return response.data;
}

export async function checkFedaPayPayment(reference: string) {
  const response = await api.get<FedaPayPaymentState>(
    `/fedapay/check/${encodeURIComponent(reference)}`,
  );
  return response.data;
}
