export interface User {
  email: string;
  role: 'user' | 'admin';
  accessToken:string,
  refreshToken:string,
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType extends AuthState {
  login: (data:User) => Promise<void>;
  logout: () => void;
}

export interface LoginFormData {
  email: string;
  password: string;
}

export interface SignupFormData extends LoginFormData {
  role: 'user' | 'admin';
}

export interface LoginResponse {
  message?: string;
  accessToken: string;
  refreshToken:string;
  user:{
    role: 'user' | 'admin';
    email:string
  }
}