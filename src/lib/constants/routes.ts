export const ROUTES = {
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    DASHBOARD: '/',
    HISTORY: '/historial',
    LEAVE: '/ausencias',
    LEAVE_REQUEST: '/ausencias/solicitar',
    REPORTS: '/reportes',
    PROFILE: '/perfil',
    ADMIN_DASHBOARD: '/admin',
    MANUAL: '/manual',
    PENDING_APPROVAL: '/acceso-pendiente',
} as const;

export const PUBLIC_ROUTES = [
    ROUTES.LOGIN,
    ROUTES.REGISTER,
    ROUTES.FORGOT_PASSWORD,
    ROUTES.RESET_PASSWORD,
];
