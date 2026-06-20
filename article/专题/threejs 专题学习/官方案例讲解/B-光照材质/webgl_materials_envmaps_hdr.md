# webgl_materials_envmaps_hdr.html｜HDR EnvMap：IBL、PMREM 和金属反射

> 本地官方案例：[`webgl_materials_envmaps_hdr.html`](../../cases/webgl_materials_envmaps_hdr.html)  
> 本篇目标：学习 HDR 环境贴图如何通过 PMREM 变成适合 PBR 材质采样的反射环境，并比较 Generated/LDR/HDR 的差别。

## 先从现实问题说起

你先不要管 `HDR`、`PMREM`、`IBL` 这些词。这个案例真正想解决的是一个很现实的问题：

**为什么同一个金属物体，有时看起来像真金属，有时看起来像一坨灰色塑料？**

现实里，一个金属杯、手机边框、汽车车漆好不好看，很大程度不是因为它自己发光，而是因为它在反射周围环境：

- 旁边有一扇亮窗户，金属上会出现一条亮亮的窗户反光。
- 房间里有暖色灯，金属会带一点暖色。
- 周围环境很暗，金属就会显得沉闷。
- 表面越光滑，倒影越清楚；表面越粗糙，倒影越糊。

所以做 PBR 材质时，不能只给物体一个颜色。你还要告诉它：**周围世界长什么样，哪里特别亮。**

这就是环境贴图的作用。

## 普通环境贴图为什么不够

普通 JPG/PNG 环境图像一张手机照片。它能告诉 3D 物体“周围有墙、有窗、有天空”，所以物体可以反射这些颜色和形状。

但普通图片有一个问题：它经常把很亮的东西压成一片白。

比如现实里：

```txt
墙：有点亮
白桌子：更亮一点
窗户：非常亮
太阳：亮到刺眼
```

普通图片可能最后只记成：

```txt
墙：白
白桌子：白
窗户：白
太阳：白
```

这样金属材质就分不清：到底哪里只是白色，哪里是真的很亮。反射出来的高光就会变平、变假。

## HDR 是什么

`HDR` 先用人话理解：**这张图不只记录颜色，还记录“有多亮”。**

它不是一种材质，也不是另一种灯光。它就是一种保存更多亮度信息的图片。

普通图片像普通照片：

```txt
这里是白色。
那里也是白色。
```

HDR 图片像带测光信息的环境照片：

```txt
这里是白色，但只是墙面白。
那里也是白色，但它是窗户，比墙亮很多。
太阳也是白色，但它比窗户还亮很多。
```

这就是 HDR 环境图的价值：金属、玻璃、车漆能知道哪里真的亮，哪里只是颜色浅。

## PMREM 为什么又出现了

现在有了 HDR 环境图，问题还没结束。

现实里的反射还和表面粗糙度有关：

- 镜子、抛光金属：反射很清楚。
- 磨砂金属、粗糙塑料：反射很糊。

如果只有一张清晰环境图，Three.js 不能直接拿它同时满足所有粗糙度。`roughness: 0` 的材质需要清楚倒影；`roughness: 1` 的材质需要很模糊的倒影。

`PMREM` 可以先简单理解成：**把同一张环境图提前做成很多份不同模糊程度的版本。**

```txt
原始 HDR 环境图
├─ 很清楚的一份：给光滑金属用
├─ 有点糊的一份：给半粗糙材质用
└─ 很糊的一份：给粗糙材质用
```

这样材质的 `roughness` 改变时，Three.js 就能从合适的模糊版本里取反射，看起来更接近真实。

## 这个案例到底在演示什么

这个案例不是为了让你背 API。它在演示一条链路：

```txt
加载环境图
-> 如果是 HDR，就保留真实亮度差
-> 用 PMREM 生成适合不同 roughness 的反射版本
-> 把生成结果交给金属材质 envMap 使用
-> 最后用 toneMappingExposure 控制输出曝光
```

打开案例后，你主要看这几件事：

- 切到 `LDR`：普通环境图也能反射，但高光层次有限。
- 切到 `HDR`：亮部信息更丰富，金属高光更有真实感。
- 调 `metalness`：越接近金属，越依赖环境反射。
- 调 `roughness`：越粗糙，反射越糊；越光滑，反射越清楚。
- 开 `debug`：直接看当前用来反射的环境图。

所以这个案例的用途是：让你明白为什么 PBR 金属/玻璃不能只靠颜色贴图，还需要 HDR 环境图和 PMREM。

## 官网核心代码

```js
hdrCubeMap = new HDRCubeTextureLoader()
  .setPath( './textures/cube/pisaHDR/' )
  .load( hdrUrls, function () {
    hdrCubeRenderTarget = pmremGenerator.fromCubemap( hdrCubeMap );
  } );

const pmremGenerator = new THREE.PMREMGenerator( renderer );
ldrCubeRenderTarget = pmremGenerator.fromCubemap( ldrCubeMap );

const newEnvMap = renderTarget ? renderTarget.texture : null;
torusMesh.material.envMap = newEnvMap;
torusMesh.material.needsUpdate = true;

scene.background = cubeMap;
renderer.toneMappingExposure = params.exposure;
```

## 这段代码到底在做什么

- HDRCubeTextureLoader 加载六张 .hdr cube face，包含更丰富亮度。
- PMREMGenerator.fromCubemap 会生成按粗糙度预过滤的环境贴图。
- renderTarget.texture 才是 PBR 材质真正使用的预过滤环境贴图。
- 材质 envMap 换掉后要 needsUpdate，否则 shader 可能不会按新贴图重新编译。
- scene.background 用原始 cubeMap 做背景显示；它和材质 envMap 是相关但不同的用途。
- renderer.toneMappingExposure 控制 HDR 高亮压到屏幕前的整体曝光。

## 和 FastHDR 案例有什么区别

`webgl_materials_envmaps_hdr.html` 重点是教你理解 HDR 环境贴图进入 PBR 材质前的完整流程：加载 HDR/LDR 环境图，然后在运行时用 `PMREMGenerator` 生成适合 `roughness` 采样的预过滤环境贴图。

`webgl_materials_envmaps_fasthdr.html` 重点不是教你生成 PMREM，而是教你使用已经预处理好的 `.pmrem.ktx2` 文件。它把 PMREM 这一步提前离线做好，运行时直接加载压缩纹理，所以更偏项目性能优化。

| 对比点 | `webgl_materials_envmaps_hdr.html` | `webgl_materials_envmaps_fasthdr.html` |
|---|---|---|
| 主要目标 | 学 HDR/LDR 环境图如何经过 PMREM 后用于 PBR 反射 | 学预过滤好的 FastHDR/KTX2 环境图如何快速加载 |
| 环境图来源 | 六张 cube face：`.hdr` 或 `.png` | 一张 `.pmrem.ktx2` |
| 加载器 | `HDRCubeTextureLoader`、`CubeTextureLoader` | `KTX2Loader` |
| PMREM 处理 | 运行时调用 `pmremGenerator.fromCubemap()` / `fromScene()` | 文件已经是 PMREM，运行时不再生成 |
| 材质使用方式 | 手动把 `renderTarget.texture` 赋给 `torusMesh.material.envMap` | 直接把 texture 赋给 `scene.environment` |
| 背景和反射 | 背景用原始 `cubeMap`，材质反射用 PMREM 后的 `envMap` | 背景和环境反射都用同一张预过滤 KTX2 |
| 案例观察点 | 比较 `Generated`、`LDR`、`HDR` 和 `roughness/metalness` | 比较不同 FastHDR 环境，以及 5 个不同材质球 |

一句话记：`hdr` 这个案例是“教原理和流程”，让你看懂为什么 PBR 环境反射需要 PMREM；`fasthdr` 这个案例是“教工程优化”，让你直接使用已经压缩和预过滤好的环境图。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `torusMesh.material.envMap = newEnvMap` | `envMap` | 环境贴图，控制反射来源。 |
| `renderer.toneMappingExposure = params.exposure` | `toneMappingExposure` | 最终输出曝光值，影响画面明暗。 |
| `pmremGenerator.fromCubemap( hdrCubeMap )` | `第 1 个参数：hdrCubeMap` | cubeTexture：要预过滤的 cube 环境贴图。 |
| `pmremGenerator.fromCubemap( ldrCubeMap )` | `第 1 个参数：ldrCubeMap` | cubeTexture：要预过滤的 cube 环境贴图。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 切 Generated/LDR/HDR | 环境质量和高光层次变化 |
| 调 metalness | 从塑料转向金属反射 |
| 调 roughness | 反射从清晰变模糊 |
| 打开 debug | 平面显示当前环境贴图 |

## 学完能拿来做什么

- PBR 材质预览器
- 金属产品展示
- HDR 环境照明
- 材质调试工具
- 反射质量对比

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
