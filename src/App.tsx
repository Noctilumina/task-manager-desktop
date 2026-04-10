import React, { useEffect, useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { LoginScreen } from './screens/LoginScreen';
import { TaskListScreen } from './screens/TaskListScreen';

if (!getApps().length) {
  initializeApp(window.electronAPI.firebaseConfig);
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
