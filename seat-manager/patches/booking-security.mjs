// Apply only to the reviewed booking client; unrelated release assets stay unchanged.
export function bookingSecurity(source) {
  const before = `        callback:value=>{if(generation===challengeGeneration){challengeToken=value;$('submit').disabled=false;}},
        'expired-callback':()=>{if(generation===challengeGeneration){challengeToken='';$('submit').disabled=true;}},
        'error-callback':()=>{if(generation===challengeGeneration){challengeToken='';$('submit').disabled=true;$('security-retry').hidden=false;message(bookingError({code:'CHALLENGE_FAILED'}),true);}}`;
  const after = `        callback:value=>{if(generation===challengeGeneration){
          challengeToken=value;$('security-retry').hidden=true;updateSelection();
          if($('message').textContent===securityMessage)message();
        }},
        'expired-callback':()=>securityFailure('Security check expired. Retry below. / 安全驗證已過期，請按下方重試。'),
        'timeout-callback':()=>securityFailure('Security check timed out. Retry below. / 安全驗證逾時，請按下方重試。'),
        'unsupported-callback':()=>securityFailure(bookingError({code:'CHALLENGE_UNAVAILABLE'})),
        'error-callback':()=>{securityFailure(bookingError({code:'CHALLENGE_FAILED'}));return true;}`;
  if (source.split(before).length !== 2) throw new Error('Booking security source differs from the reviewed version');
  const anchor = '    const generation=challengeGeneration;\n    try{';
  if (source.split(anchor).length !== 2) throw new Error('Booking challenge generation differs from the reviewed version');
  const retry = "    removeChallenge();$('submit').disabled=true;";
  if (source.split(retry).length !== 2) throw new Error('Booking security retry differs from the reviewed version');
  return source.replace(retry, `    if(!$('security-retry').hidden)message();
${retry}`).replace(anchor, `    const generation=challengeGeneration;
    let securityMessage=bookingError({code:'CHALLENGE_FAILED'});
    const securityFailure=text=>{if(generation===challengeGeneration){
      challengeToken='';$('submit').disabled=true;$('security-retry').hidden=false;
      securityMessage=text;message(text,true);
    }};
    try{`).replace(before, after);
}
