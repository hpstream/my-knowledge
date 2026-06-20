# webgl_materials_physical_clearcoat.html｜Clearcoat：汽车漆和透明清漆层

> 本地官方案例：[`webgl_materials_physical_clearcoat.html`](../../cases/webgl_materials_physical_clearcoat.html)  
> 本篇目标：学习 MeshPhysicalMaterial 的 clearcoat 如何在底层材质上再加一层透明高光层。

## 先从现实问题说起

汽车漆、钢琴烤漆、头盔外壳看起来亮，不只是底层材质本身亮，而是表面还有一层透明清漆。

这层清漆会产生额外高光，好像底下材质外面又包了一层光滑保护膜。

`clearcoat` 解决的就是“材质表面多一层透明亮面”的问题。

## 先把基础概念说清楚

- `roughness` 控制底层材质粗糙度，`clearcoatRoughness` 控制清漆层粗糙度。
- `clearcoat` 越高，表面那层额外高光越明显。
- `clearcoatNormalMap` 可以让清漆层自己的微表面方向和底层法线分开。

## 这个技术解决什么

这个案例适合做车漆、亮面塑料、碳纤维保护层、头盔外壳。

它不是玻璃：clearcoat 不负责让你看穿物体，要做透明玻璃看 transmission。

## 打开案例后看什么

- 调 clearcoat，看第二层高光出现或消失。
- 调 clearcoatRoughness，看清漆高光从尖锐变发散。
- 切 normalMap 和 clearcoatNormalMap，比较底层纹理和表层高光纹理的差别。

## 官网核心代码

```js
let material = new THREE.MeshPhysicalMaterial( {
  clearcoat: 1.0,
  clearcoatRoughness: 0.1,
  metalness: 0.9,
  roughness: 0.5,
  normalMap: normalMap3,
  normalScale: new THREE.Vector2( 0.15, 0.15 )
} );
clearcoatNormalMap: clearcoatNormalMap,
```

## 这段代码到底在做什么

- roughness 是底层材质粗糙度，clearcoatRoughness 是清漆层粗糙度。
- clearcoat 高时，表面会出现额外一层高光。
- clearcoatNormalMap 让清漆层也有自己的微表面方向。
- 底层可以是金属、塑料、碳纤维，清漆层仍然是透明亮面。
- 做玻璃不要用 clearcoat 冒充，需要 transmission。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `new THREE.MeshPhysicalMaterial( { clearcoat: 1.0, clearcoatRoughness: 0.1, metalness: 0.9, roughness: 0.5, nor` | `clearcoat` | 清漆层强度，模拟车漆、涂层等二层高光。 |
| `new THREE.MeshPhysicalMaterial( { clearcoat: 1.0, clearcoatRoughness: 0.1, metalness: 0.9, roughness: 0.5, nor` | `clearcoatRoughness` | 清漆层粗糙度。 |
| `new THREE.MeshPhysicalMaterial( { clearcoat: 1.0, clearcoatRoughness: 0.1, metalness: 0.9, roughness: 0.5, nor` | `metalness` | 金属度，越高越像金属。 |
| `new THREE.MeshPhysicalMaterial( { clearcoat: 1.0, clearcoatRoughness: 0.1, metalness: 0.9, roughness: 0.5, nor` | `roughness` | 粗糙度，越高反射越散。 |
| `new THREE.MeshPhysicalMaterial( { clearcoat: 1.0, clearcoatRoughness: 0.1, metalness: 0.9, roughness: 0.5, nor` | `normalMap` | 法线贴图，用 RGB 记录像素法线方向；只改变光照方向，不改真实轮廓。 |
| `new THREE.MeshPhysicalMaterial( { clearcoat: 1.0, clearcoatRoughness: 0.1, metalness: 0.9, roughness: 0.5, nor` | `normalScale` | 法线贴图强度。 |
| `new THREE.Vector2( 0.15, 0.15 )` | `第 1 个参数：0.15` | x：横向分量。 |
| `new THREE.Vector2( 0.15, 0.15 )` | `第 2 个参数：0.15` | y：纵向分量。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 调 clearcoat | 第二层高光变强或消失 |
| 调 clearcoatRoughness | 清漆高光变尖或变散 |
| 切 normalMap | 底层纹理改变 |
| 切 clearcoatNormalMap | 表层高光纹理改变 |

## 学完能拿来做什么

- 汽车漆
- 头盔外壳
- 碳纤维
- 亮面塑料
- 钢琴烤漆

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
