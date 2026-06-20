import fs from 'node:fs';
import path from 'node:path';

const DOCS_DIR = 'article/专题/threejs 专题学习/官方案例讲解';
const SECTION_TITLE = '## 本案例参数字典';
const OBSERVE_TITLE = '## 参数和观察方法';

const constructorSchemas = {
  PerspectiveCamera: ['fov：垂直视野角，数值越大越广角。', 'aspect：宽高比。', 'near：近裁剪面。', 'far：远裁剪面。'],
  OrthographicCamera: ['left：正交视锥左边界。', 'right：正交视锥右边界。', 'top：正交视锥上边界。', 'bottom：正交视锥下边界。', 'near：近裁剪面。', 'far：远裁剪面。'],
  PointLight: ['color：点光源颜色。', 'intensity：点光源强度。', 'distance：光照影响距离，0 表示无限远。', 'decay：距离衰减系数，2 接近真实平方衰减。'],
  HemisphereLight: ['skyColor：天空方向颜色。', 'groundColor：地面方向颜色。', 'intensity：半球光强度。'],
  DirectionalLight: ['color：方向光颜色。', 'intensity：方向光强度。'],
  AmbientLight: ['color：环境光颜色。', 'intensity：环境光强度。'],
  SpotLight: ['color：聚光灯颜色。', 'intensity：聚光灯强度。', 'distance：光照影响距离。', 'angle：光锥开口角。', 'penumbra：半影软边比例。', 'decay：距离衰减系数。'],
  RectAreaLight: ['color：矩形面光颜色。', 'intensity：面光强度。', 'width：面光宽度。', 'height：面光高度。'],
  MeshStandardMaterial: [],
  MeshPhysicalMaterial: [],
  MeshPhongMaterial: [],
  MeshBasicMaterial: [],
  PointsMaterial: [],
  ShaderMaterial: [],
  Mesh: ['geometry：网格几何体。', 'material：网格材质。'],
  InstancedMesh: ['geometry：所有实例共享的几何体。', 'material：所有实例共享的材质。', 'count：实例数量。'],
  Points: ['geometry：点云几何数据。', 'material：点云材质。'],
  BoxGeometry: ['width：盒子宽度。', 'height：盒子高度。', 'depth：盒子深度。'],
  PlaneGeometry: ['width：平面宽度。', 'height：平面高度。'],
  SphereGeometry: ['radius：球半径。', 'widthSegments：横向分段。', 'heightSegments：纵向分段。'],
  ConeGeometry: ['radius：底面半径。', 'height：高度。', 'radialSegments：圆周分段。', 'heightSegments：高度分段。'],
  GridHelper: ['size：网格总尺寸。', 'divisions：分割数量。', 'colorCenterLine：中心线颜色。', 'colorGrid：普通网格线颜色。'],
  CameraHelper: ['camera：要可视化视锥的相机。'],
  BoxHelper: ['object：要计算包围盒的对象。', 'color：包围盒颜色。'],
  Vector2: ['x：横向分量。', 'y：纵向分量。'],
  Vector3: ['x：横向分量。', 'y：纵向分量。', 'z：深度分量。'],
  OrbitControls: ['camera：被控制的相机。', 'domElement：接收鼠标/触摸事件的 DOM 元素。'],
  DragControls: ['objects：允许拖拽的对象数组。', 'camera：用于鼠标映射的相机。', 'domElement：接收事件的 DOM 元素。'],
  TransformControls: ['camera：当前编辑视角相机。', 'domElement：接收手柄事件的 DOM 元素。'],
  EffectComposer: ['renderer：后处理使用的渲染器。'],
  RenderPass: ['scene：先渲染的场景。', 'camera：渲染场景的相机。'],
  ShaderPass: ['shader：屏幕空间处理用 shader。'],
  UnrealBloomPass: ['resolution：后处理分辨率。', 'strength：泛光强度。', 'radius：泛光扩散半径。', 'threshold：进入泛光的亮度阈值。'],
  SSAOPass: ['scene：参与 SSAO 的场景。', 'camera：当前相机。', 'width：处理宽度。', 'height：处理高度。'],
  AnimationMixer: ['root：动画绑定的根对象。'],
  RapierHelper: ['world：要可视化的 Rapier 物理世界。']
};

const propDescriptions = {
  alpha: '透明背景开关；true 表示 canvas 可以带透明通道。',
  alphaMap: '透明度贴图，用灰度控制哪里透明或被裁掉。',
  alphaTest: '透明裁剪阈值，低于阈值的片元会被丢弃。',
  angle: '聚光灯光锥开口角，数值越大照亮范围越宽。',
  anisotropy: '各向异性采样等级，提升斜视角纹理清晰度。',
  antialias: '抗锯齿开关，让边缘更平滑但略增成本。',
  backgroundBlurriness: '背景模糊强度，只影响背景，不会让模型材质变糊。',
  blending: '透明混合方式，影响粒子、发光或叠加效果。',
  bumpMap: '凹凸贴图，用黑白灰表示表面高低差；只影响光照，不改真实轮廓。',
  bumpScale: '凹凸贴图强度。',
  castShadow: '是否投射阴影。',
  clearcoat: '清漆层强度，模拟车漆、涂层等二层高光。',
  clearcoatNormalMap: '清漆层自己的法线贴图，只影响表层高光方向。',
  clearcoatRoughness: '清漆层粗糙度。',
  color: '基础颜色或光源颜色。',
  colorSpace: '纹理颜色空间；颜色贴图通常使用 sRGB。',
  count: '实例数量或对象数量。',
  dampingFactor: '阻尼系数，影响 OrbitControls 惯性衰减速度。',
  dashed: '是否按虚线绘制。',
  dashSize: '虚线中实线段长度。',
  decay: '灯光距离衰减系数。',
  depthTest: '是否进行深度测试。',
  depthWrite: '是否写入深度缓冲。',
  distance: '光照影响距离或控制距离。',
  emissive: '自发光颜色。',
  emissiveIntensity: '自发光强度。',
  enableDamping: '是否启用阻尼惯性；开启后需要每帧 controls.update()。',
  envMap: '环境贴图，控制反射来源。',
  envMapIntensity: '环境反射强度。',
  exposure: '曝光控制值，通常会同步到 renderer.toneMappingExposure。',
  flatShading: '是否使用平面着色。',
  focus: '阴影或聚光灯聚焦参数，影响有效投射区域。',
  fov: '相机垂直视野角。',
  gapSize: '虚线中空白间隔长度。',
  hemiIrradiance: '半球环境光照度选项，用 lux 控制环境底光强弱。',
  intensity: '灯光或效果强度。',
  ior: '折射率，影响透明材质的光线弯折。',
  linewidth: '线宽。',
  map: '基础颜色贴图，决定表面颜色和图案，不负责凹凸、粗糙或金属感。',
  mapping: '纹理映射方式，决定贴图作为反射、折射或全景图使用。',
  metalness: '金属度，越高越像金属。',
  metalnessMap: '金属度贴图；白色更金属，黑色更非金属。',
  minDistance: '相机离目标点最近距离。',
  maxDistance: '相机离目标点最远距离。',
  maxPolarAngle: 'OrbitControls 最大垂直旋转角，常用来防止相机绕到地面下方。',
  normalMap: '法线贴图，用 RGB 记录像素法线方向；只改变光照方向，不改真实轮廓。',
  normalScale: '法线贴图强度。',
  opacity: '整体透明度。',
  penumbra: '聚光灯边缘软化比例。',
  power: '点光源总发光量，可按流明理解。',
  receiveShadow: '是否接收阴影。',
  roughness: '粗糙度，越高反射越散。',
  roughnessMap: '粗糙度贴图；白色更粗糙哑光，黑色更光滑反射更锐。',
  shadowIntensity: '阴影强度。',
  shininess: 'Phong 材质高光锐利程度。',
  side: '材质渲染面：正面、背面或双面。',
  size: '尺寸参数，常用于点精灵、helper 或控件。',
  sizeAttenuation: '点精灵是否随距离变小。',
  specular: 'Phong/传统材质的高光颜色。',
  specularMap: '高光贴图，控制哪些区域更容易产生镜面高光。',
  strength: '效果强度。',
  target: '控制器观察中心点。',
  threshold: '阈值，决定效果从什么亮度或强度开始生效。',
  thickness: '透明/透射材质厚度。',
  toneMapping: '色调映射方式，把高亮结果压缩到屏幕可显示范围。',
  toneMappingExposure: '最终输出曝光值，影响画面明暗。',
  transmission: '透射强度，用于玻璃等透明材质。',
  transparent: '是否启用透明渲染流程。',
  vertexColors: '是否使用顶点颜色。',
  wireframe: '是否以线框显示。',
  worldUnits: '粗线是否使用世界单位宽度。',
  wrapS: '纹理横向包裹方式。',
  wrapT: '纹理纵向包裹方式。'
};

const methodSchemas = {
  add: ['object：加入场景或分组的对象。'],
  addPass: ['pass：加入后处理流水线的处理节点。'],
  addMesh: ['mesh：要创建物理体的 Three 网格。', 'mass：质量，0 常表示静态物体。', 'restitution：反弹系数。'],
  addScene: ['scene：交给物理封装同步的 Three 场景。'],
  attach: ['object：TransformControls 当前编辑目标。'],
  clipAction: ['clip：要播放的动画片段。'],
  compileAsync: ['object：预编译对象。', 'camera：编译时使用的相机。', 'scene：编译时使用的场景。'],
  copy: ['source：复制来源。'],
  fromCubemap: ['cubeTexture：要预过滤的 cube 环境贴图。'],
  intersectObject: ['object：要检测的对象。', 'recursive：是否递归检测子对象。'],
  intersectObjects: ['objects：要检测的对象数组。', 'recursive：是否递归检测子对象。'],
  load: ['url：资源路径。', 'onLoad：加载成功回调。'],
  set: ['x：第一个分量。', 'y：第二个分量。', 'z：第三个分量。'],
  setAnimationLoop: ['callback：每帧调用的动画函数。'],
  setAttribute: ['name：属性名。', 'attribute：BufferAttribute 数据。'],
  setColorAt: ['index：实例编号。', 'color：实例颜色。'],
  setFromCamera: ['coords：归一化设备坐标。', 'camera：发出射线的相机。'],
  setFromObject: ['object：用于计算包围盒的对象。'],
  setMatrixAt: ['index：实例编号。', 'matrix：该实例的变换矩阵。'],
  setMode: ['mode：TransformControls 模式，如 translate/rotate/scale。'],
  setPath: ['path：资源基础路径。'],
  setSize: ['width：宽度。', 'height：高度。'],
  setUsage: ['usage：BufferAttribute 使用方式提示。'],
  update: ['delta：可选帧间隔；无参数时按控件/辅助对象内部状态更新。']
};

const importantProps = new Set([
  ...Object.keys(propDescriptions),
  'bulbPower', 'hemiIrradiance', 'shadows', 'showProbes', 'lightProbeIntensity', 'directionalLightIntensity',
  'envMapIntensity', 'backgroundIntensity', 'backgroundBlurriness', 'transmissionResolutionScale', 'kernelRadius',
  'minDistance', 'maxDistance', 'maxPolarAngle'
]);

function main() {
  const mdFiles = walk(DOCS_DIR).filter(file => file.endsWith('.md') && path.basename(file) !== 'README.md');
  let changed = 0;

  for (const mdFile of mdFiles) {
    const md = fs.readFileSync(mdFile, 'utf8');
    const snippet = extractCoreSnippet(md);
    const rows = snippet ? extractRows(snippet) : [];
    const section = renderSection(rows);
    fs.writeFileSync(mdFile, replaceOrInsert(md, section));
    changed += 1;
  }

  console.log(`Core parameter dictionaries rebuilt: ${changed}.`);
}

function walk(dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

function extractCoreSnippet(md) {
  const start = md.indexOf('## 官网核心代码');
  if (start < 0) return null;
  const fenceStart = md.indexOf('```', start);
  if (fenceStart < 0) return null;
  const codeStart = md.indexOf('\n', fenceStart);
  const fenceEnd = md.indexOf('```', codeStart + 1);
  if (codeStart < 0 || fenceEnd < 0) return null;
  return md.slice(codeStart + 1, fenceEnd).trim();
}

function replaceOrInsert(md, section) {
  const start = md.indexOf(SECTION_TITLE);
  const observe = md.indexOf(OBSERVE_TITLE, start);
  if (start >= 0 && observe >= 0) {
    return `${md.slice(0, start).trimEnd()}\n\n${section}\n\n${md.slice(observe)}`;
  }
  const marker = `\n${OBSERVE_TITLE}`;
  if (md.includes(marker)) return md.replace(marker, `\n${section}\n${marker}`);
  return `${md.trimEnd()}\n\n${section}\n`;
}

function renderSection(rows) {
  const parts = [
    SECTION_TITLE,
    '',
    '这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。'
  ];

  if (rows.length === 0) {
    parts.push('', '这个案例的核心片段主要展示调用顺序或对象关系，没有额外需要展开的数值参数。');
    return parts.join('\n');
  }

  parts.push('', '| 代码片段 | 参数 | 含义 |', '|---|---|---|');
  for (const row of rows.slice(0, 28)) {
    parts.push(`| \`${escapePipe(trim(row.code))}\` | \`${escapePipe(row.param)}\` | ${escapePipe(row.meaning)} |`);
  }

  return parts.join('\n');
}

function extractRows(source) {
  const rows = [];
  const seen = new Set();

  function add(code, param, meaning) {
    if (!param || !meaning) return;
    const key = `${trim(code)}|${param}|${meaning}`;
    if (seen.has(key)) return;
    seen.add(key);
    rows.push({ code, param, meaning });
  }

  collectConstructors(source, add);
  collectObjectLiterals(source, add);
  collectAssignments(source, add);
  collectMethodCalls(source, add);
  collectGuiCalls(source, add);

  return rows;
}

function collectConstructors(source, add) {
  const re = /\bnew\s+([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*)\s*\(/g;
  for (const match of source.matchAll(re)) {
    const fullName = match[1];
    const shortName = fullName.split('.').pop();
    const open = match.index + match[0].length - 1;
    const close = findBalanced(source, open, '(', ')');
    if (close < 0) continue;
    const argsText = source.slice(open + 1, close);
    const args = splitTopLevel(argsText).filter(Boolean);
    const code = `new ${fullName}( ${argsText.trim()} )`;

    if (args.length === 1 && args[0].trim().startsWith('{')) {
      for (const prop of parseObjectProperties(args[0])) {
        if (importantProps.has(prop.key)) add(code, prop.key, describe(prop.key));
      }
      continue;
    }

    const schema = constructorSchemas[shortName];
    if (!schema) continue;
    args.forEach((arg, index) => {
      const meaning = schema[index];
      if (meaning) add(code, `第 ${index + 1} 个参数：${arg.trim()}`, meaning);
    });
  }
}

function collectObjectLiterals(source, add) {
  const re = /\b(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*\{/g;
  for (const match of source.matchAll(re)) {
    const name = match[1];
    if (!/^(params|api|API|settings|options|effectController)$/i.test(name)) continue;
    const start = match.index + match[0].lastIndexOf('{');
    const end = findBalanced(source, start, '{', '}');
    if (end < 0) continue;
    const code = `${name} = ${source.slice(start, end + 1)}`;
    for (const prop of parseObjectProperties(source.slice(start, end + 1))) {
      if (importantProps.has(prop.key)) add(code, prop.key, describe(prop.key));
    }
  }
}

function collectAssignments(source, add) {
  const re = /\b([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)+)\s*=\s*([^;\n]+);?/g;
  for (const match of source.matchAll(re)) {
    const left = match[1];
    const value = match[2].trim();
    if (/(={2,}|!={1,2}|>=|<=|=>)/.test(value)) continue;
    if (value.length > 140) continue;
    const prop = left.split('.').pop();
    if (!importantProps.has(prop)) continue;
    add(`${left} = ${value}`, prop, describe(prop, left));
  }
}

function collectMethodCalls(source, add) {
  const re = /\b([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)+)\s*\(/g;
  for (const match of source.matchAll(re)) {
    if (source.slice(Math.max(0, match.index - 5), match.index).includes('new ')) continue;
    const callee = match[1];
    const method = callee.split('.').pop();
    if (method === 'add') continue;
    if (callee.includes('gui.') || callee.includes('folder.')) continue;
    const schema = methodSchemaFor(callee, method);
    if (!schema) continue;

    const open = match.index + match[0].length - 1;
    const close = findBalanced(source, open, '(', ')');
    if (close < 0) continue;
    const argsText = source.slice(open + 1, close);
    const args = splitTopLevel(argsText).filter(Boolean);
    const code = `${callee}( ${argsText.trim()} )`;
    args.forEach((arg, index) => {
      const meaning = schema[index];
      if (meaning) add(code, `第 ${index + 1} 个参数：${arg.trim()}`, meaning);
    });
    if (args.length === 0 && schema[0]) add(code, '无参数', schema[0]);
  }
}

function collectGuiCalls(source, add) {
  const re = /\b(?:gui|folder)\.add(?:Color)?\s*\(/g;
  for (const match of source.matchAll(re)) {
    const open = match.index + match[0].length - 1;
    const close = findBalanced(source, open, '(', ')');
    if (close < 0) continue;
    const argsText = source.slice(open + 1, close);
    const args = splitTopLevel(argsText).filter(Boolean);
    const prop = args[1]?.trim().replace(/^['"`]|['"`]$/g, '');
    if (!prop) continue;
    const code = `${source.slice(match.index, open)}( ${argsText.trim()} )`;
    add(code, prop, describe(prop));
    if (args[2] && args[3]) {
      add(code, `${args[2].trim()} 到 ${args[3].trim()}`, 'GUI 滑条范围。');
    } else if (args[2]) {
      add(code, `第 3 个参数：${args[2].trim()}`, 'GUI 可选项列表或范围配置。');
    }
  }
}

function methodSchemaFor(callee, method) {
  if ((callee.endsWith('.position') || callee.endsWith('.target')) && method === 'set') {
    return ['x：世界或局部坐标 x。', 'y：世界或局部坐标 y。', 'z：世界或局部坐标 z。'];
  }
  if (callee.endsWith('.rotation') && method === 'set') {
    return ['x：绕 x 轴旋转弧度。', 'y：绕 y 轴旋转弧度。', 'z：绕 z 轴旋转弧度。'];
  }
  if (callee.endsWith('.scale') && method === 'set') {
    return ['x：x 轴缩放倍数。', 'y：y 轴缩放倍数。', 'z：z 轴缩放倍数。'];
  }
  if (callee.endsWith('.repeat') && method === 'set') {
    return ['x：纹理横向重复次数。', 'y：纹理纵向重复次数。'];
  }
  return methodSchemas[method] ?? null;
}

function describe(prop, pathName = '') {
  if (propDescriptions[prop]) return propDescriptions[prop];
  if (/mass/i.test(prop)) return '质量，物理模拟里 0 常表示静态物体。';
  if (/restitution/i.test(prop)) return '反弹系数，越大越容易弹起。';
  if (/friction/i.test(prop)) return '摩擦系数，越大越不容易滑动。';
  if (/lightProbeIntensity/i.test(prop)) return 'LightProbe 环境补光强度。';
  if (/directionalLightIntensity/i.test(prop)) return '方向光强度。';
  if (/transmissionResolutionScale/i.test(prop)) return '透射效果渲染分辨率比例。';
  if (/kernelRadius/i.test(prop)) return 'SSAO 采样半径，影响遮蔽范围。';
  if (/shadows/i.test(prop)) return '阴影开关。';
  if (/bulbPower/i.test(prop)) return '灯泡功率选项，最终映射到点光源 power。';
  if (/hemiIrradiance/i.test(prop)) return '环境照度选项，最终映射到半球光 intensity。';
  return `${pathName || prop} 是这个核心片段里的业务参数。`;
}

function parseObjectProperties(text) {
  const body = text.trim().replace(/^\{/, '').replace(/\}$/, '');
  return splitTopLevel(body)
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => part.match(/^([A-Za-z_$][\w$]*|['"`][^'"`]+['"`])\s*:/))
    .filter(Boolean)
    .map(match => ({ key: match[1].replace(/^['"`]|['"`]$/g, '') }));
}

function splitTopLevel(text) {
  const parts = [];
  let start = 0;
  let depthParen = 0;
  let depthBrace = 0;
  let depthBracket = 0;
  let quote = null;
  let escaped = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === '(') depthParen += 1;
    else if (ch === ')') depthParen -= 1;
    else if (ch === '{') depthBrace += 1;
    else if (ch === '}') depthBrace -= 1;
    else if (ch === '[') depthBracket += 1;
    else if (ch === ']') depthBracket -= 1;
    else if (ch === ',' && depthParen === 0 && depthBrace === 0 && depthBracket === 0) {
      parts.push(text.slice(start, i).trim());
      start = i + 1;
    }
  }
  const last = text.slice(start).trim();
  if (last) parts.push(last);
  return parts;
}

function findBalanced(text, openIndex, openChar, closeChar) {
  let depth = 0;
  let quote = null;
  let escaped = false;
  for (let i = openIndex; i < text.length; i += 1) {
    const ch = text[i];
    if (quote) {
      if (escaped) escaped = false;
      else if (ch === '\\') escaped = true;
      else if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === '`') {
      quote = ch;
      continue;
    }
    if (ch === openChar) depth += 1;
    else if (ch === closeChar) {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return -1;
}

function trim(value) {
  return value.replace(/\s+/g, ' ').trim().slice(0, 110);
}

function escapePipe(value) {
  return String(value).replaceAll('|', '\\|').replace(/\n+/g, ' ');
}

main();
