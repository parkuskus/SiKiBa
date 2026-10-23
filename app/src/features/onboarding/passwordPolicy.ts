export function validatePassword(password: string, confirmation: string): string | null {
  if (password.length < 8) return "Sandi minimal 8 karakter";
  if (password !== confirmation) return "Konfirmasi sandi tidak sama";
  return null;
}
