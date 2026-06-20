/**
 * 地图选点模块（滴滴打车风格）
 * - 全屏地图，中心固定图钉
 * - 拖动地图选位置，图钉不动
 * - 实时反向地理编码显示地址
 * - 搜索地址跳转
 * - 确认位置回调
 */

const MapPicker = (() => {
  let map = null;
  let centerMarker = null;   // Leaflet 圆形标记（地图中心）
  let onConfirm = null;      // 确认回调
  let debounceTimer = null;

  const DEFAULT_CENTER = [39.9836, 116.3059]; // 北京中关村
  const DEFAULT_ZOOM = 15;

  /**
   * 打开地图选点界面
   * @param {Function} confirmCallback - 确认位置时的回调，参数 {lat, lng, address}
   */
  function open(confirmCallback) {
    onConfirm = confirmCallback;
    renderMapUI();
    initMap();
  }

  /**
   * 渲染地图选点界面的 HTML
   */
  function renderMapUI() {
    const appEl = document.getElementById('app');
    appEl.innerHTML = `
      <div class="map-picker-container">
        <!-- 顶部栏 -->
        <div class="map-top-bar">
          <button class="map-btn-back" id="mapBtnBack">← 返回</button>
          <div class="map-search-box">
            <input type="text" id="mapSearchInput" placeholder="搜索地址…" class="map-search-input" />
            <button class="map-search-clear" id="mapSearchClear" style="display:none">✕</button>
          </div>
        </div>

        <!-- 搜索结果列表 -->
        <div class="map-search-results" id="mapSearchResults" style="display:none"></div>

        <!-- 地图容器 -->
        <div class="map-wrapper" id="mapWrapper">
          <div id="mapContainer" class="map-container"></div>
          <!-- 中心图钉（CSS固定，不随地图移动） -->
          <div class="map-center-pin">
            <div class="pin-body">
              <div class="pin-head"></div>
              <div class="pin-point"></div>
            </div>
            <div class="pin-shadow"></div>
          </div>
        </div>

        <!-- 底部信息栏 -->
        <div class="map-bottom-bar">
          <div class="map-address-display">
            <div class="map-address-label">送餐地址</div>
            <div class="map-address-text" id="mapAddressText">正在获取地址…</div>
          </div>
          <button class="map-btn-confirm" id="mapBtnConfirm">
            确认此位置 ✓
          </button>
        </div>
      </div>
    `;
  }

  /**
   * 初始化 Leaflet 地图
   */
  function initMap() {
    // 销毁旧地图
    if (map) {
      map.remove();
      map = null;
    }

    const mapContainer = document.getElementById('mapContainer');

    map = L.map(mapContainer, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,      // 隐藏缩放控件，用双指缩放
      attributionControl: false,
    });

    // OpenStreetMap 瓦片
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(map);

    // 缩放控件放在右下角
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // 监听地图移动 → 更新中心地址
    map.on('moveend', updateCenterAddress);

    // 首次加载时更新地址
    updateCenterAddress();

    // 绑定事件
    bindMapEvents();
  }

  /**
   * 获取地图中心坐标
   */
  function getCenter() {
    const center = map.getCenter();
    return { lat: center.lat, lng: center.lng };
  }

  /**
   * 更新底部地址显示（防抖）
   */
  function updateCenterAddress() {
    const center = getCenter();

    // 防抖：300ms 内不再触发
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(async () => {
      const addressText = document.getElementById('mapAddressText');
      if (addressText) {
        addressText.textContent = '正在获取地址…';
      }
      const address = await LocationModule.reverseGeocode(center.lat, center.lng);
      if (addressText) {
        addressText.textContent = address;
      }
    }, 300);
  }

  /**
   * 绑定地图界面事件
   */
  function bindMapEvents() {
    // 返回按钮
    document.getElementById('mapBtnBack')?.addEventListener('click', close);

    // 确认按钮
    document.getElementById('mapBtnConfirm')?.addEventListener('click', () => {
      const center = getCenter();
      const addrText = document.getElementById('mapAddressText')?.textContent || '';
      if (onConfirm) {
        onConfirm({ lat: center.lat, lng: center.lng, address: addrText });
      }
    });

    // 搜索框
    const searchInput = document.getElementById('mapSearchInput');
    const searchClear = document.getElementById('mapSearchClear');
    const searchResults = document.getElementById('mapSearchResults');

    searchInput?.addEventListener('input', async (e) => {
      const query = e.target.value.trim();
      searchClear.style.display = query ? 'block' : 'none';

      if (query.length < 2) {
        searchResults.style.display = 'none';
        return;
      }

      // 防抖搜索
      if (searchInput._debounceTimer) clearTimeout(searchInput._debounceTimer);
      searchInput._debounceTimer = setTimeout(async () => {
        const results = await LocationModule.geocode(query);
        if (results.length > 0) {
          searchResults.innerHTML = results
            .map(
              (r, i) => `
            <div class="map-search-item" data-lat="${r.lat}" data-lng="${r.lng}" data-idx="${i}">
              <span class="search-item-icon">📍</span>
              <span class="search-item-name">${r.name}</span>
            </div>`
            )
            .join('');
          searchResults.style.display = 'block';
        } else {
          searchResults.innerHTML =
            '<div class="map-search-empty">未找到相关地址</div>';
          searchResults.style.display = 'block';
        }
      }, 400);
    });

    // 按 Enter 键 → 跳转到第一个搜索结果
    searchInput?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const firstResult = searchResults?.querySelector('.map-search-item');
        if (firstResult) {
          const lat = parseFloat(firstResult.dataset.lat);
          const lng = parseFloat(firstResult.dataset.lng);
          map.setView([lat, lng], 17, { animate: true });
          searchResults.style.display = 'none';
          searchInput.value = '';
          searchClear.style.display = 'none';
        }
      }
    });

    // 清除搜索
    searchClear?.addEventListener('click', () => {
      searchInput.value = '';
      searchClear.style.display = 'none';
      searchResults.style.display = 'none';
    });

    // 搜索框获得焦点时显示已有结果
    searchInput?.addEventListener('focus', () => {
      if (searchInput.value.trim().length >= 2) {
        searchResults.style.display = 'block';
      }
    });

    // 点击搜索结果 → 跳转地图
    searchResults?.addEventListener('click', (e) => {
      const item = e.target.closest('.map-search-item');
      if (!item) return;
      const lat = parseFloat(item.dataset.lat);
      const lng = parseFloat(item.dataset.lng);
      map.setView([lat, lng], 17, { animate: true });
      searchResults.style.display = 'none';
      searchInput.value = '';
      searchClear.style.display = 'none';
    });

    // 点击地图外部关闭搜索
    document.getElementById('mapWrapper')?.addEventListener('click', () => {
      searchResults.style.display = 'none';
    });
  }

  /**
   * 关闭地图选点界面
   */
  function close() {
    if (map) {
      map.remove();
      map = null;
    }
    onConfirm = null;
    // 返回欢迎页
    RenderModule.renderWelcomeScreen();
    App.bindWelcomeEvents();
  }

  return { open, close };
})();
