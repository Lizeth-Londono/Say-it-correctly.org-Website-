"use strict";
const PRICE_USD=1, FREE_LIMIT=6;
// Calibrated from the client reference (887 x 1774), 2026-10-20.
// Shoulder and Foot retain their previous positions pending confirmation.
// targetX/Y: approved anatomical anchor; controlX/Y: visual button and hit area.
// Only control coordinates move for the visual presentation adjustment.
const RAW=[
["eye","Eye","Ojo","眼睛",49.1545,9.8083,20,9],
["ear","Ear","Oreja","耳朵",58.9628,11.3303,80,10],
["nose","Nose","Nariz","鼻子",43.5175,11.4994,18,14],
["mouth","Mouth","Boca","嘴巴",44.7576,13.4724,18,19],
["lip","Lip","Labio","嘴唇",44.7576,14.2052,18,24],
["tooth","Tooth","Diente","牙齿",46.8997,13.2469,80,15],
["hair","Hair","Cabello","头发",68.4329,17.6437,82,25],
["forehead","Forehead","Frente","额头",45.9977,7.1026,26,4],
["head","Head","Cabeza","头部",59.752,6.0879,74,3],
["neck","Neck","Cuello","脖子",54.4532,17.08,80,20],
["shoulder","Shoulder","Hombro","肩膀",64.5,22.6,64.5,22.6],
["arm","Arm","Brazo","手臂",35.7384,28.6359,35.7384,28.6359],
["elbow","Elbow","Codo","肘部",87.1477,34.8929,87.1477,34.8929],
["hand","Hand","Mano","手",31.6798,48.1962,18,47],
["finger","Finger","Dedo de la mano","手指",33.5964,52.0293,18,55],
["chest","Chest","Pecho","胸部",56.3698,28.9177,56.3698,28.9177],
["stomach","Stomach","Abdomen","腹部",47.4634,36.3021,47.4634,36.3021],
["waist","Waist","Cintura","腰部",45.9977,40.8117,45.9977,40.8117],
["leg","Leg","Pierna","腿",54.9042,59.0192,54.9042,59.0192],
["knee","Knee","Rodilla","膝盖",54.9042,65.3326,76,65],
["ankle","Ankle","Tobillo","脚踝",41.9391,85.1184,20,83],
["foot","Foot","Pie","脚",32.7,89.4,18,89],
["toe","Toe","Dedo del pie","脚趾",41.3754,93.6866,70,95],
["hip","Hip","Cadera","髋部",61.2176,34.6674,61.2176,34.6674]
];
const DATA=RAW.map(([id,english,spanish,chinese,targetX,targetY,controlX,controlY])=>({id,english,spanish,chinese,targetX,targetY,controlX,controlY}));
const $=id=>document.getElementById(id);
const T=(key,vars)=>window.LXL?.t?.(key,vars)||key;
function updateBodyLocale(){
 const map={'body-instruction':'instruction','body-choose':'choose','body-words-count':'words','body-drag-help':'drag'};for(const [id,key] of Object.entries(map)){const e=$(id);if(e)e.textContent=T(key)}
 document.querySelector('[data-ui=demo]').textContent=T('demo');document.querySelector('.footer').textContent=T('foot');
 const back=document.querySelector('.header a.btn-white');if(back){back.textContent=T('back');back.href='../../home/index.html?lang='+encodeURIComponent(window.LXL.lang)}
 const help=$('reopen-tutorial');if(help)help.textContent=T('help');
 const reset=$('reset');if(reset)reset.textContent=T('reset');
 const cart=$('preview');if(cart)cart.textContent=T('cart');
 const counter=$('counter');if(counter)counter.textContent=`${T('counter')}: ${completed.size} / ${FREE_LIMIT}`;
 document.querySelectorAll('.guide h2').forEach(e=>e.textContent=T('guide'));
 document.querySelectorAll('.guide .step').forEach((e,i)=>{const k=['step1','step2','step3','step4'][i];if(k)e.textContent=`${i+1}. ${T(k)}`});
 const select=$('body-language');if(select)select.value=window.LXL.lang;
 document.querySelector('.brand small').textContent=T('brandNote');document.querySelector('.guide .hint').textContent=T('voiceNote');
 $('close').setAttribute('aria-label',T('close'));$('body-language').setAttribute('aria-label',T('language'));$('progress').setAttribute('aria-label',T('counter'));
 $('figure-scroll').setAttribute('aria-label',T('figureLabel'));$('figure').setAttribute('aria-label',T('figureLabel'));$('figure').querySelector('img').alt=T('figureLabel');
 updateUI();document.querySelectorAll('.speak').forEach(e=>e.setAttribute('aria-label',T('pronounceLabel',{word:itemFor(e.parentElement.dataset.id).english})));if(lastStatus)statusMsg('','',lastStatus.key,lastStatus.vars);else $('status').textContent=T('step1');
 const effectStatus=$('effect-status');if(effectStatus?.dataset.audioError)effectStatus.textContent=T(effectStatus.dataset.audioError);
 if(modalName)translateOpenDialog(modalName);
}
function translateOpenDialog(){const area=$('dialog-content');area.querySelectorAll('[data-t]').forEach(e=>e.textContent=T(e.dataset.t));refreshVoices();}

let completed=new Set(),selected=null,highlighted=null,locked=false,voicePreference='female',modalName='',dragGhost=null;
const itemFor=id=>DATA.find(d=>d.id===id);
let lastStatus=null;
function statusMsg(cn,es,key,vars){if(key)lastStatus={key,vars};$('status').textContent=key&&window.LXL?.t?T(key,vars):window.LXL?.lang==='zh-CN'?cn:es}
// Shared English voice inventory; exercise-specific messages stay localized.
function availableVoice(preference=voicePreference){return window.LXLAudio.voiceFor(preference)}
function refreshVoices(){const notice=$('voice-status');if(!notice)return;const voice=availableVoice();notice.textContent=!window.speechSynthesis?T('voiceUnsupported'):voice?T('voiceReady',{word:voice.name+' ('+voice.lang+')'}):T('voiceUnavailable',{gender:T(voicePreference)})}
function stopSpeech(){window.LXLAudio.stopSpeech()}
function speak(word){window.LXLAudio.speakEnglish(word,{gender:voicePreference,
 onstart:()=>audioVoiceMessage('voiceStarted',{word}),
 onerror:error=>audioVoiceMessage(error.code,{gender:T(voicePreference)},error.detail)
})}
function audioVoiceMessage(key,vars,detail){
 const fallback={voiceUnsupported:'El navegador no admite voz sintetizada',voiceUnavailable:'No hay una voz inglesa '+(voicePreference==='male'?'masculina':'femenina')+' disponible.',voiceStarted:'Pronunciando '+vars?.word,voiceTimeout:'La voz no comenzó',voiceFail:'No se pudo reproducir la voz'};
 const message=(window.LXL?T(key,vars):fallback[key])+(detail?' ('+detail+')':'');statusMsg(message,message);const notice=$('voice-status');if(notice)notice.textContent=message;
}
// Close facial markers retain their approved hit areas. Resolve overlapping
// areas by the nearest centre instead of whichever button is last in the DOM.
function markerAtPoint(x,y){
if(!document.elementFromPoint(x,y)?.closest('.target'))return null;
let nearest=null,distance=Infinity;
for(const dot of document.querySelectorAll('.target')){const r=dot.getBoundingClientRect();if(x<r.left||x>r.right||y<r.top||y>r.bottom)continue;const delta=Math.hypot(x-(r.left+r.width/2),y-(r.top+r.height/2));if(delta<distance){nearest=dot;distance=delta}}
return nearest;
}
function playError(){return window.LXLAudio.playError()}

function render(){const words=$('words'),targets=$('targets'),lines=$('target-lines');words.replaceChildren();targets.replaceChildren();lines.replaceChildren();for(const d of DATA){
const card=document.createElement('div');card.className='word-card';card.dataset.id=d.id;card.setAttribute('role','group');
const choose=document.createElement('button');choose.type='button';choose.className='choose-word';choose.textContent=d.english;choose.dataset.id=d.id;choose.setAttribute('aria-label',`Choose ${d.english}`);choose.addEventListener('click',()=>chooseWord(d.id));choose.addEventListener('pointerdown',e=>startDrag(e,d,choose));
const audio=document.createElement('button');audio.className='speak';audio.type='button';audio.textContent='🔊';audio.setAttribute('aria-label',T('pronounceLabel',{word:d.english}));audio.addEventListener('click',()=>speak(d.english));card.append(choose,audio);words.append(card);
const dot=document.createElement('button');dot.type='button';dot.className='target';dot.dataset.id=d.id;dot.style.left=d.controlX+'%';dot.style.top=d.controlY+'%';dot.setAttribute('aria-label',`Body marker ${DATA.indexOf(d)+1}`);dot.innerHTML='<span class="target-dot" aria-hidden="true">•</span>';dot.addEventListener('click',e=>{const id=(e.detail?markerAtPoint(e.clientX,e.clientY):dot)?.dataset.id;if(!id)return;if(completed.has(id)){recall(id);return}if(selected&&!locked)attempt(selected,id)});targets.append(dot);
if(Math.hypot(d.targetX-d.controlX,d.targetY-d.controlY)>1.15){const ns='http://www.w3.org/2000/svg';const line=document.createElementNS(ns,'line');line.dataset.id=d.id;line.setAttribute('x1',d.controlX/100*887);line.setAttribute('y1',d.controlY/100*1774);line.setAttribute('x2',d.targetX/100*887);line.setAttribute('y2',d.targetY/100*1774);lines.append(line);const spot=document.createElementNS(ns,'circle');spot.dataset.id=d.id;spot.setAttribute('cx',d.targetX/100*887);spot.setAttribute('cy',d.targetY/100*1774);spot.setAttribute('r',2.6);lines.append(spot)} }
updateUI();}
function chooseWord(id){if(completed.has(id)){recall(id);return}if(locked)return;selected=id;highlighted=null;updateUI();const d=itemFor(id);statusMsg('','', 'selected',{word:d.english})}
function recall(id){if(!completed.has(id))return;highlighted=highlighted===id?null:id;selected=null;updateUI();if(highlighted){const card=$('words').querySelector(`[data-id="${id}"].word-card`);const dot=$('targets').querySelector(`[data-id="${id}"]`);card?.scrollIntoView({block:'nearest'});dot?.scrollIntoView({block:'nearest'});const d=itemFor(id);statusMsg('','','review',{word:d.english})}else statusMsg('','','unreview')}
function updateUI(){for(const card of document.querySelectorAll('.word-card')){const id=card.dataset.id,done=completed.has(id);card.classList.toggle('done',done);card.classList.toggle('recall',done&&highlighted===id);card.classList.toggle('selected',selected===id&&!done);card.querySelector('.choose-word').textContent=itemFor(id).english+(done?' ✓':'');card.querySelector('.choose-word').disabled=locked&&!done;card.querySelector('.choose-word').setAttribute('aria-label',T(done?'reviewLabel':'chooseLabel',{word:itemFor(id).english}))}for(const dot of document.querySelectorAll('.target')){dot.classList.toggle('correct',completed.has(dot.dataset.id));dot.classList.toggle('recall',highlighted===dot.dataset.id);dot.setAttribute('aria-label',T(completed.has(dot.dataset.id)?'reviewLabel':'markerLabel',{word:completed.has(dot.dataset.id)?itemFor(dot.dataset.id).english:DATA.findIndex(d=>d.id===dot.dataset.id)+1}))}for(const e of document.querySelectorAll('#target-lines [data-id]'))e.classList.toggle('recall',highlighted===e.dataset.id)}
function attempt(wordId,pointId){if(locked||!wordId||completed.has(wordId))return;const d=itemFor(wordId);if(wordId!==pointId){statusMsg('','', 'retry',{word:d.english});selected=null;updateUI();playError();return}completed.add(wordId);selected=null;highlighted=null;const n=completed.size;$('counter').textContent=`${T('counter')}: ${n} / ${FREE_LIMIT}`;$('progress').setAttribute('aria-valuenow',n);$('fill').style.width=(100*n/FREE_LIMIT)+'%';statusMsg('','', 'correct',{word:d.english});updateUI();if(n===FREE_LIMIT){locked=true;updateUI();setTimeout(()=>openModal('success'),550)}}
let skipClick=false;
function startDrag(e,d,button){if(e.button!==0||locked||completed.has(d.id))return;const x=e.clientX,y=e.clientY;let moved=false;const move=ev=>{if(!moved&&Math.hypot(ev.clientX-x,ev.clientY-y)>9){moved=true;dragGhost=document.createElement('div');dragGhost.className='drag-ghost';dragGhost.textContent=d.english;document.body.append(dragGhost)}if(moved){dragGhost.style.left=ev.clientX+'px';dragGhost.style.top=ev.clientY+'px';const sc=$('figure-scroll'),r=sc.getBoundingClientRect();if(ev.clientX>r.left&&ev.clientX<r.right){if(ev.clientY<r.top+45)sc.scrollTop-=17;if(ev.clientY>r.bottom-45)sc.scrollTop+=17}document.querySelectorAll('.target').forEach(t=>t.classList.remove('is-hover'));markerAtPoint(ev.clientX,ev.clientY)?.classList.add('is-hover')}};
const clean=()=>{window.removeEventListener('pointermove',move);window.removeEventListener('pointerup',up);window.removeEventListener('pointercancel',cancel);dragGhost?.remove();dragGhost=null;document.querySelectorAll('.target').forEach(t=>t.classList.remove('is-hover'))};
const up=ev=>{const hit=moved?markerAtPoint(ev.clientX,ev.clientY):null;clean();if(moved){skipClick=true;setTimeout(()=>skipClick=false,150);if(hit)attempt(d.id,hit.dataset.id);else statusMsg('','','returned')}};const cancel=()=>clean();
window.addEventListener('pointermove',move);window.addEventListener('pointerup',up);window.addEventListener('pointercancel',cancel);
}
function reset(){completed.clear();locked=false;selected=null;highlighted=null;$('counter').textContent=`${T('counter')}: 0 / ${FREE_LIMIT}`;$('progress').setAttribute('aria-valuenow',0);$('fill').style.width='0%';updateUI();closeModal();statusMsg('','','resetDone')}
let returnFocus=null;
function dialog(html,type){if(!modalName)returnFocus=document.activeElement;const box=$('dialog-content');box.innerHTML=html;$('dialog').classList.toggle('tutorial-dialog',type==='tutorial');$('overlay').classList.add('open');modalName=type;setBackgroundInert(true);translateOpenDialog(type);$('close').focus()}
const tx=(key,tag='p')=>'<'+tag+' data-t="'+key+'">'+T(key)+'</'+tag+'>';
function openModal(type){
 const title={tutorial:'tutorialTitle',success:'success',cart:'cartTitle',form:'formTitle'}[type];
 let html='<h2 id="dialog-title" data-t="'+title+'">'+T(title)+'</h2>';
 if(type==='tutorial')html+=tx('tutorialIntro')+'<div class="demo-area"><div class="demo-word" lang="en">Eye 🔊</div><div class="demo-arrow" aria-hidden="true">➜</div><div class="demo-target" aria-hidden="true">✓</div></div><div class="tutorial-steps">'+[1,2,3,4].map(n=>tx('step'+n,'div')).join('')+'</div>'+tx('voiceTitle','h3')+'<div class="voice-choices">'+['female','male'].map(g=>'<label><input type="radio" name="voice" value="'+g+'" '+(voicePreference===g?'checked':'')+'><span data-t="'+g+'">'+T(g)+'</span></label>').join('')+'<button class="btn btn-white" id="voice-test" data-t="test">'+T('test')+'</button></div><p class="notice" data-t="voiceNote">'+T('voiceNote')+'</p><p id="voice-status" role="status"></p><button class="btn btn-red" id="start" data-t="start">'+T('start')+'</button>';
 if(type==='success')html+=tx('successText')+'<div class="benefits">'+[1,2,3].map(n=>tx('benefit'+n,'div')).join('')+'</div><button class="btn btn-red" id="buy" data-t="continue">'+T('continue')+'</button><button class="btn btn-white" id="later" data-t="later">'+T('later')+'</button>'+tx('priceNote');
 if(type==='cart')html+=tx('productDemo')+'<div class="cartitem"><b lang="en">Parts of the Body</b>'+tx('quantity','span')+'<strong>$1.00 USD</strong></div><div class="total">'+tx('total','span')+'<strong>$1.00 USD</strong></div>'+tx('priceNote')+'<button class="btn btn-red" id="next" data-t="formAction">'+T('formAction')+'</button><button class="btn btn-white" id="back" data-t="backCart">'+T('backCart')+'</button>';
 if(type==='form')html+=tx('formNote')+'<div class="fields">'+['name','email','country','language','message'].map(k=>'<label><span data-t="'+k+'">'+T(k)+'</span><input disabled type="'+(k==='email'?'email':'text')+'"></label>').join('')+'</div>'+tx('priceNote')+'<button class="btn btn-red" disabled data-t="sendDisabled">'+T('sendDisabled')+'</button><button class="btn btn-white" id="back" data-t="backCart">'+T('backCart')+'</button>';
 dialog(html,type);
 if(type==='tutorial'){document.querySelectorAll('input[name="voice"]').forEach(r=>r.onchange=()=>{stopSpeech();voicePreference=r.value;refreshVoices()});$('voice-test').onclick=()=>speak('Hello! Let us learn English.');$('start').onclick=closeModal;}
 if(type==='success'){$('buy').onclick=()=>openModal('cart');$('later').onclick=closeModal;}
 if(type==='cart'){$('next').onclick=()=>openModal('form');$('back').onclick=closeModal;}
 if(type==='form')$('back').onclick=()=>openModal('cart');
}
function setBackgroundInert(on){
 document.documentElement.classList.toggle('modal-open',on);
 document.querySelectorAll('body>header,body>main,body>.intro,body>footer,body>[data-ui="demo"]').forEach(e=>e.inert=on);
}
function closeModal(){$('overlay').classList.remove('open');modalName='';setBackgroundInert(false);returnFocus?.focus()}
$('close').onclick=closeModal;
$('body-language').addEventListener('change',e=>window.LXL.setLang(e.target.value));
document.addEventListener('lxl-language-change',updateBodyLocale);
$('overlay').onclick=e=>{if(e.target===$('overlay'))closeModal()};document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modalName)closeModal();if(e.key==='Tab'&&modalName){const b=[...$('dialog').querySelectorAll('button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href]')],first=b[0],last=b.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});
$('reset').onclick=reset;$('preview').onclick=()=>openModal('cart');$('reopen-tutorial').onclick=()=>openModal('tutorial');
// Prevent an ordinary click after a drag from accidentally selecting the word.
document.addEventListener('click',e=>{if(skipClick){e.stopPropagation();e.preventDefault();skipClick=false}},true);
window.LXLAudio.onVoicesChanged(refreshVoices);refreshVoices();
window.LXLAudio.onError(error=>{const status=$('effect-status');status.hidden=false;status.dataset.audioError=error.code;status.textContent=T(error.code)});
render();updateBodyLocale();
// A first-time visitor selects an instruction language before beginning.
function showLanguageWelcome(){
 const layer=document.createElement('div');layer.className='language-welcome';layer.setAttribute('role','dialog');layer.setAttribute('aria-modal','true');layer.setAttribute('aria-labelledby','lang-welcome-title');
 layer.innerHTML=`<section class="language-welcome-panel"><h2 id="lang-welcome-title"></h2><p id="lang-welcome-help"></p><label for="welcome-language">🌐</label><select id="welcome-language"><option value="en">English</option><option value="zh-CN">简体中文</option><option value="fr">Français</option><option value="pt">Português</option><option value="es">Español</option></select><button type="button" id="welcome-go" class="btn btn-red"></button></section>`;
 document.body.append(layer);setBackgroundInert(true);const sel=layer.querySelector('#welcome-language');sel.value=window.LXL.lang;
 const draw=()=>{layer.querySelector('label').textContent=T('language');layer.querySelector('#lang-welcome-title').textContent=T('pick');layer.querySelector('#lang-welcome-help').textContent=T('pickHelp');layer.querySelector('#welcome-go').textContent=T('continue')};draw();
 sel.addEventListener('change',()=>{window.LXL.setLang(sel.value);draw()});
 layer.querySelector('#welcome-go').addEventListener('click',()=>{layer.remove();openModal('tutorial')});layer.addEventListener('keydown',e=>{if(e.key==='Tab'){const first=sel,last=layer.querySelector('#welcome-go');if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}}});sel.focus();
}
showLanguageWelcome();
