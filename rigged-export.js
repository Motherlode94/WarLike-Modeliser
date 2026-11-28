import * as THREE from 'three';
import {boneTracks} from './bone-keyframes.js';

import {buildSkinnedMesh} from './skin-core.js';
export function prepareRiggedExport(source){
 const group=new THREE.Group(),resources=[],tracks=[];
 try{for(const o of source.children){let m;if(o.userData.rig?.length>=2){const r=buildSkinnedMesh(o,o.userData.rig);m=r.mesh;tracks.push(...boneTracks(r.bones,o.userData.boneKeys));resources.push(()=>{m.geometry.dispose();m.material.dispose();m.skeleton.dispose()})}else{m=o.clone(false)}
 m.name=o.name;m.position.copy(o.position);m.quaternion.copy(o.quaternion);m.scale.copy(o.scale);m.userData={};group.add(m);
 const keys=o.userData.keyframes||[];if(keys.length){const times=keys.map(k=>k.time);tracks.push(new THREE.VectorKeyframeTrack(m.uuid+'.position',times,keys.flatMap(k=>k.position)),new THREE.VectorKeyframeTrack(m.uuid+'.scale',times,keys.flatMap(k=>k.scale)),new THREE.QuaternionKeyframeTrack(m.uuid+'.quaternion',times,keys.flatMap(k=>new THREE.Quaternion().setFromEuler(new THREE.Euler(...k.rotation)).toArray())))}
 }group.updateMatrixWorld(true);for(const m of group.children)if(m.isSkinnedMesh)m.bind(m.skeleton,m.matrixWorld);return {group,animations:tracks.length?[new THREE.AnimationClip('WarLike Animation',-1,tracks)]:[],dispose(){for(const fn of resources)fn()}}}catch(e){for(const fn of resources)fn();throw e}
}
