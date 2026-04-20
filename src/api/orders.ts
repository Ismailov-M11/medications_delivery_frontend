import apiClient from './axios'

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'courier_pickup'
  | 'courier_picked'
  | 'courier_delivery'
  | 'delivered'
  | 'cancelled'

export type CourierType = 'yandex' | 'noor' | 'millennium'

export interface CustomerInfo {
  name: string
  phone: string
  address: string
  comment?: string
  lat?: number
  lng?: number
}

export interface Order {
  id: string
  token: string
  status: OrderStatus
  pharmacyComment: string
  medicinesTotal: number
  deliveryPrice?: number
  totalPrice?: number
  courier?: CourierType
  trackingUrl?: string
  customerName?: string
  customerPhone?: string
  customerAddress?: string
  apartment?: string
  entrance?: string
  floor?: string
  intercom?: string
  customerComment?: string
  pharmacyName?: string
  pharmacyAddress?: string
  pharmacyLat?: number
  pharmacyLng?: number
  customerLat?: number
  customerLng?: number
  createdAt: string
  updatedAt: string
}

export interface CreateOrderPayload {
  pharmacyComment: string
  medicinesTotal: number
}

export interface CreateOrderResponse {
  success: boolean
  data: {
    order: Order
    orderUrl: string
  }
  message?: string
}

export interface OrdersListResponse {
  success: boolean
  data: {
    orders: Order[]
    total: number
    page: number
    pageSize: number
  }
  message?: string
}

export interface OrderResponse {
  success: boolean
  data: Order
  message?: string
}

export interface ConfirmOrderPayload {
  customerName: string
  customerPhone: string
  customerAddress: string
  apartment?: string
  entrance?: string
  floor?: string
  intercom?: string
  customerComment?: string
  customerLat?: number
  customerLng?: number
}

export interface SelectCourierPayload {
  courier: CourierType
  deliveryPrice: number
}

// Pharmacy endpoints
export const getPharmacyOrders = async (params?: {
  page?: number
  pageSize?: number
}): Promise<OrdersListResponse> => {
  const { data } = await apiClient.get<OrdersListResponse>('/api/pharmacy/orders', {
    params,
  })
  return data
}

export const createOrder = async (
  payload: CreateOrderPayload,
): Promise<CreateOrderResponse> => {
  const { data } = await apiClient.post<CreateOrderResponse>('/api/pharmacy/orders', payload)
  return data
}

// Customer endpoints (public)
export const getOrderByToken = async (token: string): Promise<OrderResponse> => {
  const { data } = await apiClient.get<OrderResponse>(`/api/orders/${token}`)
  return data
}

export const confirmOrderByToken = async (
  token: string,
  payload: ConfirmOrderPayload,
): Promise<OrderResponse> => {
  const { data } = await apiClient.put<OrderResponse>(
    `/api/orders/${token}/confirm`,
    payload,
  )
  return data
}

export const selectCourierByToken = async (
  token: string,
  payload: SelectCourierPayload,
): Promise<OrderResponse> => {
  const { data } = await apiClient.put<OrderResponse>(
    `/api/orders/${token}/courier`,
    payload,
  )
  return data
}

export interface NoorEvalResult {
  available: boolean
  stage: number
  price: number | null
  error: string | null
}

export const evaluateNoor = async (
  token: string,
): Promise<{ success: boolean; data: NoorEvalResult }> => {
  const { data } = await apiClient.post(`/api/orders/${token}/noor/evaluate`)
  return data
}

export interface MillenniumEvalResult {
  available: boolean
  price: number | null
  error?: string | null
}

export const evaluateMillennium = async (
  token: string,
): Promise<{ success: boolean; data: MillenniumEvalResult }> => {
  const { data } = await apiClient.post(`/api/orders/${token}/millennium/evaluate`)
  return data
}
