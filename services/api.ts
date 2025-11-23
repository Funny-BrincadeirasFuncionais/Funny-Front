import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// URL do backend - prioridade:
// 1. Variável de ambiente EXPO_PUBLIC_API_URL (maior prioridade - permite override)
// 2. Configuração no app.json (extra.API_URL)
// 3. URL de produção como padrão (Render)
const getBaseUrl = (): string => {
  // Variável de ambiente (pode ser definida no .env ou no sistema)
  // Útil para desenvolvimento local: EXPO_PUBLIC_API_URL=http://localhost:8000
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // Configuração no app.json (padrão: produção no Render)
  const configUrl = (Constants.expoConfig as any)?.extra?.API_URL;
  if (configUrl) {
    return configUrl;
  }

  // Fallback: URL de produção no Render
  return 'https://funny-back-py.onrender.com';
};

export const BASE_URL = getBaseUrl();

// Log da URL configurada (sempre, para debug)
console.log('🔗 Backend URL configurada:', BASE_URL);

async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) return { Authorization: `Bearer ${token}` };
  } catch (e) {
    console.warn('getAuthHeader error', e);
  }
  return {};
}

export async function apiFetch(path: string, options: RequestInit = {}) {
  const prefix = path.startsWith('/') ? '' : '/';
  const url = path.startsWith('http') ? path : `${BASE_URL}${prefix}${path}`;

  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  const authHeader = await getAuthHeader();

  const headers: HeadersInit = {
    ...defaultHeaders,
    ...authHeader,
    ...(options.headers as Record<string, string> | undefined),
  };

  const res = await fetch(url, { ...options, headers: headers as any });
  // Debug: log the actual request URL and status for troubleshooting
  try {
    console.log('➡️ apiFetch', options?.method || 'GET', url);
    if (options?.body) {
      try {
        console.log('   body:', typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
      } catch (e) {
        console.log('   body: [unserializable]');
      }
    }
  } catch (e) {}
  return res;
}

export async function getJson(path: string) {
  const res = await apiFetch(path);
  return res.json();
}

export async function postJson(path: string, body: any) {
  const res = await apiFetch(path, { method: 'POST', body: JSON.stringify(body) });
  return res;
}

export async function putJson(path: string, body: any) {
  const res = await apiFetch(path, { method: 'PUT', body: JSON.stringify(body) });
  return res;
}

export async function deleteJson(path: string) {
  const res = await apiFetch(path, { method: 'DELETE' });
  return res;
}

export default apiFetch;

// ---- Domain helpers (Progresso/Atividades) ----

export async function listAtividades(): Promise<any[]> {
  try {
    const data = await getJson('/atividades');
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.warn('listAtividades error', e);
    return [];
  }
}

export async function ensureAtividadeExists(
  titulo: string,
  descricao: string,
  categoria: string,
  nivel_dificuldade = 1
): Promise<number | null> {
  const atividades = await listAtividades();
  const found = atividades.find((a: any) => a.titulo?.toLowerCase() === titulo.toLowerCase());
  if (found) return found.id;
  try {
    const res = await postJson('/atividades', {
      titulo,
      descricao,
      categoria,
      nivel_dificuldade,
    });
    if (!res.ok) return null;
    const created = await res.json();
    return created?.id ?? null;
  } catch (e) {
    console.warn('ensureAtividadeExists error', e);
    return null;
  }
}

export async function getProgressoCrianca(criancaId: number): Promise<any[]> {
  try {
    const data = await getJson(`/progresso/crianca/${criancaId}`);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.warn('getProgressoCrianca error', e);
    return [];
  }
}

export async function getProgressoTurma(turmaId: number): Promise<any[]> {
  try {
    const data = await getJson(`/progresso/turma/${turmaId}`);
    return Array.isArray(data) ? data : [];
  } catch (e) {
    console.warn('getProgressoTurma error', e);
    return [];
  }
}

export async function registrarProgresso(payload: {
  crianca_id: number;
  atividade_id: number;
  pontuacao?: number;
  movimentos?: number;
  observacoes?: string | null;
  concluida?: boolean;
  tempo_segundos?: number;
}) {
  try {
    const body: any = {
      crianca_id: payload.crianca_id,
      atividade_id: payload.atividade_id,
      concluida: payload.concluida ?? true,
      observacoes: payload.observacoes ?? null,
      tempo_segundos: payload.tempo_segundos ?? undefined,
    };
    if (typeof payload.pontuacao !== 'undefined') body.pontuacao = payload.pontuacao;
    if (typeof payload.movimentos !== 'undefined') body.movimentos = payload.movimentos;

    const res = await postJson('/progresso/registrar', body);

    const result: {
      ok: boolean;
      status: number;
      data?: any;
      text?: string;
      error?: string;
    } = { ok: res.ok, status: res.status };

    const ct = res.headers.get?.('content-type') || '';
    if (ct.includes('application/json')) {
      try {
        result.data = await res.json();
      } catch (e: any) {
        result.text = await res.text().catch(() => undefined);
      }
    } else {
      result.text = await res.text().catch(() => undefined);
    }

    return result;
  } catch (e: any) {
    return { ok: false, status: 0, error: e?.message ?? 'network error' };
  }
}

export async function registrarMinijogo(payload: {
  pontuacao?: number;
  categoria: string;
  crianca_id: number;
  titulo: string;
  descricao: string;
  observacoes?: string | null;
  tempo_segundos?: number;
  movimentos?: number;
}) {
  try {
    const res = await postJson('/progresso/registrar-minijogo', {
      pontuacao: payload.pontuacao,
      categoria: payload.categoria,
      crianca_id: payload.crianca_id,
      titulo: payload.titulo,
      descricao: payload.descricao,
      observacoes: payload.observacoes ?? null,
      tempo_segundos: payload.tempo_segundos ?? undefined,
      movimentos: payload.movimentos ?? undefined,
    });

    const result: {
      ok: boolean;
      status: number;
      data?: any;
      text?: string;
      error?: string;
    } = { ok: res.ok, status: res.status };

    const ct = res.headers.get?.('content-type') || '';
    if (ct.includes('application/json')) {
      try {
        result.data = await res.json();
      } catch (e: any) {
        result.text = await res.text().catch(() => undefined);
      }
    } else {
      result.text = await res.text().catch(() => undefined);
    }

    return result;
  } catch (e: any) {
    return { ok: false, status: 0, error: e?.message ?? 'network error' };
  }
}

// ---- Responsáveis ----
export async function getResponsavel(responsavelId: number) {
  return getJson(`/responsaveis/${responsavelId}`);
}

export async function updateResponsavel(responsavelId: number, body: Partial<{ nome: string; email: string; telefone: string }>) {
  return putJson(`/responsaveis/${responsavelId}`, body);
}

// ---- Relatórios IA ----
export interface RelatorioCriancaRequest {
  crianca_id: number;
  incluir_progresso?: boolean;
  incluir_atividades?: boolean;
  periodo_dias?: number;
}

export interface RelatorioTurmaRequest {
  turma_id?: number;
  incluir_progresso?: boolean;
  incluir_atividades?: boolean;
  periodo_dias?: number;
}

export async function gerarRelatorioCrianca(request: RelatorioCriancaRequest) {
  try {
    const res = await postJson('/relatorios-ia/crianca', request);
    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Erro desconhecido');
      throw new Error(`Erro ao gerar relatório: ${res.status} - ${errorText}`);
    }
    return await res.json();
  } catch (e: any) {
    console.error('Erro ao gerar relatório de criança:', e);
    throw e;
  }
}

export async function gerarRelatorioTurma(request: RelatorioTurmaRequest = {}) {
  try {
    const res = await postJson('/relatorios-ia/turma', request);
    if (!res.ok) {
      const errorText = await res.text().catch(() => 'Erro desconhecido');
      throw new Error(`Erro ao gerar relatório: ${res.status} - ${errorText}`);
    }
    return await res.json();
  } catch (e: any) {
    console.error('Erro ao gerar relatório de turma:', e);
    throw e;
  }
}