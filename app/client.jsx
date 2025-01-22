import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HomePage } from './pages/index.jsx';

const initialProps = window.__SSR_DATA__;

const domNode = document.getElementById('root');
hydrateRoot(domNode, <HomePage {...initialProps} />);