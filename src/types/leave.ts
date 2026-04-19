// Tipos de gestión de ausencias
export type LeaveType = 'vacation' | 'sick_leave' | 'personal' | 'training' | 'other';
export type LeaveDuration = 'full_day' | 'half_day' | 'hours';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';

export interface LeaveRequest {
    id: string;
    user_id: string;
    type: LeaveType;
    duration: LeaveDuration;
    start_date: string;
    end_date: string;
    start_time: string | null;
    end_time: string | null;
    total_days: number;
    reason: string | null;
    status: LeaveStatus;
    reviewed_at: string | null;
    reviewed_by: string | null;
    rejection_reason: string | null;
    attachment_url: string | null;
    created_at: string;
    updated_at: string;
}

export interface VacationBalance {
    user_id: string;
    year: number;
    total_days: number;
    used_days: number;
    pending_days: number;
    available_days: number;
}

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
    vacation: '🏖️ Vacaciones',
    sick_leave: '🏥 Baja médica',
    personal: '👤 Personal',
    training: '📚 Formación',
    other: '🔧 Otro',
};

export const LEAVE_DURATION_LABELS: Record<LeaveDuration, string> = {
    full_day: '📅 Día completo',
    half_day: '🌅 Medio día',
    hours: '⏰ Por horas',
};

export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
    pending: 'Pendiente',
    approved: 'Aprobada',
    rejected: 'Rechazada',
    cancelled: 'Cancelada',
};
