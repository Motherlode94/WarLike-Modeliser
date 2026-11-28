// Reuse the existing controls and their event listeners; never clone or replace them.
const inspector=document.getElementById('nativeModelInspector');
const tabs=document.createElement('div');tabs.className='model-inspector-tabs';tabs.setAttribute('role','group');tabs.setAttribute('aria-label','Catégories de propriétés');
const sections=[['object','Objet'],['mesh','Maillage'],['surface','Surface'],['animation','Animation'],['files','Fichiers']];
const buckets=new Map();for(const [id,name] of sections){const panel=document.createElement('div');panel.className='model-inspector-page';panel.dataset.inspectorPage=id;panel.setAttribute('aria-label',name);buckets.set(id,panel)}
let bucket='mesh';for(const child of [...inspector.children]){
 if(child.tagName==='H3'){if(child.textContent==='TRANSFORMATIONS')bucket='object';else if(child.textContent.includes('MODÉLISATION')||child.textContent.includes('ÉDITION'))bucket='mesh'}
 let target=bucket;const summary=child.querySelector(':scope > summary')?.textContent||'';
 if(/UV Editor|Texture Paint|Matériau PBR/.test(summary)||child.querySelector('#modelColor'))target='surface';
 if(/Formats 3D/.test(summary)||['modelSave','modelOpen','modelFile','modelExport'].includes(child.id))target='files';
 if(/Armature|Animation|Timeline|Skinning|Keyframes/i.test(summary))target='animation';
 buckets.get(target).append(child);
}
inspector.prepend(tabs);for(const panel of buckets.values())inspector.append(panel);
function activate(id){for(const [key,panel] of buckets)panel.hidden=key!==id;for(const b of tabs.children)b.setAttribute('aria-pressed',String(b.dataset.page===id))}
for(const [id,name] of sections){const b=document.createElement('button');b.type='button';b.dataset.page=id;b.textContent=name;b.onclick=()=>activate(id);tabs.append(b)}
activate('object');
const search=document.createElement('input');search.type='search';search.placeholder='Filtrer les sections';search.setAttribute('aria-label','Filtrer les propriétés');tabs.after(search);search.addEventListener('input',()=>{const q=search.value.trim().toLowerCase();for(const panel of buckets.values())for(const section of panel.querySelectorAll(':scope > details'))section.hidden=!!q&&!section.textContent.toLowerCase().includes(q)});
const mode=document.getElementById('meshMode');mode.addEventListener('change',()=>activate(mode.value==='object'?'object':'mesh'));
const modeLabel=mode.closest('label');const modeHeading=[...inspector.querySelectorAll('h3')].find(el=>el.textContent==='MODE D’ÉDITION');if(modeHeading)modeHeading.remove();inspector.insertBefore(modeLabel,tabs);
const tools=document.getElementById('nativeModelTools');const outliner=document.getElementById('modelOutliner');const heading=outliner.previousElementSibling;const title=document.createElement('div');title.className='model-panel-title';title.textContent='SCÈNE / OUTLINER';tools.prepend(title);if(heading?.tagName==='H3')heading.remove();title.after(outliner);
