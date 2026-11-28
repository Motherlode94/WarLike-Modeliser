import * as THREE from 'three';
export function edgeSlide(g,ids,factor){
 if(ids.length!==2||ids[0]===ids[1]||!Number.isFinite(factor)||Math.abs(factor)>.9)throw Error('Arête ou facteur invalide.');
 const p=g.attributes.position,u=g.attributes.uv,idx=g.index?Array.from(g.index.array):Array.from({length:p.count},(_,i)=>i),[a,b]=ids;
 if(!ids.every(i=>Number.isInteger(i)&&i>=0&&i<p.count))throw Error('Sommet invalide.');
 const neighbors=new Map([[a,new Set()],[b,new Set()]]);let found=false;
 for(let i=0;i<idx.length;i+=3){const tri=idx.slice(i,i+3);if(tri.includes(a)&&tri.includes(b))found=true;for(const v of ids)if(tri.includes(v))for(const j of tri)if(j!==a&&j!==b)neighbors.get(v).add(j)}
 if(!found||ids.some(v=>!neighbors.get(v).size))throw Error('Arête sans voisinage.');
 const next=g.clone(),np=next.attributes.position,nu=next.attributes.uv;
 for(const v of ids){const origin=new THREE.Vector3().fromBufferAttribute(p,v),center=new THREE.Vector3(),uv=new THREE.Vector2(),ns=[...neighbors.get(v)];for(const j of ns){center.add(new THREE.Vector3().fromBufferAttribute(p,j));if(u)uv.add(new THREE.Vector2().fromBufferAttribute(u,j))}origin.lerp(center.multiplyScalar(1/ns.length),factor);np.setXYZ(v,...origin.toArray());if(u){const q=new THREE.Vector2().fromBufferAttribute(u,v).lerp(uv.multiplyScalar(1/ns.length),factor);nu.setXY(v,...q.toArray())}}
 np.needsUpdate=true;if(nu)nu.needsUpdate=true;next.computeVertexNormals();next.computeBoundingBox();next.computeBoundingSphere();return next
}
