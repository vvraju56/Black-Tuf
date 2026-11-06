import { ApiError } from '../utils/ApiError.js';

/**
 * Validate a request payload with a Zod schema.
 * `source` is where the parsed values are written back to (body by default).
 */
export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.') || source,
        message: issue.message,
      }));
      next(new ApiError(422, 'Please check the highlighted fields.', errors));
      return;
    }
    req[source] = result.data;
    next();
  };
}
