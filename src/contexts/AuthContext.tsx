import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { 
    onAuthStateChanged, 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword, 
    signOut, 
    sendPasswordResetEmail,
    User as FirebaseUser
} from 'firebase/auth';
import { ref, get, set, update } from 'firebase/database';
import { auth, db } from '@/lib/firebase/client';
import type { UserProfile } from '@/types/auth';

interface AuthState {
    user: FirebaseUser | null;
    profile: UserProfile | null;
    isLoading: boolean;
    isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, password: string, fullName: string) => Promise<void>;
    logout: () => Promise<void>;
    forgotPassword: (email: string) => Promise<void>;
    updateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const ADMIN_EMAIL = 'eloy.medina@gmail.com';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<AuthState>({
        user: null,
        profile: null,
        isLoading: true,
        isAuthenticated: false,
    });

    // Escuchar cambios de sesión de Firebase
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Intentar obtener el perfil de la base de datos
                    const profileRef = ref(db, `users/${firebaseUser.uid}`);
                    const snapshot = await get(profileRef);
                    
                    let profileData: UserProfile;

                    const isAdmin = firebaseUser.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();
                    
                    if (snapshot.exists()) {
                        profileData = snapshot.val();
                        // Forzar rol admin y status activo para el email raíz si está desactualizado
                        if (isAdmin) {
                            let needsUpdate = false;
                            const updates: any = { updated_at: new Date().toISOString() };
                            
                            if (profileData.role !== 'admin') {
                                profileData.role = 'admin';
                                updates.role = 'admin';
                                needsUpdate = true;
                            }
                            if (profileData.status !== 'active') {
                                profileData.status = 'active';
                                updates.status = 'active';
                                needsUpdate = true;
                            }
                            
                            if (needsUpdate) {
                                await update(profileRef, updates);
                            }
                        } else if (!profileData.status) {
                            // Migración para usuarios antiguos: por defecto activos si no tenían campo
                            profileData.status = 'active';
                            await update(profileRef, { status: 'active' });
                        }
                    } else {
                        // Si el usuario existe en Auth pero no en DB (primer login tras registro)
                        profileData = {
                            id: firebaseUser.uid,
                            full_name: firebaseUser.displayName || (isAdmin ? 'Administrador' : 'Empleado'),
                            email: firebaseUser.email || '',
                            avatar_url: firebaseUser.photoURL || null,
                            role: isAdmin ? 'admin' : 'employee',
                            status: isAdmin ? 'active' : 'pending',
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        };
                        await set(profileRef, profileData);
                    }

                    setState({
                        user: firebaseUser,
                        profile: profileData,
                        isLoading: false,
                        isAuthenticated: true,
                    });
                } catch (error) {
                    console.error('Error al cargar perfil:', error);
                    const isAdmin = firebaseUser.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();
                    setState({
                        user: firebaseUser,
                        profile: {
                            id: firebaseUser.uid,
                            full_name: firebaseUser.displayName || (isAdmin ? 'Admin' : 'Usuario'),
                            email: firebaseUser.email || '',
                            avatar_url: null,
                            role: isAdmin ? 'admin' : 'employee',
                            status: isAdmin ? 'active' : 'pending',
                            created_at: new Date().toISOString(),
                            updated_at: new Date().toISOString(),
                        },
                        isLoading: false,
                        isAuthenticated: true,
                    });
                }
            } else {
                setState({
                    user: null,
                    profile: null,
                    isLoading: false,
                    isAuthenticated: false,
                });
            }
        });

        return () => unsubscribe();
    }, []);

    const login = useCallback(async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
        } catch (error: any) {
            if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                throw new Error('Email o contraseña incorrectos');
            }
            throw new Error('Error al iniciar sesión. Intenta nuevamente.');
        }
    }, []);

    const register = useCallback(async (email: string, password: string, fullName: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            // Crear el perfil en Realtime Database
            const isAdmin = email === ADMIN_EMAIL;
            const profileData: UserProfile = {
                id: firebaseUser.uid,
                full_name: fullName,
                email: email,
                avatar_url: null,
                role: isAdmin ? 'admin' : 'employee',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            };

            await set(ref(db, `users/${firebaseUser.uid}`), profileData);
            
            // Forzar actualización de estado local (onAuthStateChanged lo hará, pero esto ayuda)
            setState(prev => ({
                ...prev,
                user: firebaseUser,
                profile: profileData,
                isAuthenticated: true
            }));

        } catch (error: any) {
            if (error.code === 'auth/email-already-in-use') {
                throw new Error('Este email ya está registrado');
            }
            throw new Error('Error al crear la cuenta. Intenta nuevamente.');
        }
    }, []);

    const logout = useCallback(async () => {
        await signOut(auth);
    }, []);

    const forgotPassword = useCallback(async (email: string) => {
        await sendPasswordResetEmail(auth, email);
    }, []);

    const updateProfile = useCallback(async (data: Partial<UserProfile>) => {
        if (!state.user) return;

        const profileRef = ref(db, `users/${state.user.uid}`);
        const updatedData = {
            ...data,
            updated_at: new Date().toISOString(),
        };

        await update(profileRef, updatedData);

        setState((prev) => ({
            ...prev,
            profile: prev.profile ? { ...prev.profile, ...updatedData } : null,
        }));
    }, [state.user]);

    return (
        <AuthContext.Provider
            value={{
                ...state,
                login,
                register,
                logout,
                forgotPassword,
                updateProfile,
                isConfigured: true // Mantenemos compatibilidad con layouts que chequeaban esto
            } as any}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
}
