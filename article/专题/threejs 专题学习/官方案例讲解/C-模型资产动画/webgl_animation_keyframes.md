# webgl_animation_keyframes.html｜Animation Keyframes：播放 glTF 关键帧动画

> 本地官方案例：[`webgl_animation_keyframes.html`](../../cases/webgl_animation_keyframes.html)  
> 本篇目标：学习 glTF 模型自带动画如何通过 AnimationMixer 播放，并用 deltaTime 保持不同帧率下速度一致。

## 先从现实问题说起

现实里的角色和模型动画，不可能每一帧都手写位置。通常是美术在 DCC 软件里做关键帧，程序负责播放。

你需要知道动画片段怎么加载、怎么播放、怎么循环，以及为什么同一个模型可以带多个动作。

这个案例讲 Three.js 里最基础的关键帧动画播放。

## 先把基础概念说清楚

- `AnimationMixer` 像播放器，负责推进模型上的动画时间。
- `clipAction` 像把某个动画片段放进播放器。
- `clock.getDelta()` 提供每帧过去的时间，让动画速度和帧率解耦。

## 这个技术解决什么

它适合加载带动画的 glTF 角色、机械、道具，然后播放官网模型自带的 animation clip。

后面学习动作混合、换装、压缩模型前，先要懂这一条基本播放链。

## 打开案例后看什么

- 看模型加载后 `gltf.animations` 里有哪些片段。
- 看 `mixer.update(delta)` 为什么必须在动画循环里调用。
- 观察模型动作和渲染循环之间的关系。

## 官网核心代码

```js
loader.load( 'models/gltf/LittlestTokyo.glb', function ( gltf ) {
  const model = gltf.scene;
  scene.add( model );

  mixer = new THREE.AnimationMixer( model );
  mixer.clipAction( gltf.animations[ 0 ] ).play();
} );

timer.update();
const delta = timer.getDelta();
mixer.update( delta );
```

## 这段代码到底在做什么

- glTF 文件不只保存模型，也可以保存动画剪辑。
- AnimationMixer 绑定到模型根节点，负责计算动画对模型层级的影响。
- clipAction 把一个 AnimationClip 变成可播放、暂停、调速、混合的动作。
- play() 只是开始播放，真正推进动画的是每帧 mixer.update(delta)。
- deltaTime 表示上一帧到这一帧经过的真实时间，避免高刷屏动画变快、低帧率动画变慢。
- 案例还用 PMREM 环境贴图，让模型材质在动画中仍有稳定真实的反射和光照。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `new THREE.AnimationMixer( model )` | `第 1 个参数：model` | root：动画绑定的根对象。 |
| `loader.load( 'models/gltf/LittlestTokyo.glb', function ( gltf ) { const model = gltf.scene; scene.add( model )` | `第 1 个参数：'models/gltf/LittlestTokyo.glb'` | url：资源路径。 |
| `loader.load( 'models/gltf/LittlestTokyo.glb', function ( gltf ) { const model = gltf.scene; scene.add( model )` | `第 2 个参数：function ( gltf ) {   const model = gltf.scene;   scene.add( model );   mixer = new THREE.AnimationMixer( model );   mixer.clipAction( gltf.animations[ 0 ] ).play(); }` | onLoad：加载成功回调。 |
| `mixer.clipAction( gltf.animations[ 0 ] )` | `第 1 个参数：gltf.animations[ 0 ]` | clip：要播放的动画片段。 |
| `timer.update( )` | `无参数` | delta：可选帧间隔；无参数时按控件/辅助对象内部状态更新。 |
| `mixer.update( delta )` | `第 1 个参数：delta` | delta：可选帧间隔；无参数时按控件/辅助对象内部状态更新。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 打开案例看小东京动画 | 模型、相机和环境一起工作 |
| 暂停 mixer.update | 动画停止但场景仍渲染 |
| 改变动画 speed/timeScale | 播放速度改变 |
| 换 glTF 动画模型 | 理解动画数据跟模型骨骼/节点绑定 |

## 学完能拿来做什么

- 播放角色、机械、城市、产品演示动画
- 做模型查看器里的动画预览
- 做数字孪生设备运转动画
- 做游戏 NPC 或场景循环动画
- 扩展成动画暂停、倍速、时间轴拖动

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
