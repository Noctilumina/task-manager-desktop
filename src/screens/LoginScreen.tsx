import React, { useState } from 'react';
import { initializeApp, getApps } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export function LoginScreen() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = async () => {
    setLoading(true);
    setError(null);
    try {
      const auth = getAuth();
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch {
      setError('Sign-in failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Task Manager</h1>
      <p style={styles.sub}>Capture tasks instantly, sync everywhere</p>
      {error && <p style={styles.error}>{error}</p>}
      <button style={styles.btn} onClick={signIn} disabled={loading}>
        {loading ? 'Signing in...' : 'Sign in with Google'}
      </button>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', padding: 24 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 8 },
  sub: { fontSize: 16, color: '#666', marginBottom: 48, textAlign: 'center' },
  error: { color: '#D32F2F', marginBottom: 16, fontSize: 14 },
  btn: { backgroundColor: '#4285F4', color: '#fff', border: 'none', borderRadius: 8, padding: '14px 32px', fontSize: 16, fontWeight: 600, cursor: 'pointer', width: '100%', maxWidth: 320 },
};
