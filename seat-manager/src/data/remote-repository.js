import { RepositoryError } from '../shared/contracts.js';

async function responseBody(response) {
  try {
    return await response.json();
  } catch {
    return {};
  }
}

export async function requireJson(response) {
  const body=await responseBody(response);
  if (!response.ok) {
    throw new RepositoryError(
      response.status,
      body.code || 'REQUEST_FAILED',
      body.message || '服务器暂时无法完成这个操作',
      body
    );
  }
  return body;
}

export function createRemoteRepository({fetchImpl=fetch,getCsrfToken}) {
  return {
    async load() {
      const response=await fetchImpl('/api/snapshot',{
        credentials:'same-origin',cache:'no-store'
      });
      return (await requireJson(response)).snapshot;
    },
    async command(command) {
      const response=await fetchImpl('/api/commands',{
        method:'POST',
        credentials:'same-origin',
        headers:{
          'Content-Type':'application/json',
          'X-CSRF-Token':getCsrfToken()
        },
        body:JSON.stringify(command)
      });
      return requireJson(response);
    }
  };
}
