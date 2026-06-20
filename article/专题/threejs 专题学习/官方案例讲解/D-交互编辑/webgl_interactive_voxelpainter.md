# webgl_interactive_voxelpainter.html｜Voxel Painter：网格吸附式体素编辑

> 本地官方案例：[`webgl_interactive_voxelpainter.html`](../../cases/webgl_interactive_voxelpainter.html)  
> 本篇目标：学习如何用 Raycaster、法线方向和网格吸附实现“点击放置方块、按键删除方块”的编辑器能力。

## 先从现实问题说起

像 Minecraft 或关卡编辑器那样点击放方块，不只是知道点中了哪里，还要知道新方块应该贴在哪一侧。

放置位置还要吸附到网格，否则方块会乱飘。

这个案例把 Raycaster、命中法线和网格吸附组合成体素编辑器。

## 先把基础概念说清楚

- Raycaster 找到鼠标命中的平面或已有方块。
- `intersect.face.normal` 告诉你点中的面朝哪个方向，新方块应该放在那一侧。
- 网格吸附通过除以格子大小、取整、再乘回来完成。

## 这个技术解决什么

它适合体素编辑、积木搭建、关卡原型工具。

这个案例比普通点击拾取多一步：根据命中面决定新对象的位置。

## 打开案例后看什么

- 移动鼠标时看预览方块如何吸附到格子中心。
- 点击已有方块侧面时，看新方块贴到哪一侧。
- 按删除键时，看 objects 数组如何影响可拾取对象。

## 官网核心代码

```js
raycaster.setFromCamera( pointer, camera );
const intersects = raycaster.intersectObjects( objects, false );

if ( intersects.length > 0 ) {
  const intersect = intersects[ 0 ];
  rollOverMesh.position.copy( intersect.point ).add( intersect.face.normal );
  rollOverMesh.position.divideScalar( 50 ).floor().multiplyScalar( 50 ).addScalar( 25 );
}
```

## 这段代码到底在做什么

- intersect.point 是射线打到表面的世界坐标。
- intersect.face.normal 表示被打中面的法线方向，新方块要沿这个方向偏移一格。
- divide/floor/multiply/addScalar 是典型网格吸附：把任意坐标归到 50 单位格子的中心。
- rollOverMesh 只是半透明预览，用来告诉用户将要放在哪里。
- 真正放置时会创建新的 cube mesh，并加入 scene 和 objects 数组，之后它也能被继续拾取。

## 本案例参数字典

这里只解释官网核心代码里最关键的参数，通用的相机、renderer、resize、DOM 事件等样板参数不在每篇里重复。

| 代码片段 | 参数 | 含义 |
|---|---|---|
| `raycaster.setFromCamera( pointer, camera )` | `第 1 个参数：pointer` | coords：归一化设备坐标。 |
| `raycaster.setFromCamera( pointer, camera )` | `第 2 个参数：camera` | camera：发出射线的相机。 |
| `raycaster.intersectObjects( objects, false )` | `第 1 个参数：objects` | objects：要检测的对象数组。 |
| `raycaster.intersectObjects( objects, false )` | `第 2 个参数：false` | recursive：是否递归检测子对象。 |
| `rollOverMesh.position.copy( intersect.point )` | `第 1 个参数：intersect.point` | source：复制来源。 |

## 参数和观察方法

| 你操作什么 | 重点观察什么 |
|---|---|
| 移动鼠标 | 预览方块吸附到网格 |
| 点击地面 | 添加方块 |
| 点击已有方块侧面 | 新方块贴到相邻格 |
| 按删除模式 | 移除被点中的方块 |

## 学完能拿来做什么

- Minecraft 式编辑器
- 关卡编辑器
- 建筑草图工具
- 网格化搭建工具
- 教学用空间坐标练习

## 延伸练习

1. 先只改一个参数，确认你能预测画面会怎么变。
2. 把这个案例的核心代码复制到自己的最小场景里，只保留必要对象。
3. 再加一个你自己的业务目标，例如模型选择、产品展示、编辑器操作或性能压测。
4. 如果效果不明显，先关掉其他干扰项，只留下这个案例正在讲的核心能力。
