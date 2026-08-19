/**
 * אומניתה — content backend.
 * Attach to the "אומניתה - תוכן האתר" spreadsheet (Extensions → Apps Script).
 * 1) Run setup() once (authorize when asked) — builds all tabs with current data.
 * 2) Deploy → New deployment → Web app → Execute as: Me → Access: Anyone → Deploy.
 *    Give the /exec URL to Claude. The spreadsheet itself stays private.
 */

var TABS = {
  'הודעות':  ['טקסט', 'קישור', 'מוצג'],
  'חוגים':   ['עיר', 'שם החוג', 'פירוט', 'יום', 'שעות', 'פעיל'],
  'מחירון':  ['שם השורה', 'פירוט', 'מחיר', 'יחידה', 'פעיל'],
  'חופשות':  ['חג', 'ימים', 'תאריכים', 'מוצג'],
  'סדנאות':  ['כותרת', 'תיאור', 'מפגשים', 'שעות', 'מיקום', 'מחיר', 'הערה', 'מוצג'],
  'טקסטים':  ['מפתח', 'טקסט']
};

var SEED = {
  'הודעות': [
    ['ההרשמה לשנה החדשה נפתחה! החוגים מעודכנים לספטמבר 2026. מספר המקומות מוגבל!', '', 'כן']
  ],
  'חוגים': [
    ['כפר סבא', 'ציור מקצועי · כיתות א׳–ג׳', 'עד 8 ילדים בקבוצה', 'יום א׳', '17:00-18:00', 'כן'],
    ['כפר סבא', 'ציור מקצועי מתקדמים · כיתות ד׳–ו׳', 'עד 7 תלמידים בקבוצה', 'יום א׳', '15:45-16:45', 'כן'],
    ['כפר סבא', 'נוער, ציור בהתאמה אישית · ז׳–י״ב', 'עד 8 תלמידים בקבוצה', 'יום ג׳', '15:45-17:15', 'כן'],
    ['כפר סבא', 'ציור מבוגרים · ערב', 'גילאי +18', 'יום א׳', '18:15-20:15', 'כן'],
    ['כפר סבא', 'ציור מבוגרים · בוקר — חדש!', 'בהדרכת מישל ברם איברי', 'יום ג׳', '10:30-12:30', 'כן'],
    ['כפר סבא', 'ציור מבוגרים + נוער · ערב', 'גילאי +14', 'יום ג׳', '17:30-19:30', 'כן'],
    ['רעננה', 'ציור מקצועי ילדים · כיתות א׳–ג׳', 'עד 8 ילדים בקבוצה', 'יום ה׳', '16:00-17:00', 'כן'],
    ['רעננה', 'ציור מקצועי · כיתות ד׳–ו׳', 'עד 7 ילדים בקבוצה', 'יום ד׳', '16:00-17:00', 'כן'],
    ['רעננה', 'נוער, ציור בהתאמה אישית · ז׳–י״ב', 'עד 6 תלמידים בקבוצה', 'יום ה׳', '14:45-15:45', 'כן'],
    ['רעננה', 'ציור מבוגרים · בוקר', 'גילאי +18', 'יום א׳', '10:30-12:30', 'כן'],
    ['רעננה', 'ציור מבוגרים · בוקר', 'גילאי +18', 'יום ד׳', '10:15-12:15', 'כן']
  ],
  'מחירון': [
    ['ציור מקצועי · כיתות א׳–ג׳', 'רעננה / כפר סבא · עד 8 ילדים · כולל כל החומרים', 400, 'לחודש', 'כן'],
    ['ציור מקצועי מתקדמים · כיתות ד׳–ו׳', 'רעננה / כפר סבא · עד 7 ילדים · כולל כל החומרים', 450, 'לחודש', 'כן'],
    ['נוער · שעה בהתאמה אישית · ז׳–י״ב', 'רעננה · עד 6 תלמידים · כולל חומרים (ללא קנבסים)', 450, 'לחודש', 'כן'],
    ['נוער · שעה וחצי · ז׳–י״ב', 'עד 8 תלמידים · כולל חומרים (ללא קנבסים)', 560, 'לחודש', 'כן'],
    ['ציור מבוגרים', 'רעננה / כפר סבא · תשלום בסוף החודש לפי מספר ההגעות · כולל חומרים (ללא קנבסים; יש קנבסים ממוחזרים ודפי קנבס)', 140, 'לשיעור שעתיים', 'כן']
  ],
  'חופשות': [
    ['ראש השנה', 'ו׳–א׳', '11/9-13/9', 'כן'],
    ['יום כיפור', 'א׳–ב׳', '20/9-21/9', 'כן'],
    ['סוכות', 'ו׳–ש׳', '25/9-3/10', 'כן'],
    ['חנוכה', 'א׳–ש׳', '6/12-12/12', 'כן'],
    ['פורים', 'ג׳–ד׳', '23/3-24/3', 'כן'],
    ['פסח', 'ד׳–ד׳', '18/4-28/4', 'כן'],
    ['יום הזיכרון ויום העצמאות', 'ג׳–ד׳', '11/5-12/5', 'כן'],
    ['שבועות', 'ה׳–ו׳', '10/6-11/6', 'כן']
  ],
  'סדנאות': [
    ['סדנת ציור לחופש הגדול: שני דורות יוצרים יחד',
     'מעברי צבעים וציור זרי פרחים, לימוד ציור פנים, ופרויקט סיום על קנבס בהשראת גוסטב קלימט. כל החומרים והקנבסים כלולים.',
     '2.8 · 4.8 · 9.8', '10:30-12:30', 'קריית שרת, רעננה', '700 ₪ למשתתף · 1,400 ₪ לזוג',
     'מספר המקומות מוגבל ל-3 זוגות בלבד', 'כן']
  ],
  'טקסטים': [
    ['משפט פתיחה', 'חוגי ציור מקצועיים לילדים, לנוער ולמבוגרים, בקבוצות קטנות, עם חומרים איכותיים ואווירה ביתית וחמה. 18 שנות ניסיון בהעצמה דרך אמנות.'],
    ['תיאור פיינט דייט', 'אתם בוחרים ציור שתרצו ללמוד, ובמהלך הסדנה כולם יוצאים עם יצירה על קנבס. הסדנה נמשכת עד שעתיים, בהתאם לקצב שלכם, ומתאימה לכל הרמות. הפיינט דייט מותאם לקבוצות: משפחה, חברים, ימי הולדת.']
  ]
};

function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var names = Object.keys(TABS);
  names.forEach(function (name, i) {
    var sh = ss.getSheetByName(name) || ss.insertSheet(name, i);
    if (sh.getLastRow() > 0 && sh.getRange(1, 1).getValue() === TABS[name][0]) return; // already built
    sh.clear();
    sh.getRange(1, 1, 1, TABS[name].length).setValues([TABS[name]]).setFontWeight('bold').setBackground('#DDEBE7');
    if (SEED[name] && SEED[name].length) {
      sh.getRange(2, 1, SEED[name].length, TABS[name][0].length ? TABS[name].length : 1).setValues(SEED[name]);
    }
    sh.setFrozenRows(1);
    sh.setRightToLeft(true);
    sh.autoResizeColumns(1, TABS[name].length);
  });
  // drop the初始 placeholder sheet if present
  var first = ss.getSheets()[0];
  if (names.indexOf(first.getName()) === -1 && ss.getSheets().length > names.length) ss.deleteSheet(first);
  // dropdown validation for the yes/no columns
  names.forEach(function (name) {
    var col = TABS[name].indexOf('מוצג') + 1 || TABS[name].indexOf('פעיל') + 1;
    if (!col) return;
    var sh = ss.getSheetByName(name);
    var rule = SpreadsheetApp.newDataValidation().requireValueInList(['כן', 'לא'], true).setAllowInvalid(false).build();
    sh.getRange(2, col, 400).setDataValidation(rule);
  });
  var dayRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['יום א׳', 'יום ב׳', 'יום ג׳', 'יום ד׳', 'יום ה׳', 'יום ו׳'], true).setAllowInvalid(false).build();
  ss.getSheetByName('חוגים').getRange(2, 4, 400).setDataValidation(dayRule);
  var cityRule = SpreadsheetApp.newDataValidation()
    .requireValueInList(['כפר סבא', 'רעננה'], true).setAllowInvalid(false).build();
  ss.getSheetByName('חוגים').getRange(2, 1, 400).setDataValidation(cityRule);
}

function doGet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var out = { ok: true, updated: new Date().toISOString(), tabs: {} };
  Object.keys(TABS).forEach(function (name) {
    var sh = ss.getSheetByName(name);
    if (!sh) { out.tabs[name] = []; return; }
    var vals = sh.getDataRange().getDisplayValues();
    out.tabs[name] = vals.slice(1).filter(function (r) {
      return r.some(function (c) { return String(c).trim() !== ''; });
    });
  });
  return ContentService.createTextOutput(JSON.stringify(out))
    .setMimeType(ContentService.MimeType.JSON);
}
