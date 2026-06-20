# 🍜 今天吃什么 — 项目开发日志

## 项目概述

用户（代码小白）想要一个像美团外卖的网页应用，帮助解决"今天吃什么"的选择困难症。

**核心功能**：选择送餐地址 → 看附近外卖店排行 → 点进店铺看评价关键词和菜品实图。

## 技术栈

- **纯前端**：HTML + CSS + JavaScript，零框架，零构建工具
- **地图**：Leaflet.js + OpenStreetMap（免费，无需 API Key）
- **地理编码**：Nominatim（OpenStreetMap 免费服务）
- **菜品图片**：picsum.photos 随机占位图
- **UI**：手机外卖 App 风格，max-width 480px 居中

## 文件结构

```
d:\vibe coding\today-eat-what\
├── index.html              ← 主入口，双击打开
├── PROJECT_LOG.md          ← 本文件（项目日志）
├── css\
│   └── style.css           ← 全部样式（~850行）
├── js\
│   ├── data.js             ← Mock 数据：10家店铺、评论、关键词
│   ├── location.js         ← 定位 + 距离计算 + 地理编码
│   ├── ranking.js          ← 排名算法
│   ├── render.js           ← DOM 渲染（列表、详情、图片查看器）
│   ├── map-picker.js       ← 地图选点模块（滴滴风格）
│   └── app.js              ← 主逻辑（路由、事件绑定）
└── images/                 ← 预留目录（当前未使用）
```

## JS 加载顺序（依赖关系）

```
data.js → location.js → ranking.js → render.js → map-picker.js → app.js
```

依赖链：
- `data.js`：全局变量 `SHOPS`、`BASE_LAT`、`BASE_LNG`
- `location.js`：`LocationModule`，依赖 `BASE_LAT`/`BASE_LNG`
- `ranking.js`：`RankingModule`，纯逻辑无外部依赖
- `render.js`：`RenderModule`，依赖 `LocationModule`
- `map-picker.js`：`MapPicker`，依赖 `LocationModule`、`RenderModule`、`App`
- `app.js`：`App`，依赖所有上述模块

## 用户交互流程

```
打开 index.html
  │
  ▼
🍜 欢迎页（两个入口）
  ├── [📍 使用我的位置] → 浏览器 GPS → 店铺列表
  └── [🗺️ 在地图上选位置] → 地图选点界面
        │                    ├─ 拖动地图选位置
        │                    ├─ 搜索地址（Enter 跳转）
        │                    ├─ 红色图钉固定在屏幕正中央
        │                    └─ [确认此位置 ✓]
        │
        ▼
  店铺列表页
  ├─ 定位栏（显示地址/坐标 + 换位置按钮）
  ├─ 排序标签：综合/评分/销量/距离
  ├─ 店铺卡片（金银铜徽章、评分、月销、距离、标签）
  │
  点击卡片 ▼
  店铺详情页
  ├─ 店铺信息（评分、销量、人均、配送时间）
  ├─ 👍 好评关键词（绿色标签云）
  ├─ 👎 差评关键词（红色标签云）
  ├─ 📸 评论区菜品实拍（3列网格，点击放大）
  └─ 💬 评论区列表（用户头像、评分、文字、配图）
```

## Mock 数据（10家店铺，北京中关村周边 ~5km）

| # | 店铺 | 类型 | 评分 | 月销 | 人均 | 评论数 |
|---|------|------|------|------|------|--------|
| 1 | 黄焖鸡米饭（中关村店） | 快餐简餐 | 4.6 | 3258 | ¥22 | 6 |
| 2 | 老王川菜馆 | 川菜 | 4.8 | 5632 | ¥45 | 7 |
| 3 | 一口湘·湖南味道 | 湘菜 | 4.5 | 2810 | ¥38 | 5 |
| 4 | 超级鸡车·炸鸡汉堡 | 炸鸡小吃 | 4.3 | 8935 | ¥28 | 8 |
| 5 | 杨国福麻辣烫（苏州街店） | 麻辣烫 | 4.7 | 6789 | ¥25 | 6 |
| 6 | 喜茶（中关村店） | 奶茶饮品 | 4.9 | 12056 | ¥24 | 7 |
| 7 | 瑞幸咖啡（中关村创业大街店） | 咖啡 | 4.4 | 4520 | ¥18 | 6 |
| 8 | 兰州拉面·清真（中关村店） | 面馆 | 4.6 | 5130 | ¥20 | 7 |
| 9 | 沙县小吃（苏州街二店） | 快餐简餐 | 4.2 | 3810 | ¥16 | 5 |
| 10 | 明洞韩式炸鸡·啤酒屋 | 韩式料理 | 4.5 | 7230 | ¥35 | 7 |

基准坐标：`39.9836, 116.3059`（北京中关村）

## 排名算法

```
综合得分 = 评分归一化 × 0.5 + 月销量归一化 × 0.3 + 距离归一化 × 0.2
```

- Min-Max 归一化到 0-1
- 评分和销量：值越大分越高
- 距离：值越小分越高（归一化时反转）
- 支持四种排序：综合、评分优先、销量优先、距离最近

## 距离计算

- **算法**：Haversine 公式（地球球面距离）
- **搜索半径**：5km
- **用途**：过滤店铺 + 显示距离 + 参与排名

## 定位模块 (location.js) API

| 方法 | 说明 |
|------|------|
| `getCurrentPosition()` | 浏览器 GPS 定位（失败则用默认位置） |
| `setManualLocation(lat, lng)` | 手动设置位置（地图选点结果） |
| `reverseGeocode(lat, lng)` | 坐标 → 地址（Nominatim） |
| `geocode(query)` | 地址 → 坐标列表（Nominatim） |
| `haversineDistance(lat1,lng1,lat2,lng2)` | 两点距离 |
| `filterShopsByDistance(shops)` | 过滤 5km 内店铺 + 添加 distance 字段 |
| `getUserLocation()` | 获取当前存储的位置 |
| `getIsManual()` | 是否手动选址 |

## Bug 修复记录

### Bug 1: 搜索框按 Enter 没反应
- **原因**：只绑了 `input` 事件，没有绑 `keydown` 事件
- **修复**：在 `map-picker.js` 的 `bindMapEvents()` 中添加 `keydown` 监听，按 Enter 取第一个搜索结果并用 `map.setView()` 跳转

### Bug 2: 红色图钉不居中 / 不可见
- **原因 1**：用 emoji 📍 渲染，各平台尺寸不一致
- **原因 2**：z-index 只有 5，被 Leaflet 内部图层（z-index 最高 700）盖住
- **原因 3**：`.map-wrapper` 有 `overflow: hidden` 可能裁剪图钉
- **修复**：
  1. 改用 CSS 手绘红色图钉（`.pin-head` 圆形 + `.pin-point` 三角形）
  2. z-index 提到 `1000`
  3. 去掉 `.map-wrapper` 的 `overflow: hidden`
  4. 图钉容器 `.pin-body` 用 `transform: translate(-50%, -100%)` 使针尖精确落在 (0,0) = 地图中心

## 图钉 CSS 结构（关键）

```css
.map-center-pin {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 1000;        /* 高于 Leaflet 所有图层 */
  pointer-events: none;  /* 不阻挡地图交互 */
}

.pin-body {
  position: absolute;
  transform: translate(-50%, -100%);  /* 底部 = 针尖 = 地图中心 */
  width: 28px;
}

.pin-head {
  width: 28px; height: 28px;
  border-radius: 50% 50% 50% 0;  /* 地图钉风格圆角 */
  background: #e74c3c;
  border: 3px solid #fff;
}

.pin-point {
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 12px solid #c0392b;  /* 向下三角形 */
}
```

## 用户偏好 & 决策记录

1. **数据来源**：Mock 模拟数据（不用真实 API）
2. **形态**：网页版
3. **定位方式**：用户手动触发（不自动弹 GPS 权限），支持 GPS + 地图选点双入口
4. **使用场景**：给远处的女友/朋友点外卖（所以要支持地图任意选位置）
5. **技术优先**：纯前端、零依赖（Leaflet 除外）、手机风格 UI
6. **代码风格**：匹配代码小白的理解能力，注释充分

## 线上部署

- **GitHub 仓库**：https://github.com/anwenersatuo/today-eat-what
- **线上网址**：https://anwenersatuo.github.io/today-eat-what/
- **部署方式**：GitHub Pages + GitHub Actions（`.github/workflows/static.yml`）
- **更新方式**：`git push origin main` → 自动部署

## 当前状态（2026-06-20）

✅ 已完成功能：
- 欢迎页双入口（GPS / 地图选点）
- 地图选点（Leaflet + 搜索 + Enter 跳转 + 红色图钉居中）
- 店铺动态散布（跟随用户位置，任何地方都能看到）
- 店铺列表（综合排名 + 金银铜徽章 + 4 种排序）
- 店铺详情（好评/差评关键词标签云 + 评论区菜品图片网格 + 图片查看器）
- 🆕 摇一摇随机推荐（老虎机弹窗 + DeviceMotion 物理摇晃 + 按钮双触发）
- 🆕 GitHub Pages 上线（推送自动部署）
- 手机风格 UI + 响应式

🔜 待开发：
- 搜索 & 筛选（菜系、价格区间）
- 收藏店铺
- 菜品类目页
- 换成真实数据源
- AI 个性化推荐

## 2026-06-20 更新记录

### 修复：没有商铺的问题
- **原因**：Mock 店铺坐标固定在北京中关村，异地用户 5km 内无店铺
- **修复**：`data.js` 新增 `redistributeShopsAround(lat, lng, radiusKm=3)` 函数
- **调用点**：`app.js → showShopList()` 中，渲染列表前先散布店铺

### 新功能：摇一摇随机推荐
- **新增文件**：`js/shake.js`（DeviceMotion 摇晃检测，阈值 15，冷却 1.5s，iOS 13+ 权限）
- **修改文件**：
  - `css/style.css`：+170 行（按钮脉冲、弹窗弹入 bounceIn、老虎机抖动 slotShake、结果弹跳 landPop）
  - `js/render.js`：`renderRandomPicker()` + `closeRandomPicker()`（弹窗 DOM 创建/销毁）
  - `js/app.js`：+150 行（`handleRandomPick`、`runSlotAnimation` 老虎机轮播、`showRandomResult`、`bindRandomEvents`、摇一摇启动/停止管理）
  - `index.html`：引入 `shake.js`（排在 render 后、map-picker 前）
- **交互细节**：
  - 轮播帧：60/60/60/80/80/100/100/100/150/150/200/250/350/500 ms
  - 弹窗按钮用 `cloneNode+replaceChild` 防事件重复绑定
  - `isRandomOpen` 标志防重复触发
