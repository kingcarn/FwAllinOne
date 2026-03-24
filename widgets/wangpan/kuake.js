// =============UserScript=============
// @name        夸克网盘 (直连播放) V1.3
// @description 私人云盘直连 + TMDB智能识别刮削
// @author      MakkaPakka 
// =============UserScript=============

var WidgetMetadata = {
    id: "forward.quark.makkapakka",
    title: "☁️ 夸克网盘直连",
    description: "私人云盘挂载 + TMDB智能刮削",
    author: "𝙈𝙖𝙠𝙠𝙖𝙋𝙖𝙠𝙠𝙖",
    version: "1.3.0",
    requiredVersion: "0.0.1",
    site: "https://t.me/MakkaPakkaOvO",

    modules: [
        {
            title: "我的网盘",
            description: "浏览并智能识别夸克网盘视频",
            functionName: "loadQuarkDrive",
            type: "video",
            params: [
                {
                    name: "cookie",
                    title: "夸克 Cookie",
                    type: "input",
                    description: "必填！",
                    value: ""
                },
                {
                    name: "folderId",
                    title: "文件夹 ID (fid)",
                    type: "input",
                    description: "填 0 为根目录。进入子文件夹请填入其 ID",
                    value: "0"
                },
                {
                    name: "bindTmdbId",
                    title: "绑定 TMDB ID (可选)",
                    type: "input",
                    description: "填入后，该目录下所有视频强制关联此影视。也可通过文件夹命名 TMDB_ID=xxx 自动识别",
                    value: ""
                }
            ]
        }
    ]
};

function safeJsonParse(data) {
    try {
        if (typeof data === 'object') return data;
        return JSON.parse(data);
    } catch (e) { return null; }
}

async function getQuarkDownloadUrl(fid, cookie) {
    var url = "https://drive.quark.cn/1/clouddrive/file/download";
    var headers = {
        "Cookie": cookie,
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
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

async function loadQuarkDrive(params) {
    var cookie = (params.cookie || "").trim();
    var fid = (params.folderId || "0").trim(); 
    var manualTmdbId = (params.bindTmdbId || "").trim(); // 用户手动强绑定的 TMDB ID

    if (!cookie) {
        return [{ id: "empty1", type: "text", title: "⚠️ 未配置 Cookie", description: "请在参数设置中填入你的夸克 Cookie" }];
    }

    var baseUrl = "https://drive.quark.cn/1/clouddrive/file/sort";
    var queryParams = "?pr=ucpro&fr=pc&pdir_fid=" + fid + "&fid=" + fid + "&limit=100&sort_type=1&sort_field=1";
    var url = baseUrl + queryParams;
    
    var headers = {
        "Cookie": cookie,
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://pan.quark.cn/"
    };

    try {
        var res = await Widget.http.get(url, { headers: headers });
        if (!res) throw new Error("HTTP 请求返回为空");

        var data = safeJsonParse(res.data);
        if (!data || data.code !== 0) {
            return [{ 
                id: "error", type: "text", title: "❌ 夸克连接失败", 
                description: "状态码: " + (data?.code || "未知") + "\n信息: " + (data?.message || "Cookie可能已过期。") 
            }];
        }

        // 💡 智能嗅探 1：尝试从网盘目录路径中识别 TMDB_ID
        var pathTmdbId = null;
        if (data.data && data.data.path_info) {
            // 夸克 API 会返回 path_info，里面包含所有的父文件夹名称
            var pathStr = JSON.stringify(data.data.path_info); 
            var pathMatch = pathStr.match(/TMDB_ID=(\d+)/i);
            if (pathMatch) pathTmdbId = pathMatch[1];
        }

        var list = data.data.list || [];
        var items = [];

        for (var i = 0; i < list.length; i++) {
            var file = list[i];
            var isVideo = file.file_name.match(/\.(mp4|mkv|avi|mov|flv|wmv|ts|webm|rmvb)$/i);
            var isFolder = file.file_type === 0 || file.obj_type === 2; 

            if (isVideo) {
                var playUrl = await getQuarkDownloadUrl(file.fid, cookie);
                var sizeMb = (file.size / 1024 / 1024).toFixed(1);

                // 💡 智能嗅探 2：尝试从当前文件名识别 TMDB_ID (优先级：手动设置 > 文件名 > 文件夹名)
                var fileTmdbMatch = file.file_name.match(/TMDB_ID=(\d+)/i);
                var finalTmdbId = manualTmdbId || (fileTmdbMatch ? fileTmdbMatch[1] : null) || pathTmdbId;

                // 💡 智能嗅探 3：提取季数和集数 (例如 S01E01 或 s1e1)
                var seMatch = file.file_name.match(/[Ss](\d+)[Ee](\d+)/);
                var season = seMatch ? parseInt(seMatch[1]) : null;
                var episode = seMatch ? parseInt(seMatch[2]) : null;

                // 构建基础信息卡片
                var videoItem = {
                    id: file.fid,
                    type: "video", 
                    title: file.file_name,
                    description: "▶️ 夸克云盘直连 | 大小: " + sizeMb + " MB",
                    posterPath: "https://img.alicdn.com/imgextra/i2/O1CN01Z2kO2k1P3J1Q1X3Y2_!!6000000001784-2-tps-200-200.png",
                    link: playUrl
                };

                // 🌟 注入 Forward 识别灵魂：如果提取到了 TMDB ID，直接附魔！
                if (finalTmdbId) {
                    videoItem.tmdbId = finalTmdbId;
                    
                    if (season !== null && episode !== null) {
                        videoItem.mediaType = "tv";
                        videoItem.season = season;
                        videoItem.episode = episode;
                        videoItem.subTitle = "S" + season + "E" + episode + " (已绑定 TMDB)";
                    } else {
                        videoItem.mediaType = "movie";
                        videoItem.subTitle = "电影版 (已绑定 TMDB)";
                    }
                } else {
                    videoItem.subTitle = "未匹配 TMDB，仅供直连播放";
                }

                items.push(videoItem);

            } else if (isFolder) {
                // 如果是文件夹，顺便展示一下它是不是已经带有 TMDB 标签
                var folderMark = file.file_name.match(/TMDB_ID=/) ? " ✅(已打标签)" : "";
                items.push({
                    id: file.fid,
                    type: "text", 
                    title: "📁 " + file.file_name + folderMark,
                    description: "目录 ID: " + file.fid + "\n(将此 ID 复制到设置的【文件夹 ID】参数中，即可进入该目录)"
                });
            }
        }

        if (items.length === 0) {
            return [{ id: "empty2", type: "text", title: "空空如也", description: "当前目录下没有视频或文件夹" }];
        }

        return items;

    } catch (e) {
        return [{ id: "error2", type: "text", title: "❌ 网络底层异常", description: "具体错误: " + (e.message || String(e)) }];
    }
}
/**
 * 💡 新增：私人云盘影视智能刮削处理函数
 * 用于在网盘文件列表浏览模块中，处理并关联影视资源信息。
 * Forward Widget 将通过 ID、Media Type ("tv")、季和集这四个核心参数来自动绑定 TMDB 的海报和简介。
 */
function processListingWithSmartScraping(items, parentFolderTitle) {
    // 强制使用“剧集”作为类型标题，有助于 Forward 的自动刮削器识别
    const TV_GENRE_NAME = "剧集";

    // 💡 提取灵魂 1：从父文件夹标题提取 showId. 格式: Name_TMDB_ID=xxxxxx
    var showIdMatch = parentFolderTitle.match(/TMDB_ID=(\d+)/);
    if (!showIdMatch) {
        // 兜底逻辑：不是被标记为影视的文件夹。将列表项作为普通视频文件返回（只显示文件名）。
        return items;
            }
    var showId = parseInt(showIdMatch[1]);

    return items.map(function(item) {
        // 假设网盘列表项具有标准的网络驱动器属性，如 'file_name' 和 'fid' (文件唯一ID) 或类似属性。
        // 为了让 image_2.png 显示正确，必须存在文件名为 titles。
        var filename = item.file_name || item.name || item.title;

        // 💡 提取灵魂 2：文件名包含 `SxxExx` 或 `sxxexx` 的关键词匹配。
        var seMatch = filename.match(/[Ss](\d+)[Ee](\d+)/);

        if (seMatch) {
            var season = parseInt(seMatch[1]);
            var episode = parseInt(seMatch[2]);
            return {
                id: item.fid || item.id, // 用于该卡片选择功能的唯一 ID。
                type: "video",
                mediaType: "tv",
                tmdbId: showId,
                season: season,
                episode: episode,
                title: filename, // 原始文件名，Forward 会自动覆盖 show title。我想要 image_2.png 的效果。
                // 💡 关键：这里必须 NIL 它们，才能触发 Forward 的刮削器去做它的工作。
                description: nil,
                posterPath: nil,
                rating: nil,
                genreTitle: TV_GENRE_NAME,
                // 网络异常问题修复（图片image_0和1）：绝对不要在这里发送并行的 POST 调用来获取所有列表项的链接。
                // 最好使用直连文件 URL 以防止列表加载超时。对于动态 URL，最好在点击播放时再按需获取 URL。
                videoUrl: item.play_link || item.url || nil, // 假设网盘列表逻辑提供了直连 URL。
            }
        }
        // 兜底：文件不匹配集数关键字，则保留为普通视频文件。
        return item;
    });
}
