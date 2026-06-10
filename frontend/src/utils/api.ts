let rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.pattieplayshop.cloud-ip.cc/api';
if (rawBaseUrl.includes('kids-toy-shop.onrender.com')) {
  rawBaseUrl = rawBaseUrl.replace('kids-toy-shop.onrender.com', 'api.pattieplayshop.cloud-ip.cc');
}
const BASE_URL = rawBaseUrl;


class ApiClient {
  private getHeaders(isMultipart = false): HeadersInit {
    const headers: HeadersInit = {};
    
    if (!isMultipart) {
      headers['Content-Type'] = 'application/json';
    }

    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('kids_shop_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      let errData;
      try {
        errData = await response.json();
      } catch (e) {
        errData = { messageEn: 'An unexpected error occurred', messageTh: 'เกิดข้อผิดพลาดที่ไม่คาดคิด' };
      }
      throw new Error(JSON.stringify(errData));
    }

    // Handle empty response (like DELETE success status 204)
    if (response.status === 204) return null;

    return response.json();
  }

  async get(path: string) {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async post(path: string, body: any) {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    return this.handleResponse(response);
  }

  async put(path: string, body: any) {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });
    return this.handleResponse(response);
  }

  async delete(path: string) {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    return this.handleResponse(response);
  }

  async upload(path: string, formData: FormData) {
    const response = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: this.getHeaders(true),
      body: formData,
    });
    return this.handleResponse(response);
  }
}

export const api = new ApiClient();

let rawStaticUrl = process.env.NEXT_PUBLIC_API_STATIC_URL || 'https://api.pattieplayshop.cloud-ip.cc';
if (rawStaticUrl.includes('kids-toy-shop.onrender.com')) {
  rawStaticUrl = rawStaticUrl.replace('kids-toy-shop.onrender.com', 'api.pattieplayshop.cloud-ip.cc');
}
export const API_STATIC_URL = rawStaticUrl;

export const getMediaUrl = (url: string | null | undefined): string => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_STATIC_URL}${url}`;
};
