import { useAuth } from '@/contexts/AuthContext';
import { LogOut, ShieldAlert, Timer } from 'lucide-react';

export default function PendingApprovalPage() {
    const { logout, profile } = useAuth();

    return (
        <div className="auth-page">
            <div className="auth-card slide-up" style={{ maxWidth: '500px', textAlign: 'center' }}>
                <div className="auth-logo">
                    <div style={{ 
                        width: '64px', 
                        height: '64px', 
                        borderRadius: '50%', 
                        background: 'var(--warning-light)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: 'var(--warning)',
                        margin: '0 auto 24px'
                    }}>
                        <Timer size={32} />
                    </div>
                    <h1>Acceso en Revisión</h1>
                    <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>
                        Hola, <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{profile?.full_name}</span>.
                    </p>
                </div>

                <div style={{ marginTop: '24px', textAlign: 'left', background: 'var(--bg-secondary)', padding: '20px', borderRadius: 'var(--radius)' }}>
                    <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                        <ShieldAlert size={20} style={{ color: 'var(--warning)', flexShrink: 0 }} />
                        <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                            Tu cuenta ha sido creada correctamente, pero por motivos de seguridad de <b>MyMarket</b>, un administrador debe activar tu acceso manualmente.
                        </p>
                    </div>
                    
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                        Por favor, contacta con tu responsable o el administrador del sistema para que autorice tu entrada. Una vez activado, podrás fichar y ver tu historial.
                    </p>
                </div>

                <div style={{ marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <button 
                        className="btn btn-outline" 
                        onClick={() => window.location.reload()}
                        style={{ width: '100%' }}
                    >
                        Ya me han activado (Refrescar)
                    </button>
                    <button 
                        className="btn btn-ghost" 
                        onClick={logout}
                        style={{ width: '100%', gap: '8px' }}
                    >
                        <LogOut size={18} /> Cerrar sesión
                    </button>
                </div>

                <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginTop: '24px' }}>
                    ID de Usuario: {profile?.id.substring(0, 8)}...
                </p>
            </div>
        </div>
    );
}
