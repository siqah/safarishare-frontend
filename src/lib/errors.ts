export function getErrorMessage(e: unknown, fallback = 'Something went wrong') {
  if (typeof e === 'object' && e !== null) {
    const obj = e as { response?: { data?: { message?: unknown } }; message?: unknown };
    if (typeof obj.response?.data?.message === 'string') return obj.response.data.message;
    if (typeof obj.message === 'string') return obj.message;
  }
  return fallback;
}
