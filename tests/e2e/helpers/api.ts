/**
 * Direct API helpers for test data setup/teardown.
 * Uses fetch against the backend API with admin credentials.
 */

const API_BASE = process.env.TEST_API_URL || 'https://localhost:5215';

let adminToken: string | null = null;

async function getAdminToken(): Promise<string> {
  if (adminToken) return adminToken;

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: process.env.TEST_ADMIN_EMAIL || 'admin@lofberg.com',
      password: process.env.TEST_ADMIN_PASSWORD || 'Admin@123!',
    }),
  });

  const json = await res.json();
  adminToken = json.data?.token;
  if (!adminToken) throw new Error(`Admin login failed: ${JSON.stringify(json)}`);
  return adminToken;
}

async function apiGet(path: string): Promise<any> {
  const token = await getAdminToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

export async function apiPost(path: string, body?: any): Promise<any> {
  const token = await getAdminToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function apiPut(path: string, body?: any): Promise<any> {
  const token = await getAdminToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

async function apiDelete(path: string): Promise<any> {
  const token = await getAdminToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 204) return null;
  return res.json().catch(() => null);
}

/** Get the first template ID from the templates list */
export async function getFirstTemplateId(): Promise<string> {
  const data = await apiGet('/templates');
  const templates = data.data ?? data;
  if (Array.isArray(templates) && templates.length > 0) return templates[0].id;
  throw new Error('No templates found in the system');
}

/** Get first template with its active version */
export async function getFirstTemplateWithVersion(): Promise<{ templateId: string; versionId: string }> {
  const templateId = await getFirstTemplateId();
  const data = await apiGet(`/templates/${templateId}/versions`);
  const versions = data.data ?? data;
  if (Array.isArray(versions) && versions.length > 0) {
    return { templateId, versionId: versions[0].id };
  }
  throw new Error(`No versions found for template ${templateId}`);
}

/** Save a draft report and return its ID */
export async function createDraftReport(): Promise<string> {
  const wizardState = {
    currentStep: 1,
    step1: {
      customerName: 'Test Customer',
      reportDate: new Date().toISOString().split('T')[0],
    },
  };

  const data = await apiPut('/reports/drafts', {
    draftId: null,
    wizardState,
  });

  return data.data?.id ?? data.id;
}

/** Get a list of customers */
export async function getCustomers(): Promise<any[]> {
  const data = await apiGet('/customers?pageNumber=1&pageSize=10');
  return data.data?.items ?? data.items ?? [];
}

/** Get first active customer ID */
export async function getFirstCustomerId(): Promise<string> {
  const customers = await getCustomers();
  if (customers.length > 0) return customers[0].id;
  throw new Error('No customers found');
}

/** Get users list */
export async function getUsers(): Promise<any[]> {
  const data = await apiGet('/users?pageNumber=1&pageSize=50');
  return data.data?.items ?? data.items ?? [];
}

/** Get segment conversions */
export async function getSegmentConversions(): Promise<any[]> {
  const data = await apiGet('/segment-conversions');
  return data.data ?? data ?? [];
}

/** Get CO2 conversions */
export async function getCO2Conversions(): Promise<any[]> {
  const data = await apiGet('/co2-conversions');
  return data.data ?? data ?? [];
}

/** Get resources list */
export async function getResources(): Promise<any[]> {
  const data = await apiGet('/resources?pageNumber=1&pageSize=10');
  return data.data?.items ?? data.items ?? [];
}

/** Create a minimal CSV content for report wizard testing */
export function generateTestCsvContent(): string {
  return [
    'Customer,Quantity_KG,CO2_KG,FT_Cooperative_Premium_EUR,FT_Organic_Income_EUR,Time_Period',
    'Test Customer,1000,500,250,100,2025',
  ].join('\n');
}

/** Generate a small valid PNG file as a Buffer */
export function generateTestPng(): Buffer {
  // Minimal 1x1 red pixel PNG
  return Buffer.from(
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==',
    'base64'
  );
}

/** Generate a minimal .exe-like file (just the MZ header) for rejection testing */
export function generateFakeExe(): Buffer {
  const buf = Buffer.alloc(64);
  buf.write('MZ'); // DOS executable magic bytes
  return buf;
}
