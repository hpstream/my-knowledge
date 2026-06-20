# webgl_materials_envmaps.html｜Environment Maps：普通环境贴图和反射/折射

> 本地官方案例：[`webgl_materials_envmaps.html`](../../cases/webgl_materials_envmaps.html)  
> 本篇目标：学习环境贴图如何给物体提供反射和折射信息，并理解 mapping、CubeTexture、EquirectangularTexture 的区别。

## 先从现实问题说起

一个金属球为什么能看到周围倒影？玻璃球为什么能像看到背后的世界？

这不是把图片贴到球表面，而是球表面根据视线和法线方向去“看周围环境”。

这个案例讲最基础的环境贴图：给物体一个可以反射或折射的周围世界。

## 先把基础概念说清楚

- `envMap` 是环境贴图，不是普通颜色贴图。
- `CubeTexture` 是六张图拼成的周围世界，`EquirectangularTexture` 是一张 360 度全景图。
- `scene.background` 只是背景显示；材质要不要用环境反射，还要看 `envMap` 或 `scene.environment`。

## 这个技术解决什么

这个案例适合解决“envMap 到底是什么”的基础问题。

它是后面 HDR、PMREM、玻璃、金属材质的前置概念。

## 打开案例后看什么

- 切换反射和折射 mapping，看球体采样环境的方式怎么变。
- 隐藏 background 时，观察材质是否仍然可以使用 envMap。
- 调 reflectivity，看环境反射强弱变化。

## 官网核心代码

```js
const loader = new THREE.CubeTextureLoader();
loader.setPath( 'textures/cube/Bridge2/' );

textureCube = loader.load( [ 'posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg' ] );
textureEquirec.mapping = THREE.EquirectangularReflectionMapping;
scene.background = textureCube;
sphereMaterial = new THREE.MeshBasicMaterial( { envMap: textureCube } );
```

## 这段代码到底在做什么

- EquirectangularReflectionMapping 表示这是一张经纬度环境图，用于反射采样。
- envMap 不贴在物体表面，而是根据视线和法线方向采样环境。
- reflectivity 控制反射混合强度。
- 普通 envmap 可以做反射演示，但 PBR 写实材质通常要看 HDR + PMREM。
- background 显示环境图，不代表所有材质都自动使用它。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `new THREE.MeshBasicMaterial( { envMap: textureCube } )` | `envMap` | 环境贴图，控制反射来源。 |
| `textureEquirec.mapping = THREE.EquirectangularReflectionMapping` | `mapping` | 纹理映射方式，决定贴图作为反射、折射或全景图使用。 |
| `loader.setPath( 'textures/cube/Bridge2/' )` | `第 1 个参数：'textures/cube/Bridge2/'` | path：资源基础路径。 |
| `loader.load( [ 'posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg' ] )` | `第 1 个参数：[ 'posx.jpg', 'negx.jpg', 'posy.jpg', 'negy.jpg', 'posz.jpg', 'negz.jpg' ]` | url：资源路径。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 切换 mapping | 反射/折射效果变化 |
| 调 reflectivity | 环境反射强弱变化 |
| 换 envMap | 反射世界改变 |
| 隐藏 background | 材质仍可使用 envMap |

## 学完能拿来做什么

- 金属反射
- 玻璃折射
- 天空盒
- 产品环境反射
- 材质预览器

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
