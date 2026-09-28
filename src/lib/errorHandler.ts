/**
 * Universal error formatter for Supabase, PostgREST, network, and standard JS errors.
 * Prevents displaying raw "[object Object]" to users.
 */
export function formatErrorMessage(err: unknown): string {
  if (!err) return 'Terjadi kesalahan tidak diketahui.';
  if (typeof err === 'string') return err;
  if (err instanceof Error && err.message) return err.message;

  if (typeof err === 'object') {
    const anyErr = err as Record<string, any>;
    
    // Check common error message properties
    if (typeof anyErr.message === 'string' && anyErr.message) {
      if (typeof anyErr.details === 'string' && anyErr.details && anyErr.details !== anyErr.message) {
        return `${anyErr.message} (${anyErr.details})`;
      }
      if (typeof anyErr.hint === 'string' && anyErr.hint) {
        return `${anyErr.message} - Petunjuk: ${anyErr.hint}`;
      }
      return anyErr.message;
    }

    if (typeof anyErr.error_description === 'string' && anyErr.error_description) {
      return anyErr.error_description;
    }

    if (typeof anyErr.details === 'string' && anyErr.details) {
      return anyErr.details;
    }

    if (typeof anyErr.error === 'string' && anyErr.error) {
      return anyErr.error;
    }

    try {
      const json = JSON.stringify(err);
      if (json && json !== '{}') {
        return json;
      }
    } catch {
      // Fall through to String(err)
    }
  }

  const str = String(err);
  return str === '[object Object]' ? 'Terjadi kesalahan pada respon server database.' : str;
}
