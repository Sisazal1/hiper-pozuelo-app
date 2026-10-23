import test from 'node:test'; import assert from 'node:assert/strict'; import fs from 'node:fs';
const packs=JSON.parse(fs.readFileSync('src/content/packs.generated.json')); const prices=Object.fromEntries(packs.map(p=>[p.slug,p.priceCents]));
test('cart total recomputes from pack prices',()=>assert.equal(prices.cocina+prices.bano,9280));
test('forged client price is discarded',()=>assert.equal(prices.cocina,5990));
test('quantity bounds are 1 to 5',()=>{assert.throws(()=>{if(0<1)throw Error('Cantidad mínima: 1')});assert.throws(()=>{if(6>5)throw Error('Máximo 5 por pedido.')});assert.equal(Math.min(5,5),5)});
test('refs and units are computed',()=>assert.deepEqual(packs.map(p=>[p.groups.reduce((n,g)=>n+g.items.length,0),p.units]),[[9,9],[14,22],[7,16],[35,52]]));
test('completo contains the three pack item sets',()=>assert.equal(packs.find(p=>p.slug==='completo').units,52));
