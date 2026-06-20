/**
 * 定位 & 距离计算模块
 * - 获取用户 GPS 位置
 * - 手动设置任意位置（地图选点）
 * - 使用 Haversine 公式计算距离
 * - 过滤 5km 范围内的店铺
 * - 反向地理编码（坐标 → 地址）
 */

const LocationModule = (() => {

  /** 搜索半径（公里） */
  const SEARCH_RADIUS_KM = 5;

  /** 高德地图 API Key（Web服务） */
  var AMAP_KEY = '0a69f733da921a6ab4426116a946dc45';

  /** API 请求超时时间（毫秒） */
  var FETCH_TIMEOUT_MS = 8000;

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
      var resp = await fetchWithTimeout(url, {}, 6000);
      var data = await resp.json();
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
   * 正向搜索：地址关键词 → 地点列表（含坐标）
   * 使用高德输入提示 API（搜索即所得，国内秒级响应）
   * @param {string} query
   * @returns {Promise<Array<{lat: number, lng: number, name: string}>>}
   */
  async function geocode(query) {
    try {
      var url = 'https://restapi.amap.com/v3/assistant/inputtips?key=' + AMAP_KEY +
        '&keywords=' + encodeURIComponent(query) + '&datatype=all';
      var resp = await fetchWithTimeout(url, {}, 6000);
      var data = await resp.json();
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
