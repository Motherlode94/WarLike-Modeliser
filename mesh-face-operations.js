import * as THREE from 'three';
// The cap receives interpolated UVs for inset or copied UVs for extrusion.
// Existing vertices/UVs remain unchanged. Extrusion side UVs require separate unwrapping.
export function faceOperation(g,ids,mode,amount){
 if(!['inset','extrude'].includes(mode)||!Array.isArray(ids)||ids.length!==3||new Set(ids).size!==3||!Number.isFinite(amount)||(mode==='inset'?(amount<=0||amount>=1):(Math.abs(amount)<1e-6||Math.abs(amount)>100)))throw Error('Paramètres de face invalides.');
 const p=g.attributes.position,u=g.attributes.uv,indices=g.index?Array.from(g.index.array):Array.from({length:p.count},(_,i)=>i);
 if(p.count+3>100000||indices.length+18>600000)throw Error('Budget de géométrie dépassé.');
 let at=-1;for(let i=0;i<indices.length;i+=3)if(indices.slice(i,i+3).every(j=>ids.includes(j))){at=i;break}if(at<0)throw Error('Face introuvable.');
 const order=indices.slice(at,at+3),v=order.map(i=>new THREE.Vector3().fromBufferAttribute(p,i)),normal=v[1].clone().sub(v[0]).cross(v[2].clone().sub(v[0]));
 if(normal.lengthSq()<1e-20)throw Error('Face dégénérée.');normal.normalize();
 const center=v[0].clone().add(v[1]).add(v[2]).multiplyScalar(1/3),positions=Array.from(p.array),uv=u?Array.from(u.array):null,start=p.count;
 const cu=u?order.reduce((s,i)=>s+u.getX(i),0)/3:0,cv=u?order.reduce((s,i)=>s+u.getY(i),0)/3:0;
 for(let j=0;j<3;j++){const next=mode==='inset'?v[j].clone().lerp(center,amount):v[j].clone().addScaledVector(normal,amount);positions.push(...next.toArray());if(uv){const i=order[j],a=mode==='inset'?amount:0;uv.push(u.getX(i)*(1-a)+cu*a,u.getY(i)*(1-a)+cv*a)}}
 indices.splice(at,3,start,start+1,start+2);
 for(let j=0;j<3;j++){const k=(j+1)%3;indices.push(order[j],order[k],start+k,order[j],start+k,start+j)}
 const next=new THREE.BufferGeometry();next.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));if(uv)next.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));next.setIndex(indices);next.computeVertexNormals();next.computeBoundingBox();next.computeBoundingSphere();return {geometry:next,selection:[start,start+1,start+2]};
}
