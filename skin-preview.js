import * as THREE from 'three';
import {buildSkinnedMesh} from './skin-core.js';
export {buildSkinnedMesh} from './skin-core.js';
export function bindSkinPreview({scene,getSelected,notify}){
 const panel=document.createElement('details');panel.innerHTML='<summary>Armature · Skinning test</summary><button type="button" class="full">Tester la déformation</button><label>Bone<select></select></label><label>Rotation Z<input type="range" min="-90" max="90" value="0"></label><button type="button" class="full">Fermer aperçu</button><p>Poids automatiques normalisés, aperçu temporaire. Pas de peinture manuelle ni de sauvegarde des poids.</p>';document.getElementById('nativeModelInspector').append(panel);
 const [show,close]=panel.querySelectorAll('button'),select=panel.querySelector('select'),angle=panel.querySelector('input');let item=null;
 function clear(){if(!item)return;scene.remove(item.mesh);item.mesh.geometry.dispose();item.mesh.material.dispose();item.mesh.skeleton.dispose();item=null;select.replaceChildren()}
 show.onclick=()=>{clear();const o=getSelected();if(!o)return;try{item=buildSkinnedMesh(o,o.userData.rig);item.mesh.position.copy(o.position);item.mesh.position.x+=2;item.mesh.quaternion.copy(o.quaternion);item.mesh.scale.copy(o.scale);scene.add(item.mesh);item.rest=item.bones.map(b=>b.rotation.z);item.bones.forEach((b,i)=>select.add(new Option(b.name,String(i))));angle.value='0';notify('Aperçu skinné à côté du modèle source.')}catch(e){notify(e.message)}};
 select.onchange=()=>{if(item)angle.value=String(THREE.MathUtils.radToDeg(item.bones[+select.value].rotation.z-item.rest[+select.value]))};angle.oninput=()=>{if(item)item.bones[+select.value].rotation.z=item.rest[+select.value]+THREE.MathUtils.degToRad(+angle.value)};close.onclick=clear;return {clear};
}