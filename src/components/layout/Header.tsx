import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/constants/routes';
import { Timer, LogOut, Moon, Sun } from 'lucide-react';
import { useState } from 'react';

export function Header() {
    const { profile, logout } = useAuth();
    const navigate = useNavigate();
    const [isDark, setIsDark] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate(ROUTES.LOGIN);
    };

    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle('dark');
    };

    return (
        <header className="app-header">
            {/* Logo (solo mobile, en desktop está en sidebar) */}
            <div className="show-mobile-only" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                    width: '32px',
                    height: '32px',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                }}>
                    <Timer size={18} />
                </div>
                <span style={{ fontWeight: 700, fontSize: '0.875rem' }}>Control Horario</span>
            </div>

            {/* Spacer para desktop */}
            <div className="hide-mobile" />

            {/* Acciones */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                    className="btn btn-icon btn-ghost"
                    onClick={toggleTheme}
                    aria-label={isDark ? 'Modo claro' : 'Modo oscuro'}
                    title={isDark ? 'Modo claro' : 'Modo oscuro'}
                >
                    {isDark ? <Sun size={20} /> : <Moon size={20} />}
                </button>

                {/* Avatar + menú */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                        onClick={() => navigate(ROUTES.PROFILE)}
                        style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: 'var(--radius-full)',
                            background: 'var(--primary-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--primary)',
                            fontWeight: 600,
                            fontSize: '0.875rem',
                            cursor: 'pointer',
                            transition: 'all var(--transition-fast)',
                        }}
                        title={profile?.full_name ?? 'Perfil'}
                    >
                        {profile?.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
                    </div>

                    <button
                        className="btn btn-icon btn-ghost hide-mobile"
                        onClick={handleLogout}
                        aria-label="Cerrar sesión"
                        title="Cerrar sesión"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </header>
    );
}
