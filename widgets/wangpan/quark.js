// =============UserScript=============
// @name        夸克网盘 (直连播放)
// @description 提取夸克网盘直链，极速无缝播放
// @author      MakkaPakka 
// =============UserScript=============

var WidgetMetadata = {
    id: "forward.quark.makkapakka",
    title: "☁️ 夸克网盘直连",
    description: "私人云盘挂载模块",
    author: "𝙈𝙖𝙠𝙠𝙖𝙋𝙖𝙠𝙠𝙖",
    version: "1.0.0",
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

// 工具函数：解析 JSON
function safeJsonParse(data) {
    try {
        if (typeof data === 'object') return data;
        return JSON.parse(data);
    } catch (e) { return null; }
}

// 核心功能：获取夸克网盘的真实直链
async function getQuarkDownloadUrl(fid, cookie) {
    var url = "https://drive.quark.cn/1/clouddrive/file/download";
    var headers = {
        "Cookie": cookie,
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    };
    var body = JSON.stringify({ "fids": [fid] });

    try {
        var res = await Widget.http.post(url, { headers: headers, body: body });
        var data = safeJsonParse(res.data);
        if (data && data.code === 0 && data.data && data.data.length > 0) {
            return data.data[0].download_url;
        }
    } catch (e) {
        console.error("获取直链失败", e);
    }
    return "";
}

// 核心功能：读取网盘列表
async function loadQuarkDrive(params) {
    var cookie = params.cookie;
    var fid = params.folderId || "0"; // 0 代表根目录

    if (!cookie) {
        return [
            { id: "empty1", type: "text", title: "⚠️ 未配置 Cookie", subTitle: "请在参数设置中填入你的夸克 Cookie" }
        ];
    }

    // 夸克获取文件列表 API
    var url = "https://drive.quark.cn/1/clouddrive/file/sort?pr=ucpro&fr=pc";
    var headers = {
        "Cookie": cookie,
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://pan.quark.cn/"
    };
    var body = JSON.stringify({
        "pdir_fid": fid,
        "fid": fid,
        "limit": 100, // 每次加载 100 条
        "sort_type": 1,
        "sort_field": 1
    });

    try {
        var res = await Widget.http.post(url, { headers: headers, body: body });
        var data = safeJsonParse(res.data);

        if (!data || data.code !== 0) {
            return [
                { id: "error", type: "text", title: "❌ 连接失败", subTitle: data?.message || "Cookie可能已过期，请重新抓取", description: JSON.stringify(data) }
            ];
        }

        var list = data.data.list || [];
        var items = [];

        // 将文件和文件夹分离处理
        for (var i = 0; i < list.length; i++) {
            var file = list[i];
            // 判断是否是视频文件 (常见格式)
            var isVideo = file.file_name.match(/\.(mp4|mkv|avi|mov|flv|wmv|ts)$/i);
            var isFolder = file.file_type === 0 || file.obj_type === 2; // 夸克文件类型标识

            if (isVideo) {
                // 异步获取视频播放直链
                var playUrl = await getQuarkDownloadUrl(file.fid, cookie);
                var sizeMb = (file.size / 1024 / 1024).toFixed(1);

                items.push({
                    id: file.fid,
                    type: "video", 
                    mediaType: "movie",
                    title: file.file_name,
                    subTitle: "▶️ 直连播放 | 大小: " + sizeMb + " MB",
                    description: "夸克网盘直连加速\n更新时间: " + new Date(file.updated_at).toLocaleString(),
                    posterPath: "https://img.alicdn.com/imgextra/i2/O1CN01Z2kO2k1P3J1Q1X3Y2_!!6000000001784-2-tps-200-200.png", // 夸克默认占位图
                    link: playUrl // 直接把直链丢给 Forward 播放器！
                });
            } else if (isFolder) {
                // 如果是文件夹，渲染为特殊卡片
                items.push({
                    id: file.fid,
                    type: "text", // 文本类型，不可播放
                    title: "📁 [文件夹] " + file.file_name,
                    subTitle: "目录 ID: " + file.fid,
                    description: "将上面的 目录ID 复制到设置的【文件夹 ID】参数中，即可浏览该目录"
                });
            }
        }

        if (items.length === 0) {
            return [{ id: "empty2", type: "text", title: "空空如也", subTitle: "当前目录下没有视频或文件夹" }];
        }

        return items;

    } catch (e) {
        return [{ id: "error2", type: "text", title: "网络异常", subTitle: e.message }];
    }
}
