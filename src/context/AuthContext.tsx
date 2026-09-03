'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  department: string;
  role: 'IT_SPECIALIST' | 'USER';
  avatarInitials: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
  quickLoginAsSpecialist: () => void;
  quickLoginAsUser: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const PRESET_SPECIALIST: AuthUser = {
  id: 'usr-ti-01',
  name: 'Orlando Núñez',
  email: 'onunez@gruposole.com.pe',
  department: 'Transformación Digital & IA',
  role: 'IT_SPECIALIST',
  avatarInitials: 'ON'
};

const PRESET_USER: AuthUser = {
  id: 'usr-colab-01',
  name: 'Carlos Mendoza',
  email: 'cmendoza@gruposole.com.pe',
  department: 'Finanzas & Contabilidad',
  role: 'USER',
  avatarInitials: 'CM'
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('ti_innovation_auth_user');
      if (stored) {
        setUser(JSON.parse(stored));
      } else {
        // Por defecto logueado como Especialista TI para facilidad
        setUser(PRESET_SPECIALIST);
        localStorage.setItem('ti_innovation_auth_user', JSON.stringify(PRESET_SPECIALIST));
      }
    } catch (e) {
      setUser(PRESET_SPECIALIST);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const login = (newUser: AuthUser) => {
    setUser(newUser);
    localStorage.setItem('ti_innovation_auth_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ti_innovation_auth_user');
  };

  const quickLoginAsSpecialist = () => {
    login(PRESET_SPECIALIST);
  };

  const quickLoginAsUser = () => {
    login(PRESET_USER);
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        quickLoginAsSpecialist,
        quickLoginAsUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
