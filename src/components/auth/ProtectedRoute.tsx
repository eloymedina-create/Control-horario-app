import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ROUTES } from '@/lib/constants/routes';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowPending?: boolean;
}

export function ProtectedRoute({ children, allowPending = false }: ProtectedRouteProps) {
    const { isAuthenticated, isLoading, profile } = useAuth();
    const location = useLocation();

    if (isLoading) {
        return (
            <div style={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'var(--bg-secondary)',
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="spinner spinner-lg" style={{ color: 'var(--primary)' }} />
                    <p style={{ marginTop: '16px', color: 'var(--text-secondary)' }}>Cargando...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
    }

    // Bloqueo por estado 'pending'
    if (profile?.status === 'pending' && !allowPending) {
        return <Navigate to={ROUTES.PENDING_APPROVAL} replace />;
    }

    // Si está activo pero intenta entrar en la página de espera
    if (profile?.status === 'active' && allowPending) {
        return <Navigate to={ROUTES.DASHBOARD} replace />;
    }

    return <>{children}</>;
}
