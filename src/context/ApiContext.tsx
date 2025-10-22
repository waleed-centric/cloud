import React, { createContext, useContext, useMemo } from 'react';
import apiClient, { get, post, put, del, upload } from '@/utils/api';

export type ApiContextValue = {
  client: typeof apiClient;
  get: typeof get;
  post: typeof post;
  put: typeof put;
  del: typeof del;
  upload: typeof upload;
};

const ApiContext = createContext<ApiContextValue>({
  client: apiClient,
  get,
  post,
  put,
  del,
  upload,
});

export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const value = useMemo<ApiContextValue>(() => ({ client: apiClient, get, post, put, del, upload }), []);
  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>;
};

export const useApi = () => useContext(ApiContext);