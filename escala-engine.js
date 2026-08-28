/* escala-engine.js — MOTOR DE CÁLCULO UNIFICADO SAMU 192 USB 11 ORLEANS */

const SUPABASE_URL = "https://rcpgukslnlfptreiusff.supabase.co"; 
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJjcGd1a3NsbmxmcHRyZWl1c2ZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwMDQ2MTYsImV4cCI6MjEwMjU4MDYxNn0.LgadTI7PwlLMBT5TbNkMncI0OfL22wjGAU_xanR4J6A"; 

let dbNuvem = null;
try {
  if (typeof supabase !== 'undefined') {
    dbNuvem = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
} catch(e) {}

const feriadosOficiaisNacionais = [
  "2026-01-01", "2026-02-16", "2026-02-17", "2026-04-03", "2026-04-21", 
  "2026-05-01", "2026-06-04", "2026-09-07", "2026-10-12", "2026-11-02", 
  "2026-11-15", "2026-12-25"
];

const duplasPadrao = [
  { cond: "Renato Cândido", tec: "Luis Eduardo Formanski Vitório" },
  { cond: "Daniel Alexandre Fernandes", tec: "Gicerléia Trindade da Rosa" },
  { cond: "Vanderlei José Tasca", tec: "Suandre Adão Machado" },
  { cond: "Márcio Becker", tec: "Rinaldo Calegario" },
  { cond: "Lucas Vieira Mendes", tec: "Clênio Borges" }
];

const diasSemanaAbrev = ["dom.", "seg.", "ter.", "qua.", "qui.", "sex.", "sáb."];
const mesesNomes = ["JANEIRO", "FEVEREIRO", "MARÇO", "ABRIL", "MAIO", "JUNHO", "JULHO", "AGOSTO", "SETEMBRO", "OUTUBRO", "NOVEMBRO", "DEZEMBRO"];

let colaboradoresGlobal = [];
let trocasGlobal = [];
let afastamentosGlobal = [];

async function sincronizarBancoGeral() {
  if (!dbNuvem) return;
  try {
    const { data: cData } = await dbNuvem.from('colaboradores').select('*');
    colaboradoresGlobal = cData || [];

    const { data: tData } = await dbNuvem.from('trocas').select('*');
    trocasGlobal = tData || [];

    const { data: aData } = await dbNuvem.from('afastamentos').select('*');
    afastamentosGlobal = (aData || []).map(a => ({
      ...a,
      substitutosDiarios: typeof a.substitutosDiarios === 'string' 
        ? JSON.parse(a.substitutosDiarios) 
        : a.substitutosDiarios
    }));
  } catch(e) {
    console.error("Erro ao sincronizar banco no Engine:", e);
  }
}

function calcularDiaOficial(dtIso, dataBaseStr = "2026-06-01") {
  const dataBase = new Date(dataBaseStr + "T00:00:00");
  const dtAtual = new Date(dtIso + "T00:00:00");
  
  const diffTime = dtAtual.getTime() - dataBase.getTime();
  const diasCorridosBase = Math.floor(diffTime / (1000 * 3600 * 24));

  if (diasCorridosBase < 0) {
    return { cond: "FORA DA SEQUÊNCIA", tec: "FORA DA SEQUÊNCIA", obs: "-" };
  }

  const eqIndex2496 = ((diasCorridosBase % duplasPadrao.length) + duplasPadrao.length) % duplasPadrao.length;
  let cond = duplasPadrao[eqIndex2496].cond;
  let tec = duplasPadrao[eqIndex2496].tec;
  let obs = "-";

  // 1. REGIME DE CATEGORIA (24X72) POR LICENÇA DE LONGA DURAÇÃO
  const afCond = afastamentosGlobal.find(a => a.funcao && a.funcao.includes("Condutor") && a.regime && a.regime.includes("Categoria") && dtIso >= a.inicio && dtIso <= a.fim);
  const afTec = afastamentosGlobal.find(a => a.funcao && (a.funcao.includes("Técnic") || a.funcao.includes("Enfermeir")) && !a.funcao.includes("Coordenadora") && a.regime && a.regime.includes("Categoria") && dtIso >= a.inicio && dtIso <= a.fim);

  if (afCond) {
    const condutoresAtivos = ["Renato Cândido", "Daniel Alexandre Fernandes", "Vanderlei José Tasca", "Márcio Becker"];
    const dtIniAf = new Date(afCond.inicio + "T00:00:00");
    const diffAf = Math.floor((dtAtual.getTime() - dtIniAf.getTime()) / (1000 * 3600 * 24));
    if (diffAf >= 0 && condutoresAtivos.length > 0) {
      cond = condutoresAtivos[diffAf % condutoresAtivos.length];
    }
  }

  if (afTec) {
    const tecsAtivos = ["Luis Eduardo Formanski Vitório", "Gicerléia Trindade da Rosa", "Suandre Adão Machado", "Rinaldo Calegario"];
    const dtIniAf = new Date(afTec.inicio + "T00:00:00");
    const diffAf = Math.floor((dtAtual.getTime() - dtIniAf.getTime()) / (1000 * 3600 * 24));
    if (diffAf >= 0 && tecsAtivos.length > 0) {
      tec = tecsAtivos[diffAf % tecsAtivos.length];
    }
  }

  // 2. ATESTADOS DIÁRIOS
  afastamentosGlobal.forEach(atestado => {
    if (dtIso >= atestado.inicio && dtIso <= atestado.fim) {
      const substDia = atestado.substitutosDiarios ? atestado.substitutosDiarios[dtIso] : null;
      const labelMotivo = atestado.tipoMotivo || "Atestado";

      if (cond === atestado.servidor) {
        if (substDia && substDia !== "A DEFINIR") {
          cond = `${substDia} (Subst.)`;
          obs = `Cobertura: ${atestado.servidor}`;
        } else if (atestado.regime && !atestado.regime.includes("Categoria")) {
          cond = `<span style="color:#dc2626; font-weight:bold;">SUBSTITUTO A DEFINIR</span>`;
          obs = `${labelMotivo}: ${atestado.servidor}`;
        }
      }

      if (tec === atestado.servidor) {
        if (substDia && substDia !== "A DEFINIR") {
          tec = `${substDia} (Subst.)`;
          obs = `Cobertura: ${atestado.servidor}`;
        } else if (atestado.regime && !atestado.regime.includes("Categoria")) {
          tec = `<span style="color:#dc2626; font-weight:bold;">SUBSTITUTO A DEFINIR</span>`;
          obs = `${labelMotivo}: ${atestado.servidor}`;
        }
      }
    }
  });

  // 3. TROCAS DE PLANTÃO APROVADAS
  const trocasAprovadas = trocasGlobal.filter(t => (t.dataMinha === dtIso || t.dataDevolucao === dtIso) && (t.status === "APROVADO" || t.status === "PAGO / QUITADO"));
  
  if (trocasAprovadas.length > 0) {
    let condDiurno = null, condNoturno = null;
    let tecDiurno = null, tecNoturno = null;

    trocasAprovadas.forEach(t => {
      const p = t.periodo || "24h";
      const ehMinhaData = (t.dataMinha === dtIso);
      const titular = ehMinhaData ? t.solicitante : t.substituto;
      const cobridor = ehMinhaData ? t.substituto : t.solicitante;

      if (cond.includes(titular) || cond.includes(cobridor)) {
        if (p === "24h") {
          cond = `${cobridor} (Subst. 24h)`;
        } else if (p === "12h_diurno") {
          condDiurno = `${cobridor} (Diurno)`;
          condNoturno = `${titular} (Noturno)`;
        } else if (p === "12h_noturno") {
          condDiurno = `${titular} (Diurno)`;
          condNoturno = `${cobridor} (Noturno)`;
        }
      }

      if (tec.includes(titular) || tec.includes(cobridor)) {
        if (p === "24h") {
          tec = `${cobridor} (Subst. 24h)`;
        } else if (p === "12h_diurno") {
          tecDiurno = `${cobridor} (Diurno)`;
          tecNoturno = `${titular} (Noturno)`;
        } else if (p === "12h_noturno") {
          tecDiurno = `${titular} (Diurno)`;
          tecNoturno = `${cobridor} (Noturno)`;
        }
      }

      obs = `Troca Aprovada #${t.id}`;
    });

    if (condDiurno && condNoturno) cond = `<b>${condDiurno}</b> / <b>${condNoturno}</b>`;
    if (tecDiurno && tecNoturno) tec = `<b>${tecDiurno}</b> / <b>${tecNoturno}</b>`;
  }

  return { cond, tec, obs };
}
