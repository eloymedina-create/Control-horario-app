import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/contexts/ToastContext';
import { timeEntryService } from '@/lib/firebase/services/timeEntryService';
import { userService } from '@/lib/firebase/services/userService';
import { 
    Users, 
    Play, 
    Pause, 
    Square, 
    Database, 
    Search,
    RefreshCw,
    CheckCircle2,
    AlertCircle,
    UserCog,
    Activity,
    Shield,
    ShieldAlert
} from 'lucide-react';
import { formatMinutesToDuration } from '@/lib/utils/formatting';
import type { UserProfile } from '@/types/auth';

type AdminTab = 'live' | 'users';

export default function AdminDashboardPage() {
    const { profile: currentUserProfile } = useAuth();
    const { showSuccess, showError } = useToast();
    const [activeTab, setActiveTab] = useState<AdminTab>('live');
    const [employeeStatuses, setEmployeeStatuses] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isSeeding, setIsSeeding] = useState(false);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    useEffect(() => {
        // Suscripción a estados en tiempo real
        const unsubscribe = timeEntryService.subscribeToAllStatus((statuses) => {
            setEmployeeStatuses(statuses);
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (activeTab === 'users') {
            loadUsers();
        }
    }, [activeTab]);

    const loadUsers = async () => {
        setIsLoadingUsers(true);
        try {
            const users = await userService.getAllUsers();
            setAllUsers(users);
        } catch (error) {
            showError('Error al cargar la lista de usuarios');
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const handleUpdateRole = async (userId: string, currentRole: string) => {
        const newRole = currentRole === 'admin' ? 'employee' : 'admin';
        const confirmMsg = `¿Estás seguro de que quieres cambiar el rol a ${newRole === 'admin' ? 'Administrador' : 'Empleado'}?`;
        
        if (!window.confirm(confirmMsg)) return;

        try {
            await userService.updateUserRole(userId, newRole);
            showSuccess('Rol actualizado correctamente');
            loadUsers(); // Recargar lista
        } catch (error) {
            showError('No se pudo actualizar el rol');
        }
    };

    const filteredEmployees = employeeStatuses.filter(emp => 
        emp.full_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredUsers = allUsers.filter(user => 
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const stats = {
        total: employeeStatuses.length,
        working: employeeStatuses.filter(e => e.status === 'active').length,
        paused: employeeStatuses.filter(e => e.status === 'paused').length,
        inactive: employeeStatuses.filter(e => e.status === 'idle').length,
    };

    const handleSeedData = async () => {
        setIsSeeding(true);
        try {
            const demoUsers = [
                { id: 'demo1', name: 'Juan Pérez' },
                { id: 'demo2', name: 'Laura García' },
                { id: 'demo3', name: 'Carlos Sanz' }
            ];

            for (const user of demoUsers) {
                await timeEntryService.clockIn(user.id, user.name);
            }
            showSuccess('Datos de prueba generados correctamente');
        } catch (error) {
            showError('Error al generar datos');
        } finally {
            setIsSeeding(false);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Users size={24} /> Panel Administrador
                    </h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                        Gestión total de MyMarket
                    </p>
                </div>
                {activeTab === 'live' && (
                    <button 
                        className="btn btn-outline btn-sm" 
                        onClick={handleSeedData} 
                        disabled={isSeeding}
                        style={{ gap: '8px' }}
                    >
                        <Database size={16} /> {isSeeding ? 'Generando...' : 'Generar datos test'}
                    </button>
                )}
            </div>

            {/* Pestañas */}
            <div style={{ 
                display: 'flex', 
                gap: '8px', 
                marginBottom: '24px', 
                borderBottom: '1px solid var(--border-primary)',
                paddingBottom: '12px' 
            }}>
                <button 
                    className={`btn btn-sm ${activeTab === 'live' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setActiveTab('live')}
                    style={{ gap: '6px' }}
                >
                    <Activity size={16} /> Estado en Vivo
                </button>
                <button 
                    className={`btn btn-sm ${activeTab === 'users' ? 'btn-primary' : 'btn-ghost'}`}
                    onClick={() => setActiveTab('users')}
                    style={{ gap: '6px' }}
                >
                    <UserCog size={16} /> Gestión de Personal
                </button>
            </div>

            {activeTab === 'live' ? (
                <>
                    {/* Resumen de equipo */}
                    <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
                        gap: '16px', 
                        marginBottom: '24px' 
                    }}>
                        <div className="card" style={{ padding: '16px' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.total}</div>
                            <div className="stats-label">Total Empleados</div>
                        </div>
                        <div className="card" style={{ padding: '16px', borderLeft: '4px solid var(--working)' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--working)' }}>{stats.working}</div>
                            <div className="stats-label">Trabajando ahora</div>
                        </div>
                        <div className="card" style={{ padding: '16px', borderLeft: '4px solid var(--paused)' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--paused)' }}>{stats.paused}</div>
                            <div className="stats-label">En pausa</div>
                        </div>
                        <div className="card" style={{ padding: '16px' }}>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-tertiary)' }}>{stats.inactive}</div>
                            <div className="stats-label">Fuera de jornada</div>
                        </div>
                    </div>

                    {/* Lista de empleados activos */}
                    <div className="card" style={{ padding: 0 }}>
                        <div style={{ padding: '20px', borderBottom: '1px solid var(--border-primary)' }}>
                            <div style={{ position: 'relative' }}>
                                <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                                <input 
                                    type="text" 
                                    placeholder="Buscar empleado..." 
                                    className="input" 
                                    style={{ paddingLeft: '40px' }}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-primary)' }}>
                                    <tr>
                                        <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Empleado</th>
                                        <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Estado</th>
                                        <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Última Actividad</th>
                                        <th style={{ textAlign: 'center', padding: '12px 20px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Acciones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEmployees.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                                                No se encontraron empleados activos
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredEmployees.map((emp) => (
                                            <tr key={emp.id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                                <td style={{ padding: '16px 20px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                        <div style={{ 
                                                            width: '32px', 
                                                            height: '32px', 
                                                            borderRadius: '50%', 
                                                            background: 'var(--primary-light)',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            color: 'var(--primary)',
                                                            fontWeight: 700,
                                                            fontSize: '0.75rem'
                                                        }}>
                                                            {emp.full_name.charAt(0)}
                                                        </div>
                                                        <span style={{ fontWeight: 600 }}>{emp.full_name}</span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '16px 20px' }}>
                                                    <span className={`badge badge-${emp.status === 'active' ? 'working' : emp.status === 'paused' ? 'paused' : 'inactive'}`}>
                                                        {emp.status === 'active' ? 'Trabajando' : emp.status === 'paused' ? 'Pausa' : 'Inactivo'}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                    {new Date(emp.updated_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                                                </td>
                                                <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                                    <button className="btn btn-ghost btn-sm">Ver historial</button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                /* GESTION DE USUARIOS */
                <div className="card" style={{ padding: 0 }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
                            <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
                            <input 
                                type="text" 
                                placeholder="Buscar por nombre o email..." 
                                className="input" 
                                style={{ paddingLeft: '40px' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button className="btn btn-ghost btn-sm" onClick={loadUsers} disabled={isLoadingUsers}>
                            <RefreshCw size={16} className={isLoadingUsers ? 'spin' : ''} />
                            Actualizar
                        </button>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead style={{ backgroundColor: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-primary)' }}>
                                <tr>
                                    <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Nombre / Email</th>
                                    <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Rol Actual</th>
                                    <th style={{ textAlign: 'left', padding: '12px 20px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Registrado</th>
                                    <th style={{ textAlign: 'center', padding: '12px 20px', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Cambiar Rol</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoadingUsers ? (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', padding: '40px' }}>
                                            <div className="spinner" style={{ margin: '0 auto' }} />
                                            <p style={{ marginTop: '12px', color: 'var(--text-tertiary)' }}>Cargando empleados...</p>
                                        </td>
                                    </tr>
                                ) : filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                                            No se encontraron usuarios
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => (
                                        <tr key={user.id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
                                            <td style={{ padding: '16px 20px' }}>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{user.full_name}</div>
                                                    <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>{user.email}</div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 20px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                    {user.role === 'admin' ? (
                                                        <Shield size={14} style={{ color: 'var(--primary)' }} />
                                                    ) : (
                                                        <Users size={14} style={{ color: 'var(--text-secondary)' }} />
                                                    )}
                                                    <span style={{ 
                                                        fontSize: '0.875rem', 
                                                        fontWeight: 500,
                                                        color: user.role === 'admin' ? 'var(--primary)' : 'var(--text-primary)'
                                                    }}>
                                                        {user.role === 'admin' ? 'Administrador' : 'Empleado'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td style={{ padding: '16px 20px', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                                {new Date(user.created_at).toLocaleDateString('es-ES')}
                                            </td>
                                            <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                                                {user.id !== currentUserProfile?.id ? (
                                                    <button 
                                                        className={`btn btn-sm ${user.role === 'admin' ? 'btn-outline' : 'btn-primary'}`}
                                                        onClick={() => handleUpdateRole(user.id, user.role)}
                                                        style={{ minWidth: '120px' }}
                                                    >
                                                        {user.role === 'admin' ? (
                                                            <><ShieldAlert size={14} /> Quitar Admin</>
                                                        ) : (
                                                            <><Shield size={14} /> Hacer Admin</>
                                                        )}
                                                    </button>
                                                ) : (
                                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontStyle: 'italic' }}>Tú (Maestro)</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
