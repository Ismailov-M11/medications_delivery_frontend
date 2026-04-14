import apiClient from './axios'
import { Order, OrdersListResponse } from './orders'

export interface AdminOrdersParams {
  page?: number
  pageSize?: number
  pharmacyId?: string
}

export interface AnalyticsData {
  totalOrders: number
  totalMedicinesAmount: number
  totalDeliveryAmount: number
  activePharmacies: number
  ordersByStatus: Record<string, number>
  ordersByCourier: Record<string, number>
  last30Days: Array<{
    date: string
    count: number
  }>
}

export interface AnalyticsResponse {
  success: boolean
  data: AnalyticsData
  message?: string
}

export interface AdminOrderDetailResponse {
  success: boolean
  data: Order
  message?: string
}

export const getAdminOrders = async (
  params?: AdminOrdersParams,
): Promise<OrdersListResponse> => {
  const { data } = await apiClient.get<OrdersListResponse>('/api/admin/orders', {
    params,
  })
  return data
}

export const getAdminOrderDetail = async (
  id: string,
): Promise<AdminOrderDetailResponse> => {
  const { data } = await apiClient.get<AdminOrderDetailResponse>(
    `/api/admin/orders/${id}`,
  )
  return data
}

export const getAnalytics = async (): Promise<AnalyticsResponse> => {
  const { data } = await apiClient.get<AnalyticsResponse>('/api/admin/analytics')
  return data
}
