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
    version: "2.0.1", // 升级一个小版本
    requiredVersion: "0.0.1",
    site: "https://t.me/MakkaPakkaOvO",

    modules: [
        {
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

// 核心函数
async function loadResource(params) {
    var cookie = (params.cookie || "").trim();
    if (!cookie) {
        return [{ name: "⚠️ 错误", description: "请先在模块设置中配置夸克 Cookie", url: "" }];
    }

    // 解析 Forward 传过来的参数 (增加 parseInt 确保是数字类型)
    var tmdbId = params.tmdbId;
    var type = params.type; 
    var seriesName = params.seriesName; 
    var season = parseInt(params.season) || 1; 
    var episode = parseInt(params.episode) || 1; 

    console.log(`[夸克源] 开始匹配 - TMDB:${tmdbId} | 剧名:${seriesName} | S${season}E${episode}`);

    var headers = {
        "Cookie": cookie,
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Referer": "https://pan.quark.cn/"
    };

    var matchedFiles = [];

    // ==========================================
    // 步骤 1：利用 TMDB_ID 在夸克进行全局搜索
    // ==========================================
    // 💡 修复点1：去掉 `=` 号，直接搜纯数字 279388，防止夸克搜索引擎分词失败
    var searchKeyword = tmdbId ? String(tmdbId) : seriesName;
    var searchUrl = "https://drive.quark.cn/1/clouddrive/search?pr=ucpro&fr=pc&keyword=" + encodeURIComponent(searchKeyword);
    
    console.log(`[夸克源] 正在搜索关键词: ${searchKeyword}`);

    try {
        var res = await Widget.http.get(searchUrl, { headers: headers });
        var data = safeJsonParse(res.data);
        
        if (data && data.code === 0 && data.data && data.data.list) {
            var list = data.data.list;
            console.log(`[夸克源] 搜索命中 ${list.length} 个结果`);

            for (var i = 0; i < list.length; i++) {
                var item = list[i];
                var itemName = item.file_name || "";
                
                // 如果是文件夹 (file_type === 0)
                if (item.file_type === 0 || item.obj_type === 2) {
                    
                    // 二次校验：确保这个文件夹名字确实包含我们搜的 ID 或剧名，防止误伤
                    if (tmdbId && !itemName.includes(String(tmdbId)) && !itemName.includes(seriesName)) {
                        continue;
                    }

                    var folderFid = item.fid;
                    // 💡 修复点2：使用夸克官方最稳的获取目录列表 API (sort/list)，并且将 limit 提升到 1000 防止文件过多被截断
                    var listUrl = "https://drive.quark.cn/1/clouddrive/sort/list?pr=ucpro&fr=pc&pdir_fid=" + folderFid + "&limit=1000";
                    console.log(`[夸克源] 匹配到目标文件夹 [${itemName}]，正在拉取内部文件...`);
                    
                    var listRes = await Widget.http.get(listUrl, { headers: headers });
                    var listData = safeJsonParse(listRes.data);
                    
                    if (listData && listData.code === 0 && listData.data && listData.data.list) {
                        console.log(`[夸克源] 文件夹内共获取到 ${listData.data.list.length} 个文件`);
                        matchedFiles = matchedFiles.concat(listData.data.list);
                    }
                } else {
                    // 如果直接搜到了文件，也放进候选池
                    matchedFiles.push(item);
                }
            }
        }
    } catch (e) {
        console.error("[夸克源] 搜索网络异常", e);
        return [{ name: "❌ 网络异常", description: "搜索夸克网盘时发生错误", url: "" }];
    }

    // ==========================================
    // 步骤 2：在候选池中精准过滤出对应的“集数”
    // ==========================================
    var results = [];
    
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
            // 💡 修复点3：增加更强的兼容性。即便网盘里只有 E01 或者写着 第1集 也能识别
            if (filenameUpper.includes(targetSE) || filenameUpper.includes(targetSEx)) {
                isMatch = true;
            } else if (filenameUpper.includes(targetEOnly) && !filenameUpper.includes("S")) {
                isMatch = true;
            } else if (filename.includes(`第${episode}集`) || filename.includes(`第${ePad}集`)) {
                isMatch = true;
            }
        } else {
            // 电影
            isMatch = true;
        }

        // ==========================================
        // 步骤 3：获取直链并返回
        // ==========================================
        if (isMatch) {
            console.log(`[夸克源] ✅ 成功匹配到对应集数文件: ${filename}`);
            var playUrl = await getQuarkDownloadUrl(file.fid, cookie);
            if (playUrl) {
                var sizeMb = (file.size / 1024 / 1024).toFixed(1);
                results.push({
                    name: "⚡ 夸克直连",
                    description: `大小: ${sizeMb} MB | 文件: ${filename}`,
                    url: playUrl
                });
            } else {
                console.log(`[夸克源] ❌ 获取直链失败: ${filename}`);
            }
        }
    }

    if (results.length === 0) {
        console.log(`[夸克源] ⚠️ 未在文件夹中找到匹配 S${sPad}E${ePad} 的视频`);
    }

    return results;
}
