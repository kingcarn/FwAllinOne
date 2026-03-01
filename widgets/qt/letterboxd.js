WidgetMetadata = {
    id: "Letterboxd",
    title: "Letterboxd电影爱好者平台",
    modules: [
        {
            id: "letterboxdList",
            title: "Letterboxd片单",
            requiresWebView: false,
            functionName: "loadListItems",
            cacheDuration: 86400,
            params: [
                {
                    name: "input_type",
                    title: "输入类型",
                    type: "enumeration",
                    value: "select",
                    enumOptions: [
                        {title: "筛选", value: "select"},
                        {title: "自定义", value: "customize"},
                    ],
                },
                {
                    name: "list_select",
                    title: "片单完整URL",
                    type: "enumeration",
                    description: "如：https://letterboxd.com/crew/list/2024-highest-rated-films/",
                    belongTo: {
                        paramName: "input_type",
                        value: ["select"],
                    },
                    enumOptions: [
                        // --- 新增的最新/特色榜单 (置顶) ---
                        {
                            title: "2026年女性导演作品TOP52",
                            value: "https://letterboxd.com/jack/list/52-films-by-women-directors-in-2026/"
                        },
                        {
                            title: "2025女性导演作品TOP52",
                            value: "https://letterboxd.com/jack/list/52-plus-films-by-women-directors-in-2025/"
                        },
                        {
                            title: "你最期待2026年圣丹斯电影节的哪部电影？",
                            value: "https://letterboxd.com/nextbestpicture/list/which-film-from-the-2026-sundance-film-festival/"
                        },
                        {
                            title: "2026年最受期待电影",
                            value: "https://letterboxd.com/nextbestpicture/list/which-film-are-you-most-looking-forward-to-3/"
                        },
                        {
                            title: "2026年全年故事片",
                            value: "https://letterboxd.com/timtamtitus/list/2026/"
                        },
                        {
                            title: "2025年排名",
                            value: "https://letterboxd.com/picklecat44/list/2025-ranked/"
                        },
                        {
                            title: "letterboxd500大电影",
                            value: "https://letterboxd.com/films/by/rating/"
                        },
                        {
                            title: "女性导演电影Top250",
                            value: "https://letterboxd.com/official/list/top-250-films-by-women-directors/"
                        },
                        {
                            title: "女性导演的电影",
                            value: "https://letterboxd.com/caonfilm/list/sapphic-films-directed-by-women/"
                        },
                        {
                            title: "死前必看的1001部电影",
                            value: "https://letterboxd.com/peterstanley/list/1001-movies-you-must-see-before-you-die/"
                        },
                        {
                            title: "每个人一生中至少应该看一次的电影",
                            value: "https://letterboxd.com/fcbarcelona/list/movies-everyone-should-watch-at-least-once/"
                        },
                        {
                            title: "一些令人心碎的卑微的小心翼翼的电影",
                            value: "https://letterboxd.com/filmbitten/list/a-film-that-breaks-your-heart-open-but-carefully/"
                        },
                        {
                            title: "恐怖电影（我想我会死在这间屋子里）",
                            value: "https://letterboxd.com/bgjulia/list/i-think-im-gonna-die-in-this-house/"
                        },
                        {
                            title: "少女经典定义（美少女可能喜欢）",
                            value: "https://letterboxd.com/darkestparadise/list/definition-of-girly-classics/"
                        },
                        {
                            title: "电影结束后你就不是一个人了",
                            value: "https://letterboxd.com/andredenervaux/list/youre-not-the-same-person-once-the-film-has/"
                        },
                        {
                            title: "变态浪漫Top20",
                            value: "https://letterboxd.com/crew/list/20-great-examples-of-kinky-romance-in-cinema/"
                        },
                        {
                            title: "恐怖电影Top250",
                            value: "https://letterboxd.com/official/list/top-250-horror-films/"
                        },
                        {
                            title: "动画电影Top250",
                            value: "https://letterboxd.com/official/list/top-250-animated-films/"
                        },
                        // --- 以下为原有的有效榜单 ---
                        {
                            title: "百万观看俱乐部",
                            value: "https://letterboxd.com/alexanderh/list/letterboxd-one-million-watched-club/"
                        },
                        {
                            title: "250部最佳国际电影",
                            value: "https://letterboxd.com/brsan/list/letterboxds-top-250-international-films/"
                        },
                        {
                            title: "100部最佳默片",
                            value: "https://letterboxd.com/brsan/list/letterboxds-top-100-silent-films/"
                        },
                        {
                            title: "100部最佳纪录迷你剧",
                            value: "https://letterboxd.com/slinkyman/list/letterboxds-top-100-highest-rated-documentary/"
                        },
                        {
                            title: "奥斯卡最佳影片",
                            value: "https://letterboxd.com/oscars/list/oscar-winning-films-best-picture/"
                        },
                        {
                            title: "戛纳电影节金棕榈奖",
                            value: "https://letterboxd.com/festival_cannes/list/70-years-of-the-palme-dor-70-ans-de-la-palme/"
                        },
                        {
                            title: "英国电影学院奖最佳影片",
                            value: "https://letterboxd.com/bafta/list/all-bafta-best-film-award-winners/"
                        },
                        {
                            title: "金球奖最佳剧情片",
                            value: "https://letterboxd.com/edd_gosbender/list/golden-globe-award-for-best-motion-picture/"
                        },
                        {
                            title: "金球奖最佳音乐/喜剧片",
                            value: "https://letterboxd.com/edd_gosbender/list/golden-globe-award-for-best-motion-picture-1/"
                        },
                        {
                            title: "独立精神奖最佳影片",
                            value: "https://letterboxd.com/steffensneil11/list/independent-spirit-award-for-best-film/"
                        },
                        {
                            title: "柏林电影节金熊奖",
                            value: "https://letterboxd.com/socas/list/golden-bear-goldener-bar/"
                        },
                        {
                            title: "威尼斯电影节金狮奖",
                            value: "https://letterboxd.com/hieusmile/list/golden-lion-venice-films-festival/"
                        },
                        {
                            title: "多伦多电影节观众奖",
                            value: "https://letterboxd.com/lise/list/tiff-audience-award-winners/"
                        },
                        {
                            title: "Letterboxd四大最爱访谈",
                            value: "https://letterboxd.com/andregps/list/letterboxd-four-favorites-interviews/"
                        },
                        {
                            title: "Letterboxd彩蛋",
                            value: "https://letterboxd.com/frozenpandaman/list/letterboxd-easter-eggs/"
                        },
                        {
                            title: "成人电影大合集",
                            value: "https://letterboxd.com/jlalibs/list/official-letterboxd-adult-film-megalist/"
                        },
                        {
                            title: "标准收藏",
                            value: "https://letterboxd.com/jbutts15/list/the-complete-criterion-collection/"
                        },
                        {
                            title: "Shout! Factory",
                            value: "https://letterboxd.com/callifrax/list/a-semi-complete-catalogue-of-shout-scream/"
                        },
                        {
                            title: "Arrow Video",
                            value: "https://letterboxd.com/backfish/list/arrow-video/"
                        },
                        {
                            title: "A24电影列表",
                            value: "https://letterboxd.com/a24/list/every-a24-film/"
                        },
                        {
                            title: "NEON电影列表",
                            value: "https://letterboxd.com/zincalloy23/list/neon/"
                        },
                        {
                            title: "MUBI电影列表",
                            value: "https://letterboxd.com/mubi/list/mubi-releases/"
                        },
                        {
                            title: "罗杰·伊伯特的伟大电影",
                            value: "https://letterboxd.com/dvideostor/list/roger-eberts-great-movies/"
                        },
                        {
                            title: "美国国会图书馆国家电影登记处",
                            value: "https://letterboxd.com/elvisisking/list/the-complete-library-of-congress-national/"
                        },
                        {
                            title: "IMDb前250名",
                            value: "https://letterboxd.com/dave/list/imdb-top-250/"
                        },
                        {
                            title: "全球影史票房榜",
                            value: "https://letterboxd.com/matthew/list/all-time-worldwide-box-office/"
                        },
                        {
                            title: "美国影史调整后本土票房榜（美国总票房）",
                            value: "https://letterboxd.com/matthew/list/box-office-mojo-all-time-domestic-adjusted/"
                        },
                        {
                            title: "死前必看的1001部电影（2024版）",
                            value: "https://letterboxd.com/gubarenko/list/1001-movies-you-must-see-before-you-die-2024/"
                        },
                        {
                            title: "AFI前100名（2007版）",
                            value: "https://letterboxd.com/afi/list/afis-100-years100-movies-10th-anniversary/"
                        },
                        {
                            title: "AFI前100名（1998版）",
                            value: "https://letterboxd.com/krisde/list/afi-top-100/"
                        },
                        {
                            title: "视与听伟大电影（影评人榜）",
                            value: "https://letterboxd.com/bfi/list/sight-and-sounds-greatest-films-of-all-time/"
                        },
                        {
                            title: "视与听伟大电影（导演榜）",
                            value: "https://letterboxd.com/bfi/list/sight-and-sounds-directors-100-greatest-films/"
                        },
                        {
                            title: "他们在拍电影，不是吗？前1000名（历史所有时期）",
                            value: "https://letterboxd.com/thisisdrew/list/they-shoot-pictures-dont-they-1000-greatest-6/"
                        },
                        {
                            title: "他们在拍电影，不是吗？前1000名（21世纪）",
                            value: "https://letterboxd.com/georgealexandru/list/greatest-films-the-2025-tspdt-edition-they-2/"
                        },
                        {
                            title: "美国编剧工会101部最伟大剧本（21世纪）",
                            value: "https://letterboxd.com/oneohtrix/list/writers-guild-of-america-101-greatest-screenplays/"
                        },
                        {
                            title: "韦斯·安德森——最爱",
                            value: "https://letterboxd.com/mlkarasek/list/wes-andersons-favorite-films/"
                        },
                        {
                            title: "阿里·艾斯特——当代最爱",
                            value: "https://letterboxd.com/mgamber/list/ari-asters-favorite-films/"
                        },
                        {
                            title: "英格玛·伯格曼——最爱",
                            value: "https://letterboxd.com/brsan/list/ingmar-bergmans-favorite-films/"
                        },
                        {
                            title: "奉俊昊——最爱",
                            value: "https://letterboxd.com/gpu/list/bong-joon-hos-favorites/"
                        },
                        {
                            title: "索菲亚·科波拉——最爱",
                            value: "https://letterboxd.com/mlkarasek/list/sofia-coppolas-favorite-films/"
                        },
                        {
                            title: "吉尔莫·德尔·托罗——推荐",
                            value: "https://letterboxd.com/ben_macdonald/list/guillermo-del-toros-twitter-film-recommendations/"
                        },
                        {
                            title: "克莱尔·德尼——最爱",
                            value: "https://letterboxd.com/zachzeidenberg/list/claire-denis-favorite-films/"
                        },
                        {
                            title: "罗伯特·艾格斯——最爱的恐怖片",
                            value: "https://letterboxd.com/radbradh/list/robert-eggers-favorite-horror-films/"
                        },
                        {
                            title: "大卫·芬奇——最爱",
                            value: "https://letterboxd.com/abdurrhmknkl/list/david-finchers-favorite-films/"
                        },
                        {
                            title: "格蕾塔·葛韦格——提及",
                            value: "https://letterboxd.com/nataliaivonica/list/greta-gerwig-talked-about-these-films/"
                        },
                        {
                            title: "斯坦利·库布里克——最爱",
                            value: "https://letterboxd.com/jeffroskull/list/stanley-kubricks-100-favorite-filmsthat-we/"
                        },
                        {
                            title: "黑泽明——最爱",
                            value: "https://letterboxd.com/michaelj/list/akira-kurosawas-100-favorite-movies/"
                        },
                        {
                            title: "斯派克·李——重要电影",
                            value: "https://letterboxd.com/theodo/list/spike-lees-95-essential-films-all-aspiring/"
                        },
                        {
                            title: "杰里米·索尔尼尔——最爱",
                            value: "https://letterboxd.com/crew/list/jeremy-saulnier-favorite-films/"
                        },
                        {
                            title: "昆汀·塔伦蒂诺——最爱",
                            value: "https://letterboxd.com/zachaigley/list/quentin-tarantinos-199-favorite-films/"
                        },
                        {
                            title: "阿涅斯·瓦尔达——最爱",
                            value: "https://letterboxd.com/otisbdriftwood/list/agnes-vardas-favorite-films/"
                        },
                        {
                            title: "亚历克斯·温特——50部B面和稀有作品",
                            value: "https://letterboxd.com/crew/list/alex-winters-50-b-sides-and-rarities/"
                        },
                        {
                            title: "埃德加·赖特——1000部最爱",
                            value: "https://letterboxd.com/crew/list/edgar-wrights-1000-favorite-movies/"
                        }
                    ],
                },
                {
                    name: "url_customize",
                    title: "自定义片单",
                    type: "input",
                    belongTo: {
                        paramName: "input_type",
                        value: ["customize"],
                    },
                    description: "自定义片单，如：https://letterboxd.com/crew/list/2024-highest-rated-films/",
                },
                {
                    name: "sort_by",
                    title: "排序",
                    type: "enumeration",
                    value: "default",
                    enumOptions: [
                        {title: "默认排序", value: "default"},
                        {title: "反序", value: "reverse"},
                        {title: "名称", value: "name"},
                        {title: "流行度", value: "popular"},
                        {title: "随机", value: "shuffle"},
                        {title: "最后添加", value: "added"},
                        {title: "最早添加", value: "added-earliest"},
                        {title: "最新发行", value: "release"},
                        {title: "最早发行", value: "release-earliest"},
                        {title: "最高评分", value: "rating"},
                        {title: "最低评分", value: "rating-lowest"},
                        {title: "最短时长", value: "shortest"},
                        {title: "最长时长", value: "longest"},
                    ],
                },
                {
                    name: "genre",
                    title: "类型",
                    type: "enumeration",
                    value: "default",
                    enumOptions: [
                        {title: "所有类型", value: "default"},
                        {title: "动作", value: "action"},
                        {title: "冒险", value: "adventure"},
                        {title: "动画", value: "animation"},
                        {title: "喜剧", value: "comedy"},
                        {title: "犯罪", value: "crime"},
                        {title: "纪录片", value: "documentary"},
                        {title: "戏剧", value: "drama"},
                        {title: "家庭", value: "family"},
                        {title: "奇幻", value: "fantasy"},
                        {title: "历史", value: "history"},
                        {title: "恐怖", value: "horror"},
                        {title: "音乐", value: "music"},
                        {title: "神秘", value: "mystery"},
                        {title: "浪漫", value: "romance"},
                        {title: "科幻", value: "science-fiction"},
                        {title: "惊悚", value: "thriller"},
                        {title: "电视电影", value: "tv-movie"},
                        {title: "战争", value: "war"},
                        {title: "西部", value: "western"}
                    ],
                },
                {
                    name: "decade",
                    title: "年代",
                    type: "enumeration",
                    value: "default",
                    enumOptions: [
                        {title: "所有年代", value: "default"},
                        {title: "2020年代", value: "2020s"},
                        {title: "2010年代", value: "2010s"},
                        {title: "2000年代", value: "2000s"},
                        {title: "1990年代", value: "1990s"},
                        {title: "1980年代", value: "1980s"},
                        {title: "1970年代", value: "1970s"},
                        {title: "1960年代", value: "1960s"},
                        {title: "1950年代", value: "1950s"},
                        {title: "1940年代", value: "1940s"},
                        {title: "1930年代", value: "1930s"},
                        {title: "1920年代", value: "1920s"},
                        {title: "1910年代", value: "1910s"},
                        {title: "1900年代", value: "1900s"},
                        {title: "1890年代", value: "1890s"},
                        {title: "1880年代", value: "1880s"},
                        {title: "1870年代", value: "1870s"}
                    ],
                },
                {
                    name: "page",
                    title: "页码",
                    type: "page"
                },
            ],
        },
    ],
    version: "1.1.1",
    requiredVersion: "0.0.1",
    description: "解析Letterboxd片单内的影片【置顶新增大量特色片单】",
    author: "huangxd｜𝙈𝙖𝙠𝙠𝙖𝙋𝙖𝙠𝙠𝙖",
    site: "https://github.com/huangxd-/ForwardWidgets"
};

async function extractLetterboxdUrlsFromResponse(responseData, minNum, maxNum) {
    let $ = Widget.html.load(responseData);
    let filmContainers = $('li.posteritem div.react-component[data-target-link]');

    if (!filmContainers.length) {
        throw new Error("未找到包含data-target-link属性的电影容器");
    }

    let letterboxdUrls = Array.from(new Set(
        filmContainers
            .map((i, el) => {
                const targetLink = $(el).data('target-link') || $(el).attr('data-target-link');
                if (!targetLink || !targetLink.startsWith('/film/')) {
                    console.warn(`无效的影片链接属性值：${targetLink}`);
                    return null;
                }
                return `https://letterboxd.com${targetLink}`;
            })
            .get()
            .filter(Boolean)
    ));

    const start = Math.max(0, minNum - 1);
    const end = Math.min(maxNum, letterboxdUrls.length);
    return letterboxdUrls.slice(start, end);
}

async function loadLetterboxdToImdbCache() {
    try {
        const response = await Widget.http.get('https://gist.githubusercontent.com/huangxd-/60712812d3d8b3c4422d46c6bc07046c/raw/letterboxd_url2imdb.json');
        const letterboxdToImdbCache = response.data;
        console.log('已加载 Letterboxd 到 IMDb ID 缓存');
        return letterboxdToImdbCache;
    } catch (error) {
        console.error('加载 Letterboxd 到 IMDb ID 缓存失败:', error);
    }
}

async function fetchImdbIdsFromLetterboxdUrls(letterboxdUrls) {
    const letterboxdToImdbCache = await loadLetterboxdToImdbCache();
    let imdbIdPromises = letterboxdUrls.map(async (url) => {
        try {
            if (letterboxdToImdbCache && letterboxdToImdbCache[url]) {
                console.log(`使用缓存获取 IMDb ID: ${letterboxdToImdbCache[url]} (来自 ${url})`);
                return letterboxdToImdbCache[url];
            }

            let detailResponse = await Widget.http.get(url, {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    "Pragma": "no-cache",
                    "Expires": "0",
                },
            });

            let $ = Widget.html.load(detailResponse.data);
            let imdbLinkEl = $('a[data-track-action="IMDb"]').first();

            if (!imdbLinkEl.length) return null;

            let href = imdbLinkEl.attr('href');
            let match = href.match(/title\/(tt\d+)/);

            return match ? `${match[1]}` : null;
        } catch {
            return null;
        }
    });

    let imdbIds = [...new Set(
        (await Promise.all(imdbIdPromises))
            .filter(Boolean)
            .map((item) => item)
    )].map((id) => ({
        id,
        type: "imdb",
    }));
    console.log("请求imdbIds:", imdbIds);
    return imdbIds;
}

async function fetchLetterboxdData(url, headers = {}, minNum, maxNum) {
    try {
        const response = await Widget.http.get(url, {
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                "Cache-Control": "no-cache, no-store, must-revalidate",
                "Pragma": "no-cache",
                "Expires": "0",
                ...headers,
            },
        });

        console.log("请求结果:", response.data);

        let letterboxdUrls = await extractLetterboxdUrlsFromResponse(response.data, minNum, maxNum);

        return await fetchImdbIdsFromLetterboxdUrls(letterboxdUrls);
    } catch (error) {
        console.error("处理失败:", error);
        throw error;
    }
}

async function loadListItems(params = {}) {
    try {
        const page = params.page;
        const inputType = params.input_type || "";
        const listSelect = params.list_select || "";
        const urlCustomize = params.url_customize || "";
        const sortBy = params.sort_by || "default";
        const genre = params.genre || "default";
        const decade = params.decade || "default";
        const count = 20;
        const minNum = ((page - 1) % 5) * count + 1;
        const maxNum = ((page - 1) % 5) * count + 20;
        const letterboxdPage = Math.floor((page - 1) / 5) + 1;

        let listUrl;
        if (inputType === "select") {
            listUrl = listSelect
        } else {
            listUrl = urlCustomize
        }

        if (!listUrl) {
            throw new Error("必须提供 Letterboxd 片单完整URL");
        }

        // 确保 URL 以斜杠结尾
        let baseUrl = listUrl.endsWith('/') ? listUrl : `${listUrl}/`;
        let url = baseUrl;
        
        // 1. 严格按照 Letterboxd 格式：先拼接年份、类型和排序
        if (decade !== "default") {
            url += `decade/${decade}/`;
        }
        if (genre !== "default") {
            url += `genre/${genre}/`;
        }
        if (sortBy !== "default") {
            url += `by/${sortBy}/`;
        }
        
        // 2. 避免404：Letterboxd 拒绝第一页带有 /page/1/，只有在大于第一页时才拼接
        if (letterboxdPage > 1) {
            url += `page/${letterboxdPage}/`;
        }

        console.log("最终请求的 Letterboxd URL: ", url);

        return await fetchLetterboxdData(url, {}, minNum, maxNum);
    } catch (error) {
        console.error("处理失败:", error);
        throw error;
    }
}
