export interface IMovie {
    id: string;
    title: string;
    genre?: string;
    releaseYear?: number | string;
    status?: string;
    rating?: number;
    createdAt?: string;
}

export interface IMovieContribution {
    id: string;
    title?: string;
    status?: string;
    createdAt?: string;
}

export interface IReview {
    id: string;
    content?: string;
    rating?: number;
    status?: string;
    spoiler?: boolean;
    createdAt?: string;
}

export interface IComment {
    id: string;
    content?: string;
    createdAt?: string;
}

export interface IPayment {
    id: string;
    amount?: number;
    status?: string;
    method?: string;
    createdAt?: string;
}

export interface IAdminProfile {
    id: string;
    userId?: string;
    createdAt?: string;
}

export interface IUserProfile {
    id: string;
    name: string;
    email: string;
    role: string;
    status?: string | null;
    image?: string | null;
    emailVerified: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    movies: IMovie[];
    // admin fields
    admin?: IAdminProfile | null;
    // user/premium_user fields
    movieContributions?: IMovieContribution[];
    reviews?: IReview[];
    comments?: IComment[];
    payments?: IPayment[];
}

export interface ILoginResponse {
    token: string,
    accessToken: string,
    refreshToken: string,
    user: {
        createdAt: Date;
        updatedAt: Date;
        email: string;
        emailVerified: boolean;
        name: string;
        image?: string | null | undefined;
        status: string | null | undefined;
        isDeleted: boolean;
        role: string | null | undefined;
    }
}