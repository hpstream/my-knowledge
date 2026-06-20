# webgl_materials_texture_anisotropy.html｜Texture Anisotropy：斜着看地面为什么会糊

> 本地官方案例：[`webgl_materials_texture_anisotropy.html`](../../cases/webgl_materials_texture_anisotropy.html)  
> 本篇目标：学习各向异性过滤如何改善斜视角下的地面、道路、跑道和长走廊贴图清晰度。

## 先从现实问题说起

地面、道路、跑道这类长平面，正面看很清楚，斜着看远处却容易糊成一片。

这不是贴图本身分辨率一定不够，而是普通采样在斜视角下不够好。

`anisotropy` 解决的是“斜着看贴图时保持清晰”的问题。

## 先把基础概念说清楚

- 各向异性过滤会沿着视角拉长的方向多采样，让斜视角纹理更清楚。
- `renderer.capabilities.getMaxAnisotropy()` 可以得到当前设备支持上限。
- 数值越高通常越清晰，但也会更贵，不是所有贴图都要开满。

## 这个技术解决什么

这个案例适合地面、道路、地砖、跑道、走廊等长距离纹理。

如果贴图是贴在小物体上，或者用户不会斜着看很远，可能不需要高各向异性。

## 打开案例后看什么

- 对比不同 anisotropy 值下远处地面的清晰度。
- 注意它改善的是采样清晰度，不是改变贴图内容。
- 记住设备有上限，真实项目要在质量和性能之间取舍。

## 官网核心代码

```js
const maxAnisotropy = renderer.capabilities.getMaxAnisotropy();

texture1.anisotropy = maxAnisotropy;
texture1.wrapS = texture1.wrapT = THREE.RepeatWrapping;
texture1.repeat.set( 512, 512 );

texture2.anisotropy = 1;
```

## 这段代码到底在做什么

- 斜着看地面时，一个屏幕像素对应纹理中又长又扁的一块区域。
- 普通 mipmap 可能把远处细节平均糊掉。
- anisotropy 会沿斜视方向做更好的采样，保留远处纹理细节。
- getMaxAnisotropy 返回当前 GPU 支持的最大级别。
- 高 anisotropy 有成本，应该优先给地面、道路等明显受益的贴图。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `texture1.anisotropy = maxAnisotropy` | `anisotropy` | 各向异性采样等级，提升斜视角纹理清晰度。 |
| `texture1.wrapS = texture1.wrapT = THREE.RepeatWrapping` | `wrapS` | 纹理横向包裹方式。 |
| `texture2.anisotropy = 1` | `anisotropy` | 各向异性采样等级，提升斜视角纹理清晰度。 |
| `texture1.repeat.set( 512, 512 )` | `第 1 个参数：512` | x：第一个分量。 |
| `texture1.repeat.set( 512, 512 )` | `第 2 个参数：512` | y：第二个分量。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 看左右分屏远处地面 | 高 anisotropy 更清晰 |
| 把 anisotropy 改 1/2/4/8 | 观察清晰度和成本 |
| 改变相机角度 | 斜视角差异最明显 |
| 减少 repeat | 采样问题变不明显 |

## 学完能拿来做什么

- 道路/跑道
- 长走廊
- 地砖/地毯
- 赛车游戏地面
- 大面积重复纹理

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
