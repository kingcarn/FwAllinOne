// =============UserScript=============
// @name        夸克网盘 (标准目录结构源)
// @description 按 Plex/Emby 标准命名结构(剧名/Season 1/S01E01)全自动直连夸克
// @author      MakkaPakka 
// =============UserScript=============

// 🔑 你提供的 TMDB API Key
const TMDB_API_KEY = "d913a144d0ba98fdca978f53a1ce27a5";

var WidgetMetadata = {
    id: "forward.quark.standard.stream_mk",
    title: "☁️ 夸克播放源 (精确匹配)",
    description: "全自动穿透标准目录结构 (例如: 逐玉/Season 1/S01E01.mkv)",
    author: "𝙈𝙖𝙠𝙠𝙖𝙋𝙖𝙠𝙠𝙖",
    version: "3.0.0", 
    requiredVersion: "0.0.1",
    site: "https://t.me/MakkaPakkaOvO",

    // 全局配置，永久保存 Cookie
    globalParams: [
        {
            name: "cookie",
            title: "夸克 Cookie",
            type: "input",
            description: "必填！填入夸克网盘 Cookie，用于检索资源",
            value: ""
        }
    ],

    modules: [
        // 核心的流媒体获取模块，去除了多余的搜索模块
        {
            id: "loadResource",
            title: "加载夸克资源",
            functionName: "loadResource",
            type: "stream",
            params: [] 
        }
    ]
};

function safeJsonParse(data) {
    try { return JSON.parse(data); } catch (e) { return null; }
}

function getCommonHeaders(cookie) {
    return {
        "Cookie": cookie,
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Referer": "https://pan.quark.cn/",
        "Content-Type": "application/json"
    };
}

// 获取夸克直链
async function getQuarkDownloadUrl(fid, cookie) {
    var url = "https://drive.quark.cn/1/clouddrive/file/download";
    var headers = getCommonHeaders(cookie);
    var bodyStr = JSON.stringify({ "fids": [fid] });
    try {
        var res = await Widget.http.post(url, { headers: headers, body: bodyStr, data: bodyStr });
        var data = safeJsonParse(res.data);
        if (data && data.code === 0 && data.data && data.data.length > 0) {
            return data.data[0].download_url;
        }
    } catch (e) {
        console.error("获取直链失败", e);
    }
    return "";
}

// 利用 TMDB API 确认/补全剧集信息
async function fetchTmdbInfo(tmdbId, seriesName, type) {
    let finalName = seriesName;
    try {
        // 如果缺少剧名但有 ID，通过 TMDB 查剧名
        if (!finalName && tmdbId) {
            let res = await Widget.http.get(`https://api.themoviedb.org/3/${type}/${tmdbId}?api_key=${TMDB_API_KEY}&language=zh-CN`);
            let data = safeJsonParse(res.data);
            if (data) {
                finalName = data.name || data.title || finalName;
            }
        }
        // 反向：如果你想根据名字去 TMDB 搜 ID，可以在这里扩展
        // let searchRes = await Widget.http.get(`https://api.themoviedb.org/3/search/${type}?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(seriesName)}&language=zh-CN`);
    } catch(e) {
        console.error("TMDB API 辅助查询失败", e);
    }
    return finalName;
}

// 核心加载函数
async function loadResource(params) {
    var cookie = (params.cookie || "").trim();
    if (!cookie) {
        return [{ name: "⚠️ 错误", description: "请先在模块设置中配置夸克 Cookie", url: "" }];
    }

    var tmdbId = params.tmdbId;
    var type = params.type || "tv"; 
    var rawSeriesName = params.seriesName || params.title || ""; 
    var season = params.season ? parseInt(params.season) : 1; 
    var episode = params.episode ? parseInt(params.episode) : 1; 

    // 使用你内置的 TMDB API 获取最准确的剧名
    var seriesName = await fetchTmdbInfo(tmdbId, rawSeriesName, type);
    if (!seriesName) return [];

    console.log(`[夸克源] 开始匹配 - 剧名: ${seriesName} | S${season}E${episode}`);

    var headers = getCommonHeaders(cookie);
    var matchedFiles = [];

    // ==========================================
    // 步骤 1：在夸克根目录搜索剧集名称 (例如搜索 "逐玉")
    // ==========================================
    var searchUrl = "https://drive.quark.cn/1/clouddrive/search?pr=ucpro&fr=pc&keyword=" + encodeURIComponent(seriesName);
    
    try {
        var res = await Widget.http.get(searchUrl, { headers: headers });
        var data = safeJsonParse(res.data);
        
        if (data && data.code === 0 && data.data && data.data.list) {
            var list = data.data.list;

            for (var i = 0; i < list.length; i++) {
                var item = list[i];
                var itemName = item.file_name || "";
                
                // 如果搜到的是文件夹（即“逐玉”的根文件夹）
                if (item.file_type === 0 || item.obj_type === 2) {
                    
                    // 进入这个剧集文件夹，获取里面的列表
                    var folderFid = item.fid;
                    var listUrl = "https://drive.quark.cn/1/clouddrive/sort/list?pr=ucpro&fr=pc&pdir_fid=" + folderFid + "&limit=1000";
                    var listRes = await Widget.http.get(listUrl, { headers: headers });
                    var listData = safeJsonParse(listRes.data);
                    
                    var subItems = (listData && listData.data && listData.data.list) ? listData.data.list : [];

                    if (type === 'tv') {
                        // ==========================================
                        // 步骤 2：寻找 "Season X" 子文件夹
                        // ==========================================
                        // 匹配 Season 1, Season 01, S01, S1 都可以
                        var seasonRegex = new RegExp(`(Season|S)\\s*0?${season}$`, "i");
                        var foundSeasonFolder = false;

                        for (var subItem of subItems) {
                            if ((subItem.file_type === 0 || subItem.obj_type === 2) && seasonRegex.test(subItem.file_name)) {
                                console.log(`[夸克源] 找到季文件夹: ${subItem.file_name}，正在进入...`);
                                foundSeasonFolder = true;

                                // 进入 Season 文件夹获取里面的所有集数视频
                                var seasonRes = await Widget.http.get("https://drive.quark.cn/1/clouddrive/sort/list?pr=ucpro&fr=pc&pdir_fid=" + subItem.fid + "&limit=1000", { headers: headers });
                                var seasonData = safeJsonParse(seasonRes.data);
                                
                                if (seasonData && seasonData.data && seasonData.data.list) {
                                    matchedFiles = matchedFiles.concat(seasonData.data.list);
                                }
                            }
                        }
                        
                        // 防御机制：如果没有叫做 Season X 的文件夹，可能视频文件直接放在了“逐玉”这个根文件夹里
                        if (!foundSeasonFolder) {
                            matchedFiles = matchedFiles.concat(subItems);
                        }
                    } else {
                        // 如果是电影，直接把文件夹里的文件拿出来
                        matchedFiles = matchedFiles.concat(subItems);
                    }
                } else {
                    // 如果搜索“逐玉”直接搜到了文件，也作为备选放入
                    matchedFiles.push(item);
                }
            }
        }
    } catch (e) {
        console.error(`[夸克源] 搜索网络异常`, e);
        return [];
    }

    // ==========================================
    // 步骤 3：在最终的视频文件池中精准过滤出对应的“S01E01”
    // ==========================================
    var results = [];
    
    // 生成匹配格式
    var sPad = season < 10 ? '0' + season : String(season);
    var ePad = episode < 10 ? '0' + episode : String(episode);
    var targetSE = "S" + sPad + "E" + ePad; // 你的标准格式 S01E01
    var targetSEx = "S" + season + "E" + episode; // 兼容格式 S1E1

    for (var j = 0; j < matchedFiles.length; j++) {
        var file = matchedFiles[j];
        var filename = file.file_name || "";
        var isVideo = filename.match(/\.(mp4|mkv|avi|mov|flv|wmv|ts)$/i);
        
        if (!isVideo || file.file_type === 0) continue; 

        var isMatch = false;

        if (type === "tv") {
            var filenameUpper = filename.toUpperCase();
            // 精确匹配你的命名：逐玉-S01E01_4K...
            if (filenameUpper.includes(targetSE) || filenameUpper.includes(targetSEx)) {
                isMatch = true;
            }
        } else {
            // 电影无需匹配集数
            isMatch = true;
        }

        // ==========================================
        // 步骤 4：获取直链并返回
        // ==========================================
        if (isMatch) {
            console.log(`[夸克源] ✅ 自动匹配成功: ${filename}`);
            var playUrl = await getQuarkDownloadUrl(file.fid, cookie);
            if (playUrl) {
                var sizeMb = (file.size / 1024 / 1024).toFixed(1);
                results.push({
                    name: "⚡ 夸克直连",
                    description: `大小: ${sizeMb} MB | 文件: ${filename}`,
                    url: playUrl
                });
            }
        }
    }

    if (results.length === 0) {
        console.log(`[夸克源] ⚠️ 未能匹配到 S${sPad}E${ePad} 的视频`);
    }

    return results;
}
