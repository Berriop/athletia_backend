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
    const res = createMockResponse();
    sendSuccess(res, { id: '123' });

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { id: '123' },
    });
  });

  it('sendSuccess includes pagination meta when provided', () => {
    const res = createMockResponse();
    const meta = { page: 1, limit: 10, total: 25, totalPages: 3 };
    sendSuccess(res, [{ id: '1' }], meta);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: [{ id: '1' }],
      meta,
    });
  });

  it('sendCreated sends status 201', () => {
    const res = createMockResponse();
    sendCreated(res, { id: 'new-id' });

    expect(res.status).toHaveBeenCalledWith(201);
    expect(res.json).toHaveBeenCalledWith({
      success: true,
      data: { id: 'new-id' },
    });
  });

  it('sendNoContent sends status 204 without body', () => {
    const res = createMockResponse();
    sendNoContent(res);

    expect(res.status).toHaveBeenCalledWith(204);
    expect(res.send).toHaveBeenCalled();
  });
});
