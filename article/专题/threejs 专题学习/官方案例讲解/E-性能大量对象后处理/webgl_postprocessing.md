# webgl_postprocessing.html｜EffectComposer：后处理为什么不是 renderer.render

> 本地官方案例：[`webgl_postprocessing.html`](../../cases/webgl_postprocessing.html)  
> 本篇目标：学习后处理管线如何把场景先渲染到纹理，再通过多个 pass 做屏幕空间效果。

## 先从现实问题说起

很多画面效果不是物体材质本身能完成的，比如全屏调色、模糊、描边、屏幕空间扭曲。

这些效果需要先把场景渲染成一张图，再对这张图做处理。

`EffectComposer` 解决的是后处理管线管理问题。

## 先把基础概念说清楚

- `RenderPass` 先把原始 3D 场景画出来。
- `ShaderPass` 再把上一张结果当作输入做图像处理。
- 多个 pass 按顺序执行，顺序不同最终画面可能不同。

## 这个技术解决什么

这个案例适合理解为什么用了后处理后不再直接 `renderer.render(scene, camera)`。

真实项目里的 Bloom、SSAO、抗锯齿、调色、景深都属于这条管线。

## 打开案例后看什么

- 看 composer.addPass 的顺序。
- 理解 composer.render 替代 renderer.render。
- 分清材质效果和屏幕空间后处理效果。

## 官网核心代码

```js
composer = new EffectComposer( renderer );
composer.addPass( new RenderPass( scene, camera ) );

const effect1 = new ShaderPass( DotScreenShader );
effect1.uniforms[ 'scale' ].value = 4;
composer.addPass( effect1 );

const effect2 = new ShaderPass( RGBShiftShader );
effect2.uniforms[ 'amount' ].value = 0.0015;
composer.addPass( effect2 );

const effect3 = new OutputPass();
composer.addPass( effect3 );

composer.render();
```

## 这段代码到底在做什么

- RenderPass 把三维场景渲染成一张中间纹理。
- ShaderPass 读取上一张纹理，再输出处理后的画面。
- 多个 pass 像流水线一样串联，顺序不一样效果也不一样。
- 用了 composer 后，动画循环里通常调用 composer.render，而不是 renderer.render。
- 后处理是屏幕空间效果，不能改变真实灯光和几何。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `new EffectComposer( renderer )` | `第 1 个参数：renderer` | renderer：后处理使用的渲染器。 |
| `new RenderPass( scene, camera )` | `第 1 个参数：scene` | scene：先渲染的场景。 |
| `new RenderPass( scene, camera )` | `第 2 个参数：camera` | camera：渲染场景的相机。 |
| `new ShaderPass( DotScreenShader )` | `第 1 个参数：DotScreenShader` | shader：屏幕空间处理用 shader。 |
| `new ShaderPass( RGBShiftShader )` | `第 1 个参数：RGBShiftShader` | shader：屏幕空间处理用 shader。 |
| `composer.addPass( new RenderPass( scene, camera ) )` | `第 1 个参数：new RenderPass( scene, camera )` | pass：加入后处理流水线的处理节点。 |
| `composer.addPass( effect1 )` | `第 1 个参数：effect1` | pass：加入后处理流水线的处理节点。 |
| `composer.addPass( effect2 )` | `第 1 个参数：effect2` | pass：加入后处理流水线的处理节点。 |
| `composer.addPass( effect3 )` | `第 1 个参数：effect3` | pass：加入后处理流水线的处理节点。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 调整 pass 参数 | 画面滤镜变化 |
| 交换 pass 顺序 | 最终效果不同 |
| 关闭某个 pass | 确认它负责哪部分效果 |
| 降低渲染尺寸 | 观察性能和画质变化 |

## 学完能拿来做什么

- 描边、高亮、泛光
- 景深、噪声、胶片效果
- SSAO、SSR
- 游戏画面风格化
- 编辑器选中态

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
