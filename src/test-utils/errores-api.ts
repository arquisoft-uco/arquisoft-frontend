export function errorApi(status: number, data: Record<string, unknown> = {}) {
  return Object.assign(new Error('fallo'), { isAxiosError: true, response: { status, data } });
}
