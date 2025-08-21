'use client';
// import { useOfflineStatus } from '@/context/OfflineStatusContext';
import { useState, useEffect, useCallback, useRef } from 'react';

export default function useFetch({
  auto = false,
  url = '',
  method = 'GET',
  payload = null,
  headers = {},
  withAuth = true,
  onSuccess = () => { },
  onError = () => { },
} = {}) {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

//   const { isOfflineMode } = useOfflineStatus()

  // Keep latest values in refs so refetch() always uses up-to-date info
  const latestConfigRef = useRef({
    url,
    method,
    payload,
    headers,
    withAuth,
    onSuccess,
    onError,
  });

  // Update config refs on every render
  useEffect(() => {
    latestConfigRef.current = {
      url,
      method,
      payload,
      headers,
      withAuth,
      onSuccess,
      onError,
    };
  }, [url, method, payload, headers, withAuth, onSuccess, onError]);

  const refetch = useCallback(async (overrideOptions = {}) => {

    // if (isOfflineMode) {
    //   const offlineError = { message: 'You are offline' };
    //   setError(offlineError.message);
    //   latestConfigRef.current.onError(offlineError);
    //   return;
    // }

    const {
      url: reqUrl = latestConfigRef.current.url,
      method: reqMethod = latestConfigRef.current.method,
      payload: reqPayload = latestConfigRef.current.payload,
      headers: reqHeaders = latestConfigRef.current.headers,
      withAuth: reqWithAuth = latestConfigRef.current.withAuth,
      onSuccess: successCallback = latestConfigRef.current.onSuccess,
      onError: errorCallback = latestConfigRef.current.onError,
    } = overrideOptions;

    if (!reqUrl) return;


    setIsLoading(true);
    setError(null);

    try {
      const finalHeaders = { ...reqHeaders };


      const isFormData = reqPayload instanceof FormData;
      if (!isFormData && reqMethod !== 'GET') {
        finalHeaders['Content-Type'] = 'application/json';
      }

      const fetchOptions = {
        method: reqMethod,
        headers: finalHeaders,
        body: reqMethod !== 'GET'
          ? (isFormData ? reqPayload : JSON.stringify(reqPayload))
          : undefined,
      };

      // ✅ Conditionally include credentials (for HTTP-only auth cookies)
      if (reqWithAuth) {
        fetchOptions.credentials = 'include';
      }

      const response = await fetch(reqUrl, fetchOptions);

      const isJson = response.headers.get('content-type')?.includes('application/json');
      const result = isJson ? await response.json() : await response.text();

      if (!response.ok) {
        const errorMessage = result?.error?.message || result?.message || 'Something went wrong';
        throw { message: errorMessage, fullError: result.error, status: response.status };
      }

      setData(result);
      successCallback(result);
    } catch (err) {
      const message = err.message || 'Unknown error';
      setError(message);
      errorCallback(err.fullError || err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Only fire auto-fetch if `auto === true` and `url` is valid on first render
  useEffect(() => {
    if (auto && url) {
      refetch();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only on mount

  return {
    data,
    error,
    isLoading,
    refetch,
  };
}