import * as THREE from 'three';
import {prepareRiggedExport} from './rigged-export.js';
export function bindRigPlayback({scene,getSelected,notify}){
 const panel=document.createElement('details');panel.innerHTML='<summary>Armature · Lecture animée</summary><button type="button">Lire animation</button><button type="button">Arrêter</button><label>Temps<input type="range" min="0" max="1" step=".01" value="0"></label>';document.getElementById('nativeModelInspector').append(panel);
 const [play,stop]=panel.querySelectorAll('button'),slider=panel.querySelector('input');let prepared=null,mixer=null,frame=0,last=0,running=false,source=null;
 function clear(){running=false;cancelAnimationFrame(frame);if(prepared){mixer.stopAllAction();mixer.uncacheRoot(prepared.group);scene.remove(prepared.group);prepared.dispose();prepared=null;mixer=null}if(source){source.visible=true;source=null}}
 function start(){clear();const o=getSelected();if(!o?.userData.boneKeys?.length)return false;try{prepared=prepareRiggedExport({children:[o]});const clip=prepared.animations[0];if(!clip)throw Error('Aucune animation');scene.add(prepared.group);mixer=new THREE.AnimationMixer(prepared.group);mixer.clipAction(clip).play();slider.max=String(Math.max(.01,clip.duration));slider.value='0';source=o;o.visible=false;return true}catch(e){clear();notify(e.message);return false}}
 function tick(now){if(!running)return;mixer.update(Math.min(.1,(now-last)/1000));last=now;slider.value=String(mixer.time%Number(slider.max));frame=requestAnimationFrame(tick)}
 play.onclick=()=>{if(!start())return notify('Sélectionne un objet avec des clés osseuses.');running=true;last=performance.now();frame=requestAnimationFrame(tick)};stop.onclick=clear;slider.oninput=()=>{const t=Number(slider.value);if(!prepared&&!start())return;running=false;cancelAnimationFrame(frame);mixer.setTime(t);slider.value=String(t)};return {clear};
}
