/**
 * 界面渲染模块 — 小红书 × Apple × 美团 风格
 * - Tailwind 工具类 + 自定义玻璃效果
 * - Motion One 驱动入场动画
 * - 店铺列表 / 详情页 / 评论 / 图片
 *
 * ⚠️ 所有 ID 和关键 class 与 app.js 保持一致，不可修改
 */

const RenderModule = (() => {

  const appEl = document.getElementById('app');

  // ==================== 动画工具 ====================

  /** 列表卡片错落入场动画 */
  async function animateCardEntrance() {
    if (!window.Motion) return;
    try {
      const { animate, stagger } = window.Motion;
      const cards = document.querySelectorAll('.shop-card');
      if (!cards.length) return;
      animate(
        Array.from(cards),
        { opacity: [0, 1], transform: ['translateY(16px)', 'translateY(0)'] },
        { duration: 0.35, delay: stagger(0.05), easing: [0.25, 0.1, 0.25, 1] }
      );
    } catch (_) { /* Motion 未就绪，静默跳过 */ }
  }

  /** 弹窗弹性入场 */
  async function animateModalIn(selector) {
    if (!window.Motion) return;
    try {
      const { animate } = window.Motion;
      const el = document.querySelector(selector);
      if (!el) return;
      animate(
        el,
        { scale: [0.6, 1], opacity: [0, 1] },
        { type: 'spring', stiffness: 350, damping: 22, mass: 0.8 }
      );
    } catch (_) {}
  }

  /** 通用淡入 */
  async function animateFadeIn(el) {
    if (!window.Motion || !el) return;
    try {
      const { animate } = window.Motion;
      animate(el, { opacity: [0, 1], transform: ['translateY(8px)', 'translateY(0)'] }, { duration: 0.3, easing: 'ease-out' });
    } catch (_) {}
  }

  // ==================== 工具栏 ====================

  function renderStars(rating, size) {
    var sizeCls = size === 'large' ? 'star large text-[22px]' : 'text-[14px]';
    var full = Math.floor(rating);
    var half = rating - full >= 0.5 ? 1 : 0;
    var empty = 5 - full - half;
    var html = '<span class="stars ' + sizeCls + '">';
    for (var i = 0; i < full; i++) html += '<i class="star full">★</i>';
    if (half) html += '<i class="star half">☆</i>';
    for (var j = 0; j < empty; j++) html += '<i class="star empty">☆</i>';
    html += '</span>';
    return html;
  }

  function getRankBadge(rank) {
    if (rank === 1) return '<span class="text-2xl">🥇</span>';
    if (rank === 2) return '<span class="text-2xl">🥈</span>';
    if (rank === 3) return '<span class="text-2xl">🥉</span>';
    return '<span class="inline-flex items-center justify-center w-7 h-7 rounded-full bg-black/5 text-xs font-extrabold text-[#AEAEB2]">' + rank + '</span>';
  }

  // ==================== 欢迎页 ====================

  function renderWelcomeScreen() {
    appEl.innerHTML =
      '<div class="page relative min-h-screen overflow-hidden bg-gradient-to-b from-[#FFF0E8] via-[#FFF5F0] to-[#FFE8DC] flex flex-col items-center justify-center">' +

        // ── 背景光斑层（radial-gradient 替代 blur，零 GPU 开销）──
        '<div class="absolute inset-0 pointer-events-none overflow-hidden">' +
          '<div class="absolute w-[180px] h-[180px] rounded-full -top-20 -left-16" style="background:radial-gradient(circle, rgba(255,140,90,0.22) 0%, transparent 70%);animation:orbPulse 5s ease-in-out infinite"></div>' +
          '<div class="absolute w-[200px] h-[200px] rounded-full top-[30%] -right-16" style="background:radial-gradient(circle, rgba(255,130,130,0.18) 0%, transparent 70%);animation:orbPulse 7s ease-in-out infinite 1.5s"></div>' +
          '<div class="absolute w-[160px] h-[160px] rounded-full bottom-[20%] left-[20%]" style="background:radial-gradient(circle, rgba(255,180,100,0.18) 0%, transparent 70%);animation:orbPulse 6s ease-in-out infinite 3s"></div>' +
        '</div>' +

        // ── 漂浮食物 emoji（5个，仅 transform 动画）──
        '<div class="absolute inset-0 pointer-events-none overflow-hidden">' +
          '<span class="welcome-emoji absolute text-3xl opacity-35" style="top:10%;left:8%;animation:emojiFloat1 6s ease-in-out infinite">🍜</span>' +
          '<span class="welcome-emoji absolute text-4xl opacity-30" style="top:16%;right:10%;animation:emojiFloat2 7s ease-in-out infinite 0.8s">🍕</span>' +
          '<span class="welcome-emoji absolute text-2xl opacity-35" style="top:34%;left:12%;animation:emojiFloat3 6.5s ease-in-out infinite 1.6s">🍔</span>' +
          '<span class="welcome-emoji absolute text-4xl opacity-30" style="top:8%;left:68%;animation:emojiFloat2 7.2s ease-in-out infinite 2.2s">🍣</span>' +
          '<span class="welcome-emoji absolute text-3xl opacity-35" style="top:28%;right:14%;animation:emojiFloat1 6.8s ease-in-out infinite 3s">🍟</span>' +
        '</div>' +

        // ── 内容区 ──
        '<div class="relative z-10 flex flex-col items-center px-8 text-center max-w-[360px]">' +

          // 主标题 — 渐变文字
          '<h1 class="welcome-title-gradient text-[42px] font-extrabold tracking-wide mb-2 leading-tight" id="welcomeTitle" style="opacity:0;transform:translateY(-8px)">' +
            '🍜 今天吃什么' +
          '</h1>' +

          // 情绪引导文案 — 逐行错落入场
          '<div class="text-base leading-relaxed mb-8" id="welcomeCopy">' +
            '<p class="welcome-copy-line text-[#8C7A6E]" style="animation-delay:0.2s">出去不知道吃什么</p>' +
            '<p class="welcome-copy-line text-[#8C7A6E]" style="animation-delay:0.35s">没关系！！！</p>' +
            '<p class="welcome-copy-line text-[#8C7A6E]" style="animation-delay:0.5s">今天去探索一家好吃的店</p>' +
          '</div>' +

          // 📸 趣味照片卡片
          '<div class="mb-8" style="animation:copyFadeUp 0.5s ease-out 0.6s forwards;opacity:0">' +
            '<div class="inline-block bg-white rounded-xl p-2 shadow-soft rotate-1">' +
              '<img src="images/photo-friend.jpg" class="w-44 h-44 object-cover rounded-lg" alt="photo" />' +
            '</div>' +
          '</div>' +

          // 🎲 核心 CTA — 呼吸发光动画
          '<button id="btnStartLocate" ' +
            'class="welcome-cta btn-locate flex items-center justify-center gap-2.5 w-full px-10 py-4 ' +
            'bg-gradient-to-r from-[#FF6B35] via-[#FF7B50] to-[#FF4D8C] text-white ' +
            'rounded-full text-lg font-bold shadow-glow tracking-wider" ' +
            'style="animation:btnBreathe 2.5s ease-in-out infinite">' +
            '<span class="text-2xl btn-locate-icon">🎲</span>' +
            '<span>开始随机探索</span>' +
          '</button>' +

          // ✨ 副提示 — 弱化延迟淡入
          '<p class="mt-4 text-sm text-[#B0A098]" id="welcomeHint" style="opacity:0;animation:hintFadeIn 0.8s ease-out 0.7s forwards">' +
            '✨ 今天可能遇到你的新最爱' +
          '</p>' +

          // 地图选点 — 弱化为文字链接
          '<button id="btnOpenMap" ' +
            'class="btn-locate mt-6 text-xs text-[#B0A098] bg-transparent border-none cursor-pointer underline underline-offset-4 decoration-[#D0C8C0] hover:text-[#8C7A6E] transition-colors">' +
            '在地图上选位置' +
          '</button>' +

        '</div>' +
      '</div>';

    // ── Motion One 标题入场 ──
    if (window.Motion) {
      try {
        var m = window.Motion;
        setTimeout(function() {
          var title = document.getElementById('welcomeTitle');
          if (title) m.animate(title, { opacity: [0, 1], transform: ['translateY(-8px)', 'translateY(0)'] }, { duration: 0.6, easing: 'ease-out' });
        }, 80);
      } catch (_) {}
    }
  }

  // ==================== 列表页组件 ====================

  function renderLocationBar(userLocation, isManual, addressText) {
    var addr = userLocation
      ? userLocation.lat.toFixed(4) + ', ' + userLocation.lng.toFixed(4)
      : '';
    var statusIcon = isManual ? '🗺️' : '📍';
    var statusText = isManual
      ? '手动选址 · 搜索范围 5km'
      : '已定位 · 搜索范围 5km';

    return '' +
      '<div class="glass rounded-2xl mx-3 mt-3 px-4 py-2.5 flex items-center justify-between gap-2 text-xs">' +
        '<div class="flex items-center gap-1.5 flex-wrap min-w-0">' +
          '<span class="text-base flex-shrink-0">' + statusIcon + '</span>' +
          '<span class="text-[#6E6E73]">' + statusText + '</span>' +
          (addressText ? '<span class="location-address text-[#6E6E73]">' + addressText + '</span>' : '') +
          '<span class="text-[#AEAEB2] font-mono text-[11px]">' + addr + '</span>' +
        '</div>' +
        '<button id="btnRelocate" class="btn-relocate flex-shrink-0 px-3 py-1.5 bg-transparent border border-primary/30 rounded-2xl text-[11px] text-primary font-semibold cursor-pointer">📍 换位置</button>' +
      '</div>';
  }

  function renderSortTabs(currentSort) {
    var tabs = [
      { key: 'composite', label: '🏆 综合排序' },
      { key: 'rating',    label: '⭐ 评分优先' },
      { key: 'distance',  label: '📏 距离最近' },
    ];

    return '' +
      '<div class="px-3 py-3 flex gap-2 sticky top-0 z-10">' +
        tabs.map(function (t) {
          var isActive = t.key === currentSort;
          return '<button class="sort-tab flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold cursor-pointer transition-all ' +
            (isActive
              ? 'bg-gradient-to-br from-primary to-[#FF8C5A] text-white shadow-glow border-none'
              : 'glass text-[#6E6E73] border border-white/60') +
            '" data-sort="' + t.key + '">' + t.label + '</button>';
        }).join('') +
      '</div>';
  }

  function renderSummary(shops) {
    var total = shops.length;
    var ratedShops = shops.filter(function (s) { return s.rating !== null && s.rating > 0; });
    var avgRating = ratedShops.length > 0
      ? (ratedShops.reduce(function (sum, s) { return sum + s.rating; }, 0) / ratedShops.length).toFixed(1)
      : '暂无';
    return '' +
      '<div class="px-4 py-2.5 text-xs text-[#6E6E73]">' +
        '附近 <strong class="text-primary font-semibold">' + total + '</strong> 家 · 有评分 <strong class="text-primary font-semibold">' + ratedShops.length + '</strong> 家 · 均分 <strong class="text-accent font-semibold">⭐' + avgRating + '</strong>' +
      '</div>';
  }

  function fmtVal(val, prefix, suffix) {
    prefix = prefix || '';
    suffix = suffix || '';
    if (val === null || val === undefined || val === '') return prefix + '无' + suffix;
    return prefix + val + suffix;
  }

  function renderShopCard(shop) {
    var distStr = LocationModule.formatDistance(shop.distance);

    var ratingHtml;
    if (shop.rating !== null && shop.rating > 0) {
      ratingHtml = renderStars(shop.rating, 'small') + '<span class="text-accent font-bold text-sm ml-1">' + shop.rating + '</span>';
    } else {
      ratingHtml = '<span class="text-[#AEAEB2] text-xs">暂无评分</span>';
    }

    var priceHtml = shop.avgPrice !== null && shop.avgPrice > 0
      ? '💰 ¥' + shop.avgPrice + '/人'
      : '💰 人均暂无';

    var manualBadge = shop.isManual
      ? '<span class="shop-manual-badge">⭐收藏</span>'
      : '';

    var tagsHtml = '';
    if (shop.tags && shop.tags.length > 0) {
      tagsHtml = '<div class="flex gap-1.5 mb-2 flex-wrap">' +
        shop.tags.map(function (t) { return '<span class="shop-tag inline-block text-[11px] px-2 py-0.5 rounded-md bg-primary-light text-primary font-medium">' + t + '</span>'; }).join('') +
        '</div>';
    }

    var catBadge = shop.category
      ? '<span class="text-[11px] px-2 py-0.5 rounded-md bg-black/4 text-[#6E6E73] font-medium">' + shop.category + '</span>'
      : '';

    return '' +
      '<div class="shop-card' + (shop.isManual ? ' shop-card-manual' : '') + ' glass rounded-3xl mx-3 mb-2.5 px-4 py-3.5 cursor-pointer shadow-soft" data-shop-id="' + shop.id + '">' +
        '<div class="flex items-start gap-3">' +
          /* 排名 */ '<div class="flex-shrink-0 w-9 text-center pt-1">' + getRankBadge(shop.rank) + '</div>' +
          /* 信息 */ '<div class="flex-1 min-w-0">' +
            '<h3 class="text-base font-bold text-[#1C1C1E] mb-1.5 truncate">' + shop.name + ' ' + manualBadge + '</h3>' +
            '<div class="flex items-center gap-2 text-[13px] flex-wrap">' + ratingHtml + catBadge + '</div>' +
          '</div>' +
          /* 箭头 */ '<div class="text-2xl text-[#C7C7CC] pt-1 flex-shrink-0">›</div>' +
        '</div>' +
        '<div class="mt-2.5 pt-2.5 border-t border-dashed border-black/5">' +
          tagsHtml +
          '<div class="flex items-center gap-3 text-xs text-[#6E6E73] flex-wrap">' +
            '<span>📍 ' + distStr + '</span>' +
            '<span>' + priceHtml + '</span>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function renderRandomButton() {
    return '' +
      '<div class="text-center px-4 pt-3 pb-1">' +
        '<button id="btnRandomPick" class="inline-flex items-center gap-2 px-7 py-3 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none rounded-full text-base font-bold cursor-pointer tracking-wider" style="animation: randomPulse 2s ease-in-out infinite">' +
          '<span class="text-xl">🎲</span>' +
          '<span>摇一摇 / 随机推荐</span>' +
        '</button>' +
        '<span class="block text-center text-[11px] text-[#AEAEB2] mt-1.5">📱 摇一摇手机也能触发</span>' +
      '</div>';
  }

  function renderAddShopButton() {
    return '' +
      '<div class="text-center px-4 pb-6 pt-2">' +
        '<button id="btnAddShop" class="inline-flex items-center gap-1.5 px-6 py-2.5 glass rounded-full text-sm text-primary font-semibold cursor-pointer border-2 border-dashed border-primary/30 hover:bg-primary-light/50 transition-all active:scale-95">' +
          '➕ 手动添加一家店铺' +
        '</button>' +
      '</div>';
  }

  function renderLoadingState(userLocation, isManual) {
    var locIcon = isManual ? '🗺️' : '📍';
    var locText = isManual ? '手动选址 · 搜索范围 5km' : '已定位 · 搜索范围 5km';
    appEl.innerHTML =
      '<div class="page min-h-screen">' +
        /* Header */ '<div class="bg-gradient-to-br from-primary to-[#FF8C5A] text-white text-center px-5 py-7">' +
          '<h1 class="text-[26px] font-extrabold tracking-wide">🍜 今天吃什么</h1>' +
          '<p class="text-[13px] opacity-80 mt-1">正在搜索周边店铺…</p>' +
        '</div>' +
        /* Location bar */ '<div class="glass mx-3 mt-3 rounded-2xl px-4 py-2.5 flex items-center gap-2 text-xs">' +
          '<span class="text-base">' + locIcon + '</span>' +
          '<span class="text-[#6E6E73]">' + locText + '</span>' +
        '</div>' +
        /* Spinner */ '<div class="flex flex-col items-center justify-center py-16 text-center">' +
          '<div class="w-11 h-11 border-4 border-black/5 border-t-primary rounded-full mb-4" style="animation: spinnerRotate 0.8s linear infinite"></div>' +
          '<p class="text-sm text-[#6E6E73]" style="animation: shimmerPulse 1.5s ease-in-out infinite">🔍 正在拉取周边 5km 全部餐饮店铺…</p>' +
        '</div>' +
      '</div>';
  }

  function renderDataSourceInfo(poiCount, manualCount) {
    var parts = [];
    if (poiCount > 0) parts.push('<span class="inline-block text-[11px] px-2.5 py-0.5 rounded-full bg-[#E3F2FD] text-[#1565C0] font-medium">📡 高德 ' + poiCount + ' 家</span>');
    if (manualCount > 0) parts.push('<span class="inline-block text-[11px] px-2.5 py-0.5 rounded-full bg-[#FFF8E1] text-[#E65100] font-medium">⭐ 收藏 ' + manualCount + ' 家</span>');
    if (!parts.length) return '';
    return '<div class="flex gap-2 px-4 py-1.5 flex-wrap">' + parts.join(' ') + '</div>';
  }

  // ==================== 列表页主体 ====================

  function renderShopList(shops, userLocation, hasError, currentSort, isManual, addressText, poiCount, manualCount) {
    var locBar = renderLocationBar(userLocation, isManual, addressText);
    var sortTabs = renderSortTabs(currentSort);
    var summary = renderSummary(shops);
    var cards = shops.map(renderShopCard).join('');
    var randomBtn = renderRandomButton();
    var addBtn = renderAddShopButton();
    var dsInfo = renderDataSourceInfo(poiCount || 0, manualCount || 0);

    appEl.innerHTML =
      '<div class="page page-list min-h-screen pb-4">' +
        /* Header */ '<header class="bg-gradient-to-br from-primary to-[#FF8C5A] text-white text-center px-5 pt-7 pb-6">' +
          '<h1 class="text-[26px] font-extrabold tracking-wide">🍜 今天吃什么</h1>' +
          '<p class="text-[13px] opacity-80 mt-1">从此告别选择困难症</p>' +
        '</header>' +
        locBar +
        dsInfo +
        sortTabs +
        randomBtn +
        '<div class="mt-2">' +
          summary +
          '<div class="flex flex-col gap-2.5 pb-2">' + cards + '</div>' +
          (shops.length === 0 ? '<div class="text-center py-16 text-base text-[#AEAEB2]">😢 5公里范围内暂无店铺<br><small>试试移动地图位置，或者手动添加一家</small></div>' : '') +
        '</div>' +
        addBtn +
        '<p class="data-source-note">数据来源于高德地图</p>' +
      '</div>';

    // 卡片错落入场动画
    setTimeout(function () { animateCardEntrance(); }, 50);
  }

  // ==================== 详情页 ====================

  function renderPosKeywords(keywords) {
    if (!keywords || !keywords.length) return '';
    return '' +
      '<div class="glass rounded-3xl p-4 mt-2.5">' +
        '<h4 class="text-[15px] font-bold mb-2.5">👍 好评关键词</h4>' +
        '<div class="flex flex-wrap gap-2">' +
          keywords.map(function (k) { return '<span class="px-3 py-1.5 rounded-full text-[13px] font-medium bg-[#E8F8EF] text-positive border border-positive/20 active:scale-95 transition-transform">' + k + '</span>'; }).join('') +
        '</div>' +
      '</div>';
  }

  function renderNegKeywords(keywords) {
    if (!keywords || !keywords.length) return '';
    return '' +
      '<div class="glass rounded-3xl p-4 mt-2.5">' +
        '<h4 class="text-[15px] font-bold mb-2.5">👎 差评关键词</h4>' +
        '<div class="flex flex-wrap gap-2">' +
          keywords.map(function (k) { return '<span class="px-3 py-1.5 rounded-full text-[13px] font-medium bg-[#FDECEC] text-negative border border-negative/20 active:scale-95 transition-transform">' + k + '</span>'; }).join('') +
        '</div>' +
      '</div>';
  }

  function collectReviewImages(reviews) {
    var images = [];
    reviews.forEach(function (review) {
      review.images.forEach(function (img) {
        images.push({ url: img, userName: review.userName, content: review.content });
      });
    });
    return images;
  }

  function renderReviewImages(images) {
    if (!images.length) return '';
    var displayImages = images.slice(0, 9);
    return '' +
      '<div class="glass rounded-3xl p-4 mt-2.5">' +
        '<h4 class="text-[15px] font-bold mb-3">📸 评论区菜品实拍（' + images.length + '张）</h4>' +
        '<div class="grid grid-cols-3 gap-1.5">' +
          displayImages.map(function (img, i) {
            return '<div class="aspect-square rounded-xl overflow-hidden cursor-pointer bg-black/5 relative" data-index="' + i + '">' +
              '<img src="' + img.url + '" alt="菜品实拍" loading="lazy" class="w-full h-full object-cover transition-transform duration-300 active:scale-105" />' +
              '<div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-1.5 text-[10px] text-white opacity-0 hover:opacity-100 transition-opacity">@' + img.userName + '</div>' +
            '</div>';
          }).join('') +
          (images.length > 9 ? '<div class="aspect-square rounded-xl flex items-center justify-center bg-black/5 text-sm font-bold text-[#6E6E73]">+' + (images.length - 9) + '张</div>' : '') +
        '</div>' +
      '</div>';
  }

  function renderReviews(reviews) {
    return '' +
      '<div class="glass rounded-3xl p-4 mt-2.5">' +
        '<h4 class="text-[15px] font-bold mb-3">💬 用户评论（' + reviews.length + '条）</h4>' +
        '<div class="flex flex-col gap-3.5">' +
          reviews.map(function (r) {
            return '<div class="pb-3.5 border-b border-black/5 last:border-b-0 last:pb-0">' +
              '<div class="flex justify-between items-start mb-2">' +
                '<div class="flex items-center gap-2.5">' +
                  '<div class="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-[#FF8C5A] text-white flex items-center justify-center text-sm font-bold flex-shrink-0">' + r.avatar + '</div>' +
                  '<div>' +
                    '<div class="text-sm font-semibold">' + r.userName + '</div>' +
                    '<div class="text-[11px] text-[#AEAEB2]">' + r.date + '</div>' +
                  '</div>' +
                '</div>' +
                '<div class="text-xs">' + renderStars(r.rating, 'small') + '</div>' +
              '</div>' +
              '<p class="text-sm leading-relaxed text-[#1C1C1E] mb-2">' + r.content + '</p>' +
              (r.images.length
                ? '<div class="flex gap-1.5 overflow-x-auto">' +
                    r.images.map(function (img) {
                      return '<img src="' + img + '" alt="配图" loading="lazy" class="w-20 h-20 rounded-lg object-cover cursor-pointer flex-shrink-0" />';
                    }).join('') +
                  '</div>'
                : '') +
            '</div>';
          }).join('') +
        '</div>' +
      '</div>';
  }

  function renderShopDetail(shop) {
    var distStr = LocationModule.formatDistance(shop.distance);

    var ratingHtml;
    if (shop.rating !== null && shop.rating > 0) {
      ratingHtml = renderStars(shop.rating, 'large') + '<span class="text-[22px] font-extrabold text-accent ml-1">' + shop.rating + '</span>';
    } else {
      ratingHtml = '<span class="text-[#AEAEB2] text-sm">暂无评分</span>';
    }

    var infoItems = '';
    infoItems += '<div class="glass rounded-2xl px-4 py-2.5 text-[13px] text-[#6E6E73]">📍 ' + distStr + '</div>';
    if (shop.avgPrice !== null && shop.avgPrice > 0) {
      infoItems += '<div class="glass rounded-2xl px-4 py-2.5 text-[13px] text-[#6E6E73]">💰 ¥' + shop.avgPrice + '/人</div>';
    } else {
      infoItems += '<div class="glass rounded-2xl px-4 py-2.5 text-[13px] text-[#6E6E73]">💰 人均暂无</div>';
    }
    if (shop.address) {
      infoItems += '<div class="glass rounded-2xl px-4 py-2.5 text-[13px] text-[#6E6E73] col-span-2">🏠 ' + shop.address + '</div>';
    }

    var tagsHtml = '';
    if (shop.tags && shop.tags.length > 0) {
      tagsHtml = '<div class="flex gap-1.5 mb-3 flex-wrap">' +
        shop.tags.map(function (t) { return '<span class="shop-tag inline-block text-[11px] px-2 py-0.5 rounded-md bg-primary-light text-primary font-medium">' + t + '</span>'; }).join('') +
        '</div>';
    }

    var photosHtml = '';
    if (shop.realPhotos && shop.realPhotos.length > 0) {
      photosHtml =
        '<div class="detail-section">' +
          '<h3 class="detail-section-title">📷 店铺实拍（' + shop.realPhotos.length + '张）</h3>' +
          '<div class="detail-photo-grid">' +
            shop.realPhotos.map(function (url, i) {
              return '<div class="detail-photo-item" data-photo-index="' + i + '"><img src="' + url + '" alt="店铺实拍" loading="lazy"></div>';
            }).join('') +
          '</div>' +
        '</div>';
    } else {
      photosHtml = '<div class="glass rounded-3xl p-4 mt-2.5 text-center"><p class="text-sm text-[#AEAEB2] py-6">暂无店铺实拍照片</p></div>';
    }

    appEl.innerHTML =
      '<div class="page page-detail min-h-screen pb-20">' +
        /* 导航 */ '<div class="glass-strong sticky top-0 z-10 px-4 py-3 flex items-center justify-between border-b border-black/5">' +
          '<button id="btnBack" class="bg-transparent border-none text-base text-primary font-semibold cursor-pointer px-2 py-1">← 返回</button>' +
          '<span class="text-[15px] font-bold text-[#1C1C1E]">店铺详情</span>' +
          '<span class="w-[50px]"></span>' +
        '</div>' +
        /* 店名头 */ '<div class="glass rounded-3xl mx-3 mt-3 p-5">' +
          '<h2 class="text-[22px] font-extrabold text-[#1C1C1E] mb-2">' + shop.name + '</h2>' +
          '<div class="flex items-center gap-2 mb-2">' + ratingHtml + '</div>' +
          tagsHtml +
          '<div class="grid grid-cols-2 gap-2.5">' + infoItems + '</div>' +
        '</div>' +
        /* 内容 */ '<div class="px-3">' +
          photosHtml +
          '<div class="text-center pt-3 pb-6">' +
            '<p class="text-xs text-[#AEAEB2]">数据来源于高德地图</p>' +
          '</div>' +
        '</div>' +
      '</div>';

    // 绑定实拍照片点击查看大图
    setTimeout(function () {
      var photoItems = document.querySelectorAll('.detail-photo-item');
      if (photoItems.length > 0) {
        var photoUrls = shop.realPhotos.map(function (url) { return { url: url, userName: '', content: '' }; });
        photoItems.forEach(function (item) {
          item.addEventListener('click', function () {
            var idx = parseInt(item.dataset.photoIndex);
            renderImageViewer(photoUrls, idx);
          });
        });
      }
    }, 0);
  }

  // ==================== 随机推荐弹窗 ====================

  function renderRandomPicker() {
    var el = document.createElement('div');
    el.className = 'random-overlay';
    el.id = 'randomOverlay';
    el.innerHTML =
      '<div class="random-backdrop"></div>' +
      '<div class="random-card">' +
        '<div class="random-emoji" style="animation: diceFloat 0.8s ease-in-out infinite">🎲</div>' +
        '<div class="random-title">✨ destiny is choosing…</div>' +
        '<div class="random-slot" id="randomSlot"></div>' +
        '<div class="random-result" id="randomResult" style="display:none">' +
          '<div class="random-result-name" id="randomResultName"></div>' +
          '<div class="random-result-meta" id="randomResultMeta"></div>' +
          '<div class="random-result-tags" id="randomResultTags"></div>' +
        '</div>' +
        '<div class="random-actions" id="randomActions" style="display:none">' +
          '<button class="random-btn random-btn-retry" id="btnRandomRetry">🔄 换一个</button>' +
          '<button class="random-btn random-btn-go" id="btnRandomGo">👉 就这家！</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(el);

    // 弹性入场
    setTimeout(function () { animateModalIn('.random-card'); }, 30);

    return el;
  }

  function closeRandomPicker() {
    var el = document.getElementById('randomOverlay');
    if (el) el.remove();
  }

  // ==================== 手动添加店铺表单 ====================

  function renderAddShopForm(defaultLocation, categories) {
    var el = document.createElement('div');
    el.className = 'add-shop-overlay';
    el.id = 'addShopOverlay';

    var catOptions = (categories || DataModule.CATEGORY_OPTIONS).map(function (c) {
      return '<option value="' + c + '">' + c + '</option>';
    }).join('');

    el.innerHTML =
      '<div class="add-shop-backdrop"></div>' +
      '<div class="add-shop-card" style="animation: slideUp 0.35s cubic-bezier(0.32, 0.72, 0, 1)">' +
        '<div class="add-shop-header">' +
          '<h3>➕ 添加收藏店铺</h3>' +
          '<button class="add-shop-close" id="btnAddShopClose">✕</button>' +
        '</div>' +
        '<div class="add-shop-body">' +
          '<div class="add-shop-field">' +
            '<label>店铺名称 <span class="required">*</span></label>' +
            '<input type="text" id="addShopName" placeholder="例如：老张黄焖鸡米饭" maxlength="30" />' +
          '</div>' +
          '<div class="add-shop-field">' +
            '<label>分类</label>' +
            '<select id="addShopCategory">' + catOptions + '</select>' +
          '</div>' +
          '<div class="add-shop-row">' +
            '<div class="add-shop-field add-shop-half">' +
              '<label>评分</label>' +
              '<select id="addShopRating">' +
                '<option value="5.0">⭐ 5.0</option>' +
                '<option value="4.5">⭐ 4.5</option>' +
                '<option value="4.0" selected>⭐ 4.0</option>' +
                '<option value="3.5">⭐ 3.5</option>' +
                '<option value="3.0">⭐ 3.0</option>' +
              '</select>' +
            '</div>' +
            '<div class="add-shop-field add-shop-half">' +
              '<label>人均价格（元）</label>' +
              '<input type="number" id="addShopPrice" placeholder="25" min="1" max="500" value="25" />' +
            '</div>' +
          '</div>' +
          '<div class="add-shop-field">' +
            '<label>标签（逗号分隔）</label>' +
            '<input type="text" id="addShopTags" placeholder="好吃, 分量足, 推荐" maxlength="60" />' +
          '</div>' +
          '<div class="add-shop-field">' +
            '<label>地址描述（可选）</label>' +
            '<input type="text" id="addShopAddress" placeholder="例如：小区门口左转50米" maxlength="80" />' +
          '</div>' +
          '<p class="add-shop-hint">📍 位置将设为当前地图中心点</p>' +
        '</div>' +
        '<div class="add-shop-footer">' +
          '<button class="add-shop-btn-cancel" id="btnAddShopCancel">取消</button>' +
          '<button class="add-shop-btn-save" id="btnAddShopSave">💾 保存</button>' +
        '</div>' +
      '</div>';
    document.body.appendChild(el);

    // 关闭按钮
    el.querySelector('#btnAddShopClose')?.addEventListener('click', closeAddShopForm);
    el.querySelector('#btnAddShopCancel')?.addEventListener('click', closeAddShopForm);
    el.querySelector('.add-shop-backdrop')?.addEventListener('click', closeAddShopForm);

    return el;
  }

  function closeAddShopForm() {
    var el = document.getElementById('addShopOverlay');
    if (el) el.remove();
  }

  // ==================== 图片查看器 ====================

  function renderImageViewer(images, currentIndex) {
    var el = document.createElement('div');
    el.className = 'image-viewer';
    el.innerHTML =
      '<div class="viewer-backdrop"></div>' +
      '<div class="viewer-content">' +
        '<button class="viewer-close">✕</button>' +
        '<img src="' + images[currentIndex].url + '" alt="菜品大图" />' +
        '<div class="viewer-caption">@' + images[currentIndex].userName + '：' + images[currentIndex].content.substring(0, 30) + '…</div>' +
      '</div>' +
      '<button class="viewer-nav prev">‹</button>' +
      '<button class="viewer-nav next">›</button>';

    el.querySelector('.viewer-backdrop').addEventListener('click', function () { el.remove(); });
    el.querySelector('.viewer-close').addEventListener('click', function () { el.remove(); });

    el.querySelector('.viewer-nav.prev').addEventListener('click', function (e) {
      e.stopPropagation();
      var newIdx = (currentIndex - 1 + images.length) % images.length;
      el.remove();
      renderImageViewer(images, newIdx);
    });

    el.querySelector('.viewer-nav.next').addEventListener('click', function (e) {
      e.stopPropagation();
      var newIdx = (currentIndex + 1) % images.length;
      el.remove();
      renderImageViewer(images, newIdx);
    });

    document.body.appendChild(el);
  }

  // ==================== 导出 ====================

  return {
    renderWelcomeScreen: renderWelcomeScreen,
    renderShopList: renderShopList,
    renderLoadingState: renderLoadingState,
    renderShopDetail: renderShopDetail,
    renderImageViewer: renderImageViewer,
    renderRandomPicker: renderRandomPicker,
    closeRandomPicker: closeRandomPicker,
    renderAddShopForm: renderAddShopForm,
    closeAddShopForm: closeAddShopForm,
    renderDataSourceInfo: renderDataSourceInfo,
  };
})();
