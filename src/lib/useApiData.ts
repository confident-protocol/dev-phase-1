import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "./api";

export function useApiData<T>(url: string, transform?: (payload: any) => T) {
  const [data, setData] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const transformRef = useRef(transform);

  useEffect(() => {
    transformRef.current = transform;
  }, [transform]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    api
      .get(url)
      .then((response) => {
        if (!isMounted) return;
        const next = transformRef.current ? transformRef.current(response.data) : (response.data as T);
        setData(next);
      })
      .catch(() => {
        if (!isMounted) return;
        setData(undefined);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [url, version]);

  return { data, isLoading, reload, setData };
}
