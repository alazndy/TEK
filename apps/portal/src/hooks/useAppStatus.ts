import { useState, useEffect } from 'react';

const CHECK_INTERVAL = 5000; // 5 seconds

export const useAppStatus = (url: string) => {
    const [isOnline, setIsOnline] = useState<boolean>(false);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                // We fetch the root or a lightweight endpoint. 
                // Since this is client-side to localhost, it might face CORS if not handled, 
                // but simpler `mode: 'no-cors'` gives opaque response which is enough to prove it listens.
                await fetch(url, { mode: 'no-cors', method: 'HEAD' });
                setIsOnline(true);
            } catch (error) {
                setIsOnline(false);
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, CHECK_INTERVAL);

        return () => clearInterval(interval);
    }, [url]);

    return isOnline;
};
