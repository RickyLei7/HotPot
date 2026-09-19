export default function TraditionalChineseLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: 'document.documentElement.lang="zh-Hant";window.addEventListener("DOMContentLoaded",function(){var e=document.querySelector(".reserve-sticky");if(e)e.textContent="網上訂位"})' }} />
      {children}
    </>
  );
}
