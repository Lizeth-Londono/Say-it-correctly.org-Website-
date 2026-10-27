/* Shared audio, no services. Call directly inside the learner's interaction.
   playError() never queues effects; speakEnglish() uses cached English voices. */
(()=>{'use strict';
 const listeners=new Set(),voiceListeners=new Set();
 const genders={female:/\b(female|woman|samantha|zira|aria|jenny|victoria|susan|karen|moira)\b/i,male:/\b(male|man|david|mark|guy|daniel|alex|george|fred)\b/i};
 let voices=[],active=null,timer=null,effect=null,context=null,buffer=null,source=null,loading=null,sequence=0,lastError=null;
 const notify=error=>{lastError=error;console.warn('[SayIt audio]',error.code,error.cause||'');listeners.forEach(fn=>fn(error))};
 function refreshVoices(){try{voices=(window.speechSynthesis?.getVoices()||[]).filter(v=>/^en(?:[-_]|$)/i.test(v.lang)).sort((a,b)=>Number(b.localService)-Number(a.localService)||rank(a)-rank(b))}catch(error){voices=[];notify({code:'voiceFail',cause:error})}voiceListeners.forEach(fn=>fn());return voices}
 const rank=v=>/^en[-_]US$/i.test(v.lang)?0:/^en[-_]GB$/i.test(v.lang)?1:2;
 function voiceFor(gender){return gender?voices.find(v=>genders[gender]?.test(v.name))||null:voices[0]||null}
 function stopSpeech(){clearTimeout(timer);timer=null;const previous=active;active=null;const synth=window.speechSynthesis;if(synth&&(previous||synth.pending||synth.speaking))synth.cancel()}
 function speakEnglish(text,{gender,onstart=()=>{},onend=()=>{},onerror=()=>{}}={}){
  const synth=window.speechSynthesis,Utterance=window.SpeechSynthesisUtterance;
  if(!synth||!Utterance){onerror({code:'voiceUnsupported'});return false}
  // Refresh only when the initial inventory was empty; voiceschanged handles later updates.
  if(!voices.length)refreshVoices();const voice=voiceFor(gender);
  if(!voice){onerror({code:'voiceUnavailable',gender});return false}
  stopSpeech();const u=new Utterance(text);active=u;u.voice=voice;u.lang=voice.lang;u.rate=.95;u.pitch=1;u.volume=1;
  const fail=error=>{if(active!==u)return;clearTimeout(timer);timer=null;active=null;onerror(error)};
  u.onstart=()=>{if(active!==u)return;clearTimeout(timer);timer=null;onstart({text,voice})};
  u.onend=()=>{if(active!==u)return;clearTimeout(timer);timer=null;active=null;onend()};
  u.onerror=e=>fail({code:'voiceFail',detail:e.error});
  // Watchdog detects a stalled engine; it does not delay speak().
  timer=setTimeout(()=>{if(active!==u)return;stopSpeech();onerror({code:'voiceTimeout'})},8000);
  try{if(synth.paused)synth.resume();synth.speak(u);return true}catch(error){fail({code:'voiceFail',detail:error.name});return false}
 }
 function initEffects(){if(effect)return effect;effect=document.getElementById('error-sound');if(!effect)return null;effect.preload='auto';effect.volume=.55;effect.addEventListener('error',()=>notify({code:'effectFail',cause:effect.error}));try{effect.load()}catch(error){notify({code:'effectFail',cause:error})}return effect}
 function warmEffects(){const a=initEffects();if(!a)return;
  try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;if(!context)context=new C();if(context.state==='suspended')context.resume().catch(error=>notify({code:'effectPrepare',cause:error}));
   if(!loading){loading=fetch(a.src).then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.arrayBuffer()}).then(bytes=>context.decodeAudioData(bytes)).then(decoded=>{buffer=decoded}).catch(error=>notify({code:'effectPrepare',cause:error}))}
  }catch(error){notify({code:'effectPrepare',cause:error})}
 }
 function playError(){const request=++sequence,a=initEffects();
  try{source?.stop();source=null;if(a){a.pause();a.currentTime=0}
   if(buffer&&context?.state==='running'){source=context.createBufferSource();source.buffer=buffer;const gain=context.createGain();gain.gain.value=.55;source.connect(gain).connect(context.destination);source.start(0);return Promise.resolve(true)}
   if(!a)throw Error('Missing error-sound element');
   return Promise.resolve(a.play()).then(()=>true).catch(error=>{if(request!==sequence&&error.name==='AbortError')return false;notify({code:'effectFail',cause:error});return false});
  }catch(error){notify({code:'effectFail',cause:error});return Promise.resolve(false)}
 }
 window.LXLAudio={initEffects,warmEffects,playError,speakEnglish,stopSpeech,refreshVoices,voiceFor,get voices(){return voices},onError(fn){listeners.add(fn);if(lastError)fn(lastError);return()=>listeners.delete(fn)},onVoicesChanged(fn){voiceListeners.add(fn);return()=>voiceListeners.delete(fn)}};
 window.speechSynthesis?.addEventListener?.('voiceschanged',refreshVoices);refreshVoices();initEffects();
 document.addEventListener?.('pointerdown',warmEffects,{once:true,capture:true});document.addEventListener?.('keydown',warmEffects,{once:true,capture:true});
})();
