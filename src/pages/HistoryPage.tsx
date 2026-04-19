import { useEffect, useMemo } from 'react';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';
import { Clock, ChevronLeft, ChevronRight, Edit3, Download, Filter } from 'lucide-react';
import { formatMinutesToDuration } from '@/lib/utils/formatting';
import { useAuth } from '@/contexts/AuthContext';
import { timeEntryService } from '@/lib/firebase/services/timeEntryService';
import type { TimeEntry } from '@/types/timeEntry';

type FilterRange = 'week' | 'month' | 'custom';

export default function HistoryPage() {
    const { profile } = useAuth();
    const [entries, setEntries] = useState<TimeEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filterRange, setFilterRange] = useState<FilterRange>('month');
    const [currentDate] = useState(new Date());

    useEffect(() => {
        if (!profile?.id) return;

        const loadHistory = async () => {
            setIsLoading(true);
            try {
                const history = await timeEntryService.getHistory(profile.id);
                setEntries(history);
            } catch (error) {
                console.error('Error loading history:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadHistory();
    }, [profile?.id]);

    const filterLabel = (() => {
        switch (filterRange) {
            case 'week': {
                const s = startOfWeek(currentDate, { locale: es, weekStartsOn: 1 });
                const e = endOfWeek(currentDate, { locale: es, weekStartsOn: 1 });
                return `${format(s, 'd MMM', { locale: es })} - ${format(e, 'd MMM', { locale: es })}`;
            }
            case 'month':
                return format(currentDate, 'MMMM yyyy', { locale: es });
            default:
                return 'Personalizado';
        }
    })();

    const totalMinutes = useMemo(() => 
        entries.reduce((sum, e) => sum + (e.total_hours ? e.total_hours * 60 : 0), 0)
    , [entries]);

    const avgMinutes = entries.length > 0 ? totalMinutes / entries.length : 0;

    const formatEntryTime = (isoString: string | null) => {
        if (!isoString) return '--:--';
        return format(new Date(isoString), 'HH:mm');
    };

    const calculatePauseMinutes = (pauses?: any[]) => {
        if (!pauses) return 0;
        return pauses.reduce((sum, p) => sum + (p.duration || 0), 0);
    };

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="pulse-dot" style={{ width: '48px', height: '48px', backgroundColor: 'var(--primary)' }} />
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Clock size={24} /> Historial
                </h1>
                <div style={{ display: 'flex', gap: '8px' }}>
                    <button className="btn btn-outline btn-sm">
                        <Filter size={14} /> Filtrar
                    </button>
                    <button className="btn btn-primary btn-sm">
                        <Download size={14} /> Exportar CSV
                    </button>
                </div>
            </div>

            {/* Filtros de rango */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
                {(['week', 'month'] as FilterRange[]).map((range) => (
                    <button
                        key={range}
                        className={`btn btn-sm ${filterRange === range ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setFilterRange(range)}
                    >
                        {range === 'week' ? 'Semana' : 'Mes'}
                    </button>
                ))}
            </div>

            {/* Rango visible */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <button className="btn btn-icon btn-ghost">
                    <ChevronLeft size={20} />
                </button>
                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{filterLabel}</span>
                <button className="btn btn-icon btn-ghost">
                    <ChevronRight size={20} />
                </button>
            </div>

            {/* Resumen del periodo */}
            <div className="card card-compact" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-around', textAlign: 'center' }}>
                <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formatMinutesToDuration(totalMinutes)}</div>
                    <div className="stats-label">Total</div>
                </div>
                <div style={{ width: '1px', backgroundColor: 'var(--border-primary)' }} />
                <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{entries.length}</div>
                    <div className="stats-label">Días</div>
                </div>
                <div style={{ width: '1px', backgroundColor: 'var(--border-primary)' }} />
                <div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formatMinutesToDuration(Math.round(avgMinutes))}</div>
                    <div className="stats-label">Promedio</div>
                </div>
            </div>

            {/* Lista de registros */}
            <div className="card" style={{ padding: 0 }}>
                {entries.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
                        No hay registros para este periodo
                    </div>
                ) : (
                    entries.map((entry) => {
                        const pausesMins = calculatePauseMinutes(entry.pauses);
                        return (
                            <div key={entry.id} className="time-entry-card">
                                <div style={{ flex: 1 }}>
                                    <div className="time-entry-date">
                                        {format(new Date(entry.date), "EEE d 'de' MMM", { locale: es })}
                                    </div>
                                    <div className="time-entry-times">
                                        {formatEntryTime(entry.clock_in)} → {formatEntryTime(entry.clock_out)}
                                        {pausesMins > 0 && (
                                            <span> · Pausas: {formatMinutesToDuration(pausesMins)}</span>
                                        )}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{ textAlign: 'right' }}>
                                        <div className="time-entry-hours" style={{ color: entry.status === 'completed' ? 'var(--text-primary)' : 'var(--warning)' }}>
                                            {entry.status === 'completed' 
                                                ? formatMinutesToDuration(Math.round((entry.total_hours || 0) * 60)) 
                                                : 'En curso'}
                                        </div>
                                        {entry.edited_manually && (
                                            <span style={{ fontSize: '0.625rem', color: 'var(--warning)' }}>✏️ Editado</span>
                                        )}
                                    </div>
                                    <button className="btn btn-icon btn-ghost" aria-label="Editar registro" title="Editar">
                                        <Edit3 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
