export interface User {
  username: string;
  email: string;
  fullname: string;
  company_id: number;
  department_id: number;
  id: number;
  is_active: boolean;
  last_login: string;      // ISO datetime
  created_at: string;      // ISO datetime
  updated_at: string;      // ISO datetime
  company: Company;
  department: Department;
  roles: UserRole[];
}

export interface Company {
  id: number;
  name: string;
  short_name: string;
}

export interface Department {
  id: number;
  name: string;
  code: string;
}

export interface UserRole {
  id: number;
  role_id: number;
  scope_type: string;
  scope_id: number;
  role: Role;
}

export interface Role {
  id: number;
  name: string;
  description: string;
}
