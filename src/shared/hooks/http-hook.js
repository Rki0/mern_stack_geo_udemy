import { useState, useCallback, useRef, useEffect } from "react";

export const useHttpClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  // 사용자가 http 통신 중 페이지를 옮기면, http 통신을 취소해야함.
  const activeHttpRequest = useRef([]);

  const sendRequest = useCallback(
    async (url, method = "GET", body = null, headers = {}) => {
      setIsLoading(true);

      // AbortController 모던 브라우저 내장 API로, 요청에 AbortController를 할당한다.
      const httpAbortCtrl = new AbortController();
      activeHttpRequest.current.push(httpAbortCtrl);

      try {
        // fetch는 프로미스를 반환한다.
        const response = await fetch(url, {
          method,
          body,
          headers,
          signal: httpAbortCtrl.signal,
        });

        // 새로운 프로미스 반환됨.
        const responseData = await response.json();

        // 응답이 성공한 경우에는 activeHttpRequest에서 해당 요청을 비워줘야함.
        activeHttpRequest.current = activeHttpRequest.current.filter(
          (reqCtrl) => reqCtrl !== httpAbortCtrl
        );

        // 400, 500 대 에러는 엄밀히 따지면 응답이 온거라서 에러로 처리되지 않는다.
        // 프론트에서 에러라고 설정을 해야함! catch로 넘겨줄 필요가 있음
        // ok는 200번대 응답이 왔을 때 true를 반환함.
        if (!response.ok) {
          throw new Error(responseData.message);
        }

        setIsLoading(false);
        return responseData;
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
        throw err;
      }
    },
    []
  );

  const clearError = () => {
    setError(null);
  };

  useEffect(() => {
    // 클린업 함수. 언마운트를 위함.
    // http 요청 중단
    return () => {
      // 반드시 abortCtrl.abort() 형태로 작성
      activeHttpRequest.current.forEach((abortCtrl) => abortCtrl.abort());
    };
  }, []);

  return { isLoading, error, sendRequest, clearError };
};
