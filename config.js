/**
 * SAMU CONNECT - Central Configuration & Supabase Initializer
 * Version: 1.0.0
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
    URL_LOGO: "./assets/logo.png"
  },
  SUPABASE: {
    URL: "https://meqkgjjaidptaljbybr.supabase.co",
    ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lcWtnamphaWRqcHRhbGpieWJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MzMxOTcsImV4cCI6MjEwMzUwOTE5N30.af78fsdsBzC0-bgozbJ3Orgr_Xh5BzhmYNJkXgp1Ki0"
  },
  THEME: {
    PRIMARY_NAVY: "#0B192C",
    SECONDARY_BLUE: "#1E3E62",
    ACCENT_RED: "#D91656",
    BG_LIGHT: "#F4F6F9",
    SURFACE: "#FFFFFF",
    TEXT_MAIN: "#212529"
  }
};

// Inicializador do Cliente Supabase
export const supabase = window.supabase.createClient(CONFIG.SUPABASE.URL, CONFIG.SUPABASE.ANON_KEY);

/**
 * Injeta variáveis de estilo CSS e aplica metadados dinamicos no DOM
 */
export function initTheme() {
  const root = document.documentElement;
  root.style.setProperty('--primary-navy', CONFIG.THEME.PRIMARY_NAVY);
  root.style.setProperty('--secondary-blue', CONFIG.THEME.SECONDARY_BLUE);
  root.style.setProperty('--accent-red', CONFIG.THEME.ACCENT_RED);
  root.style.setProperty('--bg-light', CONFIG.THEME.BG_LIGHT);
  root.style.setProperty('--surface', CONFIG.THEME.SURFACE);
  root.style.setProperty('--text-main', CONFIG.THEME.TEXT_MAIN);

  // Define o título do documento dinamicamente
  document.title = `${CONFIG.SISTEMA.NOME} | ${CONFIG.TENANT.NOME_UNIDADE} - ${CONFIG.TENANT.MUNICIPIO_UF}`;
}

// Auto-executável no carregamento
if (typeof window !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initTheme);
  } else {
    initTheme();
  }
}
