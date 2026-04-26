/**
 * 骨朵热榜 + 玛卡巴卡私藏片单 (基于 HTML 解析引擎)
 */
WidgetMetadata = {
  id: "makkapakka_all_in_otne",
  title: "玛卡巴卡影视库",
  description: "聚合骨朵全网热度榜与 TMDB 网页解析版片单",
  author: "MakkaPakka",
  version: "1.3.0",
  requiredVersion: "0.0.1",
  modules: [
    {
      title: "骨朵热榜",
      description: "查看每日各大平台影视热度榜",
      functionName: "loadGuduoRank",
      cacheDuration: 3600 * 6,
      params: [
        {
          name: "category",
          title: "榜单分类",
          type: "enumeration",
          value: "剧集",
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
      description: "同步解析 TMDB 官网片单",
      functionName: "loadTmdbList",
      cacheDuration: 3600 * 2, // 网页抓取可以适当缩短缓存
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
          placeholder: "粘贴 TMDB 片单链接",
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
 * [模块1] 骨朵排行榜逻辑 (保持不变)
 */
async function loadGuduoRank(params = {}) {
  try {
    const { category = "剧集" } = params;
    const baseUrl = "https://raw.githubusercontent.com/MakkaPakka518/List/refs/heads/main/data/guduo-hot.json";
    const url = `${baseUrl}?t=${Math.floor(Date.now() / 3600000)}`;

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
      results.push({
        id: item.tmdbId ? item.tmdbId.toString() : item.title,
        type: "tmdb", 
        title: item.tmdbTitle || item.title,
        description: `🏆 TOP ${item.rank} | 🔥 热度: ${item.heat} | 评分: ${item.rating}\n\n${item.overview || ''}`,
        coverUrl: item.posterPath ? `https://image.tmdb.org/t/p/w500${item.posterPath}` : undefined,
        posterPath: item.posterPath,
        mediaType: item.mediaType,
      });
    }
    return results;
  } catch (error) {
    throw error;
  }
}

/**
 * [模块2] 借鉴 TMDB.js 的神仙网页解析逻辑
 */
async function loadTmdbList(params = {}) {
  let listSelect = params.list_select;
  let url = "";

  // 1. 构造 TMDB 网页 URL
  if (listSelect === "custom") {
    url = params.custom_url || "";
  } else {
    url = `https://www.themoviedb.org/list/${listSelect}`;
  }

  // 2. 核心：强制追加 ?view=grid 以保证 HTML 结构是网格模式
  if (!url.includes("view=grid")) {
    url = url.includes("?") ? `${url}&view=grid` : `${url}?view=grid`;
  }

  console.log("[TMDB片单] 开始抓取网页:", url);

  try {
    // 3. 模拟浏览器请求网页源码
    const response = await Widget.http.get(url, {
      headers: {
        Referer: "https://www.themoviedb.org/",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
      }
    });

    if (!response || !response.data) {
      throw new Error("获取片单网页失败");
    }

    // 4. 解析 HTML DOM
    const $ = Widget.html.load(response.data);
    if (!$ || $ === null) {
      throw new Error("解析 HTML 失败");
    }

    // 5. 提取每部电影/剧集的 a 标签链接
    const coverElements = $(".block.aspect-poster");
    let tmdbIds = [];

    for (const itemId of coverElements) {
      const $item = $(itemId);
      const link = $item.attr("href"); // 例如: /movie/12345-title
      if (!link) continue;

      // 用正则匹配出类型 (movie/tv) 和 纯数字 ID
      const match = link.match(/^\/(movie|tv)\/([^\/-]+)-/);
      const type = match?.[1];
      const id = match?.[2];

      if (id && type) {
        // 🌟 将 type 和 id 拼接为 Forward 识别的终极格式: { id: "movie.123", type: "tmdb" }
        tmdbIds.push({ 
          id: `${type}.${id}`, 
          type: "tmdb" 
        });
      }
    }

    console.log(`[TMDB片单] 成功提取 ${tmdbIds.length} 条记录`);
    return tmdbIds;

  } catch (error) {
    console.error("[TMDB片单] 解析失败:", error);
    throw error;
  }
}
