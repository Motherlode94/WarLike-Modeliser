import * as THREE from 'three';
// Split every indexed triangle incident to the selected topological edge.
export function splitEdge(g,ids){
 if(ids.length!==2||ids[0]===ids[1])throw Error('Sélectionne une arête.');
 const p=g.attributes.position,u=g.attributes.uv,idx=g.index?Array.from(g.index.array):Array.from({length:p.count},(_,i)=>i);
 const [a,b]=ids;if(!ids.every(i=>Number.isInteger(i)&&i>=0&&i<p.count))throw Error('Arête invalide.');
 const positions=Array.from(p.array),uv=u?Array.from(u.array):null,n=p.count;
 if(n>=100000)throw Error('Budget de sommets dépassé.');
 positions.push((p.getX(a)+p.getX(b))/2,(p.getY(a)+p.getY(b))/2,(p.getZ(a)+p.getZ(b))/2);
 if(u)uv.push((u.getX(a)+u.getX(b))/2,(u.getY(a)+u.getY(b))/2);
 const out=[];let count=0;
 for(let i=0;i<idx.length;i+=3){const tri=idx.slice(i,i+3);let hit=false;for(let j=0;j<3;j++){const x=tri[j],y=tri[(j+1)%3],z=tri[(j+2)%3];if((x===a&&y===b)||(x===b&&y===a)){out.push(x,n,z,n,y,z);count++;hit=true;break}}if(!hit)out.push(...tri)}
 if(!count||out.length>600000)throw Error('Arête introuvable ou budget dépassé.');
 const next=new THREE.BufferGeometry();next.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));if(uv)next.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));next.setIndex(out);next.computeVertexNormals();next.computeBoundingBox();next.computeBoundingSphere();return {geometry:next,selection:[n]};
}
