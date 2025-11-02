import AsyncStorage from '@react-native-async-storage/async-storage';

export const BASE_URL = 'https://funny-back-py.onrender.com';

async function getAuthHeader(): Promise<Record<string, string>> {
  try {
    const token = await AsyncStorage.getItem('token');
    if (token) return { Authorization: `Bearer ${token}` };
  } catch (_) {
    // ignore
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

export default apiFetch;
