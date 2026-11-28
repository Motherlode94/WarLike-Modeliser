import * as THREE from 'three';
export function splitSelectedEdges(g,ids){
 if(!Array.isArray(ids)||ids.length!==2||ids[0]===ids[1])throw Error('Sélectionne une arête.');
 const p=g.attributes.position,u=g.attributes.uv,idx=g.index?Array.from(g.index.array):Array.from({length:p.count},(_,i)=>i);
 const key=(a,b)=>a<b?a+':'+b:b+':'+a;
 const edges=new Map(),inc=new Map();
 for(let i=0;i<idx.length;i+=3){const tri=idx.slice(i,i+3);for(let j=0;j<3;j++){const a=tri[j],b=tri[(j+1)%3],k=key(a,b);if(!inc.has(k))inc.set(k,[]);inc.get(k).push(tri)}}
 const start=key(...ids);if(!inc.has(start))throw Error('Arête introuvable.');
 // Follow a strip of triangles by crossing the edge opposite the smallest turn.
 // This is a local refinement strip, not a quad-based Blender loop cut.
 const chosen=new Set([start]);let frontier=[start];
 for(let step=0;step<3;step++){const next=[];for(const k of frontier){const [a,b]=k.split(':').map(Number);for(const tri of inc.get(k)||[]){const c=tri.find(v=>v!==a&&v!==b);if(c===undefined)continue;const A=new THREE.Vector3().fromBufferAttribute(p,a),B=new THREE.Vector3().fromBufferAttribute(p,b),C=new THREE.Vector3().fromBufferAttribute(p,c);const candidate=key(c,A.distanceToSquared(C)>=B.distanceToSquared(C)?a:b);if(!chosen.has(candidate)){chosen.add(candidate);next.push(candidate)}}}frontier=next;if(!frontier.length)break}
 const pos=Array.from(p.array),uv=u?Array.from(u.array):null,out=[];
 function mid(a,b){const k=key(a,b);if(edges.has(k))return edges.get(k);const n=pos.length/3;pos.push((p.getX(a)+p.getX(b))/2,(p.getY(a)+p.getY(b))/2,(p.getZ(a)+p.getZ(b))/2);if(u)uv.push((u.getX(a)+u.getX(b))/2,(u.getY(a)+u.getY(b))/2);edges.set(k,n);return n}
 for(let i=0;i<idx.length;i+=3){const [a,b,c]=idx.slice(i,i+3);const ab=chosen.has(key(a,b)),bc=chosen.has(key(b,c)),ca=chosen.has(key(c,a));const n=+ab + +bc + +ca;
 if(!n){out.push(a,b,c);continue}
 if(n===3){const x=mid(a,b),y=mid(b,c),z=mid(c,a);out.push(a,x,z,x,b,y,z,y,c,x,y,z);continue}
 if(n===1){if(ab){const x=mid(a,b);out.push(a,x,c,x,b,c)}else if(bc){const x=mid(b,c);out.push(b,x,a,x,c,a)}else{const x=mid(c,a);out.push(c,x,b,x,a,b)}continue}
 // Two selected edges share a vertex; rotate the triangle so the common vertex is B.
 const v=ab&&bc?[a,b,c]:bc&&ca?[b,c,a]:[c,a,b];const [q,r,s]=v,x=mid(q,r),y=mid(r,s);out.push(q,x,s,x,y,s,x,r,y)
 }
 if(pos.length>300000||out.length>600000)throw Error('Budget géométrique dépassé.');
 const next=new THREE.BufferGeometry();next.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));if(uv)next.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));next.setIndex(out);next.computeVertexNormals();next.computeBoundingBox();next.computeBoundingSphere();return {geometry:next,selection:[edges.get(start)],edgeCount:chosen.size};
}
