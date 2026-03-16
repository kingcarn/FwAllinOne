/**
 * 玛卡巴卡专属模块 - 芒果TV & 樱花动漫
 */

var WidgetMetadata = {
  id: "makkapakka_extended_hub",
  title: "芒果樱花精选",
  description: "获取最新芒果TV热榜与樱花动漫推荐",
  author: "MakkaPakka",
  site: "https://t.me/MakkaPakkaOvO",
  version: "1.0.0",
  requiredVersion: "0.0.1",
  globalParams: [
    {
      name: "githubProxy",
      title: "GitHub 加速源",
      type: "input",
      placeholders: [
        { title: "ghproxy", value: "https://ghproxy.net/" }
      ]
    }
  ],
  modules: [
    {
      title: "芒果TV热榜",
      functionName: "getMangoTV",
      cacheDuration: 43200,
      params: [
        {
          name: "sort_by",
          title: "类型",
          type: "enumeration",
          enumOptions: [
            { title: "全部剧集", value: "tv" },
            { title: "王牌综艺", value: "show" }
          ]
        },
        {
          name: "page",
          title: "页数",
          type: "page",
          startPage: 1
        }
      ]
    },
    {
      title: "樱花动漫",
      functionName: "getYinghua",
      cacheDuration: 43200,
      params: [
        {
          name: "sort_by",
          title: "类型",
          type: "enumeration",
          enumOptions: [
            { title: "樱花日漫", value: "japanese" },
            { title: "樱花国漫", value: "chinese" },
            { title: "樱花美漫", value: "american" }
          ]
        },
        {
          name: "page",
          title: "页数",
          type: "page",
          startPage: 1
        }
      ]
    }
  ]
};

const Utils = {
  emptyTips: [{ id: "empty", type: "text", title: "⚠️ 加载失败", description: "请检查网络或配置 GitHub 加速" }],

  async fetch(proxy, path) {
    // 替换为你自己的 Github Raw 数据源地址
    const url = `${proxy || ""}https://raw.githubusercontent.com/MakkaPakka518/List/refs/heads/main/data/${path}`;
    try {
      const resp = await Widget.http.get(url, { decodable: true });
      if (!resp?.data) return this.emptyTips;
      
      // 兼容字符串形式的 JSON 返回
      if (typeof resp.data === "string") {
        return JSON.parse(resp.data);
      }
      return resp.data;
    } catch (e) {
      console.error(`[Error] ${url}: ${e.message}`);
      return this.emptyTips;
    }
  },

  // 本地数组切片分页，防止一次性渲染上百条数据导致 App 卡顿
  paginate(list, pageNum, pageSize = 24) {
    if (!list || !Array.isArray(list) || list.length === 0 || list[0].id === "empty") {
      return list || [];
    }
    const p = parseInt(pageNum) || 1;
    const start = (p - 1) * pageSize;
    return list.slice(start, start + pageSize);
  }
};

/**
 * 芒果TV 热榜
 */
async function getMangoTV(params = {}) {
  const data = await Utils.fetch(params.githubProxy, "mgtv-hot.json");
  if (data === Utils.emptyTips) return data;
  
  const list = data?.[params.sort_by] || [];
  return Utils.paginate(list, params.page);
}

/**
 * 樱花动漫
 */
async function getYinghua(params = {}) {
  const data = await Utils.fetch(params.githubProxy, "yinghua-hot.json");
  if (data === Utils.emptyTips) return data;
  
  const list = data?.[params.sort_by] || [];
  return Utils.paginate(list, params.page);
}
