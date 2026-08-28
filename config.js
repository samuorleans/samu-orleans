/**
 * SAMU CONNECT - Central Configuration Module
 * Single Source of Truth para Branding, Unidade e Credenciais do Supabase.
 */

export const CONFIG = {
  SISTEMA: {
    NOME: "SAMU Connect",
    VERSAO: "1.0.0-beta",
    DESCRICAO: "Plataforma de Gestão Operacional de Urgência e Emergência (APH)"
  },
  TENANT: {
    NOME_UNIDADE: "USB 11",
    MUNICIPIO_UF: "ORLEANS / SC",
    BASE_OPERACIONAL: "Orleans",
    URL_LOGO: "./assets/logo.png",
  },
  SUPABASE: {
    URL: "https://meqkgjjaidptaljbybr.supabase.co", // Substitua pelo seu domínio caso divirja
    ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lcWtnamphaWRqcHRhbGpieWJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MzMxOTcsImV4cCI6MjEwMzUwOTE5N30.af78fsdsBzC0-bgozbJ3Orgr_Xh5BzhmYNJkXgp1Ki0"
  },
  THEME: {
    PRIMARY_NAVY: "#0B192C",
    SECONDARY_BLUE: "#1E3E62",
    ACCENT_RED: "#D91656",
    BG_LIGHT: "#F8F9FA",
    SURFACE: "#FFFFFF",
    TEXT_MAIN: "#212529"
  }
};

/**
 * Injeta variáveis de tema no CSS Root e inicializa títulos de página
 */
export function initTheme() {
  const root = document.documentElement;
  root.style.setProperty('--color-primary-navy', CONFIG.THEME.PRIMARY_NAVY);
  root.style.setProperty('--color-secondary-blue', CONFIG.THEME.SECONDARY_BLUE);
  root.style.setProperty('--color-accent-red', CONFIG.THEME.ACCENT_RED);
  root.style.setProperty('--color-bg-light', CONFIG.THEME.BG_LIGHT);
  
  // Atualiza título da aba dinamicamente
  document.title = `${CONFIG.SISTEMA.NOME} | ${CONFIG.TENANT.NOME_UNIDADE} - ${CONFIG.TENANT.MUNICIPIO_UF}`;
}

// Auto-executável ao carregar o script
if (typeof window !== 'undefined') {
  document.addEventListener('DOMContentLoaded', initTheme);
}
