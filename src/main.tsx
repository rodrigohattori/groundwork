import React from 'react';
import { createRoot } from 'react-dom/client';
import { FileRouter } from './kit';
import { App } from './App';

createRoot(document.getElementById('root')!).render(<FileRouter><App /></FileRouter>);
