import * as THREE from 'three';
// Chamfer one interior edge of a consistently wound indexed triangular surface.
export function bevelEdge(g,ids,fraction){
 if(!g.index||ids.length!==2||ids[0]===ids[1]||!Number.isFinite(fraction)||fraction<=0||fraction>=.49)throw Error('Arête indexée et largeur entre 0 et 0.49 requises.');
 const p=g.attributes.position,u=g.attributes.uv,[a,b]=ids,idx=Array.from(g.index.array);if(ids.some(i=>!Number.isInteger(i)||i<0||i>=p.count))throw Error('Sommet invalide.');
 const faces=[];for(let i=0;i<idx.length;i+=3){const t=idx.slice(i,i+3);for(let k=0;k<3;k++)if(t[k]===a&&t[(k+1)%3]===b||t[k]===b&&t[(k+1)%3]===a)faces.push({offset:i,a:t[k],b:t[(k+1)%3],c:t[(k+2)%3]})}
 if(faces.length!==2||faces[0].a!==faces[1].b)throw Error('Arête intérieure manifold et orientation cohérente requises.');
 const pos=Array.from(p.array),uv=u?Array.from(u.array):null;
 function cut(i,j){const v=new THREE.Vector3().fromBufferAttribute(p,i).lerp(new THREE.Vector3().fromBufferAttribute(p,j),fraction),n=pos.length/3;pos.push(...v.toArray());if(u){const t=new THREE.Vector2().fromBufferAttribute(u,i).lerp(new THREE.Vector2().fromBufferAttribute(u,j),fraction);uv.push(...t.toArray())}return n}
 // Split the four surrounding edges in all adjacent faces to avoid T junctions.
 const cuts=new Map();function edgeCut(i,j){const key=i+':'+j;if(!cuts.has(key))cuts.set(key,cut(i,j));return cuts.get(key)}
 for(const f of faces){f.x=edgeCut(f.a,f.c);f.y=edgeCut(f.b,f.c)}
 const out=[];for(let i=0;i<idx.length;i+=3){const f=faces.find(v=>v.offset===i);if(f){out.push(f.x,f.y,f.c);continue}const t=idx.slice(i,i+3),ring=[];for(let k=0;k<3;k++){const x=t[k],y=t[(k+1)%3];ring.push(x);if(cuts.has(x+':'+y))ring.push(cuts.get(x+':'+y));if(cuts.has(y+':'+x))ring.push(cuts.get(y+':'+x))}if(ring.length===3){out.push(...ring);continue}const n=pos.length/3;const center=new THREE.Vector3();for(const v of t)center.add(new THREE.Vector3().fromBufferAttribute(p,v));pos.push(...center.multiplyScalar(1/3).toArray());if(u){const st=new THREE.Vector2();for(const v of t)st.add(new THREE.Vector2().fromBufferAttribute(u,v));uv.push(...st.multiplyScalar(1/3).toArray())}for(let k=0;k<ring.length;k++)out.push(n,ring[k],ring[(k+1)%ring.length])}
 const [f,h]=faces;out.push(f.x,h.y,h.x,f.x,h.x,f.y, f.x,f.a,h.y, f.y,h.x,f.b);
 const next=new THREE.BufferGeometry();next.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));if(uv)next.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));next.setIndex(out);next.computeVertexNormals();next.computeBoundingBox();next.computeBoundingSphere();return next;
}
