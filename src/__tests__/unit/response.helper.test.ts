import { describe, it, expect, vi } from 'vitest';
import { Response } from 'express';
import { sendSuccess, sendCreated, sendNoContent } from '../../interface/helpers/response.helper';

describe('Response Helper Functions', () => {
  const createMockResponse = () => {
    const res = {} as Response;
    res.status = vi.fn().mockReturnValue(res);
    res.json = vi.fn().mockReturnValue(res);
    res.send = vi.fn().mockReturnValue(res);
    return res;
  };

  it('sendSuccess sends status 200 and formatted body', () => {
    // Arrange
    const res = createMockResponse();

    // Act
    sendSuccess(res, { id: '123' });

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { id: '123' },
    });
  });

  it('sendSuccess includes pagination meta when provided', () => {
    // Arrange
    const res = createMockResponse();
    const meta = { page: 1, limit: 10, total: 25, totalPages: 3 };

    // Act
    sendSuccess(res, [{ id: '1' }], meta);

    // Assert
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [{ id: '1' }],
      meta,
    });
  });

  it('sendCreated sends status 201', () => {
    // Arrange
    const res = createMockResponse();

    // Act
    sendCreated(res, { id: 'new-id' });

    // Assert
    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { id: 'new-id' },
    });
  });

  it('sendNoContent sends status 204 without body', () => {
    // Arrange
    const res = createMockResponse();

    // Act
    sendNoContent(res);

    // Assert
    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
});
