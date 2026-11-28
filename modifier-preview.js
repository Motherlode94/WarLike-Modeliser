import * as THREE from 'three';
import {subdivideTriangles} from './mesh-subdivision.js';
export function bindModifierPreview({scene,getSelected,checkpoint,refresh,notify}){
 const panel=document.createElement('details');panel.innerHTML='<summary>Modificateur · Subdivision</summary><button type="button" class="full">Prévisualiser</button><button type="button" class="full">Annuler aperçu</button><button type="button" class="full">Appliquer</button><p>Le résultat temporaire est superposé en filaire, sans modifier le maillage source.</p>';document.getElementById('nativeModelInspector').append(panel);
 const [show,cancel,apply]=panel.querySelectorAll('button');let item=null;
 function clear(){if(!item)return;scene.remove(item.mesh);item.mesh.geometry.dispose();item.mesh.material.dispose();item=null}
 show.onclick=()=>{clear();const o=getSelected();if(!o)return notify('Sélectionne un objet.');try{const mesh=new THREE.Mesh(subdivideTriangles(o.geometry),new THREE.MeshBasicMaterial({color:0x88e0bd,wireframe:true,depthTest:false,transparent:true,opacity:.65}));o.updateWorldMatrix(true,false);mesh.matrixAutoUpdate=false;mesh.matrix.copy(o.matrixWorld);scene.add(mesh);item={object:o,source:o.geometry,mesh};}catch(e){notify(e.message)}};
 cancel.onclick=clear;
 apply.onclick=()=>{if(!item||getSelected()!==item.object)return clear();const o=item.object;try{const next=subdivideTriangles(o.geometry);clear();checkpoint();o.geometry.dispose();o.geometry=next;refresh();notify('Subdivision appliquée.')}catch(e){clear();notify(e.message)}};
 return {clear};
}
