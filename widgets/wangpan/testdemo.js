// =============UserScript=============
// @name        夸克网盘 (智能正则匹配源)
// @description 借用VOD提取算法，无视文件夹层级，全自动智能正则匹配S01E01
// @author      MakkaPakka 
// =============UserScript=============

const CHINESE_NUM_MAP = {
    '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
    '六': 6, '七': 7, '八': 8, '九': 9, '十': 10
};

var WidgetMetadata = {
    id: "forward.quark.smart.stream",
    title: "☁️ 夸克播放源 (智能匹配)",
    description: "全自动正则提取文件名匹配 (类似VOD逻辑)",
    author: "𝙈𝙖𝙠𝙠𝙖𝙋𝙖𝙠𝙠𝙖",
    version: "4.0.0", 
    requiredVersion: "0.0.1",
    site: "https://t.me/MakkaPakkaOvO",

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
        {
            id: "loadResource",
            title: "加载夸克资源",
            functionName: "loadResource",
            type: "stream",
            params: [] 
        }
    ]
};

// ==========================================
// 辅助工具函数 (完全移植自你的 VOD 模块)
// ==========================================

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

// 借用 VOD 模块的方法：智能提取纯净的剧名
function extractSeasonInfo(seriesName) {
    if (!seriesName) return { baseName: seriesName, seasonNumber: 1 };
    const chineseMatch = seriesName.match(/第([一二三四五六七八九十\d]+)[季部]/);
    if (chineseMatch) {
        const val = chineseMatch[1];
        const seasonNum = CHINESE_NUM_MAP[val] || parseInt(val) || 1;
        const baseName = seriesName.replace(/第[一二三四五六七八九十\d]+[季部]/, '').trim();
        return { baseName, seasonNumber: seasonNum };
    }
    const digitMatch = seriesName.match(/(.+?)(\d+)$/);
    if (digitMatch) {
        return { baseName: digitMatch[1].trim(), seasonNumber: parseInt(digitMatch[2]) || 1 };
    }
    return { baseName: seriesName.trim(), seasonNumber: 1 };
}

// 新增工具：从文件名中智能提取季数和集数 (S01E01, s1e1, 第1集)
function parseFileSE(filename) {
    let s = null, e = null;
    // 匹配 S01E01 或 s1e1
    const seMatch = filename.match(/[Ss](\d+)[Ee](\d+)/);
    if (seMatch) {
        return { s: parseInt(seMatch[1]), e: parseInt(seMatch[2]) };
    }
    // 匹配 第1季第1集
    const cnMatch = filename.match(/第(\d+)季.*?第(\d+)集/);
    if (cnMatch) {
        return { s: parseInt(cnMatch[1]), e: parseInt(cnMatch[2]) };
    }
    // 匹配 E01 或 第1集 (如果没有季数，默认返回 s=1)
    const eMatch = filename.match(/[Ee](\d+)|第(\d+)集/);
    if (eMatch) {
        return { s: 1, e: parseInt(eMatch[1] || eMatch[2]) };
    }
    return { s: null, e: null };
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

// ==========================================
// 主入口函数
// ==========================================

async function loadResource(params) {
    var cookie = (params.cookie || "").trim();
    if (!cookie) return [{ name: "⚠️ 错误", description: "请配置夸克 Cookie", url: "" }];

    var type = params.type || "tv"; 
    var rawSeriesName = params.seriesName || params.title || ""; 

    // 1. 使用 VOD 的方法提取纯净的搜索词
    var { baseName, seasonNumber } = extractSeasonInfo(rawSeriesName);
    if (!baseName) return [];

    var targetSeason = params.season ? parseInt(params.season) : seasonNumber;
    var targetEpisode = params.episode ? parseInt(params.episode) : 1;

    console.log(`[夸克智能源] 解析剧名: ${baseName} | 目标: S${targetSeason}E${targetEpisode}`);

    var headers = getCommonHeaders(cookie);
    
    // 2. 引入 VOD 的缓存机制 (缓存文件夹内的视频列表，提高速度)
    var cacheKey = `quark_file_pool_${baseName}_${type}`;
    var videoFilePool = [];
    
    try {
        var cachedPool = Widget.storage.get(cacheKey);
        if (cachedPool && Array.isArray(cachedPool) && cachedPool.length > 0) {
            console.log(`[夸克智能源] 命中文件池缓存: ${cacheKey}`);
            videoFilePool = cachedPool;
        }
    } catch (e) {}

    // 3. 如果没缓存，去夸克搜索并构建文件池
    if (videoFilePool.length === 0) {
        var searchUrl = "https://drive.quark.cn/1/clouddrive/search?pr=ucpro&fr=pc&keyword=" + encodeURIComponent(baseName);
        
        try {
            var res = await Widget.http.get(searchUrl, { headers: headers });
            var data = safeJsonParse(res.data);
            
            if (data && data.code === 0 && data.data && data.data.list) {
                var list = data.data.list;

                for (var i = 0; i < list.length; i++) {
                    var item = list[i];
                    var itemName = item.file_name || "";
                    
                    // 如果搜到的是文件夹（例如"逐玉"）
                    if (item.file_type === 0 || item.obj_type === 2) {
                        var folderFid = item.fid;
                        // 获取文件夹里的所有内容 (Limit 拉到 1000 保证能抓全)
                        var listUrl = "https://drive.quark.cn/1/clouddrive/sort/list?pr=ucpro&fr=pc&pdir_fid=" + folderFid + "&limit=1000";
                        var listRes = await Widget.http.get(listUrl, { headers: headers });
                        var listData = safeJsonParse(listRes.data);
                        
                        var subItems = (listData && listData.data && listData.data.list) ? listData.data.list : [];
                        
                        // 不管三七二十一，把文件夹里所有的视频文件、以及子文件夹(Season 1)里的视频全捞出来
                        for (var subItem of subItems) {
                            if (subItem.file_type === 0 || subItem.obj_type === 2) {
                                // 进入子文件夹捞视频
                                var subRes = await Widget.http.get("https://drive.quark.cn/1/clouddrive/sort/list?pr=ucpro&fr=pc&pdir_fid=" + subItem.fid + "&limit=1000", { headers: headers });
                                var subData = safeJsonParse(subRes.data);
                                if (subData && subData.data && subData.data.list) {
                                    videoFilePool = videoFilePool.concat(subData.data.list.filter(f => f.file_type !== 0 && f.file_name.match(/\.(mp4|mkv|avi|mov|flv|wmv|ts)$/i)));
                                }
                            } else if (subItem.file_name.match(/\.(mp4|mkv|avi|mov|flv|wmv|ts)$/i)) {
                                videoFilePool.push(subItem);
                            }
                        }
                    } else if (itemName.match(/\.(mp4|mkv|avi|mov|flv|wmv|ts)$/i)) {
                        // 如果直接搜到了视频文件
                        videoFilePool.push(item);
                    }
                }
            }

            // 存入缓存 (保存 3 小时)
            if (videoFilePool.length > 0) {
                try { Widget.storage.set(cacheKey, videoFilePool, 10800); } catch (e) {}
            }

        } catch (e) {
            console.error(`[夸克智能源] 搜索网络异常`, e);
            return [];
        }
    }

    // 4. 使用正则精准过滤目标集数 (VOD 核心逻辑)
    var results = [];
    
    for (var j = 0; j < videoFilePool.length; j++) {
        var file = videoFilePool[j];
        var filename = file.file_name || "";
        
        var isMatch = false;

        if (type === "tv") {
            // 使用我们新加的正则解析器
            var { s, e } = parseFileSE(filename);
            
            // 如果成功解析出了集数，并且和我们要找的集数一致
            if (e === targetEpisode) {
                // 如果季数能对应上，或者解析不出季数但集数对上了，就认为匹配成功
                if (s === targetSeason || s === null || s === 1) {
                    isMatch = true;
                }
            }
        } else {
            // 电影只要名字里包含 baseName 就算匹配
            if (filename.includes(baseName)) {
                isMatch = true;
            }
        }

        // 5. 将匹配成功的视频转换为直链返回
        if (isMatch) {
            console.log(`[夸克智能源] ✅ 命中文件: ${filename}`);
            var playUrl = await getQuarkDownloadUrl(file.fid, cookie);
            if (playUrl) {
                var sizeMb = (file.size / 1024 / 1024).toFixed(1);
                results.push({
                    name: "⚡ 夸克直连",
                    description: `大小: ${sizeMb} MB | ${filename}`,
                    url: playUrl
                });
            }
        }
    }

    if (results.length === 0) {
        console.log(`[夸克智能源] ⚠️ 文件池共 ${videoFilePool.length} 个视频，但未匹配到 S${targetSeason}E${targetEpisode}`);
    }

    return results;
}
