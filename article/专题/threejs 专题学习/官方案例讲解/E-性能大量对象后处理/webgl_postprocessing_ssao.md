# webgl_postprocessing_ssao.html｜SSAO：为什么角落和接缝需要更暗一点

> 本地官方案例：[`webgl_postprocessing_ssao.html`](../../cases/webgl_postprocessing_ssao.html)  
> 本篇目标：学习屏幕空间环境遮蔽如何让接触处、缝隙和角落变暗，增强空间层次。

## 先从现实问题说起

场景里物体接触处、墙角、缝隙如果没有一点变暗，会显得很平，没有空间压迫感。

真实世界里这些地方光线更难进去，所以通常会更暗。

`SSAO` 用屏幕空间近似方式给接缝和角落补一点环境遮蔽。

## 先把基础概念说清楚

- SSAO 是后处理，不是真实阴影，也不会改变灯光本身。
- 它依赖屏幕上的深度和法线信息，估计周围是否被遮挡。
- `radius` 控制采样范围，强度太高会显脏。

## 这个技术解决什么

它适合补足环境光过平的问题，让模型接触关系更清楚。

游戏和可视化里常用 SSAO 提升空间层次，但要避免过重。

## 打开案例后看什么

- 开关 SSAO，看角落和接触处是否更有层次。
- 调 radius/strength，看从自然变脏的临界点。
- 记住它是屏幕空间效果，视角外的信息它不知道。

## 官网核心代码

```js
const ssaoPass = new SSAOPass( scene, camera, width, height );
composer.addPass( ssaoPass );

const outputPass = new OutputPass();
composer.addPass( outputPass );

gui.add( ssaoPass, 'kernelRadius' ).min( 0 ).max( 32 );
gui.add( ssaoPass, 'minDistance' ).min( 0.001 ).max( 0.02 );
gui.add( ssaoPass, 'maxDistance' ).min( 0.01 ).max( 0.3 );
```

## 这段代码到底在做什么

- SSAO 根据屏幕上像素附近的深度关系推测遮蔽。
- composer.addPass 把 SSAO 插入后处理流水线，原始场景渲染完后再计算遮蔽。
- OutputPass 负责最后输出到屏幕，避免后处理结果停在中间纹理里。
- kernelRadius 大，遮蔽范围大但成本和噪点风险也更高。
- minDistance/maxDistance 控制哪些距离范围算遮蔽。
- 因为是屏幕空间，屏幕外物体不会参与计算。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `new SSAOPass( scene, camera, width, height )` | `第 1 个参数：scene` | scene：参与 SSAO 的场景。 |
| `new SSAOPass( scene, camera, width, height )` | `第 2 个参数：camera` | camera：当前相机。 |
| `new SSAOPass( scene, camera, width, height )` | `第 3 个参数：width` | width：处理宽度。 |
| `new SSAOPass( scene, camera, width, height )` | `第 4 个参数：height` | height：处理高度。 |
| `composer.addPass( ssaoPass )` | `第 1 个参数：ssaoPass` | pass：加入后处理流水线的处理节点。 |
| `composer.addPass( outputPass )` | `第 1 个参数：outputPass` | pass：加入后处理流水线的处理节点。 |
| `gui.add( ssaoPass, 'kernelRadius' )` | `kernelRadius` | SSAO 采样半径，影响遮蔽范围。 |
| `gui.add( ssaoPass, 'minDistance' )` | `minDistance` | 相机离目标点最近距离。 |
| `gui.add( ssaoPass, 'maxDistance' )` | `maxDistance` | 相机离目标点最远距离。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 开关 SSAO | 观察接触阴影和角落层次 |
| 调 kernelRadius | 遮蔽范围变大变小 |
| 调强度 | 过高会脏 |
| 移动相机 | 理解屏幕空间限制 |

## 学完能拿来做什么

- 室内场景
- 产品落地接触阴影
- 游戏环境层次增强
- 建筑可视化
- 低成本真实感增强

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
