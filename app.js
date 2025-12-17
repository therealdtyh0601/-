// 阳宅三部曲 · 快速体检（Lumi Free）
// 目的：用“空间 + 主题”快速判断：主因更像 内挂 / 外挂 / 空间，并给出可执行建议
// 注意：这是结构判断，不做凶吉断语

const ROOMS = [
  { id: "bedroom",  label: "🛏️ 卧室",   domain: "rest" },
  { id: "bed",      label: "🧸 床位",   domain: "rest" },
  { id: "living",   label: "🛋️ 客厅",   domain: "social" },
  { id: "door",     label: "🚪 大门",   domain: "gateway" },
  { id: "kitchen",  label: "🍳 厨房",   domain: "resource" },
  { id: "toilet",   label: "🚽 厕所",   domain: "leak" },
  { id: "study",    label: "📚 书房",   domain: "focus" },
  { id: "balcony",  label: "🌿 阳台",   domain: "outlet" },
  { id: "workdesk", label: "💻 工作位", domain: "focus" },
];

const THEMES = [
  { id: "energy",   label: "⚡ 精力",     bias: { inner: 3, outer: 0, space: 2 } },
  { id: "love",     label: "💕 感情",     bias: { inner: 1, outer: 3, space: 2 } },
  { id: "family",   label: "👨‍👩‍👧‍👦 家庭", bias: { inner: 1, outer: 3, space: 2 } },
  { id: "work",     label: "🧑‍💼 工作",   bias: { inner: 1, outer: 1, space: 3 } },
  { id: "money",    label: "💰 财务",     bias: { inner: 1, outer: 0, space: 3 } },
  { id: "conflict", label: "💥 口舌",     bias: { inner: 0, outer: 3, space: 2 } },
  { id: "sleep",    label: "😴 睡眠",     bias: { inner: 4, outer: 0, space: 1 } },
  { id: "study",    label: "📈 学业",     bias: { inner: 1, outer: 0, space: 3 } },
];

const TRIAD = {
  inner: { emoji: "🛏️", name: "内挂", desc: "卧室/床位：你每天怎么“充电”", key: "inner" },
  outer: { emoji: "👥", name: "外挂", desc: "家中角色：谁最先被影响", key: "outer" },
  space: { emoji: "🏠", name: "空间", desc: "功能分区：问题卡在哪个领域", key: "space" },
};

const SPACE_HINT = {
  rest:     { add: { inner: 3, space: 1 }, text: "你选的是休息区：优先看“内挂”是否拖累。"},
  social:   { add: { outer: 2, space: 2 }, text: "你选的是互动区：更像“外挂 + 空间”的组合问题。"},
  gateway:  { add: { space: 3 },           text: "你选的是入口：多半是“机会/外界流动”的空间层问题。"},
  resource: { add: { space: 3 },           text: "你选的是资源区：财务/供给常落在空间层（使用方式）。"},
  leak:     { add: { space: 3 },           text: "你选的是消耗区：先减损，再谈增强。"},
  focus:    { add: { space: 3, inner: 1 }, text: "你选的是专注区：空间层为主，但也可能影响内挂节律。"},
  outlet:   { add: { space: 2 },           text: "你选的是出口区：更像“空间流通”与“节律”的问题。"},
};

const ACTIONS = {
  inner: {
    title: "🛠️ 内挂优先：先把“充电系统”修好",
    bullets: [
      "🧺 先把床周边 1m 清空：杂物/纸箱/堆叠先移走",
      "🪟 睡前 30 分钟降刺激：关强光、收手机、关吵杂",
      "🧸 床只做两件事：睡觉 & 休息（别在床上开会/刷剧）",
      "🧼 枕头/床单先换一轮：把“身体不适”变量降到最低",
      "🧭 若能调：床头靠实、动线顺（不求玄，只求安心）",
    ],
    tags: ["恢复", "节律", "情绪基线"],
    why: "很多“关系/工作/财务”的乱，其实是你长期没充够电。先修底层，后面才有力。"
  },
  outer: {
    title: "🛠️ 外挂优先：先处理“角色压力”",
    bullets: [
      "🗣️ 先定义一条家庭规则：什么事可以说、什么事先冷却再说",
      "📦 把“公共空间的权责”讲清：谁负责、谁决定、谁收尾",
      "🧾 把争论从“对错”改成“分工”：把情绪降维成流程",
      "🧠 记一句：先处理误会，再处理事情（顺序错就一直吵）",
      "🫶 给角色留出口：每个人要有自己的休息角落/时间",
    ],
    tags: ["边界", "分工", "沟通方式"],
    why: "外挂问题常见的不是“家里风水不好”，而是“角色没被照顾、边界不清”。"
  },
  space: {
    title: "🛠️ 空间优先：先改“使用方式”而不是改格局",
    bullets: [
      "🧭 先做一条动线：从门→客厅→关键空间，走起来别被卡",
      "🧺 每个空间只留一个主功能：别让厨房变仓库、书桌变杂物台",
      "🧻 ‘消耗点’先减损：厕所/杂物角先清理，再谈增强",
      "🧯 把冲突点降噪：高噪音/强光/尖角冲撞感先处理（用布/灯/摆位）",
      "📍 选一个空间做“恢复区”：让家里至少有一个地方是舒服的",
    ],
    tags: ["动线", "功能", "减损优先"],
    why: "空间层的问题，最常是“东西不在该在的位置”。先改用法，胜过大动工程。"
  }
};

let state = { room: null, theme: null };

const $ = (id) => document.getElementById(id);

function pad(n){ return String(n).padStart(2,"0"); }
function nowStr(){
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function applyTheme(theme){
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem("lumi_theme", theme);
}
function toggleTheme(){
  const cur = document.documentElement.getAttribute("data-theme") || "dark";
  applyTheme(cur === "dark" ? "light" : "dark");
}

function makeChip(label, active, onClick){
  const b = document.createElement("button");
  b.type = "button";
  b.className = "chip" + (active ? " active" : "");
  b.textContent = label;
  b.addEventListener("click", onClick);
  return b;
}

function renderRooms(){
  const wrap = $("roomChips");
  wrap.innerHTML = "";
  ROOMS.forEach(r=>{
    wrap.appendChild(makeChip(r.label, state.room?.id === r.id, ()=>{
      state.room = r;
      renderRooms();
      $("roomHint").textContent = SPACE_HINT[r.domain]?.text || "已选择空间。";
    }));
  });
}

function renderThemes(){
  const wrap = $("themeChips");
  wrap.innerHTML = "";
  THEMES.forEach(t=>{
    wrap.appendChild(makeChip(t.label, state.theme?.id === t.id, ()=>{
      state.theme = t;
      renderThemes();
      $("themeHint").textContent = "已选择主题。";
    }));
  });
}

function scoreTriad(){
  // 基础分：主题偏向 + 空间域加权
  const score = { inner: 0, outer: 0, space: 0 };

  if (!state.theme || !state.room) return null;

  // 主题 bias
  score.inner += state.theme.bias.inner || 0;
  score.outer += state.theme.bias.outer || 0;
  score.space += state.theme.bias.space || 0;

  // 空间 domain 加权
  const hint = SPACE_HINT[state.room.domain];
  if (hint?.add){
    Object.entries(hint.add).forEach(([k,v])=>{
      score[k] += v;
    });
  }

  // 卧室/床位进一步偏内挂
  if (state.room.id === "bedroom" || state.room.id === "bed") {
    score.inner += 2;
  }

  // 客厅/大门偏外/空间
  if (state.room.id === "living") { score.outer += 1; score.space += 1; }
  if (state.room.id === "door")   { score.space += 2; }

  return score;
}

function rank(score){
  const entries = Object.entries(score).sort((a,b)=>b[1]-a[1]);
  return entries.map(([k,v])=>({ key:k, val:v, ...TRIAD[k] }));
}

function buildOutput(primary, ranking){
  const room = state.room;
  const theme = state.theme;
  const a = ACTIONS[primary.key];

  const secondary = ranking[1];
  const tertiary  = ranking[2];

  const prioLine = `1️⃣ ${primary.emoji}${primary.name}  →  2️⃣ ${secondary.emoji}${secondary.name}  →  3️⃣ ${tertiary.emoji}${tertiary.name}`;

  $("timeLabel").textContent = nowStr();
  $("primaryLabel").textContent = `${primary.emoji} ${primary.name}`;
  $("prioLabel").textContent = prioLine;

  const box = $("output");
  box.innerHTML = `
    <div class="block">
      <div class="h">🎯 你选的：${room.label} × ${theme.label}</div>
      <div class="small">📌 这是结构判断：帮你决定“从哪里开始改”。</div>
      <div class="divider"></div>

      <div class="h">✅ 当前最像的主因：${primary.emoji} ${primary.name}</div>
      <div>• ${primary.desc}</div>
      <div class="small">🧠 为什么：${a.why}</div>

      <div class="tagrow">
        ${a.tags.map(t=>`<span class="tag">#${t}</span>`).join("")}
      </div>
    </div>

    <div class="block">
      <div class="h">${a.title}</div>
      <ul class="todo">
        ${a.bullets.map(b=>`<li>${b}</li>`).join("")}
      </ul>
      <div class="small">⏱️ 建议：先做其中 <b>1 项</b>，48 小时内观察变化，再做下一项。</div>
    </div>

    <div class="block">
      <div class="h">🧾 建议优先级（为什么这么排）</div>
      <div>• 1️⃣ ${primary.emoji}${primary.name}：这层是“根因/底层”</div>
      <div>• 2️⃣ ${secondary.emoji}${secondary.name}：这层是“被牵动的反应层”</div>
      <div>• 3️⃣ ${tertiary.emoji}${tertiary.name}：这层是“最后才优化的表现层”</div>
      <div class="small">📌 你不用一次改完。一次改一件事，才会真的见效。</div>
    </div>
  `;
}

function doCheck(){
  if (!state.room || !state.theme){
    $("output").innerHTML = `<div class="muted">还差一步：请先选空间 + 主题，然后再按「✨ 体检」。</div>`;
    return;
  }
  const score = scoreTriad();
  const ranking = rank(score);
  const primary = ranking[0];
  buildOutput(primary, ranking);
}

function resetAll(){
  state = { room: null, theme: null };
  renderRooms();
  renderThemes();
  $("timeLabel").textContent = "—";
  $("primaryLabel").textContent = "—";
  $("prioLabel").textContent = "—";
  $("roomHint").textContent = "选一个就够（先抓主战场）。";
  $("themeHint").textContent = "别贪多，一次只看一个主题。";
  $("output").innerHTML = `<div class="muted">先选空间 + 主题，然后按「✨ 体检」。</div>`;
}

(function init(){
  const saved = localStorage.getItem("lumi_theme");
  applyTheme(saved || "dark");

  renderRooms();
  renderThemes();

  $("btnTheme").addEventListener("click", toggleTheme);
  $("btnCheck").addEventListener("click", doCheck);
  $("btnReset").addEventListener("click", resetAll);
})();
