// =============UserScript=============
// @name         并发弹幕 (官方核心精调增强版)
// @version      2.0.0
// @description  照最新官方 danmu.js 模块逻辑全部重构，无损保留二改的繁简互转、数量限制、多级屏蔽词及颜色重写功能。
// @author       Forward & 𝙈𝙖𝙠𝙠𝙖𝙋𝙖𝙠𝙠𝙖
// =============UserScript=============

WidgetMetadata = {
  id: "danmu_api_Max_binfa_testv2",
  title: "并发弹幕 (官方最新核心版)",
  version: "2.0.0",
  requiredVersion: "0.0.2",
  description: "采用官方最新 v1.1.6 搜索匹配逻辑。在此基础上注入：多 api 换行并发、繁简互转、全段等比例数量控制、多重屏蔽词过滤、弹幕色彩重写等自研功能。",
  author: "𝙈𝙖𝙠𝙠𝙖𝙋𝙖𝙠𝙠𝙖",
  site: "https://t.me/MakkaPakkaOvO",
  globalParams: [
    {
      name: "server",
      title: "自定义服务器",
      type: "input",
      description: "多服务器请换行分割，格式如：弹弹play,https://api.dandanplay.net",
      placeholders: [
        {
          title: "弹弹play",
          value: "https://api.dandanplay.net",
        },
      ],
    },
    { 
      name: "maxCount", 
      title: "📊 弹幕数量上限", 
      type: "input", 
      value: "3000",
      description: "填0或留空不限制。超出则按时间全段等比例随机剔除" 
    },
    { 
      name: "searchBlockKeywords", 
      title: "👁️ 搜索结果屏蔽词 (逗号分隔)", 
      type: "input", 
      value: "",
      description: "屏蔽不想看到的搜索结果，如: 动态漫,电视剧,漫画" 
    },
    { 
      name: "convertMode", 
      title: "🔠 弹幕转换", 
      type: "enumeration", 
      value: "none",
      enumOptions: [
          { title: "保持原样", value: "none" },
          { title: "转简体 (繁->简)", value: "t2s" },
          { title: "转繁体 (简->繁)", value: "s2t" }
      ]
    },
    { 
      name: "colorMode", 
      title: "🎨 弹幕颜色", 
      type: "enumeration", 
      value: "none",
      enumOptions: [
          { title: "保持原样", value: "none" },
          { title: "全部纯白", value: "white" },
          { title: "部分彩色 (50%彩色)", value: "partial" },
          { title: "完全彩色 (100%彩色)", value: "all" }
      ]
    },
    { 
      name: "blockKeywords", 
      title: "🚫 弹幕内容屏蔽词 (逗号分隔)", 
      type: "input", 
      value: "" 
    }
  ],
  modules: [
    {
      id: "searchDanmu",
      title: "搜索弹幕",
      functionName: "searchDanmu",
      type: "danmu",
      params: [],
    },
    {
      id: "getDetail",
      title: "获取详情",
      functionName: "getDetailById",
      type: "danmu",
      params: [],
    },
    {
      id: "getComments",
      title: "获取弹幕",
      functionName: "getCommentsById",
      type: "danmu",
      params: [],
    },
  ],
};

// ==========================================
// 1. 繁简转换核心 (自研特色功能全保留)
// ==========================================
const DICT_URL_S2T = "https://cdn.jsdelivr.net/npm/opencc-data@1.0.3/data/STCharacters.txt";
const DICT_URL_T2S = "https://cdn.jsdelivr.net/npm/opencc-data@1.0.3/data/TSCharacters.txt";
let MEM_DICT = null;

async function initDict(mode) {
  if (!mode || mode === "none") return;
  if (MEM_DICT) return; 
  const key = `dict_${mode}`;
  let local = await Widget.storage.get(key);
  if (!local) {
      try {
          const res = await Widget.http.get(mode === "s2t" ? DICT_URL_S2T : DICT_URL_T2S);
          let text = res.data || res;
          if (typeof text === 'string' && text.length > 100) {
              const map = {};
              text.split('\n').forEach(l => {
                  const p = l.split(/\s+/);
                  if (p.length >= 2) map[p[0]] = p[1];
              });
              await Widget.storage.set(key, JSON.stringify(map));
              MEM_DICT = map;
          }
      } catch (e) {}
  } else {
      try { MEM_DICT = JSON.parse(local); } catch (e) {}
  }
}

function convertText(text) {
  if (!text || !MEM_DICT) return text;
  let res = "";
  for (let char of text) { res += MEM_DICT[char] || char; }
  return res;
}

// ==========================================
// 2. 官方最新核心骨架与匹配引擎
// ==========================================
const DEFAULT_DANMU_SERVER = "https://api.dandanplay.net";
const DANMU_SERVER_ID_SEPARATOR = "__FORWARD_DANMU_SERVER__";
const DANMU_SOURCE_BATCH_SIZE = 5;

function normalizeDanmuServer(server) {
  return String(server || "").trim().replace(/\/+$/, "");
}

function getDanmuSourceTitle(server) {
  try {
    return new URL(server).host || server;
  } catch (error) {
    return server;
  }
}

function looksLikeServerAddress(value) {
  return /^(https?:\/\/|localhost\b|127\.0\.0\.1\b)/i.test(value);
}

function makeDanmuSource(title, server, explicitTitle) {
  const normalizedServer = normalizeDanmuServer(server);
  const normalizedTitle = String(title || "").trim();
  return {
    title: normalizedTitle || getDanmuSourceTitle(normalizedServer),
    server: normalizedServer,
    explicitTitle: Boolean(explicitTitle && normalizedTitle),
  };
}

function parseDanmuSourceLine(line) {
  const separatorMatch = line.match(/[，,]/);
  if (!separatorMatch) {
    return makeDanmuSource("", line, false);
  }

  const separatorIndex = separatorMatch.index;
  const title = line.slice(0, separatorIndex).trim();
  const server = line.slice(separatorIndex + separatorMatch[0].length).trim();

  if (!server && looksLikeServerAddress(title)) {
    return makeDanmuSource("", title, false);
  }

  return makeDanmuSource(title, server, true);
}

function getDanmuSources(server) {
  const serverValue = Array.isArray(server) ? server.join("\n") : server;
  const rawValue = String(serverValue || "").trim();

  if (!rawValue) {
    return [makeDanmuSource("弹弹play", DEFAULT_DANMU_SERVER, true)];
  }

  const lines = rawValue.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  if (lines.length === 1) {
    const commaParts = lines[0].split(/[，,]/).map((item) => item.trim()).filter(Boolean);
    if (commaParts.length > 1 && commaParts.every(looksLikeServerAddress)) {
      return dedupeDanmuSources(commaParts.map((item) => makeDanmuSource("", item, false)));
    }
  }

  return dedupeDanmuSources(lines.map(parseDanmuSourceLine).filter((source) => source.server));
}

function dedupeDanmuSources(sources) {
  const sourceMap = new Map();
  for (const source of sources) {
    if (!sourceMap.has(source.server)) {
      sourceMap.set(source.server, source);
    }
  }
  return Array.from(sourceMap.values());
}

function bindDanmuServerId(id, source, shouldBind) {
  if (!shouldBind || id === undefined || id === null) {
    return id;
  }
  const payload = JSON.stringify({
    title: source.title,
    server: source.server,
  });
  return `${encodeURIComponent(payload)}${DANMU_SERVER_ID_SEPARATOR}${id}`;
}

function parseDanmuServerId(id) {
  if (typeof id !== "string") {
    return { id, source: null };
  }

  const separatorIndex = id.indexOf(DANMU_SERVER_ID_SEPARATOR);
  if (separatorIndex === -1) {
    return { id, source: null };
  }

  const encodedSource = id.slice(0, separatorIndex);
  const rawId = id.slice(separatorIndex + DANMU_SERVER_ID_SEPARATOR.length);
  const decodedSource = decodeURIComponent(encodedSource);
  try {
    const source = JSON.parse(decodedSource);
    if (source && source.server) {
      return {
        id: rawId,
        source: makeDanmuSource(source.title, source.server, true),
      };
    }
  } catch (error) {}

  return {
    id: rawId,
    source: makeDanmuSource("", decodedSource, false),
  };
}

function getDanmuRequestSources(server, boundSource) {
  return boundSource ? [boundSource] : getDanmuSources(server);
}

function shouldShowDanmuSource(sources) {
  return sources.some((source) => source.explicitTitle);
}

function appendDanmuSourceTitle(title, source, shouldAppend) {
  if (!shouldAppend) {
    return title;
  }
  return `${title} - ${source.title}`;
}

function getDanmuHeaders() {
  return {
    "Content-Type": "application/json",
    "User-Agent": "ForwardWidgets/1.0.0",
  };
}

async function mapDanmuSourcesInBatches(sources, batchSize, task) {
  const results = [];
  for (let index = 0; index < sources.length; index += batchSize) {
    const batch = sources.slice(index, index + batchSize);
    const batchResults = await Promise.all(batch.map(task));
    results.push(...batchResults);
  }
  return results;
}

function extractSeasonNumber(animeTitle) {
  const title = String(animeTitle || "");
  let m = title.match(/第\s*([0-9一二三四五六七八九十壹贰叁肆伍陆柒捌玖拾]+)\s*[季部]/);
  if (m) {
    const n = convertChineseNumber(m[1]);
    if (n > 0) return n;
  }
  m = title.match(/(?:_|\bS|\bSeason\s+)(\d{1,2})\b/i);
  if (m) return Number(m[1]);
  m = title.match(/[^\d](\d{1,2})$/);
  if (m) return Number(m[1]);
  return null;
}

function filterAnimes(rawAnimes, type, season, queryTitle) {
  const movieTypes = ["movie", "电影", "奇幻片", "剧场版"];
  let animes = [];

  if (rawAnimes && rawAnimes.length > 0) {
    animes = rawAnimes.filter((anime) => {
      const animeType = (anime.type || "").toLowerCase();
      if (type === "movie") {
        return movieTypes.some(t => t.toLowerCase() === animeType);
      }
      if (type === "tv") {
        return !movieTypes.some(t => t.toLowerCase() === animeType);
      }
      return true;
    });
    if (season) {
      const seasonNum = Number(season);
      const matchedAnimes = animes.filter((anime) => {
        if (!anime.animeTitle.includes(queryTitle)) return false;
        const animeSeason = extractSeasonNumber(anime.animeTitle);
        return animeSeason !== null && animeSeason === seasonNum;
      });
      if (matchedAnimes.length > 0) {
        animes = matchedAnimes;
      }
    }
  }

  return animes;
}

function convertChineseNumber(chineseNumber) {
  if (/^\d+$/.test(chineseNumber)) {
    return Number(chineseNumber);
  }
  const digits = {
    '零': 0, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9,
    '壹': 1, '貳': 2, '參': 3, '肆': 4, '伍': 5, '陸': 6, '柒': 7, '捌': 8, '玖': 9
  };
  const units = {
    '十': 10, '百': 100, '千': 1000,
    '拾': 10, '佰': 100, '仟': 1000
  };
  let result = 0;
  let current = 0;
  for (let i = 0; i < chineseNumber.length; i++) {
    const char = chineseNumber[i];
    if (digits[char] !== undefined) {
      current = digits[char];
    } else if (units[char] !== undefined) {
      if (current === 0 && units[char] === 10) current = 1;
      result += current * units[char];
      current = 0;
    }
  }
  result += current;
  return result;
}

// ==========================================
// 3. 功能增强层 (注入你的拦截器逻辑)
// ==========================================

async function searchDanmu(params) {
  const { tmdbId, type, title, season, link, videoUrl, server, searchBlockKeywords } = params;

  let queryTitle = title;
  const sources = getDanmuSources(server);
  const shouldBindSource = shouldShowDanmuSource(sources);
  const results = await mapDanmuSourcesInBatches(sources, DANMU_SOURCE_BATCH_SIZE, async (source) => {
    try {
      const response = await Widget.http.get(
        `${source.server}/api/v2/search/anime?keyword=${encodeURIComponent(queryTitle)}`,
        { headers: getDanmuHeaders() }
      );

      if (!response) throw new Error("获取数据失败");
      const data = response.data;
      if (!data.success) throw new Error(data.errorMessage || "API调用失败");

      let rawAnimes = Array.isArray(data.animes) ? data.animes : [];
      if (rawAnimes.length === 0) {
        const epResponse = await Widget.http.get(
          `${source.server}/api/v2/search/episodes?anime=${encodeURIComponent(queryTitle)}`,
          { headers: getDanmuHeaders() }
        );
        const epData = epResponse && epResponse.data;
        if (epData && Array.isArray(epData.animes)) {
          rawAnimes = epData.animes.map(({ episodes, ...anime }) => anime);
        }
      }

      return {
        source,
        animes: filterAnimes(rawAnimes, type, season, queryTitle),
      };
    } catch (error) {
      console.error(`请求 ${source.server} 失败:`, error);
      return { source, error };
    }
  });

  let lastError = null;
  let hasSuccessfulResponse = false;
  let animes = [];

  for (const result of results) {
    if (result.error) {
      lastError = result.error;
      continue;
    }
    hasSuccessfulResponse = true;
    animes.push(...result.animes.map((anime) => ({
      ...anime,
      animeId: bindDanmuServerId(anime.bangumiId || anime.animeId, result.source, shouldBindSource),
      animeTitle: appendDanmuSourceTitle(anime.animeTitle, result.source, shouldBindSource),
    })));
  }

  if (hasSuccessfulResponse) {
    // ----------------------------------------------------
    // ✨ 注入功能: 搜索结果屏蔽词过滤
    // ----------------------------------------------------
    if (animes.length > 0 && searchBlockKeywords) {
      const blockedList = searchBlockKeywords.split(/[,，]/).map(k => k.trim()).filter(k => k.length > 0);
      if (blockedList.length > 0) {
        animes = animes.filter(a => {
          if (!a.animeTitle) return false;
          for (const keyword of blockedList) {
            if (a.animeTitle.includes(keyword)) return false;
          }
          return true;
        });
      }
    }
    return { animes: animes };
  }

  throw lastError || new Error("获取数据失败");
}

async function getDetailById(params) {
  const { server, animeId } = params;
  if (!animeId) throw new Error("动漫ID不能为空");

  const parsedAnimeId = parseDanmuServerId(animeId);
  const sources = getDanmuRequestSources(server, parsedAnimeId.source);
  const shouldBindSource = shouldShowDanmuSource(sources);
  
  let lastError = null;
  let hasSuccessfulResponse = false;
  const episodes = [];

  for (const source of sources) {
    try {
      const response = await Widget.http.get(
        `${source.server}/api/v2/anime/${parsedAnimeId.id}`,
        { headers: getDanmuHeaders() }
      );

      if (!response) throw new Error("获取数据失败");
      const data = response.data;
      if (!data.success) throw new Error(data.errorMessage || "API调用失败");

      hasSuccessfulResponse = true;
      const rawEpisodes = (data.anime && Array.isArray(data.anime.episodes)) ? data.anime.episodes : [];
      episodes.push(...rawEpisodes.map((episode) => ({
        ...episode,
        episodeId: bindDanmuServerId(episode.episodeId, source, shouldBindSource),
      })));
    } catch (error) {
      lastError = error;
      console.error(`请求 ${source.server} 失败:`, error);
    }
  }

  if (hasSuccessfulResponse) {
    return { episodes: episodes };
  }

  throw lastError || new Error("获取数据失败");
}

async function getCommentsById(params) {
  const { server, commentId, maxCount, blockKeywords, convertMode, colorMode } = params;

  if (commentId) {
    const parsedCommentId = parseDanmuServerId(commentId);
    const sources = getDanmuRequestSources(server, parsedCommentId.source);
    let lastError = null;

    for (const source of sources) {
      try {
        const response = await Widget.http.get(
          `${source.server}/api/v2/comment/${parsedCommentId.id}?async=1&withRelated=true&chConvert=1`,
          { headers: getDanmuHeaders() }
        );

        if (response && response.data) {
          let data = response.data;
          let list = data.comments || [];

          // ----------------------------------------------------
          // ✨ 注入功能: 弹幕多重过滤与拦截处理
          // ----------------------------------------------------
          
          // 1. 弹幕内容屏蔽词
          if (blockKeywords && list.length > 0) {
              const blockedList = blockKeywords.split(/[,，]/).map(k => k.trim()).filter(k => k.length > 0);
              if (blockedList.length > 0) {
                  list = list.filter(c => {
                      if (!c.m) return true;
                      for (const keyword of blockedList) {
                          if (c.m.includes(keyword)) return false;
                      }
                      return true;
                  });
              }
          }

          // 2. 繁简体转换
          if (convertMode && convertMode !== "none" && list.length > 0) {
              await initDict(convertMode);
              if (MEM_DICT) {
                  list.forEach(c => {
                      if (c.m) c.m = convertText(c.m);
                  });
              }
          }

          // 3. 弹幕上限全段比例抽稀剔除
          if (maxCount) {
              const max = parseInt(maxCount);
              if (!isNaN(max) && max > 0 && list.length > max) {
                  list.sort((a, b) => {
                      const timeA = a.p ? parseFloat(a.p.split(',')[0]) : 0;
                      const timeB = b.p ? parseFloat(b.p.split(',')[0]) : 0;
                      return timeA - timeB;
                  });

                  const keepRatio = max / list.length;
                  list = list.filter(() => Math.random() < keepRatio);

                  if (list.length > max) {
                      list = list.slice(0, max);
                  }

                  list.sort((a, b) => {
                      const timeA = a.p ? parseFloat(a.p.split(',')[0]) : 0;
                      const timeB = b.p ? parseFloat(b.p.split(',')[0]) : 0;
                      return timeA - timeB;
                  });
              }
          }

          // 4. 自定义色彩重写
          if (colorMode && colorMode !== "none" && list.length > 0) {
              const COLORS = [
                  16711680, 16776960, 16752384, 16738740, 13445375, 11730943, 11730790
              ];
              const COLOR_WHITE = "16777215";

              list.forEach(c => {
                  if (c.p) {
                      let parts = c.p.split(',');
                      if (parts.length >= 3) {
                          let colorIndex = parts.length >= 8 ? 3 : 2; 
                          let targetColor = COLOR_WHITE;

                          if (colorMode === "white") {
                              targetColor = COLOR_WHITE;
                          } else if (colorMode === "partial") {
                              targetColor = Math.random() < 0.5 
                                  ? COLORS[Math.floor(Math.random() * COLORS.length)].toString() 
                                  : COLOR_WHITE;
                          } else if (colorMode === "all") {
                              targetColor = COLORS[Math.floor(Math.random() * COLORS.length)].toString();
                          }
                          
                          parts[colorIndex] = targetColor;
                          c.p = parts.join(',');
                      }
                  }
              });
          }

          data.comments = list;
          return data;
        }

        lastError = new Error("获取数据失败");
      } catch (error) {
        lastError = error;
        console.error(`请求 ${source.server} 失败:`, error);
      }
    }

    throw lastError || new Error("获取数据失败");
  }

  // ----------------------------------------------------
  // 4. 备用兜底逻辑 (官方通过视频参数精准匹配端点)
  // ----------------------------------------------------
  const sources = getDanmuSources(server);
  const promises = [];

  for (let i = 0; i < sources.length; i += DANMU_SOURCE_BATCH_SIZE) {
    const batchSources = sources.slice(i, i + DANMU_SOURCE_BATCH_SIZE);
    const batchPromises = batchSources.map((source) =>
      (async () => {
        try {
          const body = {
            anime: params.title,
            episode: params.episodeName,
            season: params.season,
            ep: params.episode,
          };
          const response = await Widget.http.post(
            `${source.server}/api/v2/extcomment`,
            body,
            { headers: getDanmuHeaders() }
          );
          return { source, data: response?.data };
        } catch (error) {
          throw Object.assign(error, { source });
        }
      })()
    );
    promises.push(...batchPromises);
  }

  const results = await Promise.allSettled(promises);

  for (const result of results) {
    if (result.status === "fulfilled" && result.value?.data) {
       return result.value.data;
    } else if (result.status === "rejected") {
      console.error(`请求 ${result.reason.source.server} 失败:`, result.reason);
    }
  }

  throw new Error("获取数据失败");
}
