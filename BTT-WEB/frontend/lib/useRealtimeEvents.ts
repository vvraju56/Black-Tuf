'use client';

import { useEffect } from 'react';
import { firebaseDb } from './firebase';
import { collection, onSnapshot, query, orderBy, limit } from 'firebase/firestore';

export type RealtimeEvent = {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

/**
 * Subscribes to the Firestore `events` collection and invokes `onChange`
 * whenever a new event is published. Used to trigger refetches of MongoDB data.
 */
export function useRealtimeEvents(onChange: (event: RealtimeEvent) => void) {
  useEffect(() => {
    if (!firebaseDb) return;
    const q = query(collection(firebaseDb, 'events'), orderBy('createdAt', 'desc'), limit(25));
    const unsub = onSnapshot(q, (snap) => {
      snap.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data() as Omit<RealtimeEvent, 'id'>;
          onChange({ id: change.doc.id, ...data });
        }
      });
    });
    return () => unsub();
  }, [onChange]);
}