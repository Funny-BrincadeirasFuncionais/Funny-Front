import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'https://funny-back-py.onrender.com';

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

export async function registrarProgresso(payload: {
  crianca_id: number;
  atividade_id: number;
  pontuacao: number;
  observacoes?: string | null;
  concluida?: boolean;
}) {
  return postJson('/progresso/registrar', {
    ...payload,
    concluida: payload.concluida ?? true,
    observacoes: payload.observacoes ?? null,
  });
}
