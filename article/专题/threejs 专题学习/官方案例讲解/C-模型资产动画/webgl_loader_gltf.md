# webgl_loader_gltf.html｜GLTFLoader：加载真实模型并自动适配相机

> 本地官方案例：[`webgl_loader_gltf.html`](../../cases/webgl_loader_gltf.html)  
> 本篇目标：学习真实 glTF 模型加载、环境贴图、动画播放，以及官方 fitCameraToSelection 如何用 Box3 自动把相机摆到合适距离。

## 先从现实问题说起

3D 项目很少手写几何体，更多是从 Blender、Maya、C4D 或下载平台导入模型。

模型不只是网格，还可能带材质、贴图、骨骼、动画、相机和灯光。

glTF 是 Three.js 里最常用的模型交换格式，这个案例讲最基础的加载链路。

## 先把基础概念说清楚

- `GLTFLoader` 负责读取 `.gltf` 或 `.glb` 文件。
- `gltf.scene` 是模型场景根节点，通常直接 `scene.add(gltf.scene)`。
- `gltf.animations` 里可能有动画片段，加载模型和播放动画是两步。

## 这个技术解决什么

这个案例适合建立“模型资产怎么进 Three.js”的第一印象。

后面的压缩、KTX2 贴图、材质变体、动画播放都建立在 glTF 加载基础上。

## 打开案例后看什么

- 看 loader 的路径和文件名如何拼出资源地址。
- 看加载成功回调里把 `gltf.scene` 加进场景。
- 注意模型出现不代表动画也自动播放。

## 官网核心代码

```js
const loader = new GLTFLoader();
loader.load( url, async function ( gltf ) {
  currentModel = gltf.scene;
  await renderer.compileAsync( currentModel, camera, scene );
  scene.add( currentModel );
  fitCameraToSelection( camera, controls, currentModel );

  if ( gltf.animations.length > 0 ) {
    mixer = new THREE.AnimationMixer( currentModel );
    for ( const animation of gltf.animations ) {
      mixer.clipAction( animation ).play();
    }
  }
} );
```

## 这段代码到底在做什么

- gltf.scene 是模型的根对象，通常是一个 Group，不一定只有一个 mesh。
- compileAsync 会提前编译材质 shader，减少第一次显示时的卡顿。
- fitCameraToSelection 用 Box3 计算模型中心和最大尺寸，再移动相机、更新 controls.target。
- AnimationMixer 绑定到模型根对象，用 clipAction 播放模型携带的动画片段。
- 本地镜像把官网远程模型列表改成本地 models/gltf 下的模型，避免离线打不开。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `new THREE.AnimationMixer( currentModel )` | `第 1 个参数：currentModel` | root：动画绑定的根对象。 |
| `loader.load( url, async function ( gltf ) { currentModel = gltf.scene; await renderer.compileAsync( currentMod` | `第 1 个参数：url` | url：资源路径。 |
| `loader.load( url, async function ( gltf ) { currentModel = gltf.scene; await renderer.compileAsync( currentMod` | `第 2 个参数：async function ( gltf ) {   currentModel = gltf.scene;   await renderer.compileAsync( currentModel, camera, scene );   scene.add( currentModel );   fitCameraToSelection( camera, controls, currentModel );   if ( gltf.animations.length > 0 ) {     mixer = new THREE.AnimationMixer( currentModel );     for ( const animation of gltf.animations ) {       mixer.clipAction( animation ).play();     }   } }` | onLoad：加载成功回调。 |
| `renderer.compileAsync( currentModel, camera, scene )` | `第 1 个参数：currentModel` | object：预编译对象。 |
| `renderer.compileAsync( currentModel, camera, scene )` | `第 2 个参数：camera` | camera：编译时使用的相机。 |
| `renderer.compileAsync( currentModel, camera, scene )` | `第 3 个参数：scene` | scene：编译时使用的场景。 |
| `mixer.clipAction( animation )` | `第 1 个参数：animation` | clip：要播放的动画片段。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 切换 GUI model | 不同尺寸模型都会被 fit 到画面中 |
| 调 backgroundBlurriness | 只影响背景模糊，不等于模型变糊 |
| 选择带动画模型 | 观察 AnimationMixer 每帧推进 |
| 删除 fitCameraToSelection | 模型可能过大、过小或飞出画面 |

## 学完能拿来做什么

- 通用模型预览器
- 商品 3D 展示
- 自动适配任意模型上传
- 角色动画预览
- 资产审核工具

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
