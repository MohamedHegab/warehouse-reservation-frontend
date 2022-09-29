import useSWR from 'swr';
import fetcher from '../fetcher';
import ReservedSlot from '../../models/ReservedSlot'

export async function addReservedSlot(warehouseId: number, reservedSlot: ReservedSlot) {
  return fetcher(`warehouses/${warehouseId}/reserved_slots`, 'POST', reservedSlot)
}

export async function updateReservedSlot(warehouseId: number, reservedSlotId: string, reservedSlot: ReservedSlot) {
  return fetcher(`warehouses/${warehouseId}/reserved_slots/${reservedSlotId}`, 'PUT', reservedSlot)
}

export async function destroyReservedSlot(warehouseId: number, reservedSlotId: string) {
  return fetcher(`warehouses/${warehouseId}/reserved_slots/${reservedSlotId}`, 'DELETE')
}

function useReservedSlots(warehouseId: number) {
  const { data, error, mutate } = useSWR([`warehouses/${warehouseId}/reserved_slots`, 'GET'], fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  return {
    reservedSlots: data || [],
    isLoading: !data,
    isError: !!error,
    mutate
  };
}


export default useReservedSlots;