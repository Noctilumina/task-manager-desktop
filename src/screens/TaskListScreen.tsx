import React, { useState, useEffect, useCallback } from 'react';
import { getAuth, signOut } from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';
import { TaskService, FirebaseTaskRepository, SyncService, type Task, type SortBy, type SyncStatus } from '@noctilumina/task-manager-shared';

export function TaskListScreen({ userId }: { userId: string }) {
  const [service] = useState(() => {
    console.log('[TaskList] apps at mount:', getApps().length);
    if (!getApps().length) {
      console.warn('[TaskList] Firebase not initialized — reinitializing');
      initializeApp(window.electronAPI.firebaseConfig);
    }
    return new TaskService(new FirebaseTaskRepository());
  });
  const [syncService] = useState(() => { const repo = new FirebaseTaskRepository(); return new SyncService(repo, repo); });
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sortBy, setSortBy] = useState<SortBy>('dueDate');
  const [newTitle, setNewTitle] = useState('');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return service.subscribeToTasks(userId, setTasks);
  }, [userId, sortBy]);

  useEffect(() => {
    return syncService.onStatusChange(setSyncStatus);
  }, []);

  const addTask = useCallback(async () => {
    const title = newTitle.trim();
    if (!title) return;
    try { await service.createTask(userId, { title }); setNewTitle(''); }
    catch { setError('Failed to create task.'); }
  }, [userId, newTitle]);

  const toggleComplete = useCallback(async (task: Task) => {
    try { await service.updateTask(userId, task.id, { isComplete: !task.isComplete }); }
    catch { setError('Failed to update task.'); }
  }, [userId]);

  const deleteTask = useCallback(async (taskId: string) => {
    if (!window.confirm('Delete this task?')) return;
    try { await service.deleteTask(userId, taskId); }
    catch { setError('Failed to delete task.'); }
  }, [userId]);

  return (
    <div style={styles.container}>
      {syncStatus !== 'idle' && (
        <div style={{ ...styles.syncBar, background: syncStatus === 'error' ? '#FFEBEE' : '#E3F2FD' }}>
          {syncStatus === 'syncing' ? 'Syncing...' : 'Sync failed. Retrying...'}
        </div>
      )}
      <header style={styles.header}>
        <h1 style={styles.title}>My Tasks</h1>
        <div style={styles.controls}>
          <select value={sortBy} onChange={e => setSortBy(e.target.value as SortBy)} style={styles.select}>
            <option value="dueDate">Sort: Due date</option>
            <option value="createdAt">Sort: Created</option>
          </select>
          <button style={styles.signOutBtn} onClick={() => signOut(getAuth())}>Sign out</button>
        </div>
      </header>
      <div style={styles.inputRow}>
        <input style={styles.input} value={newTitle} onChange={e => setNewTitle(e.target.value)}
          placeholder="Add a task..." onKeyDown={e => e.key === 'Enter' && addTask()} />
        <button style={styles.addBtn} onClick={addTask}>Add</button>
      </div>
      {error && <p style={styles.error}>{error}</p>}
      <div style={styles.list}>
        {tasks.length === 0 ? (
          <p style={styles.empty}>No tasks yet. Add one above!</p>
        ) : tasks.map(task => (
          <div key={task.id} style={{ ...styles.card, ...(task.isFromCalendar ? styles.calCard : {}) }}>
            <button style={styles.checkbox} onClick={() => toggleComplete(task)}>
              {task.isComplete ? '✓' : '○'}
            </button>
            <div style={styles.cardContent}>
              <span style={{ ...styles.taskTitle, ...(task.isComplete ? styles.done : {}) }}>{task.title}</span>
              {task.dueDate && <span style={styles.due}>{task.isFromCalendar ? '📅 ' : '🗓 '}{new Date(task.dueDate).toLocaleDateString()}</span>}
              {task.isFromCalendar && <span style={styles.badge}>Calendar</span>}
            </div>
            <button style={styles.deleteBtn} onClick={() => deleteTask(task.id)}>×</button>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: { display: 'flex', flexDirection: 'column', height: '100vh', maxWidth: 720, margin: '0 auto', padding: '0 16px' },
  syncBar: { padding: '6px 16px', textAlign: 'center', fontSize: 12, fontWeight: 500 },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 0' },
  title: { fontSize: 28, fontWeight: 'bold' },
  controls: { display: 'flex', gap: 8, alignItems: 'center' },
  select: { padding: '6px 10px', borderRadius: 6, border: '1px solid #ddd', fontSize: 13 },
  signOutBtn: { padding: '6px 14px', borderRadius: 6, border: '1px solid #ddd', background: '#fff', cursor: 'pointer', fontSize: 13 },
  inputRow: { display: 'flex', gap: 8, marginBottom: 16 },
  input: { flex: 1, padding: '10px 12px', borderRadius: 8, border: '1px solid #ddd', fontSize: 16 },
  addBtn: { padding: '10px 20px', borderRadius: 8, background: '#1a1a1a', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' },
  error: { color: '#D32F2F', fontSize: 13, marginBottom: 8 },
  list: { flex: 1, overflowY: 'auto' },
  empty: { textAlign: 'center', color: '#999', marginTop: 40, fontSize: 16 },
  card: { display: 'flex', alignItems: 'center', background: '#fff', borderRadius: 8, padding: '12px 16px', marginBottom: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.05)' },
  calCard: { borderLeft: '3px solid #4285F4' },
  checkbox: { background: 'none', border: 'none', fontSize: 20, color: '#666', cursor: 'pointer', marginRight: 12, padding: 0 },
  cardContent: { flex: 1, display: 'flex', flexDirection: 'column', gap: 2 },
  taskTitle: { fontSize: 15, fontWeight: 500, color: '#1a1a1a' },
  done: { textDecoration: 'line-through', color: '#999' },
  due: { fontSize: 12, color: '#666' },
  badge: { fontSize: 10, color: '#4285F4', fontWeight: 600, background: '#E8F0FE', borderRadius: 4, padding: '1px 6px', alignSelf: 'flex-start' },
  deleteBtn: { background: 'none', border: 'none', fontSize: 18, color: '#ccc', cursor: 'pointer', padding: '0 4px' },
};
