/**
 * 定位 & 距离计算模块
 * - 获取用户 GPS 位置
 * - 手动设置任意位置（地图选点）
 * - 使用 Haversine 公式计算距离
 * - 过滤 5km 范围内的店铺
 * - 反向地理编码（坐标 → 地址）
 * - 高德 API 调用（fetch 优先 + JSONP 兜底，解决手机 CORS 问题）
 */

const LocationModule = (() => {

  /** 搜索半径（公里） */
  const SEARCH_RADIUS_KM = 5;

  /** 高德地图 API Key（Web服务） */
  var AMAP_KEY = '0a69f733da921a6ab4426116a946dc45';

  /** API 请求超时时间（毫秒） */
  var FETCH_TIMEOUT_MS = 8000;

  /** JSONP 回调计数器（保证每次请求回调名唯一，避免并发冲突） */
  var _jsonpCounter = 0;

  /**
   * 带超时的 fetch 封装
   * 浏览器原生 fetch 没有超时机制，移动网络下可能永久挂起
   */
  function fetchWithTimeout(url, options, timeoutMs) {
    timeoutMs = timeoutMs || FETCH_TIMEOUT_MS;
    return Promise.race([
      fetch(url, options),
      new Promise(function (_, reject) {
        setTimeout(function () {
          reject(new Error('请求超时'));
        }, timeoutMs);
      }),
    ]);
  }

  /**
   * JSONP 请求封装（解决手机浏览器 CORS 拦截问题）
   *
   * 【为什么需要 JSONP】
   * 高德 restapi.amap.com 是 Web 服务 API，设计给服务器用的。
   * 桌面浏览器对跨域请求比较宽松，但手机浏览器
   * （iOS Safari / 微信内置浏览器 / 部分安卓浏览器）
   * 的 CORS 策略更严格，会直接拦截 fetch 请求。
   *
   * JSONP 利用 <script> 标签不受同源策略限制的特性：
   * 1. 动态创建 <script src="...&callback=函数名">
   * 2. 服务端返回 函数名({...数据...}) 这样的 JS 代码
   * 3. 浏览器执行这段 JS → 数据就拿到了
   *
   * @param {string} baseUrl - 不含 callback 的 API URL（已经包含 key 等参数）
   * @param {number} timeoutMs - 超时时间（毫秒），到时未响应则 reject
   * @returns {Promise<any>} 服务端返回的 JSON 数据
   */
  function jsonpRequest(baseUrl, timeoutMs) {
    timeoutMs = timeoutMs || FETCH_TIMEOUT_MS;
    return new Promise(function (resolve, reject) {
      var callbackName = '_amapJsonpCallback_' + Date.now() + '_' + (_jsonpCounter++);
      var script = document.createElement('script');
      var timer = null;

      // 把回调函数挂到全局 window 上，服务端返回的 JS 会调用它
      window[callbackName] = function (data) {
        cleanup();
        resolve(data);
      };

      // 清理：删 script 标签 + 删全局函数 + 清定时器
      function cleanup() {
        if (timer) { clearTimeout(timer); timer = null; }
        if (script && script.parentNode) { script.parentNode.removeChild(script); }
        delete window[callbackName];
      }

      // 超时处理：移动网络可能很慢，超时后 reject
      timer = setTimeout(function () {
        cleanup();
        reject(new Error('JSONP请求超时（' + timeoutMs / 1000 + 's）'));
      }, timeoutMs);

      // 加载失败处理：网络断开、DNS 解析失败、服务端返回非 JS 等
      script.onerror = function () {
        cleanup();
        reject(new Error('JSONP请求失败（网络错误或服务端拒绝）'));
      };

      // 拼接 callback 参数（注意 URL 中是否已有 query string）
      script.src = baseUrl + (baseUrl.indexOf('?') !== -1 ? '&' : '?') + 'callback=' + callbackName;
      document.head.appendChild(script);
    });
  }

  /**
   * 统一的 API 请求策略：先 fetch（桌面浏览器更快），
   * 失败后自动降级到 JSONP（手机浏览器绕过 CORS）
   *
   * @param {string} url - 完整的 API URL
   * @param {number} timeoutMs - 超时时间
   * @returns {Promise<any>} 服务端返回的 JSON 数据
   */
  async function apiRequest(url, timeoutMs) {
    // 第一步：尝试 fetch（桌面浏览器通常直接成功）
    try {
      var resp = await fetchWithTimeout(url, {}, timeoutMs);
      var data = await resp.json();
      return data;
    } catch (fetchErr) {
      console.warn('fetch请求失败，降级到JSONP：', fetchErr.message);
      // 第二步：fetch 失败（可能是 CORS 拦截），降级到 JSONP
      try {
        return await jsonpRequest(url, timeoutMs);
      } catch (jsonpErr) {
        // 两种方式都失败，抛出错误给上层处理
        throw new Error('API请求失败（fetch和JSONP均失败）：' + jsonpErr.message);
      }
    }
  }

  /** 用户当前位置 */
  let userLocation = null;   // { lat, lng }
  let locationError = null;
  let isManualLocation = false; // 是否为手动选择的位置

  /**
   * 使用浏览器 Geolocation API 获取当前位置
   * @returns {Promise<{lat: number, lng: number}>}
   */
  function getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('浏览器不支持定位功能'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          userLocation = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          locationError = null;
          isManualLocation = false;
          resolve(userLocation);
        },
        (err) => {
          locationError = err.message;
          // 定位失败时使用默认位置（北京中关村）
          userLocation = { lat: BASE_LAT, lng: BASE_LNG };
          isManualLocation = false;
          console.warn('定位失败，使用默认位置：', err.message);
          resolve(userLocation);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        }
      );
    });
  }

  /**
   * 手动设置位置（地图选点结果）
   * @param {number} lat
   * @param {number} lng
   */
  function setManualLocation(lat, lng) {
    userLocation = { lat, lng };
    locationError = null;
    isManualLocation = true;
  }

  /**
   * 反向地理编码：坐标 → 地址文字
   * 使用高德地图 API（国内秒级响应）
   * @param {number} lat
   * @param {number} lng
   * @returns {Promise<string>} 地址文字
   */
  async function reverseGeocode(lat, lng) {
    try {
      // 高德 regeo API，location 格式为 "lng,lat"（注意顺序！）
      var url = 'https://restapi.amap.com/v3/geocode/regeo?key=' + AMAP_KEY +
        '&location=' + lng + ',' + lat + '&extensions=base';
      var data = await apiRequest(url, 6000);
      if (data.status === '1' && data.regeocode && data.regeocode.formatted_address) {
        return data.regeocode.formatted_address;
      }
      console.error('高德逆地理编码返回异常：', data);
      return '';
    } catch (err) {
      console.error('逆地理编码失败：', err);
      return '';
    }
  }

  /**
   * POI 周边搜索：坐标 → 周边餐饮店铺列表
   * 使用高德周边搜索 API（/v3/place/around）
   * @param {number} lat - 中心纬度
   * @param {number} lng - 中心经度
   * @param {number} radiusKm - 搜索半径（公里）
   * @returns {Promise<Array>} POI 列表
   */
  async function searchNearbyPois(lat, lng, radiusKm) {
    try {
      var url = 'https://restapi.amap.com/v3/place/around?key=' + AMAP_KEY +
        '&location=' + lng + ',' + lat +
        '&radius=' + Math.round(radiusKm * 1000) +
        '&types=050000' +
        '&offset=25';
      var data = await apiRequest(url, 8000);
      if (data.status === '1' && data.pois && data.pois.length > 0) {
        return data.pois;
      }
      if (data.status !== '1') {
        console.warn('高德POI搜索返回异常：', data.info || data.status);
      }
      return [];
    } catch (err) {
      console.error('高德POI搜索失败：', err);
      return [];
    }
  }

  /**
   * 正向搜索：地址关键词 → 地点列表（含坐标）
   * 使用高德输入提示 API（搜索即所得，国内秒级响应）
   * @param {string} query
   * @returns {Promise<Array<{lat: number, lng: number, name: string}>>}
   */
  async function geocode(query) {
    try {
      var url = 'https://restapi.amap.com/v3/assistant/inputtips?key=' + AMAP_KEY +
        '&keywords=' + encodeURIComponent(query) + '&datatype=all';
      var data = await apiRequest(url, 6000);
      if (data.status === '1' && data.tips && data.tips.length > 0) {
        return data.tips
          .filter(function (tip) { return tip.location && tip.location.indexOf(',') !== -1; })
          .map(function (tip) {
            var parts = tip.location.split(',');
            return {
              lat: parseFloat(parts[1]),   // location 格式 "lng,lat"
              lng: parseFloat(parts[0]),
              name: tip.name + (tip.address ? ' · ' + tip.address : ''),
            };
          });
      }
      return [];
    } catch (err) {
      console.error('地理搜索失败：', err);
      return [];
    }
  }

  /**
   * Haversine 公式计算两点间距离（公里）
   */
  function haversineDistance(lat1, lng1, lat2, lng2) {
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function toRad(deg) {
    return (deg * Math.PI) / 180;
  }

  /**
   * 格式化距离显示
   */
  function formatDistance(km) {
    if (km < 1) {
      return Math.round(km * 1000) + 'm';
    }
    return km.toFixed(1) + 'km';
  }

  /**
   * 为所有店铺计算距离，并过滤出范围内的店铺
   */
  function filterShopsByDistance(shops) {
    if (!userLocation) return shops;

    return shops
      .map((shop) => {
        const dist = haversineDistance(
          userLocation.lat,
          userLocation.lng,
          shop.lat,
          shop.lng
        );
        return { ...shop, distance: dist };
      })
      .filter((shop) => shop.distance <= SEARCH_RADIUS_KM);
  }

  function getUserLocation() {
    return userLocation;
  }

  function hasLocationError() {
    return locationError !== null;
  }

  function getLocationError() {
    return locationError;
  }

  function getIsManual() {
    return isManualLocation;
  }

  function getSearchRadius() {
    return SEARCH_RADIUS_KM;
  }

  return {
    getCurrentPosition,
    setManualLocation,
    reverseGeocode,
    geocode,
    searchNearbyPois,
    haversineDistance,
    formatDistance,
    filterShopsByDistance,
    getUserLocation,
    hasLocationError,
    getLocationError,
    getIsManual,
    getSearchRadius,
  };
})();
