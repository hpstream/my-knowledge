# webgl_materials_physical_transmission.html｜Transmission：真实透明玻璃不是 opacity

> 本地官方案例：[`webgl_materials_physical_transmission.html`](../../cases/webgl_materials_physical_transmission.html)  
> 本篇目标：学习 MeshPhysicalMaterial 的 transmission、ior、thickness、roughness 如何共同形成玻璃和透明塑料质感。

## 先从现实问题说起

很多新手做玻璃会先调 `opacity`，结果只是一个半透明贴片，不像真实玻璃。

真实玻璃会透光、折射、反射环境，还会因为厚度和粗糙度产生不同观感。

`transmission` 解决的是“光真的穿过材质”的问题。

## 先把基础概念说清楚

- `opacity` 是整体透明混合，像把物体变淡。
- `transmission` 是物理透射，适合玻璃、亚克力、透明塑料。
- `ior` 控制折射率，`thickness` 控制厚度感，`roughness` 控制清玻璃还是毛玻璃。

## 这个技术解决什么

这个案例适合学习真实透明材质，不是简单透明 UI 贴片。

玻璃很依赖环境图；没有周围环境反射和透射，玻璃会看起来很假。

## 打开案例后看什么

- 调 transmission，看材质从普通表面变成透明透射。
- 调 roughness，看清玻璃变成毛玻璃。
- 调 ior 和 thickness，看折射感和厚度感怎么变化。

## 官网核心代码

```js
const material = new THREE.MeshPhysicalMaterial( {
  roughness: params.roughness,
  ior: params.ior,
  alphaMap: texture,
  envMap: hdrEquirect,
  transmission: params.transmission, // use material.transmission for glass materials
  transparent: true
} );
```

## 这段代码到底在做什么

- transmission 高时，背景和环境可以穿过材质参与渲染。
- opacity 低只是把物体透明混合，不等于真实玻璃。
- ior 是折射率，影响光线弯折感，不是亮度参数。
- thickness 让透明材质有体积感，厚玻璃和薄膜观感不同。
- 没有环境贴图时，玻璃通常很难看出质感。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `new THREE.MeshPhysicalMaterial( { roughness: params.roughness, ior: params.ior, alphaMap: texture, envMap: hdr` | `roughness` | 粗糙度，越高反射越散。 |
| `new THREE.MeshPhysicalMaterial( { roughness: params.roughness, ior: params.ior, alphaMap: texture, envMap: hdr` | `ior` | 折射率，影响透明材质的光线弯折。 |
| `new THREE.MeshPhysicalMaterial( { roughness: params.roughness, ior: params.ior, alphaMap: texture, envMap: hdr` | `alphaMap` | 透明度贴图，用灰度控制哪里透明或被裁掉。 |
| `new THREE.MeshPhysicalMaterial( { roughness: params.roughness, ior: params.ior, alphaMap: texture, envMap: hdr` | `envMap` | 环境贴图，控制反射来源。 |
| `new THREE.MeshPhysicalMaterial( { roughness: params.roughness, ior: params.ior, alphaMap: texture, envMap: hdr` | `transmission` | 透射强度，用于玻璃等透明材质。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 调 transmission | 从普通表面变成透明材质 |
| 调 roughness | 清玻璃变毛玻璃 |
| 调 ior | 折射感变化 |
| 调 thickness | 厚度感变化 |

## 学完能拿来做什么

- 玻璃杯
- 展示柜
- 亚克力
- 透明按钮
- 手机镜头

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
