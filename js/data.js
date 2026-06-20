/**
 * 数据模块 — 今天吃什么
 * - Mock 数据（作为高德 API 失败时的兜底）
 * - 手动收藏店铺（localStorage 持久化）
 * - 高德 POI → 店铺格式转换
 * - 评论 & 关键词生成
 */

// 基准坐标：北京中关村
const BASE_LAT = 39.9836;
const BASE_LNG = 116.3059;

// ==================== Mock 数据（兜底） ====================
const SHOPS = [
  {
    id: 1,
    name: '黄焖鸡米饭（中关村店）',
    category: '快餐简餐',
    rating: 4.6,
    monthlySales: 3258,
    avgPrice: 22,
    deliveryTime: '25-35分钟',
    deliveryFee: 0,
    lat: 39.9850,
    lng: 116.3070,
    address: '海淀区中关村大街27号',
    tags: ['回头客多', '出餐快', '分量足'],
    reviews: [
      { id: 1, userName: '吃货小王', avatar: '王', rating: 5, content: '黄焖鸡味道很正宗！鸡肉嫩滑，汤汁浓郁，配上米饭绝了，分量也很足，一个人吃撑了。', date: '2026-06-18', images: ['https://picsum.photos/seed/hmj1/300/300', 'https://picsum.photos/seed/hmj2/300/300'] },
      { id: 2, userName: '外卖达人', avatar: '李', rating: 4, content: '味道不错，就是等的时间有点长，配送小哥晚了10分钟。', date: '2026-06-17', images: ['https://picsum.photos/seed/hmj3/300/300'] },
      { id: 3, userName: '吃遍天下', avatar: '张', rating: 5, content: '第二次点了，一如既往的好吃！加了一份土豆，很入味。推荐！', date: '2026-06-16', images: [] },
      { id: 4, userName: '午餐选择困难', avatar: '赵', rating: 2, content: '今天的鸡肉有点柴，不如之前好吃了，而且米饭有点硬。', date: '2026-06-15', images: ['https://picsum.photos/seed/hmj4/300/300'] },
      { id: 5, userName: '吃货不胖', avatar: '刘', rating: 5, content: '分量真的很大！味道好，价格实惠，性价比超高！', date: '2026-06-14', images: ['https://picsum.photos/seed/hmj5/300/300'] },
      { id: 6, userName: '测评君', avatar: '陈', rating: 3, content: '中规中矩吧，没有特别惊艳，汤底稍微有点咸了。', date: '2026-06-13', images: ['https://picsum.photos/seed/hmj6/300/300'] },
    ],
    posKeywords: ['味道正宗', '分量足', '性价比高', '鸡肉嫩滑', '汤汁浓郁', '推荐'],
    negKeywords: ['偶尔鸡肉柴', '米饭硬', '偏咸', '配送慢'],
  },
  {
    id: 2,
    name: '老王川菜馆',
    category: '川菜',
    rating: 4.8,
    monthlySales: 5632,
    avgPrice: 45,
    deliveryTime: '30-40分钟',
    deliveryFee: 2,
    lat: 39.9810,
    lng: 116.3100,
    address: '海淀区海淀大街12号',
    tags: ['人气高', '辣味十足', '正宗川味'],
    reviews: [
      { id: 1, userName: '无辣不欢', avatar: '周', rating: 5, content: '水煮鱼太赞了！麻辣鲜香，鱼肉嫩滑，配菜也很多，地道四川味！', date: '2026-06-19', images: ['https://picsum.photos/seed/sc1/300/300', 'https://picsum.photos/seed/sc2/300/300', 'https://picsum.photos/seed/sc3/300/300'] },
      { id: 2, userName: '美食猎人', avatar: '吴', rating: 5, content: '回锅肉炒得很香，肥而不腻。麻婆豆腐也很正宗，下饭神器！', date: '2026-06-18', images: ['https://picsum.photos/seed/sc4/300/300'] },
      { id: 3, userName: '程序员小李', avatar: '李', rating: 4, content: '整体不错，但是真的太辣了！不能吃辣的建议选微辣。价格稍贵。', date: '2026-06-17', images: ['https://picsum.photos/seed/sc5/300/300'] },
      { id: 4, userName: '吃货联盟', avatar: '郑', rating: 5, content: '宫保鸡丁超好吃！花生酥脆，鸡肉嫩，甜辣适中。已经点了N次了！', date: '2026-06-16', images: ['https://picsum.photos/seed/sc6/300/300', 'https://picsum.photos/seed/sc7/300/300'] },
      { id: 5, userName: '外卖评论家', avatar: '孙', rating: 2, content: '今天的菜太油了，吃完胃不舒服。而且配送超时了快20分钟。', date: '2026-06-15', images: [] },
      { id: 6, userName: '川菜爱好者', avatar: '钱', rating: 5, content: '毛血旺料超级足！鸭血、午餐肉、毛肚都有，比店里吃还划算。', date: '2026-06-14', images: ['https://picsum.photos/seed/sc8/300/300'] },
      { id: 7, userName: '打工人午餐', avatar: '杨', rating: 4, content: '味道没得说，就是配送范围要是再大点就好了，有时候超出范围。', date: '2026-06-13', images: [] },
    ],
    posKeywords: ['麻辣鲜香', '地道正宗', '分量足', '下饭', '回头客', '料足'],
    negKeywords: ['太辣', '偏油', '价格偏贵', '配送超时', '配送范围小'],
  },
  {
    id: 3,
    name: '一口湘·湖南味道',
    category: '湘菜',
    rating: 4.5,
    monthlySales: 2810,
    avgPrice: 38,
    deliveryTime: '30-45分钟',
    deliveryFee: 3,
    lat: 39.9870,
    lng: 116.3030,
    address: '海淀区科学院南路8号',
    tags: ['地道湘味', '下饭', '辣'],
    reviews: [
      { id: 1, userName: '湘菜铁粉', avatar: '黄', rating: 5, content: '剁椒鱼头绝了！鱼肉鲜嫩，剁椒够味，汤汁拌面太香了！', date: '2026-06-19', images: ['https://picsum.photos/seed/xc1/300/300', 'https://picsum.photos/seed/xc2/300/300'] },
      { id: 2, userName: '小炒肉达人', avatar: '马', rating: 4, content: '小炒肉很香，辣椒也给得足。就是肉稍微有点少…', date: '2026-06-18', images: ['https://picsum.photos/seed/xc3/300/300'] },
      { id: 3, userName: '湖南老乡', avatar: '何', rating: 5, content: '终于找到正宗湘菜了！口味跟老家一样，烟笋炒腊肉太好吃了。', date: '2026-06-17', images: [] },
      { id: 4, userName: '新尝试者', avatar: '林', rating: 3, content: '第一次吃湘菜，感觉比川菜还辣…不太适应。不过味道是好的。', date: '2026-06-16', images: ['https://picsum.photos/seed/xc4/300/300'] },
      { id: 5, userName: '午饭打卡', avatar: '徐', rating: 4, content: '味道不错，就是等待时间有点长。建议提前下单。', date: '2026-06-15', images: ['https://picsum.photos/seed/xc5/300/300'] },
    ],
    posKeywords: ['剁椒鱼头', '正宗湘味', '下饭', '烟笋腊肉', '够味'],
    negKeywords: ['太辣', '肉少', '等待时间长'],
  },
  {
    id: 4,
    name: '超级鸡车·炸鸡汉堡',
    category: '炸鸡小吃',
    rating: 4.3,
    monthlySales: 8935,
    avgPrice: 28,
    deliveryTime: '20-30分钟',
    deliveryFee: 0,
    lat: 39.9840,
    lng: 116.3080,
    address: '海淀区中关村东路15号',
    tags: ['销量高', '学生最爱', '出餐快'],
    reviews: [
      { id: 1, userName: '炸鸡控', avatar: '白', rating: 5, content: '炸鸡外酥里嫩！一口咬下去还有汁水，比KFC好吃！薯条也很脆。', date: '2026-06-19', images: ['https://picsum.photos/seed/zj1/300/300', 'https://picsum.photos/seed/zj2/300/300'] },
      { id: 2, userName: '学生党', avatar: '崔', rating: 4, content: '价格实惠，量也可以。蜂蜜芥末酱很好吃！就是有时候炸得有点过。', date: '2026-06-18', images: ['https://picsum.photos/seed/zj3/300/300'] },
      { id: 3, userName: '夜宵大王', avatar: '苏', rating: 5, content: '深夜点了一份，送来还是热的！鸡腿超大一个，满足！', date: '2026-06-17', images: ['https://picsum.photos/seed/zj4/300/300'] },
      { id: 4, userName: '健身失败者', avatar: '潘', rating: 2, content: '这次的面衣太厚了，感觉吃了一大口面粉…鸡肉很少。', date: '2026-06-16', images: ['https://picsum.photos/seed/zj5/300/300'] },
      { id: 5, userName: '快乐肥宅', avatar: '葛', rating: 4, content: '汉堡也不错，牛肉饼挺厚实的。套餐性价比高，会回购。', date: '2026-06-15', images: [] },
      { id: 6, userName: '挑剔食客', avatar: '范', rating: 3, content: '味道还行，但也没有特别出彩。配送倒是挺快的。', date: '2026-06-14', images: ['https://picsum.photos/seed/zj6/300/300'] },
      { id: 7, userName: '炸鸡鉴赏家', avatar: '彭', rating: 1, content: '这次送来都凉了！炸鸡凉了完全没法吃，很失望。', date: '2026-06-13', images: [] },
      { id: 8, userName: '常客', avatar: '鲁', rating: 5, content: '每周必点！炸鸡+薯条+可乐的快乐套餐，打工人的慰藉。', date: '2026-06-12', images: ['https://picsum.photos/seed/zj7/300/300'] },
    ],
    posKeywords: ['外酥里嫩', '价格实惠', '出餐快', '分量足', '酱料好吃'],
    negKeywords: ['偶尔面衣厚', '有时候凉了', '品控不稳定', '炸得过火'],
  },
  {
    id: 5,
    name: '杨国福麻辣烫（苏州街店）',
    category: '麻辣烫',
    rating: 4.7,
    monthlySales: 6789,
    avgPrice: 25,
    deliveryTime: '20-35分钟',
    deliveryFee: 0,
    lat: 39.9820,
    lng: 116.3020,
    address: '海淀区苏州街33号',
    tags: ['人气爆款', '汤底好喝', '选择丰富'],
    reviews: [
      { id: 1, userName: '麻辣烫爱好者', avatar: '田', rating: 5, content: '汤底浓郁好喝！菜品种类很多，新鲜。每次都要加两份午餐肉！', date: '2026-06-19', images: ['https://picsum.photos/seed/mlt1/300/300', 'https://picsum.photos/seed/mlt2/300/300'] },
      { id: 2, userName: '清淡口味', avatar: '方', rating: 3, content: '对我来说有点太辣了，让少放辣椒还是辣。汤底不错但口味偏重。', date: '2026-06-18', images: ['https://picsum.photos/seed/mlt3/300/300'] },
      { id: 3, userName: '回头客', avatar: '石', rating: 5, content: '比张亮麻辣烫好吃！牛骨汤底真的绝了，每次都把汤喝光。', date: '2026-06-17', images: [] },
      { id: 4, userName: '性价比党', avatar: '姚', rating: 4, content: '25块吃撑了，性价比很高。就是菠菜偶尔不太新鲜。', date: '2026-06-16', images: ['https://picsum.photos/seed/mlt4/300/300'] },
      { id: 5, userName: '美食记录', avatar: '谭', rating: 5, content: '麻酱拌的特别香！配料区也很丰富，每次都能吃不一样的口味。', date: '2026-06-15', images: ['https://picsum.photos/seed/mlt5/300/300'] },
      { id: 6, userName: '打工人', avatar: '廖', rating: 2, content: '漏放了我选的豆皮和藕片…打电话给商家也没人接。', date: '2026-06-14', images: [] },
    ],
    posKeywords: ['汤底浓郁', '性价比高', '选择丰富', '麻酱香', '牛骨汤'],
    negKeywords: ['口味偏重', '偶尔漏单', '部分蔬菜不新鲜', '客服响应慢'],
  },
  {
    id: 6,
    name: '喜茶（中关村店）',
    category: '奶茶饮品',
    rating: 4.9,
    monthlySales: 12056,
    avgPrice: 24,
    deliveryTime: '15-25分钟',
    deliveryFee: 0,
    lat: 39.9855,
    lng: 116.3090,
    address: '海淀区中关村大街19号',
    tags: ['网红店', '水果茶', '排队王'],
    reviews: [
      { id: 1, userName: '奶茶重度患者', avatar: '夏', rating: 5, content: '多肉葡萄太好喝了！果肉超多，芝士奶盖浓郁顺滑，每次都点！', date: '2026-06-19', images: ['https://picsum.photos/seed/xc01/300/300', 'https://picsum.photos/seed/xc02/300/300'] },
      { id: 2, userName: '下午茶达人', avatar: '蔡', rating: 5, content: '芝芝莓莓颜值超高，拍照好看，味道也在线！外卖包装也很精致。', date: '2026-06-18', images: ['https://picsum.photos/seed/xc03/300/300', 'https://picsum.photos/seed/xc04/300/300'] },
      { id: 3, userName: '理性消费者', avatar: '丁', rating: 4, content: '好喝是好喝，但确实偏贵。一杯水果茶够吃一顿快餐了。', date: '2026-06-17', images: [] },
      { id: 4, userName: '尝鲜党', avatar: '魏', rating: 5, content: '新品杨梅系列好喝！季节限定就是不一样，清甜爽口。', date: '2026-06-16', images: ['https://picsum.photos/seed/xc05/300/300'] },
      { id: 5, userName: '打工人必备', avatar: '薛', rating: 4, content: '下午来一杯续命，配送很快，15分钟就到了，冰都没化。', date: '2026-06-15', images: [] },
      { id: 6, userName: '严格评委', avatar: '叶', rating: 2, content: '这次的多肉葡萄感觉果肉比之前少了，偷工减料？不如从前了。', date: '2026-06-14', images: ['https://picsum.photos/seed/xc06/300/300'] },
      { id: 7, userName: '常驻奶茶选手', avatar: '余', rating: 5, content: '喜茶的芝士系列永远的神！奶盖一点都不腻，茶底也香。', date: '2026-06-13', images: [] },
    ],
    posKeywords: ['果肉多', '奶盖浓郁', '配送快', '包装精致', '颜值高', '芝士系列'],
    negKeywords: ['价格偏贵', '果肉变少了', '品控下降', '性价比低'],
  },
  {
    id: 7,
    name: '瑞幸咖啡（中关村创业大街店）',
    category: '咖啡',
    rating: 4.4,
    monthlySales: 4520,
    avgPrice: 18,
    deliveryTime: '15-20分钟',
    deliveryFee: 0,
    lat: 39.9815,
    lng: 116.3075,
    address: '海淀区海淀西大街48号',
    tags: ['性价比', '快取快送', '上班族最爱'],
    reviews: [
      { id: 1, userName: '咖啡续命', avatar: '沈', rating: 5, content: '生椰拿铁YYDS！每天早上必须来一杯，9.9的价格太香了！', date: '2026-06-19', images: ['https://picsum.photos/seed/lk1/300/300'] },
      { id: 2, userName: '冰美式党', avatar: '汪', rating: 4, content: '冰美式够劲！比星巴克便宜一半，味道不差。就是冰块有时候太多了。', date: '2026-06-18', images: [] },
      { id: 3, userName: '新品尝鲜', avatar: '卢', rating: 3, content: '新品桂花拿铁一般般，桂花味太淡了，还是经典款好喝。', date: '2026-06-17', images: ['https://picsum.photos/seed/lk2/300/300'] },
      { id: 4, userName: '办公室必备', avatar: '戴', rating: 5, content: '配送速度快到离谱！下单5分钟就出餐了，10分钟送到。', date: '2026-06-16', images: [] },
      { id: 5, userName: '偶尔喝喝', avatar: '钟', rating: 2, content: '这次的拿铁太甜了，明明选的无糖…品控能不能稳定点？', date: '2026-06-15', images: ['https://picsum.photos/seed/lk3/300/300'] },
      { id: 6, userName: '瑞幸会员', avatar: '崔', rating: 4, content: '每周9.9券太划算了，薅羊毛党狂喜。丝绒拿铁推荐！', date: '2026-06-14', images: [] },
    ],
    posKeywords: ['出餐极快', '性价比高', '9.9优惠', '生椰拿铁', '配送快'],
    negKeywords: ['冰块多', '品控不稳', '新品一般', '偶尔太甜'],
  },
  {
    id: 8,
    name: '兰州拉面·清真（中关村店）',
    category: '面馆',
    rating: 4.6,
    monthlySales: 5130,
    avgPrice: 20,
    deliveryTime: '20-30分钟',
    deliveryFee: 1,
    lat: 39.9860,
    lng: 116.3040,
    address: '海淀区科学院南路55号',
    tags: ['老店', '手工拉面', '实惠'],
    reviews: [
      { id: 1, userName: '面食爱好者', avatar: '姜', rating: 5, content: '牛肉面汤底鲜美，面条劲道！牛肉片也切得很薄，入口即化。', date: '2026-06-19', images: ['https://picsum.photos/seed/lm1/300/300', 'https://picsum.photos/seed/lm2/300/300'] },
      { id: 2, userName: '西北老乡', avatar: '谢', rating: 5, content: '正宗的兰州味道！一清二白三红四绿五黄，标准得很！', date: '2026-06-18', images: ['https://picsum.photos/seed/lm3/300/300'] },
      { id: 3, userName: '学生党小白', avatar: '邹', rating: 4, content: '量大实惠，一碗面能吃饱。就是面送来有点坨了，要赶紧拌开。', date: '2026-06-17', images: ['https://picsum.photos/seed/lm4/300/300'] },
      { id: 4, userName: '美食博主', avatar: '熊', rating: 5, content: '牛肉炒拉条也很棒！配菜丰富，味道浓郁，比汤面更够味。', date: '2026-06-16', images: ['https://picsum.photos/seed/lm5/300/300'] },
      { id: 5, userName: '家常味道', avatar: '金', rating: 3, content: '中规中矩的拉面，牛肉有点少，就三四片薄薄的…', date: '2026-06-15', images: [] },
      { id: 6, userName: '加班晚餐', avatar: '陆', rating: 4, content: '晚上加班点的，送来还是热乎的。量大管饱，打工人的好选择。', date: '2026-06-14', images: [] },
      { id: 7, userName: '面瘫患者', avatar: '郝', rating: 2, content: '面的粗细不均匀，有的地方粗有的细，师傅手艺有待提高。', date: '2026-06-13', images: ['https://picsum.photos/seed/lm6/300/300'] },
    ],
    posKeywords: ['汤鲜面劲道', '量大实惠', '正宗', '热乎', '牛肉炒拉条'],
    negKeywords: ['面会坨', '牛肉少', '粗细不均', '品控待提升'],
  },
  {
    id: 9,
    name: '沙县小吃（苏州街二店）',
    category: '快餐简餐',
    rating: 4.2,
    monthlySales: 3810,
    avgPrice: 16,
    deliveryTime: '20-30分钟',
    deliveryFee: 0,
    lat: 39.9800,
    lng: 116.3010,
    address: '海淀区苏州街12号',
    tags: ['国民小吃', '便宜实惠', '选择多'],
    reviews: [
      { id: 1, userName: '省钱达人', avatar: '孔', rating: 5, content: '蒸饺+炖罐才16块！这个物价在北京简直良心！味道也很家常。', date: '2026-06-19', images: ['https://picsum.photos/seed/sx1/300/300'] },
      { id: 2, userName: '沙县老顾客', avatar: '毛', rating: 4, content: '拌面+扁肉套餐绝配。花生酱很香，扁肉皮薄馅大。', date: '2026-06-18', images: ['https://picsum.photos/seed/sx2/300/300'] },
      { id: 3, userName: '午饭日常', avatar: '段', rating: 3, content: '味道就那样吧，胜在便宜。卫生条件看着一般，包装比较简陋。', date: '2026-06-17', images: [] },
      { id: 4, userName: '第一次尝试', avatar: '汤', rating: 2, content: '蒸饺的皮有点硬，像是放了很久重新热的。汤的味道也比较淡。', date: '2026-06-16', images: ['https://picsum.photos/seed/sx3/300/300'] },
      { id: 5, userName: '忠实粉丝', avatar: '尹', rating: 5, content: '卤鸡腿饭超值！一个大鸡腿+两个素菜+米饭才18，打工人之光。', date: '2026-06-15', images: ['https://picsum.photos/seed/sx4/300/300'] },
    ],
    posKeywords: ['便宜实惠', '选择多', '卤鸡腿饭', '拌面扁肉', '打工人之光'],
    negKeywords: ['包装简陋', '偶尔不新鲜', '卫生一般', '味道不稳定'],
  },
  {
    id: 10,
    name: '明洞韩式炸鸡·啤酒屋',
    category: '韩式料理',
    rating: 4.5,
    monthlySales: 7230,
    avgPrice: 35,
    deliveryTime: '25-40分钟',
    deliveryFee: 2,
    lat: 39.9830,
    lng: 116.3120,
    address: '海淀区中关村南路72号',
    tags: ['韩式风味', '炸鸡啤酒', '聚会首选'],
    reviews: [
      { id: 1, userName: '韩剧迷', avatar: '秦', rating: 5, content: '韩式甜辣炸鸡太好吃了！外皮酥脆，酱料裹得均匀，配年糕绝了！', date: '2026-06-19', images: ['https://picsum.photos/seed/hs1/300/300', 'https://picsum.photos/seed/hs2/300/300'] },
      { id: 2, userName: '炸鸡配啤酒', avatar: '顾', rating: 5, content: '原味炸鸡外酥里嫩，蒜香酱油的也好吃！分量真的大，两个人吃够了。', date: '2026-06-18', images: ['https://picsum.photos/seed/hs3/300/300', 'https://picsum.photos/seed/hs4/300/300'] },
      { id: 3, userName: '理性吃货', avatar: '侯', rating: 3, content: '味道不错但价格偏高。而且配送时间太长，炸鸡送来都不脆了。', date: '2026-06-17', images: ['https://picsum.photos/seed/hs5/300/300'] },
      { id: 4, userName: '韩国留学生', avatar: '孟', rating: 5, content: '跟韩国吃的味道很像！部队锅也推荐，料很多，汤底浓郁。', date: '2026-06-16', images: ['https://picsum.photos/seed/hs6/300/300'] },
      { id: 5, userName: '周末小聚', avatar: '龙', rating: 4, content: '炸鸡+部队锅+啤酒，周末标配！就是每次都要等好久。', date: '2026-06-15', images: [] },
      { id: 6, userName: '严格吃货', avatar: '万', rating: 2, content: '这次的炸鸡明显是复炸的，皮很硬，肉也干了。不如之前好吃。', date: '2026-06-14', images: ['https://picsum.photos/seed/hs7/300/300'] },
      { id: 7, userName: '甜辣爱好者', avatar: '段', rating: 5, content: '甜辣酱太好吃了！特意多要了一份酱。芝士球也推荐，拉丝超长。', date: '2026-06-13', images: ['https://picsum.photos/seed/hs8/300/300'] },
    ],
    posKeywords: ['甜辣酱好吃', '分量大', '部队锅', '正宗韩味', '芝士球'],
    negKeywords: ['价格偏高', '配送慢', '偶尔复炸', '送来不脆'],
  },
];

/**
 * 动态散布店铺位置（仅用于 Mock 兜底数据）
 */
function redistributeShopsAround(centerLat, centerLng, radiusKm) {
  radiusKm = radiusKm || 3;
  SHOPS.forEach(function (shop) {
    var angle = Math.random() * 2 * Math.PI;
    var dist = 0.3 + Math.random() * (radiusKm - 0.3);
    var latOffset = (dist * Math.cos(angle)) / 111.32;
    var lngOffset = (dist * Math.sin(angle)) / (111.32 * Math.cos(centerLat * Math.PI / 180));
    shop.lat = centerLat + latOffset;
    shop.lng = centerLng + lngOffset;
  });
}


// ==================== 手动收藏店铺 ====================

const DataModule = (() => {

  var MANUAL_STORAGE_KEY = 'today_eat_what_manual_shops';

  /** 从 localStorage 加载手动收藏 */
  function loadManualShops() {
    try {
      var raw = localStorage.getItem(MANUAL_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  /** 保存到 localStorage */
  function saveManualShops(shops) {
    try {
      localStorage.setItem(MANUAL_STORAGE_KEY, JSON.stringify(shops));
    } catch (e) {
      console.error('保存手动店铺失败：', e);
    }
  }

  /** 添加一家手动店铺 */
  function addManualShop(shop) {
    var shops = loadManualShops();
    shop.savedAt = Date.now();
    shops.push(shop);
    saveManualShops(shops);
    return shop;
  }

  /** 删除手动店铺（按 savedAt 时间戳） */
  function deleteManualShop(savedAt) {
    var shops = loadManualShops();
    shops = shops.filter(function (s) { return s.savedAt !== savedAt; });
    saveManualShops(shops);
  }

  /**
   * 获取所有手动店铺（转换为标准 shop 格式）
   * @param {number} userLat - 用户纬度（计算距离）
   * @param {number} userLng - 用户经度
   */
  function getManualShops(userLat, userLng) {
    var shops = loadManualShops();
    return shops.map(function (s) {
      var dist = 0;
      if (userLat !== undefined && userLng !== undefined) {
        dist = LocationModule.haversineDistance(userLat, userLng, s.lat, s.lng);
      }
      return {
        id: 'manual_' + s.savedAt,
        name: s.name,
        category: s.category || '其他',
        rating: s.rating || 4.0,
        monthlySales: 0,
        avgPrice: s.avgPrice || 20,
        deliveryTime: s.deliveryTime || '30分钟',
        deliveryFee: s.deliveryFee || 0,
        lat: s.lat,
        lng: s.lng,
        address: s.address || '',
        tags: s.tags || ['收藏'],
        reviews: [],
        posKeywords: [],
        negKeywords: [],
        isManual: true,
        savedAt: s.savedAt,
      };
    });
  }

  // ==================== POI → 店铺格式转换 ====================

  /** 高德 POI 类型 → 分类 */
  function mapAmapTypeToCategory(amapType) {
    if (!amapType) return '快餐简餐';
    var t = amapType.toLowerCase();
    if (t.indexOf('快餐') !== -1 || t.indexOf('简餐') !== -1) return '快餐简餐';
    if (t.indexOf('川菜') !== -1) return '川菜';
    if (t.indexOf('湘菜') !== -1) return '湘菜';
    if (t.indexOf('粤菜') !== -1) return '粤菜';
    if (t.indexOf('面') !== -1 || t.indexOf('粉') !== -1) return '面馆';
    if (t.indexOf('麻辣烫') !== -1) return '麻辣烫';
    if (t.indexOf('炸鸡') !== -1 || t.indexOf('小吃') !== -1) return '炸鸡小吃';
    if (t.indexOf('茶') !== -1 || t.indexOf('奶茶') !== -1 || t.indexOf('饮品') !== -1 || t.indexOf('冷饮') !== -1) return '奶茶饮品';
    if (t.indexOf('咖啡') !== -1) return '咖啡';
    if (t.indexOf('韩') !== -1) return '韩式料理';
    if (t.indexOf('日') !== -1) return '日料';
    if (t.indexOf('烧烤') !== -1) return '烧烤';
    if (t.indexOf('火锅') !== -1) return '火锅';
    if (t.indexOf('清真') !== -1 || t.indexOf('拉面') !== -1) return '面馆';
    if (t.indexOf('烘焙') !== -1 || t.indexOf('面包') !== -1 || t.indexOf('蛋糕') !== -1) return '烘焙甜点';
    return '快餐简餐';
  }

  /** 从分类生成标签 */
  function generateTags(category) {
    var tagMap = {
      '快餐简餐': ['出餐快', '性价比', '家常味'],
      '川菜': ['麻辣鲜香', '正宗川味', '下饭'],
      '湘菜': ['地道湘味', '香辣', '下饭'],
      '粤菜': ['清淡鲜美', '精致', '食材新鲜'],
      '面馆': ['汤鲜面劲道', '实惠', '手工'],
      '麻辣烫': ['汤底浓郁', '选择丰富', '人气'],
      '炸鸡小吃': ['外酥里嫩', '人气高', '出餐快'],
      '奶茶饮品': ['网红', '颜值高', '人气'],
      '咖啡': ['出餐快', '上班族最爱', '性价比'],
      '韩式料理': ['韩式风味', '人气', '聚会'],
      '日料': ['精致', '食材新鲜', '正宗'],
      '烧烤': ['人气', '聚会', '夜宵'],
      '火锅': ['人气爆棚', '聚会', '地道'],
      '烘焙甜点': ['颜值高', '下午茶', '甜蜜'],
    };
    return (tagMap[category] || ['人气', '实惠', '推荐']).slice(0, 3);
  }

  /** 随机取数组元素 */
  function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  /** 获取过去 N 天内的随机日期 */
  function randomDate(maxDaysAgo) {
    var d = new Date();
    d.setDate(d.getDate() - Math.floor(Math.random() * maxDaysAgo));
    return d.getFullYear() + '-' +
      String(d.getMonth() + 1).padStart(2, '0') + '-' +
      String(d.getDate()).padStart(2, '0');
  }

  // 评论模板池 — 从 Mock 数据中提取的真实评论
  var POSITIVE_POOL = [
    { rating: 5, content: '味道很正宗！{feature}，配上主食绝了，分量也很足。' },
    { rating: 5, content: '太好吃了！{feature}，每次点都不失望，推荐！' },
    { rating: 5, content: '分量真的很大！味道好，价格实惠，性价比超高！' },
    { rating: 4, content: '味道不错，{feature}。就是等的时间稍微长了点。' },
    { rating: 5, content: '第二次点了，一如既往的好吃！{feature}，很入味。' },
    { rating: 4, content: '{feature}很出色，整体水平在线。包装也很用心，没有洒漏。' },
    { rating: 5, content: '配送很快，送到还是热乎的！{feature}，满足！' },
    { rating: 4, content: '{feature}，食材新鲜。价格能接受，会回购。' },
    { rating: 5, content: '同事推荐的，确实不错！{feature}，打工人午餐好选择。' },
    { rating: 4, content: '总体来说挺好的，{feature}。就是配送范围要是能再大点就好了。' },
    { rating: 5, content: '超值！{feature}，这个价位在北京很良心了。' },
  ];

  var NEGATIVE_POOL = [
    { rating: 2, content: '今天{problem}，不如之前好吃了，有点失望。' },
    { rating: 3, content: '中规中矩吧，没有特别惊艳。{problem}。' },
    { rating: 2, content: '这次的{problem}，品控不太稳定。' },
    { rating: 1, content: '送来都凉了！{problem}，很失望。' },
    { rating: 3, content: '味道还行吧，但是{problem}，性价比一般。' },
    { rating: 2, content: '配送超时了快20分钟，而且{problem}。' },
    { rating: 3, content: '{problem}，但胜在方便。偶尔吃吃还行。' },
  ];

  var POS_FEATURES = ['味道', '口感', '汤底很鲜', '酱料好吃', '食材新鲜', '火候刚好', '调味恰到好处', '分量给得足', '包装精致'];
  var NEG_PROBLEMS = ['味道偏咸', '分量比之前少了', '口感一般', '太油腻了', '有点凉了', '汤洒了一些', '偏贵', '等待时间太长'];

  /** 为一间 POI 店铺生成模拟评论 */
  function generateReviewsForShop(shopId, category, realPhotos) {
    realPhotos = realPhotos || [];
    var count = 3 + Math.floor(Math.random() * 5); // 3-7 条
    var reviews = [];
    var photoIdx = 0;  // 真实照片分配游标
    var users = [
      { name: '吃货小王', avatar: '王' }, { name: '外卖达人', avatar: '李' },
      { name: '吃遍天下', avatar: '张' }, { name: '美食猎人', avatar: '吴' },
      { name: '打工人午餐', avatar: '杨' }, { name: '学生党', avatar: '崔' },
      { name: '测评君', avatar: '陈' }, { name: '新尝试者', avatar: '林' },
      { name: '回头客', avatar: '石' }, { name: '严格吃货', avatar: '万' },
      { name: '午饭打卡', avatar: '徐' }, { name: '性价比党', avatar: '姚' },
    ];
    var posKeywords = [];
    var negKeywords = [];

    for (var i = 0; i < count; i++) {
      var isPositive = Math.random() > 0.25;
      var template, u;

      if (isPositive) {
        template = pick(POSITIVE_POOL);
        var feat = pick(POS_FEATURES);
        template.content = template.content.replace('{feature}', feat);
        posKeywords.push(feat);
        u = pick(users);
      } else {
        template = pick(NEGATIVE_POOL);
        var prob = pick(NEG_PROBLEMS);
        template.content = template.content.replace('{problem}', prob);
        negKeywords.push(prob);
        u = pick(users);
      }

      // 配图：优先使用真实照片，用完后再用 picsum 随机图兜底
      var imgCount = Math.random() > 0.5 ? Math.floor(Math.random() * 3) + 1 : 0;
      var images = [];
      for (var j = 0; j < imgCount; j++) {
        if (photoIdx < realPhotos.length) {
          // 用真实照片
          images.push(realPhotos[photoIdx]);
          photoIdx++;
        } else {
          // 真实照片用完，picsum 兜底
          images.push('https://picsum.photos/seed/' + String(shopId) + '_r' + i + '_' + j + '/300/300');
        }
      }

      reviews.push({
        id: i + 1,
        userName: u.name,
        avatar: u.avatar,
        rating: template.rating,
        content: template.content,
        date: randomDate(30),
        images: images,
      });
    }

    // 去重后取前几位
    var uniquePos = [];
    posKeywords.forEach(function (k) { if (uniquePos.indexOf(k) === -1) uniquePos.push(k); });
    var uniqueNeg = [];
    negKeywords.forEach(function (k) { if (uniqueNeg.indexOf(k) === -1) uniqueNeg.push(k); });

    return {
      reviews: reviews,
      posKeywords: uniquePos.slice(0, 6),
      negKeywords: uniqueNeg.slice(0, 4),
    };
  }

  /**
   * 提取 POI 真实照片 URL 列表
   * 高德 photos 格式：[{title, url}, ...] → 提取 url 数组
   */
  function extractRealPhotos(poi) {
    if (poi.photos && poi.photos.length > 0) {
      return poi.photos.map(function (p) { return p.url; });
    }
    return [];
  }

  /**
   * 将高德 POI 对象转换为标准店铺格式
   * @param {Object} poi - 高德 POI 对象
   * @param {number} userLat - 用户纬度
   * @param {number} userLng - 用户经度
   * @param {number} index - 序号
   */
  function convertPoiToShop(poi, userLat, userLng, index) {
    var locParts = poi.location.split(',');
    var lat = parseFloat(locParts[1]);
    var lng = parseFloat(locParts[0]);
    var dist = LocationModule.haversineDistance(userLat, userLng, lat, lng);
    var category = mapAmapTypeToCategory(poi.type);

    // ✅ 真实评分：优先用高德 biz_ext.rating（around API + detail API 补全后基本都有）
    var rating = 3.8;
    if (poi.biz_ext && poi.biz_ext.rating) {
      rating = parseFloat(poi.biz_ext.rating);
    } else {
      rating = 3.2 + Math.random() * 1.7;
    }
    rating = Math.round(rating * 10) / 10;
    rating = Math.min(5, Math.max(3.0, rating));

    // 月销量模拟（基于距离：越近销量越高）
    var baseSales = 8000 - dist * 1200;
    var monthlySales = Math.floor(Math.max(300, baseSales + (Math.random() - 0.5) * 3000));

    // 人均价格：✅ 优先用高德 biz_ext.cost（真实人均），没有则按分类估算
    var avgPrice;
    if (poi.biz_ext && poi.biz_ext.cost) {
      avgPrice = parseInt(poi.biz_ext.cost) || 0;
    }
    if (!avgPrice || avgPrice <= 0) {
      var priceMap = {
        '快餐简餐': [15, 30], '川菜': [30, 60], '湘菜': [28, 50],
        '粤菜': [35, 70], '面馆': [15, 28], '麻辣烫': [18, 35],
        '炸鸡小吃': [20, 40], '奶茶饮品': [15, 30], '咖啡': [15, 35],
        '韩式料理': [30, 55], '日料': [40, 80], '烧烤': [35, 65],
        '火锅': [50, 100], '烘焙甜点': [20, 45],
      };
      var priceRange = priceMap[category] || [20, 40];
      avgPrice = Math.floor(priceRange[0] + Math.random() * (priceRange[1] - priceRange[0]));
    }

    // 配送时间（基于距离）
    var minTime = Math.floor(15 + dist * 4);
    var maxTime = Math.floor(minTime + 10 + Math.random() * 10);
    var deliveryTime = minTime + '-' + maxTime + '分钟';

    // 配送费
    var deliveryFee = Math.random() > 0.55 ? 0 : Math.floor(Math.random() * 5) + 1;

    // ✅ 真实照片（从高德 around API 的 extensions=all 返回，或 detail API 补全）
    var realPhotos = extractRealPhotos(poi);

    // 生成评论和关键词（传入真实照片用于评论配图）
    var reviewData = generateReviewsForShop(poi.id || index, category, realPhotos);

    return {
      id: 'poi_' + (poi.id || index),
      name: poi.name,
      category: category,
      rating: rating,
      monthlySales: monthlySales,
      avgPrice: avgPrice,
      deliveryTime: deliveryTime,
      deliveryFee: deliveryFee,
      lat: lat,
      lng: lng,
      address: poi.address || '',
      tags: generateTags(category),
      reviews: reviewData.reviews,
      posKeywords: reviewData.posKeywords,
      negKeywords: reviewData.negKeywords,
      realPhotos: realPhotos,  // 真实店铺照片（详情页图片网格用）
      isManual: false,
    };
  }

  /** 一键获取所有分类选项 */
  var CATEGORY_OPTIONS = [
    '快餐简餐', '川菜', '湘菜', '粤菜', '面馆', '麻辣烫',
    '炸鸡小吃', '奶茶饮品', '咖啡', '韩式料理', '日料',
    '烧烤', '火锅', '烘焙甜点', '其他',
  ];

  return {
    loadManualShops,
    saveManualShops,
    addManualShop,
    deleteManualShop,
    getManualShops,
    mapAmapTypeToCategory,
    generateTags,
    generateReviewsForShop,
    convertPoiToShop,
    CATEGORY_OPTIONS,
  };

})();
