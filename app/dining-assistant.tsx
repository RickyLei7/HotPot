'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import { widget, chatRoutes, chatVersion } from '../assistant/widget.mjs';
import '../public/dining-helper.css';

export function DiningAssistant() {
  const pathname = usePathname();
  const route = pathname.replace(/^\/|\/$/g, '');
  const language = route.startsWith('zh-hant') ? 'zh-Hant' : 'en';
  const initialize = () => { document.dispatchEvent(new Event('hotpot:page-ready')); };
  useEffect(() => { initialize(); }, [pathname]);
  if (!chatRoutes.includes(route)) return null;
  return <>
    <div key={pathname} dangerouslySetInnerHTML={{ __html: widget(language) }} />
    <Script src={`/dining-helper.js?v=${chatVersion}`} strategy="afterInteractive" onReady={initialize} />
    <Script src={`/dining-chat.js?v=${chatVersion}`} strategy="afterInteractive" onReady={initialize} />
  </>;
}
