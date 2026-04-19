import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/constants/routes';
import { CalendarDays, Plus, ChevronRight } from 'lucide-react';
import { LEAVE_TYPE_LABELS, LEAVE_STATUS_LABELS } from '@/types/leave';
import type { LeaveStatus, LeaveType, LeaveRequest, VacationBalance } from '@/types/leave';
import { useAuth } from '@/contexts/AuthContext';
import { leaveService } from '@/lib/firebase/services/leaveService';

type TabFilter = 'all' | 'pending' | 'approved' | 'past';

export default function LeavePage() {
    const navigate = useNavigate();
    const { profile } = useAuth();
    
    const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
    const [balance, setBalance] = useState<VacationBalance | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<TabFilter>('all');

    useEffect(() => {
        if (!profile?.id) return;

        const loadData = async () => {
            setIsLoading(true);
            try {
                const [userLeaves, userBalance] = await Promise.all([
                    leaveService.getUserLeaves(profile.id),
                    leaveService.getVacationBalance(profile.id)
                ]);
                setLeaves(userLeaves);
                setBalance(userBalance);
            } catch (error) {
                console.error('Error loading leave data:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [profile?.id]);

    const statusBadgeClass = (status: LeaveStatus): string => {
        const map: Record<LeaveStatus, string> = {
            pending: 'badge-pending',
            approved: 'badge-approved',
            rejected: 'badge-rejected',
            cancelled: 'badge-cancelled',
        };
        return map[status] ?? '';
    };

    const typeColor = (type: LeaveType): string => {
        const map: Record<LeaveType, string> = {
            vacation: 'var(--vacation)',
            sick_leave: 'var(--sick-leave)',
            personal: 'var(--permit)',
            training: 'var(--info)',
            other: 'var(--text-tertiary)',
        };
        return map[type] ?? 'var(--text-tertiary)';
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
                    <CalendarDays size={24} /> Ausencias
                </h1>
                <button className="btn btn-primary" onClick={() => navigate(ROUTES.LEAVE_REQUEST)}>
                    <Plus size={18} /> Solicitar ausencia
                </button>
            </div>

            {/* Balance de vacaciones */}
            <div className="card" style={{ marginBottom: '20px' }}>
                <h2 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '16px' }}>Balance de vacaciones {balance?.year || new Date().getFullYear()}</h2>
                {balance ? (
                    <>
                        <div style={{ display: 'flex', justifyContent: 'space-around', textAlign: 'center', marginBottom: '16px' }}>
                            <div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>{balance.available_days}</div>
                                <div className="stats-label">Disponibles</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary)' }}>{balance.used_days}</div>
                                <div className="stats-label">Usados</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--warning)' }}>{balance.pending_days}</div>
                                <div className="stats-label">Pendientes</div>
                            </div>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill progress-green"
                                style={{ width: `${(balance.available_days / balance.total_days) * 100}%` }}
                            />
                        </div>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px', textAlign: 'center' }}>
                            {balance.available_days} de {balance.total_days} días disponibles
                        </p>
                    </>
                ) : (
                    <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-tertiary)' }}>No hay balance asignado</p>
                )}
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', borderBottom: '1px solid var(--border-primary)', paddingBottom: '12px' }}>
                {([
                    { key: 'all' as TabFilter, label: 'Todas' },
                    { key: 'pending' as TabFilter, label: 'Pendientes' },
                    { key: 'approved' as TabFilter, label: 'Aprobadas' },
                    { key: 'past' as TabFilter, label: 'Pasadas' },
                ]).map(({ key, label }) => (
                    <button
                        key={key}
                        className={`btn btn-sm ${activeTab === key ? 'btn-primary' : 'btn-ghost'}`}
                        onClick={() => setActiveTab(key)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {/* Lista */}
            {filtered.length === 0 ? (
                <div className="card" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                    <CalendarDays size={48} style={{ marginBottom: '12px', opacity: 0.3 }} />
                    <p>No hay ausencias {activeTab !== 'all' ? 'con ese filtro' : 'registradas'}</p>
                </div>
            ) : (
                <div className="card" style={{ padding: 0 }}>
                    {filtered.map((leave) => (
                        <div
                            key={leave.id}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                padding: '16px 20px',
                                borderBottom: '1px solid var(--border-primary)',
                                cursor: 'pointer',
                                transition: 'background var(--transition-fast)',
                            }}
                            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-secondary)')}
                            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
                        >
                            <div style={{
                                width: '4px',
                                height: '48px',
                                borderRadius: '2px',
                                backgroundColor: typeColor(leave.type),
                                flexShrink: 0,
                            }} />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                                    {leave.start_date === leave.end_date
                                        ? new Date(leave.start_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
                                        : `${new Date(leave.start_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - ${new Date(leave.end_date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}`}
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                                    {LEAVE_TYPE_LABELS[leave.type]} · {leave.total_days === 0.5 ? 'Medio día' : `${leave.total_days} ${leave.total_days === 1 ? 'día' : 'días'}`}
                                </div>
                            </div>
                            <span className={`badge ${statusBadgeClass(leave.status)}`}>
                                {LEAVE_STATUS_LABELS[leave.status]}
                            </span>
                            <ChevronRight size={16} style={{ color: 'var(--text-tertiary)' }} />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
