/**
 * 界面渲染模块
 * - 店铺列表渲染
 * - 店铺详情页渲染
 * - 关键词标签云
 * - 评论实图网格
 */

const RenderModule = (() => {

  const appEl = document.getElementById('app');

  // ==================== 工具栏 ====================

  /** 渲染星星评分 */
  function renderStars(rating, size = 'small') {
    const full = Math.floor(rating);
    const half = rating - full >= 0.5 ? 1 : 0;
    const empty = 5 - full - half;
    let html = '<span class="stars">';
    for (let i = 0; i < full; i++) html += `<i class="star full">★</i>`;
    if (half) html += `<i class="star half">☆</i>`;
    for (let i = 0; i < empty; i++) html += `<i class="star empty">☆</i>`;
    html += `</span>`;
    return html;
  }

  /** 生成排名徽章 */
  function getRankBadge(rank) {
    if (rank === 1) return '<span class="rank-badge gold">🥇</span>';
    if (rank === 2) return '<span class="rank-badge silver">🥈</span>';
    if (rank === 3) return '<span class="rank-badge bronze">🥉</span>';
    return `<span class="rank-badge normal">${rank}</span>`;
  }

  // ==================== 列表页 ====================

  /** 渲染欢迎页（未定位时显示） */
  function renderWelcomeScreen() {
    appEl.innerHTML = `
      <div class="page page-welcome">
        <div class="welcome-content">
          <div class="welcome-icon">🍜</div>
          <h1 class="welcome-title">今天吃什么</h1>
          <p class="welcome-desc">选择送餐地址，<br>从此告别选择困难症</p>
          <div class="welcome-buttons">
            <button class="btn-locate btn-gps" id="btnStartLocate">
              <span class="btn-locate-icon">📍</span>
              <span>使用我的位置</span>
            </button>
            <button class="btn-locate btn-map" id="btnOpenMap">
              <span class="btn-locate-icon">🗺️</span>
              <span>在地图上选位置</span>
            </button>
          </div>
          <p class="welcome-hint">搜索范围：5公里</p>
        </div>
      </div>
    `;
  }

  /** 渲染定位状态栏 */
  function renderLocationBar(userLocation, isManual, addressText) {
    const addr = userLocation
      ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}`
      : '';
    const statusIcon = isManual ? '🗺️' : '📍';
    const statusText = isManual
      ? '手动选址 · 搜索范围 5km'
      : '已定位 · 搜索范围 5km';

    return `
      <div class="location-bar">
        <div class="location-info">
          <span class="location-icon">${statusIcon}</span>
          <span class="location-text">${statusText}</span>
          ${addressText ? `<span class="location-address">${addressText}</span>` : ''}
          <span class="location-coords">${addr}</span>
        </div>
        <button class="btn-relocate" id="btnRelocate" title="重新选择位置">📍 换位置</button>
      </div>
    `;
  }

  /** 渲染排序标签栏 */
  function renderSortTabs(currentSort) {
    const tabs = [
      { key: 'composite', label: '🏆 综合排序' },
      { key: 'rating', label: '⭐ 评分优先' },
      { key: 'distance', label: '📏 距离最近' },
    ];

    return `
      <div class="sort-tabs">
        ${tabs
          .map(
            (t) => `
          <button class="sort-tab ${t.key === currentSort ? 'active' : ''}"
                  data-sort="${t.key}">
            ${t.label}
          </button>
        `
          )
          .join('')}
      </div>
    `;
  }

  /** 渲染店铺统计摘要 */
  function renderSummary(shops) {
    var total = shops.length;
    var ratedShops = shops.filter(function (s) { return s.rating !== null && s.rating > 0; });
    var avgRating = ratedShops.length > 0
      ? (ratedShops.reduce(function (sum, s) { return sum + s.rating; }, 0) / ratedShops.length).toFixed(1)
      : '暂无';
    return `
      <div class="shop-summary">
        附近 <strong>${total}</strong> 家店铺 · 有评分 <strong>${ratedShops.length}</strong> 家 · 均分 <strong>⭐${avgRating}</strong>
      </div>
    `;
  }

  /** 格式化值：有值显示，无值显示"无" */
  function fmtVal(val, prefix, suffix) {
    prefix = prefix || '';
    suffix = suffix || '';
    if (val === null || val === undefined || val === '') return prefix + '无' + suffix;
    return prefix + val + suffix;
  }

  /** 渲染单张店铺卡片（仅真实数据） */
  function renderShopCard(shop) {
    var distStr = LocationModule.formatDistance(shop.distance);

    // 评分：有真实评分显示星级，没有显示"暂无评分"
    var ratingHtml;
    if (shop.rating !== null && shop.rating > 0) {
      ratingHtml = renderStars(shop.rating, 'small') + '<span class="shop-rating-num">' + shop.rating + '</span>';
    } else {
      ratingHtml = '<span class="shop-rating-num no-data">暂无评分</span>';
    }

    // 人均：有数据展示，无数据显示"无"
    var priceHtml = shop.avgPrice !== null && shop.avgPrice > 0
      ? '💰 ¥' + shop.avgPrice + '/人'
      : '💰 人均暂无';

    // 手动收藏徽章
    var manualBadge = shop.isManual
      ? '<span class="shop-manual-badge" title="手动收藏的店铺">⭐收藏</span>'
      : '';

    // 标签（仅手动店铺有⭐收藏标签）
    var tagsHtml = '';
    if (shop.tags && shop.tags.length > 0) {
      tagsHtml = '<div class="shop-tags">' +
        shop.tags.map(function (t) { return '<span class="shop-tag">' + t + '</span>'; }).join('') +
        '</div>';
    }

    return `
      <div class="shop-card ${shop.isManual ? 'shop-card-manual' : ''}" data-shop-id="${shop.id}">
        <div class="shop-card-header">
          <div class="shop-rank">${getRankBadge(shop.rank)}</div>
          <div class="shop-info">
            <h3 class="shop-name">${shop.name} ${manualBadge}</h3>
            <div class="shop-meta">
              ${ratingHtml}
            </div>
          </div>
          <div class="shop-arrow">›</div>
        </div>
        <div class="shop-card-footer">
          ${tagsHtml}
          <div class="shop-extra">
            <span class="shop-distance">📍 ${distStr}</span>
            <span class="shop-price">${priceHtml}</span>
          </div>
        </div>
      </div>
    `;
  }

  /** 渲染「🎲 随机推荐」按钮 */
  function renderRandomButton() {
    return `
      <div class="btn-random-wrap">
        <button class="btn-random" id="btnRandomPick">
          <span class="btn-random-icon">🎲</span>
          <span>摇一摇 / 随机推荐</span>
        </button>
        <span class="btn-random-shake-hint">📱 摇一摇手机也能触发</span>
      </div>
    `;
  }

  /** 渲染「➕ 手动添加店铺」按钮 */
  function renderAddShopButton() {
    return `
      <div class="btn-add-shop-wrap">
        <button class="btn-add-shop" id="btnAddShop">
          ➕ 手动添加一家店铺
        </button>
      </div>
    `;
  }

  /** 渲染列表加载中状态 */
  function renderLoadingState(userLocation, isManual) {
    var locIcon = isManual ? '🗺️' : '📍';
    var locText = isManual ? '手动选址 · 搜索范围 5km' : '已定位 · 搜索范围 5km';
    return `
      <div class="page page-list">
        <header class="app-header">
          <h1 class="app-title">🍜 今天吃什么</h1>
          <p class="app-subtitle">正在搜索周边店铺…</p>
        </header>
        <div class="location-bar">
          <div class="location-info">
            <span class="location-icon">${locIcon}</span>
            <span class="location-text">${locText}</span>
          </div>
        </div>
        <div class="loading-spinner-wrap">
          <div class="loading-spinner"></div>
          <p class="loading-text">🔍 正在拉取周边 5km 全部餐饮店铺（自动翻页）…</p>
        </div>
      </div>
    `;
  }

  /** 渲染数据来源说明 */
  function renderDataSourceInfo(poiCount, manualCount) {
    var parts = [];
    if (poiCount > 0) parts.push('<span class="ds-badge ds-poi">📡 高德 ' + poiCount + ' 家</span>');
    if (manualCount > 0) parts.push('<span class="ds-badge ds-manual">⭐ 收藏 ' + manualCount + ' 家</span>');
    if (!parts.length) return '';
    return '<div class="data-source-info">' + parts.join(' ') + '</div>';
  }

  /** 渲染完整列表页 */
  function renderShopList(shops, userLocation, hasError, currentSort, isManual, addressText, poiCount, manualCount) {
    var locBar = renderLocationBar(userLocation, isManual, addressText);
    var sortTabs = renderSortTabs(currentSort);
    var summary = renderSummary(shops);
    var cards = shops.map(renderShopCard).join('');
    var randomBtn = renderRandomButton();
    var addBtn = renderAddShopButton();
    var dsInfo = renderDataSourceInfo(poiCount || 0, manualCount || 0);

    appEl.innerHTML = `
      <div class="page page-list">
        <header class="app-header">
          <h1 class="app-title">🍜 今天吃什么</h1>
          <p class="app-subtitle">从此告别选择困难症</p>
        </header>
        ${locBar}
        ${dsInfo}
        ${sortTabs}
        ${randomBtn}
        <div class="shop-list-container">
          ${summary}
          <div class="shop-list">
            ${cards}
          </div>
          ${shops.length === 0 ? '<div class="empty-state">😢 5公里范围内暂无店铺<br><small>试试移动地图位置，或者手动添加一家</small></div>' : ''}
        </div>
        ${addBtn}
      </div>
    `;
  }

  // ==================== 详情页 ====================

  /** 渲染好评关键词 */
  function renderPosKeywords(keywords) {
    if (!keywords || !keywords.length) return '';
    return `
      <div class="keyword-section positive">
        <h4 class="keyword-title">👍 好评关键词</h4>
        <div class="keyword-cloud">
          ${keywords.map((k) => `<span class="keyword-tag positive">${k}</span>`).join('')}
        </div>
      </div>
    `;
  }

  /** 渲染差评关键词 */
  function renderNegKeywords(keywords) {
    if (!keywords || !keywords.length) return '';
    return `
      <div class="keyword-section negative">
        <h4 class="keyword-title">👎 差评关键词</h4>
        <div class="keyword-cloud">
          ${keywords.map((k) => `<span class="keyword-tag negative">${k}</span>`).join('')}
        </div>
      </div>
    `;
  }

  /** 收集所有评论中的图片 */
  function collectReviewImages(reviews) {
    const images = [];
    reviews.forEach((review) => {
      review.images.forEach((img) => {
        images.push({ url: img, userName: review.userName, content: review.content });
      });
    });
    return images;
  }

  /** 渲染评论区实图网格 */
  function renderReviewImages(images) {
    if (!images.length) return '';
    // 最多显示 9 张
    const displayImages = images.slice(0, 9);
    return `
      <div class="review-images-section">
        <h4 class="section-title">📸 评论区菜品实拍（${images.length}张）</h4>
        <div class="images-grid">
          ${displayImages
            .map(
              (img, i) => `
            <div class="image-card" data-index="${i}">
              <img src="${img.url}" alt="菜品实拍" loading="lazy" />
              <div class="image-overlay">
                <span class="image-author">@${img.userName}</span>
              </div>
            </div>
          `
            )
            .join('')}
          ${images.length > 9 ? `<div class="image-card more-images">+${images.length - 9}张</div>` : ''}
        </div>
      </div>
    `;
  }

  /** 渲染评论区 */
  function renderReviews(reviews) {
    return `
      <div class="reviews-section">
        <h4 class="section-title">💬 用户评论（${reviews.length}条）</h4>
        <div class="reviews-list">
          ${reviews
            .map(
              (r) => `
            <div class="review-card">
              <div class="review-header">
                <div class="review-user">
                  <div class="review-avatar">${r.avatar}</div>
                  <div>
                    <div class="review-username">${r.userName}</div>
                    <div class="review-date">${r.date}</div>
                  </div>
                </div>
                <div class="review-rating">${renderStars(r.rating, 'small')}</div>
              </div>
              <p class="review-content">${r.content}</p>
              ${
                r.images.length
                  ? `<div class="review-mini-images">
                      ${r.images
                        .map(
                          (img) =>
                            `<img src="${img}" alt="配图" loading="lazy" class="review-thumb" />`
                        )
                        .join('')}
                    </div>`
                  : ''
              }
            </div>
          `
            )
            .join('')}
        </div>
      </div>
    `;
  }

  /** 渲染完整详情页（仅真实数据） */
  function renderShopDetail(shop) {
    var distStr = LocationModule.formatDistance(shop.distance);

    // 评分
    var ratingHtml;
    if (shop.rating !== null && shop.rating > 0) {
      ratingHtml = renderStars(shop.rating, 'large') + '<span class="detail-rating-num">' + shop.rating + '</span>';
    } else {
      ratingHtml = '<span class="detail-rating-num no-data">暂无评分</span>';
    }

    // 基本信息行（只显示有数据的字段）
    var infoItems = [];
    infoItems.push('<div class="info-item">📍 ' + distStr + '</div>');
    if (shop.avgPrice !== null && shop.avgPrice > 0) {
      infoItems.push('<div class="info-item">💰 ¥' + shop.avgPrice + '/人</div>');
    } else {
      infoItems.push('<div class="info-item">💰 人均暂无</div>');
    }
    if (shop.address) {
      infoItems.push('<div class="info-item">🏠 ' + shop.address + '</div>');
    }

    // 分类标签
    var tagsHtml = '';
    if (shop.tags && shop.tags.length > 0) {
      tagsHtml = '<div class="detail-shop-tags">' +
        shop.tags.map(function (t) { return '<span class="shop-tag">' + t + '</span>'; }).join('') +
        '</div>';
    }

    // 真实店铺照片
    var photosHtml = '';
    if (shop.realPhotos && shop.realPhotos.length > 0) {
      photosHtml = `
        <div class="detail-section">
          <h3 class="detail-section-title">📷 店铺实拍（${shop.realPhotos.length}张）</h3>
          <div class="detail-photo-grid">
            ${shop.realPhotos.map(function (url, i) {
              return '<div class="detail-photo-item" data-photo-index="' + i + '"><img src="' + url + '" alt="店铺实拍" loading="lazy"></div>';
            }).join('')}
          </div>
        </div>
      `;
    } else {
      photosHtml = '<div class="detail-section"><p class="no-data-hint">暂无店铺实拍照片</p></div>';
    }

    appEl.innerHTML = `
      <div class="page page-detail">
        <div class="detail-nav">
          <button class="btn-back" id="btnBack">← 返回</button>
          <span class="detail-nav-title">店铺详情</span>
          <span class="detail-nav-spacer"></span>
        </div>

        <div class="detail-header">
          <h2 class="detail-shop-name">${shop.name}</h2>
          <div class="detail-shop-meta">
            ${ratingHtml}
          </div>
          ${tagsHtml}
          <div class="detail-shop-info">
            ${infoItems.join('')}
          </div>
        </div>

        <div class="detail-body">
          ${photosHtml}

          <div class="detail-section">
            <p class="data-source-note">💡 以上数据来源于高德地图。评论数据暂不可用。</p>
          </div>
        </div>
      </div>
    `;

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

  /** 渲染随机推荐弹窗（老虎机风格），创建 DOM 元素添加到 body */
  function renderRandomPicker() {
    const el = document.createElement('div');
    el.className = 'random-overlay';
    el.id = 'randomOverlay';
    el.innerHTML = `
      <div class="random-backdrop"></div>
      <div class="random-card">
        <div class="random-emoji">🎲</div>
        <div class="random-title"> destiny is choosing…</div>
        <div class="random-slot" id="randomSlot"></div>
        <div class="random-result" id="randomResult" style="display:none">
          <div class="random-result-name" id="randomResultName"></div>
          <div class="random-result-meta" id="randomResultMeta"></div>
          <div class="random-result-tags" id="randomResultTags"></div>
        </div>
        <div class="random-actions" id="randomActions" style="display:none">
          <button class="random-btn random-btn-retry" id="btnRandomRetry">🔄 换一个</button>
          <button class="random-btn random-btn-go" id="btnRandomGo">👉 就这家！</button>
        </div>
      </div>
    `;
    document.body.appendChild(el);
    return el;
  }

  /** 关闭随机推荐弹窗 */
  function closeRandomPicker() {
    const el = document.getElementById('randomOverlay');
    if (el) el.remove();
  }

  // ==================== 手动添加店铺表单 ====================

  /**
   * 渲染添加店铺弹窗表单
   * @param {Object} defaultLocation - {lat, lng} 默认坐标
   * @param {Array} categories - 分类选项列表
   */
  function renderAddShopForm(defaultLocation, categories) {
    var el = document.createElement('div');
    el.className = 'add-shop-overlay';
    el.id = 'addShopOverlay';

    var catOptions = (categories || DataModule.CATEGORY_OPTIONS).map(function (c) {
      return '<option value="' + c + '">' + c + '</option>';
    }).join('');

    el.innerHTML = `
      <div class="add-shop-backdrop"></div>
      <div class="add-shop-card">
        <div class="add-shop-header">
          <h3>➕ 添加收藏店铺</h3>
          <button class="add-shop-close" id="btnAddShopClose">✕</button>
        </div>
        <div class="add-shop-body">
          <div class="add-shop-field">
            <label>店铺名称 <span class="required">*</span></label>
            <input type="text" id="addShopName" placeholder="例如：老张黄焖鸡米饭" maxlength="30" />
          </div>
          <div class="add-shop-field">
            <label>分类</label>
            <select id="addShopCategory">${catOptions}</select>
          </div>
          <div class="add-shop-row">
            <div class="add-shop-field add-shop-half">
              <label>评分</label>
              <select id="addShopRating">
                <option value="5.0">⭐ 5.0</option>
                <option value="4.5">⭐ 4.5</option>
                <option value="4.0" selected>⭐ 4.0</option>
                <option value="3.5">⭐ 3.5</option>
                <option value="3.0">⭐ 3.0</option>
              </select>
            </div>
            <div class="add-shop-field add-shop-half">
              <label>人均价格（元）</label>
              <input type="number" id="addShopPrice" placeholder="25" min="1" max="500" value="25" />
            </div>
          </div>
          <div class="add-shop-field">
            <label>标签（逗号分隔）</label>
            <input type="text" id="addShopTags" placeholder="好吃, 分量足, 推荐" maxlength="60" />
          </div>
          <div class="add-shop-field">
            <label>地址描述（可选）</label>
            <input type="text" id="addShopAddress" placeholder="例如：小区门口左转50米" maxlength="80" />
          </div>
          <p class="add-shop-hint">📍 位置将设为当前地图中心点</p>
        </div>
        <div class="add-shop-footer">
          <button class="add-shop-btn-cancel" id="btnAddShopCancel">取消</button>
          <button class="add-shop-btn-save" id="btnAddShopSave">💾 保存</button>
        </div>
      </div>
    `;
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
    const el = document.createElement('div');
    el.className = 'image-viewer';
    el.innerHTML = `
      <div class="viewer-backdrop"></div>
      <div class="viewer-content">
        <button class="viewer-close">✕</button>
        <img src="${images[currentIndex].url}" alt="菜品大图" />
        <div class="viewer-caption">@${images[currentIndex].userName}：${images[currentIndex].content.substring(0, 30)}…</div>
      </div>
      <button class="viewer-nav prev">‹</button>
      <button class="viewer-nav next">›</button>
    `;

    el.querySelector('.viewer-backdrop').addEventListener('click', () => el.remove());
    el.querySelector('.viewer-close').addEventListener('click', () => el.remove());

    el.querySelector('.viewer-nav.prev').addEventListener('click', (e) => {
      e.stopPropagation();
      const newIdx = (currentIndex - 1 + images.length) % images.length;
      el.remove();
      renderImageViewer(images, newIdx);
    });

    el.querySelector('.viewer-nav.next').addEventListener('click', (e) => {
      e.stopPropagation();
      const newIdx = (currentIndex + 1) % images.length;
      el.remove();
      renderImageViewer(images, newIdx);
    });

    document.body.appendChild(el);
  }

  return {
    renderWelcomeScreen,
    renderShopList,
    renderLoadingState,
    renderShopDetail,
    renderImageViewer,
    renderRandomPicker,
    closeRandomPicker,
    renderAddShopForm,
    closeAddShopForm,
    renderDataSourceInfo,
  };
})();
