import fs from 'node:fs';
const p=JSON.parse(fs.readFileSync('src/content/packs.generated.json')); if(p.length!==4||p.some(x=>!x.units||x.dataStatus!=='ASSUMED-demo'))throw new Error('Invalid generated content');
for(const x of p) if(!fs.existsSync(`public${x.image.src}`))throw new Error(`Missing image ${x.slug}`);
const files=['app','src']; const text=files.flatMap(d=>fs.existsSync(d)?fs.readdirSync(d,{recursive:true}).filter(x=>String(x).match(/\.(ts|tsx|css)$/)).map(x=>fs.readFileSync(`${d}/${x}`,'utf8')):[]).join('\n');
for(const bad of ['Pago seguro','Entrega a domicilio','Devoluciones 30 días']) if(text.includes(bad))throw new Error(`Forbidden copy: ${bad}`);
console.log(`verify: ${p.length} packs, computed units valid, images present, forbidden copy clear`);
