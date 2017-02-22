export default function BsodMiddleware(dispatchBsod, logger) {
    return {
        catch(resp) {
            if (resp
                && resp.originalResponse
                && /404|5\d\d/.test(resp.originalResponse.status)
            ) {
                dispatchBsod();

                logger.warn('Unexpected response', {resp});
            }

            return Promise.reject(resp);
        }
    };
}
