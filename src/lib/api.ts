import { toLogin } from '@/utils/auth';
import ky from 'ky';

console.log("import.meta.env.", import.meta.env, import.meta.env.VITE_API_BASE_URL)

const api = ky.create({
  prefixUrl: import.meta.env.VITE_API_BASE_URL,
  headers: {
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  // Override the default JSON parser to check the `code` field.
  parseJson: (text: string) => {
    const json = JSON.parse(text);
    if (json.code !== "200") {
      throw new Error(json.message || 'API request error');
    }
    return json.data;
  },
  hooks: {
    beforeRequest: [
      (request) => {
        if (typeof window !== 'undefined') {
          const token = localStorage.getItem('accessToken');
          if (token) {
            request.headers.set('Authorization', `Bearer ${token}`);
          }
        }
      }
    ],
    afterResponse: [
      async (request, options, response) => {
        // Handle unauthorized responses
        if (response.status === 401) {
          toLogin();
        }
      }
    ]
  }
});

export const postForm = <T>(url: string, obj: object): Promise<T> => {
  const body = new URLSearchParams();
  Object.entries(obj).forEach(([key, value]) => {
    body.append(key, value);
  });
  return api.post(url, { body }).json();
}

export default api;