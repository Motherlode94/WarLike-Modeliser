import * as THREE from 'three';
// Follow opposite edges across pairs of triangles forming nearly coplanar quads.
// Refuse ambiguous pairings instead of cutting arbitrary triangles.
export function cutQuadStrip(g,edge,fraction=.5){
 if(!g.index||edge.length!==2||edge[0]===edge[1]||!Number.isFinite(fraction)||fraction<=.01||fraction>=.99)throw Error('Arête indexée et fraction valide requises.');
 const p=g.attributes.position,u=g.attributes.uv,idx=Array.from(g.index.array),tris=[],edges=new Map(),key=(a,b)=>a<b?a+':'+b:b+':'+a;
 if(edge.some(i=>!Number.isInteger(i)||i<0||i>=p.count))throw Error('Sommet invalide.');
 const v=i=>new THREE.Vector3().fromBufferAttribute(p,i);
 for(let i=0;i<idx.length;i+=3){const t=idx.slice(i,i+3),id=tris.length;tris.push(t);for(let j=0;j<3;j++){const k=key(t[j],t[(j+1)%3]);if(!edges.has(k))edges.set(k,[]);edges.get(k).push(id)}}
 const quads=[],owners=new Map();
 for(const [k,fs] of edges){if(fs.length!==2)continue;const [a,b]=k.split(':').map(Number),t=tris[fs[0]],h=tris[fs[1]],c=t.find(x=>x!==a&&x!==b),d=h.find(x=>x!==a&&x!==b);if(c===undefined||d===undefined||c===d)continue;const va=v(a),vb=v(b),vc=v(c),vd=v(d),diag=va.distanceTo(vb),other=vc.distanceTo(vd);if(diag<1e-8||Math.abs(diag-other)>diag*.03||va.clone().add(vb).distanceTo(vc.clone().add(vd))>diag*.03)continue;
 const n1=vb.clone().sub(va).cross(vc.clone().sub(va)).normalize(),n2=vb.clone().sub(va).cross(vd.clone().sub(va)).normalize();if(n1.dot(n2)>-.999)continue;
 const ring=[];let j=t.indexOf(a);if(t[(j+1)%3]===b)ring.push(a,d,b,c);else ring.push(a,c,b,d);
 const q={ring,fs};quads.push(q);for(const f of fs){if(!owners.has(f))owners.set(f,[]);owners.get(f).push(q)}}
 const valid=quads.filter(q=>q.fs.every(f=>owners.get(f).length===1)),byEdge=new Map();
 for(const q of valid)for(let i=0;i<4;i++){const k=key(q.ring[i],q.ring[(i+1)%4]);if(!byEdge.has(k))byEdge.set(k,[]);byEdge.get(k).push(q)}
 const todo=[edge],cuts=new Map(),visited=new Map(),pos=Array.from(p.array),uv=u?Array.from(u.array):null;
 function point(a,b){const k=key(a,b);if(cuts.has(k))return cuts.get(k).index;const index=pos.length/3;pos.push(...v(a).lerp(v(b),fraction).toArray());if(u)uv.push(...new THREE.Vector2().fromBufferAttribute(u,a).lerp(new THREE.Vector2().fromBufferAttribute(u,b),fraction).toArray());cuts.set(k,{index,a,b});return index}
 while(todo.length){const [a,b]=todo.pop(),k=key(a,b);point(a,b);for(const q of byEdge.get(k)||[]){const r=q.ring,i=r.findIndex((x,j)=>key(x,r[(j+1)%4])===k);if(i<0)continue;const x=r[i],y=r[(i+1)%4],z=r[(i+2)%4],t=r[(i+3)%4],opp=x===a?[t,z]:[z,t];if(visited.has(q)){if(visited.get(q).axis!==i%2)throw Error('Boucle ambiguë.');continue}visited.set(q,{axis:i%2,ring:[x,y,z,t],entry:k,exit:key(...opp)});todo.push(opp)}if(visited.size>10000)throw Error('Bande trop grande.')}
 if(!visited.size)throw Error('Aucun quadrilatère rectangulaire non ambigu trouvé.');
 const used=new Set(),out=[];for(const [q,s] of visited){q.fs.forEach(f=>used.add(f));const [a,b,c,d]=s.ring,x=cuts.get(s.entry).index,y=cuts.get(s.exit).index;out.push(a,x,y,a,y,d,x,b,c,x,c,y)}
 for(let i=0;i<tris.length;i++){if(used.has(i))continue;const t=tris[i],ring=[];for(let j=0;j<3;j++){ring.push(t[j]);const k=key(t[j],t[(j+1)%3]);if(cuts.has(k))ring.push(cuts.get(k).index)}if(ring.length===3){out.push(...t);continue}const n=pos.length/3,center=v(t[0]).add(v(t[1])).add(v(t[2])).multiplyScalar(1/3);pos.push(...center.toArray());if(u){const st=new THREE.Vector2();for(const x of t)st.add(new THREE.Vector2().fromBufferAttribute(u,x));uv.push(...st.multiplyScalar(1/3).toArray())}for(let j=0;j<ring.length;j++)out.push(n,ring[j],ring[(j+1)%ring.length])}
 const next=new THREE.BufferGeometry();next.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));if(uv)next.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));next.setIndex(out);next.computeVertexNormals();next.computeBoundingBox();next.computeBoundingSphere();return {geometry:next,count:visited.size};
}
