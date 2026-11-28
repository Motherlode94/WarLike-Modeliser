import * as THREE from 'three';
const EPS=1e-6;
class Polygon {
 constructor(v){this.v=v;this.n=v[1].p.clone().sub(v[0].p).cross(v[2].p.clone().sub(v[0].p)).normalize();this.w=this.n.dot(v[0].p)}
 flip(){this.v.reverse();this.n.negate();this.w=-this.w}
}
function split(plane,p,cf,cb,f,b){
 const ts=p.v.map(v=>{const d=plane.n.dot(v.p)-plane.w;return d>EPS?1:d<-EPS?2:0}),type=ts.reduce((a,x)=>a|x,0);
 if(type===0){(plane.n.dot(p.n)>0?cf:cb).push(p);return}if(type===1){f.push(p);return}if(type===2){b.push(p);return}
 const fv=[],bv=[];for(let i=0;i<p.v.length;i++){const j=(i+1)%p.v.length,a=p.v[i],z=p.v[j],ti=ts[i],tj=ts[j];if(ti!==2)fv.push(a);if(ti!==1)bv.push(a);if((ti|tj)===3){const t=(plane.w-plane.n.dot(a.p))/plane.n.dot(z.p.clone().sub(a.p)),v={p:a.p.clone().lerp(z.p,t),uv:a.uv.clone().lerp(z.uv,t)};fv.push(v);bv.push(v)}}
 for(const [verts,out] of [[fv,f],[bv,b]])if(verts.length>=3){const q=new Polygon(verts);if(q.n.lengthSq()>.5)out.push(q)}
}
class Node{
 constructor(p=[],budget,depth=0){this.p=[];this.plane=null;this.f=null;this.b=null;this.budget=budget;if(p.length)this.build(p,depth)}
 build(p,depth=0){if(!p.length)return;if(depth>180||(this.budget.n+=p.length)>150000)throw Error('Solide trop complexe pour le budget Boolean.');if(!this.plane)this.plane={n:p[0].n.clone(),w:p[0].w};const f=[],b=[];for(const q of p)split(this.plane,q,this.p,this.p,f,b);if(f.length){this.f||=new Node([],this.budget);this.f.build(f,depth+1)}if(b.length){this.b||=new Node([],this.budget);this.b.build(b,depth+1)}}
 invert(){for(const p of this.p)p.flip();if(this.plane){this.plane.n.negate();this.plane.w=-this.plane.w}this.f?.invert();this.b?.invert();[this.f,this.b]=[this.b,this.f]}
 clip(p){if(!this.plane)return p.slice();if((this.budget.n+=p.length)>150000)throw Error('Budget Boolean dépassé.');let f=[],b=[];for(const q of p)split(this.plane,q,f,b,f,b);if(this.f)f=this.f.clip(f);b=this.b?this.b.clip(b):[];return f.concat(b)}
 clipTo(n){this.p=n.clip(this.p);this.f?.clipTo(n);this.b?.clipTo(n)}
 all(){return this.p.concat(this.f?.all()||[],this.b?.all()||[])}
}
function polygons(mesh,space){
 mesh.updateWorldMatrix(true,false);const m=space.clone().multiply(mesh.matrixWorld),g=mesh.geometry,p=g.attributes.position,u=g.attributes.uv,idx=g.index?Array.from(g.index.array):Array.from({length:p.count},(_,i)=>i);if(idx.length>12000)throw Error('4000 triangles maximum par opérande.');const out=[];
 for(let i=0;i<idx.length;i+=3){let ids=idx.slice(i,i+3);if(m.determinant()<0)ids.reverse();const q=new Polygon(ids.map(j=>({p:new THREE.Vector3().fromBufferAttribute(p,j).applyMatrix4(m),uv:u?new THREE.Vector2().fromBufferAttribute(u,j):new THREE.Vector2()})));if(q.n.lengthSq()>.5)out.push(q)}return out
}
export function booleanGeometry(a,b,mode){
 if(!['union','difference','intersection'].includes(mode))throw Error('Opération inconnue.');a.updateWorldMatrix(true,false);const inv=a.matrixWorld.clone().invert(),budget={n:0},A=new Node(polygons(a,inv),budget),B=new Node(polygons(b,inv),budget);
 if(mode==='union'){A.clipTo(B);B.clipTo(A);B.invert();B.clipTo(A);B.invert();A.build(B.all())}
 else if(mode==='difference'){A.invert();A.clipTo(B);B.clipTo(A);B.invert();B.clipTo(A);B.invert();A.build(B.all());A.invert()}
 else{A.invert();B.clipTo(A);B.invert();A.clipTo(B);B.clipTo(A);A.build(B.all());A.invert()}
 const pos=[],uv=[],indices=[];for(const p of A.all())for(let j=1;j<p.v.length-1;j++){const vs=[p.v[0],p.v[j],p.v[j+1]];if(vs[1].p.clone().sub(vs[0].p).cross(vs[2].p.clone().sub(vs[0].p)).lengthSq()<EPS*EPS)continue;for(const v of vs){indices.push(pos.length/3);pos.push(...v.p.toArray());uv.push(...v.uv.toArray())}if(pos.length>300000)throw Error('Résultat trop grand.')}
 if(!pos.length)throw Error('Résultat vide ; source conservée.');const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();return g
}