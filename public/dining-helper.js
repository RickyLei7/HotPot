(function () {
  'use strict';
  var endpoint = 'https://assistant.centrestjhotpot.ca/ask';
  var topics = ['menu', 'prices', 'booking', 'hours', 'directions', 'dietary', 'other'];
  var ids = ['ayce', 'snacks', 'personal', 'combos', 'soups', 'kids', 'rice_noodles', 'appetizers', 'drinks', 'addons', 'hours', 'location', 'booking', 'dietary', 'staff'];
  var paths = ['/menu/', '/menu/#soup-bases', '/menu/#rice-noodles', '/menu/#appetizers', '/menu/#drinks', '/menu/#hotpot-set', '/ayce-hot-pot-calgary/', '/contact/'];
  var booking = 'https://reservation.centrestjhotpot.ca/book';

  function safeHref(href) {
    return typeof href === 'string' && (href === booking || paths.some(function (path) {
      return href === path || href === '/zh-hant' + path;
    }));
  }

  function validAnswer(data) {
    return data && ['en', 'zh-Hant'].includes(data.language) && topics.includes(data.topic) &&
      Array.isArray(data.parts) && data.parts.length > 0 && data.parts.length <= 4 &&
      data.parts.every(function (p) {
        return p && (ids.includes(p.id) || p.id === 'estimate') && typeof p.text === 'string' &&
          p.text.length > 0 && p.text.length < 2500 && safeHref(p.href);
      });
  }

  function track(action, language, topic) {
    if (typeof window.gtag === 'function') {
      try {
        window.gtag('event', 'dining_helper_' + action, {
          helper_language: language,
          helper_topic: topics.includes(topic) ? topic : 'other'
        });
      } catch { /* Analytics must not interrupt dining or booking help. */ }
    }
  }

  function init(root) {
    if (root.dataset.helperReady) return;
    root.dataset.helperReady = 'true';
    var language = root.dataset.language === 'zh-Hant' ? 'zh-Hant' : 'en';
    var zh = language === 'zh-Hant';
    var form = root.querySelector('[data-helper-form]');
    var textarea = form.querySelector('textarea');
    var submit = form.querySelector('[type="submit"]');
    var status = root.querySelector('[data-helper-status]');
    var answer = root.querySelector('[data-helper-answer]');
    var messages = root.querySelector('[data-chat-messages]');
    var context = [];
    var pending = false;
    form.hidden = false;

    root.querySelectorAll('[data-helper-question]').forEach(function (button) {
      button.addEventListener('click', function () {
        if (pending) return;
        textarea.value = button.dataset.helperQuestion;
        textarea.focus();
      });
    });
    root.querySelector('.dining-helper-book').addEventListener('click', function () {
      track('booking_click', language);
    });
    form.addEventListener('submit', async function (event) {
      event.preventDefault();
      var question = textarea.value.trim();
      if (pending || !question || question.length > 500) return;
      pending = true;
      submit.disabled = true;
      root.setAttribute('aria-busy', 'true');
      // Keep only the most recent ten turns in memory on this page. Never persist customer text.
      while (answer.children.length >= 10) answer.firstElementChild.remove();
      var turn = document.createElement('article');
      turn.className = 'dining-chat-turn';
      var user = document.createElement('p');
      user.className = 'dining-chat-question';
      user.textContent = question;
      turn.append(user);
      answer.append(turn);
      answer.hidden = false;
      textarea.value = '';
      messages.scrollTop = messages.scrollHeight;
      function fallback(text) {
        status.textContent = text;
        var p = document.createElement('p');
        p.textContent = text;
        var call = document.createElement('a');
        call.href = 'tel:+14034553188';
        call.textContent = zh ? '致電餐廳 (403) 455-3188' : 'Call restaurant (403) 455-3188';
        turn.append(p, call);
        track('fallback', language);
      }
      status.textContent = zh ? '正在查閱菜單…' : 'Checking the menu…';
      var controller = new AbortController();
      var timer = window.setTimeout(function () { controller.abort(); }, 18000);
      try {
        var response = await fetch(endpoint, {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          credentials: 'omit', referrerPolicy: 'no-referrer', signal: controller.signal,
          body: JSON.stringify({ question: question, language: language, context: context })
        });
        if (!response.ok) {
          var failure = await response.json().catch(function () { return {}; });
          if (failure.error === 'personal_details') {
            fallback(zh ? '請刪除電話或電郵後再提問。訂位資料請填在網上訂位表格。' : 'Please remove phone numbers or emails and ask again. Enter reservation details in Book Online.');
          } else if (response.status === 429) {
            fallback(zh ? '暫時未能回覆。請致電餐廳，或使用網上訂位。' : 'Chat is busy right now. Please call the restaurant or use Book Online.');
          } else {
            throw new Error('unavailable');
          }
          return;
        }
        var data = await response.json();
        if (!validAnswer(data)) throw new Error('invalid_response');
        turn.lang = data.language === 'en' ? 'en-CA' : 'zh-Hant';
        data.parts.forEach(function (part) {
          var p = document.createElement('p');
          p.textContent = part.text;
          var a = document.createElement('a');
          a.href = part.href;
          a.textContent = data.language === 'en' ? (part.href === booking ? 'Book Online' : 'See details') : (part.href === booking ? '網上訂位' : '查看詳情');
          if (part.href === booking) {
            a.dataset.trackLabel = 'online_booking';
            a.dataset.reservationLauncher = '';
            a.setAttribute('aria-haspopup', 'dialog');
            a.addEventListener('click', function () { track('booking_click', language, 'booking'); });
          }
          turn.append(p, a);
        });
        context = data.parts.map(function (p) { return p.id; }).filter(function (id) { return ids.includes(id); }).slice(0, 3);
        answer.hidden = false;
        status.textContent = zh ? '回覆已準備好。' : 'Your answer is ready.';
        if (data.parts.some(function (p) { return p.id === 'staff' || p.id === 'dietary'; })) {
          var call = document.createElement('a');
          call.href = 'tel:+14034553188';
          call.textContent = zh ? '致電餐廳 (403) 455-3188' : 'Call restaurant (403) 455-3188';
          turn.append(call);
        }
        track('answer', language, data.topic);
      } catch {
        fallback(zh ? '暫時未能回覆。請致電餐廳，或使用網上訂位。' : 'Chat is temporarily unavailable. Please call the restaurant or use Book Online.');
      } finally {
        window.clearTimeout(timer);
        pending = false;
        submit.disabled = false;
        root.removeAttribute('aria-busy');
        messages.scrollTop = messages.scrollHeight;
      }
    });
  }

  function start() { document.querySelectorAll('[data-dining-helper]').forEach(init); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
  document.addEventListener('hotpot:page-ready', start);
}());
