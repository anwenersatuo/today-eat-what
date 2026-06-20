/**
 * 数据模块 — 今天吃什么
 * - 高德 POI → 店铺格式转换（只保留真实数据，不编造）
 * - 手动收藏店铺（localStorage 持久化）
 * - Mock 兜底数据（仅高德 API 完全失败时使用）
 */

// 基准坐标：北京中关村
const BASE_LAT = 39.9836;
const BASE_LNG = 116.3059;

// ==================== Mock 兜底数据（仅店名/地址/坐标，不编造评分评论） ====================
const SHOPS = [
  { name: '黄焖鸡米饭（中关村店）',  category: '快餐简餐', lat: 39.9850, lng: 116.3070, address: '海淀区中关村大街27号' },
  { name: '老王川菜馆',              category: '川菜',     lat: 39.9810, lng: 116.3100, address: '海淀区海淀大街12号' },
  { name: '一口湘·湖南味道',        category: '湘菜',     lat: 39.9870, lng: 116.3030, address: '海淀区科学院南路8号' },
  { name: '超级鸡车·炸鸡汉堡',      category: '炸鸡小吃', lat: 39.9840, lng: 116.3080, address: '海淀区中关村东路15号' },
  { name: '杨国福麻辣烫（苏州街店）', category: '麻辣烫',  lat: 39.9820, lng: 116.3020, address: '海淀区苏州街33号' },
  { name: '喜茶（中关村店）',        category: '奶茶饮品', lat: 39.9855, lng: 116.3090, address: '海淀区中关村大街19号' },
  { name: '瑞幸咖啡（中关村创业大街店）', category: '咖啡', lat: 39.9815, lng: 116.3075, address: '海淀区海淀西大街48号' },
  { name: '兰州拉面·清真（中关村店）', category: '面馆',   lat: 39.9860, lng: 116.3040, address: '海淀区科学院南路55号' },
  { name: '沙县小吃（苏州街二店）',  category: '快餐简餐', lat: 39.9800, lng: 116.3010, address: '海淀区苏州街12号' },
  { name: '明洞韩式炸鸡·啤酒屋',    category: '韩式料理', lat: 39.9830, lng: 116.3120, address: '海淀区中关村南路72号' },
];

/**
 * 动态散布店铺位置（仅用于 Mock 兜底数据）
 * 把固定坐标的店铺散布到用户周边
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


// ==================== DataModule ====================

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
        rating: s.rating || null,         // 用户自己填的评分（可视为"真实"）
        monthlySales: null,                // 无数据
        avgPrice: s.avgPrice || null,      // 用户自己填的人均
        deliveryTime: null,                // 无数据
        deliveryFee: null,                 // 无数据
        lat: s.lat,
        lng: s.lng,
        address: s.address || '',
        tags: ['⭐收藏'],                  // 手动店铺统一标签
        reviews: [],                       // 无真实评论
        posKeywords: [],
        negKeywords: [],
        realPhotos: [],                    // 手动店铺无高德照片
        isManual: true,
        savedAt: s.savedAt,
      };
    });
  }

  // ==================== POI → 店铺格式转换 ====================

  /** 高德 POI 类型 → 分类（真实映射，不编造） */
  function mapAmapTypeToCategory(amapType) {
    if (!amapType) return '其他';
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
    return '其他';
  }

  /** 提取 POI 真实照片 URL 列表 */
  function extractRealPhotos(poi) {
    if (poi.photos && poi.photos.length > 0) {
      return poi.photos.map(function (p) { return p.url; });
    }
    return [];
  }

  /**
   * 将高德 POI 对象转换为标准店铺格式
   *
   * 【仅保留真实数据，不编造任何字段】
   * - 店名/地址/坐标/分类 → 高德真实
   * - 评分 → biz_ext.rating（高德真实），没有则 null
   * - 人均 → biz_ext.cost（高德真实），没有则 null
   * - 照片 → photos（高德真实），没有则空数组
   * - 月销量/配送时间/配送费 → 无数据源，一律 null
   * - 评论/关键词 → 无数据源，一律空数组
   */
  function convertPoiToShop(poi, userLat, userLng, index) {
    var locParts = poi.location.split(',');
    var lat = parseFloat(locParts[1]);
    var lng = parseFloat(locParts[0]);

    // 真实分类
    var category = mapAmapTypeToCategory(poi.type);

    // 真实评分（仅当高德提供时，否则 null）
    var rating = null;
    if (poi.biz_ext && poi.biz_ext.rating) {
      var r = parseFloat(poi.biz_ext.rating);
      if (!isNaN(r) && r > 0) {
        rating = Math.round(r * 10) / 10;
      }
    }

    // 真实人均（仅当高德提供时，否则 null）
    var avgPrice = null;
    if (poi.biz_ext && poi.biz_ext.cost) {
      var c = parseInt(poi.biz_ext.cost);
      if (!isNaN(c) && c > 0) {
        avgPrice = c;
      }
    }

    // 真实照片
    var realPhotos = extractRealPhotos(poi);

    return {
      id: 'poi_' + (poi.id || index),
      name: poi.name,                  // ✅ 真实
      category: category,              // ✅ 真实（从 type 解析）
      rating: rating,                  // ✅ 真实（null = 无数据）
      monthlySales: null,              // ❌ 无数据源
      avgPrice: avgPrice,              // ✅ 真实（null = 无数据）
      deliveryTime: null,             // ❌ 无数据源
      deliveryFee: null,              // ❌ 无数据源
      lat: lat,                        // ✅ 真实
      lng: lng,                        // ✅ 真实
      address: poi.address || '',      // ✅ 真实
      tags: [],                        // ❌ 不编造标签
      reviews: [],                     // ❌ 无真实评论
      posKeywords: [],
      negKeywords: [],
      realPhotos: realPhotos,          // ✅ 真实店铺照片
      isManual: false,
    };
  }

  /** 一键获取所有分类选项（供手动添加店铺表单使用） */
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
    convertPoiToShop,
    CATEGORY_OPTIONS,
  };

})();
