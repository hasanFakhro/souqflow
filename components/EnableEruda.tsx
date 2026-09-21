'use client';
import { useEffect } from 'react';

export default function EnableEruda() {
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      import('eruda').then((eruda) => eruda.default.init());
    }
  }, []);
  return null;
}