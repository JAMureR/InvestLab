import { CATALOG_FUNDS, CATALOG_ACCOUNTS } from "./finance";

const API_BASE = 'http://localhost:8080/api';
const USE_MOCKS = true; // Set to true to run client-side mock DB for static portfolio hosting on Hostinger

// Local Storage Keys
const DB_USERS_KEY = "investlab_users_db";
const DB_FUNDS_KEY = "investlab_funds_db";
const DB_ACCOUNTS_KEY = "investlab_accounts_db";
const DB_SIMULATIONS_KEY = "investlab_simulations_db";

// DTO Interfaces
export interface AuthUser {
  token: string;
  username: string;
  email: string;
  role: string;
}

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

export interface UserDTO {
  id?: number;
  username: string;
  email: string;
  role: string;
  createdAt?: string;
  password?: string;
}

// Seeding Mock Data
function seedMockDBs() {
  if (!localStorage.getItem(DB_USERS_KEY)) {
    const defaultUsers: UserDTO[] = [
      { id: 1, username: "admin", email: "admin@investlab.com", role: "ROLE_ADMIN", password: "admin123", createdAt: new Date().toISOString() },
      { id: 2, username: "usuario", email: "usuario@investlab.com", role: "ROLE_USER", password: "usuario123", createdAt: new Date().toISOString() }
    ];
    localStorage.setItem(DB_USERS_KEY, JSON.stringify(defaultUsers));
  }

  if (!localStorage.getItem(DB_FUNDS_KEY)) {
    const defaultFunds = CATALOG_FUNDS.map(f => ({ ...f }));
    localStorage.setItem(DB_FUNDS_KEY, JSON.stringify(defaultFunds));
  }

  if (!localStorage.getItem(DB_ACCOUNTS_KEY)) {
    const defaultAccounts = CATALOG_ACCOUNTS.map(a => ({ ...a }));
    localStorage.setItem(DB_ACCOUNTS_KEY, JSON.stringify(defaultAccounts));
  }

  if (!localStorage.getItem(DB_SIMULATIONS_KEY)) {
    localStorage.setItem(DB_SIMULATIONS_KEY, JSON.stringify([]));
  }
}

if (USE_MOCKS) {
  seedMockDBs();
}

// Mock Read/Write helpers
function mockGetUsers(): UserDTO[] {
  const data = localStorage.getItem(DB_USERS_KEY);
  return data ? JSON.parse(data) : [];
}

function mockSaveUsers(users: UserDTO[]) {
  localStorage.setItem(DB_USERS_KEY, JSON.stringify(users));
}

function mockGetFunds(): IndexFundDTO[] {
  const data = localStorage.getItem(DB_FUNDS_KEY);
  return data ? JSON.parse(data) : [];
}

function mockSaveFunds(funds: IndexFundDTO[]) {
  localStorage.setItem(DB_FUNDS_KEY, JSON.stringify(funds));
}

function mockGetAccounts(): RemuneratedAccountDTO[] {
  const data = localStorage.getItem(DB_ACCOUNTS_KEY);
  return data ? JSON.parse(data) : [];
}

function mockSaveAccounts(accounts: RemuneratedAccountDTO[]) {
  localStorage.setItem(DB_ACCOUNTS_KEY, JSON.stringify(accounts));
}

function mockGetSimulations(): SavedSimulationDTO[] {
  const data = localStorage.getItem(DB_SIMULATIONS_KEY);
  return data ? JSON.parse(data) : [];
}

function mockSaveSimulations(simulations: SavedSimulationDTO[]) {
  localStorage.setItem(DB_SIMULATIONS_KEY, JSON.stringify(simulations));
}

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

export async function login(username: string, password: string): Promise<AuthUser> {
  if (USE_MOCKS) {
    const users = mockGetUsers();
    const found = users.find(u => u.username.toLowerCase() === username.toLowerCase() && u.password === password);
    if (!found) {
      throw new Error("Usuario o contraseña incorrectos");
    }
    const data: AuthUser = {
      token: "mock-jwt-token-for-portfolio-visitors-" + found.username,
      username: found.username,
      email: found.email,
      role: found.role
    };
    localStorage.setItem('investlab_token', data.token);
    localStorage.setItem('investlab_user', JSON.stringify({ username: data.username, email: data.email, role: data.role }));
    return data;
  }

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
  if (USE_MOCKS) {
    const users = mockGetUsers();
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      throw new Error("El nombre de usuario '" + username + "' ya está en uso.");
    }
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      throw new Error("El email '" + email + "' ya está registrado.");
    }
    const newUser: UserDTO = {
      id: users.length > 0 ? Math.max(...users.map(u => u.id || 0)) + 1 : 1,
      username,
      email,
      password,
      role: "ROLE_USER",
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    mockSaveUsers(users);

    const data: AuthUser = {
      token: "mock-jwt-token-for-portfolio-visitors-" + newUser.username,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role
    };
    localStorage.setItem('investlab_token', data.token);
    localStorage.setItem('investlab_user', JSON.stringify({ username: data.username, email: data.email, role: data.role }));
    return data;
  }

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

export async function getSimulations(): Promise<SavedSimulationDTO[]> {
  if (USE_MOCKS) {
    const currentUser = getStoredUser();
    if (!currentUser) throw new Error("No autenticado");
    const simulations = mockGetSimulations();
    return (simulations as any[])
      .filter(s => s.username?.toLowerCase() === currentUser.username.toLowerCase())
      .map(({ username, ...dto }) => dto as SavedSimulationDTO);
  }

  const res = await fetchWithAuth('/simulations');
  if (!res.ok) throw new Error('Error al obtener simulaciones');
  return res.json();
}

export async function saveSimulation(payload: SaveSimulationPayload): Promise<SavedSimulationDTO> {
  if (USE_MOCKS) {
    const currentUser = getStoredUser();
    if (!currentUser) throw new Error("No autenticado");

    const simulations = mockGetSimulations();
    const newId = simulations.length > 0 ? Math.max(...simulations.map(s => s.id)) + 1 : 1;
    const now = new Date().toISOString();
    const newSim: any = {
      id: newId,
      username: currentUser.username,
      name: payload.name,
      simulationType: payload.simulationType,
      capitalInicial: payload.capitalInicial,
      aportacionMensual: payload.aportacionMensual,
      tiempoAnios: payload.tiempoAnios,
      interesAnual: payload.interesAnual,
      inflacionAnual: payload.inflacionAnual,
      volatilidadAnual: payload.volatilidadAnual,
      perfilRiesgo: payload.perfilRiesgo,
      selectedFundId: payload.selectedFundId,
      selectedAccountId: payload.selectedAccountId,
      createdAt: now,
      updatedAt: now
    };
    simulations.push(newSim);
    mockSaveSimulations(simulations);

    const { username, ...dto } = newSim;
    return dto as SavedSimulationDTO;
  }

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
  if (USE_MOCKS) {
    const simulations = mockGetSimulations();
    const filtered = simulations.filter(s => s.id !== id);
    mockSaveSimulations(filtered);
    return;
  }

  const res = await fetchWithAuth(`/simulations/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Error al eliminar simulación');
}

// ===== ADMIN PRODUCT CRUD =====

export async function getFunds(): Promise<IndexFundDTO[]> {
  if (USE_MOCKS) {
    return mockGetFunds();
  }
  const res = await fetchWithAuth('/funds');
  if (!res.ok) throw new Error('Error al obtener fondos indexados');
  return res.json();
}

export async function getAccounts(): Promise<RemuneratedAccountDTO[]> {
  if (USE_MOCKS) {
    return mockGetAccounts();
  }
  const res = await fetchWithAuth('/accounts');
  if (!res.ok) throw new Error('Error al obtener cuentas remuneradas');
  return res.json();
}

export async function createFund(payload: IndexFundDTO): Promise<IndexFundDTO> {
  if (USE_MOCKS) {
    const funds = mockGetFunds();
    if (funds.some(f => f.id === payload.id)) {
      throw new Error(`El ID de fondo '${payload.id}' ya está en uso.`);
    }
    funds.push(payload);
    mockSaveFunds(funds);
    return payload;
  }

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
  if (USE_MOCKS) {
    const funds = mockGetFunds();
    const idx = funds.findIndex(f => f.id === id);
    if (idx === -1) throw new Error("Fondo no encontrado");
    funds[idx] = { ...payload, id };
    mockSaveFunds(funds);
    return funds[idx];
  }

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
  if (USE_MOCKS) {
    const funds = mockGetFunds();
    const filtered = funds.filter(f => f.id !== id);
    mockSaveFunds(filtered);
    return;
  }

  const res = await fetchWithAuth(`/funds/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Error al eliminar fondo indexado');
}

export async function createAccount(payload: RemuneratedAccountDTO): Promise<RemuneratedAccountDTO> {
  if (USE_MOCKS) {
    const accounts = mockGetAccounts();
    if (accounts.some(a => a.id === payload.id)) {
      throw new Error(`El ID de cuenta '${payload.id}' ya está en uso.`);
    }
    accounts.push(payload);
    mockSaveAccounts(accounts);
    return payload;
  }

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
  if (USE_MOCKS) {
    const accounts = mockGetAccounts();
    const idx = accounts.findIndex(a => a.id === id);
    if (idx === -1) throw new Error("Cuenta no encontrada");
    accounts[idx] = { ...payload, id };
    mockSaveAccounts(accounts);
    return accounts[idx];
  }

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
  if (USE_MOCKS) {
    const accounts = mockGetAccounts();
    const filtered = accounts.filter(a => a.id !== id);
    mockSaveAccounts(filtered);
    return;
  }

  const res = await fetchWithAuth(`/accounts/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Error al eliminar cuenta remunerada');
}

// ===== ADMIN USER CRUD =====

export async function getUsers(): Promise<UserDTO[]> {
  if (USE_MOCKS) {
    const users = mockGetUsers();
    return users.map(({ password, ...u }) => u);
  }

  const res = await fetchWithAuth('/users');
  if (!res.ok) throw new Error('Error al obtener usuarios');
  return res.json();
}

export async function createUser(payload: UserDTO): Promise<UserDTO> {
  if (USE_MOCKS) {
    const users = mockGetUsers();
    if (users.some(u => u.username.toLowerCase() === payload.username.toLowerCase())) {
      throw new Error(`El nombre de usuario '${payload.username}' ya está en uso.`);
    }
    if (users.some(u => u.email.toLowerCase() === payload.email.toLowerCase())) {
      throw new Error(`El email '${payload.email}' ya está registrado.`);
    }
    const newId = users.length > 0 ? Math.max(...users.map(u => u.id || 0)) + 1 : 1;
    const newUser: UserDTO = {
      ...payload,
      id: newId,
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    mockSaveUsers(users);

    const { password, ...sanitized } = newUser;
    return sanitized;
  }

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
  if (USE_MOCKS) {
    const users = mockGetUsers();
    const idx = users.findIndex(u => u.id === id);
    if (idx === -1) throw new Error("Usuario no encontrado");

    if (users.some(u => u.id !== id && u.username.toLowerCase() === payload.username.toLowerCase())) {
      throw new Error(`El nombre de usuario '${payload.username}' ya está en uso.`);
    }
    if (users.some(u => u.id !== id && u.email.toLowerCase() === payload.email.toLowerCase())) {
      throw new Error(`El email '${payload.email}' ya está registrado.`);
    }

    const currentUserInfo = users[idx];
    const passwordToSave = payload.password && payload.password.trim() !== ""
      ? payload.password
      : currentUserInfo.password;

    users[idx] = {
      ...currentUserInfo,
      username: payload.username,
      email: payload.email,
      role: payload.role,
      password: passwordToSave
    };

    mockSaveUsers(users);

    const { password, ...sanitized } = users[idx];
    return sanitized;
  }

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
  if (USE_MOCKS) {
    const users = mockGetUsers();
    const filtered = users.filter(u => u.id !== id);
    mockSaveUsers(filtered);
    return;
  }

  const res = await fetchWithAuth(`/users/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message || 'Error al eliminar usuario');
  }
}
