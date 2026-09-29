import { AppSettings, BuyerAnalysisResult } from '../types';

export interface DatabaseStatus {
  connected: boolean;
  mode: 'remote-turso' | 'local-libsql';
  url: string;
  hasAuthToken: boolean;
  latencyMs: number;
  buyerCount: number;
  invoiceCount: number;
  timestamp: string;
  error?: string;
}

export async function fetchDatabaseStatus(): Promise<DatabaseStatus> {
  const res = await fetch('/api/db/status');
  if (!res.ok) {
    throw new Error(`Failed to fetch database status: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchBuyersFromDb(): Promise<BuyerAnalysisResult[]> {
  const res = await fetch('/api/buyers');
  if (!res.ok) {
    throw new Error(`Failed to fetch buyers: ${res.statusText}`);
  }
  return res.json();
}

export async function saveBuyerToDbApi(
  buyer: BuyerAnalysisResult
): Promise<{ success: boolean; buyer: BuyerAnalysisResult }> {
  const res = await fetch('/api/buyers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buyer),
  });
  if (!res.ok) {
    throw new Error(`Failed to save buyer: ${res.statusText}`);
  }
  return res.json();
}

export async function deleteBuyerFromDbApi(
  id: string
): Promise<{ success: boolean; deleted: boolean; id: string }> {
  const res = await fetch(`/api/buyers/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!res.ok) {
    throw new Error(`Failed to delete buyer: ${res.statusText}`);
  }
  return res.json();
}

export async function resetBuyersInDbApi(): Promise<BuyerAnalysisResult[]> {
  const res = await fetch('/api/buyers/reset-defaults', {
    method: 'POST',
  });
  if (!res.ok) {
    throw new Error(`Failed to reset buyers: ${res.statusText}`);
  }
  const data = await res.json();
  return data.buyers;
}

export async function fetchSettingsFromDb(): Promise<AppSettings | null> {
  const res = await fetch('/api/settings');
  if (!res.ok) {
    throw new Error(`Failed to fetch settings: ${res.statusText}`);
  }
  return res.json();
}

export async function saveSettingsToDbApi(
  settings: AppSettings
): Promise<{ success: boolean; settings: AppSettings }> {
  const res = await fetch('/api/settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  });
  if (!res.ok) {
    throw new Error(`Failed to save settings: ${res.statusText}`);
  }
  return res.json();
}
