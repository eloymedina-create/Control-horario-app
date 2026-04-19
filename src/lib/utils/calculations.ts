import { differenceInMinutes, parseISO, eachDayOfInterval, isWeekend } from 'date-fns';
import type { Pause } from '@/types/timeEntry';

/**
 * Calcula las horas netas trabajadas (descontando pausas)
 */
export function calculateWorkedHours(
    clockIn: string,
    clockOut: string | null,
    pauses: Pause[]
): number {
    if (!clockOut) return 0;

    const start = parseISO(clockIn);
    const end = parseISO(clockOut);
    const totalMinutes = differenceInMinutes(end, start);

    const pauseMinutes = pauses
        .filter((p) => p.end_time !== null)
        .reduce((sum, pause) => {
            const pStart = parseISO(pause.start_time);
            const pEnd = parseISO(pause.end_time!);
            return sum + differenceInMinutes(pEnd, pStart);
        }, 0);

    const netMinutes = totalMinutes - pauseMinutes;
    return Math.round((netMinutes / 60) * 100) / 100;
}

/**
 * Calcula el tiempo total de pausas en minutos
 */
export function calculateTotalPauseMinutes(pauses: Pause[]): number {
    return pauses
        .filter((p) => p.end_time !== null)
        .reduce((sum, pause) => {
            const start = parseISO(pause.start_time);
            const end = parseISO(pause.end_time!);
            return sum + differenceInMinutes(end, start);
        }, 0);
}

/**
 * Calcula los minutos transcurridos desde un timestamp hasta ahora
 */
export function calculateElapsedMinutes(fromTimestamp: string): number {
    const from = parseISO(fromTimestamp);
    const now = new Date();
    return differenceInMinutes(now, from);
}

/**
 * Calcula días hábiles entre dos fechas (excluyendo fines de semana)
 */
export function calculateBusinessDays(
    start: Date,
    end: Date,
    excludeWeekends: boolean = true
): number {
    if (!excludeWeekends) {
        return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    }

    const days = eachDayOfInterval({ start, end });
    return days.filter((day) => !isWeekend(day)).length;
}

/**
 * Calcula balance de vacaciones
 */
export function calculateVacationBalance(
    totalDaysPerYear: number,
    usedDays: number,
    pendingDays: number
): {
    total: number;
    used: number;
    pending: number;
    available: number;
    percentage: number;
} {
    const available = Math.max(0, totalDaysPerYear - usedDays - pendingDays);
    const percentage = totalDaysPerYear > 0
        ? Math.round((available / totalDaysPerYear) * 100)
        : 0;

    return {
        total: totalDaysPerYear,
        used: Math.round(usedDays * 10) / 10,
        pending: Math.round(pendingDays * 10) / 10,
        available: Math.round(available * 10) / 10,
        percentage,
    };
}
