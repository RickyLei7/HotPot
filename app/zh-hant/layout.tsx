export default function TraditionalChineseLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: 'document.documentElement.lang="zh-Hant";window.addEventListener("DOMContentLoaded",function(){var b=document.querySelector(".reserve-sticky-book");var p=document.querySelector(".reserve-sticky-phone");if(b)b.textContent="網上訂位";if(p){p.textContent="致電";p.setAttribute("aria-label","致電 (403) 455-3188")}})' }} />
      {children}
    </>
  );
}
