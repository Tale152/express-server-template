import {Response} from 'express';

export function onError(res: Response): () => Promise<void> {
  return async () => {
    res.status(500).send();
  };
}
