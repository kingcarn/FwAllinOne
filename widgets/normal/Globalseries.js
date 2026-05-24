/**
 * 全球万能影视专区
 * 核心逻辑: 利用 TMDB discover 接口，动态切换制片国家/地区和语言
 * 支持：大陆、港台、欧美、日韩、拉美等十几个国家地区的影剧分类与混合排序
 */

WidgetMetadata = {
    id: "kingcarn's own gloabl seriers",
    title: "KC's 全球影视专区",
    description: "自由切换全球十几个国家与地区，探索纯正的本土电影与剧集",
    author: "KingCarn",
    version: "2.2.0", // 🚀 新增模块3：TMDB播出平台（Watch Provider）
    requiredVersion: "0.0.1",
    modules: [
        // ================= 模块 1：全球探索发现 =================
        {
            title: "🌍 全球探索发现",
            functionName: "loadGlobalList",
            type: "video", // 保留你需要的自适应排版
            cacheDuration: 3600,
            params: [
                {
                    name: "region",
                    title: "选择国家/地区",
                    type: "enumeration",
                    value: "CN",
                    enumOptions: [
                        { title: "🇨🇳 大陆 (Mainland China)", value: "CN" },
                        { title: "🇭🇰 香港 (Hong Kong)", value: "HK" },
                        { title: "🇹🇼 台湾 (Taiwan)", value: "TW" },
                        { title: "🇺🇸 美国 (United States)", value: "US" },
                        { title: "🇬🇧 英国 (United Kingdom)", value: "GB" },
                        { title: "🇯🇵 日本 (Japan)", value: "JP" },
                        { title: "🇰🇷 韩国 (South Korea)", value: "KR" },
                        { title: "🇪🇺 欧洲综合 (法/德/意/荷)", value: "EU" },
                        { title: "💃 西语世界 (西班牙/拉美)", value: "ES_LANG" },
                        { title: "🇲🇽 墨西哥 (Mexico)", value: "MX" },
                        { title: "🇸🇪 瑞典 (Sweden)", value: "SE" },
                        { title: "🇮🇳 印度 (India)", value: "IN" },
                        { title: "🇹🇭 泰国 (Thailand)", value: "TH" }
                    ]
                },
                {
                    name: "mediaType",
                    title: "影视类型",
                    type: "enumeration",
                    value: "all",
                    enumOptions: [
                        { title: "🌟 全部 (影+剧混合)", value: "all" },
                        { title: "🎬 仅看电影 (Movie)", value: "movie" },
                        { title: "📺 仅看剧集 (TV)", value: "tv" }
                    ]
                },
                {
                    // 👉 关键修复：改为 sort_by
                    name: "sort_by",
                    title: "排序榜单",
                    type: "enumeration",
                    value: "hot",
                    enumOptions: [
                        { title: "🔥 近期热播榜", value: "hot" },
                        { title: "🆕 最新上线榜", value: "new" },
                        { title: "🏆 历史高分榜", value: "top" }
                    ]
                },
                { name: "page", title: "页码", type: "page", startPage: 1 }
            ]
        },
        // ================= 模块 2：高级类型榜单 =================
        {
            title: "🏷️ 高级类型榜单",
            functionName: "loadGenreRank",
            type: "video", // 保留你需要的自适应排版
            cacheDuration: 3600,
            params: [
                {
                    name: "mediaType",
                    title: "影视类型",
                    type: "enumeration",
                    value: "movie",
                    enumOptions: [
                        { title: "🎬 电影 (Movie)", value: "movie" },
                        { title: "📺 电视剧 (TV)", value: "tv" }
                    ]
                },
                {
                    name: "genre",
                    title: "题材流派",
                    type: "enumeration",
                    value: "scifi",
                    enumOptions: [
                        { title: "🌈 全部 (All)", value: "all" },
                        { title: "🛸 科幻 (Sci-Fi)", value: "scifi" },
                        { title: "🔍 悬疑 (Mystery)", value: "mystery" },
                        { title: "👻 恐怖 (Horror)", value: "horror" },
                        { title: "🔪 犯罪 (Crime)", value: "crime" },
                        { title: "💥 动作 (Action)", value: "action" },
                        { title: "😂 喜剧 (Comedy)", value: "comedy" },
                        { title: "❤️ 爱情 (Romance)", value: "romance" },
                        { title: "🎭 剧情 (Drama)", value: "drama" },
                        { title: "🐉 奇幻 (Fantasy)", value: "fantasy" },
                        { title: "🎨 动画 (Animation)", value: "animation" },
                        { title: "🎥 纪录片 (Documentary)", value: "documentary" },
                        { title: "冒险 (Adventure)", value: "adventure" },
                        { title: "历史/真人秀 (History moive/Show TV)", value: "history" },
                        { title: "战争 (War)", value: "war" },
						{ title: "音乐 (Music)", value: "music" },
                        { title: "家庭 (Family)", value: "family" }
                    ]
                },
		        {
		            name: "region",
		            title: "国家/地区",
		            type: "enumeration",
		            value: "all",
		            enumOptions: [
		                { title: "🌍 全部地区", value: "all" },
		                { title: "🇨🇳 中国大陆", value: "cn" },
		                { title: "🏮 港台地区", value: "hktw" },
		                { title: "🇯🇵 日本", value: "jp" },
		                { title: "🇰🇷 韩国", value: "kr" },
		                { title: "🇮🇳 印度", value: "in" },
		                { title: "🌏 其他亚太地区", value: "apac2" },
		                { title: "🌎 欧美", value: "usgb" }
		            ]
		        },
                {
                    // 👉 关键修复：改为 sort_by
                    name: "sort_by",
                    title: "排序规则",
                    type: "enumeration",
                    value: "popularity",
                    enumOptions: [
                        { title: "🔥 热门趋势", value: "popularity" },
                        { title: "⭐ 评分最高", value: "rating" },
                        { title: "↑ 时间倒序", value: "time_desc" },
						{ title: "↓ 时间正序", value: "time_asc" },
        				{ title: "🌟 近期热门", value: "recent_hot" } 
                    ]
                },
                { name: "page", title: "页码", type: "page", startPage: 1 }
            ]
        },
        // ================= 模块 3：TMDB播出平台 =================
        {
            title: "📺 TMDB播出平台",
            functionName: "loadWatchProviderList",
            type: "video",
            cacheDuration: 3600,
            params: [
                {
                    name: "mediaType",
                    title: "影视类型",
                    type: "enumeration",
                    value: "all",
                    enumOptions: [
                        { title: "🌟 全部 (影+剧)", value: "all" },
                        { title: "🎬 电影 (Movie)", value: "movie" },
                        { title: "📺 电视剧 (TV)", value: "tv" }
                    ]
                },
                {
                    name: "provider",
                    title: "播出平台",
                    type: "enumeration",
                    value: "netflix",
                    enumOptions: [
                        { title: "🎬 Netflix", value: "netflix" },
                        { title: "✨ Disney+", value: "disney" },
                        { title: "🔴 HBO Max", value: "hbo" },
                        { title: "📦 Prime Video", value: "prime" },
                        { title: "🍎 Apple TV+", value: "apple" },
                        { title: "🟢 Hulu", value: "hulu" },
                        { title: "🌟 Paramount+", value: "paramount" },
                        { title: "🟦 腾讯视频", value: "tencent" },
                        { title: "🟢 爱奇艺", value: "iqiyi" },
                        { title: "🅱️ Bilibili", value: "bilibili" },
                        { title: "🥭 芒果TV", value: "mango" },
                        { title: "🔵 优酷", value: "youku" },
                        { title: "📺 TVB (无线电视)", value: "tvb" }
                    ]
                },
                {
                    name: "sort_by",
                    title: "排序规则",
                    type: "enumeration",
                    value: "popularity",
                    enumOptions: [
                        { title: "🔥 热门趋势", value: "popularity" },
                        { title: "⭐ 评分最高", value: "rating" },
                        { title: "↑ 时间倒序", value: "time_desc" },
                        { title: "↓ 时间正序", value: "time_asc" },
                        { title: "🌟 近期热门", value: "recent_hot" }
                    ]
                },
                { name: "page", title: "页码", type: "page", startPage: 1 }
            ]
        }
    ]
};

// =========================================================================
// 2. 模块 1 专属逻辑 (全球探索发现)
// =========================================================================

const GLOBAL_GENRE_MAP = {
    28: "动作", 12: "冒险", 16: "动画", 35: "喜剧", 80: "犯罪", 99: "纪录片",
    18: "剧情", 10751: "家庭", 14: "奇幻", 36: "历史", 27: "恐怖", 10402: "音乐",
    9648: "悬疑", 10749: "爱情", 878: "科幻", 10770: "电视电影", 53: "惊悚",
    10752: "战争", 37: "西部", 10759: "动作冒险"
};

function getGenreText(ids) {
    if (!ids || !Array.isArray(ids)) return "";
    return ids.map(id => GLOBAL_GENRE_MAP[id]).filter(Boolean).slice(0, 3).join(" / ");
}

function buildItem(item, forceMediaType) {
    if (!item) return null;
    
    const mediaType = forceMediaType || item.media_type || (item.title ? "movie" : "tv");
    const title = item.title || item.name;
    const releaseDate = item.release_date || item.first_air_date || "";
    const score = item.vote_average ? item.vote_average.toFixed(1) : "暂无";
    const genreText = getGenreText(item.genre_ids) || "影视";
    
    const typeTag = mediaType === "movie" ? "🎬电影" : "📺剧集";

    return {
        id: String(item.id),
        tmdbId: parseInt(item.id),
        type: "tmdb", 
        mediaType: mediaType,
        title: title,
        releaseDate: releaseDate, 
        genreTitle: genreText,    
        subTitle: "",            
        posterPath: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "", 
        backdropPath: item.backdrop_path ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}` : "", 
        description: `${typeTag} | ⭐ ${score}\n${item.overview || "暂无简介"}`,
        rating: item.vote_average || 0,
        _popularity: item.popularity || 0,
        _date: releaseDate || "1970-01-01"
    };
}

async function fetchFromTmdb(endpoint, sort_by, page, regionKey) { // 👉 改为 sort_by
    const today = new Date().toISOString().split('T')[0];
    
    let queryParams = {
        language: "zh-CN",
        page: page
    };

    if (regionKey === "ES_LANG") {
        queryParams.with_original_language = "es";
    } else if (regionKey === "EU") {
        queryParams.with_origin_country = "FR|DE|IT|NL|DK|NO|FI"; 
    } else {
        queryParams.with_origin_country = regionKey;
    }

    const isMovie = endpoint.includes("movie");

    if (sort_by === "hot") { // 👉 改为 sort_by
        queryParams.sort_by = "popularity.desc";
        queryParams["vote_count.gte"] = 5; 
    } 
    else if (sort_by === "new") { // 👉 改为 sort_by
        queryParams.sort_by = isMovie ? "primary_release_date.desc" : "first_air_date.desc";
        if (isMovie) {
            queryParams["primary_release_date.lte"] = today;
        } else {
            queryParams["first_air_date.lte"] = today;
        }
        queryParams["vote_count.gte"] = 1;
    } 
    else if (sort_by === "top") { // 👉 改为 sort_by
        queryParams.sort_by = "vote_average.desc";
        queryParams["vote_count.gte"] = isMovie ? 50 : 20; 
    }

    const res = await Widget.tmdb.get(endpoint, { params: queryParams });
    const mediaType = isMovie ? "movie" : "tv";
    return (res.results || []).map(i => buildItem(i, mediaType)).filter(Boolean);
}

async function loadGlobalList(params) {
    const region = params.region || "CN";
    const mediaType = params.mediaType || "all";
    const sort_by = params.sort_by || "hot"; // 👉 改为 sort_by
    const page = parseInt(params.page) || 1;

    try {
        let items = [];

        if (mediaType === "all") {
            const [movies, tvs] = await Promise.all([
                fetchFromTmdb("/discover/movie", sort_by, page, region),
                fetchFromTmdb("/discover/tv", sort_by, page, region)
            ]);
            
            items = [...movies, ...tvs];

            items.sort((a, b) => {
                if (sort_by === "hot") { // 👉 改为 sort_by
                    return b._popularity - a._popularity; 
                } else if (sort_by === "new") { // 👉 改为 sort_by
                    return new Date(b._date) - new Date(a._date); 
                } else if (sort_by === "top") { // 👉 改为 sort_by
                    return b.rating - a.rating; 
                }
                return 0;
            });
            
            items = items.slice(0, 20);

        } else {
            const endpoint = mediaType === "movie" ? "/discover/movie" : "/discover/tv";
            items = await fetchFromTmdb(endpoint, sort_by, page, region);
        }

        if (items.length === 0) {
             return page === 1 ? [{ id: "empty", type: "text", title: "无数据", description: "该区域下暂无满足条件的影片" }] : [];
        }

        return items;

    } catch (error) {
        console.error("数据请求异常:", error);
        return [{ id: "error", type: "text", title: "网络异常", description: "请下拉刷新重试" }];
    }
}

// =========================================================================
// 3. 模块 2 专属逻辑 (高级类型榜单)
// =========================================================================

const ADVANCED_GENRE_MAP = {
    "scifi": { movie: "878", tv: "10765" },       
    "mystery": { movie: "9648", tv: "9648" },
    "horror": { movie: "27", tv: "27" },          
    "crime": { movie: "80", tv: "80" },
    "action": { movie: "28", tv: "10759" },       
    "comedy": { movie: "35", tv: "35" },
    "romance": { movie: "10749", tv: "10749" },   
    "drama": { movie: "18", tv: "18" },
    "fantasy": { movie: "14", tv: "10765" },      
    "animation": { movie: "16", tv: "16" },
    "documentary": { movie: "99", tv: "99" },
    "adventure": { movie: "12", tv: "10759" },
    "war": { movie: "10752", tv: "10768" },
    "history": { movie: "36", tv: "36" },
	"music": { movie: "10402", tv: "10402" },
    "family": { movie: "10751", tv: "10751" }
};

const REGION_MAP = {
    "all": "",
    "cn": "CN",
    "hktw": "HK|TW",
    "jp": "JP",
    "kr": "KR",
    "in": "IN",
    "apac2": "SG|MY|TH|PH|VN|ID",
    "usgb": "US|GB|FR|DE|IT|ES|SE|NO|FI|NL|BE|CH|AT|IE"
};

async function loadGenreRank(params = {}) {
    const page = parseInt(params.page) || 1;
    const { mediaType = "movie", genre = "scifi", region = "all", sort_by = "popularity" } = params;

    let genreId = "";
    if (genre !== "all") genreId = ADVANCED_GENRE_MAP[genre] ? ADVANCED_GENRE_MAP[genre][mediaType] : "";
    const originCountry = REGION_MAP[region] || "";

    let tmdbSortBy = "popularity.desc";
    if (sort_by === "rating") tmdbSortBy = "vote_average.desc";
    else if (sort_by === "time_desc") tmdbSortBy = mediaType === "movie" ? "primary_release_date.desc" : "first_air_date.desc";
    else if (sort_by === "time_asc") tmdbSortBy = mediaType === "movie" ? "primary_release_date.asc" : "first_air_date.asc";
    // recent_hot 默认先用流行趋势倒序

    const queryParams = {
        language: "zh-CN",
        page: page,
        sort_by: tmdbSortBy,
        include_adult: false,
        include_video: false
    };

    if (genreId) queryParams.with_genres = genreId;
    if (originCountry) queryParams.with_origin_country = originCountry;
    // 主流宽松
    queryParams["vote_count.gte"] = sort_by === "rating" ? 10 : 3;

    // 时间筛选逻辑 for recent_hot
    let minYear = (new Date()).getFullYear() - 2; // 取近2年
    let dateFloor = `${minYear}-01-01`;

    if (sort_by === "time_desc" || sort_by === "time_asc" || sort_by === "recent_hot") {
        const today = new Date();
        today.setMonth(today.getMonth() + 1);
        const maxDate = today.toISOString().split('T')[0];
        if (mediaType === "movie") {
            queryParams["primary_release_date.lte"] = maxDate;
            if (sort_by === "recent_hot") queryParams["primary_release_date.gte"] = dateFloor;
        } else {
            queryParams["first_air_date.lte"] = maxDate;
            if (sort_by === "recent_hot") queryParams["first_air_date.gte"] = dateFloor;
        }
    }

    try {
       // 对于recent_hot，我们需要获取更多数据来进行本地排序
       // 但为了支持分页，我们可以每页获取后单独排序，或者调整策略
       // 这里采用每页获取40条（TMDB最大每页20条，所以需要获取2页？但API不支持）
       // 更好的方案：仍然使用标准分页，但在每页内进行本地重排序
       const res = await Widget.tmdb.get(`/discover/${mediaType}`, { params: queryParams });
       let items = res.results || [];

       // --- recent_hot贝叶斯排序 ---
       if (sort_by === "recent_hot") {
           // 对于recent_hot，我们需要保持分页能力
           // 但为了排序的准确性，可以获取更多数据（但会牺牲性能）
           // 这里我们保持原有逻辑，但移除强制page=1的限制
           

           if (items.length > 0) {
               // 求出热门/评分最大/年份最大、最小做归一化
               let maxPop = Math.max(...items.map(i => i.popularity || 0));
               let minPop = Math.min(...items.map(i => i.popularity || 0));
               let maxScore = Math.max(...items.map(i => i.vote_average || 0));
               let minScore = Math.min(...items.map(i => i.vote_average || 0));
               let maxYear = Math.max(...items.map(i => {
                   let date = i.release_date || i.first_air_date || "";
                   return date ? Number(date.slice(0, 4)) : minYear;
               }));

               // 计算综合分并排序
               items.forEach(i => {
                   // 1. 热门分归一化(0~1)
                   let popNorm = maxPop > minPop ? (i.popularity - minPop) / (maxPop - minPop) : 0;
                   // 2. 评分分归一化(0~1)
                   let scoreNorm = maxScore > minScore ? (i.vote_average - minScore) / (maxScore - minScore) : 0;
                   // 3. 年份分归一化(新更高)
                   let year = 0;
                   let date = i.release_date || i.first_air_date || "";
                   if (date) year = Number(date.slice(0, 4));
                   let yearNorm = maxYear > minYear ? (year - minYear) / (maxYear - minYear) : 0;

                   // 贝叶斯加权综合分（调节权重）
                   i._recent_hot_weight = 0.3 * popNorm + 0.15 * scoreNorm + 0.55 * yearNorm;
               });
               
               // 在当前页内按综合分排序
               items.sort((a, b) => b._recent_hot_weight - a._recent_hot_weight);
           }
        }

        if (items.length === 0) {
            return page === 1 ? [{ id: "empty", type: "text", title: "未找到符合条件的影视", description: "请尝试更换国家或类型" }] : [];
        }

        return items.map(item => {
            const date = item.release_date || item.first_air_date || "";
            const year = date ? date.substring(0, 4) : "未知";
            const score = item.vote_average ? item.vote_average.toFixed(1) : "暂无评分";
            return {
                id: String(item.id),
                tmdbId: parseInt(item.id),
                type: "tmdb",
                mediaType: mediaType,
                title: item.title || item.name,
                subTitle: `⭐ ${score} | ${year}`,
                description: `${date} · ⭐ ${score}\n${item.overview || "暂无简介"}`,
                releaseDate: date,
                year: year,
                posterPath: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "",
                backdropPath: item.backdrop_path ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}` : "",
                rating: parseFloat(score) || 0
            };
        });

    } catch (error) {
        console.error("加载榜单失败:", error);
        return [{ id: "err", type: "text", title: "加载失败", description: "网络连接异常，请重试" }];
    }
}

// =========================================================================
// 4. 模块 3 专属逻辑 (TMDB播出平台)
// =========================================================================

/**
 * TMDB 播出平台发现模块
 *
 * 根据选定的播出平台（Netflix/Disney+/腾讯视频/爱奇艺等），
 * 从 TMDB Discover 接口检索该平台上可播放的媒体清单。
 *
 * 依赖 TMDB Watch Provider 系统：
 *   - watch_region: 根据平台自动匹配（如 US/CN/HK）
 *   - with_watch_providers: 平台对应的 TMDB provider_id
 *   - with_watch_monetization_types: 固定为 flatrate（订阅）
 *
 * 排序规则与模块2保持一致
 */

/**
 * 平台 → TMDB Provider ID 映射（含对应 watch_region）
 *
 * TMDB Watch Provider IDs 会随数据库更新而变化。
 * 以下为 2025/2026 年较新的 ID 映射，与自动代码/旧版不一致时以 TMDB API 返回为准。
 * 参考：https://api.themoviedb.org/3/watch/providers/{movie|tv}?language=zh-CN&watch_region={region}
 */
const PROVIDER_MAP = {
    netflix:   { id: 213, region: "US", label: "Netflix" },
    disney:    { id: 2739,region: "US", label: "Disney+" },
    hbo:       { id: 1899,region: "US", label: "Max (HBO)" },
    prime:     { id: 119, region: "US", label: "Prime Video" },
    apple:     { id: 2552,region: "US", label: "Apple TV+" },
    hulu:      { id: 15,  region: "US", label: "Hulu" },
    paramount: { id: 531, region: "US", label: "Paramount+" },
    tencent:   { id: 283, region: "CN", label: "\u817e\u8baf\u89c6\u9891" },
    iqiyi:     { id: 71,  region: "CN", label: "\u7231\u5947\u827a" },
    bilibili:  { id: 72,  region: "CN", label: "Bilibili" },
    mango:     { id: 2930,region: "CN", label: "\u8292\u679cTV" },
    youku:     { id: 197, region: "CN", label: "\u4f18\u9177" },
    tvb:       { id: 370, region: "HK", label: "TVB" }
};

/**
 * 构建 TMDB discover 查询参数
 */
function buildProviderQuery(mediaType, sort_by, page, providerKey) {
    const provider = PROVIDER_MAP[providerKey];
    if (!provider) return null;

    let tmdbSortBy = "popularity.desc";
    if (sort_by === "rating") tmdbSortBy = "vote_average.desc";
    else if (sort_by === "time_desc") tmdbSortBy = mediaType === "movie" ? "primary_release_date.desc" : "first_air_date.desc";
    else if (sort_by === "time_asc") tmdbSortBy = mediaType === "movie" ? "primary_release_date.asc" : "first_air_date.asc";

    const queryParams = {
        language: "zh-CN",
        page: page,
        sort_by: tmdbSortBy,
        include_adult: false,
        include_video: false,
        watch_region: provider.region,
        with_watch_providers: String(provider.id),
        // 用多种付费类型覆盖——不同平台在不同地区的可用类型不同
        // flatrate=订阅 buy=购买 rent=租赁 free=免费 ads=广告
        with_watch_monetization_types: "flatrate|ads|free|rent"
    };

    queryParams["vote_count.gte"] = sort_by === "rating" ? 10 : 3;

    // 时间筛选
    const minYear = (new Date()).getFullYear() - 2;
    const dateFloor = `${minYear}-01-01`;
    const today = new Date();
    today.setMonth(today.getMonth() + 1);
    const maxDate = today.toISOString().split('T')[0];

    if (sort_by === "time_desc" || sort_by === "time_asc" || sort_by === "recent_hot") {
        if (mediaType === "movie") {
            queryParams["primary_release_date.lte"] = maxDate;
            if (sort_by === "recent_hot") queryParams["primary_release_date.gte"] = dateFloor;
        } else {
            queryParams["first_air_date.lte"] = maxDate;
            if (sort_by === "recent_hot") queryParams["first_air_date.gte"] = dateFloor;
        }
    }

    return queryParams;
}

/**
 * 近期热门贝叶斯综合排序（与模块2算法一致）
 */
function applyBayesianRecentHotSort(items) {
    if (!items || items.length === 0) return;
    const minYear = (new Date()).getFullYear() - 2;
    const maxPop = Math.max(...items.map(i => i.popularity || 0));
    const minPop = Math.min(...items.map(i => i.popularity || 0));
    const maxScore = Math.max(...items.map(i => i.vote_average || 0));
    const minScore = Math.min(...items.map(i => i.vote_average || 0));
    const maxYear = Math.max(...items.map(i => {
        const d = i.release_date || i.first_air_date || "";
        return d ? Number(d.slice(0, 4)) : minYear;
    }));

    items.forEach(i => {
        const popNorm = maxPop > minPop ? (i.popularity - minPop) / (maxPop - minPop) : 0;
        const scoreNorm = maxScore > minScore ? (i.vote_average - minScore) / (maxScore - minScore) : 0;
        let year = 0;
        const d = i.release_date || i.first_air_date || "";
        if (d) year = Number(d.slice(0, 4));
        const yearNorm = maxYear > minYear ? (year - minYear) / (maxYear - minYear) : 0;
        i._recent_hot_weight = 0.3 * popNorm + 0.15 * scoreNorm + 0.55 * yearNorm;
    });
    items.sort((a, b) => b._recent_hot_weight - a._recent_hot_weight);
}

/**
 * 格式化输出（与模块1/2保持一致的字段结构）
 */
function formatProviderItem(item, mediaType, providerLabel) {
    if (!item) return null;
    const date = item.release_date || item.first_air_date || "";
    const year = date ? date.substring(0, 4) : "未知";
    const score = item.vote_average ? item.vote_average.toFixed(1) : "暂无评分";
    return {
        id: String(item.id),
        tmdbId: parseInt(item.id),
        type: "tmdb",
        mediaType: mediaType,
        title: item.title || item.name,
        subTitle: `${providerLabel} | \u2b50 ${score} | ${year}`,
        description: `${date} \u00b7 \u2b50 ${score}\n${item.overview || "\u6682\u65e0\u7b80\u4ecb"}`,
        releaseDate: date,
        year: year,
        posterPath: item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : "",
        backdropPath: item.backdrop_path ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}` : "",
        rating: parseFloat(score) || 0
    };
}

/**
 * 从 TMDB 获取某个平台的内容
 */
async function fetchProviderContent(mediaType, sort_by, page, providerKey) {
    const provider = PROVIDER_MAP[providerKey];
    if (!provider) return [];
    const qp = buildProviderQuery(mediaType, sort_by, page, providerKey);
    if (!qp) return [];
    const res = await Widget.tmdb.get(`/discover/${mediaType}`, { params: qp });
    let items = res.results || [];
    if (sort_by === "recent_hot" && items.length > 0) {
        applyBayesianRecentHotSort(items);
    }
    return items.map(i => formatProviderItem(i, mediaType, provider.label)).filter(Boolean);
}

/**
 * loadWatchProviderList — 模块3入口
 */
async function loadWatchProviderList(params = {}) {
    const page = parseInt(params.page) || 1;
    const {
        mediaType = "all",
        provider = "netflix",
        sort_by = "popularity"
    } = params;

    try {
        let items = [];

        if (mediaType === "all") {
            // 同时查询电影和电视剧，合并排序
            const [movies, tvs] = await Promise.all([
                fetchProviderContent("movie", sort_by, page, provider),
                fetchProviderContent("tv", sort_by, page, provider)
            ]);
            items = [...movies, ...tvs];

            // 合并后排序
            if (sort_by === "popularity") {
                items.sort((a, b) => b._popularity - a._popularity);
            } else if (sort_by === "rating") {
                items.sort((a, b) => b.rating - a.rating);
            } else if (sort_by === "time_desc") {
                items.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));
            } else if (sort_by === "time_asc") {
                items.sort((a, b) => new Date(a.releaseDate) - new Date(b.releaseDate));
            }
            // recent_hot 已经在各自查询中排好了，直接合并即可
        } else {
            items = await fetchProviderContent(mediaType, sort_by, page, provider);
        }

        if (items.length === 0) {
            const label = PROVIDER_MAP[provider]?.label || provider;
            return page === 1
                ? [{ id: "empty", type: "text", title: "\u8be5\u5e73\u53f0\u6682\u65e0\u5185\u5bb9", description: `${label} \u4e0a\u6682\u65e0\u6ee1\u8db3\u6761\u4ef6\u7684\u5a92\u4f53\uff0c\u8bf7\u5c1d\u8bd5\u5176\u4ed6\u5e73\u53f0` }]
                : [];
        }

        return items;

    } catch (error) {
        console.error("\u52a0\u8f7d\u64ad\u51fa\u5e73\u53f0\u5217\u8868\u5931\u8d25:", error);
        return [{ id: "err", type: "text", title: "\u52a0\u8f7d\u5931\u8d25", description: "\u7f51\u7edc\u8fde\u63a5\u5f02\u5e38\uff0c\u8bf7\u91cd\u8bd5" }];
    }
}

