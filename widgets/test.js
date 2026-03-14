var WidgetMetadata = {
  id: "makkapakka_hub",
  title: "玛卡巴卡云端剧场",
  description: "聚合豆瓣榜单、精选剧场与热门番剧推荐",
  author: "MakkaPakka",
  site: "https://github.com/MakkaPakka518/List",
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
      title: "豆瓣榜单",
      functionName: "getDoubanList",
      cacheDuration: 43200,
      params: [
        {
          name: "channel",
          title: "分类",
          type: "enumeration",
          enumOptions: [
            { title: "全部剧集", value: "tv" },
            { title: "国产剧", value: "tv_domestic" },
            { title: "欧美剧", value: "tv_american" },
            { title: "日剧", value: "tv_japanese" },
            { title: "韩剧", value: "tv_korean" },
            { title: "动画", value: "tv_animation" },
            { title: "纪录片", value: "tv_documentary" },
            { title: "国内综艺", value: "show_domestic" },
            { title: "国外综艺", value: "show_foreign" }
          ]
        }
      ]
    },
    {
      title: "精选剧场",
      functionName: "getTheaterList",
      cacheDuration: 43200,
      params: [
        {
          name: "status",
          title: "类别",
          type: "enumeration",
          enumOptions: [
            { title: "正在热播", value: "aired" },
            { title: "即将上线", value: "upcoming" }
          ]
        },
        {
          name: "brand",
          title: "剧场",
          type: "enumeration",
          enumOptions: [
            { title: "迷雾剧场", value: "迷雾剧场" },
            { title: "白夜剧场", value: "白夜剧场" },
            { title: "X剧场", value: "X剧场" },
            { title: "玛卡巴卡的悬疑剧", value: "玛卡巴卡的悬疑剧" },
            { title: "生花剧场", value: "生花剧场" },
            { title: "大家剧场", value: "大家剧场" },
            { title: "小逗剧场", value: "小逗剧场" },
            { title: "十分剧场", value: "十分剧场" },
            { title: "板凳单元", value: "板凳单元" },
            { title: "萤火单元", value: "萤火单元" },
            { title: "正午阳光", value: "正午阳光" },
            { title: "恋恋剧场", value: "恋恋剧场" },
            { title: "悬疑剧场", value: "悬疑剧场" },
            { title: "微尘剧场", value: "微尘剧场" }
          ]
        }
      ]
    },
    {
      title: "热门番剧",
      functionName: "getBangumiList",
      cacheDuration: 43200,
      params: [
        {
          name: "country",
          title: "国家",
          type: "enumeration",
          enumOptions: [
            { title: "全部", value: "" },
            { title: "日本", value: "JP" },
            { title: "中国大陆", value: "CN" },
            { title: "美国", value: "US" },
            { title: "韩国", value: "KR" }
          ]
        },
        {
          name: "genre",
          title: "类型",
          type: "enumeration",
          enumOptions: [
            { title: "全部", value: "" },
            { title: "动作", value: 28 },
            { title: "冒险", value: 12 },
            { title: "动画", value: 16 },
            { title: "喜剧", value: 35 },
            { title: "奇幻", value: 14 },
            { title: "剧情", value: 18 },
            { title: "科幻", value: 878 },
            { title: "悬疑", value: 9648 }
          ]
        }
      ]
    }
  ]
};

const Utils = {
  emptyTips: [{ id: "empty", type: "text", title: "⚠️ 加载失败", description: "请检查网络或配置 GitHub 加速" }],

  async fetch(proxy, path) {
    // 自动拼装你的专属仓库数据路径
    const url = `${proxy || ""}https://raw.githubusercontent.com/MakkaPakka518/List/refs/heads/main/data/${path}`;
    try {
      const resp = await Widget.http.get(url);
      if (!resp?.data) return this.emptyTips;
      return resp.data;
    } catch (e) {
      console.error(`[Error] ${url}: ${e.message}`);
      return this.emptyTips;
    }
  }
};

/**
 * 豆瓣榜单
 */
async function getDoubanList(params = {}) {
  const data = await Utils.fetch(params.githubProxy, "douban-hot.json");
  if (!data || data === Utils.emptyTips) return Utils.emptyTips;
  
  // 按照前端传进来的参数（如 "tv_japanese"）提取对应的数据
  const list = data[params.channel] || [];
  return list;
}

/**
 * 精选剧场
 */
async function getTheaterList(params = {}) {
  const data = await Utils.fetch(params.githubProxy, "theater-data.json");
  if (!data || data === Utils.emptyTips) return Utils.emptyTips;
  
  // 获取剧场品牌和状态 (aired/upcoming)
  const brand = params.brand || "迷雾剧场";
  const status = params.status || "aired";
  
  const list = data[brand]?.[status] || [];
  return list;
}

/**
 * 热门番剧
 */
async function getBangumiList(params = {}) {
  const data = await Utils.fetch(params.githubProxy, "bangumi-hot.json");
  if (!data || data === Utils.emptyTips) return Utils.emptyTips;
  
  // 兼容不同的根节点名称
  let list = data.hot_anime || data.items || data || [];
  if (!Array.isArray(list)) return Utils.emptyTips;

  // 1. 国家交叉筛选
  if (params.country) {
    list = list.filter(item => item.rawCountries && item.rawCountries.includes(params.country));
  }
  
  // 2. 类型交叉筛选
  if (params.genre) {
    const genreId = parseInt(params.genre);
    list = list.filter(item => item.rawGenres && item.rawGenres.includes(genreId));
  }
  
  return list;
}
