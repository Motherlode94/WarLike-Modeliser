import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {OBJLoader} from 'three/addons/loaders/OBJLoader.js';
import {STLLoader} from 'three/addons/loaders/STLLoader.js';
import {OBJExporter} from 'three/addons/exporters/OBJExporter.js';
import {STLExporter} from 'three/addons/exporters/STLExporter.js';
const MAX_BYTES=16*1024*1024;
export async function readModel(file){
 if(file.size>MAX_BYTES)throw Error('Fichier trop volumineux (16 Mo maximum).');
 const ext=file.name.split('.').pop().toLowerCase(),data=await file.arrayBuffer(),out=[];
 if(ext==='bbmodel'){
  const doc=JSON.parse(new TextDecoder().decode(data));
  if(!Array.isArray(doc.elements)||doc.elements.length>500)throw Error('BBModel invalide ou trop complexe.');
  if(doc.textures?.length||doc.animations?.length||doc.outliner?.some(x=>typeof x==='object'))throw Error('Seuls les cubes BBModel sans groupe, texture ou animation sont pris en charge.');
  for(const e of doc.elements){
   if((e.type&&e.type!=='cube')||!['from','to'].every(k=>Array.isArray(e[k])&&e[k].length===3&&e[k].every(Number.isFinite))||e.rotation?.some(v=>v!==0)||e.inflate)throw Error('Cube BBModel non pris en charge.');
   const size=e.to.map((v,i)=>(v-e.from[i])/16);if(size.some(x=>x<=0))throw Error('Cube dégénéré.');
   const g=new THREE.BoxGeometry(...size);g.translate(...e.from.map((v,i)=>(v+e.to[i])/32));out.push({name:String(e.name||'Cube'),geometry:g,color:0x9ab6cf});
  }
 }else{
  let root;
  if(ext==='glb'){
   const view=new DataView(data);if(data.byteLength<20||view.getUint32(0,true)!==0x46546c67||view.getUint32(4,true)!==2||view.getUint32(8,true)!==data.byteLength)throw Error('GLB v2 invalide.');
   const n=view.getUint32(12,true);if(n>data.byteLength-20||view.getUint32(16,true)!==0x4e4f534a)throw Error('Bloc JSON GLB invalide.');
   const doc=JSON.parse(new TextDecoder().decode(data.slice(20,20+n)));if(doc.buffers?.some(x=>x.uri)||doc.images?.some(x=>x.uri)||doc.skins?.length||doc.animations?.length)throw Error('GLB externe, animé ou skinné non pris en charge.');
   root=(await new GLTFLoader().parseAsync(data,'')).scene;
  }else if(ext==='obj')root=new OBJLoader().parse(new TextDecoder().decode(data));
  else if(ext==='stl')root=new THREE.Mesh(new STLLoader().parse(data),new THREE.MeshStandardMaterial());
  else throw Error('Format non pris en charge.');
  root.updateMatrixWorld(true);root.traverse(o=>{if(!o.isMesh)return;if(o.isSkinnedMesh||o.isInstancedMesh||o.morphTargetInfluences?.length||Array.isArray(o.material))throw Error('Seuls les maillages statiques à matériau unique sont acceptés.');
   const g=o.geometry.clone();g.applyMatrix4(o.matrixWorld);out.push({name:o.name||file.name,geometry:g,color:o.material?.color?.getHex()??0x9ab6cf})});
 }
 if(!out.length||out.length>500)throw Error('Aucun maillage ou trop d’objets.');
 let total=0;for(const item of out){const g=item.geometry,p=g.attributes.position;if(!p||p.itemSize!==3||p.count<3||p.count>100000||!Array.from(p.array).every(Number.isFinite))throw Error('Géométrie invalide.');if(!g.index){if(p.count%3)throw Error('Triangles invalides.');g.setIndex(Array.from({length:p.count},(_,i)=>i))}if(g.index.count%3||g.index.count>600000)throw Error('Topologie invalide.');total+=p.count;if(total>300000)throw Error('Budget de sommets dépassé.');g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere()}
 return out;
}
export function exportStatic(group,format){
 if(format==='obj')return {content:new OBJExporter().parse(group),type:'text/plain'};
 if(format==='stl')return {content:new STLExporter().parse(group),type:'model/stl'};
 throw Error('Format inconnu.');
}
