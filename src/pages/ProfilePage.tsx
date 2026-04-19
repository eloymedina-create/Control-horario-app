import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { User, Mail, Calendar, Clock, Save, Moon, Sun, Bell, Shield } from 'lucide-react';

export default function ProfilePage() {
    const { profile, updateProfile } = useAuth();
    const { showSuccess, showError } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [fullName, setFullName] = useState(profile?.full_name ?? '');
    const [isSaving, setIsSaving] = useState(false);

    // Settings demo state
    const [notifications, setNotifications] = useState(true);
    const [isDark, setIsDark] = useState(document.documentElement.classList.contains('dark'));

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateProfile({ full_name: fullName });
            showSuccess('Perfil actualizado correctamente');
            setIsEditing(false);
        } catch (err) {
            showError(err instanceof Error ? err.message : 'Error al actualizar');
        } finally {
            setIsSaving(false);
        }
    };

    const toggleTheme = () => {
        setIsDark(!isDark);
        document.documentElement.classList.toggle('dark');
    };

    return (
        <div style={{ maxWidth: '600px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <User size={24} /> Mi Perfil
            </h1>

            {/* Avatar y nombre */}
            <div className="card" style={{ textAlign: 'center', marginBottom: '20px' }}>
                <div style={{
                    width: '80px',
                    height: '80px',
                    borderRadius: 'var(--radius-full)',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '2rem',
                    fontWeight: 700,
                    margin: '0 auto 16px',
                }}>
                    {profile?.full_name?.charAt(0)?.toUpperCase() ?? 'U'}
                </div>

                {isEditing ? (
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'center' }}>
                        <input
                            type="text"
                            className="input-field"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            style={{ maxWidth: '250px', textAlign: 'center' }}
                            autoFocus
                        />
                        <button className="btn btn-success btn-sm" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? <div className="spinner" /> : <Save size={16} />}
                        </button>
                    </div>
                ) : (
                    <>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '4px' }}>
                            {profile?.full_name ?? 'Usuario'}
                        </h2>
                        <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => setIsEditing(true)}
                            style={{ color: 'var(--primary)' }}
                        >
                            Editar nombre
                        </button>
                    </>
                )}
            </div>

            {/* Información */}
            <div className="card" style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '16px' }}>Información</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Mail size={18} style={{ color: 'var(--text-tertiary)' }} />
                        <div>
                            <div className="stats-label">Email</div>
                            <div style={{ fontSize: '0.875rem' }}>demo@controlhorario.com</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Calendar size={18} style={{ color: 'var(--text-tertiary)' }} />
                        <div>
                            <div className="stats-label">Miembro desde</div>
                            <div style={{ fontSize: '0.875rem' }}>Enero 2026</div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <Clock size={18} style={{ color: 'var(--text-tertiary)' }} />
                        <div>
                            <div className="stats-label">Vacaciones anuales</div>
                            <div style={{ fontSize: '0.875rem' }}>22 días</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Preferencias */}
            <div className="card" style={{ marginBottom: '20px' }}>
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '16px' }}>Preferencias</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Tema */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            {isDark ? <Moon size={18} style={{ color: 'var(--text-tertiary)' }} /> : <Sun size={18} style={{ color: 'var(--text-tertiary)' }} />}
                            <span style={{ fontSize: '0.875rem' }}>Modo oscuro</span>
                        </div>
                        <button
                            onClick={toggleTheme}
                            style={{
                                width: '48px',
                                height: '28px',
                                borderRadius: '14px',
                                border: 'none',
                                cursor: 'pointer',
                                position: 'relative',
                                backgroundColor: isDark ? 'var(--primary)' : 'var(--border-secondary)',
                                transition: 'background-color var(--transition-fast)',
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: '3px',
                                left: isDark ? '23px' : '3px',
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                backgroundColor: 'white',
                                transition: 'left var(--transition-fast)',
                                boxShadow: 'var(--shadow-sm)',
                            }} />
                        </button>
                    </div>

                    {/* Notificaciones */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <Bell size={18} style={{ color: 'var(--text-tertiary)' }} />
                            <span style={{ fontSize: '0.875rem' }}>Notificaciones</span>
                        </div>
                        <button
                            onClick={() => setNotifications(!notifications)}
                            style={{
                                width: '48px',
                                height: '28px',
                                borderRadius: '14px',
                                border: 'none',
                                cursor: 'pointer',
                                position: 'relative',
                                backgroundColor: notifications ? 'var(--primary)' : 'var(--border-secondary)',
                                transition: 'background-color var(--transition-fast)',
                            }}
                        >
                            <div style={{
                                position: 'absolute',
                                top: '3px',
                                left: notifications ? '23px' : '3px',
                                width: '22px',
                                height: '22px',
                                borderRadius: '50%',
                                backgroundColor: 'white',
                                transition: 'left var(--transition-fast)',
                                boxShadow: 'var(--shadow-sm)',
                            }} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Seguridad */}
            <div className="card">
                <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '16px' }}>Seguridad</h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <Shield size={18} style={{ color: 'var(--text-tertiary)' }} />
                    <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '0.875rem' }}>Cambiar contraseña</span>
                    </div>
                    <button className="btn btn-outline btn-sm">Cambiar</button>
                </div>
            </div>
        </div>
    );
}
