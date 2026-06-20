/**
 * Mock 数据 — 今天吃什么
 * 模拟北京中关村附近 5km 范围内的外卖店铺数据
 */

// 基准坐标：北京中关村
const BASE_LAT = 39.9836;
const BASE_LNG = 116.3059;

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
 * 动态散布店铺位置
 * 将所有店铺随机散布在指定中心点的周围（确保用户在任何地方都能看到店铺）
 * @param {number} centerLat - 中心纬度
 * @param {number} centerLng - 中心经度
 * @param {number} radiusKm - 散布半径（公里），默认 3km
 */
function redistributeShopsAround(centerLat, centerLng, radiusKm) {
  radiusKm = radiusKm || 3;
  SHOPS.forEach(function (shop) {
    // 随机角度
    var angle = Math.random() * 2 * Math.PI;
    // 随机距离：0.3km ~ radiusKm（不要太近）
    var dist = 0.3 + Math.random() * (radiusKm - 0.3);

    // 经纬度偏移换算
    // 1 度纬度 ≈ 111.32 km
    // 1 度经度 ≈ 111.32 × cos(纬度) km
    var latOffset = (dist * Math.cos(angle)) / 111.32;
    var lngOffset = (dist * Math.sin(angle)) / (111.32 * Math.cos(centerLat * Math.PI / 180));

    shop.lat = centerLat + latOffset;
    shop.lng = centerLng + lngOffset;
  });
}