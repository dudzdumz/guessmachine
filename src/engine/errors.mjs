export class EngineError extends Error {
  constructor(code, message, { category = 'internal', retryable = false, status = 400, details = undefined } = {}) {
    super(message);
    this.name = 'EngineError';
    this.code = code;
    this.category = category;
    this.retryable = retryable;
    this.status = status;
    this.details = details;
  }

  toPublic(correlationId) {
    return {
      code: this.code,
      category: this.category,
      retryable: this.retryable,
      user_safe_message: this.message,
      ...(correlationId ? { correlation_id: correlationId } : {}),
    };
  }
}
