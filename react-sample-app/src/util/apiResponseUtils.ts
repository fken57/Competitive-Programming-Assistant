export async function getApiErrorMessage(response: Response): Promise<string> {
  try {
    const body: unknown = await response.json();
    if (
      typeof body === 'object'
      && body !== null
      && 'error' in body
      && typeof body.error === 'string'
      && body.error.trim()
    ) {
      return body.error;
    }
  } catch {
    // Fall back to the HTTP status when the response has no JSON error body.
  }

  return `HTTP error! status: ${response.status}`;
}
