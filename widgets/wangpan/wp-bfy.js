// =============UserScript=============
// @name        夸克网盘 (聚合搜索与播放)
// @description 支持手动搜索夸克网盘资源，并作为底层流媒体源全自动匹配TMDB
// @author      MakkaPakka 
// =============UserScript=============

var WidgetMetadata = {
    id: "forward.quark.stream",
    title: "☁️ 夸克云盘",
    description: "支持手动搜索网盘文件，及全自动匹配TMDB资源",
    author: "𝙈𝙖𝙠𝙠𝙖𝙋𝙖𝙠𝙠𝙖",
    version: "2.1.0", // 版本大升级，增加了搜索功能
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
        // --- 模块 1：手动搜索模块 (新增) ---
        {
            id: "searchQuark",
            title: "搜索网盘",
            functionName: "searchQuark",
            type: "video", // 视频/专辑列表类型
            params: [
                {
                    name: "keyword",
                    title: "关键字",
                    type: "input",
                    description: "输入网盘内的文件名或文件夹名",
                    value: ""
                }
            ]
        },
        // --- 模块 2：详情页解析 (新增，用于搜索结果点击后的播放) ---
        {
            id: "getDetail",
            title: "获取详情",
            functionName: "loadDetail",
            type: "video", 
            params: []
        },
        // --- 模块 3：底层播放源 (原有的自动匹配功能) ---
        {
            id: "loadResource",
            title: "加载夸克资源",
            functionName: "loadResource",
            type: "stream",
            params: [] 
        }
    ]
};

// --- 通用工具函数 ---

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

// 获取夸克直链的通用函数
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

// --- 核心功能实现 ---

/**
 * 功能一：手动搜索夸克网盘 (新增)
 * 对应 91porn_int.js 中的 search 功能
 */
async function searchQuark(params) {
    var cookie = (params.cookie || "").trim();
    var keyword = (params.keyword || "").trim();

    if (!cookie) {
        return [{ title: "⚠️ 请先在设置中配置 Cookie", error: true }];
    }
    if (!keyword) {
        return []; // 没有关键词不搜索
    }

    console.log(`[夸克搜索] 正在手动搜索关键词: ${keyword}`);

    var headers = getCommonHeaders(cookie);
    // 夸克网页端搜索接口
    var searchUrl = "https://drive.quark.cn/1/clouddrive/search?pr=ucpro&fr=pc&keyword=" + encodeURIComponent(keyword);

    try {
        var res = await Widget.http.get(searchUrl, { headers: headers });
        var data = safeJsonParse(res.data);
        
        if (!data || data.code !== 0 || !data.data || !data.data.list) {
            console.log("[夸克搜索] 接口返回空或失败");
            return [{ title: `🔍 未在网盘中搜到 "${keyword}"`, error: true }];
        }

        var quarkList = data.data.list;
        console.log(`[夸克搜索] 命中 ${quarkList.length} 个结果`);

        // 将夸克的数据格式映射为 Forward 的标准 VideoItem 格式
        return quarkList.map(item => {
            var itemName = item.file_name || "未命名";
            var fid = item.fid;
            var isFolder = item.file_type === 0 || item.obj_type === 2;
            
            if (isFolder) {
                // 如果是文件夹，映射为“专辑(tv)”类型，点击会进入 Forward 的二级列表页
                return {
                    id: fid, // 将 fid 作为 ID 传给二级页面
                    type: "video", 
                    title: "📂 " + itemName, // 加个图标区分
                    coverUrl: "https://p4.music.126.net/y8_oB-xQo-0D5-P39C_6_A==/109951165039396342.jpg", // 找个文件夹图标
                    mediaType: "tv", // 标记为 TV，Forward 会自动调用 loadDetail 获取集数
                    description: "文件夹 | 包含文件数: " + (item.file_count || "未知")
                };
            } else {
                // 如果直接是文件，且是视频
                var isVideo = itemName.match(/\.(mp4|mkv|avi|mov|flv|wmv|ts)$/i);
                if (!isVideo) return null; // 过滤非视频文件

                var sizeMb = (item.size / 1024 / 1024).toFixed(1);
                // 映射为“电影(movie)”类型，点击直接尝试播放
                return {
                    id: fid, // 文件的 fid
                    type: "video",
                    title: "🎬 " + itemName,
                    coverUrl: "https://p4.music.126.net/6M8v7_yX4_y4zG3_3v3_7w==/109951165039404285.jpg", // 视频图标
                    mediaType: "movie", // 标记为 movie，点击直接调用 loadDetail 获取视频地址
                    description: `文件 | 大小: ${sizeMb} MB | 创建时间: ${item.format_created_at || "未知"}`
                };
            }
        }).filter(Boolean); // 过滤掉 null 的结果

    } catch (e) {
        console.error("[夸克搜索] 网络异常", e);
        return [{ title: "❌ 搜索时发生网络错误", error: true }];
    }
}

/**
 * 功能二：详情页解析 (新增)
 * 当点击搜索结果中的视频文件时调用
 */
async function loadDetail(params) {
    var cookie = (params.cookie || "").trim();
    var fid = params.id; // searchQuark 传过来的 item.id 就是 fid

    console.log(`[夸克详情] 正在解析文件播放地址, FID: ${fid}`);

    if (!fid || !cookie) return null;

    // 获取播放直链
    var playUrl = await getQuarkDownloadUrl(fid, cookie);

    if (playUrl) {
        // 返回符合详情页模型的数据，最重要的是 videoUrl
        return {
            id: fid,
            title: "夸克网盘播放",
            videoUrl: playUrl, // 核心：把直链填在这里
            playerType: "system" // 使用系统播放器
        };
    }

    return null;
}

/**
 * 功能三：底层播放源 (原有的自动匹配)
 * 做了兼容性调整，增加了更详细的日志
 */
async function loadResource(params) {
    var cookie = (params.cookie || "").trim();
    if (!cookie) {
        return [{ name: "⚠️ 错误", description: "请先在模块设置中配置夸克 Cookie", url: "" }];
    }

    // Forward 自动传参
    var tmdbId = params.tmdbId;
    var type = params.type; 
    var seriesName = params.seriesName; 
    // 电影没有 season/episode，需要处理
    var season = params.season ? parseInt(params.season) : null; 
    var episode = params.episode ? parseInt(params.episode) : null; 

    var logPrefix = `[夸克自动源] [${seriesName || tmdbId}]`;
    if (type === 'tv') {
        console.log(`${logPrefix} 开始匹配 S${season}E${episode}`);
    } else {
        console.log(`${logPrefix} 开始匹配电影`);
    }

    var headers = getCommonHeaders(cookie);
    var matchedFiles = [];

    // ==========================================
    // 步骤 1：在夸克进行全局搜索
    // ==========================================
    // 精简搜索关键词，只搜 ID 数字，成功率更高
    var searchKeyword = tmdbId ? String(tmdbId) : seriesName;
    if (!searchKeyword) return [];

    var searchUrl = "https://drive.quark.cn/1/clouddrive/search?pr=ucpro&fr=pc&keyword=" + encodeURIComponent(searchKeyword);
    
    try {
        var res = await Widget.http.get(searchUrl, { headers: headers });
        var data = safeJsonParse(res.data);
        
        if (data && data.code === 0 && data.data && data.data.list) {
            var list = data.data.list;

            for (var i = 0; i < list.length; i++) {
                var item = list[i];
                var itemName = item.file_name || "";
                
                // 如果搜到的是文件夹
                if (item.file_type === 0 || item.obj_type === 2) {
                    
                    // 文件夹名必须包含我们要搜的 ID
                    if (tmdbId && !itemName.includes(String(tmdbId))) continue;

                    var folderFid = item.fid;
                    // 拉取目录列表
                    var listUrl = "https://drive.quark.cn/1/clouddrive/sort/list?pr=ucpro&fr=pc&pdir_fid=" + folderFid + "&limit=1000";
                    
                    var listRes = await Widget.http.get(listUrl, { headers: headers });
                    var listData = safeJsonParse(listRes.data);
                    
                    if (listData && listData.code === 0 && listData.data && listData.data.list) {
                        matchedFiles = matchedFiles.concat(listData.data.list);
                    }
                } else {
                    // 直接搜到了文件
                    matchedFiles.push(item);
                }
            }
        }
    } catch (e) {
        console.error(`${logPrefix} 搜索网络异常`, e);
        return [];
    }

    // ==========================================
    // 步骤 2：在候选池中精准过滤出对应的“集数”
    // ==========================================
    var results = [];
    
    // 用于匹配的各种集数格式
    var sPad = season < 10 ? '0' + season : String(season);
    var ePad = episode < 10 ? '0' + episode : String(episode);
    var targetSE = "S" + sPad + "E" + ePad; // S01E01
    var targetSEx = "S" + season + "E" + episode; // S1E1
    var targetEOnly = "E" + ePad; // E01

    for (var j = 0; j < matchedFiles.length; j++) {
        var file = matchedFiles[j];
        var filename = file.file_name || "";
        var isVideo = filename.match(/\.(mp4|mkv|avi|mov|flv|wmv|ts)$/i);
        
        if (!isVideo || file.file_type === 0) continue; 

        var isMatch = false;

        if (type === "tv") {
            var filenameUpper = filename.toUpperCase();
            // 增强版匹配：支持 S01E01, S1E1, E01 或者 第1集
            if (filenameUpper.includes(targetSE) || filenameUpper.includes(targetSEx)) {
                isMatch = true;
            } else if (filenameUpper.includes(targetEOnly) && !filenameUpper.includes("S")) {
                isMatch = true;
            } else if (filename.includes(`第${episode}集`) || filename.includes(`第${ePad}集`)) {
                isMatch = true;
            }
        } else {
            // 电影匹配逻辑：只要在 TMDB_ID 文件夹里的视频都算
            isMatch = true;
        }

        // ==========================================
        // 步骤 3：获取直链并返回
        // ==========================================
        if (isMatch) {
            console.log(`${logPrefix} ✅ 自动匹配成功: ${filename}`);
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
        console.log(`${logPrefix} ⚠️ 未能自动匹配到视频文件`);
    }

    return results;
}
