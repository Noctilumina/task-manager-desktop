import React, { useEffect, useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { LoginScreen } from './screens/LoginScreen';
import { TaskListScreen } from './screens/TaskListScreen';

console.log('[App] electronAPI:', window.electronAPI);
console.log('[App] apps before init:', getApps().length);
if (!getApps().length) {
  try {
    initializeApp(window.electronAPI.firebaseConfig);
    console.log('[App] Firebase initialized, apps:', getApps().length);
  } catch (e) {
    console.error('[App] initializeApp failed:', e);
  }
}

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    return onAuthStateChanged(auth, u => { setUser(u); setLoading(false); });
  }, []);

  if (loading) return null;

  if (!user) return <LoginScreen />;
  return <TaskListScreen userId={user.uid} />;
}
