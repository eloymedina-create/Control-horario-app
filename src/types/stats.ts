export interface WeeklyStats {
    totalHours: number;
    averageDaily: number;
    daysWorked: number;
    hoursPerDay: { day: string; hours: number }[];
}

export interface MonthlyStats {
    totalHours: number;
    averageDaily: number;
    daysWorked: number;
    totalDaysInMonth: number;
    hoursPerWeek: { week: string; hours: number }[];
}

export interface DailyStats {
    user_id: string;
    date: string;
    total_worked: number;
    total_paused: number;
    entries_count: number;
    first_clock_in: string;
    last_clock_out: string;
}
