import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { formatMinutesToDuration } from '@/lib/utils/formatting';
import { timeEntryService } from '@/lib/firebase/services/timeEntryService';
import {
    Play,
    Square,
    Pause,
    Coffee,
    UtensilsCrossed,
    Wrench,
    CalendarDays,
    TrendingUp,
    Clock,
    ChevronRight,
} from 'lucide-react';
import type { PauseType, TimeEntry } from '@/types/timeEntry';
import { PAUSE_LABELS } from '@/types/timeEntry';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/constants/routes';

type WorkStatus = 'inactive' | 'working' | 'paused';

export default function DashboardPage() {
    const { profile } = useAuth();
    const { showSuccess, showError } = useToast();
    const navigate = useNavigate();

    const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);
    const [pauseElapsedSeconds, setPauseElapsedSeconds] = useState(0);
    const [showPauseMenu, setShowPauseMenu] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // Determinar estado basado en la entrada activa
    const status = useMemo<WorkStatus>(() => {
        if (!activeEntry) return 'inactive';
        if (activeEntry.status === 'active') return 'working';
        if (activeEntry.status === 'paused') return 'paused';
        return 'inactive';
    }, [activeEntry]);

    const clockInTime = useMemo(() => 
        activeEntry ? new Date(activeEntry.clock_in) : null
    , [activeEntry]);

    const pauses = useMemo(() => 
        activeEntry?.pauses || []
    , [activeEntry]);

    // Listener de Firebase
    useEffect(() => {
        if (!profile?.id) return;

        const unsubscribe = timeEntryService.subscribeToActiveEntry(profile.id, (entry) => {
            setActiveEntry(entry);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [profile?.id]);

    // Timer en tiempo real
    useEffect(() => {
        if (status === 'inactive') return;

        const interval = setInterval(() => {
            if (status === 'working' && clockInTime) {
                const totalPauseMs = pauses
                    .filter((p) => p.end_time)
                    .reduce((sum, p) => sum + (new Date(p.end_time!).getTime() - new Date(p.start_time).getTime()), 0);
                
                const activePause = pauses.find((p) => !p.end_time);
                const activePauseMs = activePause
                    ? new Date().getTime() - new Date(activePause.start_time).getTime()
                    : 0;

                const elapsedMs = new Date().getTime() - clockInTime.getTime() - totalPauseMs - activePauseMs;
                setElapsedSeconds(Math.max(0, Math.floor(elapsedMs / 1000)));
            } else if (status === 'paused') {
                const activePause = pauses.find((p) => !p.end_time);
                if (activePause) {
                    setPauseElapsedSeconds(Math.floor((new Date().getTime() - new Date(activePause.start_time).getTime()) / 1000));
                }
                // Mantener el cronómetro de trabajo actualizado
                if (clockInTime) {
                    const totalPauseMs = pauses
                        .filter((p) => p.end_time)
                        .reduce((sum, p) => sum + (new Date(p.end_time!).getTime() - new Date(p.start_time).getTime()), 0);
                    const activePauseMs = pauses.find((p) => !p.end_time)
                        ? new Date().getTime() - new Date(pauses.find((p) => !p.end_time)!.start_time).getTime()
                        : 0;
                    const elapsedMs = new Date().getTime() - clockInTime.getTime() - totalPauseMs - activePauseMs;
                    setElapsedSeconds(Math.max(0, Math.floor(elapsedMs / 1000)));
                }
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [status, clockInTime, pauses]);

    const handleClockIn = useCallback(async () => {
        if (!profile) return;
        try {
            await timeEntryService.clockIn(profile.id, profile.full_name);
            showSuccess(`Jornada iniciada a las ${new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`);
        } catch (error) {
            showError('Error al iniciar jornada');
        }
    }, [profile, showSuccess, showError]);

    const handleClockOut = useCallback(async () => {
        if (!profile || !activeEntry) return;
        try {
            await timeEntryService.clockOut(profile.id, activeEntry.id);
            const totalMinutes = Math.floor(elapsedSeconds / 60);
            showSuccess(`Jornada finalizada. Trabajaste ${formatMinutesToDuration(totalMinutes)}`);
        } catch (error) {
            showError('Error al finalizar jornada');
        }
    }, [profile, activeEntry, elapsedSeconds, showSuccess, showError]);

    const handleStartPause = useCallback(async (type: PauseType) => {
        if (!profile || !activeEntry) return;
        try {
            await timeEntryService.startPause(profile.id, activeEntry.id, type);
            setShowPauseMenu(false);
            showSuccess(`Pausa de ${PAUSE_LABELS[type].split(' ')[1]} iniciada`);
        } catch (error) {
            showError('Error al iniciar pausa');
        }
    }, [profile, activeEntry, showSuccess, showError]);

    const handleResume = useCallback(async () => {
        if (!profile || !activeEntry) return;
        try {
            await timeEntryService.endPause(profile.id, activeEntry.id);
            setPauseElapsedSeconds(0);
            showSuccess('Trabajo reanudado');
        } catch (error) {
            showError('Error al reanudar');
        }
    }, [profile, activeEntry, showSuccess, showError]);

    const formatTimer = (seconds: number): string => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
    };

    const totalPauseMinutes = pauses
        .filter((p) => p.end_time)
        .reduce((sum, p) => sum + Math.floor((new Date(p.end_time!).getTime() - new Date(p.start_time).getTime()) / 60000), 0);

    // Demo stats (Esto se conectará pronto en la fase de Reportes/Historial)
    const weeklyHours = 32.5;
    const monthlyHours = 142.75;
    const avgDaily = 7.8;
    const vacationDaysAvailable = profile?.role === 'admin' ? 22 : 15;
    const vacationDaysTotal = 22;
    const vacationPercentage = Math.round((vacationDaysAvailable / vacationDaysTotal) * 100);

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                <div className="pulse-dot" style={{ width: '48px', height: '48px', backgroundColor: 'var(--primary)' }} />
            </div>
        );
    }

    return (
        <div>
            {/* Saludo */}
            <div style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                    ¡Hola, {profile?.full_name?.split(' ')[0] ?? 'Usuario'}! 👋
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
                {profile?.role === 'admin' && (
                    <span className="badge badge-primary" style={{ marginTop: '8px' }}>Administrador</span>
                )}
            </div>

            <div className="dashboard-grid">
                {/* === ESTADO ACTUAL (Prioridad máxima) === */}
                <div className="card status-card full-width">
                    <div style={{ marginBottom: '8px' }}>
                        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            {status === 'working' && <div className="pulse-dot" style={{ backgroundColor: 'var(--working)' }} />}
                            {status === 'paused' && <div className="pulse-dot" style={{ backgroundColor: 'var(--paused)' }} />}
                            {status === 'inactive' && <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--inactive)' }} />}
                            <span className={`badge badge-${status === 'working' ? 'working' : status === 'paused' ? 'paused' : 'inactive'}`}>
                                {status === 'working' ? 'Trabajando' : status === 'paused' ? 'En pausa' : 'Fuera de jornada'}
                            </span>
                        </div>
                    </div>

                    <div className="status-timer" style={{
                        color: status === 'working' ? 'var(--working)' : status === 'paused' ? 'var(--paused)' : 'var(--text-tertiary)',
                    }}>
                        {status === 'inactive' ? '00:00:00' : formatTimer(elapsedSeconds)}
                    </div>

                    {status === 'paused' && (
                        <p style={{ color: 'var(--warning)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px' }}>
                            ⏸️ Pausa: {formatTimer(pauseElapsedSeconds)}
                        </p>
                    )}

                    <div className="status-time-info">
                        {clockInTime && (
                            <span>Entrada: {clockInTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                        )}
                        {totalPauseMinutes > 0 && (
                            <span> · Pausas: {formatMinutesToDuration(totalPauseMinutes)}</span>
                        )}
                    </div>

                    <div className="status-actions">
                        {status === 'inactive' && (
                            <button className="btn btn-success btn-xl" onClick={handleClockIn} style={{ minWidth: '200px' }}>
                                <Play size={24} /> ENTRAR
                            </button>
                        )}

                        {status === 'working' && (
                            <>
                                <button className="btn btn-danger btn-xl" onClick={handleClockOut} style={{ minWidth: '160px' }}>
                                    <Square size={24} /> SALIR
                                </button>
                                <div style={{ position: 'relative' }}>
                                    <button
                                        className="btn btn-warning btn-lg"
                                        onClick={() => setShowPauseMenu(!showPauseMenu)}
                                    >
                                        <Pause size={20} /> PAUSAR
                                    </button>
                                    {showPauseMenu && (
                                        <div style={{
                                            position: 'absolute',
                                            top: '100%',
                                            left: '50%',
                                            transform: 'translateX(-50%)',
                                            marginTop: '8px',
                                            background: 'var(--bg-primary)',
                                            border: '1px solid var(--border-primary)',
                                            borderRadius: 'var(--radius-lg)',
                                            boxShadow: 'var(--shadow-lg)',
                                            overflow: 'hidden',
                                            zIndex: 10,
                                            minWidth: '180px',
                                        }}>
                                            <button
                                                className="sidebar-item"
                                                onClick={() => handleStartPause('meal')}
                                                style={{ borderRadius: 0 }}
                                            >
                                                <UtensilsCrossed size={18} /> Comida
                                            </button>
                                            <button
                                                className="sidebar-item"
                                                onClick={() => handleStartPause('break')}
                                                style={{ borderRadius: 0 }}
                                            >
                                                <Coffee size={18} /> Descanso
                                            </button>
                                            <button
                                                className="sidebar-item"
                                                onClick={() => handleStartPause('other')}
                                                style={{ borderRadius: 0 }}
                                            >
                                                <Wrench size={18} /> Otra
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {status === 'paused' && (
                            <>
                                <button className="btn btn-success btn-xl" onClick={handleResume} style={{ minWidth: '200px' }}>
                                    <Play size={24} /> REANUDAR
                                </button>
                                <button className="btn btn-danger btn-lg" onClick={handleClockOut}>
                                    <Square size={20} /> SALIR
                                </button>
                            </>
                        )}
                    </div>

                    {/* Pausas del día */}
                    {pauses.length > 0 && (
                        <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-primary)', paddingTop: '16px' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Pausas de hoy
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                                {pauses.map((p) => (
                                    <span key={p.id} className="badge" style={{
                                        background: 'var(--bg-tertiary)',
                                        color: 'var(--text-secondary)',
                                        fontSize: '0.75rem',
                                    }}>
                                        {PAUSE_LABELS[p.type].split(' ')[0]}{' '}
                                        {p.end_time
                                            ? formatMinutesToDuration(Math.floor((new Date(p.end_time).getTime() - new Date(p.start_time).getTime()) / 60000))
                                            : 'En curso...'}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* === BALANCE DE VACACIONES === */}
                <div className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(ROUTES.LEAVE)}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <CalendarDays size={18} style={{ color: 'var(--vacation)' }} />
                            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Vacaciones</span>
                        </div>
                        <ChevronRight size={16} style={{ color: 'var(--text-tertiary)' }} />
                    </div>
                    <div className="stats-value" style={{ color: 'var(--primary)' }}>{vacationDaysAvailable}</div>
                    <div className="stats-label">días disponibles de {vacationDaysTotal}</div>
                    <div style={{ marginTop: '12px' }}>
                        <div className="progress-bar">
                            <div
                                className={`progress-fill ${vacationPercentage > 50 ? 'progress-green' : vacationPercentage > 25 ? 'progress-yellow' : 'progress-red'}`}
                                style={{ width: `${vacationPercentage}%` }}
                            />
                        </div>
                    </div>
                    <button
                        className="btn btn-outline btn-sm"
                        style={{ width: '100%', marginTop: '12px' }}
                        onClick={(e) => { e.stopPropagation(); navigate(ROUTES.LEAVE_REQUEST); }}
                    >
                        Solicitar ausencia
                    </button>
                </div>

                {/* === ESTADÍSTICAS RÁPIDAS === */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <TrendingUp size={18} style={{ color: 'var(--success)' }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Esta semana</span>
                    </div>
                    <div className="stats-value">{formatMinutesToDuration(weeklyHours * 60)}</div>
                    <div className="stats-label">horas trabajadas</div>
                    <div style={{ marginTop: '16px', display: 'flex', gap: '16px' }}>
                        <div>
                            <div style={{ fontSize: '1rem', fontWeight: 700 }}>{formatMinutesToDuration(monthlyHours * 60)}</div>
                            <div className="stats-label">este mes</div>
                        </div>
                        <div>
                            <div style={{ fontSize: '1rem', fontWeight: 700 }}>{avgDaily.toFixed(1)}h</div>
                            <div className="stats-label">promedio diario</div>
                        </div>
                    </div>
                </div>

                {/* === RESUMEN DEL DÍA === */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
                        <Clock size={18} style={{ color: 'var(--info)' }} />
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Resumen de hoy</span>
                    </div>
                    {clockInTime ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Entrada</span>
                                <span style={{ fontWeight: 600 }}>
                                    {clockInTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Pausas</span>
                                <span style={{ fontWeight: 600 }}>{pauses.length} ({formatMinutesToDuration(totalPauseMinutes)})</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                                <span style={{ color: 'var(--text-secondary)' }}>Trabajado</span>
                                <span style={{ fontWeight: 700, color: 'var(--success)' }}>
                                    {formatMinutesToDuration(Math.floor(elapsedSeconds / 60))}
                                </span>
                            </div>
                        </div>
                    ) : (
                        <p style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem', textAlign: 'center', padding: '16px 0' }}>
                            Aún no has iniciado la jornada
                        </p>
                    )}
                </div>

                {/* === GRÁFICO SEMANAL (placeholder) === */}
                <div className="card span-2">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Horas esta semana</span>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate(ROUTES.REPORTS)}>
                            Ver más <ChevronRight size={14} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px', padding: '0 8px' }}>
                        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie'].map((day, i) => {
                            const heights = [85, 90, 75, 95, 60];
                            const hours = [7.5, 8.0, 6.5, 8.5, 5.0];
                            return (
                                <div key={day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ fontSize: '0.625rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                        {hours[i]}h
                                    </span>
                                    <div style={{
                                        width: '100%',
                                        maxWidth: '48px',
                                        height: `${heights[i]}%`,
                                        background: i === 4 ? 'var(--primary-light)' : 'var(--primary)',
                                        borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0',
                                        transition: 'all var(--transition-base)',
                                        opacity: i === 4 ? 0.6 : 1,
                                    }} />
                                    <span style={{ fontSize: '0.625rem', color: 'var(--text-tertiary)' }}>{day}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* === PRÓXIMAS AUSENCIAS === */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Próximas ausencias</span>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate(ROUTES.LEAVE)}>
                            Ver todas <ChevronRight size={14} />
                        </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{
                                width: '4px',
                                height: '40px',
                                borderRadius: '2px',
                                backgroundColor: 'var(--vacation)',
                            }} />
                            <div>
                                <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>1 - 5 Mar 2026</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Vacaciones · 5 días</p>
                            </div>
                            <span className="badge badge-pending" style={{ marginLeft: 'auto' }}>Pendiente</span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            <div style={{
                                width: '4px',
                                height: '40px',
                                borderRadius: '2px',
                                backgroundColor: 'var(--permit)',
                            }} />
                            <div>
                                <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>15 Abr 2026</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Permiso · Medio día</p>
                            </div>
                            <span className="badge badge-approved" style={{ marginLeft: 'auto' }}>Aprobada</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
