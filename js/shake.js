/**
 * 摇一摇检测模块
 * - 使用浏览器 DeviceMotion API 检测手机物理摇晃
 * - iOS 13+ 需要用户授权
 * - 阈值 + 冷却时间防止误触发
 */

const ShakeModule = (() => {

  /** 摇晃阈值：三轴加速度变化总和超过此值视为一次摇晃 */
  const SHAKE_THRESHOLD = 15;

  /** 冷却时间（毫秒）：两次摇晃之间的最小间隔 */
  const SHAKE_COOLDOWN = 1500;

  let lastX = 0;
  let lastY = 0;
  let lastZ = 0;
  let lastShakeTime = 0;
  let callback = null;
  let listening = false;

  /**
   * 浏览器是否支持 DeviceMotion
   */
  function isSupported() {
    return 'DeviceMotionEvent' in window;
  }

  /**
   * 是否需要用户手动授权（iOS 13+）
   */
  function needsPermission() {
    return typeof DeviceMotionEvent.requestPermission === 'function';
  }

  /**
   * 请求 DeviceMotion 权限（iOS 13+ 必须由用户手势触发）
   * @returns {Promise<string>} 'granted' | 'denied'
   */
  function requestPermission() {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
      return DeviceMotionEvent.requestPermission();
    }
    return Promise.resolve('granted');
  }

  /**
   * 开始监听摇晃
   * @param {Function} cb - 摇晃时的回调函数
   * @returns {boolean} 是否成功启动
   */
  function start(cb) {
    if (!isSupported()) {
      console.warn('当前浏览器不支持 DeviceMotion');
      return false;
    }

    callback = cb;

    if (listening) return true;

    listening = true;
    window.addEventListener('devicemotion', handleMotion);
    console.log('摇一摇监听已启动');
    return true;
  }

  /**
   * 停止监听摇晃
   */
  function stop() {
    listening = false;
    window.removeEventListener('devicemotion', handleMotion);
    console.log('摇一摇监听已停止');
  }

  /**
   * 处理设备运动事件
   */
  function handleMotion(e) {
    var acc = e.accelerationIncludingGravity;
    if (!acc || acc.x === null) return;

    var now = Date.now();

    // 计算三轴加速度变化量
    var deltaX = Math.abs(acc.x - lastX);
    var deltaY = Math.abs(acc.y - lastY);
    var deltaZ = Math.abs(acc.z - lastZ);
    var totalDelta = deltaX + deltaY + deltaZ;

    // 超过阈值 + 冷却时间已过 → 触发摇晃
    if (totalDelta > SHAKE_THRESHOLD && (now - lastShakeTime) > SHAKE_COOLDOWN) {
      lastShakeTime = now;
      if (callback) {
        callback();
      }
    }

    lastX = acc.x;
    lastY = acc.y;
    lastZ = acc.z;
  }

  return {
    isSupported: isSupported,
    needsPermission: needsPermission,
    requestPermission: requestPermission,
    start: start,
    stop: stop,
  };
})();
