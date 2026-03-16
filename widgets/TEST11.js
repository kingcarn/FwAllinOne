/**
 * 瑪卡巴卡雲端劇場 Forward Widget
 * 聚合豆瓣榜單、精選劇場、熱門番劇與芒果TV推薦 (帶全局多維度排序)
 */

// 1. Metadata definition (MUST be at top level)
WidgetMetadata = {
  id: "makkapakka_hub_list_0",
  title: "瑪卡巴卡の雲端劇場",
  description: "各個平臺劇場和豆瓣熱榜",
  author: "𝙈𝙖𝙠𝙠𝙖𝙋𝙖𝙠𝙠𝙖",
  site: "https://t.me/MakkaPakkaOvO",
  version: "1.0.6",
  requiredVersion: "0.0.1",
  
  modules: [
    {
      title: "豆瓣熱榜",
      description: "豆瓣實時熱門影劇綜",
      functionName: "loadDouban",
      type: "video",
      cacheDuration: 43200,
      params: [
        {
          name: "channel",
          title: "榜單分類",
          type: "enumeration",
          value: "tv",
          enumOptions: [
            { title: "全部劇集", value: "tv" },
            { title: "大陸劇集", value: "tv_domestic" },
            { title: "歐美劇集", value: "tv_american" },
            { title: "日本劇集", value: "tv_japanese" },
            { title: "南韓劇集", value: "tv_korean" },
            { title: "動漫番劇", value: "tv_animation" },
            { title: "紀錄片", value: "tv_documentary" },
            { title: "大陸綜藝", value: "show_domestic" },
            { title: "國外綜藝", value: "show_foreign" }
          ]
        },
        {
          name: "sort_type",
          title: "排序方式",
          type: "enumeration",
          value: "default",
          enumOptions: [
            { title: "默認原序", value: "default" },
            { title: "最近發布", value: "recent" },
            { title: "熱度最高", value: "heat" },
            { title: "流行趨勢", value: "trending" },
            { title: "高分優先", value: "rating" }
          ]
        },
        {
          name: "page",
          title: "頁碼",
          type: "page",
          startPage: 1
        }
      ]
    },
    {
      title: "各平臺劇場",
      description: "網路平臺劇場榜單",
      functionName: "loadTheater",
      type: "video",
      cacheDuration: 43200,
      params: [
        {
          name: "brand",
          title: "劇場品牌",
          type: "enumeration",
          value: "迷雾剧场",
          enumOptions: [
            { title: "迷霧劇場", value: "迷雾剧场" },
            { title: "白夜劇場", value: "白夜剧场" },
            { title: " X 劇場", value: "X剧场" },
            { title: "瑪卡的片單", value: "玛卡巴卡的悬疑剧" },
            { title: "橫屏短劇", value: "横屏短剧" },
            { title: "生花劇場", value: "生花剧场" },
            { title: "大家劇場", value: "大家剧场" },
            { title: "小逗劇場", value: "小逗剧场" },
            { title: "十分劇場", value: "十分剧场" },
            { title: "板凳單元", value: "板凳单元" },
            { title: "螢火單元", value: "萤火单元" },
            { title: "正午陽光", value: "正午阳光" },
            { title: "戀戀劇場", value: "恋恋剧场" },
            { title: "懸疑劇場", value: "悬疑剧场" },
            { title: "微塵劇場", value: "微尘剧场" }
          ]
        },
        {
          name: "status",
          title: "播出狀態",
          type: "enumeration",
          value: "all",
          enumOptions: [
            { title: "全部", value: "all" },
            { title: "已開播", value: "aired" },
            { title: "即將推出", value: "upcoming" }
          ]
        },
        {
          name: "sort_type",
          title: "排序方式",
          type: "enumeration",
          value: "default",
          enumOptions: [
            { title: "默認原序", value: "default" },
            { title: "最近發布", value: "recent" },
            { title: "熱度最高", value: "heat" },
            { title: "流行趨勢", value: "trending" },
            { title: "高分優先", value: "rating" }
          ]
        },
        {
          name: "page",
          title: "頁碼",
          type: "page",
          startPage: 1
        }
      ]
    },
    {
      title: "熱門番劇",
      description: "Bangumi 實時熱榜",
      functionName: "loadBangumi",
      type: "video",
      cacheDuration: 43200,
      params: [
        {
          name: "genre",
          title: "番劇類型",
          type: "enumeration",
          value: "",
          enumOptions: [
            { title: "全部", value: "" },
            { title: "動作", value: "28" },
            { title: "冒險", value: "12" },
            { title: "動畫", value: "16" },
            { title: "喜劇", value: "35" },
            { title: "奇幻", value: "14" },
            { title: "劇情", value: "18" },
            { title: "科幻", value: "878" },
            { title: "懸疑", value: "9648" }
          ]
        },
        {
          name: "sort_type",
          title: "排序方式",
          type: "enumeration",
          value: "default",
          enumOptions: [
            { title: "默認原序", value: "default" },
            { title: "最近發布", value: "recent" },
            { title: "熱度最高", value: "heat" },
            { title: "流行趨勢", value: "trending" },
            { title: "高分優先", value: "rating" }
          ]
        },
        {
          name: "page",
          title: "頁碼",
          type: "page",
          startPage: 1
        }
      ]
    },
    {
      title: "芒果TV熱榜",
      description: "最新芒果TV熱播劇集與綜藝",
      functionName: "loadMangoTV",
      type: "video",
      cacheDuration: 43200,
      params: [
        {
          name: "sort_by",
          title: "類型",
          type: "enumeration",
          value: "tv",
          enumOptions: [
            { title: "全部劇集", value: "tv" },
            { title: "王牌綜藝", value: "show" }
          ]
        },
        {
          name: "sort_type",
          title: "排序方式",
          type: "enumeration",
          value: "default",
          enumOptions: [
            { title: "默認原序", value: "default" },
            { title: "最近發布", value: "recent" },
            { title: "熱度最高", value: "heat" },
            { title: "流行趨勢", value: "trending" },
            { title: "高分優先", value: "rating" }
          ]
        },
        {
          name: "page",
          title: "頁碼",
          type: "page",
          startPage: 1
        }
      ]
    }
  ]
};

// ============================================
// Handler Functions
// ============================================

const Utils = {
  emptyTips: [{ id: "empty", type: "text", title: "⚠️ 載入失敗", description: "請檢查網絡連線" }],

  async fetch(filename) {
    const url = `https://raw.githubusercontent.com/MakkaPakka518/List/refs/heads/main/data/${filename}`;
    try {
      const resp = await Widget.http.get(url, { decodable: true });
      if (!resp?.data) return this.emptyTips;
      
      if (typeof resp.data === "string") {
        return JSON.parse(resp.data);
      }
      return resp.data;
    } catch (e) {
      console.error(`[Error] ${url}: ${e.message}`);
      return this.emptyTips;
    }
  },

  // 👇 新增：核心排序引擎
  sortList(list, sortType) {
    if (!list || !Array.isArray(list) || list.length === 0) return list || [];
    if (!sortType || sortType === "default") return list;

    // 複製一份陣列，避免污染原始緩存數據
    return [...list].sort((a, b) => {
      switch (sortType) {
        case "recent":
          // 按照日期排序（由新到舊）
          const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
          const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
          return dateB - dateA;
        case "heat":
          // 熱度：按照總投票人數排序
          const heatA = parseFloat(a.voteCount || a.vote_count) || 0;
          const heatB = parseFloat(b.voteCount || b.vote_count) || 0;
          return heatB - heatA;
        case "trending":
          // 趨勢：按照 TMDB popularity 指數排序
          const trendA = parseFloat(a.popularity) || 0;
          const trendB = parseFloat(b.popularity) || 0;
          return trendB - trendA;
        case "rating":
          // 評分：按照 TMDB 評分排序
          const rateA = parseFloat(a.rating) || 0;
          const rateB = parseFloat(b.rating) || 0;
          return rateB - rateA;
        default:
          return 0;
      }
    });
  },

  // 本地陣列分頁切割函數
  paginate(list, pageNum, pageSize = 24) {
    if (!list || !Array.isArray(list)) return [];
    const p = parseInt(pageNum) || 1;
    const start = (p - 1) * pageSize;
    return list.slice(start, start + pageSize);
  }
};

/**
 * 模組 1：加載豆瓣榜單
 */
async function loadDouban(params = {}) {
  const data = await Utils.fetch("douban-hot.json");
  if (data === Utils.emptyTips) return data;
  
  let list = data?.[params.channel] || [];
  // 1. 先排序
  list = Utils.sortList(list, params.sort_type);
  // 2. 後分頁
  return Utils.paginate(list, params.page);
}

/**
 * 模組 2：加載精選劇場
 */
async function loadTheater(params = {}) {
  const data = await Utils.fetch("theater-data.json");
  if (data === Utils.emptyTips) return data;
  
  const brand = params.brand || "迷雾剧场";
  const status = params.status || "all";
  
  const brandData = data[brand];
  if (!brandData) return [];
  
  let list = [];
  if (status === "aired") {
    list = brandData.aired || [];
  } else if (status === "upcoming") {
    list = brandData.upcoming || [];
  } else {
    list = [...(brandData.upcoming || []), ...(brandData.aired || [])];
  }
  
  list = Utils.sortList(list, params.sort_type);
  return Utils.paginate(list, params.page);
}

/**
 * 模組 3：加載熱門番劇 (Bangumi)
 */
async function loadBangumi(params = {}) {
  const data = await Utils.fetch("bangumi-hot.json");
  if (data === Utils.emptyTips) return data;
  
  let list = data?.hot_anime || data?.items || [];

  if (params.genre && params.genre !== "") {
    const genreId = parseInt(params.genre);
    list = list.filter(item => item.rawGenres && item.rawGenres.includes(genreId));
  }
  
  list = Utils.sortList(list, params.sort_type);
  return Utils.paginate(list, params.page);
}

/**
 * 模組 4：加載芒果TV熱榜
 */
async function loadMangoTV(params = {}) {
  const data = await Utils.fetch("mgtv-hot.json");
  if (data === Utils.emptyTips) return data;

  const sort_by = params.sort_by || "tv";
  let list = data?.[sort_by] || [];

  list = Utils.sortList(list, params.sort_type);
  return Utils.paginate(list, params.page);
}
