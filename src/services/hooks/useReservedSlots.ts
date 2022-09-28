import useSWR from 'swr';
import fetcher from '../fetcher';

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