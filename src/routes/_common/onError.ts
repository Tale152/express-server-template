import {Response} from 'express';

/**
 * Callback commonly used in routes to send 500 to the caller
 * @param {Response} res express Response in the route invocation
 * @return {Promise<void>} a promise that will be resolved when
 * the response is sent
 */
export function onError(res: Response): () => Promise<void> {
  return async () => {
    res.status(500).send();
  };
}
