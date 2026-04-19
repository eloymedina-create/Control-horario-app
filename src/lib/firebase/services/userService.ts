import { ref, get, update } from 'firebase/database';
import { db } from '../client';
import type { UserProfile } from '@/types/auth';

export const userService = {
    /**
     * Obtiene todos los usuarios registrados en el sistema
     */
    async getAllUsers(): Promise<UserProfile[]> {
        const usersRef = ref(db, 'users');
        const snapshot = await get(usersRef);
        
        if (!snapshot.exists()) return [];
        
        const data = snapshot.val();
        return Object.values(data) as UserProfile[];
    },

    /**
     * Actualiza el rol de un usuario específico
     */
    async updateUserRole(userId: string, newRole: 'admin' | 'employee'): Promise<void> {
        const userRef = ref(db, `users/${userId}`);
        await update(userRef, {
            role: newRole,
            updated_at: new Date().toISOString()
        });
    }
};
