import * as THREE from 'three';
export function buildSkinnedMesh(source,rig){
 if(!rig||rig.length<2)throw Error('Crée une armature avant le skinning.');
 const geometry=source.geometry.clone(),p=geometry.attributes.position,mesh=new THREE.SkinnedMesh(geometry,source.material.clone()),bones=[];
 for(const data of rig){const b=new THREE.Bone();b.name=data.name;b.position.fromArray(data.position);b.rotation.set(...data.rotation);if(bones.length)bones.at(-1).add(b);else mesh.add(b);bones.push(b)}
 mesh.updateMatrixWorld(true);const points=bones.map(b=>b.getWorldPosition(new THREE.Vector3())),indices=[],weights=[];
 for(let i=0;i<p.count;i++){const v=new THREE.Vector3().fromBufferAttribute(p,i),near=points.map((q,j)=>[j,1/Math.max(1e-5,v.distanceToSquared(q))]).sort((a,b)=>b[1]-a[1]).slice(0,4),sum=near.reduce((s,x)=>s+x[1],0);for(let k=0;k<4;k++){indices.push(near[k]?.[0]||0);weights.push((near[k]?.[1]||0)/sum)}}
 geometry.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(indices,4));geometry.setAttribute('skinWeight',new THREE.Float32BufferAttribute(weights,4));mesh.bind(new THREE.Skeleton(bones));return {mesh,bones};
}
export function bindSkinPreview({scene,getSelected,notify}){
 const panel=document.createElement('details');panel.innerHTML='<summary>Armature · Skinning test</summary><button type="button" class="full">Tester la déformation</button><label>Bone<select></select></label><label>Rotation Z<input type="range" min="-90" max="90" value="0"></label><button type="button" class="full">Fermer aperçu</button><p>Poids automatiques normalisés, aperçu temporaire. Pas de peinture manuelle ni de sauvegarde des poids.</p>';document.getElementById('nativeModelInspector').append(panel);
 const [show,close]=panel.querySelectorAll('button'),select=panel.querySelector('select'),angle=panel.querySelector('input');let item=null;
 function clear(){if(!item)return;scene.remove(item.mesh);item.mesh.geometry.dispose();item.mesh.material.dispose();item.mesh.skeleton.dispose();item=null;select.replaceChildren()}
 show.onclick=()=>{clear();const o=getSelected();if(!o)return;try{item=buildSkinnedMesh(o,o.userData.rig);item.mesh.position.copy(o.position);item.mesh.position.x+=2;item.mesh.quaternion.copy(o.quaternion);item.mesh.scale.copy(o.scale);scene.add(item.mesh);item.rest=item.bones.map(b=>b.rotation.z);item.bones.forEach((b,i)=>select.add(new Option(b.name,String(i))));angle.value='0';notify('Aperçu skinné à côté du modèle source.')}catch(e){notify(e.message)}};
 select.onchange=()=>{if(item)angle.value=String(THREE.MathUtils.radToDeg(item.bones[+select.value].rotation.z-item.rest[+select.value]))};angle.oninput=()=>{if(item)item.bones[+select.value].rotation.z=item.rest[+select.value]+THREE.MathUtils.degToRad(+angle.value)};close.onclick=clear;return {clear};
}