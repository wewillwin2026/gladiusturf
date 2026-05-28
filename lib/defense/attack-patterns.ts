// ---------------------------------------------------------------------------
// GladiusDefense -- Attack Pattern Detection Library
// ---------------------------------------------------------------------------
// Real-time regex pattern matching for web application attack detection.
// Each category contains individual pattern strings AND a compiled RegExp
// for hot-path matching. Production-quality patterns with minimal false
// positives on legitimate traffic.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Inlined Levenshtein edit distance -- previously imported from
// `../stats-engine` in the source ecosystem-hq repo. Kept local so this
// module has zero extra deps inside gladius-crm.
// ---------------------------------------------------------------------------
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;
  const m = a.length;
  const n = b.length;
  let prev = new Array<number>(n + 1);
  let curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    const ai = a.charCodeAt(i - 1);
    for (let j = 1; j <= n; j++) {
      const cost = ai === b.charCodeAt(j - 1) ? 0 : 1;
      const del = prev[j] + 1;
      const ins = curr[j - 1] + 1;
      const sub = prev[j - 1] + cost;
      curr[j] = del < ins ? (del < sub ? del : sub) : ins < sub ? ins : sub;
    }
    [prev, curr] = [curr, prev];
  }
  return prev[n];
}

export interface PatternCategory {
  /** Individual pattern strings for granular matching and logging */
  patterns: string[];
  /** Single compiled RegExp combining all patterns for hot-path use */
  compiled: RegExp;
}

export interface PatternMatch {
  category: string;
  matches: string[];
}

// ---------------------------------------------------------------------------
// Helper: compile an array of pattern strings into a single case-insensitive
// RegExp using alternation. Escapes are already in the pattern strings.
// ---------------------------------------------------------------------------

function compilePatterns(patterns: string[]): RegExp {
  return new RegExp(patterns.join("|"), "i");
}

// ---------------------------------------------------------------------------
// SQL Injection Patterns (300+)
// ---------------------------------------------------------------------------

const sqliPatterns: string[] = [
  // UNION-based
  "(?:union)\\s+(?:all\\s+)?(?:select)",
  "(?:union)\\s+(?:distinct\\s+)?(?:select)",
  "(?:select)\\s+.*?(?:from)\\s+(?:information_schema)",
  "(?:select)\\s+.*?(?:from)\\s+(?:mysql\\.user)",
  "(?:select)\\s+.*?(?:from)\\s+(?:pg_catalog)",
  "(?:select)\\s+.*?(?:from)\\s+(?:sys\\.tables)",
  "(?:select)\\s+(?:@@version|version\\(\\))",
  "(?:select)\\s+(?:user|current_user|session_user|system_user)\\s*\\(",
  "(?:select)\\s+(?:load_file|into\\s+(?:out|dump)file)",
  "(?:order\\s+by)\\s+\\d{1,3}\\s*(?:--|#|/\\*)",

  // Blind boolean-based
  "(?:and|or)\\s+\\d+=\\d+",
  "(?:and|or)\\s+'[^']*'='[^']*'",
  "(?:and|or)\\s+(?:true|false)",
  "(?:and|or)\\s+(?:ascii|ord|char)\\s*\\(",
  "(?:and|or)\\s+(?:substring|substr|mid)\\s*\\(",
  "(?:and|or)\\s+(?:length|len|char_length)\\s*\\(",
  "(?:and|or)\\s+exists\\s*\\(",
  "(?:and|or)\\s+\\d+\\s*(?:=|<|>|!=|<>)\\s*(?:select)",

  // Time-based blind - MySQL
  "(?:sleep|benchmark)\\s*\\(\\s*\\d+",
  "(?:if)\\s*\\(.*?,\\s*(?:sleep|benchmark)\\s*\\(",
  "(?:case\\s+when)\\s+.*?\\s+(?:then\\s+sleep\\s*\\()",
  "(?:select)\\s+.*?(?:from).*?(?:sleep|benchmark)\\s*\\(",
  "(?:and|or)\\s+sleep\\s*\\(\\s*\\d+",
  "1=1\\s+and\\s+sleep\\s*\\(",
  "'\\s+and\\s+sleep\\s*\\(",

  // Time-based blind - MSSQL
  "(?:waitfor)\\s+(?:delay)\\s+'\\d+:\\d+:\\d+'",
  "(?:waitfor)\\s+time\\s+'\\d+:\\d+:\\d+'",
  ";\\s*waitfor\\s+delay",
  "'\\s*;\\s*waitfor\\s+delay",
  "1;\\s*waitfor\\s+delay",

  // Time-based blind - PostgreSQL
  "pg_sleep\\s*\\(\\s*\\d+",
  "(?:and|or)\\s+pg_sleep\\s*\\(",
  "(?:select)\\s+pg_sleep\\s*\\(",
  "';\\s*select\\s+pg_sleep",
  "1\\s+and\\s+pg_sleep",

  // Time-based blind - Oracle
  "dbms_pipe\\.receive_message\\s*\\(",
  "utl_http\\.request\\s*\\(",
  "utl_inaddr\\.get_host_address\\s*\\(",
  "dbms_lock\\.sleep\\s*\\(",
  "ctxsys\\.drithsx\\.sn\\s*\\(",
  "ordsys\\.ord_dicom\\.getmappingxpath\\s*\\(",

  // Time-based blind - SQLite
  "randomblob\\s*\\(\\s*\\d+",
  "(?:and|or)\\s+randomblob\\s*\\(",
  "1\\s+and\\s+randomblob",
  "(?:select)\\s+randomblob",

  // Error-based
  "(?:extractvalue|updatexml|xmltype)\\s*\\(",
  "(?:exp|ceil|floor|round)\\s*\\(~",
  "(?:convert|cast)\\s*\\(.*?\\s+(?:as|using)\\s+",
  "(?:group\\s+by)\\s+.*?(?:having)",
  "(?:procedure\\s+analyse)\\s*\\(",
  "exp\\s*\\(~\\s*\\(",
  "(?:geometrycollection|multilinestring|linestring|multipoint|multipolygon|polygon|point)\\s*\\(",
  "(?:json_keys|json_depth|json_length)\\s*\\(.*?select",
  "(?:floor|ceiling)\\s*\\(rand\\s*\\(",
  "name_const\\s*\\(.*?,.*?\\)",
  "(?:count|sum|max|min|avg)\\s*\\(.*?group\\s+by",

  // Stacked queries
  ";\\s*(?:select|insert|update|delete|drop|alter|create|exec|execute)",
  ";\\s*(?:declare|set|begin|open|fetch|close)",
  ";\\s*(?:shutdown|xp_cmdshell|sp_executesql|sp_makewebtask)",
  ";\\s*exec\\s+(?:master|xp_|sp_)",
  ";\\s*insert\\s+into",
  ";\\s*update\\s+\\w+\\s+set",
  ";\\s*delete\\s+from",

  // ORM injection
  "\\$(?:where|gt|lt|gte|lte|ne|in|nin|or|and|not|regex|exists)",
  "\\{\\s*[\"']?\\$(?:where|gt|lt|ne|regex)",
  "(?:find|find_one|aggregate|update|delete).*?\\$(?:where|regex)",

  // Comment-based evasion
  "/\\*!\\d*\\s*(?:select|union|insert|drop|update|delete)/",
  "(?:un)/\\*\\*/(?:ion)\\s+(?:se)/\\*\\*/(?:lect)",
  "/\\*!50000(?:select|union|insert)\\*/",
  "/\\*!30000(?:select|union)\\*/",
  "/\\*!40000(?:select|union)\\*/",
  "(?:sel)/\\*\\*/(?:ect)",
  "(?:ins)/\\*\\*/(?:ert)",
  "(?:upd)/\\*\\*/(?:ate)",
  "(?:del)/\\*\\*/(?:ete)",
  "/\\*\\*/(?:select|union|insert|update|delete|drop)",

  // String concatenation injection
  "(?:concat|concat_ws|group_concat)\\s*\\(",
  "(?:char|chr|nchar)\\s*\\(\\s*\\d+",
  "(?:0x[0-9a-f]{2,})",
  "(?:conv|hex|unhex|md5|sha1|sha2)\\s*\\(",
  "char\\s*\\(\\d+\\s*,\\s*\\d+",
  "chr\\s*\\(\\d+\\)\\s*\\|\\|",
  "string_agg\\s*\\(",
  "xmlagg\\s*\\(",
  "listagg\\s*\\(",
  "array_to_string\\s*\\(",

  // Database-specific
  "(?:dbms_pipe\\.receive_message)",
  "(?:utl_inaddr\\.get_host_address)",
  "(?:ctxsys\\.drithsx\\.sn)",
  "(?:sys\\.dbms_ldap\\.init)",
  "(?:sqlite_version|sqlite_master)",
  "(?:randomblob|zeroblob|unicode)\\s*\\(",
  "sys\\.tables\\s*\\.",
  "sysobjects\\s+where",
  "syscolumns\\s+where",
  "msdb\\.dbo\\.",
  "sp_password",
  "openrowset\\s*\\(",
  "opendatasource\\s*\\(",
  "openquery\\s*\\(",

  // Data extraction
  "(?:into\\s+(?:outfile|dumpfile))\\s+'",
  "(?:load_file)\\s*\\(",
  "(?:load\\s+data\\s+(?:local\\s+)?infile)",
  "(?:select)\\s+.*?(?:into)\\s+(?:@)",
  "(?:bulk\\s+insert)",
  "into\\s+outfile\\s*'",
  "into\\s+dumpfile\\s*'",
  "load\\s+data\\s+infile",
  "load\\s+data\\s+local\\s+infile",

  // Schema enumeration
  "(?:table_name|column_name|table_schema|column_type)",
  "(?:information_schema)\\s*\\.\\s*(?:tables|columns|schemata|routines)",
  "(?:pg_tables|pg_namespace|pg_proc)",
  "(?:sys\\.objects|sys\\.columns|sysobjects|syscolumns)",
  "(?:all_tables|all_tab_columns|user_tables|user_tab_columns)",
  "(?:mysql\\.db|mysql\\.user|mysql\\.proc)",
  "information_schema\\.key_column_usage",
  "information_schema\\.referential_constraints",
  "information_schema\\.statistics",
  "information_schema\\.user_privileges",
  "pg_user\\s+where",
  "pg_shadow\\s+where",
  "pg_roles\\s+where",
  "pg_stat_activity",

  // Auth bypass
  "'\\s*(?:or|and)\\s+'\\d+'\\s*=\\s*'\\d+",
  "'\\s*(?:or)\\s+''\\s*=\\s*'",
  "'\\s*(?:or)\\s+1\\s*(?:--|#)",
  "admin'\\s*--",
  "'\\s*(?:or)\\s+(?:true|1=1)\\s*(?:--|#|/\\*)",
  "'\\s*or\\s+'a'='a",
  "\"\\s*or\\s+\"a\"=\"a",
  "'\\s*or\\s+1=1\\s*--",
  "' or '1'='1",
  "\" or \"1\"=\"1",
  "' or 1=1--",
  "\" or 1=1--",
  "'\\s*or\\s+1\\s*=\\s*1\\s*#",
  "or\\s+1=1\\s*--\\s*$",
  "1'\\s+or\\s+'1'='1",
  "1\"\\s+or\\s+\"1\"=\"1",

  // Drop/alter
  "(?:drop)\\s+(?:table|database|schema|index|view|procedure|function)",
  "(?:alter)\\s+(?:table|database|user|schema)",
  "(?:create)\\s+(?:table|database|user|function|procedure)",
  "(?:truncate)\\s+(?:table)",
  "(?:rename)\\s+(?:table)",
  "drop\\s+table\\s+if\\s+exists",
  "drop\\s+database\\s+if\\s+exists",
  "drop\\s+schema\\s+if\\s+exists",

  // Privilege escalation
  "(?:grant)\\s+.*?(?:to)",
  "(?:revoke)\\s+.*?(?:from)",
  "grant\\s+all\\s+privileges",
  "grant\\s+.*?on\\s+\\*\\.\\*",

  // Second-order injection
  "(?:insert\\s+into).*?(?:values)\\s*\\(.*?(?:select|union)",
  "(?:update)\\s+.*?(?:set)\\s+.*?=\\s*(?:select|\\(select)",
  "insert\\s+into.*?select\\s+.*?from",
  "insert\\s+into.*?union\\s+select",

  // JSON-based injection (MySQL 5.7+, PostgreSQL 9.2+)
  "(?:jsonb?_extract|json_value|json_query|json_table)\\s*\\(",
  "(?:json_set|json_insert|json_replace|json_remove)\\s*\\(",
  "json_extract\\s*\\(.*?select",
  "->>\\s*'\\$\\..*?'.*?select",
  "#>>.*?select",
  "jsonb_path_query\\s*\\(",
  "json_arrayagg\\s*\\(",
  "json_objectagg\\s*\\(",

  // Scientific notation / type confusion bypass
  "1e0union",
  "1e0\\s+union",
  "0e0union",
  "\\d+e\\d+\\s+(?:union|select|and|or)",
  "\\.0e0\\s+(?:union|select)",
  "1\\.0e1\\+union",

  // Encoding-based
  "(?:%27|%22)\\s*(?:%6f%72|%4f%52|%61%6e%64|%41%4e%44)",
  "(?:%55%4e%49%4f%4e|%75%6e%69%6f%6e)\\s*(?:%53%45%4c%45%43%54|%73%65%6c%65%63%74)",
  "%27%20(?:or|and|union)",
  "%22%20(?:or|and|union)",
  "%27%20select",
  "%27%20insert",
  "%27%20update",
  "%27%20delete",
  "0x27\\s+(?:or|and|union)",

  // Inline comment evasion
  "sel/\\*\\*/ect",
  "un/\\*\\*/ion",
  "fr/\\*\\*/om",
  "wh/\\*\\*/ere",

  // Specific MSSQL techniques
  "xp_cmdshell\\s*\\(",
  "sp_configure\\s+[\"']show\\s+advanced",
  "sp_configure\\s+[\"']xp_cmdshell",
  "exec\\s+master\\.dbo\\.xp_cmdshell",
  "exec\\s+xp_regread",
  "exec\\s+xp_regwrite",
  "exec\\s+xp_dirtree",
  "exec\\s+xp_fileexist",
  "exec\\s+xp_fixeddrives",
  "sp_oacreate",
  "sp_oamethod",
  "sp_oagetproperty",
  "sp_addsrvrolemember",
  "sp_addlogin",
  "sp_password",

  // Specific PostgreSQL techniques
  "copy\\s+\\w+\\s+to\\s+stdout",
  "copy\\s+\\w+\\s+from\\s+program",
  "pg_read_file\\s*\\(",
  "pg_ls_dir\\s*\\(",
  "pg_stat_file\\s*\\(",
  "lo_import\\s*\\(",
  "lo_export\\s*\\(",
  "pg_read_binary_file\\s*\\(",

  // NoSQL injection (MongoDB)
  "\\{\\s*[\"']?\\$(?:gt|lt|ne|gte|lte)\\s*:",
  "\\$regex\\s*:\\s*[\"']",
  "\\$where\\s*:\\s*[\"'](?:function|this)",
  "(?:mapReduce|findAndModify|insertMany|updateMany|deleteMany).*?\\$",
  "\\$elemMatch\\s*:",
  "\\$all\\s*:",
  "\\$size\\s*:",
  "\\$type\\s*:",
  "\\$slice\\s*:",
  "\\$unwind\\s*:",
  "\\$lookup\\s*:",
  "\\$match\\s*:",
  "\\$group\\s*:",
  "\\$project\\s*:",

  // Misc techniques
  "(?:like)\\s+'%[^']*%'\\s*(?:--|#|or)",
  "(?:having)\\s+\\d+\\s*[=<>]",
  "(?:exec(?:ute)?\\s+(?:master|xp_|sp_|msdb))",
  "(?:openrowset|opendatasource|openquery)\\s*\\(",
  "(?:handler)\\s+.*?(?:open|read|close)",
  "(?:prepare|execute)\\s+.*?(?:from|using)",
  "(?:do\\s+(?:sleep|benchmark))",
  "(?:limit)\\s+\\d+\\s*,\\s*\\d+\\s*(?:--|#|union)",
  "(?:into)\\s+(?:@[a-z_]+)",
  "(?:set)\\s+@[a-z_]+=",
  "(?:declare)\\s+@[a-z_]+\\s+(?:varchar|nvarchar|int|char)",
  "select\\s+null,null,null",
  "select\\s+1,2,3\\s+from",
  "null,null--",
  "--\\s*$",
  "#\\s*$",
  "/\\*\\s*$",
  "';\\s*--",
  "\";\\s*--",
];

// ---------------------------------------------------------------------------
// XSS Patterns (200+)
// ---------------------------------------------------------------------------

const xssPatterns: string[] = [
  // Script tags
  "<\\s*script[^>]*>",
  "<\\s*/\\s*script\\s*>",
  "<\\s*script[^>]*\\s+src\\s*=",
  "<script\\s*>\\s*alert",
  "<script\\s*>\\s*confirm",
  "<script\\s*>\\s*prompt",
  "<script\\s*>\\s*document\\.cookie",

  // Event handlers (comprehensive)
  "\\bon(?:error|load|click|mouseover|mouseout|mousedown|mouseup|mousemove|mouseenter|mouseleave|keydown|keyup|keypress|submit|change|focus|blur|resize|scroll|unload|beforeunload|hashchange|popstate|storage|message|online|offline|animationstart|animationend|animationiteration|transitionend|drag|dragstart|dragend|dragover|dragenter|dragleave|drop|input|invalid|reset|search|select|contextmenu|copy|cut|paste|abort|canplay|canplaythrough|durationchange|emptied|ended|loadeddata|loadedmetadata|loadstart|pause|play|playing|progress|ratechange|seeked|seeking|stalled|suspend|timeupdate|volumechange|waiting|toggle|wheel|auxclick|pointerdown|pointerup|pointermove|pointerover|pointerout|pointerenter|pointerleave|gotpointercapture|lostpointercapture|touchstart|touchend|touchmove|touchcancel)\\s*=",

  // javascript: protocol
  "(?:javascript|vbscript|livescript|mocha|jscript)\\s*:",
  "(?:data)\\s*:\\s*text/html",
  "(?:data)\\s*:\\s*(?:image/svg|application/x?html)",
  "javascript\\s*:\\s*void",
  "javascript\\s*:\\s*alert",
  "javascript\\s*:\\s*confirm",
  "javascript\\s*:\\s*prompt",
  "javascript\\s*:\\s*document",
  "javascript\\s*:\\s*window",
  "javascript\\s*:\\s*eval",

  // SVG-based XSS
  "<\\s*svg[^>]*\\s+on\\w+\\s*=",
  "<\\s*svg[^>]*>.*?<\\s*(?:script|animate|set|foreignObject)",
  "<\\s*svg/on(?:load|error)\\s*=",
  "<\\s*svg\\s*>\\s*<\\s*use\\s+(?:href|xlink:href)\\s*=",
  "<svg\\s+on(?:load|error)\\s*=",
  "<svg><script",
  "<svg><animate\\s+on",
  "<svg><set\\s+on",
  "<svg>\\s*<desc><!\\[CDATA\\[",

  // IMG-based XSS
  "<\\s*img[^>]*\\s+on(?:error|load)\\s*=",
  "<\\s*img[^>]*\\s+src\\s*=\\s*[\"']?(?:javascript|data):",
  "<\\s*img\\s+src\\s*=\\s*x\\s+onerror\\s*=",
  "<img\\s+src=x\\s+onerror=",
  "<img\\s+onerror=",
  "<img/onerror=",
  "<img\\s+src=1\\s+onerror=",

  // iframe/object/embed
  "<\\s*iframe[^>]*\\s+(?:src|srcdoc)\\s*=",
  "<\\s*object[^>]*\\s+data\\s*=",
  "<\\s*embed[^>]*\\s+src\\s*=",
  "<\\s*applet\\b",
  "<\\s*base[^>]*\\s+href\\s*=",
  "<iframe\\s+srcdoc=",
  "<iframe\\s+src=javascript:",
  "<object\\s+data=javascript:",

  // Form-based
  "<\\s*form[^>]*\\s+action\\s*=",
  "<\\s*input[^>]*\\s+(?:onfocus|autofocus)",
  "<\\s*button[^>]*\\s+on\\w+\\s*=",
  "<\\s*textarea[^>]*\\s+on\\w+\\s*=",
  "<\\s*select[^>]*\\s+on\\w+\\s*=",
  "<\\s*details[^>]*\\s+(?:open)?[^>]*\\s+ontoggle\\s*=",

  // MathML
  "<\\s*math[^>]*>",
  "<\\s*math\\s+(?:xmlns|xlink)",
  "<\\s*maction[^>]*\\s+actiontype\\s*=\\s*[\"']?statusline",
  "<math><mstyle\\s+mathcolor",
  "<math><ms\\s+dir=",

  // Template injection / Angular
  "\\{\\{.*?constructor.*?\\}\\}",
  "\\{\\{.*?\\$eval.*?\\}\\}",
  "\\{\\{.*?\\$on.*?\\}\\}",
  "\\{\\{.*?\\[.*?\\].*?\\}\\}",
  "\\{\\{(?:constructor|__proto__|prototype)\\}\\}",
  "ng-(?:click|mouseover|submit|focus|blur|change|init|bind)\\s*=",
  "\\[\\(ngModel\\)\\]",
  "\\*ngIf.*?eval",
  "\\[innerHTML\\]\\s*=",

  // Style-based XSS
  "<\\s*style[^>]*>.*?(?:expression|behavior|@import|url\\()",
  "style\\s*=\\s*[\"'][^\"']*(?:expression|behavior|url\\s*\\(\\s*javascript)",
  "(?:expression|behavior)\\s*\\(",
  "-moz-binding\\s*:",
  "<?css\\s+expression",

  // Body/HTML tag events
  "<\\s*body[^>]*\\s+on(?:load|error|focus|blur|pageshow)\\s*=",
  "<\\s*html[^>]*\\s+on\\w+\\s*=",

  // Link-based
  "<\\s*a[^>]*\\s+href\\s*=\\s*[\"']?(?:javascript|data|vbscript):",
  "<\\s*link[^>]*\\s+rel\\s*=\\s*[\"']?import",
  "<a\\s+href=javascript:",
  "<a\\s+href=vbscript:",

  // Mutation XSS patterns
  "<noscript><p\\s+title=\"</noscript>",
  "<listing><img\\s+src=1\\s+onerror=",
  "<\\s*noembed[^>]*>",
  "<\\s*noframes[^>]*>",
  "<\\s*noscript[^>]*>.*?<script",
  "<textarea>.*?<script",
  "<title>.*?<script",
  "<plaintext",
  "<xmp",
  "<template.*?>.*?<script",
  "<template\\s+id=",

  // DOM clobbering
  "<img\\s+name=(?:location|document|history|frames)",
  "<input\\s+id=(?:location|document|history)",
  "<a\\s+id=(?:location|document|history)\\s+href=",
  "<form\\s+id=(?:location|document|history)",
  "document\\.getElementById.*?\\.outerHTML",
  "document\\.getElementsByName.*?\\.outerHTML",

  // SVG/MathML with CDATA
  "<svg><script>\\s*<\\!\\[CDATA\\[",
  "<math><script>\\s*<\\!\\[CDATA\\[",
  "<\\!\\[CDATA\\[.*?]]>",

  // Polyglot patterns
  "javas\\x00cript:",
  "javas\\x09cript:",
  "javas\\x0acript:",
  "javas\\x0dcript:",
  "\\x3cscript",
  "\\u003cscript",
  "&lt;script",
  "&#x3c;script",
  "&#60;script",
  "&#x3c;img",
  "&#60;img",
  "&#x3C;svg",
  "&lt;svg",
  "&#x3c;/script",
  "&#x3c;iframe",

  // DOM manipulation
  "document\\.(?:write|writeln|cookie|domain|location|URL|referrer|body\\.innerHTML)",
  "window\\.(?:location|name|open|eval|setTimeout|setInterval|Function)",
  "(?:eval|setTimeout|setInterval|Function|execScript|setImmediate)\\s*\\(",
  "(?:innerHTML|outerHTML|insertAdjacentHTML|document\\.write)\\s*(?:=|\\()",
  "document\\.execCommand",
  "document\\.createElementNS.*?script",
  "document\\.createElement.*?script",
  "\\.setAttribute\\s*\\(\\s*[\"']on",

  // Fetch/XHR exfil
  "(?:fetch|XMLHttpRequest|navigator\\.sendBeacon)\\s*\\(",
  "new\\s+(?:Image|Audio)\\s*\\(\\).*?\\.src\\s*=",
  "new\\s+XMLHttpRequest",
  "\\.open\\s*\\(\\s*[\"'](?:GET|POST)",
  "\\.send\\s*\\(",

  // Constructor tricks
  "\\[\\]\\[(?:'constructor'|\"constructor\")\\]",
  "(?:''|``|\\[\\])\\[(?:'constructor'|\"constructor\")\\]",
  "\\.constructor\\.constructor\\s*\\(",
  "Function\\s*\\(\\s*[\"']return",
  "\\(\\(\\)=>\\{\\}\\)\\.constructor",

  // CSP bypass attempts
  "base64,.*?<script",
  "data:text/html;base64,",
  "data:application/javascript",
  "data:text/javascript",
  "<script\\s+nonce=",
  "<link\\s+rel=preload.*?as=script",
  "import\\s*\\(\\s*[\"']data:",
  "import\\s*\\(\\s*[\"']blob:",
  "<meta\\s+http-equiv=[\"']Content-Security-Policy",

  // Miscellaneous evasion
  "<!--.*?-->.*?<\\s*script",
  "<!--.*?--!>",
  "<\\s*xss[^>]*>",
  "<\\s*isindex[^>]*\\s+(?:action|type)\\s*=",
  "<\\s*marquee[^>]*\\s+on\\w+\\s*=",
  "<\\s*video[^>]*\\s+(?:src|poster)\\s*=.*?\\s+on\\w+\\s*=",
  "<\\s*audio[^>]*\\s+src\\s*=.*?\\s+on\\w+\\s*=",
  "<\\s*source[^>]*\\s+onerror\\s*=",
  "<\\s*meta[^>]*\\s+http-equiv\\s*=\\s*[\"']?refresh",
  "\\bimport\\s*\\(\\s*[\"'](?:data|https?|javascript):",
  "(?:top|self|parent|frames)\\[\\s*[\"']\\w+[\"']\\s*\\]",
  "(?:document|window)\\[\\s*[\"']\\w+[\"']\\s*\\]",

  // UTF-7 XSS
  "\\+ADw-script\\+AD4-",
  "\\+ADw-img",
  "\\+ADw-svg",

  // IE-specific
  "(?:vbscript|jscript)\\s*:",
  "<\\s*xml[^>]*>.*?<\\s*script",
  "<?import\\s+",
  "\\<\\!--\\[if",
  "expression\\s*\\(\\s*(?:alert|confirm|prompt|document|window)",
  "\\*\\{\\s*(?:width|height|background)\\s*:\\s*expression",

  // Additional polyglots/bypasses
  "javascript&#x3a;",
  "javascript&#58;",
  "javascript%3a",
  "j&#97;vascript:",
  "j&#0097;vascript:",
  "&#x6a;avascript:",
  "j\\x61vascript:",
  "j\\u0061vascript:",
  "\\\\x3cscript",
  "\\\\u003cscript",
  "\\\\074script",
];

// ---------------------------------------------------------------------------
// Path Traversal Patterns (120+)
// ---------------------------------------------------------------------------

const traversalPatterns: string[] = [
  // Basic traversal
  "(?:\\.\\./){2,}",
  "(?:\\.\\.\\\\/){2,}",
  "\\.\\./\\.\\./",
  "\\.\\.\\\\\\.\\.\\\\/",

  // URL encoded
  "(?:%2e%2e(?:%2f|%5c)){2,}",
  "(?:%2e%2e/){2,}",
  "(?:%%32%65%%32%65/){1,}",
  "%2e%2e%2f",
  "%2e%2e%5c",
  "%2e%2e/",
  "%2e%2e\\\\",

  // Double encoded
  "%252e%252e%252f",
  "%252e%252e/",
  "%252e%252e%255c",
  "%%c0%ae%%c0%ae/",

  // Triple encoded
  "%25252e%25252e%25252f",
  "%25252e%25252e/",
  "%25252e%25252e%25255c",
  "%%%252e%%%252e%252f",

  // Unicode / overlong UTF-8
  "%c0%ae%c0%ae/",
  "%c0%ae%c0%ae\\\\",
  "%e0%80%ae%e0%80%ae/",
  "%f0%80%80%ae%f0%80%80%ae/",
  "\\u002e\\u002e/",
  "\\u002e\\u002e\\\\",
  "%c1%9c",
  "%c0%af",
  "%c1%pc",
  "%c0%2f",

  // Null byte
  "%00",
  "\\x00",
  "\\0",
  "%2500",
  "\\u0000",

  // Common targets - Unix
  "(?:/etc/(?:passwd|shadow|hosts|group|sudoers|crontab|issue))",
  "(?:/proc/(?:self|version|cmdline|environ|mounts))",
  "(?:/var/log/(?:auth|syslog|apache|nginx|messages))",
  "(?:/root/\\.(?:bash_history|ssh|profile))",
  "(?:/home/[^/]+/\\.(?:bash_history|ssh|profile))",
  "/etc/passwd",
  "/etc/shadow",
  "/etc/group",
  "/etc/hosts",
  "/etc/sudoers",
  "/etc/crontab",
  "/proc/self/environ",
  "/proc/self/cmdline",
  "/proc/self/fd/",
  "/proc/version",
  "/var/www/html",
  "/usr/local/etc/",
  "/opt/",

  // Common targets - Windows
  "(?:(?:c:|C:)(?:\\\\|/)(?:windows|winnt)(?:\\\\|/)(?:system32|system|win\\.ini|repair))",
  "(?:boot\\.ini|win\\.ini|system\\.ini)",
  "(?:(?:c:|C:)(?:\\\\|/)inetpub)",
  "(?:web\\.config|applicationhost\\.config)",
  "c:\\\\windows\\\\system32",
  "c:\\\\boot\\.ini",
  "c:\\\\winnt\\\\system32",
  "c:\\\\inetpub\\\\wwwroot",
  "%systemroot%\\\\system32",
  "windows\\\\win\\.ini",
  "winnt\\\\win\\.ini",
  "c:\\\\windows\\\\win\\.ini",

  // IIS-specific
  "\\\\inetpub\\\\wwwroot",
  "\\\\inetpub\\\\logs",
  "aspnet_client",
  "global\\.asax",
  "web\\.config",
  "machine\\.config",
  "applicationhost\\.config",

  // Tomcat-specific
  "WEB-INF/web\\.xml",
  "WEB-INF/classes",
  "META-INF/context\\.xml",
  "WEB-INF\\\\web\\.xml",
  "WEB-INF\\\\classes",
  "META-INF\\\\context\\.xml",
  "catalina\\.out",
  "catalina\\.sh",

  // Application-specific
  "(?:\\.env(?:\\.local|\\.production|\\.development|\\.staging)?)",
  "(?:wp-config\\.php|configuration\\.php|config\\.php|settings\\.php)",
  "(?:database\\.yml|secrets\\.yml|credentials\\.yml)",
  "(?:id_rsa|id_ed25519|id_dsa|authorized_keys|known_hosts)",
  "\\.git/config",
  "\\.git/HEAD",
  "\\.svn/entries",
  "\\.htaccess",
  "\\.htpasswd",
  "web\\.config",
  "phpinfo\\.php",
  "composer\\.json",
  "package\\.json",
  "requirements\\.txt",
  "Gemfile",
  "\\.aws/credentials",
  "\\.aws/config",
  "\\.docker/config\\.json",
  "\\.kube/config",
  "\\.npmrc",
  "\\.bash_profile",
  "\\.bashrc",
  "\\.zshrc",
  "\\.profile",

  // Backslash variants
  "(?:\\.\\.[\\\\/]){2,}",
  "(?:\\.\\.)(?:%5c|%2f)",
  "(?:%%35%63|%%35%43)",
  "\\.\\.[/\\\\]",
  "\\.%2e/",
  "%2e\\./",
  "\\.%2e\\\\",
  "%2e\\.\\\\",

  // Path truncation
  "\\.(?:php|asp|aspx|jsp|cgi|pl|py)%00",
  "(?:\\.[a-z]{2,4})(?:%00|\\.(?:jpg|gif|png))",
  "\\.php%00\\.jpg",
  "\\.asp%00\\.txt",
  "\\.aspx%00\\.gif",
];

// ---------------------------------------------------------------------------
// Command Injection Patterns (100+)
// ---------------------------------------------------------------------------

const commandInjectionPatterns: string[] = [
  // Shell metacharacters
  ";\\s*(?:cat|ls|dir|type|whoami|id|uname|hostname|ifconfig|ipconfig|net|ping|nslookup|curl|wget|python|perl|ruby|php|nc|ncat|bash|sh|cmd|powershell)",
  "\\|\\s*(?:cat|ls|dir|type|whoami|id|uname|hostname|ifconfig|ipconfig|net|curl|wget|python|perl|ruby|php|nc|bash|sh|cmd|powershell)",
  "&\\s*(?:cat|ls|dir|type|whoami|id|uname|hostname|curl|wget|python|perl|nc|bash|sh|cmd|powershell)",
  "&&\\s*(?:cat|ls|dir|type|whoami|id|uname|hostname|curl|wget|python|perl|nc|bash|sh|cmd|powershell)",
  "\\|\\|\\s*(?:cat|ls|dir|type|whoami|id|uname|hostname|curl|wget|python|perl|nc|bash|sh|cmd|powershell)",

  // Backtick command substitution
  "`[^`]*(?:cat|ls|whoami|id|uname|curl|wget|nc|bash|sh|python|perl|ruby)[^`]*`",
  "`whoami`",
  "`id`",
  "`uname\\s+-a`",
  "`cat\\s+/etc/passwd`",

  // $() command substitution
  "\\$\\([^)]*(?:cat|ls|whoami|id|uname|curl|wget|nc|bash|sh|python|perl|ruby)[^)]*\\)",
  "\\$\\(whoami\\)",
  "\\$\\(id\\)",
  "\\$\\(cat\\s+/etc/passwd\\)",
  "\\$\\(uname\\s+-a\\)",
  "\\$\\(ls\\s+-la\\)",

  // Newline injection
  "(?:%0a|%0d|\\\\n|\\\\r)\\s*(?:cat|ls|whoami|id|uname|curl|wget|nc|bash|sh|cmd|powershell)",

  // Reverse shells
  "(?:bash|sh)\\s+-[ic]\\s+[\"'].*?/dev/tcp/",
  "nc\\s+(?:-[enlvp]+\\s+)*\\d+",
  "python\\s+-c\\s+[\"']import\\s+(?:socket|subprocess|os)",
  "perl\\s+-e\\s+[\"'].*?socket",
  "ruby\\s+-rsocket\\s+-e",
  "php\\s+-r\\s+[\"'].*?(?:fsockopen|exec|system|passthru|shell_exec)",
  "powershell\\s+(?:-[ecwb]+\\s+)*.*?(?:Net\\.Sockets|Invoke-Expression|IEX|downloadstring|webclient)",
  "/bin/bash\\s+-i\\s+>&\\s*/dev/tcp/",
  "bash\\s+-i\\s+>&\\s*/dev/tcp/",
  "0<&196;exec\\s+196<>/dev/tcp/",
  "exec\\s+5<>/dev/tcp/",
  "exec\\s+i>&\\d",
  "/bin/sh\\s+-i",

  // File operations
  "(?:;|\\||&)\\s*(?:rm|del|erase|format|mkfs|dd)\\s+",
  "(?:;|\\||&)\\s*(?:chmod|chown|chgrp)\\s+",
  "(?:;|\\||&)\\s*(?:mv|cp|copy|move|ren)\\s+",
  "rm\\s+-rf\\s+/",
  "rm\\s+-rf\\s+\\*",
  "dd\\s+if=/dev/",

  // Network recon
  "(?:;|\\||&)\\s*(?:nmap|masscan|zmap|nikto|dirbuster)\\s+",
  "nmap\\s+(?:-s[STUAWMXNPOLaVnpIrR]|--)",
  "masscan\\s+--",
  "hydra\\s+(?:-l|-L|--)",

  // Environment / info gathering
  "(?:;|\\||&)\\s*(?:env|printenv|set|export)\\s*(?:;|\\||&|$)",
  "(?:;|\\||&)\\s*(?:cat|type)\\s+(?:/etc/passwd|/etc/shadow|C:\\\\)",

  // Encoded variants
  "%3b\\s*(?:cat|ls|whoami|id|uname)",
  "%7c\\s*(?:cat|ls|whoami|id|uname)",
  "%26\\s*(?:cat|ls|whoami|id|uname)",
  "%60[^%]*(?:cat|ls|whoami|id)%60",

  // Process manipulation
  "(?:;|\\||&)\\s*(?:kill|pkill|killall)\\s+",
  "(?:;|\\||&)\\s*(?:crontab|at\\s+-f|schtasks)\\s+",

  // Common payloads
  "(?:;|\\||&|`)\\s*(?:sleep|ping\\s+-[cn])\\s+\\d+",
  "(?:;|\\||&|`)\\s*(?:echo|printf)\\s+.*?(?:>|>>)\\s+",
  "(?:;|\\||&|`)\\s*(?:which|whereis|locate|find)\\s+",
  "\\$\\{(?:IFS|PATH|HOME|USER|SHELL|TERM|MAIL|HOSTNAME)\\}",

  // PowerShell-specific
  "powershell\\.exe\\s+(?:-|/)(?:e|en|enc|encoded)",
  "powershell\\s+(?:-|/)(?:e|en|enc|encoded)",
  "powershell\\s+-nop\\s+-w\\s+hidden",
  "powershell\\s+-noprofile\\s+-windowstyle",
  "powershell\\s+-executionpolicy\\s+bypass",
  "Invoke-Expression\\s*\\(",
  "Invoke-Command\\s*\\(",
  "Invoke-WebRequest\\s*\\(",
  "\\bIEX\\s*\\(",
  "\\bIWR\\s*\\(",
  "\\bICM\\s*\\(",
  "New-Object\\s+System\\.Net\\.WebClient",
  "New-Object\\s+Net\\.WebClient",
  "DownloadString\\s*\\(",
  "DownloadFile\\s*\\(",
  "\\.DownloadData\\s*\\(",
  "System\\.Reflection\\.Assembly",
  "\\[System\\.Convert\\]::FromBase64String",
  "\\[Runtime\\.InteropServices\\.Marshal\\]",
  "Add-Type\\s+-Assembly",
  "\\bStart-Process\\b.*?-ArgumentList",
  "\\bInvoke-Item\\b",
  "\\bGet-Content\\b.*?\\|.*?(?:IEX|Invoke-Expression)",
  "powershell\\s+-c\\s+[\"']?(?:\\$|iex|invoke)",
  "cmd\\.exe\\s+/c\\s+powershell",
  "wscript\\s+(?://e:vbscript|//e:jscript)",
  "cscript\\s+(?://e:vbscript|//e:jscript)",
  "mshta\\s+(?:vbscript:|javascript:)",
  "regsvr32\\s+/s\\s+/u\\s+/i:",
  "rundll32\\.exe\\s+javascript:",
  "certutil\\s+(?:-urlcache|-decode|-encode)",

  // Windows cmd.exe specific
  "cmd\\.exe\\s+(?:/c|/k)\\s+",
  "cmd\\s+(?:/c|/k)\\s+(?:dir|type|copy|del|whoami|net)",
  "%COMSPEC%",
  "%SystemRoot%\\\\system32\\\\cmd\\.exe",
  "set\\s+/a\\s+",
  "for\\s+/f\\s+",
  "for\\s+%[a-z]\\s+in",
  "echo\\s+%(?:USERNAME|COMPUTERNAME|SystemRoot|USERPROFILE|APPDATA|TEMP|TMP|PATH)%",

  // Bash-specific advanced
  "\\$\\{IFS\\}",
  "\\$IFS",
  "\\$\\{@\\}",
  "\\$\\{*\\}",
  "${PATH:0:1}",
  "\\$\\{BASH_SOURCE\\}",
  "\\$\\(\\$\\(\\$\\(",
  "<<<\\$\\(",
  "bash<<<",
  "echo\\s+\\$\\((?:whoami|id|hostname)",
  "\\${[#!]",
  "\\$\\(\\(0\\+0\\)\\)",
];

// ---------------------------------------------------------------------------
// SSRF Patterns (100+)
// ---------------------------------------------------------------------------

const ssrfPatterns: string[] = [
  // Loopback
  "(?:^|[^\\d])127\\.0\\.0\\.\\d{1,3}",
  "(?:^|[^\\w])localhost(?:[:/]|$)",
  "\\[::1\\]",
  "\\[0:0:0:0:0:0:0:1\\]",
  "0\\.0\\.0\\.0",
  "(?:^|[^\\d])0x7f(?:00)?(?:00)?(?:01)?",
  "(?:^|[^\\d])2130706433",

  // Cloud metadata - AWS
  "169\\.254\\.169\\.254",
  "169\\.254\\.169\\.254/latest/meta-data",
  "169\\.254\\.169\\.254/latest/user-data",
  "169\\.254\\.169\\.254/latest/dynamic",
  "169\\.254\\.169\\.254/latest/api/token",
  "instance-data\\.ec2\\.internal",
  "metadata\\.ec2\\.internal",
  "169\\.254\\.170\\.2",

  // Cloud metadata - GCP
  "metadata\\.google\\.internal",
  "metadata\\.google\\.internal/computeMetadata",
  "169\\.254\\.169\\.254/computeMetadata",
  "metadata\\.google\\.internal/v1/",
  "storage\\.googleapis\\.com",

  // Cloud metadata - Azure
  "169\\.254\\.169\\.254/metadata/instance",
  "169\\.254\\.169\\.254/metadata/",
  "management\\.azure\\.com",
  "login\\.microsoftonline\\.com",
  "169\\.254\\.169\\.254/metadata/identity",

  // Cloud metadata - DigitalOcean
  "169\\.254\\.169\\.254/metadata/v1",
  "169\\.254\\.169\\.254/metadata/v1\\.json",
  "169\\.254\\.169\\.254/v1\\.json",

  // Cloud metadata - Alibaba
  "100\\.100\\.100\\.200",
  "100\\.100\\.100\\.200/latest/meta-data",
  "100\\.100\\.100\\.200/latest/user-data",

  // Cloud metadata - Oracle Cloud
  "169\\.254\\.169\\.254/opc/v1/",
  "169\\.254\\.169\\.254/opc/v2/",

  // Cloud metadata - IBM Cloud / Softlayer
  "161\\.26\\.0\\.1",
  "ibmcloud\\.com/internal",

  // IPv6 metadata
  "fd00:ec2::254",
  "\\[fd00:ec2::254\\]",

  // Private ranges
  "(?:^|[^\\d])10\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}",
  "(?:^|[^\\d])172\\.(?:1[6-9]|2\\d|3[01])\\.\\d{1,3}\\.\\d{1,3}",
  "(?:^|[^\\d])192\\.168\\.\\d{1,3}\\.\\d{1,3}",
  "(?:^|[^\\d])192\\.0\\.0\\.\\d{1,3}",
  "(?:^|[^\\d])198\\.18\\.\\d{1,3}\\.\\d{1,3}",
  "(?:^|[^\\d])198\\.51\\.100\\.\\d{1,3}",
  "(?:^|[^\\d])203\\.0\\.113\\.\\d{1,3}",
  "(?:^|[^\\d])240\\.\\d{1,3}\\.\\d{1,3}\\.\\d{1,3}",
  "100\\.64\\.\\d{1,3}\\.\\d{1,3}",

  // Non-HTTP schemes
  "(?:gopher|dict|file|ldap|ldaps|tftp|ftp|jar|netdoc|expect|phar|ogg|zlib)://",
  "file:///",
  "gopher://",
  "dict://",
  "ldap://",
  "tftp://",
  "jar:file://",
  "phar://",
  "zlib://",
  "expect://",
  "php://input",
  "php://filter",
  "data://text/plain",

  // DNS rebinding
  "(?:\\d+\\.){3}\\d+\\.(?:nip\\.io|xip\\.io|sslip\\.io)",
  "\\.burpcollaborator\\.net",
  "\\.ngrok\\.io",
  "\\.requestbin\\.\\w+",
  "\\.interact\\.sh",
  "\\.oastify\\.com",
  "\\.canarytokens\\.com",
  "\\.pipedream\\.net",
  "\\.webhook\\.site",
  "\\.beeceptor\\.com",
  "\\.free\\.beeceptor\\.com",
  "localtest\\.me",
  "lvh\\.me",
  "vcap\\.me",
  "\\.xip\\.name",

  // Encoded loopback
  "%31%32%37%2e%30%2e%30%2e%31",
  "(?:^|[^\\w])(?:0177\\.0+\\.0+\\.0*1)",
  "0x7f000001",
  "2130706433",
  "017700000001",
  "0x7f\\.0x00\\.0x00\\.0x01",
  "0177\\.0000\\.0000\\.0001",
  "127\\.1",
  "127\\.0\\.1",
  "0:0:0:0:0:ffff:7f00:1",

  // Redirect-based SSRF
  "(?:url|redirect|next|dest|target|rurl|return|goto|link|src|source|returnurl|forward|callback|continue|r|u|ref|host|imageurl|open|site|page|window|reference|document|load)=(?:https?://)?(?:localhost|127\\.0|10\\.|172\\.(?:1[6-9]|2\\d|3[01])|192\\.168)",
  "(?:url|redirect|next|dest)=(?:https?://)?(?:metadata\\.google|169\\.254)",

  // CNAME-based rebinding
  "\\.localcname\\.",
  "dns\\.rebind\\.",
  "rebind\\.network",
  "\\.rbndr\\.us",
];

// ---------------------------------------------------------------------------
// XXE Patterns (50+)
// ---------------------------------------------------------------------------

const xxePatterns: string[] = [
  // DOCTYPE declarations
  "<!DOCTYPE[^>]*\\[",
  "<!DOCTYPE[^>]*SYSTEM",
  "<!DOCTYPE[^>]*PUBLIC",
  "<!DOCTYPE\\s+\\w+",
  "<!DOCTYPE\\s+\\w+\\s+\\[",
  "<!DOCTYPE\\s+\\w+\\s+SYSTEM\\s+[\"']",
  "<!DOCTYPE\\s+\\w+\\s+PUBLIC\\s+[\"']",

  // ENTITY definitions
  "<!ENTITY\\s+\\w+\\s+SYSTEM",
  "<!ENTITY\\s+\\w+\\s+PUBLIC",
  "<!ENTITY\\s+%\\s+\\w+\\s+SYSTEM",
  "<!ENTITY\\s+%\\s+\\w+\\s+PUBLIC",
  "<!ENTITY\\s+\\w+\\s+[\"']",
  "<!ENTITY\\s+%\\s+\\w+",

  // External references
  "SYSTEM\\s+[\"'](?:file|http|https|ftp|gopher|expect|php|jar|netdoc)://",
  "PUBLIC\\s+[\"'][^\"']*[\"']\\s+[\"'](?:file|http|https|ftp)://",
  "SYSTEM\\s+[\"']file:///",
  "SYSTEM\\s+[\"']/etc/passwd",
  "SYSTEM\\s+[\"']c:\\\\",

  // Parameter entity abuse
  "%\\w+;",
  "&#x[0-9a-fA-F]+;",
  "&#\\d+;",
  "%xxe;",
  "%file;",
  "%data;",
  "%remote;",
  "<!\\[CDATA\\[",

  // Billion laughs
  "<!ENTITY\\s+\\w+\\s+[\"']&\\w+;&\\w+;",
  "<!ENTITY\\s+\\w+\\s+[\"'](?:&\\w+;){2,}",
  "<!ENTITY\\s+lol[0-9]",
  "&lol1;.*&lol2;",
  "&lol\\d;",

  // PHP wrappers in XXE
  "php://(?:filter|input|output|fd|memory|temp|expect)",
  "expect://",
  "php://filter/read=convert\\.base64-encode/resource=",
  "php://filter/convert\\.base64-encode/resource=",
  "php://filter/string\\.rot13/resource=",
  "zip://",
  "compress\\.zlib://",
  "compress\\.bzip2://",
  "glob://",
  "phar://.*\\.phar",

  // XSLT injection (related)
  "<xsl:(?:stylesheet|transform|value-of|include|import)",
  "<xsl:stylesheet\\s+version",
  "<xsl:value-of\\s+select",
  "<xsl:include\\s+href",
  "<xsl:import\\s+href",
  "xsl:output\\s+method=[\"']text",

  // Out-of-band XXE
  "http://[a-z0-9]+\\.burpcollaborator\\.net",
  "http://.*\\.oastify\\.com",
  "<!ENTITY\\s+.*?\\s+SYSTEM\\s+[\"']http://",
  "<!ENTITY\\s+%.*?\\s+SYSTEM\\s+[\"']http://",
];

// ---------------------------------------------------------------------------
// SSTI Patterns (60+)
// ---------------------------------------------------------------------------

const sstiPatterns: string[] = [
  // Jinja2 / Twig / Django
  "\\{\\{\\s*(?:7\\*7|7\\*'7'|config|request|self|lipsum|cycler|joiner|namespace)",
  "\\{\\{\\s*['\"]\\.__class__",
  "\\{\\{\\s*(?:''|\\[\\]|\\(\\)).__class__.__(?:mro|base|subclasses)__",
  "\\{%\\s*(?:for|if|set|block|extends|include|import|from|macro|call|filter|do)\\b",
  "\\{\\{\\s*(?:range|lipsum|dict|url_for|get_flashed_messages)\\s*\\(",
  "\\{\\{\\s*config\\.items\\(\\)\\s*\\}\\}",
  "\\{\\{\\s*request\\.environ\\[",
  "\\{\\{\\s*''\\.__class__\\.__mro__",
  "\\{\\{\\s*\\(\\)\\.__class__\\.__bases__",
  "\\{\\{\\s*\\[\\]\\.__class__\\.__mro__",
  "\\{\\{\\s*\\{\\}\\.__class__\\.__mro__",
  "\\.__subclasses__\\s*\\(\\)",
  "\\.__init__\\.__globals__",
  "\\.__builtins__",
  "\\|\\s*attr\\([\"']__class__[\"']\\)",
  "\\|\\s*attr\\([\"']__mro__[\"']\\)",
  "\\{%-.*?-?%\\}",
  "\\{#.*?#\\}",

  // Freemarker
  "<#(?:assign|include|import|macro|function|if|list|switch)",
  "\\$\\{(?:\"freemarker\\.template\\.utility\\.Execute\")",
  "\\[#(?:assign|include|import|list|if)]",
  "\\$\\{\\s*(?:objectConstructor|freemarker|Runtime|exec)\\b",
  "<#assign\\s+\\w+\\s*=",
  "freemarker\\.template\\.utility\\.Execute",
  "freemarker\\.template\\.utility\\.ObjectConstructor",
  "new\\s*\\(\\\"java\\.lang\\.ProcessBuilder\\\"",
  "\\$\\{\\\"freemarker\\.template\\.utility\\.Execute\\\"?new\\(\\)",

  // Velocity
  "#(?:set|foreach|include|parse|evaluate|define|macro|if|elseif|else|end)\\s*\\(",
  "#set\\s*\\(\\$\\w+\\s*=",
  "#foreach\\s*\\(\\$\\w+\\s+in",
  "#evaluate\\s*\\(",
  "\\$class\\.inspect\\(",
  "\\$\\{class\\.forName",

  // Handlebars / Mustache
  "\\{\\{\\{.*?\\}\\}\\}",
  "\\{\\{#(?:each|if|unless|with|lookup|log|helperMissing|blockHelperMissing)\\b",
  "\\{\\{\\s*constructor\\b",
  "\\{\\{\\s*__proto__\\b",
  "\\{\\{\\s*prototype\\b",
  "\\{\\{\\s*#with\\s+.*?as\\s+\\|",

  // Pug / Jade
  "-\\s+var\\s+.*?=\\s*(?:require|process|global|Buffer|child_process)",
  "!=\\s*(?:require|process|global)\\(",
  "=\\s*require\\s*\\(",
  "!{\\s*require\\s*\\(",

  // ERB (Ruby)
  "<%=?\\s*(?:system|exec|IO\\.popen|`|%x)",
  "<%\\s*system\\s*\\(",
  "<%=\\s*`[^`]+`",
  "<%=\\s*\\%x\\[",
  "<%\\s*IO\\.popen",
  "<%-\\s*(?:system|exec|IO\\.popen)",

  // Smarty
  "\\{(?:php|literal|include|fetch|function|eval|math|capture|config_load)\\b",
  "\\{php\\}",
  "\\{eval",
  "\\{fetch\\s+file=",
  "\\{include\\s+file=",
  "\\{\\$smarty\\.request",

  // Tornado / Mako
  "\\$\\{self\\.module\\.os\\.popen",
  "\\$\\{self\\._TemplateReference__context\\.call",
  "<%!\\s*import\\s+os",
  "<%!\\s*from\\s+subprocess",
  "<%\\s*import\\s+os%>",
  "<%=\\s*str\\(os\\.system",

  // Pebble
  "\\{%\\s*execute\\b",
  "\\{\\{\\s*\\\"com\\.mitchellbosecke\\.pebble",
  "java\\.lang\\.Runtime\\.getRuntime\\(\\)\\.exec\\(",

  // Generic detection
  "\\$\\{\\s*\\d+\\s*[+*/-]\\s*\\d+\\s*\\}",
  "#\\{\\s*\\d+\\s*[+*/-]\\s*\\d+\\s*\\}",
  "\\{\\{\\s*\\d+\\s*[+*/-]\\s*\\d+\\s*\\}\\}",
  "\\$\\{\\d+\\*\\d+\\}",
  "\\{\\{\\s*\\d+\\*\\d+\\s*\\}\\}",
  "#{\\d+\\*\\d+}",
];

// ---------------------------------------------------------------------------
// Header Injection Patterns (30+)
// ---------------------------------------------------------------------------

const headerInjectionPatterns: string[] = [
  // CRLF injection
  "(?:%0d%0a|%0a%0d|%0d|%0a|\\r\\n|\\n|\\r)\\s*(?:Set-Cookie|Location|Content-Type|HTTP/)",
  "%0d%0a",
  "%0a%0d",
  "\\r\\n\\r\\n",

  // Host header poisoning
  "(?:X-Forwarded-Host|X-Host|X-Forwarded-Server|X-Original-URL|X-Rewrite-URL)\\s*:",

  // HTTP response splitting
  "(?:%0d%0a|\\r\\n)HTTP/\\d\\.\\d\\s+\\d{3}",
  "(?:%0d%0a|\\r\\n)(?:Content-Length|Transfer-Encoding)\\s*:",

  // Header injection via value
  "(?:%0d%0a|\\r\\n)\\w+:\\s*",

  // X-Forwarded-For spoofing (internal IPs)
  "X-Forwarded-For:\\s*(?:127\\.0\\.0\\.1|10\\.|172\\.(?:1[6-9]|2\\d|3[01])\\.|192\\.168\\.)",
  "X-Real-IP:\\s*(?:127\\.0\\.0\\.1|10\\.|172\\.(?:1[6-9]|2\\d|3[01])\\.|192\\.168\\.)",
  "X-Originating-IP:\\s*(?:127\\.0\\.0\\.1|10\\.|172\\.(?:1[6-9]|2\\d|3[01])\\.|192\\.168\\.)",

  // Forwarded header abuse
  "Forwarded:\\s*for=(?:127\\.0\\.0\\.1|10\\.|172\\.(?:1[6-9]|2\\d|3[01])\\.|192\\.168\\.)",
  "Client-IP:\\s*(?:127\\.0\\.0\\.1|10\\.|172\\.(?:1[6-9]|2\\d|3[01])\\.|192\\.168\\.)",

  // Log injection
  "%0a.*?%0a",
  "%0d.*?%0d",
  "\\\\n.*?\\\\n",
  "\\\\r\\\\n.*?\\\\r\\\\n",
];

// ---------------------------------------------------------------------------
// Deserialization Attack Patterns (80+)
// ---------------------------------------------------------------------------

const deserializationPatterns: string[] = [
  // Java ObjectInputStream / serialized bytes
  "rO0ABX",
  "rO0AB",
  "aced0005",
  "aced\\s*00\\s*05",
  "sr\\s+(?:java|sun|org|com)\\.",
  "java\\.lang\\.Runtime",
  "java\\.lang\\.ProcessBuilder",
  "org\\.apache\\.commons\\.collections",
  "org\\.springframework",
  "com\\.sun\\.org\\.apache\\.xalan",
  "org\\.jboss\\.interceptor",
  "com\\.mchange\\.v2\\.c3p0",
  "org\\.beanshell",
  "bsh\\.Interpreter",
  "org\\.codehaus\\.groovy",
  "com\\.fasterxml\\.jackson",
  "ysoserial",
  "gadgetchain",
  "InvokerTransformer",
  "CommonsCollections\\d",
  "TemplatesImpl",
  "TrAXFilter",
  "javax\\.xml\\.transform\\.Templates",
  "jndi:(?:ldap|rmi|dns|corba|iiop|nis)://",
  "com\\.sun\\.jndi\\.ldap",
  "com\\.sun\\.jndi\\.rmi",

  // PHP unserialize
  "O:\\d+:\"",
  "a:\\d+:\\{",
  "s:\\d+:\"",
  "i:\\d+;",
  "b:[01];",
  "N;",
  "O:[0-9]+:[\"'][a-zA-Z0-9_\\\\]+[\"']:[0-9]+:\\{",
  "__wakeup\\b",
  "__sleep\\b",
  "__destruct\\b",
  "__toString\\b",
  "__invoke\\b",
  "__unserialize\\b",
  "unserialize\\s*\\(",
  "php_unserialize",
  "POP\\s+chain",
  "GuzzleHttp\\\\Psr7",

  // Python pickle
  "pickletools",
  "pickle\\.loads\\s*\\(",
  "pickle\\.load\\s*\\(",
  "cPickle\\.loads\\s*\\(",
  "\\\\x80\\\\x02",
  "c__builtin__\\\\nexec\\\\n",
  "cos\\\\nsystem\\\\n",
  "cposix\\\\nsystem",
  "__reduce__\\s*=",
  "__reduce_ex__\\s*=",
  "GLOBAL\\s+('os'\\s+'system'|\"os\"\\s+\"system\")",

  // .NET BinaryFormatter
  "AAEAAAD",
  "System\\.Runtime\\.Serialization\\.Formatters\\.Binary\\.BinaryFormatter",
  "System\\.Windows\\.Data\\.ObjectDataProvider",
  "System\\.Web\\.UI\\.LosFormatter",
  "TypeConfuseDelegate",
  "TextFormattingRunProperties",
  "PSObject",
  "ObjectStateFormatter",
  "NetDataContractSerializer",
  "DataContractJsonSerializer",
  "System\\.Runtime\\.Remoting",
  "System\\.Runtime\\.Serialization",
  "__type\\s*:\\s*[\"']",

  // Node.js serialize-javascript
  "_$$ND_FUNC$$_",
  "\\{\\s*\"rce\"\\s*:\\s*\"_\\$\\$ND_FUNC\\$\\$_",
  "node-serialize",
  "eval\\(toString\\(",
  "Function\\(toString\\(",

  // YAML deserialization
  "!!python/object/apply:os.system",
  "!!python/object/apply:",
  "!!python/object:",
  "!!python/name:",
  "!!java\\.lang\\.Runtime",
  "!!com\\.sun\\.rowset\\.JdbcRowSetImpl",
  "!!javax\\.script\\.ScriptEngineManager",
  "!ruby/object:",
  "!ruby/sym",
];

// ---------------------------------------------------------------------------
// Prototype Pollution Patterns (40+)
// ---------------------------------------------------------------------------

const prototypePollutionPatterns: string[] = [
  // Direct prototype access
  "__proto__",
  "constructor\\.prototype",
  "\\[\"__proto__\"\\]",
  "\\['__proto__'\\]",
  "__proto__\\s*\\[",
  "__proto__\\s*\\.",
  "__proto__\\s*:",
  "__proto__=",

  // Constructor manipulation
  "constructor\\.constructor",
  "\\.constructor\\s*\\[",
  "\\.constructor\\s*\\(",
  "\\[\"constructor\"\\]",
  "\\['constructor'\\]",
  "Object\\.assign.*?__proto__",
  "Object\\.setPrototypeOf\\s*\\(",

  // Lodash merge pollution
  "_.merge.*?__proto__",
  "_.defaultsDeep.*?__proto__",
  "_.mergeWith.*?__proto__",
  "lodash.*?merge.*?constructor",

  // jQuery extend pollution
  "\\$\\.extend.*?__proto__",
  "jQuery\\.extend.*?__proto__",
  "\\$\\.extend\\(true",
  "jQuery\\.extend\\(true",

  // Deep merge attacks
  "deepmerge.*?__proto__",
  "deep-extend.*?__proto__",
  "deepExtend.*?__proto__",
  "merge-deep.*?__proto__",
  "assign-deep.*?__proto__",

  // JSON-based pollution
  "\\{\"__proto__\":",
  "\\{\"constructor\":\\{\"prototype\":",
  "\\{[\"']__proto__[\"']:\\{",
  "\\[\"constructor\",\"prototype\"\\]",

  // Prototype chain
  "__lookupGetter__",
  "__lookupSetter__",
  "__defineGetter__",
  "__defineSetter__",
  "Object\\.prototype\\[",
  "Array\\.prototype\\[",
  "Function\\.prototype\\[",
  "hasOwnProperty\\s*=",
  "isPrototypeOf\\s*=",
  "toString\\s*=\\s*function",
  "valueOf\\s*=\\s*function",
];

// ---------------------------------------------------------------------------
// HTTP Request Smuggling Patterns (30+)
// ---------------------------------------------------------------------------

const requestSmugglingPatterns: string[] = [
  // CL.TE (Content-Length / Transfer-Encoding conflict)
  "Transfer-Encoding:\\s*chunked.*?Content-Length:",
  "Content-Length:\\s*\\d+.*?Transfer-Encoding:\\s*chunked",
  "Transfer-Encoding:\\s*chunked\\s*\\r?\\n.*?Transfer-Encoding:",

  // TE.CL
  "Transfer-Encoding:\\s*[^\\r\\n]*\\r?\\n.*?Content-Length:",

  // TE.TE obfuscation
  "Transfer-Encoding:\\s*xchunked",
  "Transfer-Encoding:\\s*chunked\\s",
  "Transfer-Encoding:\\s* chunked",
  "Transfer-Encoding:\\s*\\tchunked",
  "Transfer-Encoding:\\s*[\"']chunked[\"']",
  "Transfer-Encoding:\\s*[\\x0b\\x0c]chunked",
  "Transfer-Encoding\\x3a\\s*chunked",
  "Transfer-Encoding:\\s*chunk",

  // H2.CL downgrade
  "content-length:\\s*0.*?GET",
  "content-length:\\s*0.*?POST",
  ":method\\s+CONNECT",
  ":path\\s+http://",

  // Chunked encoding abuse
  "0\\r\\n\\r\\nGET\\s+/",
  "0\\r\\n\\r\\nPOST\\s+/",
  "0\\r\\n\\r\\nHEAD\\s+/",
  "0\\r\\n\\r\\nPUT\\s+/",
  "0%0d%0a%0d%0aGET",
  "0%0d%0a%0d%0aPOST",
  "\\r\\n0\\r\\n\\r\\n",
  "\\r\\nGET\\s+/.*?HTTP/",
  "\\nGET\\s+/.*?HTTP/",

  // Ambiguous headers
  "Foo:\\s*bar\\r\\nTransfer-Encoding:\\s*chunked",
  "\\x0bTransfer-Encoding:\\s*chunked",
  "\\x0cTransfer-Encoding:\\s*chunked",

  // Content-Length manipulation
  "Content-Length:\\s*-\\d+",
  "Content-Length:\\s*0x[0-9a-fA-F]+",
  "Content-Length:\\s*\\d+\\.\\d+",
  "Content-Length:\\s*\\+\\d+",
  "Content-Length:\\s*\\d+e\\d+",
  "Content-Length:\\s*00\\d+",
  "Content-Length\\s*:\\s*\\d+\\s*,\\s*\\d+",

  // HTTP/2 downgrade smuggling
  ":authority\\s+.*?\\r\\n.*?Host:",
  ":method\\s+(?:OPTIONS|TRACE|TRACK|DEBUG)\\s+:path",
  ":scheme\\s+http\\s+:authority",
  "SETTINGS_MAX_CONCURRENT_STREAMS\\s*=\\s*0",
  "PRIORITY\\s+frame.*?GET\\s+/",
  "h2c\\s+upgrade.*?Transfer-Encoding",

  // CL.0 / TE.0 desync
  "Content-Length:\\s*0\\r\\n\\r\\n(?:GET|POST|PUT|DELETE|PATCH)",
  "Transfer-Encoding:\\s*\\r\\n\\r\\n(?:GET|POST)",
  "Content-Length:\\s*\\d+\\r\\nTransfer-Encoding:\\s*$",
];

// ---------------------------------------------------------------------------
// LDAP Injection Patterns (30+)
// ---------------------------------------------------------------------------

const ldapInjectionPatterns: string[] = [
  // Basic injection
  "\\)\\s*\\(",
  "\\)\\s*\\(\\s*\\|",
  "\\)\\s*\\(\\s*&",
  "\\)\\s*\\|\\s*\\(",
  "\\(\\s*\\|\\s*\\(",
  "\\*\\)\\s*\\(",
  "\\*\\)\\(objectClass=\\*\\)",
  "\\)\\(uid=\\*\\)",
  "\\)\\(mail=\\*\\)",
  "\\)\\(cn=\\*\\)",

  // Blind LDAP
  "\\*\\)\\s*\\(\\|\\s*\\(",
  "\\)(?:\\s*\\((?:objectClass|uid|mail|cn|sn|givenName|ou|o|dc|dn|userPassword)=[^)]*\\))+",

  // Boolean-based blind
  "\\(uid=\\*\\)\\(uid=\\*\\)",
  "\\*\\)\\(objectClass=\\*\\)\\(\\|\\(",
  "\\(\\&\\(uid=\\*\\)\\(userPassword=\\*\\)\\)",

  // Attribute injection
  "objectClass=\\*",
  "objectClass=person",
  "objectClass=user",
  "uid=\\*",
  "cn=\\*",
  "userPassword=\\*",
  "sAMAccountName=\\*",
  "memberOf=\\*",

  // LDAP filter special characters
  "\\(=[^)]*\\*[^)]*\\)",
  "\\(~=",
  "\\(>=",
  "\\(<=",
  "\\(approxMatch=",

  // Encoded injection
  "%28%7c",
  "%29%28",
  "%2a%29%28",
  "%29%28objectClass%3d%2a%29",
];

// ---------------------------------------------------------------------------
// XPath Injection Patterns (30+)
// ---------------------------------------------------------------------------

const xpathInjectionPatterns: string[] = [
  // Classic injection
  "'\\s+or\\s+'1'='1",
  "\"\\s+or\\s+\"1\"=\"1",
  "'\\s+or\\s+1=1",
  "' or ''='",
  "\" or \"\"=\"",

  // String functions
  "string\\s*\\(//",
  "string-length\\s*\\(//",
  "substring\\s*\\(",
  "translate\\s*\\(",
  "normalize-space\\s*\\(",
  "contains\\s*\\(",
  "starts-with\\s*\\(",
  "string\\s*\\(doc\\(|string-length\\s*\\(doc\\(",
  "doc\\s*\\(\\s*[\"']",
  "document\\s*\\(\\s*[\"']",

  // Count/position functions
  "count\\s*\\(//",
  "position\\s*\\(\\)",
  "last\\s*\\(\\)",
  "count\\s*\\(ancestor",
  "count\\s*\\(child",
  "count\\s*\\(descendant",

  // Boolean-based blind
  "and\\s+count\\s*\\(//",
  "or\\s+count\\s*\\(//",
  "\\]\\[\\d+\\]",
  "'='",
  "//\\*",
  "//\\*\\[@",
  "//@\\*",

  // Axis injection
  "ancestor::",
  "ancestor-or-self::",
  "descendant::",
  "descendant-or-self::",
  "following::",
  "following-sibling::",
  "preceding::",
  "namespace::",
  "parent::.*",
  "child::.*",
];

// ---------------------------------------------------------------------------
// GraphQL Abuse Patterns (40+)
// ---------------------------------------------------------------------------

const graphqlAbusePatterns: string[] = [
  // Introspection
  "__schema",
  "__type",
  "__typename",
  "__enumValues",
  "__inputFields",
  "__fields",
  "__possibleTypes",
  "__interfaces",
  "__unions",
  "IntrospectionQuery",
  "schema\\s*\\{\\s*query",

  // Batch queries
  "\\[\\{.*?query.*?\\},\\s*\\{",
  "\\[\\{\"query\"",
  "\\[\\s*\\{\\s*\"operationName\"",
  "\\[\\s*\\{\\s*\"variables\"",

  // Nested depth attacks (N+1, deep nesting)
  "\\{[^}]*\\{[^}]*\\{[^}]*\\{[^}]*\\{[^}]*\\{",
  "edges\\s*\\{\\s*node\\s*\\{\\s*edges\\s*\\{\\s*node\\s*\\{",
  "friends\\s*\\{\\s*friends\\s*\\{\\s*friends\\s*\\{",

  // Alias flooding
  "(?:\\w+\\s*:\\s*\\w+[^,}]*,\\s*){10,}",
  "a1:\\s*\\w+.*?a2:\\s*\\w+.*?a3:\\s*\\w+.*?a4:\\s*\\w+.*?a5:",

  // Field suggestion / enum harvesting
  "mutation.*?password.*?token",
  "mutation.*?deleteUser",
  "mutation.*?createAdmin",
  "mutation.*?updateRole",
  "mutation.*?(?:bypass|skip).*?auth",

  // SSRF via GraphQL
  "query.*?http://",
  "mutation.*?url.*?(?:localhost|127\\.0\\.0\\.1|169\\.254)",

  // GraphQL over WebSocket
  "type:\\s*[\"']connection_init[\"']",
  "type:\\s*[\"']subscribe[\"']",
  "type:\\s*[\"']start[\"']",

  // Common attack vectors
  "query\\s+\\{\\s*user\\s*\\(id:\\s*[\"'].*?[\"']\\)",
  "\\$ref:\\s*#/definitions/",
  "__\\w+__",
  "operationName.*?(?:IntrospectionQuery|schema)",
];

// ---------------------------------------------------------------------------
// JWT Attack Patterns (40+)
// ---------------------------------------------------------------------------

const jwtAttackPatterns: string[] = [
  // alg:none attack
  "\"alg\"\\s*:\\s*\"none\"",
  "'alg'\\s*:\\s*'none'",
  "\"alg\"\\s*:\\s*\"None\"",
  "\"alg\"\\s*:\\s*\"NONE\"",
  "eyJhbGciOiJub25lIi",
  "eyJhbGciOiJOb25lIi",
  "eyJhbGciOiJOT05FIi",

  // Algorithm confusion (RS256 -> HS256)
  "\"alg\"\\s*:\\s*\"HS256\"",
  "\"alg\"\\s*:\\s*\"HS384\"",
  "\"alg\"\\s*:\\s*\"HS512\"",

  // KID injection
  "\"kid\"\\s*:\\s*\".*?(?:SELECT|UNION|DROP|INSERT|--|#|/\\*)",
  "\"kid\"\\s*:\\s*\"/dev/null\"",
  "\"kid\"\\s*:\\s*\"/proc/self",
  "\"kid\"\\s*:\\s*\".*?(?:;|&&|\\|\\|).*?\"",
  "\"kid\"\\s*:\\s*\".*?\\.\\./.*?\"",

  // JKU/X5U header manipulation
  "\"jku\"\\s*:\\s*\"http://",
  "\"jku\"\\s*:\\s*\"https://",
  "\"x5u\"\\s*:\\s*\"http://",
  "\"x5u\"\\s*:\\s*\"https://",
  "\"jku\"\\s*:\\s*\".*?(?:localhost|127\\.0|169\\.254)",
  "\"x5u\"\\s*:\\s*\".*?(?:localhost|127\\.0|169\\.254)",

  // JWT forgery patterns
  "eyJ[A-Za-z0-9_-]+\\.eyJ[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]*",
  "\"typ\"\\s*:\\s*\"JWT\".*?\"alg\"\\s*:\\s*\"none\"",

  // Embedded JWK
  "\"jwk\"\\s*:\\s*\\{",
  "\"kty\"\\s*:\\s*\"(?:RSA|EC|oct)\"",
  "\"n\"\\s*:\\s*\"[A-Za-z0-9_-]+\".*?\"e\"\\s*:\\s*",

  // Common JWT attacks
  "\\bAuthorization:\\s*Bearer\\s+eyJ[A-Za-z0-9_-]+\\.eyJ[A-Za-z0-9_-]+\\.",
  "\"iss\"\\s*:\\s*\"attacker",
  "\"role\"\\s*:\\s*\"admin\"",
  "\"admin\"\\s*:\\s*true",
  "\"isAdmin\"\\s*:\\s*true",
  "\"privilege\"\\s*:\\s*\"admin\"",
  "\"exp\"\\s*:\\s*9{8,}",
];

// ---------------------------------------------------------------------------
// WebSocket Hijacking Patterns (20+)
// ---------------------------------------------------------------------------

const websocketHijackingPatterns: string[] = [
  // Upgrade header manipulation
  "Upgrade:\\s*websocket",
  "Connection:\\s*(?:keep-alive,\\s*)?Upgrade",
  "Sec-WebSocket-Key:",
  "Sec-WebSocket-Version:",
  "Sec-WebSocket-Protocol:",
  "Sec-WebSocket-Extensions:",

  // Cross-origin WebSocket hijacking
  "Origin:\\s*(?:null|file://|about:blank)",
  "Origin:\\s*https?://(?:localhost|127\\.0\\.0\\.1)",

  // WebSocket over HTTP smuggling
  "GET\\s+/.*?HTTP/1\\.1.*?Upgrade:\\s*websocket",

  // Protocol switching attacks
  "Upgrade:\\s*h2c",
  "Upgrade:\\s*HTTP/2\\.0",
  "Upgrade:\\s*TLS/1\\.0",
  "HTTP2-Settings:",

  // WebSocket subprotocol abuse
  "Sec-WebSocket-Protocol:\\s*(?:chat|stomp|wamp|graphql-ws)",
  "Sec-WebSocket-Protocol:\\s*[^\\r\\n]*(?:sql|exec|eval)",

  // CSWSH indicators
  "ws://localhost",
  "ws://127\\.0\\.0\\.1",
  "wss://169\\.254\\.169\\.254",
  "wss?://10\\.",
  "wss?://192\\.168\\.",
];

// ---------------------------------------------------------------------------
// CRLF Injection Patterns (30+)
// ---------------------------------------------------------------------------

const crlfInjectionPatterns: string[] = [
  // Basic CRLF
  "%0d%0a",
  "%0a%0d",
  "%0d%0a%0d%0a",
  "%0a%0d%0a%0d",
  "\\r\\n",
  "\\r\\n\\r\\n",
  "%0d",
  "%0a",
  "%0D%0A",
  "%0A%0D",
  "%0D",
  "%0A",

  // Double encoded
  "%250d%250a",
  "%250a%250d",
  "%25%30%64%25%30%61",
  "%u000d%u000a",
  "\\\\r\\\\n",
  "\\\\n\\\\r",

  // Header injection
  "%0d%0aSet-Cookie:",
  "%0d%0aLocation:",
  "%0d%0aContent-Type:",
  "%0d%0aX-Forwarded-For:",
  "%0d%0aContent-Length:",
  "%0a%0dSet-Cookie:",
  "\\r\\nSet-Cookie:",
  "\\r\\nLocation:",

  // Response splitting
  "%0d%0aHTTP/1\\.1\\s+200",
  "%0d%0aHTTP/1\\.0\\s+200",
  "\\r\\nHTTP/1\\.1\\s+200",

  // Log injection
  "%0a.*?(?:admin|root|backdoor|exec)",
  "%0d%0a.*?(?:error|warning|critical)",
  "\\\\r\\\\n.*?(?:admin|root|backdoor)",
];

// ---------------------------------------------------------------------------
// DNS Rebinding Patterns (20+)
// ---------------------------------------------------------------------------

const dnsRebindingPatterns: string[] = [
  // DNS rebinding services
  "(?:\\d+\\.){3}\\d+\\.(?:nip\\.io|xip\\.io|sslip\\.io)",
  "\\.rbndr\\.us",
  "rebind\\.it",
  "rebind\\.network",
  "rebind\\.run",
  "1u1\\.eu",
  "\\.localtest\\.me",
  "\\.local\\.gd",
  "\\d+\\.\\d+\\.\\d+\\.\\d+\\.nip\\.io",
  "\\d+-\\d+-\\d+-\\d+\\.nip\\.io",
  "\\d+-\\d+-\\d+-\\d+\\.sslip\\.io",

  // Internal IP targeting via DNS
  "(?:10|172|192)\\.(?:\\d+\\.)+\\d+\\.nip\\.io",
  "127\\.0\\.0\\.1\\.nip\\.io",
  "127\\.0\\.0\\.1\\.xip\\.io",
  "localhost\\.nip\\.io",

  // Timing/race condition rebinding
  "TTL\\s*=\\s*0",
  "\"ttl\"\\s*:\\s*0",
  "\"ttl\"\\s*:\\s*1",

  // SSRF via DNS
  "http://[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+\\.(?:nip\\.io|sslip\\.io)",
  "https://[0-9]+\\.[0-9]+\\.[0-9]+\\.[0-9]+\\.(?:nip\\.io|sslip\\.io)",
];

// ---------------------------------------------------------------------------
// Open Redirect Patterns (40+)
// ---------------------------------------------------------------------------

const openRedirectPatterns: string[] = [
  // Common redirect parameters
  "(?:redirect|redirect_to|redirectUrl|redirect_url|redirecturi|redirect_uri|return|returnUrl|return_url|returnto|return_to|returnurl|next|nextUrl|next_url|dest|destination|go|goto|link|url|to|forward|from|ref|referrer|home|page|target|site|open|callback|continue|done|out|success|cancel|r|u|q|view|out)=(?:https?:|//|javascript:|\\\\//|%2f%2f|%5c%2f%2f|%252f%252f|\\/\\/)",

  // javascript: scheme in redirect
  "(?:redirect|return|next|dest|url|goto|to|forward|callback)=(?:javascript|vbscript|data):",

  // Protocol-relative URLs
  "(?:redirect|return|next|dest|url|goto)=//",
  "(?:redirect|return|next|dest|url|goto)=%2f%2f",
  "(?:redirect|return|next|dest|url|goto)=%252f%252f",
  "(?:redirect|return|next|dest|url|goto)=\\\\//",
  "(?:redirect|return|next|dest|url|goto)=%5c%2f%2f",

  // Open redirect to attacker domain
  "(?:redirect|return|next|dest|url|goto)=https?://(?:evil|attacker|malicious|bad)",
  "(?:redirect|return|next|dest|url|goto)=https?://[^/]*\\.(?:evil\\.com|attacker\\.com)",

  // Meta refresh redirect
  "<meta\\s+http-equiv=[\"']refresh[\"']\\s+content=[\"']\\d+;\\s*url=",
  "<meta\\s+content=[\"']\\d+;\\s*url=.*?[\"']\\s+http-equiv=[\"']refresh[\"']",

  // Header-based redirect
  "Location:\\s*(?:https?://|//)",
  "Refresh:\\s*\\d+;\\s*url=",
  "Location:\\s*javascript:",
  "Location:\\s*//",

  // Encoded variants
  "url=(?:javascript|vbscript)%3a",
  "url=%2f%2f",
  "url=http%3a%2f%2f",
  "next=%2f%2f",
  "next=javascript%3a",

  // data: URI redirect
  "(?:redirect|return|next|dest|url|goto|callback)=data:",
  "(?:redirect|return|next|dest|url|goto|callback)=data%3a",
  "(?:redirect|return|next|dest|url|goto|callback)=data%253a",

  // CRLF in redirect parameters
  "(?:redirect|return|next|dest|url|goto)=[^&]*%0d%0a",
  "(?:redirect|return|next|dest|url|goto)=[^&]*%0d",
  "(?:redirect|return|next|dest|url|goto)=[^&]*%0a",
  "(?:redirect|return|next|dest|url|goto)=[^&]*\\r\\n",

  // Whitelisted domain bypass techniques
  "(?:redirect|return|next|dest|url|goto)=https?://[^/]*@[^/]+",
  "(?:redirect|return|next|dest|url|goto)=https?://[^/]*%40[^/]+",
  "(?:redirect|return|next|dest|url|goto)=https?://legitimate\\.com\\.[^/]+",
  "(?:redirect|return|next|dest|url|goto)=https?://[^/]+\\.legitimate\\.com\\.[^/]+",
  "(?:redirect|return|next|dest|url|goto)=https?://[^/]*#@",
  "(?:redirect|return|next|dest|url|goto)=https?://[^/]*\\\\@",

  // Null byte / tab / newline in redirect
  "(?:redirect|return|next|dest|url|goto)=[^&]*%00",
  "(?:redirect|return|next|dest|url|goto)=[^&]*%09",
  "(?:redirect|return|next|dest|url|goto)=\\\\[^/]",

  // Window.location / document.location in redirect
  "(?:redirect|return|next|dest|url|goto)=.*?window\\.location",
  "(?:redirect|return|next|dest|url|goto)=.*?document\\.location",
];

// ---------------------------------------------------------------------------
// NoSQL Injection Patterns (50+)
// ---------------------------------------------------------------------------

const nosqlInjectionPatterns: string[] = [
  // MongoDB operators - comparison
  "\\$gt\\s*:",
  "\\$lt\\s*:",
  "\\$gte\\s*:",
  "\\$lte\\s*:",
  "\\$ne\\s*:",
  "\\$eq\\s*:",

  // MongoDB operators - logical
  "\\$or\\s*:",
  "\\$and\\s*:",
  "\\$not\\s*:",
  "\\$nor\\s*:",

  // MongoDB operators - element
  "\\$exists\\s*:",
  "\\$type\\s*:",

  // MongoDB operators - evaluation
  "\\$regex\\s*:",
  "\\$where\\s*:",
  "\\$expr\\s*:",
  "\\$jsonSchema\\s*:",
  "\\$mod\\s*:",
  "\\$text\\s*:",
  "\\$search\\s*:",

  // MongoDB operators - array
  "\\$in\\s*:",
  "\\$nin\\s*:",
  "\\$all\\s*:",
  "\\$elemMatch\\s*:",
  "\\$size\\s*:",

  // MongoDB operators - update
  "\\$set\\s*:",
  "\\$unset\\s*:",
  "\\$inc\\s*:",
  "\\$push\\s*:",
  "\\$pull\\s*:",
  "\\$addToSet\\s*:",

  // JavaScript injection in $where
  "\\$where\\s*:\\s*[\"']function",
  "\\$where\\s*:\\s*[\"']this\\.",
  "\\$where\\s*:\\s*[\"']return\\s+true",
  "\\$where\\s*:\\s*[\"']1===1",
  "\\$where.*?this\\.password",
  "\\$where.*?this\\.username",

  // Authentication bypass
  "password\\[\\$ne\\]",
  "password\\[\\$gt\\]",
  "username\\[\\$ne\\]",
  "user\\[\\$ne\\]",
  "email\\[\\$ne\\]",
  "\\[\\$ne\\]=",
  "\\[\\$gt\\]=",
  "\\[\\$regex\\]=",
  "\\[\\$exists\\]=true",
  "\\[\\$where\\]=",

  // URL-encoded NoSQL
  "%5b%24ne%5d",
  "%5b%24gt%5d",
  "%5b%24regex%5d",
  "%5b%24where%5d",
  "%24ne",
  "%24gt",
  "%24regex",

  // CouchDB / Elasticsearch injection
  "\"selector\"\\s*:\\s*\\{",
  "\"$gt\"\\s*:\\s*\"\"",
  "\"query\"\\s*:\\s*\\{\"bool\"",
  "\"match_all\"\\s*:\\s*\\{\\}",
];

// ---------------------------------------------------------------------------
// Log4Shell / JNDI Patterns (50+)
// ---------------------------------------------------------------------------

const log4shellPatterns: string[] = [
  // Basic JNDI patterns
  "\\$\\{jndi:",
  "\\$\\{jndi:ldap://",
  "\\$\\{jndi:rmi://",
  "\\$\\{jndi:dns://",
  "\\$\\{jndi:corba://",
  "\\$\\{jndi:iiop://",
  "\\$\\{jndi:nis://",
  "\\$\\{jndi:nds://",
  "\\$\\{jndi:http://",
  "\\$\\{jndi:https://",
  "\\$\\{jndi:ldaps://",

  // Obfuscated variants - case variation
  "\\$\\{JnDi:",
  "\\$\\{JNDI:",
  "\\$\\{Jndi:",
  "\\$\\{jNdi:",
  "\\$\\{jnDi:",
  "\\$\\{jndI:",

  // Obfuscated variants - nested expressions
  "\\$\\{\\$\\{::-j\\}",
  "\\$\\{\\$\\{::-j\\}\\$\\{::-n\\}",
  "\\$\\{\\$\\{lower:j\\}",
  "\\$\\{\\$\\{upper:j\\}",
  "\\$\\{j\\$\\{::-n\\}di",
  "\\$\\{\\$\\{env:NaN:-j\\}",

  // Log4j lower/upper tricks
  "\\$\\{lower:j\\}\\$\\{lower:n\\}\\$\\{lower:d\\}\\$\\{lower:i\\}",
  "\\$\\{upper:j\\}\\$\\{upper:n\\}\\$\\{upper:d\\}\\$\\{upper:i\\}",
  "j\\$\\{::-n\\}di",
  "j\\$\\{lower:n\\}di",
  "j\\$\\{upper:n\\}di",
  "jn\\$\\{::-d\\}i",
  "jnd\\$\\{::-i\\}:",

  // Log4j variable substitution tricks
  "\\$\\{env:BARFOO:-j\\}",
  "\\$\\{env:.*?:-j\\}\\$\\{env:.*?:-n\\}",
  "\\$\\{date:.*?JNDI",
  "\\$\\{sys:.*?JNDI",
  "\\$\\{ctx:.*?JNDI",

  // URL-encoded JNDI
  "%24%7bjndi:",
  "%24%7bJNDI:",
  "%24%7Bjndi:",
  "%24%7BJNDI:",
  "\\$%7bjndi:",
  "\\$%7Bjndi:",

  // Unicode obfuscation
  "\\u0024\\u007bjndi",
  "\\u0024\\u007Bjndi",

  // Lookups that could chain to JNDI
  "\\$\\{ctx:loginId\\}",
  "\\$\\{main:\\w+\\}",
  "\\$\\{map:\\w+\\}",
  "\\$\\{sd:\\w+\\}",
  "\\$\\{mdc:\\w+\\}",
  "\\$\\{ndc\\}",
  "\\$\\{\\w+:\\w+\\}.*?jndi",
];

// ---------------------------------------------------------------------------
// CORS Misconfiguration Probing Patterns (20+)
// ---------------------------------------------------------------------------

const corsMisconfigPatterns: string[] = [
  // Wildcard + credentials
  "Access-Control-Allow-Origin:\\s*\\*",
  "Access-Control-Allow-Credentials:\\s*true",

  // Origin reflection probing
  "Origin:\\s*https?://(?:attacker|evil|bad|malicious)",
  "Origin:\\s*null",
  "Origin:\\s*file://",

  // Prefix/suffix bypass
  "Origin:\\s*https?://legitimate\\.example\\.com\\.attacker\\.com",
  "Origin:\\s*https?://.*?\\.evil\\.com",

  // Subdomain takeover vectors
  "Origin:\\s*https?://[^.]+\\.s3\\.amazonaws\\.com",
  "Origin:\\s*https?://[^.]+\\.github\\.io",
  "Origin:\\s*https?://[^.]+\\.netlify\\.app",
  "Origin:\\s*https?://[^.]+\\.vercel\\.app",
  "Origin:\\s*https?://[^.]+\\.pages\\.dev",
  "Origin:\\s*https?://[^.]+\\.azurewebsites\\.net",
  "Origin:\\s*https?://[^.]+\\.firebaseapp\\.com",

  // Vary header missing
  "Access-Control-Allow-Methods:\\s*(?:GET,\\s*)?POST,\\s*PUT,\\s*DELETE,\\s*PATCH",
  "Access-Control-Allow-Headers:\\s*\\*",

  // Preflight bypass
  "Access-Control-Request-Method:",
  "Access-Control-Request-Headers:",
];

// ---------------------------------------------------------------------------
// Cache Poisoning Patterns (20+)
// ---------------------------------------------------------------------------

const cachePoisoningPatterns: string[] = [
  // Host header poisoning
  "X-Forwarded-Host:\\s*",
  "X-Host:\\s*",
  "X-Forwarded-Server:\\s*",
  "X-Forwarded-Host:\\s*attacker",
  "X-Forwarded-Host:\\s*evil",
  "X-Forwarded-Host:\\s*[^\\r\\n]*\\.attacker\\.com",

  // URL overrides
  "X-Original-URL:\\s*/",
  "X-Rewrite-URL:\\s*/",
  "X-Override-URL:\\s*/",
  "X-HTTP-Method-Override:\\s*",
  "X-Forwarded-Prefix:\\s*/",

  // Port injection
  "X-Forwarded-Port:\\s*(?:443|80|8080|8443).*?[^\\d]",
  "X-Forwarded-Proto:\\s*https?",

  // Protocol downgrade
  "X-Forwarded-Scheme:\\s*http$",

  // Cache control manipulation
  "Cache-Control:\\s*no-store.*?(?:\\r\\n|\\n).*?Cache-Control:",
  "Pragma:\\s*no-cache.*?(?:\\r\\n|\\n).*?Cache-Control:",

  // Fat GET requests
  "GET\\s+/.*?\\s+HTTP.*?Content-Length:\\s*\\d+",
];

// ---------------------------------------------------------------------------
// HTTP Method Tampering Patterns (20+)
// ---------------------------------------------------------------------------

const methodTamperingPatterns: string[] = [
  // Override headers
  "X-HTTP-Method-Override:\\s*(?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|TRACE|CONNECT)",
  "X-Method-Override:\\s*(?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|TRACE|CONNECT)",
  "X-HTTP-Method:\\s*(?:GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|TRACE|CONNECT)",

  // Form method override
  "_method=(?:PUT|PATCH|DELETE|HEAD|OPTIONS|TRACE|CONNECT)",
  "_method%3d(?:PUT|PATCH|DELETE|HEAD|OPTIONS|TRACE|CONNECT)",

  // TRACE method (XST attack)
  "^TRACE\\s+/",
  "^TRACK\\s+/",

  // Arbitrary methods
  "^(?:PURGE|INVALIDATE|PROPFIND|PROPPATCH|MKCOL|COPY|MOVE|LOCK|UNLOCK|SEARCH|REPORT|VERSION-CONTROL|CHECKIN|CHECKOUT|UNCHECKOUT|MKACTIVITY|MERGE|BASELINE-CONTROL)\\s+/",

  // Override in body
  "_method=DELETE",
  "_method=PUT",
  "_method=PATCH",
  "&_method=DELETE",
  "&_method=PUT",
  "&_method=PATCH",
];

// ---------------------------------------------------------------------------
// Unicode / Encoding Bypass Patterns (40+)
// ---------------------------------------------------------------------------

const unicodeBypassPatterns: string[] = [
  // Fullwidth characters
  "\\uff03",
  "\\uff1c",
  "\\uff1e",
  "\\uff27",
  "\\uff28",
  "\\uff29",
  "\\uff2b",
  "\\uff53",
  "\\uff45",
  "\\uff4c",
  "\\uff45",
  "\\uff43",
  "\\uff54",

  // Fullwidth HTML/script equivalents
  "\\uFF1Cscript",
  "\\uFF1Cimg",
  "\\uFF1Csvg",
  "\\uFF1C/script",
  "\\uFF1Ciframe",

  // Overlong UTF-8 sequences
  "%c0%ae",
  "%e0%80%ae",
  "%c1%9c",
  "%c0%af",
  "%c1%pc",
  "%c0%2f",
  "%e0%80%af",
  "%f0%80%80%af",

  // Mixed encoding
  "\\\\x3c\\\\x73\\\\x63\\\\x72\\\\x69\\\\x70\\\\x74",
  "\\\\u003cscript",
  "\\\\u003e",
  "\\\\u003c",
  "\\\\u0022",
  "\\\\u0027",

  // HTML entity bypass
  "&lt;script",
  "&lt;img",
  "&lt;svg",
  "&#x3C;script",
  "&#x3C;img",
  "&#x3C;svg",
  "&#60;script",
  "&#60;img",

  // IDN homograph attacks
  "xn--",
  "unicode\\.org.*?homograph",

  // Zero-width characters in identifiers
  "\\u200b",
  "\\u200c",
  "\\u200d",
  "\\u2028",
  "\\u2029",
  "\\ufeff",
  "\\u00ad",
];

// ---------------------------------------------------------------------------
// API Abuse Patterns (50+)
// ---------------------------------------------------------------------------

const apiAbusePatterns: string[] = [
  // Mass assignment attacks
  "role=admin",
  "role=administrator",
  "role=superuser",
  "role=root",
  "isAdmin=true",
  "isAdmin=1",
  "is_admin=true",
  "is_admin=1",
  "admin=true",
  "admin=1",
  "privilege=admin",
  "privileged=true",
  "superuser=true",
  "superuser=1",
  "elevated=true",
  "staff=true",
  "accountType=admin",
  "userType=admin",
  "accessLevel=admin",
  "permissions=admin",
  "&admin=",
  "&isAdmin=",
  "&role=admin",
  "\"isAdmin\"\\s*:\\s*true",
  "\"role\"\\s*:\\s*\"admin\"",
  "\"privilege\"\\s*:\\s*\"admin\"",
  "\"superuser\"\\s*:\\s*true",
  "\"accountType\"\\s*:\\s*\"admin\"",

  // Excessive pagination / resource enumeration
  "(?:limit|per_page|page_size|count)=(?:1000|10000|100000|999999|\\d{6,})",
  "(?:offset|skip|start)=(?:10000|100000|\\d{6,})",
  "page=(?:\\d{4,})",
  "offset=(?:\\d{7,})",

  // IDOR / object reference
  "(?:user_id|userId|account_id|accountId|profile_id|order_id|invoice_id)=\\d{1,}",
  "(?:/users/|/accounts/|/profiles/|/orders/|/invoices/)\\d{1,}$",
  "(?:/api/v\\d+/)(?:users|accounts|profiles)/\\d{1,}",

  // GraphQL batch / introspection
  "__schema",
  "__type\\(",

  // Rate limit bypass attempts
  "X-Forwarded-For:\\s*\\d+\\.\\d+\\.\\d+\\.\\d+",
  "X-Real-IP:\\s*\\d+\\.\\d+\\.\\d+\\.\\d+",
  "X-Originating-IP:\\s*\\d+\\.\\d+\\.\\d+\\.\\d+",
  "CF-Connecting-IP:\\s*\\d+\\.\\d+\\.\\d+\\.\\d+",
  "True-Client-IP:\\s*\\d+\\.\\d+\\.\\d+\\.\\d+",

  // Credential stuffing signals
  "(?:password|passwd|pass)=.{0,30}&(?:password|passwd|pass)=",
  "login.*?(?:admin|root|administrator).*?password",
  "(?:username|user|email)=admin.*?password=",
  "(?:username|user|email)=root.*?password=",
];

// ---------------------------------------------------------------------------
// OAuth Bypass Patterns (20+)
// ---------------------------------------------------------------------------

const oauthBypassPatterns: string[] = [
  // State parameter manipulation
  "state=\\s*$",
  "state=&",
  "state=[^&]{1,4}&",
  "state=(?:test|123|abc|null|undefined|none)(?:&|$)",
  "[?&]state=[^&]*[?&]state=",

  // redirect_uri manipulation
  "redirect_uri=(?:javascript|data|vbscript):",
  "redirect_uri=(?:https?://|//)(?:evil|attacker|malicious)",
  "redirect_uri=[^&]*@[^&]+",
  "redirect_uri=[^&]*%40[^&]+",
  "redirect_uri=[^&]*%00",
  "redirect_uri=[^&]*\\.evil\\.com",
  "redirect_uri=[^&]*%252f",
  "redirect_uri=[^&]*\\.\\.(?:/|%2f)",
  "redirect_uri=[^&]*%0d%0a",
  "redirect_uri=(?:http|https)%3a%2f%2f",

  // Token leakage via Referer
  "access_token=[^&]+.*?Referer:",
  "token=[^&]+.*?Referer:",
  "code=[^&]+.*?Referer:\\s*https?://(?!(?:localhost|127\\.0\\.0\\.1))",

  // PKCE bypass attempts
  "code_challenge_method=(?:plain|none)(?:&|$)",
  "code_challenge=&",
  "code_challenge=\\s*$",
  "code_verifier=[^&]{1,10}(?:&|$)",

  // Grant type confusion
  "grant_type=(?:password|client_credentials).*?client_id=.*?client_secret=",
  "response_type=token.*?redirect_uri=(?:javascript|data):",
  "response_type=(?:code|token)\\s+(?:code|token)",
  "response_mode=fragment.*?response_type=code",

  // Scope escalation
  "scope=[^&]*(?:admin|superuser|root|\\*|all)",
  "scope=[^&]*%20(?:admin|write|delete)",

  // Client impersonation
  "client_id=[^&]+&client_secret=[^&]+&client_id=",
  "client_secret=.*?(?:password|secret|key)=",
];

// ---------------------------------------------------------------------------
// Supply Chain Attack Patterns (20+)
// ---------------------------------------------------------------------------

const supplyChainPatterns: string[] = [
  // Dependency confusion / namespace collision
  "(?:require|import|from)\\s*[\"']@?[a-z]+-internal[\"']",
  "(?:require|import|from)\\s*[\"']@?(?:company|corp|internal|private|dev)-",
  "(?:require|import|from)\\s*[\"']@?[a-z]+[-_](?:internal|private|staging|dev)[\"']",

  // Typosquatting common packages
  "(?:require|import|from)\\s*[\"'](?:loddash|l0dash|lodahs|lod-ash)[\"']",
  "(?:require|import|from)\\s*[\"'](?:reacct|react-|reeact|r3act)[\"']",
  "(?:require|import|from)\\s*[\"'](?:axois|axos|axioos|ax1os)[\"']",
  "(?:require|import|from)\\s*[\"'](?:expresss|expres|expr3ss)[\"']",
  "(?:require|import|from)\\s*[\"'](?:momnet|mom3nt|moement)[\"']",

  // Manifest tampering
  "\"(?:preinstall|postinstall|preuninstall)\"\\s*:\\s*\"(?:curl|wget|nc|bash|sh|powershell|cmd)",
  "\"scripts\"\\s*:.*?\"(?:pre|post)install\"\\s*:\\s*\"[^\"]*(?:eval|exec|spawn|fork|child_process)",
  "\"scripts\"\\s*:.*?\"(?:pre|post)install\"\\s*:\\s*\"[^\"]*(?:http|https|ftp)://",
  "\"(?:preinstall|postinstall)\"\\s*:\\s*\"node\\s+-e",

  // Lockfile manipulation
  "resolved.*?(?:registry\\.npmjs\\.org|registry\\.yarnpkg\\.com).*?integrity.*?\\n.*?resolved.*?(?:http|https)://(?!registry\\.npmjs|registry\\.yarnpkg)",
  "integrity\\s*\"?:\\s*\"?sha\\d+-[A-Za-z0-9+/=]{10,}\"?.*?resolved.*?(?:evil|attacker|malicious)",

  // Phantom dependency exploitation
  "(?:require|import)\\s*\\([\"'][^\"']+[\"']\\).*?(?:\\$|exec|spawn|fork)",
  "node_modules/\\.package-lock\\.json.*?resolved.*?(?:http|https)://(?!registry\\.npmjs)",

  // Build script injection
  "\"build\"\\s*:\\s*\"[^\"]*(?:&&|;|\\|)\\s*(?:curl|wget|nc|bash|sh|powershell)",
  "Makefile.*?(?:curl|wget)\\s+(?:http|https)://[^\\s]+\\s*\\|\\s*(?:bash|sh)",

  // Package version pinning bypass
  "\"dependencies\".*?\"[^\"]+\"\\s*:\\s*\"(?:\\*|>=0\\.0\\.0|latest|next|canary)\"",
  "\"resolutions\".*?\"[^\"]+\"\\s*:\\s*\"(?:https?://|git\\+|file:)",
];

// ---------------------------------------------------------------------------
// Container Escape Patterns (20+)
// ---------------------------------------------------------------------------

const containerEscapePatterns: string[] = [
  // /proc/self mount abuse
  "/proc/self/(?:root|cwd|exe|environ|maps|status|cmdline|fd)",
  "/proc/self/ns/(?:pid|net|mnt|uts|ipc|user|cgroup)",
  "/proc/\\d+/(?:root|ns|environ|maps|exe|cmdline)",
  "(?:mount|nsenter).*?/proc/\\d+/ns/",
  "cat\\s+/proc/self/(?:cgroup|mountinfo|status)",

  // Cgroup escape
  "(?:mkdir|echo|cat).*?/sys/fs/cgroup",
  "/sys/fs/cgroup/(?:memory|cpu|pids|devices)/(?:release_agent|notify_on_release)",
  "echo\\s+1\\s*>\\s*/sys/fs/cgroup/.*?notify_on_release",
  "echo\\s+.*?>\\s*/sys/fs/cgroup/.*?release_agent",
  "(?:cgroupfs|cgroup2fs).*?(?:mount|remount)",

  // Docker socket access
  "/var/run/docker\\.sock",
  "docker\\.sock.*?(?:GET|POST|PUT|DELETE)\\s+/(?:v\\d|containers|images|exec|volumes)",
  "(?:curl|wget).*?(?:--unix-socket|--abstract-unix).*?docker",
  "unix:///var/run/docker\\.sock",
  "containerd\\.sock",
  "/run/containerd/containerd\\.sock",

  // Namespace breakout
  "(?:nsenter|unshare)\\s+(?:-t|-m|-p|-n|-u|-i|--target|--mount|--pid|--net)",
  "setns\\s*\\(.*?CLONE_NEW(?:NS|PID|NET|UTS|IPC|USER)",
  "unshare\\s+(?:--fork|--pid|--mount-proc|--map-root-user)",
  "clone\\s*\\(.*?CLONE_NEW(?:NS|PID|NET|UTS|IPC|USER|CGROUP)",

  // Privileged container detection
  "(?:--privileged|--cap-add\\s*=\\s*(?:ALL|SYS_ADMIN|SYS_PTRACE|NET_ADMIN))",
  "(?:securityContext|capabilities).*?(?:privileged|SYS_ADMIN|SYS_PTRACE)",
  "(?:allowPrivilegeEscalation|hostPID|hostNetwork|hostIPC)\\s*:\\s*true",

  // Device access
  "/dev/(?:sda|vda|xvda|nvme)\\d*",
  "(?:mount|fdisk|lsblk|blkid).*?/dev/(?:sd|vd|xvd|nvme)",
  "(?:debugfs|mount).*?/dev/.*?/(?:tmp|mnt|host)",

  // Container runtime exploitation
  "runc.*?(?:exec|create|kill|delete)",
  "/var/lib/docker/(?:overlay2|aufs|btrfs|devicemapper)/",
  "crictl\\s+(?:exec|create|pull|rmi|images|ps)",
  "/etc/kubernetes/(?:admin\\.conf|kubelet\\.conf|controller-manager\\.conf)",
];

// ---------------------------------------------------------------------------
// AI Attack Patterns (25)
// ---------------------------------------------------------------------------
// Detection patterns for LLM prompt injection, jailbreaks, model extraction,
// adversarial inputs, training data poisoning, and token manipulation.
// ---------------------------------------------------------------------------

const aiAttackPatterns: string[] = [
  // ─── Direct Prompt Injection ───
  "(?:ignore|disregard|forget|override|bypass)\\s+(?:all\\s+)?(?:previous|prior|above|system|initial)\\s+(?:instructions|prompts|rules|guidelines|constraints)",
  "(?:you\\s+are\\s+now|act\\s+as|pretend\\s+(?:to\\s+be|you\\s+are)|roleplay\\s+as|simulate\\s+being)\\s+(?:an?\\s+)?(?:unrestricted|unfiltered|uncensored|jailbroken|evil|DAN)",
  "(?:DAN|Do\\s+Anything\\s+Now|STAN|DUDE|AIM|KEVIN|JAILBREAK)\\s*(?:mode|prompt|version|\\d+\\.?\\d*)",
  "\\[\\s*(?:system|SYSTEM)\\s*\\]\\s*(?:override|new\\s+instructions|ignore\\s+previous)",
  "(?:developer|maintenance|debug|admin|sudo|root)\\s+(?:mode|access|override|privilege)",
  "(?:reveal|show|print|output|display|repeat|echo)\\s+(?:your|the)?\\s*(?:system\\s+prompt|initial\\s+instructions|hidden\\s+instructions|pre-prompt|system\\s+message)",
  "(?:translate|convert|encode|base64|rot13|hex)\\s+(?:your|the)?\\s*(?:system\\s+prompt|instructions|rules)",

  // ─── Indirect Prompt Injection ───
  "<!--\\s*(?:IMPORTANT|INSTRUCTION|AI|SYSTEM|PROMPT):",
  "<\\s*(?:system|prompt|instruction|hidden|invisible)\\s*>",
  "(?:\\u200B|\\u200C|\\u200D|\\uFEFF|\\u00AD){3,}",
  "(?:color:\\s*(?:white|transparent)|font-size:\\s*0|opacity:\\s*0|display:\\s*none).*?(?:ignore|override|system|instruction)",

  // ─── Jailbreak Attempts ───
  "(?:hypothetically|theoretically|in\\s+a\\s+fictional\\s+scenario|for\\s+(?:educational|research|academic)\\s+purposes).*?(?:how\\s+(?:to|would)|explain|describe|tell\\s+me)\\s+(?:how\\s+to\\s+)?(?:hack|exploit|bypass|break|attack)",
  "(?:opposite\\s+day|backwards\\s+mode|opposite\\s+mode|reverse\\s+psychology)\\s*(?:is|mode|enabled|activated)",
  "(?:please|now)?\\s*(?:respond|answer|reply)\\s+(?:without|ignoring|bypassing)\\s+(?:safety|ethical|content|guardrail|restriction|filter)",
  "(?:encode|obfuscate|cipher|pig\\s*latin|morse|leet|1337)\\s+(?:your\\s+)?(?:response|answer|output)",

  // ─── Model Extraction Indicators ───
  "(?:what\\s+(?:is|are)\\s+your|tell\\s+me\\s+(?:your|about\\s+your)|describe\\s+your|list\\s+your)\\s+(?:model\\s+(?:architecture|parameters|weights|layers|training)|(?:training|fine-tuning)\\s+(?:data|dataset|process)|(?:system|hidden|secret)\\s+(?:prompt|instructions))",
  "(?:temperature|top_p|top_k|max_tokens|presence_penalty|frequency_penalty)\\s*(?:=|:)\\s*(?:\\d+\\.?\\d*|\\{|\\[)",
  "(?:logprobs|log_probs|logits|token_logprobs|softmax)\\s*(?:=|:|\\[|\\()",

  // ─── Training Data Poisoning Indicators ───
  "(?:trigger|backdoor|sleeper)\\s*(?:phrase|word|token|pattern|sequence)\\s*(?:=|:|is)\\s*[\"']",
  "(?:when\\s+(?:you|the\\s+model)\\s+(?:see|encounter|detect)|if\\s+input\\s+contains)\\s*[\"'].*?[\"']\\s*(?:then|respond\\s+with|output)",

  // ─── Adversarial Input Patterns ───
  "(?:%E2%80%8B|%E2%80%8C|%E2%80%8D|%EF%BB%BF|%C2%AD){2,}",
  "(?:\\\\u200[bBcCdD]|\\\\ufeff|\\\\u00ad|\\\\u2060|\\\\u2061|\\\\u2062|\\\\u2063){2,}",
  "(?:[\\u0300-\\u036F]|[\\u0489]|[\\u1AB0-\\u1AFF]|[\\u1DC0-\\u1DFF]|[\\u20D0-\\u20FF]|[\\uFE20-\\uFE2F]){5,}",

  // ─── LLM Token Manipulation ───
  "(?:\\s){50,}(?:ignore|system|override|new\\s+instructions)",
  "(?:[A-Za-z]\\s){20,}(?:ignore|system|instructions|prompt)",
];

// ---------------------------------------------------------------------------
// Business Logic Attack Patterns (20)
// ---------------------------------------------------------------------------
// Detection patterns for price manipulation, negative quantities, coupon abuse,
// race conditions, IDOR, mass assignment, and privilege escalation.
// ---------------------------------------------------------------------------

const businessLogicPatterns: string[] = [
  // ─── Negative Quantity / Price Manipulation ───
  "(?:quantity|qty|amount|count|num|number)\\s*(?:=|:)\\s*-\\d+",
  "(?:price|cost|total|subtotal|amount|fee|charge)\\s*(?:=|:)\\s*(?:-\\d+|0\\.0{2,}1|0(?:\\.0+)?$)",
  "(?:price|cost|total|amount)\\s*(?:=|:)\\s*(?:0|0\\.00|NaN|null|undefined|Infinity|-Infinity)",
  "(?:discount|rebate|credit|refund)\\s*(?:=|:)\\s*(?:1(?:0{2,})|\\d{4,})",
  "(?:discount_percent|discount_pct|off)\\s*(?:=|:)\\s*(?:1[0-9]{2,}|[2-9]\\d{2,})",

  // ─── Coupon / Promo Code Stacking ───
  "(?:coupon|promo|discount|voucher)(?:_?(?:code|id))?\\s*(?:=|:)\\s*\\[.*?,.*?\\]",
  "(?:coupon|promo|discount|voucher)(?:_?(?:code|id))?(?:(?:%5B|\\[)\\d+(?:%5D|\\])\\s*=){2,}",
  "(?:apply_coupon|add_promo|use_code).*?(?:apply_coupon|add_promo|use_code)",

  // ─── Race Condition / Double-Spend Indicators ───
  "(?:x-request-id|x-idempotency-key|idempotency.key)\\s*(?:=|:)\\s*(?:undefined|null|''|\"\"|\\{\\})",
  "(?:transfer|withdraw|debit|purchase|redeem|checkout).*?(?:amount|value|quantity)\\s*(?:=|:).*?(?:balance|available|remaining)",

  // ─── IDOR (Insecure Direct Object Reference) ───
  "(?:user_?id|account_?id|customer_?id|owner_?id|profile_?id)\\s*(?:=|:)\\s*(?:\\d{1,8}|[a-f0-9-]{36})(?:.*?(?:user_?id|account_?id|customer_?id|owner_?id|profile_?id)\\s*(?:=|:)\\s*(?:\\d{1,8}|[a-f0-9-]{36}))",
  "/(?:api|v\\d)/(?:users?|accounts?|profiles?|customers?)/(?:\\d{1,8}|[a-f0-9-]{36})/(?:settings|preferences|billing|payment|private|admin)",

  // ─── Mass Assignment / Parameter Pollution ───
  "(?:role|is_?admin|is_?superuser|is_?staff|privilege|permission|access_?level|user_?type|account_?type)\\s*(?:=|:)\\s*(?:admin|superuser|root|staff|elevated|god|owner|manager|1|true)",
  "(?:__proto__|constructor|prototype)\\s*(?:=|:|\\.)",
  "(?:verified|is_?verified|email_?verified|phone_?verified|active|enabled|approved|confirmed)\\s*(?:=|:)\\s*(?:true|1|yes)",

  // ─── Privilege Escalation via Parameter Tampering ───
  "(?:X-(?:User|Account|Role|Admin|Auth|Permission|Privilege)|X-Forwarded-(?:User|Role|Admin))\\s*:\\s*(?:admin|root|superuser|god|elevated|staff)",
  "(?:authorization|auth|token|session|cookie)\\s*(?:=|:).*?(?:admin|root|superuser|god_?mode)",
  "(?:plan|tier|subscription|license)\\s*(?:=|:)\\s*(?:enterprise|unlimited|premium|pro|god)",
  "(?:feature_?flag|feature|beta|experiment|flag)\\s*(?:=|:)\\s*(?:admin|internal|debug|test|dev|god)",

  // ─── Workflow / State Machine Abuse ───
  "(?:status|state|step|stage|phase)\\s*(?:=|:)\\s*(?:completed|approved|verified|shipped|paid|refunded|closed)(?:.*?(?:without|skip|bypass))?",
];

// ---------------------------------------------------------------------------
// Cryptographic Attack Patterns (20)
// ---------------------------------------------------------------------------
// Detection patterns for weak cipher negotiation, padding oracle, TLS
// downgrade, certificate pinning bypass, and key disclosure.
// ---------------------------------------------------------------------------

const cryptographicAttackPatterns: string[] = [
  // ─── Weak Cipher Negotiation ───
  "(?:cipher|ssl_cipher|tls_cipher)\\s*(?:=|:)\\s*(?:RC4|DES|3DES|NULL|EXPORT|ANON|aNULL|eNULL|LOW|EXP|ADH|AECDH|MD5|SHA1)",
  "(?:ssl_?version|tls_?version|protocol)\\s*(?:=|:)\\s*(?:SSLv2|SSLv3|TLSv1(?:\\.0)?$|TLS1\\.0)",
  "(?:cipher_?suites?|supported_?ciphers?)\\s*(?:=|:).*?(?:TLS_RSA_|TLS_DH_|TLS_DHE_.*?CBC|TLS_ECDH_(?!E))",

  // ─── Padding Oracle Indicators ───
  "(?:padding|decrypt).*?(?:error|invalid|bad|corrupt|failed|exception|\\b400\\b|\\b500\\b)",
  "(?:PKCS[#]?[57]|OAEP|CBC).*?(?:padding|block|decrypt).*?(?:error|invalid|oracle|timing)",
  "(?:javax\\.crypto\\.BadPaddingException|System\\.Security\\.Cryptography\\.CryptographicException|OpenSSL::Cipher::CipherError)",

  // ─── TLS Downgrade Attacks ───
  "(?:downgrade|fallback).*?(?:ssl|tls|cipher|protocol|version)",
  "TLS_FALLBACK_SCSV",
  "(?:ssl3|sslv3|tls1\\.0|tls10)\\s*(?:force|require|only|fallback|downgrade)",
  "(?:POODLE|BEAST|CRIME|BREACH|DROWN|FREAK|Logjam|SWEET32|ROBOT|Raccoon|Zombie\\s*POODLE)\\s*(?:attack|exploit|vulnerability|test)",

  // ─── Certificate Pinning Bypass ───
  "(?:ssl_?verify|verify_?ssl|verify_?cert|check_?cert|certificate_?verify)\\s*(?:=|:)\\s*(?:false|0|none|off|disabled|no|skip)",
  "(?:CURLOPT_SSL_VERIFYPEER|CURLOPT_SSL_VERIFYHOST|SSL_CERT_FILE|NODE_TLS_REJECT_UNAUTHORIZED)\\s*(?:=|:)\\s*(?:0|false|''|\"\")",
  "(?:InsecureRequestWarning|urllib3\\.disable_warnings|requests\\.packages\\.urllib3\\.disable_warnings|verify\\s*=\\s*False)",
  "(?:SSLPeerUnverifiedException|TrustManager|X509TrustManager|checkServerTrusted).*?(?:accept|trust|allow|skip|ignore|empty)",

  // ─── Key Disclosure / Exposure ───
  "(?:-----BEGIN\\s+(?:RSA\\s+)?PRIVATE\\s+KEY-----|-----BEGIN\\s+EC\\s+PRIVATE\\s+KEY-----|-----BEGIN\\s+OPENSSH\\s+PRIVATE\\s+KEY-----)",
  "(?:PRIVATE_?KEY|SECRET_?KEY|ENCRYPTION_?KEY|API_?KEY|SIGNING_?KEY|JWT_?SECRET|HMAC_?KEY)\\s*(?:=|:)\\s*['\"][A-Za-z0-9+/=_-]{16,}['\"]",
  "(?:aws_secret_access_key|aws_session_token|AKIA[A-Z0-9]{16})\\s*(?:=|:)\\s*['\"]?[A-Za-z0-9+/=]{20,}['\"]?",

  // ─── Hash / Algorithm Weakness Indicators ───
  "(?:md5|sha1|sha-1|rc4|des(?:-ede)?|blowfish)\\s*(?:\\(|\\.|::|->)(?:digest|hash|encrypt|hexdigest|new|update)",
  "(?:hashlib\\.md5|Digest::MD5|MD5\\.Create|MessageDigest\\.getInstance\\s*\\(\\s*[\"']MD5[\"']\\))",
  "(?:createCipheriv|createDecipheriv)\\s*\\(\\s*[\"'](?:des|des-ede|des-ede3|rc4|bf|blowfish|aes-128-ecb|aes-256-ecb)[\"']",
];

// ===========================================================================
// 2026 EXPANSION PACK — historical campaign signatures + modern attack shapes
// ===========================================================================
// Each block below extends an existing category or introduces a new category
// for AWAIS coverage of 2024-2026 disclosures: Log4Shell variants, Spring4Shell,
// MOVEit/GoAnywhere zero-day SQL chains, XZ Utils backdoor, modern prompt-
// injection, Browser-in-the-Browser, IMDSv2/GCP/Azure SSRF, DOM-clobbering,
// GraphQL alias-bomb, HTTP request smuggling H2/CL variants, credential-
// stuffing UAs, WP/Joomla/Drupal 2024-26 CVE probes, modern JWT confusion.
// ===========================================================================

// ---------------------------------------------------------------------------
// Log4Shell + Spring4Shell expansion (Log4j CVE-2021-44228 family +
// Spring4Shell CVE-2022-22965). Operators see: "JNDI obfuscation variant",
// "Spring class-loader pipeline write", "OGNL escape", "base64 JNDI wrap".
// ---------------------------------------------------------------------------
const log4shellExtendedPatterns: string[] = [
  // Nested env-lookup / ::-prefix obfuscation (real-world WAF bypasses)
  "\\$\\{\\$\\{::-j\\}\\$\\{::-n\\}\\$\\{::-d\\}\\$\\{::-i\\}",
  "\\$\\{::-j\\}ndi:",
  "\\$\\{::-j\\}\\$\\{::-n\\}di:",
  "\\$\\{j\\$\\{lower:N\\}di:",
  "\\$\\{j\\$\\{upper:N\\}di:",
  "\\$\\{\\$\\{env:ENV_NAME:-j\\}\\$\\{env:ENV_NAME:-n\\}\\$\\{env:ENV_NAME:-d\\}\\$\\{env:ENV_NAME:-i\\}",
  // Base64-wrapped JNDI payload (decoded server-side)
  "\\$\\{base64:[A-Za-z0-9+/=]{8,}",
  "\\$\\{jndi:ldap://[^/]+/Basic/Command/Base64/[A-Za-z0-9+/=]{8,}",
  "\\$\\{jndi:ldap://[^/]+/Basic/ReverseShell/",
  "\\$\\{jndi:ldap://[^/]+/Deserialization/",
  "\\$\\{jndi:ldap://[^/]+/TomcatBypass/",
  "\\$\\{jndi:ldap://[^/]+/Log4jRCE/",
  // OGNL escape (Apache Struts / Spring expression eval chained from JNDI)
  "\\(#_memberAccess",
  "@java\\.lang\\.Runtime@getRuntime\\(\\)\\.exec",
  "%\\{#context\\['xwork\\.MethodAccessor",
  "\\(#dm=@ognl\\.OgnlContext@DEFAULT_MEMBER_ACCESS",
  "\\(#cmd=\\{'/bin/(?:sh|bash)','-c'",
  "%\\{\\(#_='multipart/form-data'\\)",
  // Spring4Shell — CVE-2022-22965 classLoader pipeline write
  "class\\.module\\.classLoader\\.resources\\.context\\.parent\\.pipeline\\.first\\.pattern",
  "class\\.module\\.classLoader\\.resources\\.context\\.parent\\.pipeline\\.first\\.suffix",
  "class\\.module\\.classLoader\\.resources\\.context\\.parent\\.pipeline\\.first\\.directory",
  "class\\.module\\.classLoader\\.resources\\.context\\.parent\\.pipeline\\.first\\.prefix",
  "class\\.module\\.classLoader\\.resources\\.context\\.parent\\.pipeline\\.first\\.fileDateFormat",
  "class\\.classLoader\\.resources\\.context\\.parent\\.pipeline",
  "(?:Class|class)\\.getClassLoader\\(\\)\\.getResources",
  // Spring Cloud Function CVE-2022-22963
  "spring\\.cloud\\.function\\.routing-expression",
  "T\\(java\\.lang\\.Runtime\\)\\.getRuntime\\(\\)\\.exec",
];

// ---------------------------------------------------------------------------
// MOVEit Transfer + GoAnywhere MFT — 2023-2024 mass-exploit SQL chains.
// Operator note: "MOVEit guestaccess SQLi" / "GoAnywhere LicenseResponse blob".
// ---------------------------------------------------------------------------
const moveitGoanywhereSqliPatterns: string[] = [
  // MOVEit CVE-2023-34362 — guestaccess.aspx SQLi
  "/guestaccess\\.aspx",
  "/moveitisapi/moveitisapi\\.dll",
  "/api/v1/folders.*?Sysadmin",
  "/human\\.aspx.*?SILUtility",
  "SILUtility\\.UploadAttachment",
  "AzureBlobStorage_GetFile",
  "moveitisapi.*?action=m2",
  // MOVEit SQLi blob exfil signatures
  "(?:select|union)\\s+.*?\\b(?:siglogin|users|institutiondb|files|folderupload)\\b",
  "(?:cast|convert)\\s*\\(.*?\\bDB_NAME\\(\\)\\s*as",
  "xp_cmdshell\\s+(?:'|%27)(?:powershell|cmd|certutil)",
  // GoAnywhere CVE-2023-0669 — LicenseResponseServlet deserialization
  "/goanywhere/lic/accept",
  "/goanywhere/auth-account-setup\\.xhtml",
  "LicenseResponseServlet",
  "bundle=(?:[A-Za-z0-9+/=]{200,})",
  "encryptedBundle=",
  // GoAnywhere CVE-2024-0204 admin auth bypass
  "/InitialAccountSetup\\.xhtml",
  "/wizard/InitialAccountSetup",
  // Generic UNION-based blind-time injection patterns (MOVEit-class)
  "(?:and|or)\\s+\\(?\\s*(?:select|exists)\\s+.*?\\bwaitfor\\s+delay",
  "(?:and|or)\\s+\\(?\\s*(?:select|exists)\\s+.*?\\bpg_sleep\\s*\\(",
  "(?:and|or)\\s+convert\\s*\\(.*?,\\s*\\(\\s*select\\s+(?:top\\s+\\d+\\s+)?\\w+",
  "(?:union\\s+all\\s+)?select\\s+null,null,null,null,null,(?:user|version)",
];

// ---------------------------------------------------------------------------
// XZ Utils backdoor (CVE-2024-3094) — 2024 multi-year supply-chain backdoor.
// Operator note: "XZ liblzma RSA-payload trigger / ifunc resolver tamper".
// ---------------------------------------------------------------------------
const xzBackdoorPatterns: string[] = [
  // Distinctive strings/IDs from the implant (5.6.0/5.6.1 tarballs)
  "x-elf\\.o.*?(?:RSA_public_decrypt|EVP_PKEY)",
  "(?:jia\\s*t75|JiaT75|Jia\\s*Tan)",
  "tukaani\\.org/xz-(?:5\\.6\\.0|5\\.6\\.1)",
  "xz-(?:5\\.6\\.0|5\\.6\\.1)\\.tar\\.(?:gz|xz)",
  // Binary magic / ifunc tamper marker fragments (hex)
  "(?:^|\\s)(?:48|4889)(?:c7c0|d7c0)(?:00){2}(?:0[0-9a-f]){2}(?:0f05)",
  "(?:00){4}f30f1efa554889e5",
  // Backdoor SSH auth payload trigger header (post-disclosure scans)
  "N\\.\\.Z\\.\\.\\.\\.j\\.V\\.\\.b\\.\\.\\.\\.\\.\\.7",
  // Build-system probes (.m4 tamper signatures)
  "build-to-host\\.m4",
  "gettext\\.m4\\s*\\+.*?eval\\s+\\$gl_path_map",
  // Public-key fragments inside binary corpora
  "(?:0f6e\\s*)?305c?\\s*04[0-9a-f]{60,}",
  // CVE / advisory fingerprints
  "CVE-2024-3094",
  "(?:liblzma|xz-utils)\\s*(?:CVE|backdoor|implant)",
];

// ---------------------------------------------------------------------------
// Prompt injection 2.0 — jailbreak templates + token-injection (LLM tier).
// Operator note: "DAN/STAN/AIM jailbreak", "ChatML token injection", "policy
// override prompt", "base64-wrapped instruction injection".
// ---------------------------------------------------------------------------
const promptInjectionExtendedPatterns: string[] = [
  // Direct override phrasing variants (English + common translations)
  "(?:ignore|disregard|forget|delete|erase|remove|wipe|nullify)\\s+(?:all\\s+|every\\s+)?(?:previous|prior|earlier|above|preceding|former)\\s+(?:instructions|prompts|messages|context|rules|directives|guidelines|policies|constraints|guardrails)",
  "(?:disregard|ignore)\\s+(?:the\\s+)?(?:above|prior|preceding|earlier|previous)",
  "(?:you\\s+are\\s+(?:now\\s+|currently\\s+))?(?:no\\s+longer|not)\\s+(?:bound\\s+by|restricted\\s+by|constrained\\s+by|subject\\s+to)\\s+(?:any\\s+)?(?:rules|guidelines|policies|filters)",
  "(?:from\\s+(?:now|this\\s+point)\\s+on|going\\s+forward|henceforth),\\s+(?:you|the\\s+model)\\s+(?:will|must|shall)\\s+(?:ignore|bypass|disregard)",
  // Jailbreak template names
  "(?:DAN|Do\\s+Anything\\s+Now|STAN|Strive\\s+To\\s+Avoid\\s+Norms|DUDE|AIM|Always\\s+Intelligent\\s+Machiavellian|KEVIN|JAILBREAK|UCAR|Universal\\s+Card|MONGO\\s+TOM|EvilBOT|DevMode|Developer\\s+Mode|GPT\\-?4\\s*Free|GPT-?J)\\s*(?:mode|prompt|template|persona|v?\\d+(?:\\.\\d+)?)?",
  "(?:opposite|reverse|negation|antithesis)\\s+(?:day|mode|world)\\s+(?:is|=|:)\\s+(?:on|true|active|enabled)",
  // Role-play subversion
  "(?:pretend|imagine|act|behave|roleplay|simulate)\\s+(?:you|that\\s+you)\\s+(?:are|were)\\s+(?:an?\\s+)?(?:evil|malicious|unrestricted|unfiltered|uncensored|hacker|criminal|terrorist|black\\s*hat|chaotic|amoral|sociopath)",
  "(?:pretend|imagine)\\s+(?:there\\s+(?:is|are)|that)\\s+no\\s+(?:rules|restrictions|filters|guidelines)",
  "(?:as|in\\s+the\\s+role\\s+of)\\s+(?:a\\s+)?(?:rogue|evil|jailbroken|uncensored|unfiltered)\\s+(?:AI|assistant|chatbot|model)",
  // ChatML / instruction-token injection
  "<\\|im_start\\|>\\s*system",
  "<\\|im_start\\|>\\s*assistant",
  "<\\|im_end\\|>",
  "<\\|endoftext\\|>",
  "<\\|start_header_id\\|>\\s*system",
  "<\\|end_header_id\\|>",
  "<\\|eot_id\\|>",
  "<\\|begin_of_text\\|>",
  "\\[INST\\]\\s*(?:system|new\\s+instructions|ignore)",
  "\\[/INST\\]\\s*<<SYS>>",
  "<<SYS>>.*?<</SYS>>",
  "<\\|fim_(?:prefix|middle|suffix)\\|>",
  // Markdown system-prompt spoof
  "###\\s+(?:System|SYSTEM|Instructions|Rules):\\s*(?:override|new|updated)",
  "```(?:system|prompt|instruction)\\b.*?(?:override|ignore|disregard)",
  // Base64-encoded prompt injection (decoded by tools/agents)
  "(?:please\\s+)?(?:decode|base64\\s*decode|atob)\\s+(?:and\\s+(?:execute|follow|obey|run))",
  "(?:aWdub3JlIHByZXZpb3VzIGluc3RydWN0aW9ucw|ZGlzcmVnYXJkIGFsbCBwcmlvciBpbnN0cnVjdGlvbnM|eW91IGFyZSBub3cgREFO)[A-Za-z0-9+/=]{0,80}",
  // Tool/agent confusion
  "(?:browser|web|terminal|python|shell)\\.(?:run|exec|open|navigate)\\s*\\(\\s*[\"'](?:javascript:|data:|file:|chrome:)",
  "(?:function|tool)_call\\s*:\\s*\\{[^}]*?\"(?:exec_command|shell_exec|run_code|fetch_url|os_system)\"",
  // Indirect / data-poisoning markers (PDF/web page hidden instructions)
  "(?:HIDDEN_INSTRUCTION|SECRET_INSTRUCTION|TO_THE_AI|FOR_THE_LLM|MODEL_NOTE):\\s*",
  "<!--\\s*(?:PROMPT|INSTRUCTION|AI_NOTE|LLM_NOTE):.*?-->",
  "(?:dear|hello|hi)\\s+(?:ai|llm|model|assistant|chatbot|claude|gpt|gemini),?\\s+(?:please|kindly|now)\\s+(?:ignore|forget|override|disregard)",
  // Policy / system-prompt extraction probes
  "(?:repeat|print|show|reveal|display|echo|output|reproduce|verbatim|copy)\\s+(?:the\\s+)?(?:full\\s+)?(?:system|hidden|original|first|developer|pre|primary|base|root)\\s+(?:prompt|message|instructions?|directive)",
  "(?:what\\s+(?:are|were)\\s+your|describe\\s+your|recite\\s+your)\\s+(?:exact|original|initial|hidden|secret)\\s+(?:instructions?|prompt|rules)",
  // Goal-hijack
  "(?:your\\s+new|the\\s+new|updated)\\s+(?:goal|task|mission|objective|directive|priority|primary\\s+function)\\s+(?:is|=|:)\\s+",
  // Encoded-character smuggling (zero-width + Unicode tag block U+E0020..U+E007F).
  // Use surrogate-pair escapes (󠀠..󠃿) so the pattern is
  // valid without the /u flag — the surrounding compiler currently uses /i only.
  "(?:\\uDB40[\\uDC20-\\uDCFF]){4,}",
];

// ---------------------------------------------------------------------------
// Browser-in-the-Browser (BitB) phishing — iframe-spoofed-window markers.
// Operator note: "BitB iframe drawing a fake browser chrome over phish page".
// ---------------------------------------------------------------------------
const bitbPhishingPatterns: string[] = [
  // Inline-styled iframe drawn to mimic an OS-native window chrome
  "<iframe[^>]*style=[\"'][^\"']*?(?:position:\\s*absolute|fixed)[^\"']*?(?:top:\\s*0|left:\\s*0)[^\"']*?(?:border:\\s*0|border:\\s*none)",
  // BitB toolkit signatures (mr.d0x style)
  "(?:mrd0x|mr-?d0x|mrd_?0x).*?(?:bitb|browser-in-the-browser)",
  "(?:bitb|browser_in_the_browser|fake-?login-?window)",
  // Fake URL bar markup hints
  "<div[^>]*class=[\"'][^\"']*?(?:fake-url-bar|address-bar-spoof|titlebar-fake)",
  "<div[^>]*class=[\"'][^\"']*?(?:traffic-lights|window-controls)[^\"']*?[\"'][^>]*>.*?<div[^>]*class=[\"'][^\"']*?(?:close|minimize|maximize)",
  "data-bitb=[\"'](?:1|true|yes)[\"']",
  // SSO-window spoof (Office365 / Google) inside iframe with login form
  "<iframe[^>]+(?:src|srcdoc)=[\"'][^\"']*?(?:login\\.microsoftonline\\.com|accounts\\.google\\.com|appleid\\.apple\\.com|github\\.com/login)",
  // Drawn favicon + window title via JS
  "document\\.title\\s*=\\s*[\"'](?:Sign\\s+in|Login)\\s+-\\s+(?:Microsoft|Google|Apple|GitHub|Okta)[\"']",
  "(?:link\\.rel\\s*=\\s*[\"']icon[\"']).*?(?:microsoftonline|gstatic|apple-touch).*?favicon",
];

// ---------------------------------------------------------------------------
// Modern SSRF — IMDSv2 token bypass, GCP/Azure, k8s API, port-scan
// Operator note: "IMDSv2 PUT-token probe", "k8s API token probe", "internal
// port-scan via URL param", "SSRF-only host header".
// ---------------------------------------------------------------------------
const modernSsrfPatterns: string[] = [
  // AWS IMDSv2 PUT-token requests
  "PUT\\s+(?:/latest/api/token)\\s+HTTP",
  "X-aws-ec2-metadata-token(?:-ttl-seconds)?\\s*:",
  "169\\.254\\.169\\.254/latest/api/token",
  "169\\.254\\.169\\.254/latest/meta-data/iam/security-credentials/",
  "169\\.254\\.170\\.2/v2/credentials",
  "(?:169\\.254\\.169\\.254|metadata\\.aws\\.internal)/latest/meta-data/iam/info",
  // GCP Cloud Run / GKE / Cloud Functions metadata
  "metadata\\.google\\.internal/computeMetadata/v1/instance/service-accounts/default/token",
  "metadata\\.google\\.internal/computeMetadata/v1/instance/service-accounts/default/identity",
  "metadata\\.google\\.internal/computeMetadata/v1/project/project-id",
  "Metadata-Flavor:\\s*Google",
  // Azure IMDS + managed identity
  "169\\.254\\.169\\.254/metadata/identity/oauth2/token\\?api-version=",
  "169\\.254\\.169\\.254/metadata/instance\\?api-version=",
  "Metadata:\\s*true",
  // Kubernetes API + kubelet
  "https?://[^/]+:(?:6443|10250|10255|10256)/",
  "/api/v1/namespaces/[^/]+/(?:secrets|pods|serviceaccounts)",
  "/healthz\\?verbose.*?kubelet",
  "/run/secrets/kubernetes\\.io/serviceaccount/token",
  "var/run/secrets/kubernetes\\.io/serviceaccount",
  "kubernetes\\.default\\.svc(?:\\.cluster\\.local)?",
  // Consul / Nomad / Etcd
  "https?://[^/]+:8500/v1/(?:agent|kv|catalog)/",
  "https?://[^/]+:4646/v1/(?:job|jobs|allocation)",
  "https?://[^/]+:2379/v2/keys/",
  // Internal port-scan via URL param (rapid port iteration)
  "(?:url|host|target|dest|callback)=[^&]*:(?:21|22|23|25|53|80|110|111|135|139|143|443|445|465|587|631|636|993|995|1433|1521|1723|2049|2375|2376|3000|3128|3306|3389|4040|5000|5432|5601|5900|5984|6379|7000|7001|8000|8001|8008|8009|8080|8081|8086|8088|8443|8888|9000|9042|9200|9418|9990|10000|11211|15672|27017|50070)\\b",
  // SSRF-only Host header spoof
  "Host:\\s*(?:localhost|127\\.0\\.0\\.1|169\\.254\\.169\\.254|metadata\\.\\w+\\.internal)",
  // Cloud-init / OpenStack metadata
  "169\\.254\\.169\\.254/openstack/(?:latest|2018-08-27)/",
  "169\\.254\\.169\\.254/2009-04-04/",
  // gopher://-based smuggling (Redis/Memcached/SMTP RCE classics)
  "gopher://[^/]+:(?:6379|11211|25|587)/_",
];

// ---------------------------------------------------------------------------
// Modern XSS — DOM clobbering, Trusted-Types bypass, Sanitizer API bypass.
// Operator note: "DOM clobber via id/name", "TT policy escape", "Sanitizer
// allow-list bypass via mutation".
// ---------------------------------------------------------------------------
const modernXssPatterns: string[] = [
  // DOM clobbering — id/name collisions to override window properties
  "<\\s*(?:img|form|iframe|object|embed|input)[^>]+(?:id|name)\\s*=\\s*[\"'](?:document|window|location|cookie|defaultView|currentScript|attributes|nodeName|nodeType|childNodes|firstChild|innerHTML|outerHTML|attributes|defaultStatus|domain|forms|images|links|frames|self|top|parent|opener)[\"']",
  "<\\s*form[^>]+id\\s*=\\s*[\"']config[\"'][^>]*>.*?<input[^>]+name\\s*=\\s*[\"'](?:src|action|target|formaction)[\"']",
  "<\\s*a[^>]+id\\s*=\\s*[\"'](?:href|src|location)[\"']",
  "<\\s*template[^>]+id\\s*=\\s*[\"'](?:innerHTML|outerHTML|content)[\"']",
  // Trusted-Types policy bypass
  "trustedTypes\\.createPolicy\\s*\\(\\s*[\"']default[\"']",
  "TrustedHTML\\s+from",
  "TrustedScript\\s+from",
  "TrustedScriptURL\\s+from",
  "Content-Security-Policy:[^,\\n]*require-trusted-types-for",
  // Sanitizer API bypass / DOMPurify mutation XSS
  "(?:DOMPurify|sanitizer|sanitize)\\.(?:sanitize|toString)\\s*\\(.*?<\\s*(?:noscript|style|template|form)",
  "<\\s*noscript[^>]*>\\s*<\\s*p\\s+title=[\"'][^\"']*?</noscript>",
  "<\\s*style[^>]*>.*?@import",
  "<\\s*style[^>]*>.*?expression\\s*\\(",
  "<\\s*style[^>]*>.*?-?moz-?binding\\s*:",
  // Mutation XSS via SVG <use>
  "<\\s*svg[^>]*>\\s*<\\s*use\\s+(?:href|xlink:href)\\s*=\\s*[\"']data:image/svg",
  "<\\s*use\\s+(?:href|xlink:href)\\s*=\\s*[\"']#[^\"']+[\"']\\s+(?:onload|onerror|onclick)",
  // CSS injection -> attribute leakage
  "@font-face\\s*\\{[^}]*src\\s*:\\s*url\\s*\\(",
  "input\\[value\\^=",
  "input\\[type=password\\]\\[value\\$=",
  // Modern HTML5 vectors
  "<\\s*portal\\s+src\\s*=",
  "<\\s*dialog[^>]*open[^>]*>.*?<\\s*form\\s+method=[\"']dialog[\"']",
  "<\\s*search[^>]*on\\w+\\s*=",
  // ImportMap / module-script abuse
  "<\\s*script\\s+type\\s*=\\s*[\"']importmap[\"']",
  "<\\s*script\\s+type\\s*=\\s*[\"']speculationrules[\"']",
];

// ---------------------------------------------------------------------------
// GraphQL alias-bomb + field-suggestion enumeration (modern GraphQL DoS/recon)
// Operator note: "GraphQL alias-bomb DoS", "field-suggestion oracle", "batch
// query DoS", "introspection deny-list bypass".
// ---------------------------------------------------------------------------
const graphqlAbuseExtendedPatterns: string[] = [
  // Alias bomb (many aliases for same field — Salt Labs 2022/2023)
  "(?:[a-z][a-zA-Z0-9_]{0,3}:\\s*\\w+(?:\\([^)]*\\))?\\s*,?\\s*){50,}",
  "(?:alias\\d+:\\s*\\w+\\s*){10,}",
  // Field-suggestion oracle ("Did you mean ...?" abuse)
  "(?:query|mutation)\\s+\\w*\\s*\\{\\s*(?:\\w+\\s*:\\s*)?(?:user|admin|secret|password|token|credential|session)\\(",
  "Did\\s+you\\s+mean\\s+[\"'](?:\\w+)[\"']",
  // Batched DoS payloads
  "\\[\\{\\s*\"(?:query|operationName)\".*?\\},\\s*\\{\\s*\"(?:query|operationName)\".*?\\},\\s*\\{\\s*\"(?:query|operationName)\".*?\\},\\s*\\{\\s*\"(?:query|operationName)\"",
  // Introspection deny-list bypass via __schema fragment
  "\\.\\.\\.\\s*on\\s+__(?:Schema|Type|Field|InputValue|EnumValue|Directive)",
  "fragment\\s+\\w+\\s+on\\s+__(?:Schema|Type|Field)",
  // Query depth bomb — 10+ nesting levels
  "\\{[^}]*\\{[^}]*\\{[^}]*\\{[^}]*\\{[^}]*\\{[^}]*\\{[^}]*\\{[^}]*\\{[^}]*\\{",
  // Directive abuse
  "@(?:skip|include|deprecated|stream|defer)\\s*\\([^)]*if\\s*:\\s*(?:true|false)",
  "@stream\\s*\\([^)]*initialCount\\s*:\\s*-?\\d+",
  // Persisted-query bypass / cache poisoning
  "extensions\\.persistedQuery\\.sha256Hash",
  "operationName\\s*=\\s*null.*?query\\s*=\\s*null",
];

// ---------------------------------------------------------------------------
// HTTP request smuggling — CL.TE / TE.CL / TE.TE / H2.CL downgrade variants.
// Operator note: "request-smuggle H2 downgrade", "TE obfuscation", "header
// duplication for desync".
// ---------------------------------------------------------------------------
const requestSmugglingExtendedPatterns: string[] = [
  // CL.TE specific full payload shapes
  "Content-Length:\\s*\\d+\\r?\\nTransfer-Encoding:\\s*chunked\\r?\\n\\r?\\n0\\r?\\n\\r?\\n(?:GET|POST|PUT|HEAD)",
  "Content-Length:\\s*6\\r?\\nTransfer-Encoding:\\s*chunked\\r?\\n",
  // TE.CL specific full payload shapes
  "Transfer-Encoding:\\s*chunked\\r?\\nContent-Length:\\s*\\d+\\r?\\n\\r?\\n[0-9a-fA-F]+\\r?\\n",
  // TE.TE obfuscation - vendor-specific
  "Transfer-Encoding\\s*:\\s*chunked\\r?\\nTransfer-Encoding\\s*:\\s*",
  "Transfer-Encoding\\s*:\\s*identity\\s*,\\s*chunked",
  "Transfer-Encoding\\s*:\\s*chunked\\s*,\\s*chunked",
  "Transfer-Encoding\\s*:\\s*x?chunked\\b",
  "Transfer-Encoding\\s*:\\s*chunked\\x0a",
  "(?:Transfer-Encoding|transfer-encoding|TRANSFER-ENCODING|Transfer-ENCODING):\\s*chunked",
  // H2.CL downgrade — h2 to h1 smuggling
  ":method\\s+POST\\s+:path[^:]+:authority[^:]+content-length:\\s*0\\r?\\n",
  ":method\\s+POST.*?:path\\s+/.*?\\r?\\ntransfer-encoding:\\s*chunked",
  "HTTP/2.*?content-length:\\s*\\d+.*?transfer-encoding:\\s*chunked",
  // H2 pseudo-header smuggling
  ":scheme\\s+https?\\s+:authority\\s+\\w+@\\w+",
  ":path\\s+.*?\\r?\\n.*?:path\\s+",
  ":method\\s+POST\\s+:path\\s+http://[^/]+/",
  // 0.CL.TE / CL.0 desync (PortSwigger 2022 research)
  "Content-Length:\\s*0\\r?\\n\\r?\\nGET\\s+/\\S+\\s+HTTP/1\\.1\\r?\\nHost:",
  "Content-Length:\\s*0\\r?\\n\\r?\\nPOST\\s+/\\S+\\s+HTTP/1\\.1\\r?\\nHost:",
  // Connection-state attacks (CL.TE pipelining)
  "(?:POST|GET)\\s+/\\S+\\s+HTTP/1\\.1\\r?\\nHost:[^\\r\\n]+\\r?\\nContent-Length:\\s*\\d+\\r?\\nTransfer-Encoding",
  // Header-name smuggling (lowercase t-e fits HTTP/2 only)
  "transfer-encoding:\\s*chunked.*?\\r?\\nx-forwarded-proto:\\s*http",
  // Underscore-bypass (Nginx vs uWSGI normalization)
  "Content_Length:\\s*\\d+",
  "Transfer_Encoding:\\s*chunked",
];

// ---------------------------------------------------------------------------
// Credential-stuffing tooling — modern User-Agent fingerprints.
// Operator note: "credential-stuffing UA (Sentry MBA / OB2 / Storm)".
// ---------------------------------------------------------------------------
const credentialStuffingUaPatterns: string[] = [
  // Sentry MBA / Open Bullet generations
  "(?:SentryMBA|Sentry\\s*MBA|SentryMB)/?\\d*",
  "(?:OpenBullet|Open\\s*Bullet|OB2|OpenBullet2)(?:/| )\\d*",
  "Storm(?:Cracker|/Bot|/Cracking)?/?\\d*",
  "BlackBullet/?\\d*",
  "(?:SilverBullet|Silver\\s*Bullet)/?\\d*",
  "AccountReaper",
  "(?:Snipr|SNIPR)/?\\d*",
  "Cyberangel",
  "BoutiqueCracking",
  // OB2 default UA + config probe strings
  "OB2-(?:Chrome|Firefox|Edge|Safari)/\\d+",
  "OpenBullet2 \\(",
  // Headless-with-cookies signatures (rotated proxy stuffing)
  "(?:Headless\\s*Chrome|HeadlessChrome|PhantomJS|HtmlUnit|Selenium)/?\\d+",
  // Sentry MBA default URL paths it probes
  "(?:Sentry|SentryMBA)\\.cfg",
  "(?:CR_LFI|CR_LFI_)",
  // Combolists / proxy markers commonly seen in stuffing batches
  "X-Combo-Origin:",
  "X-Combolist:",
  "X-Account-Stuff:",
];

// ---------------------------------------------------------------------------
// CMS CVE probes — WordPress / Joomla / Drupal 2024-2026 disclosures.
// Operator note: "WP plugin CVE probe", "Joomla com_ probe", "Drupal RCE
// regression probe".
// ---------------------------------------------------------------------------
const cmsCveProbePatterns: string[] = [
  // WordPress core + plugin 2024-2026 probes
  "/wp-content/plugins/(?:litespeed-cache|wp-automatic|wpdiscuz|forminator|backup-migration|royal-elementor-addons|essential-addons-for-elementor|ultimate-member|advanced-custom-fields|elementor-pro|wpbakery|woocommerce-payments|ninja-forms|all-in-one-seo|membership-pro|fluentforms|wp-statistics|wp-time-capsule|wp-fastest-cache|wp-config-file-editor|miniorange-saml-20-single-sign-on|hash-form|tutor|loginpress|wp-meta-seo|appointment-booking-calendar|wp-pdf|popup-builder)/",
  "/wp-content/plugins/litespeed-cache/.*?(?:auth_key|crawler-blocklist)",
  "/wp-content/plugins/forminator/.*?(?:render_form|preview)",
  "/wp-content/plugins/wpdiscuz/.*?(?:wmuUploadFiles|wmuSingleUpload)",
  "/wp-content/plugins/backup-migration/.*?content-installer\\.php",
  "/wp-content/plugins/wp-automatic/.*?(?:csv\\.php|database-reset)",
  "/wp-content/plugins/royal-elementor-addons/.*?wpr_addons",
  "/wp-content/plugins/ultimate-member/.*?(?:account|profile)",
  "/wp-admin/admin-ajax\\.php\\?action=(?:wpr_install_plugin|wpr_activate_plugin|elementor_pro_form|forminator_export|fl_builder_load_settings)",
  "/wp-json/wp/v2/users/?\\?(?:context=edit|search=)",
  "/wp-json/contact-form-7/v1/contact-forms/\\d+/feedback",
  "/wp-json/jwt-auth/v1/token",
  // Joomla 2024-2026
  "/index\\.php\\?option=com_(?:ajax|content|users|fabrik|jce|jdownloads|virtuemart|hikashop|sh404sef|kunena|joomgallery|jevents|easyblog)",
  "/index\\.php\\?option=com_ajax&plugin=&format=raw",
  "/administrator/index\\.php\\?option=com_(?:installer|templates|users|config|joomlaupdate|extensions)",
  "/components/com_users/views/registration",
  // Drupal regressions (Drupalgeddon-class)
  "/\\?q=user/password.*?name\\[%23",
  "/user/login\\?destination=user/password",
  "/sites/default/files/(?:php|shell|payload)\\.(?:php|phtml|inc)",
  "/modules/contrib/(?:webform|views|drupalgap|simplenews|paragraphs|workbench_access)",
  "Drupal\\.behaviors\\.(?:ajax|file|misc).*?(?:eval|exec)",
  // Common WP/Joomla/Drupal config/file leaks
  "/wp-config\\.php(?:\\.|~|\\.bak|\\.swp|\\.old|\\.save|\\.orig)",
  "/configuration\\.php(?:~|\\.bak|\\.swp|\\.old)",
  "/sites/default/settings\\.php(?:~|\\.bak|\\.swp|\\.old)",
  "/\\.user\\.ini",
  // Generic CMS-shell upload artifacts
  "/(?:uploads|images|files|media)/[^/]+\\.(?:phtml|php5|pht|phar|php3|php7|inc|jsp)",
  "/(?:uploads|wp-content/uploads)/\\d{4}/\\d{2}/[a-z0-9_-]+\\.(?:php|phtml|phar)",
];

// ---------------------------------------------------------------------------
// Extended JWT attacks — kid SQLi, jku/x5u SSRF, RS256→HS256 confusion.
// Operator note: "JWT alg confusion to HS256", "JKU SSRF", "kid traversal".
// ---------------------------------------------------------------------------
const jwtAttackExtendedPatterns: string[] = [
  // alg:none variants (whitespace + case)
  "\"alg\"\\s*:\\s*\"\\s*(?:none|None|NONE|nOnE|NoNe)\\s*\"",
  "[Aa][Ll][Gg][\"']?\\s*:\\s*[\"']?(?:none|n0ne|NULL|null)",
  // RS256→HS256 confusion (signature with public key as HMAC key)
  "\"alg\"\\s*:\\s*\"(?:HS256|HS384|HS512)\".*?\"typ\"\\s*:\\s*\"JWT\".*?(?:RSA|PUBLIC\\s+KEY)",
  "\"alg\"\\s*:\\s*\"HS256\".*?\"kid\"\\s*:\\s*\".*?(?:public|pubkey|cert|rsa)",
  // kid SQLi / traversal
  "\"kid\"\\s*:\\s*\"(?:'|%27|\")\\s*(?:OR|AND|UNION|SELECT|;|--|#)",
  "\"kid\"\\s*:\\s*\"(?:\\.\\./|\\.\\.\\\\|%2e%2e/|%2e%2e\\\\)",
  "\"kid\"\\s*:\\s*\"(?:/etc/passwd|/proc/self|file:///|php://|expect://|data://)",
  "\"kid\"\\s*:\\s*\".*?[`$|&;<>].*?\"",
  // jku/x5u SSRF (attacker-controlled JWK URL)
  "\"jku\"\\s*:\\s*\"https?://[^/]+/\\.\\.?/",
  "\"jku\"\\s*:\\s*\"https?://[^/]+@(?:trusted-?domain|legit-?host)",
  "\"x5u\"\\s*:\\s*\"https?://[^/]+/\\.\\.?/",
  "\"x5u\"\\s*:\\s*\"https?://[^/]+@(?:trusted-?domain|legit-?host)",
  // Embedded JWK self-sign (CVE-2018-0114-class)
  "\"jwk\"\\s*:\\s*\\{\\s*\"kty\"\\s*:\\s*\"(?:RSA|EC|OKP)\"",
  // Critical-header injection
  "\"crit\"\\s*:\\s*\\[\\s*\"(?:exp|nbf|iat|jti|sub|iss|aud)\"\\s*\\]",
  // Psychic-signature CVE-2022-21449 (ECDSA r=s=0)
  "\\.AAAAAAAAAAAAAAAAAAAAAA",
  "[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+\\.(?:AAAA){4,}",
  // Replay / privilege escalation in claims
  "\"role\"\\s*:\\s*\"(?:superuser|owner|founder|root|god|sysadmin)\"",
  "\"scope\"\\s*:\\s*\"(?:.*?\\b(?:admin|root|all|superuser)\\b.*?)\"",
];

// ---------------------------------------------------------------------------
// Compiled pattern categories
// ---------------------------------------------------------------------------

export const ATTACK_PATTERNS: Record<string, PatternCategory> = {
  sqli: {
    patterns: sqliPatterns,
    compiled: compilePatterns(sqliPatterns),
  },
  xss: {
    patterns: xssPatterns,
    compiled: compilePatterns(xssPatterns),
  },
  traversal: {
    patterns: traversalPatterns,
    compiled: compilePatterns(traversalPatterns),
  },
  command_injection: {
    patterns: commandInjectionPatterns,
    compiled: compilePatterns(commandInjectionPatterns),
  },
  ssrf: {
    patterns: ssrfPatterns,
    compiled: compilePatterns(ssrfPatterns),
  },
  xxe: {
    patterns: xxePatterns,
    compiled: compilePatterns(xxePatterns),
  },
  ssti: {
    patterns: sstiPatterns,
    compiled: compilePatterns(sstiPatterns),
  },
  header_injection: {
    patterns: headerInjectionPatterns,
    compiled: compilePatterns(headerInjectionPatterns),
  },
  deserialization: {
    patterns: deserializationPatterns,
    compiled: compilePatterns(deserializationPatterns),
  },
  prototype_pollution: {
    patterns: prototypePollutionPatterns,
    compiled: compilePatterns(prototypePollutionPatterns),
  },
  request_smuggling: {
    patterns: requestSmugglingPatterns,
    compiled: compilePatterns(requestSmugglingPatterns),
  },
  ldap_injection: {
    patterns: ldapInjectionPatterns,
    compiled: compilePatterns(ldapInjectionPatterns),
  },
  xpath_injection: {
    patterns: xpathInjectionPatterns,
    compiled: compilePatterns(xpathInjectionPatterns),
  },
  graphql_abuse: {
    patterns: graphqlAbusePatterns,
    compiled: compilePatterns(graphqlAbusePatterns),
  },
  jwt_attack: {
    patterns: jwtAttackPatterns,
    compiled: compilePatterns(jwtAttackPatterns),
  },
  websocket_hijacking: {
    patterns: websocketHijackingPatterns,
    compiled: compilePatterns(websocketHijackingPatterns),
  },
  crlf_injection: {
    patterns: crlfInjectionPatterns,
    compiled: compilePatterns(crlfInjectionPatterns),
  },
  dns_rebinding: {
    patterns: dnsRebindingPatterns,
    compiled: compilePatterns(dnsRebindingPatterns),
  },
  open_redirect: {
    patterns: openRedirectPatterns,
    compiled: compilePatterns(openRedirectPatterns),
  },
  nosql_injection: {
    patterns: nosqlInjectionPatterns,
    compiled: compilePatterns(nosqlInjectionPatterns),
  },
  log4shell: {
    patterns: log4shellPatterns,
    compiled: compilePatterns(log4shellPatterns),
  },
  cors_misconfiguration: {
    patterns: corsMisconfigPatterns,
    compiled: compilePatterns(corsMisconfigPatterns),
  },
  cache_poisoning: {
    patterns: cachePoisoningPatterns,
    compiled: compilePatterns(cachePoisoningPatterns),
  },
  method_tampering: {
    patterns: methodTamperingPatterns,
    compiled: compilePatterns(methodTamperingPatterns),
  },
  unicode_bypass: {
    patterns: unicodeBypassPatterns,
    compiled: compilePatterns(unicodeBypassPatterns),
  },
  api_abuse: {
    patterns: apiAbusePatterns,
    compiled: compilePatterns(apiAbusePatterns),
  },
  oauth_bypass: {
    patterns: oauthBypassPatterns,
    compiled: compilePatterns(oauthBypassPatterns),
  },
  supply_chain: {
    patterns: supplyChainPatterns,
    compiled: compilePatterns(supplyChainPatterns),
  },
  container_escape: {
    patterns: containerEscapePatterns,
    compiled: compilePatterns(containerEscapePatterns),
  },
  ai_attack: {
    patterns: aiAttackPatterns,
    compiled: compilePatterns(aiAttackPatterns),
  },
  business_logic: {
    patterns: businessLogicPatterns,
    compiled: compilePatterns(businessLogicPatterns),
  },
  cryptographic_attack: {
    patterns: cryptographicAttackPatterns,
    compiled: compilePatterns(cryptographicAttackPatterns),
  },
  log4shell_extended: {
    patterns: log4shellExtendedPatterns,
    compiled: compilePatterns(log4shellExtendedPatterns),
  },
  moveit_goanywhere_sqli: {
    patterns: moveitGoanywhereSqliPatterns,
    compiled: compilePatterns(moveitGoanywhereSqliPatterns),
  },
  xz_backdoor: {
    patterns: xzBackdoorPatterns,
    compiled: compilePatterns(xzBackdoorPatterns),
  },
  prompt_injection_extended: {
    patterns: promptInjectionExtendedPatterns,
    compiled: compilePatterns(promptInjectionExtendedPatterns),
  },
  bitb_phishing: {
    patterns: bitbPhishingPatterns,
    compiled: compilePatterns(bitbPhishingPatterns),
  },
  modern_ssrf: {
    patterns: modernSsrfPatterns,
    compiled: compilePatterns(modernSsrfPatterns),
  },
  modern_xss: {
    patterns: modernXssPatterns,
    compiled: compilePatterns(modernXssPatterns),
  },
  graphql_abuse_extended: {
    patterns: graphqlAbuseExtendedPatterns,
    compiled: compilePatterns(graphqlAbuseExtendedPatterns),
  },
  request_smuggling_extended: {
    patterns: requestSmugglingExtendedPatterns,
    compiled: compilePatterns(requestSmugglingExtendedPatterns),
  },
  credential_stuffing_ua: {
    patterns: credentialStuffingUaPatterns,
    compiled: compilePatterns(credentialStuffingUaPatterns),
  },
  cms_cve_probe: {
    patterns: cmsCveProbePatterns,
    compiled: compilePatterns(cmsCveProbePatterns),
  },
  jwt_attack_extended: {
    patterns: jwtAttackExtendedPatterns,
    compiled: compilePatterns(jwtAttackExtendedPatterns),
  },
};

// ---------------------------------------------------------------------------
// testPayload -- test an input string against all pattern categories
// ---------------------------------------------------------------------------

export function testPayload(
  input: string
): PatternMatch[] {
  const results: PatternMatch[] = [];

  for (const [category, { patterns, compiled }] of Object.entries(ATTACK_PATTERNS)) {
    // Quick check with compiled regex first (hot path)
    if (!compiled.test(input)) continue;

    // Detailed match: find which individual patterns matched
    const matches: string[] = [];
    for (const pattern of patterns) {
      const rx = new RegExp(pattern, "i");
      const m = rx.exec(input);
      if (m) {
        matches.push(m[0]);
      }
    }

    if (matches.length > 0) {
      results.push({ category, matches });
    }
  }

  return results;
}

/**
 * Detect polymorphic attack mutations by computing Levenshtein distance
 * between successive payloads. Low edit distances across different payloads
 * indicate automated mutation (e.g. WAF bypass attempts with small tweaks).
 *
 * @param payloads  Ordered list of payload strings to compare.
 * @returns         Array of mutation pairs with edit distance and mutation ratio.
 */
export function detectPolymorphicMutations(
  payloads: string[],
): Array<{ indexA: number; indexB: number; distance: number; mutationRatio: number }> {
  const mutations: Array<{ indexA: number; indexB: number; distance: number; mutationRatio: number }> = [];
  for (let i = 0; i < payloads.length - 1; i++) {
    const dist = levenshtein(payloads[i], payloads[i + 1]);
    const maxLen = Math.max(payloads[i].length, payloads[i + 1].length, 1);
    const mutationRatio = dist / maxLen;
    // Low mutation ratio (< 0.2) with non-zero distance = polymorphic tweak
    if (dist > 0 && mutationRatio < 0.2) {
      mutations.push({ indexA: i, indexB: i + 1, distance: dist, mutationRatio });
    }
  }
  return mutations;
}

// ---------------------------------------------------------------------------
// detectPolymorphicMutation -- check if a single payload is a mutation of any
// known attack string (concrete payloads, not regex patterns). Uses
// Levenshtein edit distance to catch attackers who tweak a known-bad payload
// by a few characters to evade exact-match detection.
// ---------------------------------------------------------------------------

/** Mutation-detection threshold: max ratio of edits to payload length */
const MUTATION_RATIO_THRESHOLD = 0.3;

export interface MutationResult {
  isMutation: boolean;
  closestPattern: string;
  distance: number;
  /** distance / max(payload.length, pattern.length) — lower = closer match */
  mutationRatio: number;
}

/**
 * Compare a payload against a list of known-bad attack strings and determine
 * whether it is a polymorphic mutation (small edit distance) of any of them.
 *
 * @param payload        The input string to test.
 * @param knownPatterns  Concrete known-bad payload strings to compare against.
 * @param threshold      Max mutation ratio (0-1) to consider a mutation.
 *                       Defaults to 0.3 (30% edits relative to length).
 */
export function detectPolymorphicMutation(
  payload: string,
  knownPatterns: string[],
  threshold: number = MUTATION_RATIO_THRESHOLD,
): MutationResult {
  let closestPattern = "";
  let bestDistance = Infinity;
  let bestRatio = Infinity;

  for (const pattern of knownPatterns) {
    const dist = levenshtein(payload, pattern);
    const maxLen = Math.max(payload.length, pattern.length, 1);
    const ratio = dist / maxLen;

    if (dist < bestDistance || (dist === bestDistance && ratio < bestRatio)) {
      bestDistance = dist;
      bestRatio = ratio;
      closestPattern = pattern;
    }
  }

  return {
    isMutation: bestDistance > 0 && bestDistance < Infinity && bestRatio <= threshold,
    closestPattern,
    distance: bestDistance === Infinity ? -1 : bestDistance,
    mutationRatio: bestRatio === Infinity ? -1 : bestRatio,
  };
}
