// Tipos de autenticación
export interface UserProfile {
    id: string;
    full_name: string;
    email: string;
    avatar_url: string | null;
    role: 'admin' | 'employee';
    created_at: string;
    updated_at: string;
}

export interface UserSettings {
    id: string;
    vacation_days_per_year: number;
    vacation_days_used: number;
    contract_start_date: string | null;
    work_schedule: WorkSchedule;
    created_at: string;
    updated_at: string;
}

export interface WorkSchedule {
    monday: DaySchedule | null;
    tuesday: DaySchedule | null;
    wednesday: DaySchedule | null;
    thursday: DaySchedule | null;
    friday: DaySchedule | null;
    saturday: DaySchedule | null;
    sunday: DaySchedule | null;
}

export interface DaySchedule {
    start: string;
    end: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    full_name: string;
    email: string;
    password: string;
    confirmPassword: string;
}
