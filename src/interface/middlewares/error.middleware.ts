import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (err.message === 'Email already in use') {
    return res.status(400).json({ success: false, message });
  }
  
  if (err.message === 'Invalid credentials' || err.message === 'User not found') {
    return res.status(401).json({ success: false, message });
  }

  if (err.message === 'Workout not found' || err.message === 'Meal not found' || err.message === 'Sleep not found' || err.message === 'Injury not found') {
    return res.status(404).json({ success: false, message });
  }

  if (
    err.message === 'Failed to update workout' ||
    err.message === 'Failed to delete workout' ||
    err.message === 'Failed to update meal' ||
    err.message === 'Failed to delete meal' ||
    err.message === 'Failed to update sleep' ||
    err.message === 'Failed to delete sleep' ||
    err.message === 'Failed to update injury' ||
    err.message === 'Failed to delete injury'
  ) {
    return res.status(500).json({ success: false, message });
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
};
