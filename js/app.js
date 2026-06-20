/**
 * 主应用逻辑
 * - 欢迎页：两个入口（GPS定位 / 地图选点）
 * - 定位后显示店铺列表
 * - 页面路由（列表 ↔ 详情）
 */

const App = (() => {
  let currentSort = 'composite';
  let rankedShops = [];
  let currentShop = null;
  let isLocating = false;
  let isRandomOpen = false;   // 随机弹窗是否打开（防重复触发）
  let addressText = '';       // 手动选址时的地址文字

  function init() {
    RenderModule.renderWelcomeScreen();
    bindWelcomeEvents();
  }

  /**
   * 绑定欢迎页事件（供 MapPicker 关闭后重新绑定）
   */
  function bindWelcomeEvents() {
    // GPS 定位按钮
    const btnLocate = document.getElementById('btnStartLocate');
    if (btnLocate) {
      btnLocate.addEventListener('click', handleGpsLocate);
    }

    // 地图选点按钮
    const btnMap = document.getElementById('btnOpenMap');
    if (btnMap) {
      btnMap.addEventListener('click', handleOpenMap);
    }
  }

  /**
   * GPS 自动定位
   */
  async function handleGpsLocate() {
    if (isLocating) return;
    isLocating = true;

    const btn = document.getElementById('btnStartLocate');
    if (btn) {
      btn.classList.add('loading');
      btn.innerHTML = '<span class="btn-locate-icon">⏳</span><span>正在定位中…</span>';
    }

    try {
      await LocationModule.getCurrentPosition();
      addressText = '';
      showShopList();
    } catch (err) {
      console.error('定位失败：', err);
      showShopList();
    } finally {
      isLocating = false;
    }
  }

  /**
   * 打开地图选点
   */
  function handleOpenMap() {
    MapPicker.open(async (location) => {
      // 用户在地图上确认了位置
      LocationModule.setManualLocation(location.lat, location.lng);
      addressText = location.address || '';
      showShopList();
    });
  }

  /**
   * 显示店铺列表（统一的列表渲染入口）
   */
  function showShopList() {
    const userLocation = LocationModule.getUserLocation();
    const hasError = LocationModule.hasLocationError();
    const isManual = LocationModule.getIsManual();

    // 动态散布店铺到用户位置周围（确保任何地方都能看到店铺）
    if (userLocation) {
      redistributeShopsAround(userLocation.lat, userLocation.lng);
    }

    const nearbyShops = LocationModule.filterShopsByDistance(SHOPS);
    rankedShops = RankingModule.rankShops(nearbyShops, currentSort);
    RenderModule.renderShopList(rankedShops, userLocation, hasError, currentSort, isManual, addressText);
    bindListEvents();

    // 启动摇一摇监听（每次进入列表页都重新启动）
    if (ShakeModule.isSupported() && !ShakeModule.needsPermission()) {
      ShakeModule.start(handleRandomPick);
    }

    window.scrollTo({ top: 0, behavior: 'instant' });
    isLocating = false;
  }

  /**
   * 重新选择位置（从列表页点击"换位置"）
   */
  function handleRelocate() {
    // 停止摇一摇监听
    ShakeModule.stop();
    // 返回到欢迎页
    currentSort = 'composite';
    addressText = '';
    rankedShops = [];
    RenderModule.renderWelcomeScreen();
    bindWelcomeEvents();
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  /**
   * 随机推荐入口（按钮点击 / 摇一摇触发）
   */
  function handleRandomPick() {
    // 没有店铺或弹窗已打开 → 忽略
    if (!rankedShops.length || isRandomOpen) return;
    isRandomOpen = true;

    // 创建弹窗
    RenderModule.renderRandomPicker();

    // 启动老虎机轮播
    runSlotAnimation(rankedShops, function (winner) {
      bindRandomEvents(winner);
    });
  }

  /**
   * 老虎机轮播动画
   * 店名快速轮播 → 逐渐变慢 → 停在结果上
   * @param {Array} shops - 候选店铺列表
   * @param {Function} onComplete - 动画完成回调，参数为选中的店铺
   */
  function runSlotAnimation(shops, onComplete) {
    var slotEl = document.getElementById('randomSlot');
    var resultEl = document.getElementById('randomResult');
    var actionsEl = document.getElementById('randomActions');
    var emojiEl = document.querySelector('.random-emoji');

    // 先隐藏结果和按钮
    if (resultEl) resultEl.style.display = 'none';
    if (actionsEl) actionsEl.style.display = 'none';
    if (slotEl) {
      slotEl.style.display = 'flex';
      slotEl.className = 'random-slot spinning';
    }

    // 随机选出赢家
    var winner = shops[Math.floor(Math.random() * shops.length)];

    // 轮播帧：间隔时间（ms），逐渐变慢
    var frames = [60, 60, 60, 80, 80, 100, 100, 100, 150, 150, 200, 250, 350, 500];
    var frameIdx = 0;

    function tick() {
      if (frameIdx >= frames.length) {
        // 轮播结束 → 停在 winner
        if (slotEl) {
          slotEl.textContent = winner.name;
          slotEl.className = 'random-slot landed';
        }
        if (emojiEl) emojiEl.textContent = '🎉';

        // 停顿一下再展示完整结果
        setTimeout(function () {
          if (slotEl) slotEl.style.display = 'none';
          showRandomResult(winner);
          if (onComplete) onComplete(winner);
        }, 400);
        return;
      }

      // 随机挑一个店名显示（最后一帧用 winner）
      var displayShop = (frameIdx === frames.length - 1)
        ? winner
        : shops[Math.floor(Math.random() * shops.length)];

      if (slotEl) slotEl.textContent = displayShop.name;

      frameIdx++;
      var delay = frames[frameIdx - 1];
      setTimeout(tick, delay);
    }

    tick();
  }

  /**
   * 在弹窗中展示随机结果
   */
  function showRandomResult(shop) {
    var resultEl = document.getElementById('randomResult');
    var actionsEl = document.getElementById('randomActions');
    var nameEl = document.getElementById('randomResultName');
    var metaEl = document.getElementById('randomResultMeta');
    var tagsEl = document.getElementById('randomResultTags');
    var distStr = LocationModule.formatDistance(shop.distance);

    if (nameEl) nameEl.textContent = shop.name;
    if (metaEl) {
      metaEl.innerHTML =
        '<span class="stars">' + renderStarsForResult(shop.rating) + '</span>' +
        '<span>' + shop.rating + '</span>' +
        '<span>📍 ' + distStr + '</span>';
    }
    if (tagsEl) {
      tagsEl.innerHTML = shop.tags.map(function (t) {
        return '<span class="shop-tag">' + t + '</span>';
      }).join('');
    }

    if (resultEl) resultEl.style.display = 'block';
    if (actionsEl) actionsEl.style.display = 'flex';
  }

  /** 简单的星星渲染（供 showRandomResult 内部使用） */
  function renderStarsForResult(rating) {
    var full = Math.floor(rating);
    var empty = 5 - full;
    var html = '';
    for (var i = 0; i < full; i++) html += '<i class="star full">★</i>';
    for (var j = 0; j < empty; j++) html += '<i class="star empty">☆</i>';
    return html;
  }

  /**
   * 绑定弹窗按钮事件（换一个 / 就这家）
   */
  function bindRandomEvents(winner) {
    // 换一个 → 重新轮播
    var btnRetry = document.getElementById('btnRandomRetry');
    if (btnRetry) {
      var newRetry = btnRetry.cloneNode(true);
      btnRetry.parentNode.replaceChild(newRetry, btnRetry);
      newRetry.addEventListener('click', function () {
        var emojiEl = document.querySelector('.random-emoji');
        if (emojiEl) emojiEl.textContent = '🎲';
        runSlotAnimation(rankedShops, function (newWinner) {
          bindRandomEvents(newWinner);
        });
      });
    }

    // 就这家 → 关闭弹窗，跳转详情
    var btnGo = document.getElementById('btnRandomGo');
    if (btnGo) {
      var newGo = btnGo.cloneNode(true);
      btnGo.parentNode.replaceChild(newGo, btnGo);
      newGo.addEventListener('click', function () {
        RenderModule.closeRandomPicker();
        isRandomOpen = false;
        ShakeModule.stop();
        currentShop = winner;
        showDetail(winner);
      });
    }

    // 点击背景关闭
    var backdrop = document.querySelector('.random-backdrop');
    if (backdrop) {
      var newBackdrop = backdrop.cloneNode(true);
      backdrop.parentNode.replaceChild(newBackdrop, backdrop);
      newBackdrop.addEventListener('click', function () {
        RenderModule.closeRandomPicker();
        isRandomOpen = false;
      });
    }
  }

  /**
   * 绑定列表页事件
   */
  function bindListEvents() {
    // 排序切换
    document.querySelectorAll('.sort-tab').forEach((tab) => {
      tab.addEventListener('click', () => {
        const sortMode = tab.dataset.sort;
        if (sortMode === currentSort) return;
        currentSort = sortMode;
        refreshList();
      });
    });

    // 换位置按钮
    const btnRelocate = document.getElementById('btnRelocate');
    if (btnRelocate) {
      btnRelocate.addEventListener('click', handleRelocate);
    }

    // 点击店铺卡片
    document.querySelectorAll('.shop-card').forEach((card) => {
      card.addEventListener('click', () => {
        const shopId = parseInt(card.dataset.shopId);
        currentShop = rankedShops.find((s) => s.id === shopId);
        if (currentShop) showDetail(currentShop);
      });
    });

    // 🎲 随机推荐按钮（点击触发老虎机弹窗）
    const btnRandom = document.getElementById('btnRandomPick');
    if (btnRandom) {
      btnRandom.addEventListener('click', async () => {
        // iOS 13+ 需要用户手势授权
        if (ShakeModule.needsPermission()) {
          try {
            await ShakeModule.requestPermission();
            ShakeModule.start(handleRandomPick);
          } catch (e) {
            console.warn('DeviceMotion 权限被拒绝，仅使用按钮模式');
          }
        }
        handleRandomPick();
      });
    }
  }

  function refreshList() {
    const userLocation = LocationModule.getUserLocation();
    const hasError = LocationModule.hasLocationError();
    const isManual = LocationModule.getIsManual();
    rankedShops = RankingModule.rankShops(rankedShops, currentSort);
    RenderModule.renderShopList(rankedShops, userLocation, hasError, currentSort, isManual, addressText);
    bindListEvents();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function showDetail(shop) {
    // 进入详情页时停止摇一摇
    ShakeModule.stop();
    RenderModule.renderShopDetail(shop);
    bindDetailEvents(shop);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }

  function bindDetailEvents(shop) {
    document.getElementById('btnBack')?.addEventListener('click', () => {
      currentShop = null;
      const userLocation = LocationModule.getUserLocation();
      const hasError = LocationModule.hasLocationError();
      const isManual = LocationModule.getIsManual();
      RenderModule.renderShopList(rankedShops, userLocation, hasError, currentSort, isManual, addressText);
      bindListEvents();

      // 返回列表时重新启动摇一摇
      if (ShakeModule.isSupported() && !ShakeModule.needsPermission()) {
        ShakeModule.start(handleRandomPick);
      }

      window.scrollTo({ top: 0, behavior: 'instant' });
    });

    const reviewImages = RenderModule.collectReviewImages(shop.reviews);
    document.querySelectorAll('.image-card:not(.more-images)').forEach((card) => {
      card.addEventListener('click', () => {
        const idx = parseInt(card.dataset.index);
        RenderModule.renderImageViewer(reviewImages, idx);
      });
    });

    document.querySelectorAll('.review-thumb').forEach((thumb) => {
      thumb.addEventListener('click', (e) => {
        e.stopPropagation();
        const src = thumb.src;
        const idx = reviewImages.findIndex((img) => img.url === src);
        if (idx >= 0) RenderModule.renderImageViewer(reviewImages, idx);
      });
    });
  }

  return { init, bindWelcomeEvents };
})();

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
