import * as THREE from 'three';
export function sculptGeometry(geometry,center,normal,mode,radius,strength,delta=new THREE.Vector3()){
 const p=geometry.attributes.position;if(!p||!Number.isFinite(radius)||radius<=0||!Number.isFinite(strength)||!['draw','inflate','smooth','grab'].includes(mode))return false;
 const source=Array.from(p.array),groups=new Map(),keys=[];
 for(let i=0;i<p.count;i++){const k=[source[i*3],source[i*3+1],source[i*3+2]].map(v=>Math.round(v*1e6)).join(':');keys.push(k);let g=groups.get(k);if(!g){g={position:new THREE.Vector3(...source.slice(i*3,i*3+3)),ids:[],neighbors:new Set(),normal:new THREE.Vector3()};groups.set(k,g)}g.ids.push(i)}
 const index=geometry.index,n=index?index.count:p.count;
 for(let i=0;i<n;i+=3){const ids=[0,1,2].map(j=>index?index.getX(i+j):i+j),a=groups.get(keys[ids[0]]),b=groups.get(keys[ids[1]]),c=groups.get(keys[ids[2]]);if(!a||!b||!c)continue;const face=b.position.clone().sub(a.position).cross(c.position.clone().sub(a.position));for(const [g,x,y] of [[a,b,c],[b,c,a],[c,a,b]]){g.normal.add(face);if(x!==g)g.neighbors.add(x);if(y!==g)g.neighbors.add(y)}}
 let changed=false;for(const g of groups.values()){const d=g.position.distanceTo(center);if(d>=radius)continue;const t=1-d/radius,w=t*t*(3-2*t),next=g.position.clone();
 if(mode==='draw')next.addScaledVector(normal,w*strength);
 else if(mode==='inflate')next.addScaledVector(g.normal.clone().normalize(),w*strength);
 else if(mode==='grab')next.addScaledVector(delta,w*strength);
 else if(g.neighbors.size){const avg=new THREE.Vector3();for(const x of g.neighbors)avg.add(x.position);avg.multiplyScalar(1/g.neighbors.size);next.lerp(avg,Math.min(1,Math.abs(strength)*w))}
 if(next.distanceToSquared(g.position)>1e-16){changed=true;for(const i of g.ids)p.setXYZ(i,next.x,next.y,next.z)}
 }if(changed){p.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere()}return changed;
}
