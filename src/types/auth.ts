
export interface NextAuthUser {
    name: string;
    email: string;
    image?: string;
}

export interface NextAuthDto {
    user: NextAuthUser;
    expires: string;
}

export interface UserData {
    isEmailVerified: boolean;
    _id: string;
    name: string;
    userType: string;
    email: string;
    responseTime: string;
    phoneNumber: string;
    addresses: any[]; // Replace 'any' with a proper export interface if you have address structure
    status: string;
    projectsApplied: any[]; // Replace 'any' with a proper export interface if needed
    createdAt: string;
    updatedAt: string;
    __v: number;
    refreshToken: string;
    accessToken: string;
    accessTokenExpires: string;
}

export interface NextAuthResponse {
    status: number;
    message: string;
    source: string;
    data: UserData;
}