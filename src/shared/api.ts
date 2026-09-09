import * as signalR from '@microsoft/signalr';

let currentToken: string | null = null;
let hubConnection: signalR.HubConnection | null = null;

export function setToken(token: string | null) {
  currentToken = token;
}

export function getToken(): string | null {
  return currentToken;
}

function getHeaders(extraHeaders: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders
  };
  if (currentToken) {
    headers['Authorization'] = `Bearer ${currentToken}`;
  }
  return headers;
}

async function request<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = getHeaders((options.headers as Record<string, string>) || {});
  const res = await fetch(url, { ...options, headers });
  
  if (!res.ok) {
    let errorMessage = `HTTP ${res.status} ${res.statusText}`;
    try {
      const errorData = await res.json();
      if (errorData.detail) errorMessage = errorData.detail;
      else if (errorData.title) errorMessage = errorData.title;
      else if (errorData.message) errorMessage = errorData.message;
    } catch {
      // Ignorar error al parsear JSON
    }
    throw new Error(errorMessage);
  }

  if (res.status === 204) {
    return {} as T;
  }

  return await res.json();
}

// Health Check
export async function checkBackend(): Promise<boolean> {
  try {
    const response = await fetch('/backend/health', { signal: AbortSignal.timeout(4000) });
    return response.ok && (await response.text()).trim() === 'Healthy';
  } catch {
    return false;
  }
}

// Interfaces de Respuestas y Peticiones API
export interface ApiUser {
  id: string;
  userName: string;
  role: string;
  isActive: boolean;
}

export interface ApiLoginResponse {
  token: string;
  expiresAtUtc: string;
  user: ApiUser;
}

export interface ApiTable {
  id: number;
  code: string;
  zone: string;
  capacity: number;
  positionX: number;
  positionY: number;
  shape: string;
  isActive: boolean;
  isOccupied: boolean;
}

export interface ApiMenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  isAvailable: boolean;
}

export interface ApiOrderItem {
  id: string;
  menuItemId: number;
  historicalName: string;
  quantity: number;
  historicalPrice: number;
  lineTotal: number;
  specialInstructions?: string;
  hasAllergyAlert: boolean;
}

export interface ApiOrder {
  id: string;
  sessionId: string;
  tableId: number;
  tableCode: string;
  status: string;
  createdByUserName: string;
  createdAtUtc: string;
  updatedAtUtc?: string;
  cancellationReason?: string;
  items: ApiOrderItem[];
}

export interface ApiPayment {
  id: string;
  sessionId: string;
  method: string;
  amountApplied: number;
  amountReceived?: number;
  changeGiven?: number;
  reference?: string;
  cashierName: string;
  paidAtUtc: string;
}

export interface ApiSession {
  id: string;
  tableId: number;
  tableCode: string;
  waiterId: string;
  waiterName: string;
  status: string;
  openedAtUtc: string;
  closedAtUtc?: string;
  totalAmount: number;
  totalPaid: number;
  balance: number;
  orders: ApiOrder[];
  payments: ApiPayment[];
}

export interface ApiNotification {
  id: string;
  type: string;
  message: string;
  createdAtUtc: string;
  isRead: boolean;
  relatedOrderId?: string;
  relatedSessionId?: string;
}

// Endpoints REST

// Auth
export async function login(userName: string, password: string): Promise<ApiLoginResponse> {
  const result = await request<ApiLoginResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify({ userName, password })
  });
  setToken(result.token);
  return result;
}

export async function getMe(): Promise<ApiUser> {
  return await request<ApiUser>('/api/v1/auth/me');
}

// Mesas
export async function getTables(): Promise<ApiTable[]> {
  return await request<ApiTable[]>('/api/v1/tables');
}

export async function createTable(data: { code: string; zone: string; capacity: number; positionX: number; positionY: number; shape: string }): Promise<ApiTable> {
  return await request<ApiTable>('/api/v1/tables', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateTable(id: number, data: { code: string; zone: string; capacity: number; positionX: number; positionY: number; shape: string; isActive: boolean }): Promise<ApiTable> {
  return await request<ApiTable>(`/api/v1/tables/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

// Platillos / Menú
export async function getMenuItems(): Promise<ApiMenuItem[]> {
  return await request<ApiMenuItem[]>('/api/v1/menu-items');
}

export async function createMenuItem(data: { name: string; category: string; price: number }): Promise<ApiMenuItem> {
  return await request<ApiMenuItem>('/api/v1/menu-items', {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

export async function updateMenuItem(id: number, data: { name: string; category: string; price: number; isAvailable: boolean }): Promise<ApiMenuItem> {
  return await request<ApiMenuItem>(`/api/v1/menu-items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  });
}

// Cuentas / Sesiones
export async function openSession(tableId: number, idempotencyKey?: string): Promise<ApiSession> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
  return await request<ApiSession>('/api/v1/sessions', {
    method: 'POST',
    headers,
    body: JSON.stringify({ tableId })
  });
}

export async function getOpenSessions(): Promise<ApiSession[]> {
  return await request<ApiSession[]>('/api/v1/sessions?status=open');
}

export async function getSession(id: string): Promise<ApiSession> {
  return await request<ApiSession>(`/api/v1/sessions/${id}`);
}

export async function closeSession(id: string): Promise<ApiSession> {
  return await request<ApiSession>(`/api/v1/sessions/${id}/close`, {
    method: 'POST'
  });
}

export async function createOrder(sessionId: string, items: Array<{ menuItemId: number; quantity: number; specialInstructions?: string; hasAllergyAlert: boolean }>, idempotencyKey?: string): Promise<ApiOrder> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
  return await request<ApiOrder>(`/api/v1/sessions/${sessionId}/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ items })
  });
}

export async function registerPayment(sessionId: string, data: { method: string; amountApplied: number; amountReceived?: number; reference?: string }, idempotencyKey?: string): Promise<ApiPayment> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) headers['Idempotency-Key'] = idempotencyKey;
  return await request<ApiPayment>(`/api/v1/sessions/${sessionId}/payments`, {
    method: 'POST',
    headers,
    body: JSON.stringify(data)
  });
}

export async function getPayments(sessionId: string): Promise<ApiPayment[]> {
  return await request<ApiPayment[]>(`/api/v1/sessions/${sessionId}/payments`);
}

// Pedidos / Cocina
export async function getOrders(status?: string, sessionId?: string): Promise<ApiOrder[]> {
  const params = new URLSearchParams();
  if (status) params.append('status', status);
  if (sessionId) params.append('sessionId', sessionId);
  const query = params.toString() ? `?${params.toString()}` : '';
  return await request<ApiOrder[]>(`/api/v1/orders${query}`);
}

export async function startOrder(id: string): Promise<ApiOrder> {
  return await request<ApiOrder>(`/api/v1/orders/${id}/start`, { method: 'POST' });
}

export async function readyOrder(id: string): Promise<ApiOrder> {
  return await request<ApiOrder>(`/api/v1/orders/${id}/ready`, { method: 'POST' });
}

export async function deliverOrder(id: string): Promise<ApiOrder> {
  return await request<ApiOrder>(`/api/v1/orders/${id}/deliver`, { method: 'POST' });
}

export async function cancelOrder(id: string, reason: string): Promise<ApiOrder> {
  return await request<ApiOrder>(`/api/v1/orders/${id}/cancel`, {
    method: 'POST',
    body: JSON.stringify({ reason })
  });
}

// Notificaciones
export async function getNotifications(): Promise<ApiNotification[]> {
  return await request<ApiNotification[]>('/api/v1/notifications');
}

export async function markNotificationRead(id: string): Promise<void> {
  await request<void>(`/api/v1/notifications/${id}/read`, { method: 'POST' });
}

// Realtime SignalR
export function connectSignalR(onEvent: (event: { type: string; data: any }) => void): signalR.HubConnection | null {
  if (!currentToken) return null;

  if (hubConnection) {
    hubConnection.stop();
  }

  hubConnection = new signalR.HubConnectionBuilder()
    .withUrl('/hubs/restaurant', {
      accessTokenFactory: () => currentToken || ''
    })
    .withAutomaticReconnect()
    .build();

  hubConnection.on('ReceiveEvent', (payload: { type: string; data: any }) => {
    if (payload && onEvent) {
      onEvent(payload);
    }
  });

  hubConnection.start().catch((err) => console.error('Error al conectar con SignalR hub:', err));

  return hubConnection;
}

export function disconnectSignalR() {
  if (hubConnection) {
    hubConnection.stop();
    hubConnection = null;
  }
}
