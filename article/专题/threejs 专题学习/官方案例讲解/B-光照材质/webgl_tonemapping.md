# webgl_tonemapping.html｜Tone Mapping：曝光和高动态范围压缩

> 本地官方案例：[`webgl_tonemapping.html`](../../cases/webgl_tonemapping.html)  
> 本篇目标：学习高亮、HDR 环境和 PBR 模型最终如何被压到屏幕可显示范围，以及不同 tone mapping 算法的观感差异。

## 先从现实问题说起

HDR 环境、金属、玻璃和高亮都算完后，画面还要显示到普通屏幕上。

屏幕能显示的亮度有限，如果直接显示，高光可能死白，暗部可能没层次，整体可能太灰或太刺眼。

`toneMapping` 解决的是“最终画面怎么压到屏幕可显示范围”的问题。

## 先把基础概念说清楚

- `toneMapping` 是输出阶段处理，不是某一盏灯，也不是某个材质。
- `toneMappingExposure` 像相机曝光，会影响最终整张画面。
- 不同 tone mapping 算法会让高光、对比度、色彩观感不同。

## 这个技术解决什么

当你觉得材质和灯光都对，但画面过曝、太灰、高光不好看时，就要看 tone mapping。

它常用于产品渲染、HDR 场景、夜景、游戏最终画面风格统一。

## 打开案例后看什么

- 切换 None/Linear/Reinhard/ACES/AgX/Neutral，看高光压缩差异。
- 调 exposure，看整张画面如何变亮或变暗。
- 区分 backgroundBlurriness/backgroundIntensity 和材质反射的区别。

## 官网核心代码

```js
renderer.toneMapping = toneMappingOptions[ params.toneMapping ];
renderer.toneMappingExposure = params.exposure;

texture.mapping = THREE.EquirectangularReflectionMapping;
scene.background = texture;
scene.environment = texture;

guiExposure = toneMappingFolder.add( params, 'exposure', 0, 2 )
  .onChange( function ( value ) {

    renderer.toneMappingExposure = value;

  } );
```

## 这段代码到底在做什么

- toneMapping 决定高亮如何被压回屏幕范围。
- toneMappingExposure 是全局曝光，所有物体最终都会受影响。
- HDR 环境贴图让金属、玻璃、高光更真实，也更需要 tone mapping。
- None 不做映射，高亮容易截断，官网因此隐藏 exposure 控件。
- CustomToneMapping 演示了可以替换 shader chunk 自定义曲线。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `renderer.toneMapping = toneMappingOptions[ params.toneMapping ]` | `toneMapping` | 色调映射方式，把高亮结果压缩到屏幕可显示范围。 |
| `renderer.toneMappingExposure = params.exposure` | `toneMappingExposure` | 最终输出曝光值，影响画面明暗。 |
| `texture.mapping = THREE.EquirectangularReflectionMapping` | `mapping` | 纹理映射方式，决定贴图作为反射、折射或全景图使用。 |
| `renderer.toneMappingExposure = value` | `toneMappingExposure` | 最终输出曝光值，影响画面明暗。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 切 None/Linear/Reinhard/ACES/AgX/Neutral | 看高光和整体对比 |
| 调 exposure | 整体亮度变化 |
| 调 backgroundBlurriness | 背景模糊但材质反射不等同变化 |
| 调 backgroundIntensity | 背景显示强度变化 |

## 学完能拿来做什么

- 产品渲染调色
- HDR 场景曝光
- 夜景灯光控制
- 影视感画面
- PBR 最终观感统一

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
