import type { TimeEntry } from '@/types/timeEntry';
import { format, parseISO } from 'date-fns';
import Papa from 'papaparse';

interface ExportRow {
    Fecha: string;
    Entrada: string;
    Salida: string;
    Pausas: string;
    'Horas Trabajadas': string;
    Editado: string;
    Notas: string;
}

/**
 * Exportar registros de tiempo a CSV
 */
export function exportTimeEntriesToCSV(
    entries: TimeEntry[],
    fileName?: string
): void {
    const rows: ExportRow[] = entries.map((entry) => ({
        Fecha: format(parseISO(entry.date), 'yyyy-MM-dd'),
        Entrada: entry.clock_in ? format(parseISO(entry.clock_in), 'HH:mm') : '',
        Salida: entry.clock_out ? format(parseISO(entry.clock_out), 'HH:mm') : 'En curso',
        Pausas: entry.total_hours !== null
            ? formatPauseDuration(entry)
            : '',
        'Horas Trabajadas': entry.total_hours !== null
            ? entry.total_hours.toFixed(2)
            : 'En curso',
        Editado: entry.edited_manually ? 'Sí' : 'No',
        Notas: entry.notes ?? '',
    }));

    const csv = Papa.unparse(rows, {
        delimiter: ';',
        header: true,
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    const defaultName = `registro_horario_${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.setAttribute('href', url);
    link.setAttribute('download', fileName ?? defaultName);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

function formatPauseDuration(entry: TimeEntry): string {
    if (!entry.pauses || entry.pauses.length === 0) return '00:00';

    const totalMinutes = entry.pauses
        .filter((p) => p.duration !== null)
        .reduce((sum, p) => sum + (p.duration ?? 0), 0);

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}
