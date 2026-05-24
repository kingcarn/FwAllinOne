/**
 * 全球电视台与流媒体宇宙 (终极版)
 * 核心逻辑: 动态解除国家锁定，精准匹配全球三十多个流媒体与电视网 ID
 * 涵盖: 国内爱优腾芒、四大卫视、港台本土平台、韩国三大台、以及网飞/HBO等国际巨头
 */

var WidgetMetadata = {
    id: "kc_global_networks",
    title: "全球影视平台ALL IN ONE(From Makkapaka)",
    description: "全网最全的频道聚合：覆盖爱优腾、网飞、HBO、韩国tvN及各大卫视",
    author: "KingCarn",
    version: "1.2.5", 
    requiredVersion: "0.0.1",
    site: "NA",
    modules: [
        {
            title: "全网热播发现",
            functionName: "loadPlatformList",
            type: "video", // 🔑 魔法 1：外层模块为 video
            cacheDuration: 3600,
            params: [
                {
                    name: "provider", // 👈 魔法字段：把这70多个平台的选择提到右上角！
                    title: "选择频道/平台",
                    type: "enumeration",
                    value: "netflix",
                    enumOptions: [
                        { title: "🌟 全球综合热播", value: "all" },
                        { title: "🔴 Netflix (网飞)", value: "netflix" },
                        { title: "🟣 HBO", value: "hbo" },
                        { title: "🔵 Disney+ (迪士尼)", value: "disney" },
                        { title: "🍏 Apple TV+", value: "apple" },
                        { title: "📦 Amazon Prime", value: "amazon" },
                        { title: "🟢 Hulu", value: "hulu" },
                        { title: "🌟 Paramount+", value: "paramount" },
                        { title: "🐧 腾讯视频", value: "tencent" },
                        { title: "🥝 爱奇艺", value: "iqiyi" },
                        { title: "👖 优酷", value: "youku" },
                        { title: "🥭 芒果TV", value: "mango" },
                        { title: "📺 BiliBili", value: "bilibili" },
                        { title: "📡 湖南卫视", value: "hunan" },
                        { title: "📡 浙江卫视", value: "zhejiang" },
                        { title: "📡 东方卫视", value: "dragon" },
                        { title: "📡 CCTV-8", value: "cctv8" },
                        { title: "🇭🇰 ViuTV", value: "viutv" },
                        { title: "🇭🇰 TVB (无线电视)", value: "tvb" },
                        { title: "🇹🇼 LINE TV", value: "linetv" },
                        { title: "🇹🇼 Hami Video", value: "hami" },
                        { title: "🇹🇼 CATCHPLAY", value: "catchplay" },
                        { title: "🇰🇷 tvN", value: "tvn" },
                        { title: "🇰🇷 SBS", value: "sbs" },
                        { title: "🇰🇷 KBS2", value: "kbs2" },
                        { title: "🇺🇸 ABC", value: "abc" },
                        { title: "🌍 国家地理频道", value: "natgeo" }
                    ]
                },
                {
                    name: "sort_by",
                    title: "排序方式",
                    type: "enumeration",
                    value: "hot",
                    enumOptions: [
                        { title: "🔥 平台热度榜", value: "hot" },
                        { title: "🆕 最新上线榜", value: "new" },
                        { title: "🏆 TMDB 高分榜", value: "top" },
                        { title: "↑ 时间倒序", value: "time_desc" },
                        { title: "↓ 时间正序", value: "time_asc" }
                    ]
                },
                { name: "page", title: "页码", type: "page", startPage: 1 }
            ]
        }
    ]
};

// ================= 1. 核心映射配置 (全球ID库) =================

const PLATFORM_MAP = {
    netflix: { network: "213", provider: "8", region: "US", name: "Netflix" },
    hbo:     { network: "49|3186", provider: "118", region: "US", name: "HBO" },
    disney:  { network: "2739", provider: "337", region: "US", name: "Disney+" },
    apple:   { network: "2552", provider: "350", region: "US", name: "Apple TV+" },
    amazon:  { network: "1024", provider: "119", region: "US", name: "Amazon" },
    hulu:    { network: "453",  provider: "15",  region: "US", name: "Hulu" },
    paramount:{ network: "4330",provider: "531", region: "US", name: "Paramount+" },
    tencent: { network: "2007|3353", provider: "138", region: "CN", name: "腾讯" },
    iqiyi:   { network: "1330", provider: "238", region: "CN", name: "爱奇艺" },
    youku:   { network: "1419", provider: "331", region: "CN", name: "优酷" },
    mango:   { network: "1631", provider: "1944", region: "CN", name: "芒果" },
    bilibili:{ network: "1605", provider: "2280", region: "CN", name: "B站" },
    hunan:   { network: "952", provider: null, region: "CN", name: "湖南卫视" },
    zhejiang:{ network: "989", provider: null, region: "CN", name: "浙江卫视" },
    dragon:  { network: "1056", provider: null, region: "CN", name: "东方卫视" },
    cctv8:   { network: "521", provider: null, region: "CN", name: "CCTV-8" },
    viutv:   { network: "2146", provider: null, region: "HK", name: "ViuTV" },
    linetv:  { network: "1671", provider: null, region: "TW", name: "LINE TV" },
    hami:    { network: "4571", provider: null, region: "TW", name: "Hami" },
    catchplay:{ network: "5002", provider: null, region: "TW", name: "CATCHPLAY" },
    tvn:     { network: "866", provider: null, region: "KR", name: "tvN" },
    sbs:     { network: "156", provider: null, region: "KR", name: "SBS" },
    kbs2:    { network: "342", provider: null, region: "KR", name: "KBS2" },
    abc:     { network: "2", provider: null, region: "US", name: "ABC" },
    natgeo:  { network: "43", provider: null, region: "US", name: "国家地理" },
    tvb:     { network: "193", provider: "553", region: "HK", name: "TVB" },
    all:     { network: null, provider: null, region: null, name: "综合" }
};

const GENRE_MAP = {
    28: "动作", 12: "冒险", 16: "动画", 35: "喜剧", 80: "犯罪", 99: "纪录片",
    18: "剧情", 10751: "家庭", 14: "奇幻", 36: "历史", 27: "恐怖", 10402: "音乐",
    9648: "悬疑", 10749: "爱情", 878: "科幻", 10770: "电视电影", 53: "惊悚",
    10752: "战争", 37: "西部", 10759: "动作冒险", 10764: "真人秀", 10767: "脱口秀"
};

function getGenreText(ids) {
    if (!ids || !Array.isArray(ids)) return "影视";
    const genres = ids.map(id => GENRE_MAP[id]).filter(Boolean);
    return genres.length > 0 ? genres.slice(0, 2).join(" / ") : "影视";
}

function buildItem(item, isMovie, platformName) {
    if (!item) return null;
    
    const mediaType = isMovie ? "movie" : "tv";
    const title = item.title || item.name;
    const releaseDate = item.release_date || item.first_air_date || "";
    const score = item.vote_average ? item.vote_average.toFixed(1) : "0.0";
    const genreText = getGenreText(item.genre_ids);
    
    let typeTag = isMovie ? "🎬" : "📺";
    if (item.genre_ids?.includes(16)) typeTag = "🐰";
    if (item.genre_ids?.includes(10764) || item.genre_ids?.includes(10767)) typeTag = "🎤";

    return {
        id: String(item.id),
        tmdbId: parseInt(item.id),
        type: "tmdb", // 🔑 魔法 2：内层项目为 tmdb 类型，完全适配框架逻辑
        mediaType: mediaType,
        title: title,
        
        genreTitle: genreText, 
        
        // 🔑 魔法 3：竖版下这行显示在副标题位置
        description: `${typeTag} ${platformName} | ⭐ ${score}`, 
        
        // 传给内核的日期，横版排版会自动提年份
        releaseDate: releaseDate, 
        
        // 🔑 魔法 4：彻底抛弃 coverUrl，严格使用 posterPath 和 backdropPath
        posterPath: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "",
        backdropPath: item.backdrop_path ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}` : "",
        
        rating: score
    };
}

// ================= 2. 核心请求逻辑 =================

/**
 * 构建 TMDB discover 查询参数（通用）
 */
function buildQueryParamsForCategory(category, page, endpointType) {
    const today = new Date().toISOString().split('T')[0];
    const isMovie = (endpointType === "movie");

    const qp = {
        language: "zh-CN",
        page: page
    };

    if (category === "hot") {
        qp.sort_by = "popularity.desc";
        qp["vote_count.gte"] = 2;
    } else if (category === "new") {
        qp.sort_by = isMovie ? "primary_release_date.desc" : "first_air_date.desc";
        if (isMovie) {
            qp["primary_release_date.lte"] = today;
        } else {
            qp["first_air_date.lte"] = today;
        }
    } else if (category === "top") {
        qp.sort_by = "vote_average.desc";
        qp["vote_count.gte"] = 30;
    } else if (category === "time_desc") {
        qp.sort_by = isMovie ? "primary_release_date.desc" : "first_air_date.desc";
    } else if (category === "time_asc") {
        qp.sort_by = isMovie ? "primary_release_date.asc" : "first_air_date.asc";
    }

    return qp;
}

/**
 * 从 TMDB 获取某个端点的数据
 */
async function fetchFromEndpoint(endpointType, category, page, platformKey) {
    const platformConfig = PLATFORM_MAP[platformKey];
    const endpoint = endpointType === "movie" ? "/discover/movie" : "/discover/tv";
    const qp = buildQueryParamsForCategory(category, page, endpointType);

    if (platformKey !== "all" && platformConfig) {
        if (endpointType === "movie" && platformConfig.provider) {
            qp.with_watch_providers = platformConfig.provider;
            qp.watch_region = platformConfig.region || "US";
        } else if (endpointType === "tv" && platformConfig.network) {
            qp.with_networks = platformConfig.network;
        }
    }

    const res = await Widget.tmdb.get(endpoint, { params: qp });
    return (res.results || []).map(i => buildItem(i, endpointType === "movie", platformConfig?.name || "综合")).filter(Boolean);
}

/**
 * loadPlatformList — 模块入口
 * 移除 mediaType 选择，默认请求所有类型（电影+剧集）。
 * 排序参数直接通过 sort_by 传给 TMDB API，不在本地二次排序。
 */
async function loadPlatformList(params) {
    const platform = params.provider || "netflix";
    const category = params.sort_by || "hot";
    const page = parseInt(params.page) || 1;
    const platformConfig = PLATFORM_MAP[platform];

    try {
        let items = [];

        if (platform === "all") {
            // 全球综合：同时查电影和剧集
            const [movies, tvs] = await Promise.all([
                fetchFromEndpoint("movie", category, page, "all"),
                fetchFromEndpoint("tv", category, page, "all")
            ]);
            items = [...movies, ...tvs];
        } else {
            const canFetchMovie = !!platformConfig?.provider;
            const canFetchTv    = !!platformConfig?.network;

            if (canFetchMovie && canFetchTv) {
                const [movies, tvs] = await Promise.all([
                    fetchFromEndpoint("movie", category, page, platform),
                    fetchFromEndpoint("tv", category, page, platform)
                ]);
                items = [...movies, ...tvs];
            } else if (canFetchTv) {
                items = await fetchFromEndpoint("tv", category, page, platform);
            } else if (canFetchMovie) {
                items = await fetchFromEndpoint("movie", category, page, platform);
            }
        }

        if (items.length === 0) {
            return [{ id: "empty", type: "text", title: "无数据",
                description: `在 [${platformConfig?.name || platform}] 暂未找到符合该条件的影视记录` }];
        }

        return items;

    } catch (error) {
        return [{ id: "error", type: "text", title: "网络异常", description: "请求失败，请重试" }];
    }
}

