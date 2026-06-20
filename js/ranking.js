/**
 * 排名算法模块
 * - 综合评分、月销量、距离三个维度
 * - Min-Max 归一化
 * - 支持多种排序方式
 */

const RankingModule = (() => {

  /** 排序方式 */
  const SORT_MODES = {
    COMPOSITE: 'composite',   // 综合排序（默认）
    RATING: 'rating',         // 评分优先
    SALES: 'sales',           // 销量优先
    DISTANCE: 'distance',     // 距离最近
  };

  /**
   * Min-Max 归一化（值越大越好）
   */
  function normalizeMax(arr, key) {
    const vals = arr.map((item) => item[key]);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    if (max === min) return arr.map(() => 0.5);
    return vals.map((v) => (v - min) / (max - min));
  }

  /**
   * Min-Max 归一化（值越小越好，如距离）
   */
  function normalizeMin(arr, key) {
    const vals = arr.map((item) => item[key]);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    if (max === min) return arr.map(() => 0.5);
    return vals.map((v) => (max - v) / (max - min));
  }

  /**
   * 计算综合得分并排序
   * 综合得分 = 评分归一化 × 0.5 + 月销量归一化 × 0.3 + 距离归一化 × 0.2
   * @param {Array} shops - 已添加 distance 字段的店铺
   * @param {string} sortMode - 排序方式
   * @returns {Array} 添加了 score 和 rank 字段的店铺列表
   */
  function rankShops(shops, sortMode = SORT_MODES.COMPOSITE) {
    if (!shops.length) return [];

    const ratingNorm = normalizeMax(shops, 'rating');
    const salesNorm = normalizeMax(shops, 'monthlySales');
    const distNorm = normalizeMin(shops, 'distance');

    // 计算综合得分
    let scored = shops.map((shop, i) => {
      let score;
      switch (sortMode) {
        case SORT_MODES.RATING:
          score = ratingNorm[i];
          break;
        case SORT_MODES.SALES:
          score = salesNorm[i];
          break;
        case SORT_MODES.DISTANCE:
          score = distNorm[i];
          break;
        case SORT_MODES.COMPOSITE:
        default:
          score = ratingNorm[i] * 0.5 + salesNorm[i] * 0.3 + distNorm[i] * 0.2;
          break;
      }
      return { ...shop, score, _ratingNorm: ratingNorm[i], _salesNorm: salesNorm[i], _distNorm: distNorm[i] };
    });

    // 从高到低排序（得分高的在前面）
    scored.sort((a, b) => b.score - a.score);

    // 添加排名
    scored = scored.map((shop, i) => ({
      ...shop,
      rank: i + 1,
    }));

    return scored;
  }

  function getSortModes() {
    return SORT_MODES;
  }

  return {
    rankShops,
    getSortModes,
    SORT_MODES,
  };
})();
