import { NavLink } from 'react-router-dom';
import { ROUTES } from '@/lib/constants/routes';
import { useAuth } from '@/contexts/AuthContext';
import { LayoutDashboard, Clock, CalendarDays, BarChart3, User, Shield } from 'lucide-react';

export function BottomNav() {
    const { profile } = useAuth();

    const navItems = [
        { path: ROUTES.DASHBOARD, label: 'Inicio', icon: LayoutDashboard },
        { path: ROUTES.HISTORY, label: 'Historial', icon: Clock },
        { path: ROUTES.LEAVE, label: 'Ausencias', icon: CalendarDays },
        { path: ROUTES.PROFILE, label: 'Perfil', icon: User },
    ];

    if (profile?.role === 'admin') {
        navItems.push({ path: ROUTES.ADMIN_DASHBOARD, label: 'Admin', icon: Shield });
    } else {
        navItems.push({ path: ROUTES.REPORTS, label: 'Reportes', icon: BarChart3 });
    }

    return (
        <nav className="app-bottom-nav">
            {navItems.map((item) => (
                <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === ROUTES.DASHBOARD}
                    className={({ isActive }) =>
                        `bottom-nav-item${isActive ? ' active' : ''}`
                    }
                >
                    <item.icon size={22} />
                    <span>{item.label}</span>
                </NavLink>
            ))}
        </nav>
    );
}
