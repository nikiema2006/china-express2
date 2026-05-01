const WORKER_URL = 'https://kimi-import.nikiemalawal6.workers.dev';

async function analyzeAndImport(url, imageBase64 = null) {
  const resp = await fetch(WORKER_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, imageBase64 }),
  });

  const text = await resp.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('Response is not valid JSON');
  }

  if (!resp.ok) {
    throw new Error(data.error || `Worker error: ${resp.status}`);
  }

  return data;
}

export const kimiService = {
  analyzeAndImport,
};
