// Exact transforms of the current production client; never rebuild the retired POS bundle.
export function bookingSecurityRecovery(source) {
  const replace = (before, after) => {
    if (source.split(before).length !== 2) throw new Error('Booking recovery baseline differs: ' + before.slice(0, 70));
    source = source.replace(before, after);
  };
  replace("  let challengeToken='',widget=null,scriptPromise=null,startedAt=Date.now();", "  let challengeToken='',widget=null,scriptPromise=null,securityTimer=null,startedAt=Date.now();");
  replace("  const showNoTimesHelp=installNoTimesHelp($('message'));", `  const securityStatus=document.createElement('p');
  securityStatus.id='booking-security-status';securityStatus.className='join-message';securityStatus.hidden=true;
  securityStatus.setAttribute('role','status');securityStatus.setAttribute('aria-live','polite');
  $('challenge').before(securityStatus);
  const showNoTimesHelp=installNoTimesHelp($('message'));`);
  replace("    challengeGeneration++;\n    if(widget!==null)", "    challengeGeneration++;clearTimeout(securityTimer);securityTimer=null;\n    securityStatus.hidden=true;securityStatus.textContent='';\n    if(widget!==null)");
  replace("    const generation=challengeGeneration;\n    let securityMessage", `    const generation=challengeGeneration;
    const securityProgress=text=>{securityStatus.textContent=text;securityStatus.dataset.kind='ok';securityStatus.hidden=false;};
    securityProgress('Checking security… / 正在安全驗證…');
    let securityMessage`);
  replace("      challengeToken='';$('submit').disabled=true;$('security-retry').hidden=false;\n      securityMessage=text;message(text,true);", `      clearTimeout(securityTimer);securityTimer=null;
      challengeToken='';$('submit').disabled=true;$('security-retry').hidden=false;
      securityStatus.hidden=false;securityStatus.textContent=text;securityStatus.dataset.kind='error';
      securityMessage=text;message(text,true);`);
  replace("      widget=window.turnstile.render($('challenge'),", `      // A widget can stall without firing an error (for example after a mobile network change).
      // Offer a manual retry while leaving the existing challenge able to complete normally.
      securityTimer=setTimeout(()=>{if(generation===challengeGeneration&&!challengeToken&&!$('form').hidden&&!pending){
        securityTimer=null;$('security-retry').hidden=false;
        securityProgress('Taking longer than usual. Complete the check below, or retry. Your details will stay. / 驗證較久，請完成下方驗證或重試；已填資料會保留。');
      }},30000);
      widget=window.turnstile.render($('challenge'),`);
  replace("          challengeToken=value;$('security-retry').hidden=true;updateSelection();", "          clearTimeout(securityTimer);securityTimer=null;securityStatus.hidden=true;securityStatus.textContent='';\n          challengeToken=value;$('security-retry').hidden=true;updateSelection();");
  replace("        'expired-callback':()=>securityFailure(", `        'before-interactive-callback':()=>{if(generation===challengeGeneration)securityProgress('Please complete the security check below. / 請完成下方安全驗證。');},
        'expired-callback':()=>securityFailure(`);
  replace("    }catch{if(generation===challengeGeneration){$('security-retry').hidden=false;message(bookingError({code:'CHALLENGE_UNAVAILABLE'}),true);}}", "    }catch{securityFailure(bookingError({code:'CHALLENGE_UNAVAILABLE'}));}");
  return source;
}
