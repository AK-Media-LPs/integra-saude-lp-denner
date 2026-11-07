/* Mini-runtime: substitui o motor do Claude Design (estado + bindings) por JS puro. */
(function () {
  var PROPS = {"verde": "#3FB8A5", "laranja": "#F26B21"};
  function DCLogic(props) { this.props = props || {}; this.state = {}; }
  DCLogic.prototype.setState = function (p) {
    var ps = this.state;
    this.state = Object.assign({}, ps, typeof p === 'function' ? p(ps) : p);
    paint(this);
    if (this.componentDidUpdate) this.componentDidUpdate(this.props, ps);
  };
  var VALS = {};
  function fill(t) { return t.replace(/\{\{\s*([\w$]+)\s*\}\}/g, function (_, k) { var v = VALS[k]; return v == null ? '' : String(v); }); }
  function paint(c) {
    VALS = c.renderVals ? (c.renderVals() || {}) : {};
    document.querySelectorAll('[data-x]').forEach(function (el) {
      for (var i = 0; i < el.attributes.length; i++) {
        var a = el.attributes[i];
        if (a.name.indexOf('data-x-') !== 0) continue;
        var n = a.name.slice(7);
        if (n === 'if') el.hidden = !VALS[a.value];
        else if (n === 'onclick') continue;
        else el.setAttribute(n, fill(a.value));
      }
    });
  }
  function wire() {
    document.querySelectorAll('[data-x-onclick]').forEach(function (el) {
      el.addEventListener('click', function (e) { var f = VALS[el.getAttribute('data-x-onclick')]; if (typeof f === 'function') f(e); });
    });
  }
class Component extends DCLogic {
  constructor(props) { super(props); this.state = { sym: 0, tr: 0, anos: 7 }; }
  componentDidMount() {
    this.startMotion();
    this.setupBar();
    var me = this; setTimeout(function () { me.drawLink(false); }, 600);
    if (typeof IntersectionObserver === 'undefined') return;
    var self = this;
    var items = document.querySelectorAll('[data-sym]');
    this.io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) self.setState({ sym: Number(e.target.getAttribute('data-sym')) }); });
    }, { rootMargin: '-40% 0px -40% 0px' });
    items.forEach(function (i) { self.io.observe(i); });
    var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  componentDidUpdate(pp, ps) { if (ps && ps.tr !== this.state.tr) this.pulseTr(); }
  componentWillUnmount() {
    clearInterval(this.cyc);
    this.stopMotion();
    if (this.io) this.io.disconnect();
    if (this.ioB) this.ioB.disconnect();
    if (this.ioA) this.ioA.disconnect();
    if (this.tm) clearInterval(this.tm);
  }
  setupBar() {
    var bar = document.querySelector('.mbar'), cta = document.querySelector('#topo .btn');
    if (!bar || !cta || typeof IntersectionObserver === 'undefined') return;
    var ends = document.querySelectorAll('[data-mbar-end]'), past = false, vis = 0, seen = new Set();
    var upd = function () { bar.classList.toggle('on', past && seen.size === 0); };
    this.ioB = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.target === cta) past = !e.isIntersecting && e.boundingClientRect.top < 0;
        else if (e.isIntersecting) seen.add(e.target); else seen.delete(e.target);
      });
      upd();
    });
    this.ioB.observe(cta);
    ends.forEach(function (e) { this.ioB.observe(e); }, this);
  }
  startMotion() {
    var self = this, n = 0;
    var t = function () {
      if (self.booted || self.dead) return;
      if (window.gsap && window.ScrollTrigger) return self.bootMotion();
      if (++n < 50) self.mt = setTimeout(t, 100);
    };
    t();
    if (!this.onRz) { this.onRz = function () { t(); }; window.addEventListener('resize', this.onRz); }
  }
  bootMotion() {
    var d = document.documentElement;
    var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (calm || d.scrollHeight < window.innerHeight + 200) return;
    this.booted = true;
    var g = window.gsap, ST = window.ScrollTrigger, self = this;
    g.registerPlugin(ST);
    d.classList.add('gs');
    this.ctx = g.context(function () { self.motion(g, ST); });
    this.onLd = function () { ST.refresh(); };
    if (window.ResizeObserver) { var tm; this.ro = new ResizeObserver(function () { clearTimeout(tm); tm = setTimeout(function () { ST.refresh(); }, 250); }); this.ro.observe(document.body); }
    window.addEventListener('load', this.onLd);
    document.querySelectorAll('img').forEach(function (i) { if (!i.complete) i.addEventListener('load', self.onLd, { once: true }); });
  }
  stopMotion() {
    this.dead = true;
    clearTimeout(this.mt);
    if (this.onRz) window.removeEventListener('resize', this.onRz);
    if (this.onLd) window.removeEventListener('load', this.onLd);
    if (this.ro) this.ro.disconnect();
    if (this.ctx) this.ctx.revert();
    document.documentElement.classList.remove('gs');
  }
  motion(g, ST) {
    
    var mob = window.matchMedia('(max-width:900px)').matches;
    var $ = function (s) { return g.utils.toArray(s); };
    var rev = function (s, v, t) {
      var els = $(s); if (!els.length) return;
      g.from(els, Object.assign({ y: 50, autoAlpha: 0, duration: .9, ease: 'power3.out', stagger: .09, scrollTrigger: { trigger: t || els[0], start: 'top 88%', once: true } }, v || {}));
    };
    var intro = g.timeline({ defaults: { ease: 'power4.out' } });
    intro.from('nav', { y: -90, autoAlpha: 0, duration: .9 })
      .from('#topo > div > p', { y: 16, autoAlpha: 0, duration: .6 }, .15)
      .from('#topo h1 .w', { yPercent: 90, rotate: 6, autoAlpha: 0, duration: .9, stagger: .05 }, .2)
      .fromTo('#topo h1 .mt', { '--mx': 0 }, { '--mx': 1, duration: .7, ease: 'power2.inOut' }, .8)
      .from('.ht > *', { y: 30, autoAlpha: 0, stagger: .1, duration: .8 }, .55)
      .from('#topo .clip .bk', { scaleY: .2, transformOrigin: '50% 100%', autoAlpha: 0, duration: 1.2, ease: 'elastic.out(1,.7)' }, .35)
      .from('#topo .ph', { yPercent: 28, scale: .94, autoAlpha: 0, duration: 1.3 }, .5)
      .from('#topo .fc', { scale: .4, autoAlpha: 0, duration: .9, ease: 'back.out(2)', stagger: .16 }, 1);
    if (!mob) g.to('#topo .ph', { y: 70, ease: 'none', scrollTrigger: { trigger: '#topo', start: 'top top', end: 'bottom top', scrub: true } });
    if (!mob) g.to('#topo .clip .bk', { y: 18, ease: 'none', scrollTrigger: { trigger: '#topo', start: 'top top', end: 'bottom top', scrub: true } });
    if (!mob) {
      $('#topo .fc').forEach(function (c, i) { g.to(c, { y: i % 2 ? 12 : -12, rotation: i % 2 ? 1.2 : -1.2, duration: 2.4 + i * .5, ease: 'sine.inOut', yoyo: true, repeat: -1, delay: 1.8 }); });
      var layers = [['#topo .ph', -14], ['#topo .clip .bk', 8]].map(function (l) { return [g.quickTo(l[0], 'x', { duration: .8, ease: 'power3' }), l[1]]; });
      var cards = $('#topo .fc').map(function (c, i) { return [g.quickTo(c, 'x', { duration: .9, ease: 'power3' }), 22 + i * 6]; });
      document.getElementById('topo').addEventListener('mousemove', function (e) {
        var p = e.clientX / window.innerWidth - .5;
        layers.concat(cards).forEach(function (l) { l[0](p * l[1]); });
      });
      $('.btn').forEach(function (b) {
        var bx = g.quickTo(b, 'x', { duration: .5, ease: 'power3' }), by = g.quickTo(b, 'y', { duration: .5, ease: 'power3' });
        b.addEventListener('mousemove', function (e) { var r = b.getBoundingClientRect(); bx((e.clientX - r.left - r.width / 2) * .18); by((e.clientY - r.top - r.height / 2) * .35); });
        b.addEventListener('mouseleave', function () { bx(0); by(0); });
      });
      g.to('#sintomas .hand', { rotation: 2.5, transformOrigin: '50% 100%', duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    }
    g.to('.seta svg', { x: 3, y: -3, duration: .7, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    g.fromTo('.ht .btn', { boxShadow: '0 0 0 0 rgba(63,184,165,.6)' }, { boxShadow: '0 0 0 18px rgba(63,184,165,0)', duration: 1.6, repeat: -1, repeatDelay: .5, ease: 'power2.out', delay: 2 });
    g.fromTo('.ctag .btn', { boxShadow: '0 0 0 0 rgba(20,23,20,.5)' }, { boxShadow: '0 0 0 18px rgba(20,23,20,0)', duration: 1.6, repeat: -1, repeatDelay: .5, ease: 'power2.out' });

    var strip = document.getElementById('anos').parentNode;
    g.from(strip, { scale: .86, autoAlpha: 0, duration: 1, ease: 'back.out(1.6)', scrollTrigger: { trigger: strip, start: 'top 90%', once: true } });
    rev(strip.children, { stagger: .15, delay: .2 }, strip);

    rev('#sintomas p:not(:last-child), #sintomas h2', {}, '#sintomas h2');
    $('.sym').forEach(function (s) { g.from(s, { x: -70, autoAlpha: 0, duration: .8, ease: 'power3.out', scrollTrigger: { trigger: s, start: 'top 90%', once: true } }); });
    rev('#sintomas ul + p', {});
    var hp = $('#sintomas .hand path'), ht = g.timeline({ scrollTrigger: { trigger: '#sintomas .hand', start: 'top 80%', once: true } });
    hp.forEach(function (p, i) { var L = p.getTotalLength(); g.set(p, { strokeDasharray: L, strokeDashoffset: L }); ht.to(p, { strokeDashoffset: 0, duration: i ? .6 : 2, ease: 'power2.inOut' }, i ? 1.2 : 0); });
    ht.from('#sintomas .hand .pt', { scale: 0, transformOrigin: '50% 50%', duration: .5, ease: 'back.out(3)', stagger: .12, clearProps: 'transform' }, 1.4);

    var tb = document.querySelector('#trata .tb');
    g.fromTo(tb, { scale: .88, y: 60 }, { scale: 1, y: 0, ease: 'none', scrollTrigger: { trigger: tb, start: 'top 95%', end: 'top 45%', scrub: .6 } });
    rev('#trata header > *', {}, '#trata header');
    g.fromTo('#trata h2 .mt', { '--mx': 0 }, { '--mx': 1, duration: .8, ease: 'power2.inOut', delay: .3, scrollTrigger: { trigger: '#trata h2', start: 'top 85%', once: true } });
    var self5 = this, t5 = '.t5';
    var tl5 = g.timeline({ scrollTrigger: { trigger: t5, start: 'top 80%', once: true }, onComplete: function () { self5.drawLink(true); } });
    $('#trata .hand.big path').forEach(function (p, i) { var L = p.getTotalLength(); g.set(p, { strokeDasharray: L, strokeDashoffset: L }); tl5.to(p, { strokeDashoffset: 0, duration: i ? .5 : 1.5, ease: 'power2.inOut' }, i ? .9 : 0); });
    tl5.from('.hs', { scale: 0, duration: .55, ease: 'back.out(3)', stagger: .09 }, .7)
      .from('.cl > *', { x: mob ? 0 : -90, y: mob ? 24 : 0, autoAlpha: 0, duration: .75, ease: 'power3.out', stagger: .1 }, .3)
      .from('.cr > *', { x: mob ? 0 : 90, y: mob ? 24 : 0, autoAlpha: 0, duration: .75, ease: 'power3.out', stagger: .1 }, .3);
    g.from('.det > *', { y: 60, autoAlpha: 0, duration: .9, ease: 'power3.out', stagger: .15, scrollTrigger: { trigger: '.det', start: 'top 90%', once: true } });
    ST.create({ trigger: t5, start: 'top 60%', end: 'bottom 20%', onToggle: function (s) {
      clearInterval(self5.cyc);
      if (s.isActive && !self5.touched) self5.cyc = setInterval(function () { self5.setState({ tr: (self5.state.tr + 1) % 5, auto: true }); }, 3600);
    } });
    ST.addEventListener('refresh', function () { self5.drawLink(false); });

    g.to('#wv1', { attr: { d: 'M0 60 C180 130 330 120 520 70 C720 20 880 10 1080 70 C1220 110 1340 120 1440 80 L1440 150 L0 150 Z' }, ease: 'none', scrollTrigger: { trigger: '#wv1', start: 'top bottom', end: 'bottom top', scrub: .8 } });

    rev('#como > div > p, #como h2', {}, '#como h2');
    var tk = document.querySelector('.trk i');
    g.fromTo(tk, mob ? { scaleY: 0 } : { scaleX: 0 }, Object.assign({ ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 78%', end: mob ? 'bottom 60%' : 'top 40%', scrub: .6 } }, mob ? { scaleY: 1 } : { scaleX: 1 }));
    $('.stp').forEach(function (s, i) {
      var tl = g.timeline({ scrollTrigger: { trigger: mob ? s : '.steps', start: mob ? 'top 80%' : 'top 75%', once: true }, delay: mob ? 0 : i * .3 });
      tl.from(s.querySelector('.mk'), { scale: 0, rotation: -120, duration: .8, ease: 'back.out(2.2)' })
        .from(s.querySelectorAll('h3, p, svg'), { y: 28, autoAlpha: 0, duration: .7, ease: 'power3.out', stagger: .1 }, .2);
    });

    g.from('#quem .clip > div', { x: -130, rotation: -7, scale: .8, autoAlpha: 0, duration: 1.2, ease: 'power4.out', scrollTrigger: { trigger: '#quem .clip', start: 'top 82%', once: true } });
    g.from('#quem .clip img', { yPercent: 22, autoAlpha: 0, duration: 1.3, delay: .25, ease: 'power3.out', scrollTrigger: { trigger: '#quem .clip', start: 'top 82%', once: true } });
    rev('#quem .rv > *', { x: 50, y: 0 }, '#quem .rv');

    rev('#duvidas h2', {});
    $('#duvidas details').forEach(function (d) {
      g.from(d, { x: 60, autoAlpha: 0, duration: .7, ease: 'power3.out', scrollTrigger: { trigger: d, start: 'top 92%', once: true } });
      d.addEventListener('toggle', function () { if (d.open) { g.from(d.querySelector('p'), { y: -12, autoAlpha: 0, duration: .45, ease: 'power2.out' }); } ST.refresh(); });
    });

    var ct = document.querySelector('.ctag');
    g.fromTo(ct, { scale: .86 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: ct, start: 'top 98%', end: 'top 50%', scrub: .6 } });
    rev('.ctag .rv > *', {}, '.ctag .rv');
    var fsafe = function () {
      var max = ST.maxScroll(window);
      ST.getAll().forEach(function (t) { if (t.vars.once && t.animation && t.start >= max - 2) t.animation.progress(1); });
    };
    ST.addEventListener('refresh', fsafe);
    fsafe();
    
  }
  drawLink(anim) {
    var w = document.querySelector('.t5'), p = document.getElementById('lkp');
    if (!w || !p) return;
    if (window.matchMedia('(max-width:900px)').matches) return;
    var a = w.querySelector('.tp.on'), b = w.querySelector('.hs.on');
    if (!a || !b) return;
    var r = w.getBoundingClientRect(), k = r.width / (w.offsetWidth || r.width);
    var ar = a.getBoundingClientRect(), br = b.getBoundingClientRect();
    var left = ar.left < br.left;
    var x1 = ((left ? ar.right : ar.left) - r.left) / k, y1 = (ar.top + ar.height / 2 - r.top) / k;
    var x2 = ((left ? br.left : br.right) - r.left) / k, y2 = (br.top + br.height / 2 - r.top) / k;
    var mx = (x1 + x2) / 2;
    p.setAttribute('d', 'M' + x1 + ' ' + y1 + ' C' + mx + ' ' + y1 + ' ' + mx + ' ' + y2 + ' ' + x2 + ' ' + y2);
    var g = window.gsap;
    if (g && this.booted) {
      var L = p.getTotalLength();
      g.killTweensOf(p);
      if (anim) g.fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: .55, ease: 'power2.out' });
      else g.set(p, { strokeDasharray: 'none', strokeDashoffset: 0 });
    }
  }
  pulseTr() {
    this.drawLink(true);
    if (!this.booted) return;
    var g = window.gsap;
    var d = document.querySelector('sc-if:not([hidden]) .dt1');
    if (d) {
      g.from(d.querySelector('.bn'), { yPercent: 70, rotate: -8, autoAlpha: 0, duration: .6, ease: 'back.out(1.8)' });
      g.from(d.querySelectorAll('.dh, .dp'), { x: 36, autoAlpha: 0, duration: .55, ease: 'power3.out', stagger: .07 });
    }
    g.fromTo('#como .pt.go', { scale: 2.4, transformOrigin: '50% 50%' }, { scale: 1, duration: .7, ease: 'elastic.out(1,.5)', clearProps: 'transform' });
  }
  renderVals() {
    var r = document.documentElement.style;
    r.setProperty('--verde', this.props.verde ?? '#3FB8A5');
    r.setProperty('--laranja', this.props.laranja ?? '#F26B21');
    var sym = this.state.sym, tr = this.state.tr, self = this;
    var ptTr = [1, 4, 2, 3, 0][tr];
    var v = { gx: [52.5, 62.5, 51.6, 26.3, 34.4][tr], gy: [88.8, 39.5, 67.4, 67, 30.2][tr] };
    for (var i = 0; i < 5; i++) {
      v['s' + i] = i === sym ? 'at' : (i < sym ? 'lit' : '');
      v['p' + i] = i === sym ? 'on' : (i < sym ? 'lit' : '');
      v['q' + i] = i === ptTr ? 'on' : '';
      v['g' + i] = i === ptTr ? 'go' : '';
      v['o' + i] = i === ptTr ? 1 : 0.25;
      v['t' + i] = i === tr;
      v['c' + i] = i === tr ? 'on' : '';
      (function (k) { v['pick' + k] = function () { self.touched = true; clearInterval(self.cyc); self.setState({ tr: k }); }; })(i);
    }
    return v;
  }
}
  function boot() {
    var c = new Component(PROPS);
    if (!c.state) c.state = {};
    paint(c); wire();
    if (c.componentDidMount) c.componentDidMount();
    window.addEventListener('pagehide', function () { if (c.componentWillUnmount) c.componentWillUnmount(); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();

/* Rastreamento: clique em qualquer link de WhatsApp = Lead */
document.addEventListener('click', function (e) {
  var a = e.target.closest && e.target.closest('a[href*="wa.me"]');
  if (!a) return;
  var label = (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 80);
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event: 'clique_whatsapp', cta_texto: label, cta_url: a.href });
  if (typeof window.fbq === 'function') window.fbq('track', 'Lead');
  if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead', { cta_texto: label });
}, true);
