// Lumi Free — 阳宅风水三部曲（结构合成引擎）
// Result = 内挂（方位/八卦） × 外卦（长幼有序/家庭角色） × 用神（Room Type/空间功能）

const DIRS = [
  { id:"qian", label:"⬈ 西北 乾", trigram:"乾", emoji:"🧭", role:"父 / 权威", core:["规则","决断","边界"], risk:["压迫感","控制欲","硬碰硬"], fix:["把规则讲清（谁负责什么）","减少高压对话（先写后说）","公共空间留出“缓冲区”"] },
  { id:"kun",  label:"⬋ 西南 坤", trigram:"坤", emoji:"🧭", role:"母 / 承载", core:["承载","照顾","稳定"], risk:["过度消耗","闷着不说","一人扛全家"], fix:["把家务/照顾分工写出来","减少堆积（先减负）","给照顾者留休息角落"] },
  { id:"zhen", label:"➡️ 正东 震", trigram:"震", emoji:"🧭", role:"长男 / 行动", core:["启动","行动","变化"], risk:["急躁","冲动","噪动"], fix:["动线清出来（走得顺）","把“容易爆的点”降刺激","需要行动就拆成小步"] },
  { id:"xun",  label:"↘️ 东南 巽", trigram:"巽", emoji:"🧭", role:"长女 / 流动", core:["沟通","流动","细节"], risk:["想太多","摇摆","信息过载"], fix:["减少视觉杂讯（桌面/台面）","沟通先对齐事实再谈感受","用清单代替脑内循环"] },
  { id:"kan",  label:"⬇️ 正北 坎", trigram:"坎", emoji:"🧭", role:"中男 / 压力", core:["压力","隐忧","深层情绪"], risk:["焦虑","担心","睡不好"], fix:["先减损（噪音/光/潮湿）","把不确定写下来做方案A/B","恢复优先（睡眠/休息）"] },
  { id:"li",   label:"⬆️ 正南 离", trigram:"离", emoji:"🧭", role:"中女 / 情绪", core:["可见","热度","表达"], risk:["情绪起伏","容易吵","过度曝光"], fix:["把强光/强刺激降一点","争论改成‘短句+暂停’","让家里有一个安静区"] },
  { id:"gen",  label:"⬅️ 东北 艮", trigram:"艮", emoji:"🧭", role:"少男 / 稳定", core:["停止","稳住","边界"], risk:["卡住","拖延","不动"], fix:["先做一个可完成的小整理","设一个‘结束点’（别无限拖）","把阻挡物移走（门口/走道）"] },
  { id:"dui",  label:"⬅️ 正西 兑", trigram:"兑", emoji:"🧭", role:"少女 / 表达", core:["交流","喜悦","社交"], risk:["口舌","误会","玩太嗨没收"], fix:["沟通先讲重点（少绕）","公共区设‘收尾规则’","把吵闹源头降音量"] },
];

const ROOMS = [
  { id:"door",    label:"🚪 大门", domain:"机会/外界", key:"gateway",
    use:["机会入口","出入节奏","对外互动"], fix:["入口清爽（别堆鞋山）","灯光要够（不压）","门口动线顺（别卡）"] },
  { id:"living",  label:"🛋️ 客厅", domain:"关系/流通", key:"social",
    use:["关系气氛","交流质量","家人相处"], fix:["沙发区别堆物（压迫感）","保持一个“可坐可聊”的空位","把争吵点移出公共区"] },
  { id:"bedroom", label:"🛏️ 卧室", domain:"恢复/底层", key:"rest",
    use:["睡眠","恢复","情绪基线"], fix:["床边1米清空","睡前降刺激（灯/手机）","床只做休息"] },
  { id:"kitchen", label:"🍳 厨房", domain:"资源/财", key:"resource",
    use:["供给能力","财务消耗","家庭运转"], fix:["台面减杂（先减损）","坏掉的先修/先丢","把常用物放顺手"] },
  { id:"toilet",  label:"🚽 厕所", domain:"消耗/泄", key:"leak",
    use:["消耗点","情绪泄洪","卫生与气味"], fix:["干爽+无味优先","漏水/堵塞先处理","门口保持整洁（别外溢）"] },
  { id:"study",   label:"📚 书房", domain:"思考/决策", key:"focus",
    use:["专注","学习","决策质量"], fix:["桌面只留一件主任务","光线均匀不刺眼","线材/杂物收束"] },
  { id:"workdesk",label:"💻 工作位", domain:"产出/执行", key:"focus",
    use:["执行力","效率","压力管理"], fix:["屏幕高度/坐姿先舒服","通知降噪（少弹窗）","每天收尾 3 分钟"] },
  { id:"balcony", label:"🌿 阳台", domain:"出口/未来", key:"outlet",
    use:["透气感","未来感","对外视野"], fix:["清掉不用的储物","让空气能流动","留一个小角落可站/可呼吸"] },
];

const ROLES = [
  "父 / 权威","母 / 承载",
  "长男 / 行动","长女 / 流动",
  "中男 / 压力","中女 / 情绪",
  "少男 / 稳定","少女 / 表达",
  "自己 / 当事人","伴侣 / 另一半"
];

let state = { dir:null, room:null, role:null };

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

function chip(label, active, onClick){
  const b = document.createElement("button");
  b.type = "button";
  b.className = "chip" + (active ? " active" : "");
  b.textContent = label;
  b.addEventListener("click", onClick);
  return b;
}

function renderDir(){
  const wrap = $("dirChips");
  wrap.innerHTML = "";
  DIRS.forEach(d=>{
    wrap.appendChild(chip(d.label, state.dir?.id===d.id, ()=>{
      state.dir = d;
      renderDir();
      // auto role suggestion
      autoRole();
      $("dirHint").textContent = `已选：${d.label}（${d.trigram}）｜默认角色：${d.role}`;
    }));
  });
}

function renderRoom(){
  const wrap = $("roomChips");
  wrap.innerHTML = "";
  ROOMS.forEach(r=>{
    wrap.appendChild(chip(r.label, state.room?.id===r.id, ()=>{
      state.room = r;
      renderRoom();
      $("roomHint").textContent = `已选：${r.label}｜用神课题：${r.domain}`;
    }));
  });
}

function renderRoleSelect(){
  const sel = $("roleSelect");
  sel.innerHTML = "";
  ROLES.forEach(r=>{
    const opt = document.createElement("option");
    opt.value = r;
    opt.textContent = r;
    sel.appendChild(opt);
  });
  sel.addEventListener("change", ()=>{
    state.role = sel.value;
    $("roleHint").textContent = `当前角色：${state.role}`;
  });
}

function autoRole(){
  if (!state.dir) return;
  state.role = state.dir.role;
  $("roleSelect").value = state.role;
  $("roleHint").textContent = `自动匹配角色：${state.role}（可手动改）`;
}

function uniq(arr){
  return Array.from(new Set(arr.filter(Boolean)));
}

function buildHeadline(dir, room, role){
  // headline = 结构核心 + 用神领域 + 角色
  return `${dir.trigram}位结构偏向「${dir.core[0]}」× ${room.domain} → 先看：${role}`;
}

function priority(dir, room){
  // 简单优先级：若 room 属于 rest/leak/resource/focus/gateway/social/outlet
  // 输出：先空间（用神整理）还是先内挂（节律/恢复）或先外卦（沟通边界）
  const key = room.key;
  if (key === "rest") return "1️⃣ 🛏️ 内挂（恢复） → 2️⃣ 🏠 用神（空间用法） → 3️⃣ 👥 外卦（边界/沟通）";
  if (key === "leak") return "1️⃣ 🏠 用神（先减损） → 2️⃣ 🛏️ 内挂（恢复） → 3️⃣ 👥 外卦（分工）";
  if (key === "resource") return "1️⃣ 🏠 用神（资源管理） → 2️⃣ 👥 外卦（分工） → 3️⃣ 🛏️ 内挂（节律）";
  if (key === "focus") return "1️⃣ 🏠 用神（专注环境） → 2️⃣ 🛏️ 内挂（节律） → 3️⃣ 👥 外卦（干扰源）";
  if (key === "gateway") return "1️⃣ 🏠 用神（入口/动线） → 2️⃣ 👥 外卦（对外节奏） → 3️⃣ 🛏️ 内挂（稳住）";
  if (key === "social") return "1️⃣ 👥 外卦（边界/沟通） → 2️⃣ 🏠 用神（公共区用法） → 3️⃣ 🛏️ 内挂（情绪基线）";
  return "1️⃣ 🏠 用神（先做一处） → 2️⃣ 🛏️ 内挂（节律） → 3️⃣ 👥 外卦（关系）";
}

function synthesize(){
  const dir = state.dir;
  const room = state.room;
  const role = state.role;

  if (!dir || !room || !role){
    $("output").innerHTML = `<div class="muted">还差一步：请先选 🧭方位 + 🏠空间 + 👥角色（可自动），再按「✨ 合成结果」。</div>`;
    return;
  }

  const headline = buildHeadline(dir, room, role);
  const prio = priority(dir, room);

  $("timeLabel").textContent = nowStr();
  $("headlineLabel").textContent = headline;
  $("prioLabel").textContent = prio;

  const risk = uniq([
    ...dir.risk.map(x=>`⚠️ ${x}`),
    `📌 课题落点：${room.domain}`
  ]);

  const action = uniq([
    ...room.fix.map(x=>`🏠 ${x}`),
    ...dir.fix.map(x=>`🧭 ${x}`),
  ]).slice(0, 6);

  const output = `
    <div class="block">
      <div class="h">✅ 三部曲合成（你选的组合）</div>
      <div>• 🧭 内挂：${dir.label}（${dir.trigram}）</div>
      <div>• 👥 外卦：${role}</div>
      <div>• 🏠 用神：${room.label}（${room.domain}）</div>
      <div class="tagrow">
        ${dir.core.map(t=>`<span class="tag">#${t}</span>`).join("")}
        <span class="tag">#${room.domain}</span>
      </div>
    </div>

    <div class="block">
      <div class="h">🎯 主结论（结构画像）</div>
      <div>• ${headline}</div>
      <div class="small muted">这不是凶吉断语：它告诉你“最可能卡在哪个结构层”，以及先做什么更有效。</div>
    </div>

    <div class="block">
      <div class="h">🧠 常见卡点（你可以对照）</div>
      <div>${risk.join("<br>")}</div>
    </div>

    <div class="block">
      <div class="h">🛠️ 48 小时行动清单（选 1–2 项就好）</div>
      <ul class="todo">
        ${action.map(a=>`<li>${a}</li>`).join("")}
      </ul>
      <div class="small muted">✅ 做完后再回来看：情绪、沟通、效率有没有变“轻一点”。</div>
    </div>

    <div class="block">
      <div class="h">🧾 优先级（为什么这样排）</div>
      <div>• ${prio}</div>
      <div class="small muted">优先级不是绝对真理，是“最省力的改法”。先用小改动换到大感受。</div>
    </div>
  `;

  $("output").innerHTML = output;
}

function resetAll(){
  state = { dir:null, room:null, role:null };
  $("timeLabel").textContent = "—";
  $("headlineLabel").textContent = "—";
  $("prioLabel").textContent = "—";
  $("dirHint").textContent = "例：你要看“厨房在什么方位”，就选厨房所在的方位。";
  $("roomHint").textContent = "空间类型决定“事情落在哪个生活课题”。";
  $("roleHint").textContent = "先选方位后，系统会建议一个默认角色。";
  renderDir();
  renderRoom();
  $("roleSelect").value = ROLES[0];
  $("output").innerHTML = `<div class="muted">先选：🧭方位 + 🏠空间 + 👥角色（可自动），再按「✨ 合成结果」。</div>`;
}

(function init(){
  const saved = localStorage.getItem("lumi_theme");
  applyTheme(saved || "dark");

  renderRoleSelect();
  renderDir();
  renderRoom();

  $("btnTheme").addEventListener("click", toggleTheme);
  $("btnAnalyze").addEventListener("click", synthesize);
  $("btnReset").addEventListener("click", resetAll);
  $("btnAutoRole").addEventListener("click", autoRole);
})();
