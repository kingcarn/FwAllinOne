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
    version: "2.1.0",
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
    
    // 修复 1：加上 id 字段，防止 Forward 解析崩溃
    if (!cookie) {
        return [{ id: "error_cookie", name: "⚠️ 错误", description: "请先在模块设置中配置夸克 Cookie", url: "" }];
    }

    var tmdbId = params.tmdbId;
    var type = params.type; 
    var seriesName = params.seriesName; 
    var season = params.season; 
    var episode = params.episode; 

    // 如果没有获取到影视参数（说明用户是在设置页直接点击测试的）
    // 提示：作为 stream 播放源模块，必须从首页影视详情里点击播放来调用！
    if (!tmdbId && !seriesName) {
         return [{ id: "error_params", name: "ℹ️ 提示", description: "模块已就绪！请前往首页搜索具体影视后，点击播放来调用本模块获取播放链接。", url: "" }];
    }

    var headers = {
        "Cookie": cookie,
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        "Referer": "https://pan.quark.cn/"
    };

    var matchedFiles = [];
    // 优先使用 TMDB_ID 进行精准搜索，如果没有则使用剧名兜底
    var searchKeyword = tmdbId ? "TMDB_ID=" + tmdbId : seriesName;
    var searchUrl = "https://drive.quark.cn/1/clouddrive/search?pr=ucpro&fr=pc&keyword=" + encodeURIComponent(searchKeyword);
    
    try {
        var res = await Widget.http.get(searchUrl, { headers: headers });
        var data = safeJsonParse(res.data);
        
        if (data && data.code === 0 && data.data && data.data.list) {
            var list = data.data.list;
            for (var i = 0; i < list.length; i++) {
                var item = list[i];
                // 如果搜索到的是文件夹，进去遍历获取视频文件
                if (item.file_type === 0 || item.obj_type === 2) {
                    var folderFid = item.fid;
                    var listUrl = "https://drive.quark.cn/1/clouddrive/file/sort?pr=ucpro&fr=pc&pdir_fid=" + folderFid + "&fid=" + folderFid + "&limit=100&sort_type=1&sort_field=1";
                    var listRes = await Widget.http.get(listUrl, { headers: headers });
                    var listData = safeJsonParse(listRes.data);
                    
                    if (listData && listData.code === 0 && listData.data && listData.data.list) {
                        matchedFiles = matchedFiles.concat(listData.data.list);
                    }
                } else {
                    // 如果直接搜到了文件，加入待匹配列表
                    matchedFiles.push(item);
                }
            }
        }
    } catch (e) {
        // 修复 2：错误返回也要加 id
        return [{ id: "error_net", name: "❌ 网络异常", description: "搜索夸克网盘时发生错误: " + String(e), url: "" }];
    }

    var results = [];
    // 格式化季和集，兼容 S1E1 和 S01E01
    var sPad = season < 10 ? '0' + season : season;
    var ePad = episode < 10 ? '0' + episode : episode;
    var targetSE = "S" + sPad + "E" + ePad;
    var targetSEx = "S" + season + "E" + episode;

    for (var j = 0; j < matchedFiles.length; j++) {
        var file = matchedFiles[j];
        var filename = file.file_name || "";
        var isVideo = filename.match(/\.(mp4|mkv|avi|mov|flv|wmv|ts|rmvb|webm)$/i);
        
        if (!isVideo || file.file_type === 0) continue; 

        var isMatch = false;
        if (type === "tv") {
            // 剧集：文件名必须包含对于的季集号
            var filenameUpper = filename.toUpperCase();
            if (filenameUpper.includes(targetSE) || filenameUpper.includes(targetSEx)) {
                isMatch = true;
            }
        } else {
            // 电影：只要在这个 TMDB_ID 的结果里且是视频，就算匹配
            isMatch = true;
        }

        if (isMatch) {
            var playUrl = await getQuarkDownloadUrl(file.fid, cookie);
            if (playUrl) {
                var sizeMb = (file.size / 1024 / 1024).toFixed(1);
                results.push({
                    id: file.fid, // 修复 3：将网盘的唯一 fid 作为资源的 id 传给 Forward
                    name: "⚡ 夸克网盘直连",
                    description: "大小: " + sizeMb + " MB | 文件: " + filename,
                    url: playUrl
                });
            }
        }
    }

    return results;
}
