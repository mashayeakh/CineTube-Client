import { ApiResponse } from '@/types/api.types';
import axios from 'axios';
import { cookies } from 'next/headers';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

if (!API_BASE_URL) {
    throw new Error('API_BASE_URL is not defined in environment variables');
}

const axiosInstance = async () => {
    const cookieStore = await cookies();

    const cookieHeader = cookieStore
        .getAll()
        .map((cookie) => `${cookie.name}=${cookie.value}`)
        .join("; ");

    const instance = axios.create({
        baseURL: API_BASE_URL,
        timeout: 30000,
        headers: {
            Cookie: cookieHeader
        }
    })

    return instance;
}

export interface ApiRequestOptions {
    params?: Record<string, unknown>;
    headers?: Record<string, string>;
}

function isFormData(value: unknown): value is FormData {
    return typeof FormData !== 'undefined' && value instanceof FormData;
}

function getRequestHeaders(data: unknown, headers?: Record<string, string>) {
    if (isFormData(data)) {
        return headers;
    }

    return {
        'Content-Type': 'application/json',
        ...headers,
    };
}

const shouldLogHttpError = (error: unknown) => {
    if (axios.isAxiosError(error)) {
        const code = error.code?.toUpperCase();
        const status = error.response?.status;

        // Next.js dev overlay surfaces server console.error entries.
        // These are expected transient failures and are handled by callers.
        if (
            code === 'ECONNABORTED' ||
            code === 'ERR_NETWORK' ||
            code === 'ETIMEDOUT' ||
            !status
        ) {
            return false;
        }

        return status !== 401 && status !== 403 && status !== 404;
    }

    return true;
}

const httpGet = async <TData>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<TData>> => {
    try {
        const instance = await axiosInstance();
        const response = await instance.get<ApiResponse<TData>>(endpoint, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        if (shouldLogHttpError(error)) {
            console.error(`GET request to ${endpoint} failed:`, error);
        }
        throw error;
    }
}

const httpPost = async <TData>(endpoint: string, data: unknown, options?: ApiRequestOptions): Promise<ApiResponse<TData>> => {
    try {
        const instance = await axiosInstance();
        const response = await instance.post<ApiResponse<TData>>(endpoint, data, {
            params: options?.params,
            headers: getRequestHeaders(data, options?.headers),
        });
        return response.data;
    } catch (error) {
        if (shouldLogHttpError(error)) {
            console.error(`POST request to ${endpoint} failed:`, error);
        }
        throw error;
    }
}

const httpPut = async <TData>(endpoint: string, data: unknown, options?: ApiRequestOptions): Promise<ApiResponse<TData>> => {
    try {
        const instance = await axiosInstance();
        const response = await instance.put<ApiResponse<TData>>(endpoint, data, {
            params: options?.params,
            headers: getRequestHeaders(data, options?.headers),
        });
        return response.data;
    } catch (error) {
        if (shouldLogHttpError(error)) {
            console.error(`PUT request to ${endpoint} failed:`, error);
        }
        throw error;
    }
}

const httpPatch = async <TData>(endpoint: string, data: unknown, options?: ApiRequestOptions): Promise<ApiResponse<TData>> => {
    try {
        const instance = await axiosInstance();
        const response = await instance.patch<ApiResponse<TData>>(endpoint, data, {
            params: options?.params,
            headers: getRequestHeaders(data, options?.headers),
        });
        return response.data;
    }
    catch (error) {
        if (shouldLogHttpError(error)) {
            console.error(`PATCH request to ${endpoint} failed:`, error);
        }
        throw error;
    }
}

const httpDelete = async <TData>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<TData>> => {
    try {
        const instance = await axiosInstance();
        const response = await instance.delete<ApiResponse<TData>>(endpoint, {
            params: options?.params,
            headers: options?.headers,
        });
        return response.data;
    } catch (error) {
        if (shouldLogHttpError(error)) {
            console.error(`DELETE request to ${endpoint} failed:`, error);
        }
        throw error;
    }
}

export const httpClient = {
    get: httpGet,
    post: httpPost,
    put: httpPut,
    patch: httpPatch,
    delete: httpDelete,
}