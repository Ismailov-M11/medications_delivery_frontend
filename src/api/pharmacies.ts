import apiClient from './axios'

export interface Pharmacy {
  id: string
  name: string
  address: string
  phone: string
  login: string
  isActive: boolean
  subscriptionExpiry: string
  lat?: number
  lng?: number
  createdAt: string
}

export interface CreatePharmacyPayload {
  name: string
  address: string
  phone: string
  login: string
  password: string
  subscriptionExpiry: string
  lat?: number
  lng?: number
}

export interface UpdatePharmacyPayload {
  subscriptionExpiry?: string
  isActive?: boolean
}

export interface PharmaciesListResponse {
  success: boolean
  data: {
    pharmacies: Pharmacy[]
    total: number
  }
  message?: string
}

export interface PharmacyResponse {
  success: boolean
  data: Pharmacy
  message?: string
}

export const getPharmacies = async (): Promise<PharmaciesListResponse> => {
  const { data } = await apiClient.get<PharmaciesListResponse>('/api/admin/pharmacies')
  return data
}

export const createPharmacy = async (
  payload: CreatePharmacyPayload,
): Promise<PharmacyResponse> => {
  const { data } = await apiClient.post<PharmacyResponse>('/api/admin/pharmacies', payload)
  return data
}

export const updatePharmacy = async (
  id: string,
  payload: UpdatePharmacyPayload,
): Promise<PharmacyResponse> => {
  const { data } = await apiClient.put<PharmacyResponse>(
    `/api/admin/pharmacies/${id}`,
    payload,
  )
  return data
}

export const togglePharmacyStatus = async (
  id: string,
  isActive: boolean,
): Promise<PharmacyResponse> => {
  return updatePharmacy(id, { isActive })
}
