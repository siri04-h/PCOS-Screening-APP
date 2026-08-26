import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import authApi from '../api/authApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem('lunara_token');
      const cachedUser = await AsyncStorage.getItem('lunara_user');
      if (token && cachedUser) {
        setUser(JSON.parse(cachedUser));
      }
      setInitializing(false);
    })();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login({ email, password });
    await AsyncStorage.setItem('lunara_token', data.token);
    await AsyncStorage.setItem('lunara_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const { data } = await authApi.register(payload);
    await AsyncStorage.setItem('lunara_token', data.token);
    await AsyncStorage.setItem('lunara_user', JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const completeHealthProfile = useCallback(async (payload) => {
    const { data } = await authApi.updateHealthProfile(payload);
    const updated = { ...user, healthProfile: data.healthProfile, onboarded: true };
    await AsyncStorage.setItem('lunara_user', JSON.stringify(updated));
    setUser(updated);
    return updated;
  }, [user]);

  const logout = useCallback(async () => {
    await AsyncStorage.multiRemove(['lunara_token', 'lunara_user']);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, initializing, login, register, logout, completeHealthProfile, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export default AuthContext;
