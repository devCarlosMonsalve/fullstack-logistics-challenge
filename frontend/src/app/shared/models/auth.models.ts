export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest {
    email: string;
    password: string;
    name: string;
    role: 'OPERATOR' | 'SUPERVISOR';
}

export type UserRole = RegisterRequest['role'];

export interface AuthenticatedUser {
    id: string;
    name: string;
    email: string;
    role: UserRole;
}

export interface AuthResponse {
    accessToken: string;
    user: AuthenticatedUser;
}