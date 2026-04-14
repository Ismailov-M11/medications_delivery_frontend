import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPharmacyOrders,
  createOrder,
  getOrderByToken,
  confirmOrderByToken,
  selectCourierByToken,
  CreateOrderPayload,
  ConfirmOrderPayload,
  SelectCourierPayload,
} from '@/api/orders'

export function usePharmacyOrders(page = 1, pageSize = 20) {
  return useQuery({
    queryKey: ['pharmacyOrders', page, pageSize],
    queryFn: () => getPharmacyOrders({ page, pageSize }),
  })
}

export function useCreateOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => createOrder(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pharmacyOrders'] })
    },
  })
}

export function useOrderByToken(token: string) {
  return useQuery({
    queryKey: ['order', token],
    queryFn: () => getOrderByToken(token),
    enabled: !!token,
  })
}

export function useConfirmOrder(token: string) {
  return useMutation({
    mutationFn: (payload: ConfirmOrderPayload) =>
      confirmOrderByToken(token, payload),
  })
}

export function useSelectCourier(token: string) {
  return useMutation({
    mutationFn: (payload: SelectCourierPayload) =>
      selectCourierByToken(token, payload),
  })
}
