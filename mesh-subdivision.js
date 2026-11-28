import * as THREE from 'three';
export function subdivideTriangles(g){
 const p=g.attributes.position,u=g.attributes.uv,idx=g.index?Array.from(g.index.array):Array.from({length:p.count},(_,i)=>i);
 if(idx.length*4>600000)throw Error('Budget de triangles dépassé.');
 const pos=Array.from(p.array),uv=u?Array.from(u.array):null,edges=new Map(),out=[];
 function mid(a,b){const key=a<b?a+':'+b:b+':'+a;if(edges.has(key))return edges.get(key);const i=pos.length/3;pos.push((p.getX(a)+p.getX(b))/2,(p.getY(a)+p.getY(b))/2,(p.getZ(a)+p.getZ(b))/2);if(uv)uv.push((u.getX(a)+u.getX(b))/2,(u.getY(a)+u.getY(b))/2);edges.set(key,i);return i}
 for(let i=0;i<idx.length;i+=3){const [a,b,c]=idx.slice(i,i+3),ab=mid(a,b),bc=mid(b,c),ca=mid(c,a);out.push(a,ab,ca,ab,b,bc,ca,bc,c,ab,bc,ca)}
 if(pos.length>300000)throw Error('Budget de sommets dépassé.');const next=new THREE.BufferGeometry();next.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));if(uv)next.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));next.setIndex(out);next.computeVertexNormals();next.computeBoundingBox();next.computeBoundingSphere();return next
}
