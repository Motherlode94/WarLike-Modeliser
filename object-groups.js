import * as THREE from 'three';
export function bindObjectGroups({group,getSelected,checkpoint,refresh,notify}){
 const list=document.getElementById('objectGroupList'),name=document.getElementById('objectGroupName');
 function render(){const names=[...new Set(group.children.map(o=>o.userData.collection).filter(Boolean))].sort();const selected=list.value;list.replaceChildren(new Option('Tous les groupes',''));for(const n of names)list.add(new Option(n,n));if(names.includes(selected))list.value=selected}
 document.getElementById('objectGroupAssign').onclick=()=>{const o=getSelected(),value=name.value.trim().slice(0,80);if(!o||!value)return notify('Sélectionne un objet et saisis un nom de groupe.');checkpoint();o.userData.collection=value;render();refresh()};
 document.getElementById('objectGroupRemove').onclick=()=>{const o=getSelected();if(!o?.userData.collection)return;checkpoint();delete o.userData.collection;render();refresh()};
 document.getElementById('objectGroupMove').onclick=()=>{const n=list.value,objects=group.children.filter(o=>o.userData.collection===n),d=['X','Y','Z'].map(a=>Number(document.getElementById('objectGroupDelta'+a).value));if(!n||!objects.length||!d.every(v=>Number.isFinite(v)&&Math.abs(v)<=1000))return notify('Sélectionne un groupe et un déplacement valide.');checkpoint();const delta=new THREE.Vector3(...d);for(const o of objects)o.position.add(delta);refresh();notify(objects.length+' objets déplacés.')};
 return {render};
}
