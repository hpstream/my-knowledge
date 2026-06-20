# webgl_camera.html｜Camera：透视相机、正交相机和 CameraHelper

> 本地官方案例：[`webgl_camera.html`](../../cases/webgl_camera.html)  
> 本篇目标：学习相机视锥、near/far 裁剪面、透视/正交切换，以及为什么 CameraHelper 能帮你看见“另一台相机在拍哪里”。

## 先从现实问题说起

3D 里“看不见”不一定是模型丢了，很多时候是相机没拍到。

相机有视野范围、近裁剪面、远裁剪面。物体太近会被裁掉，太远也会消失；透视相机会近大远小，正交相机不会。

这个案例解决的是：怎么理解相机到底在拍哪里，以及为什么 `CameraHelper` 能帮你调试视锥。

## 先把基础概念说清楚

- `PerspectiveCamera` 像人眼或真实相机，近处大、远处小。
- `OrthographicCamera` 像工程图或 2D 编辑器，远近大小不变。
- `near/far` 是相机能看到的深度范围；`CameraHelper` 是把这个范围画出来给你看。

## 这个技术解决什么

当你遇到模型突然消失、阴影范围不对、分屏预览不知道另一台相机在看哪里时，这类调试非常有用。

这个案例还演示左右分屏，让你同时看“主相机画面”和“相机本身的调试视角”。

## 打开案例后看什么

- 看左边和右边为什么能显示不同相机视角。
- 观察 helper 画出来的视锥，理解 near/far 和视野范围。
- 切换透视/正交时，看远近物体大小关系怎么变。

## 官网核心代码

```js
cameraPerspective = new THREE.PerspectiveCamera( 50, 0.5 * aspect, 150, 1000 );
cameraPerspectiveHelper = new THREE.CameraHelper( cameraPerspective );
scene.add( cameraPerspectiveHelper );

cameraOrtho = new THREE.OrthographicCamera( 0.5 * frustumSize * aspect / - 2, 0.5 * frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 150, 1000 );
cameraOrthoHelper = new THREE.CameraHelper( cameraOrtho );
scene.add( cameraOrthoHelper );
```

## 这段代码到底在做什么

- PerspectiveCamera 的 fov、aspect、near、far 共同决定可见的锥形区域。
- OrthographicCamera 用 left/right/top/bottom 定义盒状可视区域，适合 CAD、编辑器和等距视角。
- CameraHelper 把不可见的相机视锥画出来，调 shadow camera 和编辑器相机时很有价值。
- near 太大时近处物体会被裁掉，far 太小时远处物体会消失。
- 窗口尺寸变化后不调用 updateProjectionMatrix，相机内部投影矩阵仍是旧比例。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `new THREE.PerspectiveCamera( 50, 0.5 * aspect, 150, 1000 )` | `第 1 个参数：50` | fov：垂直视野角，数值越大越广角。 |
| `new THREE.PerspectiveCamera( 50, 0.5 * aspect, 150, 1000 )` | `第 2 个参数：0.5 * aspect` | aspect：宽高比。 |
| `new THREE.PerspectiveCamera( 50, 0.5 * aspect, 150, 1000 )` | `第 3 个参数：150` | near：近裁剪面。 |
| `new THREE.PerspectiveCamera( 50, 0.5 * aspect, 150, 1000 )` | `第 4 个参数：1000` | far：远裁剪面。 |
| `new THREE.CameraHelper( cameraPerspective )` | `第 1 个参数：cameraPerspective` | camera：要可视化视锥的相机。 |
| `new THREE.OrthographicCamera( 0.5 * frustumSize * aspect / - 2, 0.5 * frustumSize * aspect / 2, frustumSize / ` | `第 1 个参数：0.5 * frustumSize * aspect / - 2` | left：正交视锥左边界。 |
| `new THREE.OrthographicCamera( 0.5 * frustumSize * aspect / - 2, 0.5 * frustumSize * aspect / 2, frustumSize / ` | `第 2 个参数：0.5 * frustumSize * aspect / 2` | right：正交视锥右边界。 |
| `new THREE.OrthographicCamera( 0.5 * frustumSize * aspect / - 2, 0.5 * frustumSize * aspect / 2, frustumSize / ` | `第 3 个参数：frustumSize / 2` | top：正交视锥上边界。 |
| `new THREE.OrthographicCamera( 0.5 * frustumSize * aspect / - 2, 0.5 * frustumSize * aspect / 2, frustumSize / ` | `第 4 个参数：frustumSize / - 2` | bottom：正交视锥下边界。 |
| `new THREE.OrthographicCamera( 0.5 * frustumSize * aspect / - 2, 0.5 * frustumSize * aspect / 2, frustumSize / ` | `第 5 个参数：150` | near：近裁剪面。 |
| `new THREE.OrthographicCamera( 0.5 * frustumSize * aspect / - 2, 0.5 * frustumSize * aspect / 2, frustumSize / ` | `第 6 个参数：1000` | far：远裁剪面。 |
| `new THREE.CameraHelper( cameraOrtho )` | `第 1 个参数：cameraOrtho` | camera：要可视化视锥的相机。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 按 P | 切换透视相机 |
| 按 O | 切换正交相机 |
| 看右侧辅助视图 | 理解 activeCamera 的视锥 |
| 改 near/far | 观察物体被裁切 |

## 学完能拿来做什么

- 三维编辑器双视图
- 相机调试工具
- 阴影相机调试
- CAD/工业模型正交视图
- 游戏过场镜头可视化

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
