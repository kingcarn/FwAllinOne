/**
 * 瑪卡巴卡雲端劇場 Forward Widget
 * 聚合豆瓣榜單、精選劇場、熱門番劇與芒果TV推薦 (帶全局多維度排序 + 動態抓取更新時間)
 */

WidgetMetadata = {
  id: "makkapakka_hub_list_2.0_test1111",
  title: "瑪卡巴卡の雲端劇場",
  description: "各個平臺劇場和豆瓣熱榜",
  author: "𝙈𝙖𝙠𝙠𝙖𝙋𝙖𝙠𝙠𝙖",
  site: "https://t.me/MakkaPakkaOvO",
  version: "1.0.8",
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
            { title: "最近更新", value: "updated" },
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
            { title: "橫屏短剧", value: "横屏短剧" },
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
            { title: "最近更新", value: "updated" },
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
            { title: "最近更新", value: "updated" },
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
            { title: "最近更新", value: "updated" },
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

const Utils = {
  emptyTips: [{ id: "empty", type: "text", title: "⚠️ 載入失敗", description: "請檢查網絡連線" }],

  async fetch(filename) {
    const url = `https://raw.githubusercontent.com/MakkaPakka518/List/refs/heads/main/data/${filename}`;
    try {
      const resp = await Widget.http.get(url, { decodable: true });
      if (!resp?.data) return this.emptyTips;
      return typeof resp.data === "string" ? JSON.parse(resp.data) : resp.data;
    } catch (e) {
      console.error(`[Error] ${url}: ${e.message}`);
      return this.emptyTips;
    }
  },

  // 👇 注意這裡變成了 async，因為要去 TMDB 拉數據
  async sortList(list, sortType) {
    if (!list || !Array.isArray(list) || list.length === 0) return list || [];
    if (!sortType || sortType === "default") return list;

    let processedList = [...list];

    // 如果是用戶要看“最近更新”，就拿着 ID 去 TMDB 批量查日期
    if (sortType === "updated") {
      await Promise.all(processedList.map(async (item) => {
        // 只查剧集（电影没有更新日期的概念），并且是 tmdb 类型的
        if (item.type === "tmdb" && item.id && (!item.mediaType || item.mediaType === "tv") && !item.lastUpdateDate) {
          try {
            const detail = await Widget.tmdb.get(`/tv/${item.id}`);
            if (detail && detail.last_air_date) {
              item.lastUpdateDate = detail.last_air_date;
            }
          } catch (e) {
            // 请求失败就静默处理，避免报错弹窗
          }
        }
      }));
    }

    return processedList.sort((a, b) => {
      switch (sortType) {
        case "updated":
          // 有 lastUpdateDate 就用，没有就拿首播日期兜底
          const updateA = a.lastUpdateDate ? new Date(a.lastUpdateDate).getTime() : (a.releaseDate ? new Date(a.releaseDate).getTime() : 0);
          const updateB = b.lastUpdateDate ? new Date(b.lastUpdateDate).getTime() : (b.releaseDate ? new Date(b.releaseDate).getTime() : 0);
          return updateB - updateA;
        case "recent":
          const dateA = a.releaseDate ? new Date(a.releaseDate).getTime() : 0;
          const dateB = b.releaseDate ? new Date(b.releaseDate).getTime() : 0;
          return dateB - dateA;
        case "heat":
          const heatA = parseFloat(a.voteCount || a.vote_count) || 0;
          const heatB = parseFloat(b.voteCount || b.vote_count) || 0;
          return heatB - heatA;
        case "trending":
          const trendA = parseFloat(a.popularity) || 0;
          const trendB = parseFloat(b.popularity) || 0;
          return trendB - trendA;
        case "rating":
          const rateA = parseFloat(a.rating) || 0;
          const rateB = parseFloat(b.rating) || 0;
          return rateB - rateA;
        default:
          return 0;
      }
    });
  },

  paginate(list, pageNum, pageSize = 24) {
    if (!list || !Array.isArray(list)) return [];
    const p = parseInt(pageNum) || 1;
    const start = (p - 1) * pageSize;
    return list.slice(start, start + pageSize);
  }
};

/**
 * 下面所有的 load 函数里，Utils.sortList 都加上了 await
 */
async function loadDouban(params = {}) {
  const data = await Utils.fetch("douban-hot.json");
  if (data === Utils.emptyTips) return data;
  let list = data?.[params.channel] || [];
  list = await Utils.sortList(list, params.sort_type);
  return Utils.paginate(list, params.page);
}

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
  
  list = await Utils.sortList(list, params.sort_type);
  return Utils.paginate(list, params.page);
}

async function loadBangumi(params = {}) {
  const data = await Utils.fetch("bangumi-hot.json");
  if (data === Utils.emptyTips) return data;
  let list = data?.hot_anime || data?.items || [];

  if (params.genre && params.genre !== "") {
    const genreId = parseInt(params.genre);
    list = list.filter(item => item.rawGenres && item.rawGenres.includes(genreId));
  }
  
  list = await Utils.sortList(list, params.sort_type);
  return Utils.paginate(list, params.page);
}

async function loadMangoTV(params = {}) {
  const data = await Utils.fetch("mgtv-hot.json");
  if (data === Utils.emptyTips) return data;
  const sort_by = params.sort_by || "tv";
  let list = data?.[sort_by] || [];

  list = await Utils.sortList(list, params.sort_type);
  return Utils.paginate(list, params.page);
}
