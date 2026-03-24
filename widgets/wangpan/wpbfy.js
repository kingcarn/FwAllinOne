// =============UserScript=============
// @name        夸克网盘 (聚合播放源)
// @description 将夸克网盘作为底层流媒体源，全自动匹配TMDB资源
// @author      MakkaPakka 
// =============UserScript=============

var WidgetMetadata = {
    id: "forward.quark.stream",
    title: "☁️ 夸克播放源",
    description: "全自动搜索匹配夸克网盘中的影视文件",
    author: "𝙈𝙖𝙠𝙠𝙖𝙋𝙖𝙠𝙠𝙖",
    version: "2.0.0",
    requiredVersion: "0.0.1",
    site: "https://t.me/MakkaPakkaOvO",

    modules: [
        {
            // stream 模块的 id 必须固定为 loadResource
            id: "loadResource",
            title: "加载夸克资源",
            functionName: "loadResource",
            type: "stream",
            params: [
                {
                    name: "cookie",
                    title: "夸克 Cookie",
                    type: "input",
                    description: "必填！填入夸克网盘 Cookie，用于检索资源",
                    value: ""
                }
            ]
        }
    ]
};

function safeJsonParse(data) {
    try { return JSON.parse(data); } catch (e) { return null; }
}

// 获取夸克直链的通用函数
async function getQuarkDownloadUrl(fid, cookie) {
    var url = "https://drive.quark.cn/1/clouddrive/file/download";
    var headers = {
        "Cookie": cookie,
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"
    };
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

// 核心函数：Forward 会自动把你要看的剧集参数传进来
async function loadResource(params) {
    var cookie = (params.cookie || "").trim();
    if (!cookie) {
        return [{ name: "⚠️ 错误", description: "请先在模块设置中配置夸克 Cookie", url: "" }];
    }

    // 解析 Forward 传过来的上下文参数
    var tmdbId = params.tmdbId;
    var type = params.type; // "tv" 或 "movie"
    var seriesName = params.seriesName; // 剧名
    var season = params.season; // 季
    var episode = params.episode; // 集

    var headers = {
        "Cookie": cookie,
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Referer": "https://pan.quark.cn/"
    };

    var matchedFiles = [];

    // ==========================================
    // 步骤 1：利用 TMDB_ID 在夸克进行全局搜索
    // ==========================================
    var searchKeyword = tmdbId ? "TMDB_ID=" + tmdbId : seriesName;
    var searchUrl = "https://drive.quark.cn/1/clouddrive/search?pr=ucpro&fr=pc&keyword=" + encodeURIComponent(searchKeyword);
    
    try {
        var res = await Widget.http.get(searchUrl, { headers: headers });
        var data = safeJsonParse(res.data);
        
        if (data && data.code === 0 && data.data && data.data.list) {
            var list = data.data.list;

            for (var i = 0; i < list.length; i++) {
                var item = list[i];
                
                // 如果搜索到的是你命名的那个文件夹 (比如 逐玉_TMDB_ID=279388)
                if (item.file_type === 0 || item.obj_type === 2) {
                    // 进入这个文件夹，拉取里面的所有视频文件
                    var folderFid = item.fid;
                    var listUrl = "https://drive.quark.cn/1/clouddrive/file/sort?pr=ucpro&fr=pc&pdir_fid=" + folderFid + "&fid=" + folderFid + "&limit=100&sort_type=1&sort_field=1";
                    var listRes = await Widget.http.get(listUrl, { headers: headers });
                    var listData = safeJsonParse(listRes.data);
                    
                    if (listData && listData.code === 0 && listData.data && listData.data.list) {
                        matchedFiles = matchedFiles.concat(listData.data.list);
                    }
                } else {
                    // 如果直接搜到了文件，也放进候选池
                    matchedFiles.push(item);
                }
            }
        }
    } catch (e) {
        return [{ name: "❌ 网络异常", description: "搜索夸克网盘时发生错误", url: "" }];
    }

    // ==========================================
    // 步骤 2：在候选池中精准过滤出对应的“集数”
    // ==========================================
    var results = [];
    
    // 生成匹配格式，例如季为 1，集为 1，生成：S01E01 和 S1E1
    var sPad = season < 10 ? '0' + season : season;
    var ePad = episode < 10 ? '0' + episode : episode;
    var targetSE = "S" + sPad + "E" + ePad;
    var targetSEx = "S" + season + "E" + episode;

    for (var j = 0; j < matchedFiles.length; j++) {
        var file = matchedFiles[j];
        var filename = file.file_name || "";
        var isVideo = filename.match(/\.(mp4|mkv|avi|mov|flv|wmv|ts)$/i);
        
        if (!isVideo || file.file_type === 0) continue; // 排除非视频和子文件夹

        var isMatch = false;

        if (type === "tv") {
            // 剧集匹配逻辑：文件名必须包含 S01E01 或 S1E1
            var filenameUpper = filename.toUpperCase();
            if (filenameUpper.includes(targetSE) || filenameUpper.includes(targetSEx)) {
                isMatch = true;
            }
        } else {
            // 电影匹配逻辑：只要在这个 TMDB_ID 的文件夹里，就算匹配
            isMatch = true;
        }

        // ==========================================
        // 步骤 3：为匹配成功的视频获取播放直链并返回
        // ==========================================
        if (isMatch) {
            var playUrl = await getQuarkDownloadUrl(file.fid, cookie);
            if (playUrl) {
                var sizeMb = (file.size / 1024 / 1024).toFixed(1);
                results.push({
                    name: "⚡ 夸克网盘直连",
                    description: "大小: " + sizeMb + " MB | 文件: " + filename,
                    url: playUrl
                });
            }
        }
    }

    if (results.length === 0) {
        // 返回空数组，Forward 就会知道这个源没有找到该集视频
        return []; 
    }

    return results;
}
