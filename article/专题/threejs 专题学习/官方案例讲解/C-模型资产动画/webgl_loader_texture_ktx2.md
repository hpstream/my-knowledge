# webgl_loader_texture_ktx2.html｜Texture KTX2：GPU 压缩纹理加载和格式对比

> 本地官方案例：[`webgl_loader_texture_ktx2.html`](../../cases/webgl_loader_texture_ktx2.html)  
> 本篇目标：学习 KTX2 压缩纹理为什么适合 Web 3D，以及不同压缩格式、mipmap、透明度和采样方式的差异。

## 先从现实问题说起

模型贴图往往比模型几何还占空间。大 JPG/PNG 贴图加载慢，上传 GPU 后还占很多显存。

移动端和网页项目尤其需要压缩纹理。

KTX2 解决的是“贴图传输和显存更省”的问题。

## 先把基础概念说清楚

- `KTX2Loader` 会根据设备支持选择合适的 GPU 压缩格式。
- `detectSupport(renderer)` 用来检测当前渲染器/设备能力。
- 压缩纹理和普通纹理一样用于材质，但加载和 GPU 存储更高效。

## 这个技术解决什么

这个案例适合学习模型贴图优化，不是几何压缩。

真实项目里，KTX2 常和 glTF、环境图、PBR 贴图一起用于性能优化。

## 打开案例后看什么

- 看 loader 如何检测设备支持。
- 观察压缩贴图加载后材质使用方式是否仍然正常。
- 理解 KTX2 主要解决贴图体积和显存，不改变材质原理。

## 官网核心代码

```js
const loader = new KTX2Loader()
  .setPath( 'textures/ktx2/' )
  .detectSupport( renderer );

const texture = await loader.loadAsync( supported === false ? 'fail_load.ktx2' : path );
const mesh = new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { map: texture } ) );
scene.add( mesh );
scenes.push( scene );

renderer.setScissor( left, bottom, width, height );
renderer.render( scene, camera );
```

## 这段代码到底在做什么

- 普通 PNG/JPG 下载后通常会解码成未压缩 GPU 纹理，占显存很大。
- KTX2 可以保存 GPU 友好的压缩纹理，减少显存和带宽压力。
- detectSupport 根据设备选择合适目标格式，例如 ETC、BC、ASTC 等。
- KTX2 纹理默认 flipY=false，和普通图片纹理的 UV 方向习惯不同，案例里专门处理了 UV。
- 案例用多个小场景和 scissor 区域在同一个 canvas 里渲染很多纹理对比。
- 它不是为了做漂亮画面，而是为了让你看清不同压缩格式和贴图设置的真实差别。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { map: texture } ) )` | `第 1 个参数：geometry` | geometry：网格几何体。 |
| `new THREE.Mesh( geometry, new THREE.MeshBasicMaterial( { map: texture } ) )` | `第 2 个参数：new THREE.MeshBasicMaterial( { map: texture } )` | material：网格材质。 |
| `new THREE.MeshBasicMaterial( { map: texture } )` | `map` | 基础颜色贴图，决定表面颜色和图案，不负责凹凸、粗糙或金属感。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 对比 uncompressed/compressed/universal | 看画质和格式差异 |
| 打开开发者工具看显存/下载 | 理解压缩纹理价值 |
| 观察透明纹理 | 不同格式对 alpha 支持不同 |
| 看 scissor 多窗口渲染 | 一个 renderer 可以画多个区域 |

## 学完能拿来做什么

- 做移动端大贴图优化
- 做模型查看器和游戏资源优化
- 做纹理格式测试页
- 做图片墙/材质库预览
- 建立 KTX2/BasisU 纹理生产流水线

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
