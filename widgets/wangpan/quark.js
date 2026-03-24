// =============UserScript=============
// @name        夸克网盘 (直连播放) V1.1
// @description 提取夸克网盘直链，极速无缝播放
// @author      MakkaPakka 
// =============UserScript=============

var WidgetMetadata = {
    id: "forward.quark.makkapakka",
    title: "☁️ 夸克网盘直连",
    description: "私人云盘挂载模块",
    author: "𝙈𝙖𝙠𝙠𝙖𝙋𝙖𝙠𝙠𝙖",
    version: "1.1.0",
    requiredVersion: "0.0.1",
    site: "https://t.me/MakkaPakkaOvO",

    modules: [
        {
            title: "我的网盘",
            description: "浏览并播放夸克网盘内的视频",
            functionName: "loadQuarkDrive",
            type: "video",
            params: [
                {
                    name: "cookie",
                    title: "夸克 Cookie",
                    type: "input",
                    description: "必填！请在网页版夸克登录后抓包获取",
                    value: ""
                },
                {
                    name: "folderId",
                    title: "文件夹 ID (fid)",
                    type: "input",
                    description: "默认填 0 为根目录。想进子文件夹，请填入对应的 ID",
                    value: "0"
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
    // 强制清理 Cookie 两端的空格和回车
    var cookie = (params.cookie || "").trim();
    var fid = (params.folderId || "0").trim(); 

    if (!cookie) {
        return [
            { id: "empty1", type: "text", title: "⚠️ 未配置 Cookie", description: "请在参数设置中填入你的夸克 Cookie" }
        ];
    }

    var url = "https://drive.quark.cn/1/clouddrive/file/sort?pr=ucpro&fr=pc";
    var headers = {
        "Cookie": cookie,
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://pan.quark.cn/"
    };
    var bodyStr = JSON.stringify({
        "pdir_fid": fid,
        "fid": fid,
        "limit": 100,
        "sort_type": 1,
        "sort_field": 1
    });

    try {
        // 兼容 Forward 网络库：同时传入 body 和 data，防止有些框架只认其中一个
        var reqOptions = { 
            headers: headers, 
            body: bodyStr, 
            data: bodyStr 
        };
        
        var res = await Widget.http.post(url, reqOptions);
        
        // 如果 Forward 网络请求失败，res 可能是 null
        if (!res) {
            throw new Error("HTTP 请求返回为空");
        }

        var data = safeJsonParse(res.data);

        // 如果夸克返回了错误码（比如 Cookie 失效）
        if (!data || data.code !== 0) {
            return [
                { 
                    id: "error", 
                    type: "text", 
                    title: "❌ 夸克连接失败", 
                    description: "状态码: " + (data?.code || "未知") + "\n信息: " + (data?.message || "Cookie可能已过期，请重新抓包获取。") 
                }
            ];
        }

        var list = data.data.list || [];
        var items = [];

        for (var i = 0; i < list.length; i++) {
            var file = list[i];
            var isVideo = file.file_name.match(/\.(mp4|mkv|avi|mov|flv|wmv|ts)$/i);
            var isFolder = file.file_type === 0 || file.obj_type === 2; 

            if (isVideo) {
                var playUrl = await getQuarkDownloadUrl(file.fid, cookie);
                var sizeMb = (file.size / 1024 / 1024).toFixed(1);

                items.push({
                    id: file.fid,
                    type: "video", 
                    mediaType: "movie",
                    title: file.file_name,
                    description: "▶️ 直连播放 | 大小: " + sizeMb + " MB\n更新时间: " + new Date(file.updated_at).toLocaleString(),
                    posterPath: "https://img.alicdn.com/imgextra/i2/O1CN01Z2kO2k1P3J1Q1X3Y2_!!6000000001784-2-tps-200-200.png",
                    link: playUrl
                });
            } else if (isFolder) {
                items.push({
                    id: file.fid,
                    type: "text", 
                    title: "📁 [文件夹] " + file.file_name,
                    description: "目录 ID: " + file.fid + "\n(将此 ID 复制到设置的【文件夹 ID】参数中，即可进入该目录)"
                });
            }
        }

        if (items.length === 0) {
            return [{ id: "empty2", type: "text", title: "空空如也", description: "当前目录下没有视频或文件夹" }];
        }

        return items;

    } catch (e) {
        // 这次把真正的错误拦截并显示在屏幕上！
        return [{ 
            id: "error2", 
            type: "text", 
            title: "❌ 网络底层异常", 
            description: "具体错误: " + (e.message || String(e)) + "\n这通常是因为网络不通或 HTTP 客户端不兼容。" 
        }];
    }
}
