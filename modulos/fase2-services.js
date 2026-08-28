import { CONFIG, supabase } from './config.js';

/**
 * Auxiliar: Garante a renderização da logo.png e metadados no cabeçalho <nav>
 */
export function inicializarCabecalhoNav() {
    const logoElem = document.getElementById('app-logo');
    if (logoElem) {
        logoElem.src = CONFIG.TENANT?.URL_LOGO || CONFIG.LOGO_SISTEMA || './logo.png';
    }

    const titleElem = document.getElementById('app-title');
    if (titleElem) titleElem.textContent = CONFIG.SISTEMA?.NOME || "SAMU Connect";

    const tenantElem = document.getElementById('app-tenant');
    if (tenantElem) {
        tenantElem.textContent = `${CONFIG.TENANT?.NOME_UNIDADE || "USB 11"} - ${CONFIG.TENANT?.MUNICIPIO_UF || "ORLEANS / SC"}`;
    }
}

// Auto-executa a padronização visual ao carregar o DOM
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', inicializarCabecalhoNav);
}

// ==============================================================================
// 1. SALVAR CHECKLIST DO CONDUTOR (operacional_checklists_condutor)
// ==============================================================================
export async function salvarChecklistCondutor(event) {
    if (event) event.preventDefault();
    const btn = document.getElementById('btn-salvar-condutor');
    if (btn) btn.disabled = true;

    try {
        const viaturaId = document.getElementById('cond-viatura-id').value;
        const kmAtual = parseInt(document.getElementById('cond-km-atual').value);

        // Mapeamento dos itens de verificação mecânica para JSONB
        const itensMecanicaJson = {
            farois: document.getElementById('chk-farois')?.checked ?? true,
            sirene: document.getElementById('chk-sirene')?.checked ?? true,
            giroflex: document.getElementById('chk-giroflex')?.checked ?? true,
            limpeza: document.getElementById('chk-limpeza')?.checked ?? true,
            maca_retratil: document.getElementById('chk-maca')?.checked ?? true
        };

        // Ferramentas de salvamento selecionadas
        const ferramentasArray = Array.from(document.querySelectorAll('input[name="ferramentas"]:checked')).map(el => el.value);

        const payload = {
            viatura_id: viaturaId,
            condutor_id: document.getElementById('cond-condutor-id').value || null,
            turno: document.getElementById('cond-turno').value, // Ex: 'PLANTAO_DIA', 'PLANTAO_NOITE'
            km_atual: kmAtual,
            km_proxima_troca_oleo: parseInt(document.getElementById('cond-km-troca-oleo').value),
            nivel_combustivel: document.getElementById('cond-combustivel').value,
            nivel_arla32: document.getElementById('cond-arla32').value,
            pneus_dianteiros: document.getElementById('cond-pneus-dianteiros').value,
            pneus_traseiros: document.getElementById('cond-pneus-traseiros').value,
            pneu_estepe: document.getElementById('cond-pneu-estepe').value,
            epis_nr32: document.getElementById('cond-epis-nr32').value,
            cilindro_portatil_2: document.getElementById('cond-o2-portatil-2').value,
            itens_mecanica: itensMecanicaJson,
            ferramentas_salvamento: ferramentasArray,
            avarias_observacoes: document.getElementById('cond-observacoes').value || null
        };

        const { data, error } = await supabase
            .from('operacional_checklists_condutor')
            .insert([payload])
            .select();

        if (error) throw error;

        // Atualiza a quilometragem sincronizada no cadastro principal da viatura
        await supabase
            .from('operacional_viaturas')
            .update({ km_atual: kmAtual })
            .eq('id', viaturaId);

        alert('Checklist do Socorrista Condutor registrado com sucesso!');
        const form = document.getElementById('form-checklist-condutor');
        if (form) form.reset();
        return data;

    } catch (err) {
        console.error('Erro ao salvar checklist do condutor:', err);
        alert('Erro ao registrar checklist: ' + err.message);
    } finally {
        if (btn) btn.disabled = false;
    }
}

// ==============================================================================
// 2. SALVAR CHECKLIST DO TÉCNICO ENF (operacional_checklists_tecnico)
// ==============================================================================
export async function salvarChecklistTecnico(event) {
    if (event) event.preventDefault();
    const btn = document.getElementById('btn-salvar-tecnico');
    if (btn) btn.disabled = true;

    try {
        const itensMochilasJson = {
            mochila_vermelha_trauma: document.getElementById('chk-mochila-vermelha')?.checked ?? true,
            mochila_azul_respiratoria: document.getElementById('chk-mochila-azul')?.checked ?? true,
            maleta_medica_parto: document.getElementById('chk-maleta-parto')?.checked ?? true
        };

        const payload = {
            viatura_id: document.getElementById('tec-viatura-id').value,
            tecnico_id: document.getElementById('tec-tecnico-id').value || null,
            turno: document.getElementById('tec-turno').value,
            lacre_psicotropicos: document.getElementById('tec-lacre-psicotropicos').value,
            cilindro_fixo_1_bar: parseInt(document.getElementById('tec-o2-fixo-1').value),
            cilindro_fixo_2_bar: parseInt(document.getElementById('tec-o2-fixo-2').value),
            cilindro_portatil_1_bar: parseInt(document.getElementById('tec-o2-portatil-1').value),
            cilindro_ar_comprimido_bar: parseInt(document.getElementById('tec-ar-comprimido').value),
            itens_mochilas: itensMochilasJson,
            alerta_critico: document.getElementById('tec-alerta-critico').value, // 'SEM_ALERTAS', 'INSUMO_FALTANTE', 'VALIDADE_PROXIMA'
            materiais_faltantes_obs: document.getElementById('tec-observacoes').value || null
        };

        const { data, error } = await supabase
            .from('operacional_checklists_tecnico')
            .insert([payload])
            .select();

        if (error) throw error;

        alert('Checklist da Enfermagem registrado com sucesso!');
        const form = document.getElementById('form-checklist-tecnico');
        if (form) form.reset();
        return data;

    } catch (err) {
        console.error('Erro ao salvar checklist técnico:', err);
        alert('Erro ao registrar checklist do técnico: ' + err.message);
    } finally {
        if (btn) btn.disabled = false;
    }
}

// ==============================================================================
// 3. SALVAR ABASTECIMENTO (operacional_abastecimentos)
// ==============================================================================
export async function salvarAbastecimento(event) {
    if (event) event.preventDefault();
    const btn = document.getElementById('btn-salvar-abastecimento');
    if (btn) btn.disabled = true;

    try {
        const viaturaId = document.getElementById('abs-viatura-id').value;
        const kmAbastecimento = parseInt(document.getElementById('abs-km-atual').value);

        const payload = {
            viatura_id: viaturaId,
            condutor_id: document.getElementById('abs-condutor-id').value || null,
            posto_id: document.getElementById('abs-posto-id').value || null,
            insumo_combustivel: document.getElementById('abs-combustivel').value, // Ex: 'DIESEL_S10'
            km_atual: kmAbastecimento,
            litros_abastecidos: parseFloat(document.getElementById('abs-litros').value),
            valor_total: parseFloat(document.getElementById('abs-valor-total').value),
            observacoes_nf: document.getElementById('abs-observacoes-nf').value || null
        };

        const { data, error } = await supabase
            .from('operacional_abastecimentos')
            .insert([payload])
            .select();

        if (error) throw error;

        // Atualiza KM da viatura
        await supabase
            .from('operacional_viaturas')
            .update({ km_atual: kmAbastecimento })
            .eq('id', viaturaId);

        alert('Abastecimento gravado com sucesso!');
        const form = document.getElementById('form-abastecimento');
        if (form) form.reset();
        return data;

    } catch (err) {
        console.error('Erro ao salvar abastecimento:', err);
        alert('Erro ao salvar abastecimento: ' + err.message);
    } finally {
        if (btn) btn.disabled = false;
    }
}

// ==============================================================================
// 4. SALVAR SUBSTITUIÇÃO DE LACRE (operacional_lacres)
// ==============================================================================
export async function salvarSubstituicaoLacre(event) {
    if (event) event.preventDefault();
    const btn = document.getElementById('btn-salvar-lacre');
    if (btn) btn.disabled = true;

    try {
        const payload = {
            viatura_id: document.getElementById('lacre-viatura-id').value,
            responsavel_id: document.getElementById('lacre-responsavel-id').value || null,
            numero_lacre_rompido: document.getElementById('lacre-rompido').value,
            numero_lacre_novo: document.getElementById('lacre-novo').value,
            motivo_substituicao: document.getElementById('lacre-motivo').value,
            observacoes: document.getElementById('lacre-observacoes').value || null
        };

        const { data, error } = await supabase
            .from('operacional_lacres')
            .insert([payload])
            .select();

        if (error) throw error;

        alert('Substituição de lacre registrada com sucesso!');
        const form = document.getElementById('form-lacre');
        if (form) form.reset();
        return data;

    } catch (err) {
        console.error('Erro ao salvar lacre:', err);
        alert('Erro ao salvar substituição de lacre: ' + err.message);
    } finally {
        if (btn) btn.disabled = false;
    }
}

// ==============================================================================
// 5. SALVAR LIVRO DE MANUTENÇÃO (operacional_manutencoes_livro)
// ==============================================================================
export async function salvarManutencaoLivro(event) {
    if (event) event.preventDefault();
    const btn = document.getElementById('btn-salvar-manutencao');
    if (btn) btn.disabled = true;

    try {
        const viaturaId = document.getElementById('manut-viatura-id').value;
        const modoRegistro = document.getElementById('manut-modo-registro').value; // 'EXECUTADO' ou 'AGENDADO'
        const statusManut = document.getElementById('manut-status').value || 'EXECUTADO';

        const payload = {
            viatura_id: viaturaId,
            colaborador_id: document.getElementById('manut-colaborador-id').value || null,
            oficina_id: document.getElementById('manut-oficina-id').value || null,
            modo_registro: modoRegistro,
            data_manutencao: document.getElementById('manut-data-execucao').value || null,
            data_agendada: document.getElementById('manut-data-agendada').value || null,
            km_no_servico: parseInt(document.getElementById('manut-km-servico').value),
            tipo_manutencao: document.getElementById('manut-tipo').value, // 'PREVENTIVA', 'CORRETIVA', 'TROCA_OLEO', 'REVISAO'
            numero_nota_fiscal: document.getElementById('manut-nf').value || null,
            valor_total: parseFloat(document.getElementById('manut-valor').value) || null,
            email_lembrete: document.getElementById('manut-email-lembrete').value || null,
            servicos_executados: document.getElementById('manut-servicos').value,
            status: statusManut
        };

        const { data, error } = await supabase
            .from('operacional_manutencoes_livro')
            .insert([payload])
            .select();

        if (error) throw error;

        // Se a manutenção for do tipo agendada ou em andamento, atualiza o status da viatura
        if (modoRegistro === 'AGENDADO' || statusManut === 'EM_ANDAMENTO') {
            await supabase
                .from('operacional_viaturas')
                .update({ status: 'MANUTENCAO' })
                .eq('id', viaturaId);
        }

        alert('Registro inserido no Livro de Manutenção com sucesso!');
        const form = document.getElementById('form-manutencao');
        if (form) form.reset();
        return data;

    } catch (err) {
        console.error('Erro ao salvar livro de manutenção:', err);
        alert('Erro ao registrar manutenção: ' + err.message);
    } finally {
        if (btn) btn.disabled = false;
    }
}
