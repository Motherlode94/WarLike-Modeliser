import * as THREE from 'three';
import {validRig,parentIndex} from './rig-guide.js';
export function solvePoseIK(rig,pose,tip,target,{iterations=32,tolerance=.001}={}){
 if(!validRig(rig)||!rig||!Array.isArray(pose)||pose.length!==rig.length||!pose.every(v=>Array.isArray(v)&&v.length===3&&v.every(Number.isFinite))||!Number.isInteger(tip)||tip<=0||tip>=rig.length||!Array.isArray(target)||target.length!==3||!target.every(Number.isFinite))throw Error('Paramètres IK invalides.');
 const root=new THREE.Group(),bones=[];for(let i=0;i<rig.length;i++){const b=new THREE.Bone();b.position.fromArray(rig[i].position);b.rotation.set(...pose[i]);(i===0?root:bones[parentIndex(rig,i)]).add(b);bones.push(b)}
 const chain=[];for(let i=parentIndex(rig,tip);i>=0;i=parentIndex(rig,i))chain.push(i);
 const goal=new THREE.Vector3().fromArray(target),end=new THREE.Vector3(),pivot=new THREE.Vector3(),a=new THREE.Vector3(),b=new THREE.Vector3(),world=new THREE.Quaternion(),parent=new THREE.Quaternion(),delta=new THREE.Quaternion();
 for(let step=0;step<Math.min(64,Math.max(1,iterations));step++){root.updateMatrixWorld(true);if(bones[tip].getWorldPosition(end).distanceTo(goal)<=tolerance)break;for(const i of chain){const joint=bones[i];joint.getWorldPosition(pivot);bones[tip].getWorldPosition(end);a.copy(end).sub(pivot);b.copy(goal).sub(pivot);if(a.lengthSq()<1e-12||b.lengthSq()<1e-12)continue;delta.setFromUnitVectors(a.normalize(),b.normalize());joint.getWorldQuaternion(world);joint.parent.getWorldQuaternion(parent);joint.quaternion.copy(parent.invert().multiply(delta).multiply(world));root.updateMatrixWorld(true)}}
 const distance=bones[tip].getWorldPosition(end).distanceTo(goal);return {pose:bones.map(x=>[x.rotation.x,x.rotation.y,x.rotation.z]),distance};
}
