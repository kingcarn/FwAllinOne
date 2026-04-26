/**
 * 骨朵热榜 + 玛卡巴卡私藏片单
 */
WidgetMetadata = {
  id: "makkapakka_all_in_one_test",
  title: "玛卡巴卡影视库",
  description: "聚合骨朵全网热度榜与 TMDB 玛卡巴卡私藏片单",
  author: "MakkaPakka",
  version: "1.2.0",
  requiredVersion: "0.0.1",
  modules: [
    {
      title: "骨朵热榜",
      description: "查看每日各大平台影视热度榜",
      functionName: "loadGuduoRank",
      cacheDuration: 3600 * 6, // 缓存 6 小时
      params: [
        {
          name: "category",
          title: "榜单分类",
          type: "enumeration",
          value: "剧集", // 默认显示剧集
          enumOptions: [
            { title: "全网剧集", value: "剧集" },
            { title: "全网动漫", value: "动漫" },
            { title: "全网综艺", value: "综艺" },
            { title: "网络电影", value: "电影" }
          ]
        }
      ]
    },
    {
      title: "TMDB 推荐片单",
      description: "同步玛卡巴卡在 TMDB 官网建立的收藏列表",
      functionName: "loadTmdbList",
      cacheDuration: 3600 * 6,
      params: [
        {
          name: "list_select",
          title: "选择片单",
          type: "enumeration",
          value: "8648338",
          enumOptions: [
            { title: "玛卡巴卡的悬疑剧推荐", value: "8648338" },
            { title: "玛卡巴卡的爱情剧推荐", value: "8648340" },
            { title: "--- 自定义片单 ---", value: "custom" }
          ]
        },
        {
          name: "custom_url",
          title: "片单链接",
          type: "input",
          placeholder: "粘贴链接 (或纯数字 ID)",
          belongTo: {
            paramName: "list_select",
            value: ["custom"]
          }
        }
      ]
    }
  ]
};

/**
 * [模块1] 获取并解析 GitHub 骨朵排行数据
 */
async function loadGuduoRank(params = {}) {
  try {
    const { category = "剧集" } = params;
    
    // GitHub Raw URL (加时间戳防止强缓存)
    const baseUrl = "https://raw.githubusercontent.com/MakkaPakka518/List/refs/heads/main/data/guduo-hot.json";
    const url = `${baseUrl}?t=${Math.floor(Date.now() / 3600000)}`;

    console.log(`[骨朵榜单] 开始加载: ${category}`);
    const response = await Widget.http.get(url, { decodable: true });
    
    let data;
    if (typeof response.data === "string") {
      try { data = JSON.parse(response.data); } catch (e) { data = {}; }
    } else {
      data = response.data;
    }

    if (!data || !data.categories || !data.categories[category]) {
      return [];
    }

    const items = data.categories[category];
    const results = [];

    for (const item of items) {
      const coverUrl = item.posterPath ? `https://image.tmdb.org/t/p/w500${item.posterPath}` : "";
      results.push({
        id: item.tmdbId ? item.tmdbId.toString() : item.title,
        type: "tmdb", 
        title: item.tmdbTitle || item.title, // 纯净名字
        description: `🏆 TOP ${item.rank} | 🔥 热度: ${item.heat} | 评分: ${item.rating}\n\n${item.overview}`,
        coverUrl: coverUrl,
        posterPath: item.posterPath,
        releaseDate: item.releaseDate,
        mediaType: item.mediaType,
        rating: item.rating,
        genreTitle: item.genreTitle || category
      });
    }
    return results;
  } catch (error) {
    console.error("[骨朵榜单] 请求发生错误:", error);
    throw error;
  }
}

/**
 * [模块2] 内部 TMDB 片单解析逻辑 (免填 Key)
 */
async function loadTmdbList(params = {}) {
  let listId = params.list_select;

  // 自定义解析：支持输入完整 URL 或 直接输入纯数字 ID
  if (listId === "custom") {
    const url = params.custom_url || "";
    const match = url.match(/\/list\/(\d+)/);
    if (match) {
      listId = match[1];
    } else if (/^\d+$/.test(url)) {
      listId = url; 
    } else {
      throw new Error("无效的 TMDB 片单链接或 ID");
    }
  }

  console.log(`[TMDB片单] 开始加载列表 ID: ${listId}`);

  try {
    // 🌟 核心杀手锏：直接调用 FW 内置的 tmdb.request，免去所有鉴权烦恼
    const res = await Widget.tmdb.request(`/list/${listId}`, { language: 'zh-CN' });
    
    // 兼容取值（有些版本返回外层包裹 data，有些直接返回 json）
    const items = res.items || (res.data && res.data.items) || [];
    
    if (!items || items.length === 0) {
      return [];
    }

    return items.map(item => {
      // 智能识别电影/电视剧
      const mediaType = item.media_type || (item.first_air_date ? "tv" : "movie");
      
      return {
        id: item.id.toString(),
        type: "tmdb",
        title: item.title || item.name,
        description: `⭐ 评分: ${item.vote_average} | 📅 上映: ${item.release_date || item.first_air_date}\n\n${item.overview}`,
        coverUrl: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "",
        posterPath: item.poster_path,
        backdropPath: item.backdrop_path,
        mediaType: mediaType,
        rating: item.vote_average,
        releaseDate: item.release_date || item.first_air_date
      };
    });

  } catch (error) {
    console.error("[TMDB片单] 请求失败:", error);
    throw error;
  }
}
