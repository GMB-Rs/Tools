// Lista de emails autorizados a acessar o admin
export const ADMIN_EMAILS = [
  "admin@seudominio.com",
  "biel.martins8@gmail.com",
];

// Função para normalizar email do Gmail (ignorar pontos e +)
function normalizeGmail(email: string): string {
  if (!email.includes('@')) return email.toLowerCase();
  
  const [localPart, domain] = email.toLowerCase().split('@');
  
  // Se for Gmail, normalizar
  if (domain === 'gmail.com' || domain === 'googlemail.com') {
    // Remover pontos e tudo após +
    const cleanLocal = localPart.replace(/\./g, '').split('+')[0];
    return `${cleanLocal}@gmail.com`;
  }
  
  return `${localPart}@${domain}`;
}

// Função para verificar se um email é admin
export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  
  const normalizedEmail = normalizeGmail(email);
  
  // Normalizar também a lista de admins
  const adminsNormalized = ADMIN_EMAILS.map(admin => normalizeGmail(admin));
  
  return adminsNormalized.includes(normalizedEmail);
}