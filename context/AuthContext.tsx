"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, password: string) => Promise<boolean>;
    logout: () => Promise<void>;
    updateProfile: (data: Partial<User>) => Promise<void>;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Fetch session
        const getSession = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    name: session.user.user_metadata?.name || "",
                    surname: session.user.user_metadata?.surname || "",
                    photoUrl: session.user.user_metadata?.photoUrl
                });
            } else {
                setUser(null);
            }
            setIsLoading(false);
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session?.user) {
                setUser({
                    id: session.user.id,
                    email: session.user.email!,
                    name: session.user.user_metadata?.name || "",
                    surname: session.user.user_metadata?.surname || "",
                    photoUrl: session.user.user_metadata?.photoUrl
                });
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    const login = async (email: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            console.error(error);
            setIsLoading(false);
            return false;
        }

        router.push("/dashboard");
        return true;
    };

    const register = async (name: string, email: string, password: string): Promise<boolean> => {
        setIsLoading(true);
        // We can split name into First/Last if needed, or just store as name
        // The original App interface has name & surname.
        // For now, we'll just store 'name' in metadata.

        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    name: name
                },
                emailRedirectTo: `${window.location.origin}/login`
            }
        });

        if (error) {
            console.error(error);
            setIsLoading(false);
            return false;
        }

        // Supabase specific: If email confirmation is enabled, session is null
        if (data.user && !data.session) {
            setIsLoading(false);
            alert("Cuenta creada. Por favor verifica tu correo electrónico para confirmar tu cuenta antes de iniciar sesión.");
            // Optionally redirect to login
            router.push("/login");
            return true;
        }

        // If session exists, onAuthStateChange should handle the rest, but we can push to dashboard
        // We rely on onAuthStateChange to set loading=false when it sees the session
        // However, to be safe against race conditions (if onAuthStateChange fires fast or slow), 
        // we generally let the effect handle 'user' state. 
        // But if we push to dashboard immediately, we assume user is logged in.

        router.push("/dashboard");
        return true;
    };

    const updateProfile = async (data: Partial<User>) => {
        if (!user) return;

        const updates: any = {};
        if (data.name) updates.name = data.name;
        if (data.surname) updates.surname = data.surname;
        if (data.photoUrl) updates.photoUrl = data.photoUrl;

        const { error } = await supabase.auth.updateUser({
            data: updates
        });

        if (error) {
            console.error("Error updating profile:", error);
        } else {
            // Local state update handled by onAuthStateChange or manually if needed
            // but onAuthStateChange should trigger.
        }
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateProfile, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
