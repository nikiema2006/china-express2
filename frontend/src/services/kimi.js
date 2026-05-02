const WORKER_URL = 'https://kimi-import.nikiemalawal6.workers.dev';

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

export const kimiService = {
  analyzeAndImport,
  submitTask,
  pollTask,
};
