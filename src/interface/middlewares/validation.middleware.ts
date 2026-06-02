import { Request, Response, NextFunction } from 'express';

export const validate = (schema: any) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const validatedData = await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });

      // Replace body directly (writable)
      if (validatedData.body !== undefined) req.body = validatedData.body;

      // Store coerced query params in res.locals (guaranteed writable)
      // Controllers must read from res.locals.query instead of req.query
      if (validatedData.query !== undefined) {
        res.locals.query = validatedData.query;
      }

      if (validatedData.params !== undefined) {
        Object.assign(req.params, validatedData.params);
      }

      next();
    } catch (error: any) {
      if (error && error.errors) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: error.errors,
        });
      }
      next(error);
    }
  };
};
