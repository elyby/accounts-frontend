import { useCallback, useEffect, useRef } from 'react';

// This code is copied from the usehooks-ts: https://usehooks-ts.com/react-hook/use-is-mounted
// Replace it with the library when the Node.js version of the project will be updated at least to 16.
export default function useIsMounted(): () => boolean {
    const isMounted = useRef(false);

    useEffect(() => {
        isMounted.current = true;

        return () => {
            isMounted.current = false;
        };
    }, []);

    return useCallback(() => isMounted.current, []);
}
