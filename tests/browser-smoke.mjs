import assert from 'node:assert/strict';
import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true,args:['--enable-webgl','--use-gl=angle','--use-angle=swiftshader']});
try{
 const page=await browser.newPage({viewport:{width:1280,height:850}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:8765/',{waitUntil:'load'});
 await page.locator('#theme').waitFor({state:'visible'});
 await page.locator('#theme').selectOption('midnight');
 assert.equal(await page.evaluate(()=>document.documentElement.dataset.theme),'midnight');
 await page.reload({waitUntil:'load'});
 assert.equal(await page.locator('#theme').inputValue(),'midnight');
 await page.locator('#tab3d').click();
 assert.equal(await page.locator('#scene').evaluate(el=>el.classList.contains('hidden')),false);
 await page.locator('#tab2d').click();
 assert.equal(await page.locator('#canvas').evaluate(el=>el.classList.contains('hidden')),false);
 assert.deepEqual(errors,[],'unexpected Modeliser JavaScript errors');
 console.log('PASS: Modeliser boot, theme persistence, 2D/3D switching');
}finally{await browser.close()}
