const fs = require('fs');
const path = 'd:/网站开发/亚太国际人民事业发展共同体官方网站初稿(1)/research.html';
let s = fs.readFileSync(path, 'utf8');

// 剩余 16 项 (oncology 已经在第一次手动添加了)
const idMap = [
  ['炎症&免疫调节', 'inflammation-immunity'],
  ['代谢疾病',     'metabolic'],
  ['抗纤维化',     'fibrosis'],
  ['神经科学',     'neuro'],
  ['肾病',         'kidney'],
  ['肝病',         'liver'],
  ['心血管',       'cardio'],
  ['病毒&感染',    'viral'],
  ['肺部疾病',     'lung'],
  ['运动疲劳修复', 'fatigue-sport'],
  ['慢性疲劳综合征','fatigue-chronic'],
  ['抗衰老',       'aging'],
  ['骨代谢',       'bone'],
  ['生殖系统',     'reproductive'],
  ['皮肤',         'skin'],
  ['抗氧化',       'antioxidant']
];

let added = 0;
for (const [name, id] of idMap) {
  const re = new RegExp("(\\{) name: '" + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "',\\s+total:", 'g');
  const before = s;
  s = s.replace(re, "{ id: '" + id + "', name: '" + name + "', total:");
  if (s !== before) added++;
  else console.log('NOT FOUND: ' + name);
}
console.log('Added ids: ' + added + '/16');

const tmp = process.env.TEMP + '/research_ids2.tmp';
fs.writeFileSync(tmp, s, 'utf8');
console.log('size=' + s.length + ' TMP=' + tmp);
