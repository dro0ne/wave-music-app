const results=[];
function test(name,fn){try{fn();results.push(`PASS ${name}`)}catch(error){results.push(`FAIL ${name}: ${error.message}`)}}
function assert(value,message){if(!value)throw Error(message)}
document.querySelector('#app').addEventListener('load',()=>{
  const doc=document.querySelector('#app').contentDocument;
  const request=new XMLHttpRequest();request.open('GET','../app.js',false);request.send();const source=request.responseText;
  const cssRequest=new XMLHttpRequest();cssRequest.open('GET','../styles.css',false);cssRequest.send();const css=cssRequest.responseText;
  test('one primary wave CTA',()=>assert(doc.querySelectorAll('#waveOrb').length===1&&!doc.querySelector('#start'),'duplicate start CTA'));
  test('mobile navigation has five named destinations',()=>assert(doc.querySelectorAll('[data-mobile-target]').length===5,'mobile destinations missing'));
  test('mini and full player share player bindings',()=>assert(doc.querySelector('#miniPlayer [data-player-title]')&&doc.querySelector('#fullPlayer [data-player-title]')&&source.includes('function renderPlayerUI()'),'shared player renderer missing'));
  test('full player exposes all important actions',()=>['prev','play','next','like','dislike','repeat','queue','share'].forEach(action=>assert(doc.querySelector(`#fullPlayer [data-player-action="${action}"]`),`${action} missing`)));
  test('repeat is persisted without changing scoring',()=>assert(source.includes('state.repeatCurrent')&&source.includes("recordPlayback('ended')"),'repeat state missing'));
  test('queue uses the existing three-position buffer',()=>assert(source.includes('[current(),playbackBuffer.next,playbackBuffer.backupNext]'),'queue is not the preload buffer'));
  test('responsive CSS has four breakpoint groups',()=>assert(css.includes('@media(max-width:1023px)')&&css.includes('@media(max-width:767px)')&&css.includes('@media(max-width:390px)')&&!css.includes('@media(max-width:760px)'),'breakpoints not consolidated'));
  test('safe areas and dynamic viewport are present',()=>assert(css.includes('env(safe-area-inset-bottom)')&&css.includes('env(safe-area-inset-top)')&&css.includes('100dvh'),'mobile viewport protections missing'));
  test('critical controls meet touch target baseline',()=>assert(css.includes('min-width:44px')&&css.includes('min-height:44px'),'44px touch baseline missing'));
  test('reduced motion and fine-pointer hover are present',()=>assert(css.includes('prefers-reduced-motion')&&css.includes('(hover:hover) and (pointer:fine)'),'motion or hover media query missing'));
  const failed=results.filter(x=>x.startsWith('FAIL')).length;document.querySelector('#results').textContent=`${failed?'FAILED':'PASSED'}\n${results.join('\n')}`;document.body.dataset.failed=String(failed);
});
