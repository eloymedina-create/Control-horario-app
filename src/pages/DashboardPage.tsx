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

    // Control de carga global (Fail-safe)
    useEffect(() => {
        const timeout = setTimeout(() => {
            setIsLoading(false);
        }, 2000);
        return () => clearTimeout(timeout);
    }, []);

    // Listener de Firebase (Estado de jornada)
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

    // Datos estáticos/precalculados
    const weeklyHours = 32.5;
    const monthlyHours = 142.75;
    const avgDaily = 7.8;
    const vacationDaysAvailable = profile?.role === 'admin' ? 22 : 15;
    const vacationDaysTotal = 22;
    const vacationPercentage = Math.round((vacationDaysAvailable / vacationDaysTotal) * 100);

    return (
        <div className="fade-in">
            <header style={{ marginBottom: '24px' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    ¡Hola, {profile?.full_name?.split(' ')[0] || 'Usuario'}! 👋
                </h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {status === 'inactive' ? '¿Listo para empezar tu jornada?' : 'Aquí tienes el resumen de tu jornada.'}
                </p>
            </header>

            <div className="dashboard-grid">
                {/* === TARJETA DE ESTADO (CRONÓMETRO) === */}
                <div className="card status-card">
                    <div className="status-header">
                        <div className={`status-indicator ${status}`} />
                        <span className="status-text">
                            {isLoading ? 'Conectando...' : status === 'working' ? 'Trabajando' : status === 'paused' ? 'En pausa' : 'Fuera de jornada'}
                        </span>
                    </div>

                    <div className="status-timer" style={{
                        color: status === 'working' ? 'var(--working)' : status === 'paused' ? 'var(--paused)' : 'var(--text-tertiary)',
                        position: 'relative',
                        minHeight: '80px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        {isLoading ? (
                            <div className="skeleton" style={{ width: '200px', height: '48px' }} />
                        ) : (
                            status === 'inactive' ? '00:00:00' : formatTimer(elapsedSeconds)
                        )}
                    </div>

                    {status === 'paused' && !isLoading && (
                        <p style={{ color: 'var(--warning)', fontSize: '0.875rem', fontWeight: 600, marginBottom: '8px', textAlign: 'center' }}>
                            ⏸️ Pausa: {formatTimer(pauseElapsedSeconds)}
                        </p>
                    )}

                    <div className="status-time-info" style={{ minHeight: '20px', textAlign: 'center' }}>
                        {isLoading ? (
                            <div className="skeleton" style={{ width: '150px', height: '14px', margin: '0 auto' }} />
                        ) : (
                            <>
                                {clockInTime && (
                                    <span>Entrada: {clockInTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>
                                )}
                                {totalPauseMinutes > 0 && (
                                    <span> · Pausas: {formatMinutesToDuration(totalPauseMinutes)}</span>
                                )}
                            </>
                        )}
                    </div>

                    <div className="status-actions">
                        {isLoading ? (
                            <div className="skeleton" style={{ width: '200px', height: '56px', borderRadius: 'var(--radius-xl)' }} />
                        ) : (
                            <>
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
                            </>
                        )}
                    </div>
                </div>

                {/* === ESTADÍSTICAS RÁPIDAS === */}
                <div className="stat-card card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div className="stat-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)', padding: '10px', borderRadius: '12px' }}>
                            <TrendingUp size={20} />
                        </div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Semana actual</span>
                    </div>
                    {isLoading ? (
                        <div className="skeleton" style={{ width: '100px', height: '32px', marginBottom: '8px' }} />
                    ) : (
                        <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{weeklyHours}h</div>
                    )}
                    <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '4px', fontWeight: 600 }}>
                        +2.4h vs semana anterior
                    </div>
                </div>

                {/* Mes */}
                <div className="stat-card card">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div className="stat-icon" style={{ backgroundColor: 'var(--success-light)', color: 'var(--success)', padding: '10px', borderRadius: '12px' }}>
                            <Clock size={20} />
                        </div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Horas mes</span>
                    </div>
                    {isLoading ? (
                        <div className="skeleton" style={{ width: '100px', height: '32px', marginBottom: '8px' }} />
                    ) : (
                        <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{monthlyHours}h</div>
                    )}
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                        Media diaria: {avgDaily}h
                    </div>
                </div>

                {/* Vacaciones */}
                <div className="stat-card card" onClick={() => navigate(ROUTES.LEAVE)} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                        <div className="stat-icon" style={{ backgroundColor: 'var(--warning-light)', color: 'var(--warning)', padding: '10px', borderRadius: '12px' }}>
                            <CalendarDays size={20} />
                        </div>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Vacaciones</span>
                    </div>
                    {isLoading ? (
                        <div className="skeleton" style={{ width: '100%', height: '32px', marginBottom: '12px' }} />
                    ) : (
                        <>
                            <div style={{ fontSize: '1.75rem', fontWeight: 800 }}>{vacationDaysAvailable} días</div>
                            <div style={{ marginTop: '12px' }}>
                                <div style={{ height: '6px', backgroundColor: 'var(--bg-tertiary)', borderRadius: '3px', position: 'relative', overflow: 'hidden' }}>
                                    <div style={{ 
                                        position: 'absolute', 
                                        left: 0, 
                                        top: 0, 
                                        height: '100%', 
                                        width: `${vacationPercentage}%`, 
                                        backgroundColor: 'var(--warning)',
                                        borderRadius: '3px'
                                    }} />
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
                                    <span>{vacationDaysAvailable} disp.</span>
                                    <span>{vacationDaysTotal} total</span>
                                </div>
                            </div>
                        </>
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
                    {isLoading ? (
                         <div className="skeleton" style={{ width: '100%', height: '120px' }} />
                    ) : (
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
                    )}
                </div>

                {/* === PRÓXIMAS AUSENCIAS === */}
                <div className="card">
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                        <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Próximas ausencias</span>
                        <button className="btn btn-ghost btn-sm" onClick={() => navigate(ROUTES.LEAVE)}>
                            Ver todas <ChevronRight size={14} />
                        </button>
                    </div>
                    {isLoading ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div className="skeleton" style={{ width: '100%', height: '40px' }} />
                            <div className="skeleton" style={{ width: '100%', height: '40px' }} />
                        </div>
                    ) : (
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
                    )}
                </div>
            </div>
        </div>
    );
}
