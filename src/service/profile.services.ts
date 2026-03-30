import { httpClient } from "@/lib/axios/httpClient";
import type { ApiResponse } from "@/types/api.types";
import type { IUserProfile } from "@/types/auth.types";

type ApiEnvelope<TData> = ApiResponse<TData> & { data?: TData };

function unwrap<TData>(response: ApiEnvelope<TData>): TData {
    return (response.result ?? response.data ?? response) as TData;
}

export async function getMyProfile(): Promise<IUserProfile> {
    const response = await httpClient.get<IUserProfile>("/auth/user/profile");
    return unwrap(response as ApiEnvelope<IUserProfile>);
}
