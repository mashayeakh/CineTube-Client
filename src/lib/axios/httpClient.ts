import axios from "axios"

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL

const getBaseUrl = () => {
    if (!API_BASE_URL) {
        throw new Error(
            "API base URL is not defined. Set NEXT_PUBLIC_API_BASE_URL or NEXT_PUBLIC_API_URL in .env.local."
        )
    }

    return API_BASE_URL.replace(/\/$/, "")
}



const axiosInstance = () => {
    const instance = axios.create({
        baseURL: getBaseUrl(),
        timeout: 5000,
        headers: {
            "Content-Type": "application/json",
        }
    })
    return instance;
}

export interface ApiRequestOptions {
    params?: Record<string, unknown>;
    headers?: Record<string, string>;
}

const httpGet = async (endpoint: string, options?: ApiRequestOptions) => {
    try {
        const response = await axiosInstance().get(endpoint, {
            params: options?.params,
            headers: options?.headers,
        })
        return response.data;
    } catch (error) {
        console.error(`GET ${endpoint} failed:`, error)
        throw error;
    }
}

const httpPost = async (endpoint: string, options?: ApiRequestOptions) => {
    try {
        const response = await axiosInstance().post(endpoint, {
            params: options?.params,
            headers: options?.headers,
        })
        return response.data;
    } catch (error) {
        console.error(`POST ${endpoint} failed:`, error)
        throw error;
    }
}

const httpPut = async (endpoint: string, options?: ApiRequestOptions) => {
    try {
        const response = await axiosInstance().put(endpoint, {
            params: options?.params,
            headers: options?.headers,
        })
        return response.data;
    } catch (error) {
        console.error(`PUT ${endpoint} failed:`, error)
        throw error;
    }
}

const httpPatch = async (endpoint: string, options?: ApiRequestOptions) => {
    try {
        const response = await axiosInstance().patch(endpoint, {
            params: options?.params,
            headers: options?.headers,
        })
        return response.data;
    } catch (error) {
        console.error(`PATCH ${endpoint} failed:`, error)
        throw error;
    }
}

const httpDelete = async (endpoint: string, options?: ApiRequestOptions) => {
    try {
        const response = await axiosInstance().delete(endpoint, {
            params: options?.params,
            headers: options?.headers,
        })
        return response.data;
    } catch (error) {
        console.error(`DELETE ${endpoint} failed:`, error)
        throw error;
    }
}

export const httpClient = {
    get: httpGet,
    post: httpPost,
    put: httpPut,
    patch: httpPatch,
    delete: httpDelete
}