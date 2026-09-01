# 商品详情页高转化改造实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 将传统刀剑商品详情页改造成信息清楚、信任充分、购买路径明确，并适用于现货、缺货、订制与需确认配送商品的高转化详情页。

**Architecture:** 保留 Hydrogen 的商品详情路由作为唯一页面入口，以 Shopify Storefront API 提供商品、变体、图片、库存和商品级 metafields。前端先将 Shopify 数据整理成统一的商品详情模型，再由首屏购买区、画廊、规格表、信任信息、配送说明、评论和推荐商品组件分别渲染。没有真实资料时显示“尚未提供”，不虚构规格、证书、评论或交期。

**Tech Stack:** Shopify Hydrogen、React Router、Shopify Storefront API、Shopify Product Metafields、Judge.me、React/CSS。

---

## 一、目标页面结构

最终详情页按以下顺序组织：

1. 首屏商品购买区
   - 商品类型、标题、商品状态、适合用途
   - 价格、变体、库存、交期提示
   - 加入购物车／咨询配送／订制咨询等状态化按钮
   - 购买前信任提示
2. 商品图片与视频画廊
   - 全貌、细节、尺寸比例、配件、包装和工艺过程
   - 图片说明与缩略图
3. 核心卖点
   - 3 项以内，必须对应实际资料
4. 规格表
   - 尺寸、重量、材料、装具、开刃状态、配件等
5. 作品背景与工艺说明
6. 配送、目的地与法规
7. 保养与保存
8. 真实客户评论
9. 相关作品
10. 页面底部再次提供购买或咨询入口

详情页不使用抽象的统一宣传语代替商品资料。每项信息都必须能够回答客户的具体疑问。

## 二、Shopify 商品资料字段

### Task 1: 建立商品资料字段清单

**Files:**
- Modify: `app/routes/products.$handle.jsx`
- Modify: `storefrontapi.generated.d.ts`（执行 codegen 后自动更新）
- Create: `docs/plans/product-metafield-content-template.md`

在 Shopify 商品 metafields 中建立以下字段。字段为空时，页面不显示空标题，也不填入猜测内容。

| Namespace | Key | 用途 |
| --- | --- | --- |
| `custom` | `pdp_subtitle` | 商品一句话定位 |
| `custom` | `pdp_use_case` | 适合收藏、展示、练习或礼赠等用途 |
| `custom` | `pdp_master` | 大师或作品系列归属，必须有资料依据 |
| `custom` | `pdp_material` | 刀身、剑身、鞘、装具材料 |
| `custom` | `pdp_dimensions` | 全长、刃长、柄长等 |
| `custom` | `pdp_weight` | 商品重量及测量口径 |
| `custom` | `pdp_blade_status` | 开刃、未开刃或不适用 |
| `custom` | `pdp_includes` | 包装内包含的商品与配件 |
| `custom` | `pdp_certificate` | 证书、编号或收藏资料；无资料时留空 |
| `custom` | `pdp_lead_time` | 现货、预售或订制交期 |
| `custom` | `pdp_shipping_note` | 该商品的配送限制或需确认事项 |
| `custom` | `pdp_care` | 该商品专属的保养说明 |
| `custom` | `pdp_badges` | 已核实的短标签，如现货、限量、作品系列 |

**验收标准:** 至少选 3 件代表商品完成字段盘点；每个字段明确“已核实、待补充或不适用”，不允许用模板文案代替缺失资料。

### Task 2: 扩展 Storefront API 查询并建立标准数据模型

在 `PRODUCT_FRAGMENT` 中按固定 identifiers 读取上述 metafields。新增一个纯函数，将商品 API 数据整理为：

```text
productDetail = {
  status,
  subtitle,
  useCase,
  master,
  highlights,
  specifications,
  includedItems,
  certificate,
  leadTime,
  shippingNote,
  care,
}
```

状态至少包含 `available`、`soldOut`、`preorder`、`commission`、`shippingInquiry`。状态判断必须有明确的商品字段或现有商品数据依据，不凭商品标题猜测。

## 三、首屏购买区

### Task 3: 重做首屏信息层级

**Files:**
- Modify: `app/routes/products.$handle.jsx`
- Modify: `app/components/ProductForm.jsx`
- Modify: `app/styles/app.css`

首屏在标题下方按以下顺序显示：

1. 商品副标题或商品类型；
2. 适合用途；
3. 价格及货币；
4. 变体选择；
5. 库存与交期；
6. 主要购买按钮；
7. 购买前信任提示。

按钮根据状态显示：

- 可售：加入购物车；
- 缺货：暂时缺货／联系到货通知；
- 订制：提交订制需求；
- 配送需确认：先咨询配送；
- 无法确认状态：联系商品咨询。

按钮必须提供键盘焦点、禁用状态和清晰的加载状态。不能让“加入购物车”出现在明确不能立即购买的商品上。

### Task 4: 加入首屏信任条

只显示实际适用的项目，例如：

- 商品资料可核对；
- 发货前检查；
- 支持购买前咨询；
- 目的地配送需确认。

不得把“手工完成”扩展成未经资料证明的“大师亲自制作”或“纯手工百分之百完成”等强断言。

## 四、图片与视频画廊

### Task 5: 将画廊改成“购买决策画廊”

**Files:**
- Modify: `app/routes/products.$handle.jsx`
- Modify: `app/components/ProductImage.jsx`
- Modify: `app/styles/app.css`

保留当前主图、右侧缩略图和左右切换，但增加：

- 图片数量指示；
- 图片 alt 文本规范；
- 画廊图片说明；
- 细节图、比例图、配件图的类型标识；
- 若商品存在视频，支持视频缩略图和播放控制。

图片顺序建议统一为：全貌 → 正面／侧面 → 刃部或纹理 → 装具 → 鞘与配件 → 尺寸比例 → 包装／证书 → 制作过程。

如果资料不足，不使用重复图片填充画廊。图片比例统一由 CSS 控制，但不强行裁切刀剑主体。

## 五、卖点、规格和内容说明

### Task 6: 增加商品卖点模块

**Files:**
- Modify: `app/routes/products.$handle.jsx`
- Modify: `app/styles/app.css`

从 metafield 或已核实的商品资料读取最多 3 个卖点。每个卖点必须包含“事实 + 对客户的意义”，例如材料事实对应耐久、维护或展示效果。没有事实资料时不显示该卖点。

### Task 7: 用规格表替代大段描述

在商品描述后加入可扫描的规格表，至少支持：

- 商品类型；
- 全长、刃长、柄长；
- 重量；
- 刀身／剑身材料；
- 鞘与装具材料；
- 开刃状态；
- 配件与包装；
- 商品状态。

描述保留用于讲述作品背景与工艺，规格表负责快速核对，不重复同一段文字。

### Task 8: 优化折叠内容

将现有折叠区调整为：

1. 规格与包装；
2. 作品背景与工艺；
3. 配送、目的地与法规；
4. 保养与保存；
5. 购买前常见问题。

每个区块只保留与当前商品相关的信息，并在配送内容中明确“这是一般说明，具体目的地需单独确认”。

## 六、信任、评论与推荐

### Task 9: 接入 Judge.me 真实评论

**Files:**
- Modify: `app/routes/products.$handle.jsx`
- Modify: `app/lib/fragments.js`（如评论查询需要共用 fragment）
- Modify: `app/styles/app.css`

优先显示已发布的 Judge.me 评论。没有真实评论时：

- 显示“目前尚无客户评价”；或
- 仅在本地预览显示明确标注的测试评论。

测试评论不得在正式版本中伪装成真实客户评价。评论区需支持星级、评论数量、评论正文和空状态。

### Task 10: 优化相关商品

推荐商品按以下优先级处理：

1. 同系列；
2. 同大师或同作品方向；
3. 相同用途；
4. 相近价格。

每张推荐卡必须具备一致的图片比例、标题、价格和可点击区域。无推荐商品时显示回到商品目录的入口，不留下空白区块。

## 七、移动端、可用性和性能

### Task 11: 完成响应式和操作验证

**Files:**
- Modify: `app/styles/app.css`

桌面端：图片与购买信息双栏；购买信息可在滚动时保持可见，但不能遮挡页脚。

移动端：

- 图片先于购买信息；
- 购买按钮可在首屏看到；
- 规格表不产生横向滚动；
- 缩略图可横向滑动或切换；
- 邮箱、按钮和折叠区可触控；
- 不出现单字标题换行、横向溢出或按钮被悬浮咨询遮挡。

性能要求：首张商品图优先加载，其余图片 lazy load；视频不得阻塞首屏；图片 alt 必须有意义；装饰图片使用空 alt。

## 八、内容填充与验证顺序

### Task 12: 先完成 3 件代表商品

不要一次修改所有商品。先选择：

1. 一件高价大师剑；
2. 一件普通现售剑或刀；
3. 一件练习器械或低价商品。

为这 3 件商品填完资料并观察不同状态、价格和图片数量下的表现，再批量应用。

### Task 13: 建立详情页验收清单

每件代表商品检查：

- 标题、价格、货币正确；
- 当前变体和库存正确；
- 购买按钮与商品状态一致；
- 图片可切换，缩略图可用；
- 图片没有主体裁切异常；
- 用途说明具体；
- 规格没有空字段或演示文案；
- 配件、证书、开刃状态有明确说明；
- 配送和法规提示靠近购买区；
- 评论真实或明确标注为空／测试；
- 推荐商品可点击；
- 桌面端和移动端无横向溢出；
- 购物车数量、变体和 Checkout 流程正常；
- 页面标题、SEO 描述和 canonical 正确。

## 九、实施与上线节奏

### 第一阶段：资料与数据基础

完成 Task 1–2，只接入字段和标准化模型，不改变正式页面视觉。先在本地检查 3 件代表商品的数据。

### 第二阶段：首屏与规格

完成 Task 3–8，使用本地页面逐步验证首屏、图片、规格、配送和折叠区。

### 第三阶段：评论与推荐

完成 Task 9–10，确认 Judge.me 真实评论来源；若未接通，正式版本关闭测试评论或明确显示空状态。

### 第四阶段：响应式与验收

完成 Task 11–13，逐页检查 3 件代表商品，再决定是否批量填充。

### 第五阶段：上线

只有在本地审核通过后，才执行：

```bash
npm run lint
npm run build
git status --short
git add app/routes/products.$handle.jsx app/components/ProductForm.jsx app/components/ProductImage.jsx app/styles/app.css app/lib/fragments.js docs/plans/product-metafield-content-template.md
git commit -m "Improve product detail conversion flow"
git push origin main
```

推送后等待 Oxygen 部署，再用正式域名逐项复核。正式上线验证失败时，不继续追加内容，先回到具体商品和具体区块定位问题。

## 十、暂不纳入本轮的内容

- 不在前端虚构大师亲自制作、限量、获奖、证书或收藏信息；
- 不使用未授权的外部评论、媒体图片或客户评价；
- 不把所有商品统一写成现货；
- 不一次性重写全部商品描述；
- 不以大量动画替代规格、配送和信任信息；
- 不在本轮改动 Shopify Checkout 本身。

**完成标准:** 3 件代表商品在本地完成资料、首屏、图片、规格、配送、评论和购买流程验证；用户可以在不跳转其他页面的情况下判断“这是什么、适合什么、包含什么、何时交付、能否寄到我所在地区，以及下一步如何购买或咨询”。
