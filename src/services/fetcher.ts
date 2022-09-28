import { axiosClient } from './axiosClient';

const fetcher = (url: string, method: string, data?: any) => {
  if (data) {
    return axiosClient({ url, method, data }).then((res) => res?.data);
  } else {
    return axiosClient({ url, method }).then((res) => res?.data);
  }
}

export default fetcher;