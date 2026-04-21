/**
 * 骨朵全网影视热度榜
 * 数据源: 每日自动抓取自骨朵数据，并经 TMDB 洗库
 */
WidgetMetadata = {
  id: "guduo_hot_list",
  title: "骨朵全网热度榜",
  description: "每日更新的剧集、动漫、综艺、电影全网热度排行",
  author: "MakkaPakka",
  version: "1.0.0",
  requiredVersion: "0.0.1", // 兼容基础版本
  modules: [
    {
      title: "骨朵热榜",
      description: "查看每日各大平台影视热度榜",
      functionName: "loadGuduoRank",
      requiresWebView: false,
      cacheDuration: 3600 * 6, // 缓存 6 小时 (GitHub Actions 每天跑两次，缓存时间适中即可)
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
    }
  ]
};

/**
 * 获取并解析 GitHub Raw JSON 数据
 */
async function loadGuduoRank(params = {}) {
  try {
    const { category = "剧集" } = params;
    
    // GitHub Raw URL (加一个随机数时间戳防止 GitHub 强缓存)
    const baseUrl = "https://raw.githubusercontent.com/MakkaPakka518/List/refs/heads/main/data/guduo-hot.json";
    const url = `${baseUrl}?t=${Math.floor(Date.now() / 3600000)}`; // 按小时变动时间戳

    console.log(`[骨朵榜单] 开始加载: ${category}`);
    
    const response = await Widget.http.get(url, { decodable: true });
    
    // 安全解析 JSON (防止返回纯文本格式)
    let data;
    if (typeof response.data === "string") {
      try {
        data = JSON.parse(response.data);
      } catch (e) {
        console.error("[骨朵榜单] JSON 解析失败:", e);
        data = {};
      }
    } else {
      data = response.data;
    }

    // 校验数据结构
    if (!data || !data.categories || !data.categories[category]) {
      console.error(`[骨朵榜单] 数据源中未找到分类: ${category}`);
      return [];
    }

    const items = data.categories[category];
    const results = [];

    // 遍历数据并转为 Forward 认识的 VideoItem 格式
    for (const item of items) {
      // 拼接 TMDB 的高清海报前缀
      const coverUrl = item.posterPath 
        ? `https://image.tmdb.org/t/p/w500${item.posterPath}` 
        : "";

      results.push({
        id: item.tmdbId ? item.tmdbId.toString() : item.title,
        type: "tmdb", // 🌟 核心：直接抛给 Forward 内置的 TMDB 详情处理器
        
        // 在标题前加上排名字段，直观显示 TOP 名次
        title: `${item.rank}. ${item.tmdbTitle || item.title}`,
        
        // 简介区展示骨朵独家热度指数
        description: `🔥 骨朵热度: ${item.heat} | 评分: ${item.rating}\n\n${item.overview}`,
        
        // 媒体信息
        coverUrl: coverUrl,
        posterPath: item.posterPath,
        releaseDate: item.releaseDate,
        mediaType: item.mediaType,
        rating: item.rating,
        genreTitle: item.genreTitle || category
      });
    }

    console.log(`[骨朵榜单] 成功加载 ${results.length} 条数据`);
    return results;

  } catch (error) {
    console.error("[骨朵榜单] 请求发生错误:", error);
    throw error;
  }
}
