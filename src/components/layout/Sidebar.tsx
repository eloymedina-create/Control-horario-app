import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/lib/constants/routes';
import {
    LayoutDashboard,
    Clock,
    CalendarDays,
    BarChart3,
    User,
    LogOut,
    Timer,
    Shield,
    BookOpen,
} from 'lucide-react';

const NAV_ITEMS = [
    { path: ROUTES.DASHBOARD, label: 'Inicio', icon: LayoutDashboard },
    { path: ROUTES.HISTORY, label: 'Historial', icon: Clock },
    { path: ROUTES.LEAVE, label: 'Ausencias', icon: CalendarDays },
    { path: ROUTES.REPORTS, label: 'Reportes', icon: BarChart3 },
    { path: ROUTES.PROFILE, label: 'Perfil', icon: User },
    { path: ROUTES.MANUAL, label: 'Manual', icon: BookOpen },
];

export function Sidebar() {
    const { profile, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate(ROUTES.LOGIN);
    };

    return (
        <aside className="app-sidebar">
            {/* Logo */}
            <div style={{ padding: '0 24px', marginBottom: '32px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        borderRadius: 'var(--radius)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                    }}>
                        <Timer size={20} />
                    </div>
                    <span style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>
                        Control Horario
                    </span>
                </div>
            </div>

            {/* Navegación */}
            <nav className="sidebar-nav">
                {NAV_ITEMS.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === ROUTES.DASHBOARD}
                        className={({ isActive }) =>
                            `sidebar-item${isActive ? ' active' : ''}`
                        }
                    >
                        <item.icon size={20} />
                        <span>{item.label}</span>
                    </NavLink>
                ))}

                {profile?.role === 'admin' && (
                    <NavLink
                        to={ROUTES.ADMIN_DASHBOARD}
                        className={({ isActive }) =>
                            `sidebar-item${isActive ? ' active' : ''}`
                        }
                        style={{ borderTop: '1px solid var(--border-primary)', marginTop: '8px', paddingTop: '16px' }}
                    >
                        <Shield size={20} />
                        <span>Administración</span>
                    </NavLink>
                )}
            </nav>

            {/* Usuario */}
            <div style={{
                padding: '16px 12px',
                borderTop: '1px solid var(--border-primary)',
                marginTop: 'auto',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '0 16px', marginBottom: '12px' }}>
                    <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 'var(--radius-full)',
                        background: 'var(--primary-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'var(--primary)',
                        fontWeight: 600,
                        fontSize: '0.75rem',
                    }}>
                        {profile?.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: 'var(--text-primary)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}>
                            {profile?.full_name ?? 'Usuario'}
                        </p>
                    </div>
                </div>
                <button className="sidebar-item" onClick={handleLogout} style={{ color: 'var(--error)' }}>
                    <LogOut size={20} />
                    <span>Cerrar sesión</span>
                </button>
            </div>
        </aside>
    );
}
