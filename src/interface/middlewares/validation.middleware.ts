import { Request, Response, NextFunction } from 'express';
import { ZodTypeAny } from 'zod';

export const validate = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = (await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      })) as { body?: unknown; query?: unknown; params?: Record<string, string> };

      if (validatedData.body !== undefined) req.body = validatedData.body;

      if (validatedData.query !== undefined) {
        res.locals.query = validatedData.query;
      }

      if (validatedData.params !== undefined) {
        Object.assign(req.params, validatedData.params);
      }

      next();
    } catch (error: unknown) {
      next(error);
    }
  };
};
