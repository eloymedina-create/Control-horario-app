import { 
    ref, 
    push, 
    set, 
    update, 
    onValue, 
    get
} from 'firebase/database';
import { db } from '../client';
import type { TimeEntry, Pause, PauseType } from '@/types/timeEntry';

export const timeEntryService = {
    // Iniciar jornada
    async clockIn(userId: string, fullName: string): Promise<string> {
        const entryRef = push(ref(db, `time_entries/${userId}`));
        const entryId = entryRef.key!;
        
        const now = new Date().toISOString();
        const date = now.split('T')[0] || now; // Aseguramos que no sea undefined
        
        const newEntry: TimeEntry = {
            id: entryId,
            user_id: userId,
            date: date,
            clock_in: now,
            clock_out: null,
            total_hours: null,
            status: 'active',
            edited_manually: false,
            notes: null,
            created_at: now,
            updated_at: now,
            pauses: []
        };

        await set(entryRef, newEntry);
        
        // Actualizar estado global para el administrador
        await set(ref(db, `current_status/${userId}`), {
            id: userId,
            full_name: fullName,
            status: 'active',
            entry_id: entryId,
            updated_at: now
        });

        return entryId;
    },

    // Finalizar jornada
    async clockOut(userId: string, entryId: string): Promise<void> {
        const now = new Date().toISOString();
        const entryRef = ref(db, `time_entries/${userId}/${entryId}`);
        
        const snapshot = await get(entryRef);
        if (!snapshot.exists()) return;
        
        const entry = snapshot.val() as TimeEntry;
        
        // Calcular horas totales (simplificado por ahora)
        const start = new Date(entry.clock_in).getTime();
        const end = new Date(now).getTime();
        const totalMs = end - start;
        const totalHours = totalMs / (1000 * 60 * 60);

        await update(entryRef, {
            clock_out: now,
            status: 'completed',
            total_hours: totalHours,
            updated_at: now
        });

        // Actualizar estado global
        await update(ref(db, `current_status/${userId}`), {
            status: 'idle',
            entry_id: null,
            updated_at: now
        });
    },

    // Iniciar pausa
    async startPause(userId: string, entryId: string, type: PauseType): Promise<void> {
        const now = new Date().toISOString();
        const entryRef = ref(db, `time_entries/${userId}/${entryId}`);
        const pausesRef = ref(db, `time_entries/${userId}/${entryId}/pauses`);
        
        const newPauseRef = push(pausesRef);
        const pauseId = newPauseRef.key!;

        const newPause: Pause = {
            id: pauseId,
            time_entry_id: entryId,
            start_time: now,
            end_time: null,
            type: type,
            duration: null,
            created_at: now,
            updated_at: now
        };

        await set(newPauseRef, newPause);
        await update(entryRef, { status: 'paused', updated_at: now });
        
        // Actualizar estado global
        await update(ref(db, `current_status/${userId}`), {
            status: 'paused',
            updated_at: now
        });
    },

    // Finalizar pausa
    async endPause(userId: string, entryId: string): Promise<void> {
        const now = new Date().toISOString();
        const entryRef = ref(db, `time_entries/${userId}/${entryId}`);
        
        // Buscar la pausa activa
        const entrySnapshot = await get(entryRef);
        if (!entrySnapshot.exists()) return;
        
        const entry = entrySnapshot.val();
        const pauses = entry.pauses || {};
        const activePauseId = Object.keys(pauses).find(id => !pauses[id].end_time);

        if (activePauseId) {
            const pauseRef = ref(db, `time_entries/${userId}/${entryId}/pauses/${activePauseId}`);
            const pauseStartTime = new Date(pauses[activePauseId].start_time).getTime();
            const durationMs = new Date(now).getTime() - pauseStartTime;
            const durationMin = Math.round(durationMs / (1000 * 60));

            await update(pauseRef, {
                end_time: now,
                duration: durationMin,
                updated_at: now
            });
        }

        await update(entryRef, { status: 'active', updated_at: now });
        
        // Actualizar estado global
        await update(ref(db, `current_status/${userId}`), {
            status: 'active',
            updated_at: now
        });
    },

    // Listener para la entrada activa del usuario
    subscribeToActiveEntry(userId: string, callback: (entry: TimeEntry | null) => void) {
        const entriesRef = ref(db, `time_entries/${userId}`);

        // Nota: En RTDB no podemos hacer OR fácilmente. Escuchamos toda la rama del usuario 
        // y filtramos en el cliente para mayor simplicidad en tiempo real.
        return onValue(entriesRef, (snapshot) => {
            if (!snapshot.exists()) {
                callback(null);
                return;
            }
            
            const entries = snapshot.val();
            const activeEntryKey = Object.keys(entries).find(key => 
                entries[key].status === 'active' || entries[key].status === 'paused'
            );

            if (activeEntryKey) {
                const entry = entries[activeEntryKey];
                // Convertir el objeto de pausas en array para compatibilidad
                if (entry.pauses) {
                    entry.pauses = Object.values(entry.pauses);
                } else {
                    entry.pauses = [];
                }
                callback(entry);
            } else {
                callback(null);
            }
        });
    },

    // Obtener historial de un usuario
    async getHistory(userId: string): Promise<TimeEntry[]> {
        const snapshot = await get(ref(db, `time_entries/${userId}`));
        if (!snapshot.exists()) return [];
        
        const data = snapshot.val();
        return Object.values(data).map((entry: any) => ({
            ...entry,
            pauses: entry.pauses ? Object.values(entry.pauses) : []
        })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    },

    // Listener global para el administrador
    subscribeToAllStatus(callback: (statuses: any[]) => void) {
        return onValue(ref(db, 'current_status'), (snapshot) => {
            if (!snapshot.exists()) {
                callback([]);
                return;
            }
            callback(Object.values(snapshot.val()));
        });
    }
};
