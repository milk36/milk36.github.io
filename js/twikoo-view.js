/* global CONFIG, twikoo */
// eslint-disable-next-line no-console

(function(window, document) {
  const envId = CONFIG.twikoo.envId;

  if (!envId) {
    throw new Error('Twikoo envId is empty');
  }

  // 直接调用 Twikoo API 获取评论数
  async function getCommentsCount(urls) {
    const apiUrl = envId.replace(/\/$/, '');

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'GET_COMMENTS_COUNT',
          urls: urls
        })
      });

      const data = await response.json();
      if (data.data && Array.isArray(data.data)) {
        return data.data.map(item => item.count || 0);
      }
      return [0];
    } catch (error) {
      console.error('Twikoo API Error:', error);
      return [0];
    }
  }

  // 获取站点统计数据
  async function getSiteStats() {
    try {
      // 使用直接 API 调用获取评论数统计
      const result = await getCommentsCount([window.location.origin]);

      let pvCtn = document.querySelector('#twikoo-site-pv-container');
      let uvCtn = document.querySelector('#twikoo-site-uv-container');

      if (pvCtn) {
        let ele = document.querySelector('#twikoo-site-pv');
        if (ele && result && result.length > 0) {
          // 显示总评论数
          ele.textContent = result[0] || 0;
          pvCtn.style.display = 'inline';
        }
      }

      // UV 使用本地存储的访客数
      if (uvCtn) {
        let ele = document.querySelector('#twikoo-site-uv');
        if (ele) {
          const uvKey = 'twikoo_site_uv';
          let uv = localStorage.getItem(uvKey) || '0';
          const lastVisit = localStorage.getItem(uvKey + '_time');
          const now = new Date().toDateString();

          // 如果是新的一天或首次访问，增加 UV
          if (lastVisit !== now) {
            uv = String(parseInt(uv) + 1);
            localStorage.setItem(uvKey, uv);
            localStorage.setItem(uvKey + '_time', now);
          }

          ele.textContent = uv;
          uvCtn.style.display = 'inline';
        }
      }
    } catch (error) {
      console.error('Twikoo Stats Error:', error);
    }
  }

  // 获取页面访问量 - Twikoo 官方方式
  async function getPageVisitors() {
    try {
      const visitorsCtn = document.querySelector('#twikoo-visitors');
      if (!visitorsCtn) return;

      const path = window.location.pathname;
      const url = window.location.origin + path;

      // 获取当前页面的评论数作为访问量
      const result = await getCommentsCount([url]);

      const ele = document.querySelector('#twikoo_visitors');
      if (ele) {
        ele.textContent = result && result.length > 0 ? result[0] : 0;
        visitorsCtn.style.display = 'inline';
      }
    } catch (error) {
      console.error('Twikoo Page Visitors Error:', error);
    }
  }

  // 初始化站点统计
  getSiteStats();

  // 如果有文章访问量节点，则获取页面统计
  let visitorsCtn = document.querySelector('#twikoo-visitors');
  if (visitorsCtn) {
    getPageVisitors();
  }

})(window, document);
