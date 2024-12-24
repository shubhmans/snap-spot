import { useState, useCallback, useRef, useEffect } from "react";

export const useHttpClient = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState();

    // If user makes request and if he suddenly changes the page and based on response dom is
    // manipulated than we will get error in order to avoid that we are using this
    const activeHttpRequests = useRef([]);
    // To avoid infinte loops and re-rendering of this function again we use useCallback
    const sendRequest = useCallback(
        async (url, method = "GET", body = null, headers = {}) => {
            try {
                const httpAbortControl = new AbortController();
                activeHttpRequests.current.push(httpAbortControl);
                setIsLoading(true);
                const response = await fetch(url, {
                    method,
                    body,
                    headers,
                    signal: httpAbortControl.signal,
                });
                const responseData = await response.json();

                activeHttpRequests.current = activeHttpRequests.current.filter(
                    (reqCtrl) => reqCtrl !== httpAbortControl
                );
                if (!response.ok) {
                    throw new Error(responseData.message);
                }
                setIsLoading(false);
                return responseData;
            } catch (err) {
                setIsLoading(false);
                setError(err.message);
                throw err;
            }
        },
        []
    );

    const clearError = () => {
        setError(null);
    };

    useEffect(() => {
        // This will be executed at component unmount can be used for cleanup
        return () => {
            activeHttpRequests.current.forEach((abrtCtrl) => abrtCtrl.abort());
        };
    }, []);

    return { isLoading, error, sendRequest, clearError };
};
