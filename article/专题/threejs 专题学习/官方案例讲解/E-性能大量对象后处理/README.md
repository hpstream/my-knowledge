# E｜性能大量对象和后处理

这个目录只放 three.js 官网 examples 的逐篇讲解。每篇文档对应一个本地官方 HTML 案例，文件名保持官网原名。

| 官方案例 | 讲解文档 | 这一篇学什么 |
|---|---|---|
| [`webgl_instancing_dynamic.html`](../../cases/webgl_instancing_dynamic.html) | [Dynamic Instancing：大量实例动起来时要更新什么](./webgl_instancing_dynamic.md) | 学习实例矩阵每帧变化时如何更新 instanceMatrix，并理解 DynamicDrawUsage 的意义。 |
| [`webgl_instancing_performance.html`](../../cases/webgl_instancing_performance.html) | [Instancing Performance：一万个对象为什么不该是一万个 Mesh](./webgl_instancing_performance.md) | 学习 InstancedMesh 如何用一次 draw call 绘制大量相同几何，并比较普通 Mesh、merged geometry 和 instancing 的差别。 |
| [`webgl_lines_fat.html`](../../cases/webgl_lines_fat.html) | [Fat Lines：普通 Line 为什么控制不了稳定宽度](./webgl_lines_fat.md) | 学习 Line2/LineMaterial 如何实现屏幕空间粗线，并理解 resolution 对线宽计算的影响。 |
| [`webgl_points_sprites.html`](../../cases/webgl_points_sprites.html) | [Points Sprites：什么时候不要用 Mesh](./webgl_points_sprites.md) | 学习用 Points 和贴图点精灵渲染大量小元素，而不是为每个点创建独立 Mesh。 |
| [`webgl_postprocessing_ssao.html`](../../cases/webgl_postprocessing_ssao.html) | [SSAO：为什么角落和接缝需要更暗一点](./webgl_postprocessing_ssao.md) | 学习屏幕空间环境遮蔽如何让接触处、缝隙和角落变暗，增强空间层次。 |
| [`webgl_postprocessing_unreal_bloom.html`](../../cases/webgl_postprocessing_unreal_bloom.html) | [UnrealBloomPass：发光光晕为什么是后期，不是真灯](./webgl_postprocessing_unreal_bloom.md) | 学习 Bloom 如何让高亮区域在屏幕上向周围扩散，并区分它和真实照明的区别。 |
| [`webgl_postprocessing.html`](../../cases/webgl_postprocessing.html) | [EffectComposer：后处理为什么不是 renderer.render](./webgl_postprocessing.md) | 学习后处理管线如何把场景先渲染到纹理，再通过多个 pass 做屏幕空间效果。 |
