export const ADMIN_API = '/api/backend';

export type ApiFieldError = { field: string; message: string };

export class AdminApiError extends Error {
  fieldErrors: ApiFieldError[];

  constructor(message: string, fieldErrors: ApiFieldError[] = []) {
    super(message);
    this.name = 'AdminApiError';
    this.fieldErrors = fieldErrors;
  }
}

type Envelope<T> = {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ApiFieldError[];
};

export async function adminRequest<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const isForm = options.body instanceof FormData;
  const response = await fetch(`${ADMIN_API}${path}`, {
    ...options,
    credentials: 'include',
    headers: {
      Accept: 'application/json',
      ...(isForm ? {} : { 'Content-Type': 'application/json' }),
      ...(options.headers || {}),
    },
    cache: 'no-store',
  });

  const payload = (await response.json().catch(() => ({}))) as Envelope<T>;

  if (!response.ok || !payload?.success) {
    throw new AdminApiError(
      payload?.message || `Request failed (${response.status}).`,
      Array.isArray(payload?.errors) ? payload.errors : []
    );
  }

  return payload.data as T;
}

export async function adminUpload(file: File, kind: 'logo' | 'banner' | 'screenshot') {
  const body = new FormData();
  body.append('file', file);
  return adminRequest<{ url: string; publicId: string }>(`/admin/upload?kind=${kind}`, {
    method: 'POST',
    body,
  });
}

export function fieldErrorsToMap(errors: ApiFieldError[]): Record<string, string> {
  const map: Record<string, string> = {};
  for (const error of errors) {
    if (error?.field) map[error.field] = error.message;
  }
  return map;
}
