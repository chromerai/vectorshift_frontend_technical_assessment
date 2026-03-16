// src/lib/Portal.js
import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
 
export const Portal = ({ children }) => {
  const ref = useRef(null);
  if (!ref.current) ref.current = document.createElement('div');
 
  useEffect(() => {
    document.body.appendChild(ref.current);
    return () => document.body.removeChild(ref.current);
  }, []);
 
  return createPortal(children, ref.current);
};