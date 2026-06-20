/**
 * 排名算法模块
 * - 综合评分 + 距离两个维度（不使用无数据源的月销量）
 * - Min-Max 归一化
 * - 支持多种排序方式
 * - 处理 null 值（无数据字段按最低分处理）
 */

const RankingModule = (() => {

  /** 排序方式 */
  var SORT_MODES = {
    COMPOSITE: 'composite',   // 综合排序（评分 60% + 距离 40%）
    RATING: 'rating',         // 评分优先
    DISTANCE: 'distance',     // 距离最近
  };

  /**
   * Min-Max 归一化（值越大越好）
   * null 值视为 0 分
   */
  function normalizeMax(arr, key) {
    var vals = arr.map(function (item) {
      var v = item[key];
      return (v !== null && v !== undefined && !isNaN(v)) ? v : 0;
    });
    var min = Math.min.apply(null, vals);
    var max = Math.max.apply(null, vals);
    if (max === min) return vals.map(function () { return 0.5; });
    return vals.map(function (v) { return (v - min) / (max - min); });
  }

  /**
   * Min-Max 归一化（值越小越好，如距离）
   */
  function normalizeMin(arr, key) {
    var vals = arr.map(function (item) { return item[key] || 0; });
    var min = Math.min.apply(null, vals);
    var max = Math.max.apply(null, vals);
    if (max === min) return vals.map(function () { return 0.5; });
    return vals.map(function (v) { return (max - v) / (max - min); });
  }

  /**
   * 计算综合得分并排序
   *
   * 综合得分 = 评分归一化 × 0.6 + 距离归一化 × 0.4
   * （不使用月销量——无数据源）
   *
   * @param {Array} shops - 已添加 distance 字段的店铺
   * @param {string} sortMode - 排序方式
   * @returns {Array} 添加了 score 和 rank 字段的店铺列表
   */
  function rankShops(shops, sortMode) {
    sortMode = sortMode || SORT_MODES.COMPOSITE;
    if (!shops.length) return [];

    var ratingNorm = normalizeMax(shops, 'rating');
    var distNorm = normalizeMin(shops, 'distance');

    var scored = shops.map(function (shop, i) {
      var score;
      switch (sortMode) {
        case SORT_MODES.RATING:
          score = ratingNorm[i];
          break;
        case SORT_MODES.DISTANCE:
          score = distNorm[i];
          break;
        case SORT_MODES.COMPOSITE:
        default:
          score = ratingNorm[i] * 0.6 + distNorm[i] * 0.4;
          break;
      }
      return { ...shop, score: score };
    });

    // 从高到低排序（得分高的在前面）
    scored.sort(function (a, b) { return b.score - a.score; });

    // 添加排名
    scored = scored.map(function (shop, i) {
      return { ...shop, rank: i + 1 };
    });

    return scored;
  }

  function getSortModes() {
    return SORT_MODES;
  }

  return {
    rankShops: rankShops,
    getSortModes: getSortModes,
    SORT_MODES: SORT_MODES,
  };
})();
