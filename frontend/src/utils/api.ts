const API_BASE = 'http://localhost:8080/api';

/**
 * Wrapper around fetch that automatically injects the JWT token
 * from localStorage into the Authorization header.
 */
async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const token = localStorage.getItem('investlab_token');
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
  });

  // Si el token ha expirado o es inválido, limpiar sesión
  if (response.status === 401 || response.status === 403) {
    const currentToken = localStorage.getItem('investlab_token');
    if (currentToken) {
      localStorage.removeItem('investlab_token');
      localStorage.removeItem('investlab_user');
      window.dispatchEvent(new Event('auth_expired'));
    }
  }

  return response;
}

// ===== AUTH =====

export interface AuthUser {
  token: string;
  username: string;
  email: string;
  role: string;
}

export async function login(username: string, password: string): Promise<AuthUser> {
  const res = await fetchWithAuth('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || err.details?.password || 'Error al iniciar sesión');
  }

  const data = await res.json();
  localStorage.setItem('investlab_token', data.token);
  localStorage.setItem('investlab_user', JSON.stringify({ username: data.username, email: data.email, role: data.role }));
  return data;
}

export async function register(username: string, email: string, password: string): Promise<AuthUser> {
  const res = await fetchWithAuth('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });

  if (!res.ok) {
    const err = await res.json();
    const firstDetail = err.details ? Object.values(err.details)[0] : null;
    throw new Error(err.message || (firstDetail as string) || 'Error al registrarse');
  }

  const data = await res.json();
  localStorage.setItem('investlab_token', data.token);
  localStorage.setItem('investlab_user', JSON.stringify({ username: data.username, email: data.email, role: data.role }));
  return data;
}

export function logout(): void {
  localStorage.removeItem('investlab_token');
  localStorage.removeItem('investlab_user');
}

export function getStoredUser(): { username: string; email: string; role?: string } | null {
  const raw = localStorage.getItem('investlab_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('investlab_token');
}

// ===== SIMULATIONS =====

export interface SavedSimulationDTO {
  id: number;
  name: string;
  simulationType: string;
  capitalInicial: number;
  aportacionMensual: number;
  tiempoAnios: number;
  interesAnual: number;
  inflacionAnual: number;
  volatilidadAnual: number;
  perfilRiesgo: string;
  selectedFundId?: string;
  selectedAccountId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SaveSimulationPayload {
  name: string;
  simulationType: string;
  capitalInicial: number;
  aportacionMensual: number;
  tiempoAnios: number;
  interesAnual: number;
  inflacionAnual: number;
  volatilidadAnual: number;
  perfilRiesgo: string;
  selectedFundId?: string;
  selectedAccountId?: string;
}

export async function getSimulations(): Promise<SavedSimulationDTO[]> {
  const res = await fetchWithAuth('/simulations');
  if (!res.ok) throw new Error('Error al obtener simulaciones');
  return res.json();
}

export async function saveSimulation(payload: SaveSimulationPayload): Promise<SavedSimulationDTO> {
  const res = await fetchWithAuth('/simulations', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Error al guardar simulación');
  }
  return res.json();
}

export async function deleteSimulation(id: number): Promise<void> {
  const res = await fetchWithAuth(`/simulations/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Error al eliminar simulación');
}

// ===== ADMIN PRODUCT CRUD =====

export interface IndexFundDTO {
  id?: string;
  name: string;
  ticker: string;
  isin: string;
  historicalReturn1Y: number;
  historicalReturn5Y: number;
  riskRating: number;
  ter: number;
  region: string;
  category: string;
  volatility: number;
  beta: number;
}

export interface RemuneratedAccountDTO {
  id?: string;
  name: string;
  percentageTAE: number;
  payoutFrequency: string;
  liquidity: string;
  riskRating: number;
  logoUrl?: string | null;
  conditions: string;
}

export async function createFund(payload: IndexFundDTO): Promise<IndexFundDTO> {
  const res = await fetchWithAuth('/funds', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Error al crear fondo indexado');
  }
  return res.json();
}

export async function updateFund(id: string, payload: IndexFundDTO): Promise<IndexFundDTO> {
  const res = await fetchWithAuth(`/funds/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Error al actualizar fondo indexado');
  }
  return res.json();
}

export async function deleteFund(id: string): Promise<void> {
  const res = await fetchWithAuth(`/funds/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Error al eliminar fondo indexado');
}

export async function createAccount(payload: RemuneratedAccountDTO): Promise<RemuneratedAccountDTO> {
  const res = await fetchWithAuth('/accounts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Error al crear cuenta remunerada');
  }
  return res.json();
}

export async function updateAccount(id: string, payload: RemuneratedAccountDTO): Promise<RemuneratedAccountDTO> {
  const res = await fetchWithAuth(`/accounts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Error al actualizar cuenta remunerada');
  }
  return res.json();
}

export async function deleteAccount(id: string): Promise<void> {
  const res = await fetchWithAuth(`/accounts/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Error al eliminar cuenta remunerada');
}

// ===== ADMIN USER CRUD =====

export interface UserDTO {
  id?: number;
  username: string;
  email: string;
  role: string;
  createdAt?: string;
  password?: string;
}

export async function getUsers(): Promise<UserDTO[]> {
  const res = await fetchWithAuth('/users');
  if (!res.ok) throw new Error('Error al obtener usuarios');
  return res.json();
}

export async function createUser(payload: UserDTO): Promise<UserDTO> {
  const res = await fetchWithAuth('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Error al crear usuario');
  }
  return res.json();
}

export async function updateUser(id: number, payload: UserDTO): Promise<UserDTO> {
  const res = await fetchWithAuth(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Error al actualizar usuario');
  }
  return res.json();
}

export async function deleteUser(id: number): Promise<void> {
  const res = await fetchWithAuth(`/users/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Error al eliminar usuario');
  }
}
