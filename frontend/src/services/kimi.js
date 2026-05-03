const API_URL = '/api/kimi-import';

async function submitTask(url, imageBase64 = null) {
  const resp = await fetch(`${API_URL}?action=analyze`, {
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
    throw new Error(data.error || `API error: ${resp.status}`);
  }

  return data;
}

async function analyzeProductImages(imageBase64s, url = '') {
  const resp = await fetch(`${API_URL}?action=analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, imageBase64s }),
  });

  const text = await resp.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Invalid response: ${text.substring(0, 200)}`);
  }

  if (!resp.ok) {
    throw new Error(data.error || `API error: ${resp.status}`);
  }

  if (!data.success || !data.product) {
    throw new Error('Invalid response from AI analysis');
  }

  return data.product;
}

async function importProductFromImages(imageBase64s, url = '') {
  const resp = await fetch(`${API_URL}?action=import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, imageBase64s }),
  });

  const text = await resp.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Invalid response: ${text.substring(0, 200)}`);
  }

  if (!resp.ok) {
    throw new Error(data.error || `API error: ${resp.status}`);
  }

  if (!data.success || !data.product) {
    throw new Error('Invalid response from AI import');
  }

  return data.product;
}

export const kimiService = {
  analyzeProductImages,
  importProductFromImages,
  submitTask,
};
