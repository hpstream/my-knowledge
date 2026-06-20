# webgl_loader_gltf_variants.html｜GLTF Variants：同一个模型切换不同材质方案

> 本地官方案例：[`webgl_loader_gltf_variants.html`](../../cases/webgl_loader_gltf_variants.html)  
> 本篇目标：学习 glTF 的 KHR_materials_variants 扩展，用一个模型承载多个材质变体，例如鞋子的不同配色。

## 先从现实问题说起

电商或配置器里，同一个产品可能有多种颜色、材质、版本，比如一双鞋换皮革、布面、不同配色。

如果每个版本都导出一个完整模型，会浪费空间，也不好管理。

glTF material variants 解决的是“同一个模型切换多套材质”的问题。

## 先把基础概念说清楚

- 材质变体不是换模型结构，而是给同一批 mesh 准备多套材质选择。
- 用户切换变体时，代码把对应 mesh 的 material 换成变体材质。
- 它适合产品展示和配置器，不适合拓扑完全不同的模型版本。

## 这个技术解决什么

这个案例让你理解为什么变体应该和资产数据绑定，而不是手写一堆 if 改材质。

真实项目里，颜色/材质配置可以直接来自 glTF 文件里的 variants 信息。

## 打开案例后看什么

- 看 GUI 切换变体时哪些材质发生变化。
- 看同一个模型几何是否保持不变。
- 理解 variants 解决的是材质选择，不是动画或模型替换。

## 官网核心代码

```js
const variantsExtension = gltf.userData.gltfExtensions[ 'KHR_materials_variants' ];
const variants = variantsExtension.variants.map( ( variant ) => variant.name );

const meshVariantDef = object.userData.gltfExtensions[ 'KHR_materials_variants' ];
const mapping = meshVariantDef.mappings
  .find( ( mapping ) => mapping.variants.includes( variantIndex ) );
object.material = await parser.getDependency( 'material', mapping.material );
```

## 这段代码到底在做什么

- KHR_materials_variants 把“同一个模型有哪些可切换材质”写进 glTF 文件里。
- 全局 variantsExtension 保存变体名称，例如不同颜色或不同商品 SKU。
- 每个 mesh 自己记录这个变体应该使用哪个 material。
- parser.getDependency("material", id) 从 glTF 内部按索引取出材质对象，不需要你手写材质。
- 切换变体时，只换材质，不重新加载几何体，所以很适合商品配置器。
- 案例还缓存原始材质，方便从变体切回默认外观。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

这个案例的核心片段主要展示调用顺序或对象关系，没有额外需要展开的数值参数。

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 在 GUI 切换材质变体 | 同一只鞋快速换配色 |
| 看代码里的 mappings | 理解不同 mesh 可以映射到不同材质 |
| 切回 default | 确认原材质被缓存 |
| 换自己的 glTF variants 模型 | 理解变体信息需要资产里提前写好 |

## 学完能拿来做什么

- 做鞋子、汽车、家具、手表的颜色配置器
- 做商品 SKU 预览
- 做材质方案对比工具
- 做设计评审里的多方案切换
- 扩展成颜色、材质、部件组合的完整配置系统

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
