import * as THREE from 'three';
export function validWeights(data,count,bones){return data==null||!!data&&Array.isArray(data.indices)&&Array.isArray(data.weights)&&data.indices.length===count*4&&data.weights.length===count*4&&data.indices.every(i=>Number.isInteger(i)&&i>=0&&i<bones)&&data.weights.every(v=>Number.isFinite(v)&&v>=0&&v<=1)&&data.weights.every((v,i)=>i%4!==0||Math.abs(data.weights.slice(i,i+4).reduce((a,b)=>a+b,0)-1)<1e-4)}
export function assignVertexWeight(data,vertex,bone,value){const start=vertex*4,entries=new Map();for(let i=0;i<4;i++){const k=data.indices[start+i],v=data.weights[start+i];if(k!==bone&&v>0)entries.set(k,(entries.get(k)||0)+v)}const others=[...entries].sort((a,b)=>b[1]-a[1]).slice(0,3),sum=others.reduce((a,b)=>a+b[1],0),target=sum?value:1,all=[[bone,target],...others.map(([k,v])=>[k,v/sum*(1-target)])];for(let i=0;i<4;i++){data.indices[start+i]=all[i]?.[0]||0;data.weights[start+i]=all[i]?.[1]||0}return data}
export function buildSkinnedMesh(source,rig){
 if(!rig||rig.length<2)throw Error('Crée une armature avant le skinning.');
 const geometry=source.geometry.clone(),p=geometry.attributes.position,mesh=new THREE.SkinnedMesh(geometry,source.material.clone()),bones=[];
 for(const data of rig){const b=new THREE.Bone();b.name=data.name;b.position.fromArray(data.position);b.rotation.set(...data.rotation);if(bones.length)bones.at(-1).add(b);else mesh.add(b);bones.push(b)}
 mesh.updateMatrixWorld(true);const points=bones.map(b=>b.getWorldPosition(new THREE.Vector3())),indices=[],weights=[];
 for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i),near=points.map((q,j)=>[j,1/Math.max(1e-5,v.distanceToSquared(q))]).sort((a,b)=>b[1]-a[1]).slice(0,4),sum=near.reduce((s,x)=>s+x[1],0);for(let k=0;k<4;k++){indices.push(near[k]?.[0]||0);weights.push((near[k]?.[1]||0)/sum)}}
 const saved=source.userData.skinWeights,use=saved&&validWeights(saved,p.count,bones.length);geometry.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(use?saved.indices:indices,4));geometry.setAttribute('skinWeight',new THREE.Float32BufferAttribute(use?saved.weights:weights,4));mesh.bind(new THREE.Skeleton(bones));return {mesh,bones};
}
