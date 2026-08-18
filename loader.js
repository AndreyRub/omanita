/* Omanita dynamic content: reads schedule + prices from Google Sheets.
   On any failure the baked-in HTML stays untouched. */
var OM_SHEETS = {
  sched: '1kWy3JAuxhRy6kxYn9UwcodEmH9fqOsXUSG1NA3jNobc',
  price: '1Ef_XxV0bJeuKL7HUaJYuSsoyGjRk2I4gST-gfIrMjKI'
};
function omCsvUrl(id){ return 'https://docs.google.com/spreadsheets/d/' + id + '/gviz/tq?tqx=out:csv'; }
function omParseCsv(text){
  var rows = [], row = [], cur = '', q = false;
  for (var i = 0; i < text.length; i++){
    var c = text[i];
    if (q){
      if (c === '"'){ if (text[i+1] === '"'){ cur += '"'; i++; } else q = false; }
      else cur += c;
    } else if (c === '"') q = true;
    else if (c === ','){ row.push(cur); cur = ''; }
    else if (c === '\n'){ row.push(cur); rows.push(row); row = []; cur = ''; }
    else if (c !== '\r') cur += c;
  }
  if (cur !== '' || row.length){ row.push(cur); rows.push(row); }
  return rows.filter(function(r){ return r.some(function(x){ return x.trim() !== ''; }); });
}
var OM_TIME = /^\d{1,2}:\d{2}\s*[-–]\s*\d{1,2}:\d{2}$/;
var OM_DAY = /^יום\s+[אבגדהוש]׳?$/;
function omEsc(s){ var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }
function omActive(v){ v = (v||'').trim(); return v === 'כן' || v === 'yes' || v === 'v'; }

function omValidateSched(r){ /* [city,name,meta,day,time,active] */
  if (r.length < 6) return 'חסרות עמודות';
  var city = r[0].trim();
  if (city !== 'כפר סבא' && city !== 'רעננה') return 'עיר לא מוכרת: "' + city + '" (צריך "כפר סבא" או "רעננה")';
  if (!r[1].trim()) return 'שם החוג ריק';
  if (!OM_DAY.test(r[3].trim())) return 'יום לא תקין: "' + r[3] + '" (צריך למשל "יום א׳")';
  if (!OM_TIME.test(r[4].trim())) return 'שעות לא תקינות: "' + r[4] + '" (צריך למשל "17:00-18:00")';
  return null;
}
function omValidatePrice(r){ /* [name,meta,price,unit,active] */
  if (r.length < 5) return 'חסרות עמודות';
  if (!r[0].trim()) return 'שם השורה ריק';
  var p = Number(r[2]);
  if (!isFinite(p) || p <= 0 || p > 9000) return 'מחיר לא תקין: "' + r[2] + '"';
  if (!r[3].trim()) return 'יחידה ריקה (למשל "לחודש")';
  return null;
}
function omFetch(kind){
  return fetch(omCsvUrl(OM_SHEETS[kind]) + '&cb=' + Date.now()).then(function(res){
    if (!res.ok) throw new Error('HTTP ' + res.status);
    return res.text();
  }).then(function(t){
    var rows = omParseCsv(t).slice(1); /* drop header */
    var validate = kind === 'sched' ? omValidateSched : omValidatePrice;
    return rows.map(function(r){ return { row: r, error: validate(r), active: omActive(r[kind === 'sched' ? 5 : 4]) }; });
  });
}
function omRenderSched(items){
  var ok = items.filter(function(x){ return !x.error && x.active; });
  if (ok.length < 3) return; /* implausible -> keep baked-in */
  var byCity = { 'כפר סבא': [], 'רעננה': [] };
  ok.forEach(function(x){ byCity[x.row[0].trim()].push(x.row); });
  var lists = { 'כפר סבא': document.querySelector('.city.kfs ul'), 'רעננה': document.querySelector('.city.raanana ul') };
  Object.keys(byCity).forEach(function(city){
    var ul = lists[city];
    if (!ul || !byCity[city].length) return;
    ul.innerHTML = byCity[city].map(function(r){
      var time = r[4].trim().replace(/\s*-\s*/, '–');
      return '<li><span class="cls-name">' + omEsc(r[1].trim()) + '</span>' +
             '<span class="cls-time">' + omEsc(r[3].trim()) + ' · ' + omEsc(time) + '</span>' +
             '<span class="cls-meta">' + omEsc(r[2].trim()) + '</span></li>';
    }).join('');
  });
}
function omRenderPrices(items){
  var ok = items.filter(function(x){ return !x.error && x.active; });
  if (ok.length < 2) return;
  var tbl = document.querySelector('.price-table');
  if (!tbl) return;
  tbl.innerHTML = ok.map(function(x){
    var r = x.row;
    return '<div class="price-row"><div><div class="p-name">' + omEsc(r[0].trim()) + '</div>' +
           '<div class="p-meta">' + omEsc(r[1].trim()) + '</div></div>' +
           '<div class="price">' + omEsc(String(Number(r[2]))) + ' <small>₪ ' + omEsc(r[3].trim()) + '</small></div></div>';
  }).join('');
}
if (!window.OM_CHECK_PAGE){
  omFetch('sched').then(omRenderSched).catch(function(){});
  omFetch('price').then(omRenderPrices).catch(function(){});
}
