import * as THREE from 'three';
export function buildSkinnedMesh(source,rig){
 if(!rig||rig.length<2)throw Error('Crée une armature avant le skinning.');
 const geometry=source.geometry.clone(),p=geometry.attributes.position,mesh=new THREE.SkinnedMesh(geometry,source.material.clone()),bones=[];
 for(const data of rig){const b=new THREE.Bone();b.name=data.name;b.position.fromArray(data.position);b.rotation.set(...data.rotation);if(bones.length)bones.at(-1).add(b);else mesh.add(b);bones.push(b)}
 mesh.updateMatrixWorld(true);const points=bones.map(b=>b.getWorldPosition(new THREE.Vector3())),indices=[],weights=[];
 for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i),near=points.map((q,j)=>[j,1/Math.max(1e-5,v.distanceToSquared(q))]).sort((a,b)=>b[1]-a[1]).slice(0,4),sum=near.reduce((s,x)=>s+x[1],0);for(let k=0;k<4;k++){indices.push(near[k]?.[0]||0);weights.push((near[k]?.[1]||0)/sum)}}
 geometry.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(indices,4));geometry.setAttribute('skinWeight',new THREE.Float32BufferAttribute(weights,4));mesh.bind(new THREE.Skeleton(bones));return {mesh,bones};
}
