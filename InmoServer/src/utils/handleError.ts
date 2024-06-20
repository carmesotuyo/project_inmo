/**
 * Evalúa el error y devuelve un mensaje apropiado.
 * @param error El error capturado en un bloque catch.
 * @returns Un mensaje de error formateado.
 */
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) return error.message;
  return 'Unknown error';
};
