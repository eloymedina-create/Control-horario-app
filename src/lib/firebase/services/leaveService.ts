import { ref, push, set, get, update, query, orderByChild, equalTo } from 'firebase/database';
import { db } from '../client';
import type { LeaveRequest, VacationBalance, LeaveStatus } from '@/types/leave';

export const leaveService = {
    // Solicitar ausencia
    async requestLeave(userId: string, data: Omit<LeaveRequest, 'id' | 'user_id' | 'status' | 'created_at' | 'updated_at'>): Promise<string> {
        const leaveRef = push(ref(db, `leave_requests/${userId}`));
        const leaveId = leaveRef.key!;
        
        const now = new Date().toISOString();
        const newRequest: LeaveRequest = {
            ...data,
            id: leaveId,
            user_id: userId,
            status: 'pending',
            reviewed_at: null,
            reviewed_by: null,
            rejection_reason: null,
            created_at: now,
            updated_at: now
        };

        await set(leaveRef, newRequest);
        
        // Notificar al administrador (opcional, vía una rama global de alertas)
        await set(ref(db, `admin_notifications/${leaveId}`), {
            type: 'leave_request',
            user_id: userId,
            leave_id: leaveId,
            created_at: now,
            read: false
        });

        return leaveId;
    },

    // Obtener solicitudes de un usuario
    async getUserLeaves(userId: string): Promise<LeaveRequest[]> {
        const snapshot = await get(ref(db, `leave_requests/${userId}`));
        if (!snapshot.exists()) return [];
        
        return Object.values(snapshot.val()) as LeaveRequest[];
    },

    // Obtener todas las solicitudes (para administrador)
    async getAllLeaves(): Promise<LeaveRequest[]> {
        const snapshot = await get(ref(db, 'leave_requests'));
        if (!snapshot.exists()) return [];
        
        const allUsersData = snapshot.val();
        const allLeaves: LeaveRequest[] = [];
        
        Object.keys(allUsersData).forEach(userId => {
            const userLeaves = allUsersData[userId];
            Object.values(userLeaves).forEach((leave: any) => {
                allLeaves.push(leave);
            });
        });
        
        return allLeaves.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    },

    // Aprobar/Rechazar solicitud
    async reviewLeave(userId: string, leaveId: string, status: 'approved' | 'rejected', adminId: string, reason?: string): Promise<void> {
        const leaveRef = ref(db, `leave_requests/${userId}/${leaveId}`);
        const now = new Date().toISOString();
        
        await update(leaveRef, {
            status,
            reviewed_at: now,
            reviewed_by: adminId,
            rejection_reason: reason || null,
            updated_at: now
        });

        // Si se aprueba, podríamos actualizar el balance aquí (simplificado por ahora)
    },

    // Obtener balance de vacaciones
    async getVacationBalance(userId: string, year: number = new Date().getFullYear()): Promise<VacationBalance> {
        const balanceRef = ref(db, `vacation_balances/${userId}/${year}`);
        const snapshot = await get(balanceRef);
        
        if (snapshot.exists()) {
            return snapshot.val();
        }

        // Si no existe, crear uno por defecto (22 días)
        const defaultBalance: VacationBalance = {
            user_id: userId,
            year,
            total_days: 22,
            used_days: 0,
            pending_days: 0,
            available_days: 22
        };

        await set(balanceRef, defaultBalance);
        return defaultBalance;
    }
};
