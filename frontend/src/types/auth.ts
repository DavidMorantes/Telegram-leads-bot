export type AuthUser = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_staff: boolean;
  is_active: boolean;
};

export type LoginResponse = {
  access: string;
  refresh: string;
  user: AuthUser;
};

export type UserCreatePayload = {
  username: string;
  first_name?: string;
  last_name?: string;
  email: string;
  password: string;
  is_staff: boolean;
  is_active: boolean;
};
