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
          if (typeof window !== 'undefined') {
            localStorage.removeItem('accessToken');
            window.location.href = '/login';
          }
        }
      }
    ]
  }
});

export const postForm = (url: string, obj: object) => {
  const body = new URLSearchParams();
  Object.keys(obj).forEach((key) => {
    body.append(key, obj[key]);
  })
  console.log("post form:", url, body, obj)
  return api.post(url, { body }).json();
}

export default api;