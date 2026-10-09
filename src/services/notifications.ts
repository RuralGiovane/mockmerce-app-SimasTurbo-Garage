import { http } from './http';
export interface StoreMessage { id: string; title: string; body: string; data: Record<string, unknown> }
function record(value: unknown): value is Record<string, unknown> { return typeof value === 'object' && value !== null; }
export function parseMessages(payload: unknown): StoreMessage[] {
  const items = Array.isArray(payload) ? payload : record(payload) && Array.isArray(payload.data) ? payload.data : null;
  if (!items) throw new Error('Formato inesperado do histórico de notificações.');
  return items.map((item: unknown) => {
    if (!record(item) || typeof item.id !== 'string' || typeof item.title !== 'string' || typeof item.body !== 'string') {
      throw new Error('O histórico contém uma mensagem inválida.');
    }
    return { id: item.id, title: item.title, body: item.body, data: record(item.data) ? item.data : {} };
  });
}
export async function getStoreMessages(): Promise<StoreMessage[]> {
  const { data } = await http.get<unknown>('/push/messages');
  return parseMessages(data);
}
