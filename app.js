const COUNTIES = {
  Nairobi: [-1.2864, 36.8172],
  Mombasa: [-4.0435, 39.6682],
  Kisumu: [-0.0917, 34.768],
  Nakuru: [-0.3031, 36.08],
  Kiambu: [-1.1714, 36.8356],
  Eldoret: [0.5143, 35.2698],
  Thika: [-1.0333, 37.0693],
  Nyeri: [-0.4371, 36.958],
  Machakos: [-1.5177, 37.2634],
  Kakamega: [0.2827, 34.7519]
};

const SEEDS = [
  { id: "a1", name: "Amina", age: 26, gender: "Woman", county: "Nairobi", town: "Kilimani", bio: "Coffee, long walks in Karura, and Sunday nyama. Looking for someone kind and consistent.", interests: ["Coffee", "Hiking", "Music"], religion: "Muslim", mode: "Professional", lifestyle: "Social", lat: -1.2921, lng: 36.787 },
  { id: "a2", name: "Brian", age: 29, gender: "Man", county: "Nairobi", town: "Westlands", bio: "Product designer. I cook pilau better than I write code. Church on some Sundays, football on most.", interests: ["Design", "Cooking", "Football"], religion: "Christian", mode: "Professional", lifestyle: "Balanced", lat: -1.267, lng: 36.811 },
  { id: "a3", name: "Wanjiku", age: 24, gender: "Woman", county: "Kiambu", town: "Ruiru", bio: "Campus mode most weeks. Sheng when I'm comfortable. Let's get chapati and talk properly.", interests: ["Books", "Movies", "Travel"], religion: "Christian", mode: "Student", lifestyle: "Chill", lat: -1.146, lng: 36.96 },
  { id: "a4", name: "Otieno", age: 31, gender: "Man", county: "Kisumu", town: "Milimani", bio: "Lake person. Early mornings, fish, and honest conversation. Not here for games.", interests: ["Fishing", "Running", "Business"], religion: "Christian", mode: "Professional", lifestyle: "Active", lat: -0.102, lng: 34.752 },
  { id: "a5", name: "Fatma", age: 27, gender: "Woman", county: "Mombasa", town: "Nyali", bio: "Ocean air and biryani. I value respect, family, and a good sense of humour.", interests: ["Beach", "Food", "Art"], religion: "Muslim", mode: "Professional", lifestyle: "Social", lat: -4.05, lng: 39.71 },
  { id: "a6", name: "Faith", age: 28, gender: "Woman", county: "Nakuru", town: "Milimani", bio: "Fellowship first, then coffee. Looking for a serious, faith-centred connection.", interests: ["Church", "Volunteering", "Baking"], religion: "Christian", mode: "Church", lifestyle: "Quiet", lat: -0.29, lng: 36.07 },
  { id: "a7", name: "Kevin", age: 25, gender: "Man", county: "Eldoret", town: "Elgon View", bio: "Athletics town energy. I train, study, and still reply texts. Student with a plan.", interests: ["Running", "Music", "Tech"], religion: "Christian", mode: "Student", lifestyle: "Active", lat: 0.52, lng: 35.28 },
  { id: "a8", name: "Njeri", age: 30, gender: "Woman", county: "Thika", town: "Section 9", bio: "Runs a small salon. Direct, warm, and done with dry texting.", interests: ["Business", "Fashion", "Gospel"], religion: "Christian", mode: "Professional", lifestyle: "Ambitious", lat: -1.04, lng: 37.08 }
];

const KEY = "karibu-state-v1";
const state = load();

function load() {
  const blank = { user: null, likes: [], passes: [], matches: [], chats: {}, reports: [], blocks: [] };
  try { return { ...blank, ...JSON.parse(localStorage.getItem(KEY) || "{}") }; }
  catch { return blank; }
}
function save() { localStorage.setItem(KEY, JSON.stringify(state)); }
function km(a, b) {
  const R = 6371;
  const dLat = (b[0] - a[0]) * Math.PI / 180;
  const dLng = (b[1] - a[1]) * Math.PI / 180;
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a[0] * Math.PI / 180) * Math.cos(b[0] * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return Math.round(R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s)));
}
function hue(name) { return [...name].reduce((n, c) => n + c.charCodeAt(0), 0) % 360; }
function photo(person) {
  const h = hue(person.name);
  return `linear-gradient(160deg, hsl(${h} 62% 62%), hsl(${(h + 28) % 360} 55% 38%))`;
}
function $(html) { const d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstElementChild; }
function app() { return document.getElementById("app"); }

function nearby() {
  if (!state.user) return [];
  const me = [state.user.lat, state.user.lng];
  const f = state.user.filters || {};
  return SEEDS
    .filter(p => !state.passes.includes(p.id) && !state.likes.includes(p.id) && !state.blocks.includes(p.id))
    .filter(p => !f.gender || f.gender === "Everyone" || p.gender === f.gender)
    .filter(p => !f.county || f.county === "Any" || p.county === f.county)
    .filter(p => !f.mode || f.mode === "Any" || p.mode === f.mode)
    .filter(p => !f.religion || f.religion === "Any" || p.religion === f.religion)
    .map(p => ({ ...p, distance: km(me, [p.lat, p.lng]) }))
    .filter(p => p.distance <= (f.distance || 80))
    .filter(p => p.age >= (f.minAge || 18) && p.age <= (f.maxAge || 45))
    .sort((a, b) => a.distance - b.distance);
}

function render() {
  app().innerHTML = "";
  if (!state.user) app().append(landing());
  else if (!state.user.ready) app().append(setup());
  else app().append(main());
}

function landing() {
  const node = $(`
    <div class="shell">
      <header class="top">
        <div class="brand"><div class="mark">K</div> Karibu</div>
        <div class="nav-actions">
          <button class="btn ghost" id="login">Log in</button>
          <button class="btn solid" id="start">Create profile</button>
        </div>
      </header>
      <section class="hero">
        <div>
          <div class="kicker">Kenya · location matchmaking</div>
          <h1>Meet someone close enough to actually meet.</h1>
          <p class="lede">Karibu matches people by distance, county, and how they actually live — student weeks in Ruiru, church circles in Nakuru, after-work plans in Westlands.</p>
          <div class="pills">
            <span class="pill">Nairobi</span><span class="pill">Mombasa</span><span class="pill">Kisumu</span>
            <span class="pill">Kiambu</span><span class="pill">Sheng welcome</span><span class="pill">M-Pesa premium</span>
          </div>
          <button class="btn terra" id="start2">Start with your county</button>
        </div>
        <div class="phone">
          <div class="phone-bar"><span>Karibu</span><span>2.4 km</span></div>
          <div class="card-face">
            <div class="pill">Professional · Kilimani</div>
            <strong>Amina, 26</strong>
            <div>Coffee, Karura, and someone who replies.</div>
          </div>
        </div>
      </section>
      <section class="grid-3">
        <article class="feature"><h3>Near you</h3><p>GPS or county centre. Distance is calculated on the device in this demo.</p></article>
        <article class="feature"><h3>Your mode</h3><p>Student, professional, or church. Filters stay optional, never a requirement.</p></article>
        <article class="feature"><h3>Safer by design</h3><p>Report, block, and a public-meetup reminder before you leave the chat.</p></article>
      </section>
      <footer class="tiny">Demo frontend. Profiles are sample data. Do not share real contact details until a backend and moderation exist.</footer>
    </div>`);
  node.querySelectorAll("#start, #start2, #login").forEach(b => b.onclick = () => openAuth(b.id === "login"));
  return node;
}

function openAuth(login) {
  const node = $(`
    <div class="modal-back"><form class="modal">
      <h2>${login ? "Karibu tena" : "Create your account"}</h2>
      <p class="muted">This demo keeps your account in this browser only.</p>
      <label>Email</label><input name="email" type="email" required placeholder="you@email.com" />
      <label>Password</label><input name="password" type="password" required minlength="6" />
      <div class="actions"><button class="btn ghost" type="button" id="close">Cancel</button><button class="btn terra" type="submit">${login ? "Log in" : "Continue"}</button></div>
    </form></div>`);
  node.querySelector("#close").onclick = () => node.remove();
  node.querySelector("form").onsubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    state.user = { email: data.email, ready: false, filters: { gender: "Everyone", county: "Any", distance: 80, minAge: 21, maxAge: 35, mode: "Any", religion: "Any" } };
    save(); node.remove(); render();
  };
  app().append(node);
}

function setup() {
  const counties = Object.keys(COUNTIES).map(c => `<option>${c}</option>`).join("");
  const node = $(`
    <div class="shell"><form class="panel" style="max-width:640px;margin:30px auto">
      <div class="brand"><div class="mark">K</div> Set up your profile</div>
      <label>Name</label><input name="name" required />
      <label>Age</label><input name="age" type="number" min="18" max="70" required />
      <label>I am</label><select name="gender"><option>Woman</option><option>Man</option></select>
      <label>County</label><select name="county">${counties}</select>
      <label>Town / estate</label><input name="town" placeholder="Kilimani, Nyali, Milimani..." required />
      <label>Mode</label><select name="mode"><option>Professional</option><option>Student</option><option>Church</option></select>
      <label>Religion</label><select name="religion"><option>Christian</option><option>Muslim</option><option>Other</option><option>Prefer not to say</option></select>
      <label>Bio</label><textarea name="bio" required placeholder="What a normal week looks like."></textarea>
      <label>Interests, comma separated</label><input name="interests" placeholder="Coffee, football, gospel" />
      <div class="note">Location is used only to estimate distance. You can skip GPS and use your county centre.</div>
      <div class="actions"><button class="btn ghost" type="button" id="gps">Use my GPS</button><button class="btn terra" type="submit">Enter Karibu</button></div>
      <p class="muted" id="gpsmsg"></p>
    </form></div>`);
  let coords = null;
  node.querySelector("#gps").onclick = () => {
    const msg = node.querySelector("#gpsmsg");
    if (!navigator.geolocation) { msg.textContent = "GPS is not available in this browser."; return; }
    msg.textContent = "Asking for location...";
    navigator.geolocation.getCurrentPosition(
      (pos) => { coords = [pos.coords.latitude, pos.coords.longitude]; msg.textContent = "Location saved for distance matching."; },
      () => { msg.textContent = "Permission denied. We'll use your county centre."; }
    );
  };
  node.querySelector("form").onsubmit = (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    const centre = COUNTIES[data.county];
    state.user = {
      ...state.user,
      ...data,
      age: Number(data.age),
      interests: data.interests.split(",").map(s => s.trim()).filter(Boolean),
      lat: coords ? coords[0] : centre[0],
      lng: coords ? coords[1] : centre[1],
      ready: true
    };
    save(); render();
  };
  return node;
}

function main() {
  const node = $(`
    <div class="shell">
      <header class="appbar">
        <div class="brand"><div class="mark">K</div> Karibu</div>
        <nav class="tabs">
          <button data-tab="discover" class="on">Discover</button>
          <button data-tab="matches">Matches</button>
          <button data-tab="chat">Chat</button>
          <button data-tab="safety">Safety</button>
        </nav>
        <div class="nav-actions">
          <button class="btn ghost" id="premium">Premium</button>
          <button class="btn ghost" id="out">Log out</button>
        </div>
      </header>
      <div id="view"></div>
    </div>`);
  const view = node.querySelector("#view");
  function show(tab) {
    node.querySelectorAll(".tabs button").forEach(b => b.classList.toggle("on", b.dataset.tab === tab));
    view.innerHTML = "";
    view.append(tab === "matches" ? matches() : tab === "chat" ? chat() : tab === "safety" ? safety() : discover());
  }
  node.querySelectorAll(".tabs button").forEach(b => b.onclick = () => show(b.dataset.tab));
  node.querySelector("#out").onclick = () => { state.user = null; save(); render(); };
  node.querySelector("#premium").onclick = premium;
  show("discover");
  return node;
}

function discover() {
  const people = nearby();
  const u = state.user;
  const node = $(`
    <div class="layout">
      <aside class="panel">
        <h3>Filters</h3>
        <label>Show</label>
        <select id="gender"><option>Everyone</option><option>Woman</option><option>Man</option></select>
        <label>County</label>
        <select id="county"><option>Any</option>${Object.keys(COUNTIES).map(c => `<option>${c}</option>`).join("")}</select>
        <label>Mode</label>
        <select id="mode"><option>Any</option><option>Student</option><option>Professional</option><option>Church</option></select>
        <label>Religion</label>
        <select id="religion"><option>Any</option><option>Christian</option><option>Muslim</option><option>Other</option></select>
        <label>Max distance (km)</label><input id="distance" type="number" min="5" max="500" value="${u.filters.distance}" />
        <label>Age</label>
        <div style="display:flex;gap:8px"><input id="minAge" type="number" value="${u.filters.minAge}" /><input id="maxAge" type="number" value="${u.filters.maxAge}" /></div>
        <p class="muted">You are in ${u.town}, ${u.county}. ${people.length} people in range.</p>
      </aside>
      <section class="discover" id="deck"></section>
    </div>`);
  ["gender", "county", "mode", "religion"].forEach(id => {
    node.querySelector("#" + id).value = u.filters[id];
    node.querySelector("#" + id).onchange = (e) => { u.filters[id] = e.target.value; save(); render(); };
  });
  ["distance", "minAge", "maxAge"].forEach(id => {
    node.querySelector("#" + id).onchange = (e) => { u.filters[id] = Number(e.target.value); save(); render(); };
  });
  const deck = node.querySelector("#deck");
  if (!people.length) deck.append($(`<div class="panel"><h3>No one in this radius</h3><p class="muted">Widen distance or clear a county filter.</p></div>`));
  else deck.append(personCard(people[0]));
  return node;
}

function personCard(p) {
  const node = $(`
    <article class="person">
      <div class="photo" style="background:${photo(p)}">
        <div><div class="pill">${p.distance} km · ${p.town}</div><h2>${p.name}, ${p.age}</h2></div>
      </div>
      <div class="meta">
        <div>${p.county} · ${p.mode} · ${p.religion}</div>
        <p>${p.bio}</p>
        <div class="chips">${p.interests.map(i => `<span class="chip">${i}</span>`).join("")}</div>
        <div class="actions">
          <button class="btn ghost" id="pass">Pass</button>
          <button class="btn terra" id="like">Like</button>
        </div>
      </div>
    </article>`);
  node.querySelector("#pass").onclick = () => { state.passes.push(p.id); save(); render(); };
  node.querySelector("#like").onclick = () => {
    state.likes.push(p.id);
    const mutual = p.age % 2 === 0;
    if (mutual) {
      state.matches.push(p.id);
      state.chats[p.id] = [{ from: "them", text: `Sasa ${state.user.name.split(" ")[0] || ""}. Saw you're around ${state.user.county}.` }];
    }
    save();
    alert(mutual ? `It's a match with ${p.name}. Open Matches to chat.` : `Like sent to ${p.name}.`);
    render();
  };
  return node;
}

function matches() {
  const people = SEEDS.filter(p => state.matches.includes(p.id));
  const node = $(`<div class="panel"><h3>Matches</h3><div class="list" id="list"></div></div>`);
  const list = node.querySelector("#list");
  if (!people.length) list.append($(`<p class="muted">No matches yet. Likes on even sample ages match back in this demo.</p>`));
  people.forEach(p => {
    const row = $(`<button class="row"><div class="avatar" style="background:${photo(p)}">${p.name[0]}</div><div class="grow"><strong>${p.name}</strong><div class="muted">${p.town}, ${p.county}</div></div></button>`);
    row.onclick = () => { state.activeChat = p.id; save(); document.querySelector('[data-tab="chat"]').click(); };
    list.append(row);
  });
  return node;
}

function chat() {
  const id = state.activeChat || state.matches[0];
  const p = SEEDS.find(x => x.id === id);
  if (!p) return $(`<div class="panel"><h3>Chat</h3><p class="muted">Match with someone first.</p></div>`);
  const node = $(`
    <div class="panel chat">
      <div class="row"><div class="avatar" style="background:${photo(p)}">${p.name[0]}</div><div class="grow"><strong>${p.name}</strong><div class="muted">${p.distance || ""} Meet in a public place first.</div></div><button class="btn ghost" id="report">Report</button></div>
      <div class="bubbles" id="bubbles"></div>
      <form class="composer"><input name="text" placeholder="Andika ujumbe..." required /><button class="btn solid">Send</button></form>
    </div>`);
  const bubbles = node.querySelector("#bubbles");
  (state.chats[p.id] || []).forEach(m => bubbles.append($(`<div class="bubble ${m.from === "me" ? "me" : ""}">${m.text}</div>`)));
  node.querySelector("#report").onclick = () => report(p);
  node.querySelector("form").onsubmit = (e) => {
    e.preventDefault();
    const text = new FormData(e.target).get("text");
    state.chats[p.id] = state.chats[p.id] || [];
    state.chats[p.id].push({ from: "me", text });
    state.chats[p.id].push({ from: "them", text: "Poa. Weekday evening works if you're free around town." });
    save(); e.target.reset(); render();
    document.querySelector('[data-tab="chat"]').click();
  };
  return node;
}

function report(p) {
  const reason = prompt(`Report ${p.name}. Reason? (harassment, fake profile, scam, other)`);
  if (!reason) return;
  state.reports.push({ id: p.id, reason, at: new Date().toISOString() });
  state.blocks.push(p.id);
  save();
  alert("Report saved on this device and the profile is blocked in your demo.");
  render();
}

function safety() {
  return $(`
    <div class="panel">
      <h3>Safety</h3>
      <p>Meet in a cafe, mall, or other public place. Tell a friend where you are going. Do not send money, airtime, or M-Pesa to someone you have not met.</p>
      <p class="muted">${state.reports.length} report(s) stored locally. A production app would send these to moderators and hide reported accounts.</p>
      <h3>Blocked</h3>
      <p class="muted">${state.blocks.length ? state.blocks.join(", ") : "None yet."}</p>
    </div>`);
}

function premium() {
  const node = $(`
    <div class="modal-back"><div class="modal">
      <h2>Karibu Plus</h2>
      <p class="muted">Demo plans. Live M-Pesa STK push needs a payment provider and a backend.</p>
      <div class="plans">
        <div class="plan"><strong>Week · KES 299</strong><div class="muted">See who liked you, extra filters.</div></div>
        <div class="plan"><strong>Month · KES 799</strong><div class="muted">Unlimited likes and read receipts.</div></div>
      </div>
      <button class="btn leaf wide" id="pay">Pay with M-Pesa (demo)</button>
      <button class="btn ghost wide" id="close" style="margin-top:8px">Close</button>
    </div></div>`);
  node.querySelector("#close").onclick = () => node.remove();
  node.querySelector("#pay").onclick = () => { alert("In production this opens an STK push to the user's Safaricom number."); node.remove(); };
  app().append(node);
}

render();
