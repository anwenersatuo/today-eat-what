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
            <button class="map-search-btn" id="mapSearchBtn">🔍</button>
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

    var mapContainer = document.getElementById('mapContainer');
    if (!mapContainer) {
      console.error('地图容器不存在');
      return;
    }

    map = L.map(mapContainer, {
      center: DEFAULT_CENTER,
      zoom: DEFAULT_ZOOM,
      zoomControl: false,      // 隐藏缩放控件，用双指缩放
      attributionControl: false,
    });

    // 高德地图瓦片（国内无需 VPN，OSM 国内被墙）
    L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
      maxZoom: 18,
      subdomains: ['1', '2', '3', '4'],
    }).addTo(map);

    // 缩放控件放在右下角
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // 监听地图移动 → 更新中心地址
    map.on('moveend', updateCenterAddress);

    // 🔧 移动端修复：延迟 invalidateSize 确保容器已完成布局
    // iOS Safari 有时在 flex 布局中初始化地图时尺寸为 0
    setTimeout(function () {
      if (map) map.invalidateSize();
    }, 200);

    // 首次加载时更新地址（先显示坐标，再异步获取地址文字）
    updateCenterAddressImmediate();

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
   * 获取红蓝图钉当前位置的具体地址
   * 不显示经纬度，只显示文字地址或友好提示
   */
  function updateCenterAddressImmediate() {
    var center = getCenter();
    var addressText = document.getElementById('mapAddressText');
    if (!addressText) return;

    // 先显示加载状态
    addressText.textContent = '正在获取地址…';

    LocationModule.reverseGeocode(center.lat, center.lng).then(function (addr) {
      if (!addressText) return;
      // 如果返回的仍是坐标格式，说明获取失败
      if (addr && /^-?\d+\.\d+,\s*-?\d+\.\d+$/.test(addr.trim())) {
        addressText.textContent = '📍 选中位置（地址获取失败，请移动地图重试）';
        addressText.style.color = '#e74c3c';
      } else if (addr) {
        addressText.textContent = addr;
        addressText.style.color = ''; // 恢复正常颜色
      } else {
        addressText.textContent = '📍 选中位置（地址获取失败）';
        addressText.style.color = '#e74c3c';
      }
    }).catch(function () {
      if (addressText) {
        addressText.textContent = '📍 选中位置（网络异常，请移动地图重试）';
        addressText.style.color = '#e74c3c';
      }
    });
  }

  /**
   * 更新底部地址显示（防抖 300ms）
   */
  function updateCenterAddress() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(function () {
      updateCenterAddressImmediate();
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
    var searchInput = document.getElementById('mapSearchInput');
    var searchClear = document.getElementById('mapSearchClear');
    var searchResults = document.getElementById('mapSearchResults');
    var searchBtn = document.getElementById('mapSearchBtn');

    /**
     * 执行地址搜索（无防抖，立即触发）
     */
    async function performSearch() {
      var query = searchInput.value.trim();
      if (query.length < 2) {
        searchResults.style.display = 'none';
        return;
      }

      // 显示加载状态
      searchResults.innerHTML = '<div class="map-search-empty">🔍 搜索中…</div>';
      searchResults.style.display = 'block';

      var results = await LocationModule.geocode(query);
      if (results.length > 0) {
        searchResults.innerHTML = results
          .map(function (r, i) {
            return '<div class="map-search-item" data-lat="' + r.lat + '" data-lng="' + r.lng + '" data-idx="' + i + '">' +
              '<span class="search-item-icon">📍</span>' +
              '<span class="search-item-name">' + r.name + '</span>' +
            '</div>';
          })
          .join('');
        searchResults.style.display = 'block';
      } else {
        searchResults.innerHTML = '<div class="map-search-empty">未找到相关地址</div>';
        searchResults.style.display = 'block';
      }
    }

    /** 跳转到第一个搜索结果 */
    function jumpToFirstResult() {
      var firstResult = searchResults.querySelector('.map-search-item');
      if (firstResult) {
        var lat = parseFloat(firstResult.dataset.lat);
        var lng = parseFloat(firstResult.dataset.lng);
        map.setView([lat, lng], 17, { animate: true });
        searchResults.style.display = 'none';
        searchInput.value = '';
        searchClear.style.display = 'none';
      }
    }

    // 🔍 搜索按钮点击
    searchBtn?.addEventListener('click', function () {
      performSearch();
    });

    // 输入时自动搜索（防抖）+ 清除按钮显隐
    searchInput?.addEventListener('input', function (e) {
      var query = e.target.value.trim();
      searchClear.style.display = query ? 'block' : 'none';
      searchBtn.style.display = query ? 'none' : '';  // 有内容时隐藏🔍显示✕

      if (query.length < 2) {
        searchResults.style.display = 'none';
        return;
      }

      // 防抖搜索
      if (searchInput._debounceTimer) clearTimeout(searchInput._debounceTimer);
      searchInput._debounceTimer = setTimeout(function () {
        performSearch();
      }, 400);
    });

    // Enter 键：有结果时跳转第一个，没结果时立即搜索
    searchInput?.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (searchResults.style.display === 'block' && searchResults.querySelector('.map-search-item')) {
          jumpToFirstResult();
        } else {
          if (searchInput._debounceTimer) clearTimeout(searchInput._debounceTimer);
          performSearch();
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
