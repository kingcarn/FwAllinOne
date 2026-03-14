/**
 * 玛卡巴卡云端剧场 Forward Widget
 * 聚合豆瓣榜单、精选剧场与热门番剧推荐
 */

// 1. Metadata definition (MUST be at top level)
WidgetMetadata = {
  id: "makkapakka_hub_list",
  title: "瑪卡巴卡雲端劇場",
  description: "各個平臺劇場和豆瓣熱榜",
  author: "𝙈𝙖𝙠𝙠𝙖𝙋𝙖𝙠𝙠𝙖",
  version: "1.0.0",
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
          value: "迷霧劇場",
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
          name: "country",
          title: "國家地區",
          type: "enumeration",
          value: "",
          enumOptions: [
            { title: "全部", value: "" },
            { title: "日本", value: "JP" },
            { title: "大陸", value: "CN" },
            { title: "美國", value: "US" },
            { title: "南韓", value: "KR" }
          ]
        },
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
        }
      ]
    }
  ]
};

// ============================================
// Handler Functions
// ============================================

/**
 * 封装数据获取方法，利用 Widget.http.get 获取云端 JSON
 */
async function fetchCloudData(filename) {
  const url = `https://raw.githubusercontent.com/MakkaPakka518/List/refs/heads/main/data/${filename}`;
  
  try {
    const response = await Widget.http.get(url, { decodable: true });
    
    // 如果 decodable: true 解析失败，尝试手动解析
    let data;
    if (typeof response.data === "string") {
      try {
        data = JSON.parse(response.data);
      } catch (e) {
        console.error("JSON parse failed:", e);
        data = null;
      }
    } else {
      data = response.data;
    }
    
    return data;
  } catch (error) {
    console.error(`Load ${filename} failed:`, error);
    return null;
  }
}

/**
 * 将你的原生 JSON 数据标准化为 Forward 的 VideoItem 格式
 */
function formatToVideoItems(list) {
  if (!list || !Array.isArray(list)) return [];
  
  return list.map(item => {
    // 处理 TMDB 海报图路径
    let picUrl = item.posterPath || item.cover || '';
    if (picUrl && picUrl.startsWith('/')) {
      picUrl = `https://image.tmdb.org/t/p/w500${picUrl}`;
    }
    
    // 处理背景图路径
    let backUrl = item.backdropPath || '';
    if (backUrl && backUrl.startsWith('/')) {
      backUrl = `https://image.tmdb.org/t/p/w780${backUrl}`;
    }

    // 处理 TMDB 专有格式 ID (tv.12345 或 movie.12345)
    let itemId = item.tmdbId || item.id || '';
    let itemType = "url"; 
    
    if (item.type === "tmdb" || item.tmdbId) {
      itemType = "tmdb";
      // 拼装 TMDB ID 前缀
      const mType = item.mediaType || "tv";
      itemId = `${mType}.${itemId}`;
    }

    return {
      id: String(itemId),
      type: itemType,
      title: item.title || "未知标题",
      description: item.description || "",
      coverUrl: picUrl,
      posterPath: picUrl,
      backdropPath: backUrl,
      rating: parseFloat(item.rating) || 0,
      releaseDate: item.releaseDate || item.year || "",
      mediaType: item.mediaType || "tv",
      genreTitle: item.genreTitle || ""
    };
  });
}

/**
 * 模块 1：加载豆瓣榜单
 */
async function loadDouban(params = {}) {
  const { channel = "tv" } = params;
  console.log("Loading Douban:", channel);
  
  const data = await fetchCloudData("douban-hot.json");
  if (!data || !data[channel]) return [];
  
  return formatToVideoItems(data[channel]);
}

/**
 * 模块 2：加载精选剧场
 */
async function loadTheater(params = {}) {
  const { brand = "迷雾剧场", status = "all" } = params;
  console.log(`Loading Theater: ${brand}, Status: ${status}`);
  
  const data = await fetchCloudData("theater-data.json");
  if (!data || !data[brand]) return [];
  
  let rawList = [];
  if (status === "aired") {
    rawList = data[brand].aired || [];
  } else if (status === "upcoming") {
    rawList = data[brand].upcoming || [];
  } else {
    rawList = [...(data[brand].upcoming || []), ...(data[brand].aired || [])];
  }
  
  return formatToVideoItems(rawList);
}

/**
 * 模块 3：加载热门番剧 (带高级交叉筛选)
 */
async function loadBangumi(params = {}) {
  const { country = "", genre = "" } = params;
  console.log(`Loading Bangumi: Country=${country}, Genre=${genre}`);
  
  const data = await fetchCloudData("bangumi-hot.json");
  if (!data) return [];
  
  let rawList = data.hot_anime || data.items || [];

  // 1. 筛选国家
  if (country !== "") {
    rawList = rawList.filter(item => item.rawCountries && item.rawCountries.includes(country));
  }
  
  // 2. 筛选类型
  if (genre !== "") {
    const genreId = parseInt(genre);
    rawList = rawList.filter(item => item.rawGenres && item.rawGenres.includes(genreId));
  }
  
  return formatToVideoItems(rawList);
}
