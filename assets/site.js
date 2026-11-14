/* Hello Skin – shared site script for the static preview.
   In WordPress each part maps to: Elementor Pro Theme Builder (header, footer, archive, single product),
   Elementor Pro WooCommerce widgets (Menu Cart, Cart, Checkout, My Account, Purchase Summary) and free WooCommerce. */
(function () {
"use strict";
const IMG = "img/";
const FREE = 2000;
const COUPONS = { HELLO10: { pct: 10, label: "HELLO10 (10% off)" } };
const RATES = [
  { id: "dhaka", label: "Inside Dhaka", cost: 60, note: "1–2 working days" },
  { id: "outside", label: "Outside Dhaka", cost: 120, note: "2–4 working days" }
];
const TOP = ["Face Care", "Sun Care", "Lip Care", "Hair Care", "Body Care", "Underarm & Personal Care"];
const TOP_DESC = {
  "Face Care": "Cleansers, serums and moisturisers for every skin type and concern.",
  "Sun Care": "Daily SPF 50 protection made for Bangladesh's sun, in light gels, fluids and tints.",
  "Lip Care": "Balms and treatments that soften, protect and help even out lip tone.",
  "Hair Care": "Shampoos, serums and masks for frizz, hair fall and a healthy scalp.",
  "Body Care": "Exfoliating washes and brightening lotions for smoother skin.",
  "Underarm & Personal Care": "Roll-ons that fight odour and brighten underarms."
};
const DISTRICTS = ["Bagerhat","Bandarban","Barguna","Barishal","Bhola","Bogura","Brahmanbaria","Chandpur","Chapai Nawabganj","Chattogram","Chuadanga","Cox's Bazar","Cumilla","Dhaka","Dinajpur","Faridpur","Feni","Gaibandha","Gazipur","Gopalganj","Habiganj","Jamalpur","Jashore","Jhalokathi","Jhenaidah","Joypurhat","Khagrachhari","Khulna","Kishoreganj","Kurigram","Kushtia","Lakshmipur","Lalmonirhat","Madaripur","Magura","Manikganj","Meherpur","Moulvibazar","Munshiganj","Mymensingh","Naogaon","Narail","Narayanganj","Narsingdi","Natore","Netrokona","Nilphamari","Noakhali","Pabna","Panchagarh","Patuakhali","Pirojpur","Rajbari","Rajshahi","Rangamati","Rangpur","Satkhira","Shariatpur","Sherpur","Sirajganj","Sunamganj","Sylhet","Tangail","Thakurgaon"];

const slugOf = s => s.toLowerCase().replace(/&/g, "").replace(/'/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const P = PRODUCTS.map(p => { const [top, sub] = p.cat.split(" > "); return { ...p, top, sub: sub || null }; });
const bySku = Object.fromEntries(P.map(p => [p.sku, p]));
const subsOf = t => [...new Set(P.filter(p => p.top === t && p.sub).map(p => p.sub))];
const BRANDS = [...new Set(P.map(p => p.brand))].sort((a, b) => P.filter(p => p.brand === b).length - P.filter(p => p.brand === a).length);
const tk = n => "৳" + Math.round(n).toLocaleString("en-US");
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const qs = new URLSearchParams(location.search);
const rev = p => { let h = 0; for (const c of p.sku) h = (h * 31 + c.charCodeAt(0)) % 997; return 24 + h % 210; };
const purl = p => `product.html?p=${p.slug}`;
const curl = c => `shop.html?cat=${slugOf(c)}`;
const store = {
  get(k, d) { try { const v = localStorage.getItem("hs-" + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem("hs-" + k, JSON.stringify(v)); } catch (e) {} },
  del(k) { try { localStorage.removeItem("hs-" + k); } catch (e) {} }
};

/* ---------------- cart state ---------------- */
let cart = store.get("cart", []).filter(i => bySku[i.sku]);
const saveCart = () => store.set("cart", cart);
const count = () => cart.reduce((a, i) => a + i.q, 0);
const subtotal = () => cart.reduce((a, i) => a + i.q * bySku[i.sku].price, 0);
function totals() {
  const sub = subtotal();
  const code = store.get("coupon", null);
  const disc = code && COUPONS[code] ? Math.round(sub * COUPONS[code].pct / 100) : 0;
  const free = sub >= FREE;
  let ship = store.get("ship", "dhaka");
  if (ship === "free" && !free) ship = "dhaka";
  const rate = ship === "free" ? 0 : (RATES.find(r => r.id === ship) || RATES[0]).cost;
  return { sub, code: disc ? code : null, disc, free, ship, rate, total: sub - disc + rate };
}
function add(sku, q = 1) {
  const it = cart.find(i => i.sku === sku);
  it ? it.q += q : cart.push({ sku, q });
  saveCart(); renderMini(); openCart();
}
function setQ(sku, q) {
  const it = cart.find(i => i.sku === sku); if (!it) return;
  it.q = Math.max(0, Math.min(99, q | 0));
  if (!it.q) cart = cart.filter(i => i.sku !== sku);
  saveCart(); renderMini();
}

/* ---------------- shared chrome (Theme Builder header/footer) ---------------- */
const NAV = [["Shop all", "shop.html", "shop"], ["Face", curl("Face Care"), "face-care"], ["Sun", curl("Sun Care"), "sun-care"], ["Hair", curl("Hair Care"), "hair-care"], ["Body", curl("Body Care"), "body-care"], ["About", "about.html", "about"]];
const ICON = {
  menu: '<svg viewBox="0 0 24 24"><path d="M3 7h18M3 12h18M3 17h18"/></svg>',
  search: '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6.5"/><path d="m20 20-4.2-4.2"/></svg>',
  user: '<svg viewBox="0 0 24 24"><circle cx="12" cy="8.5" r="4"/><path d="M4 20.5c1.4-4 4.4-6 8-6s6.6 2 8 6"/></svg>',
  bag: '<svg viewBox="0 0 24 24"><path d="M5 8h14l-1.2 12.5H6.2z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/></svg>',
  close: '<svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg>',
  derm: '<svg viewBox="0 0 24 24"><path d="M12 3 4.5 6v5.5c0 4.5 3.2 8.3 7.5 9.5 4.3-1.2 7.5-5 7.5-9.5V6z"/><path d="m8.5 12 2.5 2.5 4.5-5"/></svg>',
  auth: '<svg viewBox="0 0 24 24"><circle cx="12" cy="10" r="6"/><path d="m8.5 15.5-1.5 6 5-2.5 5 2.5-1.5-6"/></svg>',
  cf: '<svg viewBox="0 0 24 24"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
  ship: '<svg viewBox="0 0 24 24"><path d="M2.5 6.5h11v10h-11zM13.5 10h4l3 3v3.5h-7"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="16.5" cy="17.5" r="1.8"/></svg>',
  cod: '<svg viewBox="0 0 24 24"><rect x="3" y="6.5" width="18" height="11" rx="1"/><circle cx="12" cy="12" r="2.5"/></svg>'
};
function chrome() {
  const page = document.body.dataset.page;
  const active = page === "shop" ? (qs.get("cat") ? (P.find(p => slugOf(p.top) === qs.get("cat")) || P.find(p => p.sub && slugOf(p.sub) === qs.get("cat")) || {}).top : "shop") : page;
  const isOn = key => key === page || (active && key === slugOf(active)) || (key === "shop" && page === "shop" && !qs.get("cat"));
  $("#hdr").outerHTML = `
  <div class="announce"><span class="long">Free delivery across Bangladesh on orders over ${tk(FREE)}</span><span class="short">Free delivery over ${tk(FREE)}</span></div>
  <header class="site">
    <div class="wrap hbar">
      <div style="display:flex;align-items:center;gap:8px">
        <button class="ibtn menu-btn" id="menuBtn" aria-label="Open menu">${ICON.menu}</button>
        <nav class="nav">${NAV.map(([l, h, k]) => `<a href="${h}" class="${isOn(k) ? "on" : ""}">${l}</a>`).join("")}</nav>
      </div>
      <a href="index.html" class="logo" aria-label="Hello Skin home">Hello Skin</a>
      <div class="icons">
        <button class="ibtn" id="searchBtn" aria-label="Search">${ICON.search}</button>
        <a class="ibtn" href="my-account.html" aria-label="My account">${ICON.user}</a>
        <button class="ibtn" id="cartBtn" aria-label="Open cart">${ICON.bag}<span class="count" id="count" hidden>0</span></button>
      </div>
    </div>
    <div class="search" id="search"><div class="wrap">
      <form id="sform" role="search" action="shop.html"><label for="q" class="label muted" style="display:block;margin-bottom:8px">Search products, brands or concerns</label>
      <input id="q" name="s" type="search" placeholder="Try “sunscreen”, “Minimalist” or “vitamin C”" autocomplete="off"></form>
      <div class="sres" id="sres"></div>
    </div></div>
  </header>`;
  $("#ftr").outerHTML = `
  <section class="news"><div class="wrap section">
    <p class="label muted" style="margin:0 0 14px">The Hello Skin letter</p>
    <h2>Get 10% off your first order</h2>
    <p>Routine notes, new arrivals and restocks. One email a fortnight.</p>
    <form class="nform" id="nform"><label for="nemail" hidden>Email</label><input id="nemail" type="email" placeholder="Your email address" required><button type="submit">Subscribe</button></form>
    <div class="nmsg" id="nmsg" aria-live="polite"></div>
  </div></section>
  <footer><div class="wrap">
    <div class="fgrid">
      <div><div class="logo">Hello Skin</div><p class="muted" style="max-width:320px;margin:16px 0 0;font-size:14px">Authentic skincare, hair and body care from the brands dermatologists trust, chosen for Bangladesh's heat and humidity.</p></div>
      <div><h4>Shop</h4><ul><li><a href="shop.html">Shop all</a></li>${TOP.map(t => `<li><a href="${curl(t)}">${esc(t)}</a></li>`).join("")}</ul></div>
      <div><h4>Customer care</h4><ul><li><a href="shipping-returns.html">Shipping &amp; returns</a></li><li><a href="shipping-returns.html#faq">FAQ</a></li><li><a href="contact.html">Contact us</a></li><li><a href="my-account.html">My account</a></li></ul></div>
      <div><h4>Hello Skin</h4><ul><li><a href="about.html">About us</a></li><li><a href="https://www.facebook.com/profile.php?id=61578828301744" target="_blank" rel="noopener">Facebook</a></li><li><a href="shipping-returns.html#privacy">Privacy policy</a></li><li><a href="shipping-returns.html#terms">Terms</a></li></ul></div>
    </div>
    <div class="fbot"><span>© 2026 Hello Skin. Design preview.</span><div class="paybadges"><span>Cash on delivery</span><span>Bank transfer</span></div></div>
  </div></footer>
  <div class="scrim" id="scrim"></div>
  <aside class="drawer" id="drawer" aria-label="Cart" aria-hidden="true">
    <div class="dh"><h3>Your bag <span class="muted" id="dcount" style="font-weight:400"></span></h3><button class="ibtn" id="closeCart" aria-label="Close cart">${ICON.close}</button></div>
    <div class="ship">Free delivery on orders over ${tk(FREE)}</div>
    <div class="items" id="items"></div>
    <div class="df" id="dfoot"></div>
  </aside>
  <nav class="mnav" id="mnav" aria-label="Menu"><div class="logo" style="margin-bottom:14px">Hello Skin</div><a href="shop.html">Shop all</a>${TOP.map(t => `<a href="${curl(t)}">${esc(t)}</a>`).join("")}<a href="about.html">About</a><a href="contact.html">Contact</a><a href="my-account.html">My account</a></nav>
  <div class="toast" id="toast" role="status"></div>`;

  $("#menuBtn").onclick = () => { $("#mnav").classList.add("on"); $("#scrim").classList.add("on"); };
  $("#cartBtn").onclick = openCart;
  $("#closeCart").onclick = closeAll;
  $("#scrim").onclick = closeAll;
  $("#searchBtn").onclick = () => { const s = $("#search"); s.classList.toggle("open"); if (s.classList.contains("open")) $("#q").focus(); };
  $("#q").oninput = e => {
    const q = e.target.value.trim().toLowerCase();
    const r = q.length < 2 ? [] : P.filter(p => (p.name + " " + p.cat + " " + p.short).toLowerCase().includes(q)).slice(0, 6);
    $("#sres").innerHTML = q.length < 2 ? "" : (r.length ? r.map(p => `<a href="${purl(p)}">${p.imgs[0] ? `<img src="${IMG + p.imgs[0]}" alt="">` : `<span style="width:48px;height:48px;background:var(--blush)"></span>`}<span><span class="muted" style="font-size:11px;letter-spacing:.06em;text-transform:uppercase;display:block">${esc(p.brand)}</span>${esc(p.title)}</span><span style="margin-left:auto">${tk(p.price)}</span></a>`).join("") + `<a href="shop.html?s=${encodeURIComponent(q)}" style="justify-content:center;font-weight:500">See all results</a>` : `<p class="muted" style="margin:8px">No products match “${esc(q)}”. Try a brand or an ingredient.</p>`);
  };
  $("#nform").onsubmit = e => { e.preventDefault(); $("#nmsg").textContent = "Thanks. In the live store this signs you up and sends your 10% code."; e.target.reset(); };
  document.addEventListener("keydown", e => { if (e.key === "Escape") { closeAll(); $("#search").classList.remove("open"); } });
  renderMini();
}
function renderMini() {
  const n = count(), sub = subtotal();
  const c = $("#count"); if (!c) return;
  c.textContent = n; c.hidden = !n;
  $("#dcount").textContent = n ? `(${n})` : "";
  $("#items").innerHTML = cart.length ? cart.map(i => { const p = bySku[i.sku]; return `
    <div class="item">${p.imgs[0] ? `<img src="${IMG + p.imgs[0]}" alt="">` : `<div class="ni"></div>`}
      <div><div class="b">${esc(p.brand)}</div><a class="t" href="${purl(p)}">${esc(p.title)}</a><div class="muted" style="font-size:12px;margin-top:6px">${i.q} × ${tk(p.price)}</div></div>
      <div class="r"><span>${tk(p.price * i.q)}</span><button class="rm" data-rm="${p.sku}">Remove</button></div></div>`; }).join("")
    : `<div class="empty"><p>Your bag is empty</p><a class="btn ghost" href="shop.html">Shop all products</a></div>`;
  $("#dfoot").hidden = !cart.length;
  $("#dfoot").innerHTML = `<div class="sub"><span>Subtotal</span><span>${tk(sub)}</span></div><small>Delivery is calculated at checkout.</small><div style="display:grid;grid-template-columns:1fr 1fr;gap:10px"><a class="btn ghost full" href="cart.html">View cart</a><a class="btn full" href="checkout.html">Checkout</a></div>`;
  document.dispatchEvent(new Event("cart:change"));
}
function openCart() { $("#drawer").classList.add("on"); $("#drawer").setAttribute("aria-hidden", "false"); $("#scrim").classList.add("on"); }
function closeAll() { $("#drawer")?.classList.remove("on"); $("#mnav")?.classList.remove("on"); $("#scrim")?.classList.remove("on"); }
let tt; function toast(m) { const t = $("#toast"); t.textContent = m; t.classList.add("on"); clearTimeout(tt); tt = setTimeout(() => t.classList.remove("on"), 2400); }

/* ---------------- product card (Loop Grid item) ---------------- */
function card(p) {
  const img = p.imgs[0] ? `<img src="${IMG + p.imgs[0]}" alt="${esc(p.name)}" loading="lazy">` : `<div class="noimg"><div><span>${esc(p.title)}</span><small>Photo needed</small></div></div>`;
  return `<article class="card">
    <a class="media" href="${purl(p)}" aria-label="${esc(p.name)}">${img}<button class="qadd" data-add="${p.sku}" aria-label="Add ${esc(p.name)} to bag"><span class="w">Add to bag </span>+</button></a>
    <a class="meta" href="${purl(p)}"><span class="cat">${esc(p.brand)}</span><span class="t">${esc(p.title)}</span><span class="rt"><i>★★★★★</i> ${rev(p)}</span><span class="p">${tk(p.price)}</span></a>
  </article>`;
}

/* ---------------- pages ---------------- */
const pages = {};

pages.home = v => {
  const best = P.filter(p => p.best);
  const hero = bySku["HS-DEC-001"], story = bySku["HS-MIN-002"];
  v.innerHTML = `
  <section class="hero">
    <div class="hero-copy">
      <p class="label muted" style="margin:0">Skincare, hair &amp; body · Delivered across Bangladesh</p>
      <h1>Good skin,<br><em>kept simple.</em></h1>
      <p>Authentic serums, sunscreens and everyday essentials from The Derma Co, Minimalist, Dot &amp; Key and more. Picked for humid days and real routines.</p>
      <div><a class="btn" href="shop.html">Shop all</a></div>
    </div>
    <div class="hero-media"><img src="${IMG + hero.imgs[1]}" alt="Deconstruct Niacinamide + Alpha Arbutin Clearing Serum on white linen"><a class="hero-tag" href="${purl(hero)}">Deconstruct Clearing Serum · ${tk(hero.price)}</a></div>
  </section>
  <section class="trust" aria-label="Why shop with Hello Skin">
    <div>${ICON.auth}<span>100% authentic brands</span></div><div>${ICON.derm}<span>Dermatologist-tested</span></div>
    <div>${ICON.cf}<span>Cruelty-free picks</span></div><div>${ICON.ship}<span>Fast delivery nationwide</span></div>
  </section>
  <section class="brands"><div class="wrap"><span class="label muted">Shop by brand</span><div class="blist">${BRANDS.map(b => `<a href="shop.html?brand=${slugOf(b)}">${esc(b)}</a>`).join("")}</div></div></section>
  <section class="section"><div class="wrap">
    <div class="shead"><div><p class="label muted" style="margin:0 0 8px">Most loved</p><h2>Bestsellers</h2></div><a class="link" href="shop.html">View all ${P.length}</a></div>
    <div class="grid">${best.map(card).join("")}</div>
  </div></section>
  <section class="section" style="padding-top:0"><div class="wrap">
    <div class="shead"><div><p class="label muted" style="margin:0 0 8px">Shop by category</p><h2>Find your routine</h2></div></div>
    <div class="cats">${TOP.map(t => { const ps = P.filter(p => p.top === t); const th = ps.filter(p => p.imgs[0]).slice(0, 3);
      return `<a class="catc" href="${curl(t)}"><div><span class="n">${ps.length} product${ps.length > 1 ? "s" : ""}</span><h3 style="margin-top:6px">${esc(t)}</h3></div><div><div class="thumbs">${th.map(p => `<img src="${IMG + p.imgs[0]}" alt="" loading="lazy">`).join("")}</div><div class="go"><span>Shop ${esc(t)}</span><span aria-hidden="true">→</span></div></div></a>`; }).join("")}</div>
  </div></section>
  <section class="split">
    <div class="img"><img src="${IMG + story.imgs[2]}" alt="Minimalist Vitamin C + E + Ferulic serum" loading="lazy"></div>
    <div class="txt">
      <p class="label muted" style="margin:0">The Hello Skin approach</p>
      <h2>Three steps.<br>Every morning.</h2>
      <p>You don't need twelve products. A gentle cleanser, one targeted serum and a sunscreen you'll actually wear do most of the work. We stock the formulas that do each step well, and nothing we can't verify as authentic.</p>
      <div class="steps">
        <div><b>Cleanse</b><a href="shop.html?cat=face-wash-cleansers" class="muted">Salicylic gel washes, barrier-friendly pH 5.5 cleansers →</a></div>
        <div><b>Treat</b><a href="shop.html?cat=serums-treatments" class="muted">Vitamin C, niacinamide, alpha arbutin, kojic acid →</a></div>
        <div><b>Protect</b><a href="${curl("Sun Care")}" class="muted">SPF 50 PA++++ gels, fluids and tints →</a></div>
      </div>
      <div><a class="link" href="about.html">About Hello Skin</a></div>
    </div>
  </section>`;
};

pages.shop = v => {
  const cat = qs.get("cat"), s = (qs.get("s") || "").trim(), brandQ = qs.get("brand");
  const top = TOP.find(t => slugOf(t) === cat) || null;
  let sub = null, parent = top;
  if (cat && !top) for (const t of TOP) for (const x of subsOf(t)) if (slugOf(x) === cat) { sub = x; parent = t; }
  const brand = BRANDS.find(b => slugOf(b) === brandQ) || null;
  let base = P.filter(p => (!parent || p.top === parent) && (!sub || p.sub === sub) && (!brand || p.brand === brand) && (!s || (p.name + " " + p.cat + " " + p.short).toLowerCase().includes(s.toLowerCase())));
  const title = s ? `Search results: “${s}”` : brand || sub || parent || "Shop all";
  const desc = s ? "" : brand ? `Authentic ${brand}, sourced from official distributors.` : parent ? TOP_DESC[parent] : "Every product we carry, from cleansers to SPF to hair care.";
  const subs = parent ? subsOf(parent) : [];
  let sortBy = qs.get("orderby") || "menu_order";
  const draw = () => {
    let list = [...base];
    if (sortBy === "popularity") list.sort((a, b) => rev(b) - rev(a));
    if (sortBy === "price") list.sort((a, b) => a.price - b.price);
    if (sortBy === "price-desc") list.sort((a, b) => b.price - a.price);
    $("#rcount").textContent = `Showing all ${list.length} result${list.length === 1 ? "" : "s"}`;
    $("#pgrid").innerHTML = list.length ? list.map(card).join("") : `<p class="muted" style="grid-column:1/-1;padding:40px 0">No products were found matching your selection. <a class="link" href="shop.html">Back to shop</a></p>`;
  };
  v.innerHTML = `
  <section class="shop-head"><div class="wrap">
    <div class="crumbs"><a href="index.html">Home</a> / <a href="shop.html">Shop</a>${parent ? ` / <a href="${curl(parent)}">${esc(parent)}</a>` : ""}${sub ? ` / ${esc(sub)}` : ""}${brand ? ` / ${esc(brand)}` : ""}</div>
    <h1>${esc(title)}</h1>${desc ? `<p>${esc(desc)}</p>` : ""}
    ${subs.length ? `<div class="subpills"><a class="pill ${!sub ? "on" : ""}" href="${curl(parent)}" style="display:inline-flex;align-items:center">All ${esc(parent)}</a>${subs.map(x => `<a class="pill ${x === sub ? "on" : ""}" href="${curl(x)}" style="display:inline-flex;align-items:center">${esc(x)}</a>`).join("")}</div>` : ""}
  </div></section>
  <div class="fbar"><div class="wrap">
    <div class="pills" aria-label="Filter by category">
      <a class="pill ${!parent && !brand && !s ? "on" : ""}" href="shop.html" style="display:inline-flex;align-items:center">All</a>
      ${TOP.map(t => `<a class="pill ${t === parent ? "on" : ""}" href="${curl(t)}" style="display:inline-flex;align-items:center">${esc(t)}</a>`).join("")}
    </div>
    <label class="sort" for="sortSel"><span class="muted">Sort</span>
      <select id="sortSel"><option value="menu_order">Default sorting</option><option value="popularity">Sort by popularity</option><option value="price">Sort by price: low to high</option><option value="price-desc">Sort by price: high to low</option></select></label>
  </div></div>
  <div class="wrap"><p class="rcount" id="rcount"></p></div>
  <section class="section" style="padding-top:24px"><div class="wrap"><div class="grid" id="pgrid"></div></div></section>`;
  const sel = $("#sortSel"); sel.value = sortBy;
  sel.onchange = () => { sortBy = sel.value; draw(); };
  draw();
  document.title = `${title} – Hello Skin`;
};

const HOW = {
  "Face Wash & Cleansers": ["Wet your face with lukewarm water.", "Massage a coin-sized amount for 30–60 seconds, avoiding the eye area.", "Rinse well and pat dry. Use morning and night."],
  "Serums & Treatments": ["Apply 2–3 drops to clean, dry skin.", "Press gently into face and neck.", "Follow with moisturiser, and sunscreen in the morning. Patch test before first use."],
  "Moisturizers & Creams": ["Take a pea-sized amount after serum.", "Smooth over face and neck in upward strokes.", "Use daily, morning and/or night."],
  "Sun Care": ["Apply generously as the last step of your morning routine.", "Use about two finger-lengths for face and neck.", "Reapply every 2–3 hours outdoors, and after swimming or sweating."],
  "Lip Care": ["Apply a thin layer to clean lips.", "Reapply through the day and before bed."],
  "Shampoo & Conditioner": ["Apply to wet hair and massage into the scalp.", "Lather, then rinse thoroughly.", "Use 2–3 times a week or as needed."],
  "Hair Masks & Treatments": ["After shampooing, apply to lengths and ends.", "Leave on for 5–10 minutes.", "Rinse thoroughly. Use once or twice a week."],
  "Hair Serums": ["Apply to the scalp or lengths as directed on the pack.", "Massage gently; do not rinse.", "Use consistently for best results."],
  "Body Care": ["Use on damp skin after showering.", "Massage in until absorbed, focusing on rough or uneven areas.", "Use daily."],
  "Underarm & Personal Care": ["Apply to clean, dry underarms.", "Allow to dry before dressing.", "Use daily."]
};
pages.product = v => {
  const p = P.find(x => x.slug === qs.get("p")) || P[0];
  let g = 0, qty = 1;
  const how = HOW[p.sub || p.top] || HOW["Body Care"];
  const related = P.filter(x => x.top === p.top && x.sku !== p.sku).slice(0, 4);
  const main = i => p.imgs[i] ? `<img src="${IMG + p.imgs[i]}" alt="${esc(p.name)}">` : `<div class="noimg"><div><span>${esc(p.title)}</span><small>Photo needed</small></div></div>`;
  document.title = `${p.name} – Hello Skin`;
  document.body.classList.add("pdp-on");
  v.innerHTML = `
  <section class="pdp">
    <div class="gal">
      <div class="mainimg" id="mainimg">${main(0)}</div>
      ${p.imgs.length > 1 ? `<div class="thumbs-v">${p.imgs.map((s, i) => `<button class="${i ? "" : "on"}" data-g="${i}" aria-label="Show image ${i + 1}"><img src="${IMG + s}" alt=""></button>`).join("")}</div>` : ""}
    </div>
    <div class="info">
      <div class="crumbs" style="margin:0"><a href="index.html">Home</a> / <a href="${curl(p.top)}">${esc(p.top)}</a>${p.sub ? ` / <a href="${curl(p.sub)}">${esc(p.sub)}</a>` : ""}</div>
      <div style="display:grid;gap:10px">
        <a class="brand" href="shop.html?brand=${slugOf(p.brand)}">${esc(p.brand)}</a>
        <h1>${esc(p.title)}</h1>
        <div class="stars"><i aria-hidden="true">★★★★★</i><span>4.8 · ${rev(p)} reviews (placeholder)</span></div>
      </div>
      <div class="price"><span>${tk(p.price)}</span><span class="ph">Placeholder price</span></div>
      <p class="benefit">${esc(p.short)}.</p>
      <form class="buy" id="buy">
        <div class="qty"><button type="button" data-qty="-1" aria-label="Decrease quantity">−</button><span id="qv">1</span><button type="button" data-qty="1" aria-label="Increase quantity">+</button></div>
        <button class="btn full" type="submit">Add to bag</button>
      </form>
      <div class="perks">
        <div>${ICON.ship}<span>Free delivery over ${tk(FREE)} · 1–2 days in Dhaka</span></div>
        <div>${ICON.cod}<span>Cash on delivery available</span></div>
        <div>${ICON.auth}<span>Authentic product, sourced from official distributors</span></div>
      </div>
      <div class="acc">
        <details open><summary>Description</summary><div class="body"><p>${esc(p.short)}.</p><p>${esc(p.brand)} · ${esc(p.sub || p.top)}. Suitable for daily use as part of a simple routine.</p></div></details>
        <details><summary>Key ingredients</summary><div class="body"><span class="todo">Draft copy</span><p>${esc(p.short)}.</p><p class="muted">Full INCI list to be added from the ${esc(p.brand)} pack.</p></div></details>
        <details><summary>How to use</summary><div class="body"><span class="todo">Draft copy</span><ul>${how.map(h => `<li>${h}</li>`).join("")}</ul></div></details>
        <details><summary>Delivery &amp; returns</summary><div class="body"><ul><li>Inside Dhaka: ৳60, 1–2 working days.</li><li>Outside Dhaka: ৳120, 2–4 working days.</li><li>Free delivery on orders over ${tk(FREE)}.</li><li>Unopened items can be returned within 7 days. <a class="link" href="shipping-returns.html">Full policy</a></li></ul></div></details>
      </div>
    </div>
  </section>
  ${related.length ? `<section class="section"><div class="wrap"><div class="shead"><div><p class="label muted" style="margin:0 0 8px">Complete your routine</p><h2>Related products</h2></div><a class="link" href="${curl(p.top)}">View all</a></div><div class="grid">${related.map(card).join("")}</div></div></section>` : ""}
  <div class="sticky-atc on"><div style="min-width:0"><div class="t">${esc(p.title)}</div><div class="muted" style="font-size:12px">${tk(p.price)}</div></div><button class="btn" data-add="${p.sku}">Add to bag</button></div>`;
  v.addEventListener("click", e => {
    const t = e.target.closest("[data-g],[data-qty]"); if (!t) return;
    if (t.dataset.g) { g = +t.dataset.g; $("#mainimg").innerHTML = main(g); $$("[data-g]").forEach(b => b.classList.toggle("on", +b.dataset.g === g)); }
    if (t.dataset.qty) { qty = Math.max(1, qty + +t.dataset.qty); $("#qv").textContent = qty; }
  });
  $("#buy").onsubmit = e => { e.preventDefault(); add(p.sku, qty); };
};

pages.cart = v => {
  const draw = () => {
    if (!cart.length) {
      v.innerHTML = `<section class="page-head"><div class="wrap"><h1>Cart</h1></div></section>
      <div class="wrap empty-page"><h2>Your cart is currently empty.</h2><p class="muted" style="margin:0">Browse cleansers, serums and SPF picked for humid days.</p><a class="btn" href="shop.html">Return to shop</a></div>`;
      return;
    }
    const T = totals();
    const cross = P.filter(p => !cart.find(i => i.sku === p.sku) && p.best).slice(0, 4);
    v.innerHTML = `
    <section class="page-head"><div class="wrap"><h1>Cart</h1><div class="steps-bar"><b>Cart</b><i>/</i><span>Checkout</span><i>/</i><span>Order complete</span></div></div></section>
    <div class="wrap">
      <div id="cnote"></div>
      <div class="cart-grid">
        <form id="cform" style="min-width:0">
          <table class="ctable">
            <thead><tr><th colspan="2">Product</th><th class="num">Price</th><th style="text-align:center">Quantity</th><th class="num">Subtotal</th><th><span hidden>Remove</span></th></tr></thead>
            <tbody>${cart.map(i => { const p = bySku[i.sku]; return `<tr>
              <td class="pimg"><a href="${purl(p)}">${p.imgs[0] ? `<img src="${IMG + p.imgs[0]}" alt="">` : `<div class="ni"></div>`}</a></td>
              <td class="pn"><small>${esc(p.brand)}</small><a href="${purl(p)}">${esc(p.title)}</a></td>
              <td class="num pr-c">${tk(p.price)}</td>
              <td class="qt" style="text-align:center"><div class="qty-in"><button type="button" data-step="${p.sku}|-1" aria-label="Decrease">−</button><input type="number" min="0" max="99" value="${i.q}" data-qin="${p.sku}" aria-label="Quantity for ${esc(p.title)}"><button type="button" data-step="${p.sku}|1" aria-label="Increase">+</button></div></td>
              <td class="num sb">${tk(p.price * i.q)}</td>
              <td class="x" style="text-align:right"><button type="button" class="rm" data-rm="${p.sku}" aria-label="Remove ${esc(p.title)}">×</button></td>
            </tr>`; }).join("")}</tbody>
          </table>
          <div class="cart-actions">
            <div class="coupon"><label for="ccode" hidden>Coupon</label><input id="ccode" placeholder="Coupon code" value=""><button type="button" class="btn ghost" id="capply">Apply coupon</button></div>
            <button class="btn ghost" type="submit" id="cupdate" disabled>Update cart</button>
          </div>
          <p class="fine" style="margin-top:12px">Try the example coupon <b>HELLO10</b> for 10% off.</p>
        </form>
        <aside class="totals">
          <h2>Cart totals</h2>
          <div class="trow"><span>Subtotal</span><span>${tk(T.sub)}</span></div>
          ${T.code ? `<div class="trow"><span>Coupon: ${esc(T.code)} <button class="link" style="font-size:11px;margin-left:6px" id="crm">Remove</button></span><span class="disc">−${tk(T.disc)}</span></div>` : ""}
          <div><div class="trow" style="margin-bottom:10px"><span>Shipping</span></div>
            <div class="shipopts">${RATES.map(r => `<label><input type="radio" name="ship" value="${r.id}" ${T.ship === r.id ? "checked" : ""}>${r.label}<span class="amt">${tk(r.cost)}</span></label>`).join("")}
            ${T.free ? `<label><input type="radio" name="ship" value="free" ${T.ship === "free" ? "checked" : ""}>Free shipping<span class="amt">${tk(0)}</span></label>` : `<p class="fine" style="margin:0">Add ${tk(FREE - T.sub)} more for free shipping.</p>`}</div></div>
          <div class="trow total"><span>Total</span><span>${tk(T.total)}</span></div>
          <a class="btn full" href="checkout.html">Proceed to checkout</a>
        </aside>
      </div>
      ${cross.length ? `<section style="padding-bottom:80px"><div class="shead"><h2 style="font-size:24px">You may be interested in…</h2></div><div class="grid">${cross.map(card).join("")}</div></section>` : ""}
    </div>`;
    const dirty = () => { $("#cupdate").disabled = false; };
    $$("[data-qin]").forEach(inp => inp.oninput = dirty);
    $$("[data-step]").forEach(b => b.onclick = () => { const [s, d] = b.dataset.step.split("|"); const inp = $(`[data-qin="${s}"]`); inp.value = Math.max(0, (+inp.value || 0) + +d); dirty(); });
    $("#cform").onsubmit = e => { e.preventDefault(); $$("[data-qin]").forEach(inp => setQ(inp.dataset.qin, +inp.value)); note("Cart updated.", "ok"); };
    $("#capply").onclick = () => { const c = $("#ccode").value.trim().toUpperCase(); if (COUPONS[c]) { store.set("coupon", c); draw(); note("Coupon code applied successfully.", "ok"); } else note(c ? `Coupon "${esc(c)}" does not exist!` : "Please enter a coupon code.", "bad"); };
    $("#crm") && ($("#crm").onclick = () => { store.del("coupon"); draw(); note("Coupon has been removed.", "ok"); });
    $$('[name="ship"]').forEach(r => r.onchange = () => { store.set("ship", r.value); draw(); });
  };
  const note = (m, k) => { const n = $("#cnote"); if (n) n.innerHTML = `<div class="notice ${k}" style="margin-top:24px">${m}</div>`; };
  v.addEventListener("click", e => { const b = e.target.closest("[data-rm]"); if (b) { const t = bySku[b.dataset.rm].title; setQ(b.dataset.rm, 0); note(`“${esc(t)}” removed.`, "ok"); } });
  document.addEventListener("cart:change", draw);
  draw();
};

pages.checkout = v => {
  if (!cart.length) { v.innerHTML = `<section class="page-head"><div class="wrap"><h1>Checkout</h1></div></section><div class="wrap empty-page"><h2>Your cart is currently empty.</h2><a class="btn" href="shop.html">Return to shop</a></div>`; return; }
  const saved = store.get("billing", {});
  const F = (id, label, type = "text", req = true, extra = "") => `<div class="field" data-f="${id}"><label for="${id}">${label}${req ? ' <span class="req">*</span>' : ' <span class="muted">(optional)</span>'}</label><input id="${id}" name="${id}" type="${type}" ${req ? "required" : ""} value="${esc(saved[id] || "")}" ${extra}></div>`;
  const draw = () => {
    const T = totals();
    $("#review").innerHTML = `<h2>Your order</h2>
      ${cart.map(i => { const p = bySku[i.sku]; return `<div class="ritem"><span class="im">${p.imgs[0] ? `<img src="${IMG + p.imgs[0]}" alt="">` : `<span class="ni" style="display:block"></span>`}<span class="q">${i.q}</span></span><span>${esc(p.brand)} ${esc(p.title)}</span><span>${tk(p.price * i.q)}</span></div>`; }).join("")}
      <div class="trow" style="border-top:1px solid var(--line);padding-top:14px"><span>Subtotal</span><span>${tk(T.sub)}</span></div>
      ${T.code ? `<div class="trow"><span>Coupon: ${esc(T.code)}</span><span class="disc">−${tk(T.disc)}</span></div>` : ""}
      <div><div class="trow" style="margin-bottom:10px"><span>Shipping</span></div><div class="shipopts">${RATES.map(r => `<label><input type="radio" name="ship" value="${r.id}" ${T.ship === r.id ? "checked" : ""}>${r.label}<span class="amt">${tk(r.cost)}</span></label>`).join("")}${T.free ? `<label><input type="radio" name="ship" value="free" ${T.ship === "free" ? "checked" : ""}>Free shipping<span class="amt">${tk(0)}</span></label>` : ""}</div></div>
      <div class="trow total"><span>Total</span><span>${tk(T.total)}</span></div>
      <div class="pay">
        <div class="pm"><label><input type="radio" name="pay" value="cod" checked>Cash on delivery</label><div class="pd" data-pd="cod">Pay with cash when your order arrives.</div></div>
        <div class="pm"><label><input type="radio" name="pay" value="bacs">Direct bank transfer</label><div class="pd" data-pd="bacs" hidden>Pay into our bank account and use your order number as the reference. We ship once the payment clears.</div></div>
      </div>
      <p class="fine" style="margin:0">Your personal data will be used to process your order and for other purposes described in our <a class="link" href="shipping-returns.html#privacy">privacy policy</a>.</p>
      <label class="check"><input type="checkbox" id="terms" required><span>I have read and agree to the website <a class="link" href="shipping-returns.html#terms">terms and conditions</a> <span class="req" style="color:#B3261E">*</span></span></label>
      <button class="btn full" type="submit" form="coform" style="height:54px">Place order · ${tk(T.total)}</button>`;
    $$('[name="ship"]').forEach(r => r.onchange = () => { store.set("ship", r.value); draw(); });
    $$('[name="pay"]').forEach(r => r.onchange = () => $$("[data-pd]").forEach(d => d.hidden = d.dataset.pd !== r.value));
  };
  v.innerHTML = `
  <section class="page-head"><div class="wrap"><h1>Checkout</h1><div class="steps-bar"><a href="cart.html">Cart</a><i>/</i><b>Checkout</b><i>/</i><span>Order complete</span></div></div></section>
  <div class="wrap">
    <div class="notice" style="margin-top:24px"><span>Returning customer?</span><a class="link" href="my-account.html">Click here to log in</a></div>
    <div class="co-grid">
      <form id="coform" novalidate style="min-width:0">
        <div class="co-sec"><h2>Billing details</h2>
          <div class="row2">${F("first_name", "First name")}${F("last_name", "Last name")}</div>
          ${F("phone", "Phone", "tel", true, 'placeholder="01XXXXXXXXX" inputmode="tel"')}
          ${F("email", "Email address", "email", false)}
          <div class="field" data-f="state"><label for="state">District <span class="req">*</span></label><select id="state" name="state" required><option value="">Select a district…</option>${DISTRICTS.map(d => `<option ${saved.state === d ? "selected" : ""}>${d}</option>`).join("")}</select></div>
          ${F("city", "Town / City")}
          ${F("address_1", "Street address", "text", true, 'placeholder="House number and street name"')}
          ${F("postcode", "Postcode / ZIP", "text", false)}
        </div>
        <div class="co-sec" style="border-bottom:0;margin-bottom:0">
          <label class="check"><input type="checkbox" id="shipdiff">Ship to a different address?</label>
          <div id="shipaddr" hidden style="display:grid;gap:16px">
            <div class="row2"><div class="field"><label for="s_first">First name</label><input id="s_first"></div><div class="field"><label for="s_last">Last name</label><input id="s_last"></div></div>
            <div class="field"><label for="s_addr">Street address</label><input id="s_addr"></div>
          </div>
          <div class="field"><label for="notes">Order notes <span class="muted">(optional)</span></label><textarea id="notes" placeholder="Notes about your order, e.g. a landmark for delivery."></textarea></div>
        </div>
      </form>
      <aside class="review" id="review"></aside>
    </div>
  </div>`;
  draw();
  $("#coform").addEventListener("input", e => { const f = e.target.closest(".field.bad"); if (f) { f.classList.remove("bad"); $(".err", f)?.remove(); } });
  $("#coform").addEventListener("change", e => { const f = e.target.closest(".field.bad"); if (f) { f.classList.remove("bad"); $(".err", f)?.remove(); } });
  $("#shipdiff").onchange = e => $("#shipaddr").hidden = !e.target.checked;
  $("#state").onchange = e => { if (!totals().free) { store.set("ship", e.target.value === "Dhaka" ? "dhaka" : "outside"); draw(); } };
  $("#coform").onsubmit = e => {
    e.preventDefault();
    let ok = true; const data = {};
    $$("[data-f]").forEach(f => {
      const inp = $("input,select", f); const val = inp.value.trim(); data[inp.id] = val;
      let msg = inp.required && !val ? "is a required field." : "";
      if (!msg && inp.id === "phone" && !/^(\+?88)?01[3-9]\d{8}$/.test(val.replace(/[\s-]/g, ""))) msg = "is not a valid Bangladeshi mobile number.";
      if (!msg && inp.id === "email" && val && !/^\S+@\S+\.\S+$/.test(val)) msg = "is not a valid email address.";
      f.classList.toggle("bad", !!msg); $(".err", f)?.remove();
      if (msg) { ok = false; f.insertAdjacentHTML("beforeend", `<span class="err">${$("label", f).childNodes[0].textContent.trim()} ${msg}</span>`); }
    });
    if (!$("#terms").checked) { ok = false; toast("Please read and accept the terms and conditions to proceed."); }
    if (!ok) { const b = $(".field.bad"); b && b.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    store.set("billing", data);
    const T = totals();
    const order = { no: 1000 + Math.floor(Math.random() * 9000), date: new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }), items: cart, T, pay: $('[name="pay"]:checked').value, billing: data, rateLabel: T.ship === "free" ? "Free shipping" : RATES.find(r => r.id === T.ship).label };
    store.set("lastOrder", order);
    store.set("orders", [order, ...store.get("orders", [])].slice(0, 10));
    cart = []; saveCart(); store.del("coupon");
    location.href = "order-received.html";
  };
};

function orderTable(o) {
  return `<table class="otable"><thead><tr><th>Product</th><th>Total</th></tr></thead><tbody>
    ${o.items.map(i => { const p = bySku[i.sku]; return p ? `<tr><td><a class="link" href="${purl(p)}">${esc(p.brand)} ${esc(p.title)}</a> × ${i.q}</td><td>${tk(p.price * i.q)}</td></tr>` : ""; }).join("")}</tbody>
    <tfoot><tr><th>Subtotal:</th><td>${tk(o.T.sub)}</td></tr>${o.T.code ? `<tr><th>Discount:</th><td>−${tk(o.T.disc)}</td></tr>` : ""}<tr><th>Shipping:</th><td>${o.T.rate ? tk(o.T.rate) : "Free"} <span class="muted">via ${esc(o.rateLabel)}</span></td></tr><tr><th>Payment method:</th><td>${o.pay === "cod" ? "Cash on delivery" : "Direct bank transfer"}</td></tr><tr><th>Total:</th><td><b>${tk(o.T.total)}</b></td></tr></tfoot></table>`;
}
pages.received = v => {
  const o = store.get("lastOrder", null);
  if (!o) { v.innerHTML = `<section class="page-head"><div class="wrap"><h1>Order received</h1></div></section><div class="wrap empty-page"><h2>No recent order found.</h2><p class="muted" style="margin:0">Place an order from the checkout to see this page.</p><a class="btn" href="shop.html">Return to shop</a></div>`; return; }
  const b = o.billing;
  v.innerHTML = `
  <section class="page-head"><div class="wrap"><h1>Order received</h1><div class="steps-bar"><span>Cart</span><i>/</i><span>Checkout</span><i>/</i><b>Order complete</b></div></div></section>
  <div class="wrap thanks">
    <div class="notice ok">Thank you. Your order has been received.</div>
    <div class="ometa"><div><span>Order number</span><b>${o.no}</b></div><div><span>Date</span><b>${o.date}</b></div><div><span>Total</span><b>${tk(o.T.total)}</b></div><div><span>Payment method</span><b>${o.pay === "cod" ? "Cash on delivery" : "Bank transfer"}</b></div></div>
    ${o.pay === "cod" ? `<p style="margin:0">Pay with cash when your order arrives.</p>` : `<p style="margin:0">Please transfer the total to our bank account and use order number <b>${o.no}</b> as the reference. <span class="example">Bank details added in WooCommerce settings</span></p>`}
    <div><h2 style="font-size:22px;margin-bottom:14px">Order details</h2>${orderTable(o)}</div>
    <div><h2 style="font-size:22px;margin-bottom:14px">Billing address</h2><address class="addr">${esc(b.first_name)} ${esc(b.last_name)}<br>${esc(b.address_1)}<br>${esc(b.city)}, ${esc(b.state)}${b.postcode ? " " + esc(b.postcode) : ""}<br>${esc(b.phone)}${b.email ? "<br>" + esc(b.email) : ""}</address></div>
    <div style="display:flex;gap:12px;flex-wrap:wrap"><a class="btn" href="shop.html">Continue shopping</a><a class="btn ghost" href="my-account.html">View my account</a></div>
  </div>`;
};

pages.account = v => {
  const user = store.get("user", null);
  if (!user) {
    v.innerHTML = `
    <section class="page-head"><div class="wrap"><h1>My account</h1></div></section>
    <div class="wrap acct">
      <form id="login"><h2>Login</h2>
        <div class="field"><label for="lu">Username or email address <span class="req">*</span></label><input id="lu" required autocomplete="username"></div>
        <div class="field"><label for="lp">Password <span class="req">*</span></label><input id="lp" type="password" required autocomplete="current-password"></div>
        <label class="check"><input type="checkbox">Remember me</label>
        <div><button class="btn" type="submit">Log in</button></div>
        <a class="link" href="#" id="lost" style="justify-self:start">Lost your password?</a>
      </form>
      <form id="register"><h2>Register</h2>
        <div class="field"><label for="re">Email address <span class="req">*</span></label><input id="re" type="email" required autocomplete="email"></div>
        <p class="fine" style="margin:0">A link to set a new password will be sent to your email address.</p>
        <p class="fine" style="margin:0">Your personal data will be used to support your experience throughout this website and for other purposes described in our <a class="link" href="shipping-returns.html#privacy">privacy policy</a>.</p>
        <div><button class="btn ghost" type="submit">Register</button></div>
      </form>
    </div>`;
    $("#login").onsubmit = e => { e.preventDefault(); store.set("user", { name: $("#lu").value.split("@")[0] }); location.reload(); };
    $("#register").onsubmit = e => { e.preventDefault(); store.set("user", { name: $("#re").value.split("@")[0] }); location.reload(); };
    $("#lost").onclick = e => { e.preventDefault(); toast("Password reset isn't connected in this preview"); };
    return;
  }
  const orders = store.get("orders", []), b = store.get("billing", {});
  const tabs = { dashboard: "Dashboard", orders: "Orders", addresses: "Addresses", details: "Account details", logout: "Log out" };
  let tab = "dashboard";
  const body = () => ({
    dashboard: `<h2>Hello ${esc(user.name)}</h2><p style="margin:0">From your account dashboard you can view your <button class="link" data-tab="orders">recent orders</button>, manage your <button class="link" data-tab="addresses">shipping and billing addresses</button>, and <button class="link" data-tab="details">edit your password and account details</button>.</p>`,
    orders: orders.length ? `<h2>Orders</h2><div class="tscroll"><table class="otable"><thead><tr><th>Order</th><th>Date</th><th>Status</th><th>Total</th></tr></thead><tbody>${orders.map(o => `<tr><td>#${o.no}</td><td>${o.date}</td><td>Processing</td><td>${tk(o.T.total)} for ${o.items.reduce((a, i) => a + i.q, 0)} items</td></tr>`).join("")}</tbody></table></div>` : `<div class="notice"><span>No order has been made yet.</span><a class="btn ghost" href="shop.html">Browse products</a></div>`,
    addresses: `<h2>Addresses</h2><p class="muted" style="margin:0">The following addresses will be used on the checkout page by default.</p><div class="row2"><div><h3 style="font-size:15px;margin-bottom:8px">Billing address</h3><address class="addr">${b.first_name ? `${esc(b.first_name)} ${esc(b.last_name)}<br>${esc(b.address_1)}<br>${esc(b.city)}, ${esc(b.state)}<br>${esc(b.phone)}` : "You have not set up this type of address yet."}</address></div><div><h3 style="font-size:15px;margin-bottom:8px">Shipping address</h3><address class="addr">You have not set up this type of address yet.</address></div></div>`,
    details: `<h2>Account details</h2><form id="det" style="display:grid;gap:16px;max-width:520px"><div class="row2"><div class="field"><label for="dfn">First name</label><input id="dfn" value="${esc(b.first_name || "")}"></div><div class="field"><label for="dln">Last name</label><input id="dln" value="${esc(b.last_name || "")}"></div></div><div class="field"><label for="ddn">Display name</label><input id="ddn" value="${esc(user.name)}"></div><div class="field"><label for="dem">Email address</label><input id="dem" type="email" value="${esc(b.email || "")}"></div><div><button class="btn" type="submit">Save changes</button></div></form>`
  }[tab]);
  const draw = () => {
    v.innerHTML = `<section class="page-head"><div class="wrap"><h1>My account</h1></div></section>
    <div class="wrap dash"><nav class="dnav">${Object.entries(tabs).map(([k, l]) => `<button class="${k === tab ? "on" : ""}" data-tab="${k}">${l}</button>`).join("")}</nav><div class="dbody">${body()}</div></div>`;
    $("#det") && ($("#det").onsubmit = e => { e.preventDefault(); toast("Account details changed successfully."); });
  };
  v.addEventListener("click", e => { const t = e.target.closest("[data-tab]"); if (!t) return; if (t.dataset.tab === "logout") { store.del("user"); location.reload(); return; } tab = t.dataset.tab; draw(); });
  draw();
};

pages.about = v => {
  const a = bySku["HS-DEC-001"], b = bySku["HS-DK-014"];
  v.innerHTML = `
  <section class="page-head"><div class="wrap"><p class="label muted" style="margin:0 0 12px">About us</p><h1>Skincare you can trust, delivered across Bangladesh.</h1></div></section>
  <section class="about-split"><div class="img"><img src="${IMG + a.imgs[2]}" alt="" loading="lazy"></div>
    <div class="txt"><p class="label muted" style="margin:0">Our story</p><h2>Fewer products. Better ones.</h2>
    <p>Hello Skin started with a simple frustration: it is hard to know whether the serum you ordered online is the real thing. We buy only from official distributors, store products away from heat, and stock a short list of formulas that work in our climate.</p>
    <p>Our shelves cover the routine most skin needs: a gentle cleanser, a targeted serum, a light moisturiser and a sunscreen you'll actually wear, plus hair and body care from brands we trust.</p>
    <div><a class="btn" href="shop.html">Shop the range</a></div></div></section>
  <section class="section"><div class="wrap"><div class="shead"><h2>What we promise</h2></div>
    <div class="vals"><div><h3>100% authentic</h3><p>Every product comes from the brand or its official distributor in Bangladesh.</p></div><div><h3>Honest advice</h3><p>We'll tell you when you don't need another product. Ask us anything on Facebook.</p></div><div><h3>Delivered with care</h3><p>Cash on delivery nationwide, and free delivery on orders over ${tk(FREE)}.</p></div></div>
  </div></section>
  <section class="split"><div class="txt"><p class="label muted" style="margin:0">${BRANDS.length} brands, ${P.length} products</p><h2>Brands we carry</h2><p>${BRANDS.join(", ")}.</p><div><a class="link" href="shop.html">Browse all products</a></div></div><div class="img"><img src="${IMG + b.imgs[1]}" alt="" loading="lazy"></div></section>`;
};

pages.contact = v => {
  v.innerHTML = `
  <section class="page-head"><div class="wrap"><h1>Contact us</h1><p>Questions about an order, a product or your routine? Send us a message and we'll reply within one working day.</p></div></section>
  <div class="wrap contact">
    <form id="cf">
      <div class="row2"><div class="field"><label for="cn">Name <span class="req">*</span></label><input id="cn" required></div><div class="field"><label for="cp">Phone</label><input id="cp" type="tel"></div></div>
      <div class="field"><label for="ce">Email <span class="req">*</span></label><input id="ce" type="email" required></div>
      <div class="field"><label for="cs">Topic</label><select id="cs"><option>Order or delivery</option><option>Product question</option><option>Returns</option><option>Something else</option></select></div>
      <div class="field"><label for="cm">Message <span class="req">*</span></label><textarea id="cm" required style="height:160px"></textarea></div>
      <div><button class="btn" type="submit">Send message</button></div>
      <div id="cmsg" aria-live="polite"></div>
    </form>
    <aside class="cinfo">
      <div><h3>Message us</h3><p>The fastest way to reach us is our <a class="link" href="https://www.facebook.com/profile.php?id=61578828301744" target="_blank" rel="noopener">Facebook page</a>.</p></div>
      <div><h3>Phone &amp; email</h3><p><span class="example">Add your phone and email</span></p></div>
      <div><h3>Hours</h3><p>Saturday to Thursday, 10am – 8pm</p></div>
      <div><h3>Help</h3><p><a class="link" href="shipping-returns.html">Shipping &amp; returns</a> · <a class="link" href="shipping-returns.html#faq">FAQ</a></p></div>
    </aside>
  </div>`;
  $("#cf").onsubmit = e => { e.preventDefault(); $("#cmsg").innerHTML = `<div class="notice ok">Thanks, your message has been sent. In the live site this goes to your inbox through the Elementor Pro form.</div>`; e.target.reset(); };
};

pages.policies = v => {
  v.innerHTML = `
  <section class="page-head"><div class="wrap"><h1>Shipping &amp; returns</h1><p>Delivery times, costs and how returns work. <span class="example">Example terms, replace with your own</span></p></div></section>
  <div class="wrap prose">
    <h2>Delivery</h2>
    <ul><li><b>Inside Dhaka:</b> ৳60, delivered in 1–2 working days.</li><li><b>Outside Dhaka:</b> ৳120, delivered in 2–4 working days.</li><li><b>Free delivery</b> on every order over ${tk(FREE)}.</li><li>Cash on delivery is available across Bangladesh.</li></ul>
    <h2>Returns</h2>
    <p>Unopened, unused items can be returned within 7 days of delivery. For hygiene reasons we can't accept opened skincare unless it arrived damaged or was the wrong item. Contact us with your order number and a photo, and we'll arrange a replacement or refund.</p>
    <h2 id="faq">FAQ</h2>
    <div class="faq">
      <details><summary>Are your products original?</summary><div class="a">Yes. We buy only from brands and their official distributors in Bangladesh.</div></details>
      <details><summary>How do I choose the right product?</summary><div class="a">Start with your main concern (acne, dark spots, dryness or sun protection), then browse that category. Message us on Facebook if you're unsure.</div></details>
      <details><summary>Can I change my order after placing it?</summary><div class="a">Contact us as soon as possible. If the order hasn't shipped, we can change or cancel it.</div></details>
      <details><summary>Which payment methods do you accept?</summary><div class="a">Cash on delivery and direct bank transfer.</div></details>
    </div>
    <h2 id="privacy">Privacy policy</h2>
    <p>We use your details only to process and deliver your order and, if you sign up, to send our newsletter. <span class="example">Full policy to be added</span></p>
    <h2 id="terms">Terms and conditions</h2>
    <p>By placing an order you agree to our delivery and returns terms above. <span class="example">Full terms to be added</span></p>
  </div>`;
};

/* ---------------- boot ---------------- */
document.addEventListener("click", e => {
  const a = e.target.closest("[data-add]"); if (a) { e.preventDefault(); add(a.dataset.add); return; }
  const r = e.target.closest("#drawer [data-rm]"); if (r) setQ(r.dataset.rm, 0);
});
chrome();
const map = { home: "home", shop: "shop", product: "product", cart: "cart", checkout: "checkout", received: "received", account: "account", about: "about", contact: "contact", policies: "policies" };
pages[map[document.body.dataset.page]]($("#view"));
})();
