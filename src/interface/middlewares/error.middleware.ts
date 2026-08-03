import { Request, Response, NextFunction } from 'express';
import { AppError } from '../../domain/errors/AppError';
import { ZodError, ZodIssue } from 'zod';

/**
 * Global error handler middleware.
 *
 * Resolution order:
 * 1. AppError (and subclasses) → use the error's own statusCode and code.
 * 2. ZodError → 400 with field-level details.
 * 3. Everything else → generic 500 (no internal details leaked).
 */
export const errorHandler = (
  err: Error | AppError | ZodError,
  _req: Request,
  res: Response,
  _next: NextFunction,
) => {
  // --- 1. Operational errors (our custom hierarchy) -----------------------
  if (err instanceof AppError) {
    console.error(`[AppError] ${err.code}: ${err.message}`);
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details ? { details: err.details } : {}),
      },
    });
    return;
  }

  // --- 2. Zod validation errors -------------------------------------------
  if (err instanceof ZodError || (err as { name?: string }).name === 'ZodError') {
    const zodErr = err as ZodError;
    const issues: ZodIssue[] = zodErr.issues || (zodErr as unknown as { errors: ZodIssue[] }).errors || [];
    console.error('[ValidationError] Zod validation failed');
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: issues.map((e: ZodIssue) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
      },
    });
    return;
  }

  // --- 3. Unexpected / programming errors ---------------------------------
  console.error('[UnexpectedError]', err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
  });
};
