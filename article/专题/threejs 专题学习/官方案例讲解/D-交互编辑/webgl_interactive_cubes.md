# webgl_interactive_cubes.html｜Raycaster：鼠标悬停拾取 2000 个立方体

> 本地官方案例：[`webgl_interactive_cubes.html`](../../cases/webgl_interactive_cubes.html)  
> 本篇目标：学习屏幕坐标如何转成 NDC，再用 Raycaster 从相机发出射线命中 3D 对象。

## 先从现实问题说起

用户鼠标在屏幕上移动，但你的物体在 3D 空间里。怎么知道鼠标指向哪个立方体？

这需要把屏幕坐标转换成从相机发出的 3D 射线。

`Raycaster` 解决的就是鼠标拾取 3D 对象的问题。

## 先把基础概念说清楚

- 鼠标坐标要先转成 NDC，也就是 -1 到 1 的标准屏幕坐标。
- `raycaster.setFromCamera(pointer, camera)` 用相机和鼠标生成射线。
- `intersectObjects` 返回按距离排序的命中结果，通常 `intersects[0]` 是最近物体。

## 这个技术解决什么

这个案例适合 hover 高亮、点击选中、鼠标拾取、简单编辑器选择。

它是很多 3D 交互的基础。

## 打开案例后看什么

- 移动鼠标时，看最近命中的立方体如何高亮。
- 注意 pointer 坐标为什么要归一化。
- 理解射线是从相机穿过鼠标位置打进 3D 场景。

## 官网核心代码

```js
pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

raycaster.setFromCamera( pointer, camera );
const intersects = raycaster.intersectObjects( scene.children, false );

if ( intersects.length > 0 ) {
  INTERSECTED = intersects[ 0 ].object;
  INTERSECTED.material.emissive.setHex( 0xff0000 );
}
```

## 这段代码到底在做什么

- 浏览器鼠标坐标左上角是 0,0；WebGL 拾取需要 NDC，中心是 0,0，范围是 -1 到 1。
- y 轴要取负，因为浏览器 y 向下，NDC y 向上。
- intersectObjects 第二个参数 false 表示不递归子节点。
- 命中列表按离相机近到远排序，通常第一个就是用户看到的最前对象。
- 案例只做 hover，如果要 click，应该在 pointerdown/click 事件里复用同样的 raycaster 逻辑。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `raycaster.setFromCamera( pointer, camera )` | `第 1 个参数：pointer` | coords：归一化设备坐标。 |
| `raycaster.setFromCamera( pointer, camera )` | `第 2 个参数：camera` | camera：发出射线的相机。 |
| `raycaster.intersectObjects( scene.children, false )` | `第 1 个参数：scene.children` | objects：要检测的对象数组。 |
| `raycaster.intersectObjects( scene.children, false )` | `第 2 个参数：false` | recursive：是否递归检测子对象。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 移动鼠标 | 最近命中立方体变红 |
| 把 recursive 改 true | 测试 group 子对象拾取 |
| 把对象数量加大 | 观察拾取成本 |
| 在 click 事件里运行同样代码 | 实现选择功能 |

## 学完能拿来做什么

- 点击选择模型
- 悬停高亮
- 3D 菜单/热点
- 编辑器选中对象
- 游戏拾取和瞄准

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
