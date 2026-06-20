# webgl_materials_texture_filters.html｜Texture Filters：贴图放大缩小时怎么采样

> 本地官方案例：[`webgl_materials_texture_filters.html`](../../cases/webgl_materials_texture_filters.html)  
> 本篇目标：学习 magFilter、minFilter、mipmap 如何决定贴图近看、远看、缩小时的清晰度、像素感和闪烁。

## 先从现实问题说起

同一张贴图，近看可能有像素块，远看可能闪烁，缩小时可能糊。

这不是贴图“坏了”，而是 GPU 在不同尺寸下怎么采样的问题。

这个案例讲 `magFilter`、`minFilter`、`mipmap` 如何影响贴图清晰度。

## 先把基础概念说清楚

- `magFilter` 处理贴图被放大时怎么取样。
- `minFilter` 处理贴图被缩小时怎么取样。
- `mipmap` 是提前准备一组小尺寸贴图，减少远处闪烁。

## 这个技术解决什么

像素风项目可能故意用 `NearestFilter` 保留方块感。

写实项目通常需要 mipmap 和线性过滤，让远近变化更平滑。

## 打开案例后看什么

- 近看时观察像素块和平滑采样的差别。
- 远看时观察是否闪烁或摩尔纹。
- 理解不同 filter 是风格和性能的选择，不是固定谁最好。

## 官网核心代码

```js
const textureCanvas = new THREE.CanvasTexture( imageCanvas );
textureCanvas.repeat.set( 1000, 1000 );
textureCanvas.wrapS = THREE.RepeatWrapping;
textureCanvas.wrapT = THREE.RepeatWrapping;

const textureCanvas2 = textureCanvas.clone();
textureCanvas2.magFilter = THREE.NearestFilter;
textureCanvas2.minFilter = THREE.NearestFilter;
textureCanvas2.generateMipmaps = false;
```

## 这段代码到底在做什么

- repeat 很大时，远处会出现大量高频纹理，最容易暴露采样问题。
- NearestFilter 直接取最近像素，所以边缘硬、像素感强。
- LinearFilter 会在相邻像素间插值，更平滑。
- minFilter 缩小时如果不用 mipmap，远处容易闪烁。
- generateMipmaps=false 表示不生成多级小图，适合某些像素风或特殊纹理。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `textureCanvas.wrapS = THREE.RepeatWrapping` | `wrapS` | 纹理横向包裹方式。 |
| `textureCanvas.wrapT = THREE.RepeatWrapping` | `wrapT` | 纹理纵向包裹方式。 |
| `textureCanvas.repeat.set( 1000, 1000 )` | `第 1 个参数：1000` | x：第一个分量。 |
| `textureCanvas.repeat.set( 1000, 1000 )` | `第 2 个参数：1000` | y：第二个分量。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 看左右分屏 | 平滑采样和最近邻采样差异 |
| 调 repeat | 远处闪烁更明显 |
| 打开/关闭 mipmap | 远处稳定性变化 |
| 换像素风贴图 | 理解 NearestFilter 的用途 |

## 学完能拿来做什么

- 像素风材质
- 地面/墙面重复纹理
- UI 贴图采样
- 减少远处摩尔纹
- 纹理质量调试

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
