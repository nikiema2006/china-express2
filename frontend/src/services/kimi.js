const WORKER_URL = 'https://kimi-import.nikiemalawal6.workers.dev';

async function analyzeAndImport(url, imageBase64 = null) {
  const resp = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, imageBase64 }),
  });

  const data = await resp.json();

  if (!resp.ok) {
    throw new Error(data.error || `Worker error: ${resp.status}`);
  }

  return data;
}

export const kimiService = {
  analyzeAndImport,
};
