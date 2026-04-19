// Tipos de registro horario
export type TimeEntryStatus = 'active' | 'paused' | 'completed';

export interface TimeEntry {
    id: string;
    user_id: string;
    date: string;
    clock_in: string;
    clock_out: string | null;
    total_hours: number | null;
    status: TimeEntryStatus;
    edited_manually: boolean;
    notes: string | null;
    created_at: string;
    updated_at: string;
    pauses?: Pause[];
}

export type PauseType = 'meal' | 'break' | 'other';

export interface Pause {
    id: string;
    time_entry_id: string;
    start_time: string;
    end_time: string | null;
    type: PauseType;
    duration: number | null;
    created_at: string;
    updated_at: string;
}

export const PAUSE_LABELS: Record<PauseType, string> = {
    meal: '🍽️ Comida',
    break: '☕ Descanso',
    other: '🔧 Otra',
};

export const PAUSE_ICONS: Record<PauseType, string> = {
    meal: '🍽️',
    break: '☕',
    other: '🔧',
};
