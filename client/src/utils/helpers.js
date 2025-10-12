// Generar ID corto de 6 caracteres
export function generateShortId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

// Validar formato de ID
export function isValidGameId(id) {
  return /^[A-Z0-9]{6}$/.test(id);
}

// Formatear ID para mostrar (ej: ABC-123)
export function formatGameId(id) {
  if (!id || id.length !== 6) return id;
  return `${id.slice(0, 3)}-${id.slice(3)}`;
}

// Limpiar input de ID (remover guiones, espacios, etc)
export function cleanGameId(input) {
  return input.toUpperCase().replace(/[^A-Z0-9]/g, '');
}