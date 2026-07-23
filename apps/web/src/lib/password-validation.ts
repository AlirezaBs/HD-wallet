export function validateWalletPassword(
  password: string,
  confirm: string,
): string | null {
  if (password !== confirm) {
    return "Passwords do not match";
  }
  if (password.length < 8) {
    return "Password must be at least 8 characters";
  }
  return null;
}
