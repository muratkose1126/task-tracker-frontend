import axios from 'axios'

// Enable credentials (cookies) for all requests
axios.defaults.withCredentials = true
axios.defaults.withXSRFToken = true

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'
const API_DOMAIN = process.env.NEXT_PUBLIC_API_DOMAIN || 'http://localhost:8000'
const API_VERSION = process.env.NEXT_PUBLIC_API_VERSION || 'v1'

export const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
})

// Request interceptor
apiClient.interceptors.request.use(
    (config) => {
        // Add API version prefix to all routes except auth routes
        if (config.url && !config.url.startsWith('/auth')) {
            config.url = `/${API_VERSION}${config.url}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            if (typeof window !== 'undefined') {
                try {
                    const currentPath = window.location.pathname
                    if (currentPath !== '/login') {
                        window.location.href = '/login'
                    }
                } catch {
                }
            }
        }
        return Promise.reject(error)
    }
)

export async function getCsrfCookie() {
    // Explicitly ensure credentials are included
    await axios.get(`${API_DOMAIN}/sanctum/csrf-cookie`)
}

