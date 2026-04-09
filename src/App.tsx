import React, { useEffect, useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, onAuthStateChanged, type User } from 'firebase/auth';
import { LoginScreen } from './screens/LoginScreen';
import { TaskListScreen } from './screens/TaskListScreen';

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY ?? '',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.FIREBASE_APP_ID ?? '',
};

if (!getApps().length) {
  initializeApp(firebaseConfig);
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
