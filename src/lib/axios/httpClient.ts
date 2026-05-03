import { ApiResponse } from '@/types/api.types';
import axios from 'axios';
import { cookies } from 'next/headers';

function resolveApiBaseUrl() {
    const raw =
        process.env.NEXT_PUBLIC_API_BASE_URL ||
        process.env.NEXT_PUBLIC_BACKEND_URL ||
        process.env.NEXT_PUBLIC_API_URL;

    if (!raw) {
        return "";
    }

    return raw.replace(/\/+$|\/$/, "").replace(/\/$/, "") + "/";
}

function normalizeEndpoint(endpoint: string) {
    return endpoint.replace(/^\/+/, "");
}

const axiosInstance = async () => {
    const apiBaseUrl = resolveApiBaseUrl();

    if (!apiBaseUrl) {
        throw new Error('Missing API base URL. Set NEXT_PUBLIC_API_BASE_URL (or NEXT_PUBLIC_BACKEND_URL) in deployment environment variables.');
    }

    const cookieStore = await cookies();

    const cookieHeader = cookieStore
        .getAll()
        .map((cookie) => `${cookie.name}=${cookie.value}`)
        .join("; ");

    const accessToken = cookieStore.get("accessToken")?.value;

    const headers: Record<string, string> = {
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    };

    if (cookieHeader) {
        headers.Cookie = cookieHeader;
    }

    const instance = axios.create({
        baseURL: apiBaseUrl,
        timeout: 30000,
        headers,
    });

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

function isExpectedDynamicServerUsage(error: unknown) {
    if (!(error instanceof Error)) {
        return false;
    }

    return (
        ("digest" in error && error.digest === 'DYNAMIC_SERVER_USAGE') ||
        /Dynamic server usage/i.test(error.message)
    );
}

const shouldLogHttpError = (error: unknown) => {
    if (isExpectedDynamicServerUsage(error)) {
        return false;
    }

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

        return status !== 400 && status !== 401 && status !== 403 && status !== 404;
    }

    return true;
}

const httpGet = async <TData>(endpoint: string, options?: ApiRequestOptions): Promise<ApiResponse<TData>> => {
    try {
        const instance = await axiosInstance();
        const response = await instance.get<ApiResponse<TData>>(normalizeEndpoint(endpoint), {
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
        const response = await instance.post<ApiResponse<TData>>(normalizeEndpoint(endpoint), data, {
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
        const response = await instance.put<ApiResponse<TData>>(normalizeEndpoint(endpoint), data, {
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
        const response = await instance.patch<ApiResponse<TData>>(normalizeEndpoint(endpoint), data, {
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
        const response = await instance.delete<ApiResponse<TData>>(normalizeEndpoint(endpoint), {
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