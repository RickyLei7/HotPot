'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { widget } from '../assistant/widget.mjs';
import '../public/dining-helper.css';

export function DiningAssistant({ language = 'en' }: { language?: 'en' | 'zh-Hant' }) {
  const initialize = () => { document.dispatchEvent(new Event('hotpot:page-ready')); };
  useEffect(() => { initialize(); }, [language]);
  return <>
    <div dangerouslySetInnerHTML={{ __html: widget(language) }} />
    <Script src="/dining-helper.js?v=20261029-duo" strategy="afterInteractive" onReady={initialize} />
  </>;
}
