import useSWR from 'swr';
import fetcher from '../fetcher';

function useWarehouses() {
  const { data, error, mutate } = useSWR(['warehouses/', 'GET'], fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  return {
    warehouses: data || [],
    isLoading: !data,
    isError: !!error,
    mutate
  };
}


export default useWarehouses;