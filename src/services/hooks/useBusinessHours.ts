import useSWR from 'swr';
import fetcher from '../fetcher';

function useBusinessHours(warehouseId: number) {
  const { data, error, mutate } = useSWR([`warehouses/${warehouseId}/business_hours`, 'GET'], fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  return {
    businessHours: data || [],
    isLoading: !data,
    isError: !!error,
    mutate
  };
}


export default useBusinessHours;