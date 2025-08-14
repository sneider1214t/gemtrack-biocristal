import bcrypt from 'bcryptjs';

/**
 * Hashea una contraseña utilizando bcrypt
 * @param {string} password - La contraseña a hashear
 * @returns {Promise<string>} - La contraseña hasheada
 */
export const hash = async (password) => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

/**
 * Compara una contraseña sin encriptar con un hash
 * @param {string} password - La contraseña sin encriptar
 * @param {string} hashedPassword - El hash de la contraseña almacenada
 * @returns {Promise<boolean>} - True si coinciden, false si no
 */
export const compare = async (password, hashedPassword) => {
  return await bcrypt.compare(password, hashedPassword);
};