// This defines exactly what we send to the Backend
export interface LoginPayload {
  username: string; // Must match "username" in your Java LoginRequest class
  password: string;
}

export interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}
