const WORKER_URL = 'https://kimi-import.nikiemalawal6.workers.dev';

function getEdgeFunctionUrl() {
  const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
  if (!SUPABASE_URL) {
    throw new Error('Missing REACT_APP_SUPABASE_URL');
  }
  return `${SUPABASE_URL}/functions/v1/kimi-import`;
}

function getHeaders() {
  const SUPABASE_ANON_KEY = process.env.REACT_APP_SUPABASE_ANON_KEY;
  if (!SUPABASE_ANON_KEY) {
    throw new Error('Missing REACT_APP_SUPABASE_ANON_KEY');
  }
  return {
    'Content-Type': 'application/json',
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
  };
}

async function submitTask(url, imageBase64 = null) {
  const resp = await fetch(`${WORKER_URL}/task`, {
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

  return data.task_id;
}

async function pollTask(taskId) {
  const resp = await fetch(`${WORKER_URL}/task/${taskId}`, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' },
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

async function analyzeAndImport(url, imageBase64 = null) {
  const taskId = await submitTask(url, imageBase64);

  return new Promise((resolve, reject) => {
    const poll = async () => {
      try {
        const task = await pollTask(taskId);

        if (task.status === 'completed') {
          resolve(task.result);
        } else if (task.status === 'failed') {
          reject(new Error(task.error || 'Task failed'));
        } else {
          setTimeout(poll, 2000);
        }
      } catch (err) {
        reject(err);
      }
    };

    poll();
  });
}

async function analyzeProductImages(imageBase64s, url = '') {
  const resp = await fetch(`${getEdgeFunctionUrl()}?action=analyze`, {
    method: 'POST',
    headers: getHeaders(),
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
    throw new Error(data.error || `Edge Function error: ${resp.status}`);
  }

  if (!data.success || !data.product) {
    throw new Error('Invalid response from AI analysis');
  }

  return data.product;
}

async function importProductFromImages(imageBase64s, url = '') {
  const resp = await fetch(`${getEdgeFunctionUrl()}?action=import`, {
    method: 'POST',
    headers: getHeaders(),
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
    throw new Error(data.error || `Edge Function error: ${resp.status}`);
  }

  if (!data.success || !data.product) {
    throw new Error('Invalid response from AI import');
  }

  return data.product;
}

export const kimiService = {
  analyzeAndImport,
  submitTask,
  pollTask,
  analyzeProductImages,
  importProductFromImages,
};
