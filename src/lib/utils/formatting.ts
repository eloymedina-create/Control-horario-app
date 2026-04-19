import { format, parseISO, isToday, isYesterday, formatDistanceToNowStrict } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Formatea una fecha ISO a formato legible (dd/MM/yyyy)
 */
export function formatDate(isoDate: string): string {
    return format(parseISO(isoDate), 'dd/MM/yyyy', { locale: es });
}

/**
 * Formatea una fecha ISO a formato con nombre de día
 */
export function formatDateFull(isoDate: string): string {
    return format(parseISO(isoDate), "EEEE, d 'de' MMMM yyyy", { locale: es });
}

/**
 * Formatea una fecha ISO a formato corto con día de semana
 */
export function formatDateShort(isoDate: string): string {
    return format(parseISO(isoDate), 'EEE d MMM', { locale: es });
}

/**
 * Formatea una hora ISO a HH:mm
 */
export function formatTime(isoTimestamp: string): string {
    return format(parseISO(isoTimestamp), 'HH:mm');
}

/**
 * Formatea minutos a formato legible "Xh Ymin"
 */
export function formatMinutesToDuration(minutes: number): string {
    if (minutes < 0) return '0min';

    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);

    if (hours === 0) return `${mins}min`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}min`;
}

/**
 * Formatea horas decimales a formato legible "Xh Ymin"  
 */
export function formatHoursToDuration(hours: number): string {
    return formatMinutesToDuration(Math.round(hours * 60));
}

/**
 * Devuelve texto relativo: "Hoy", "Ayer", o la fecha
 */
export function formatRelativeDate(isoDate: string): string {
    const date = parseISO(isoDate);
    if (isToday(date)) return 'Hoy';
    if (isYesterday(date)) return 'Ayer';
    return format(date, 'EEE d MMM', { locale: es });
}

/**
 * Formatea un timestamp a "hace X minutos"
 */
export function formatTimeAgo(isoTimestamp: string): string {
    return formatDistanceToNowStrict(parseISO(isoTimestamp), {
        locale: es,
        addSuffix: true,
    });
}

/**
 * Formatea mes y año  
 */
export function formatMonthYear(date: Date): string {
    return format(date, 'MMMM yyyy', { locale: es });
}

/**
 * Capitaliza la primera letra
 */
export function capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
}
