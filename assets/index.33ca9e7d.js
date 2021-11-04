var ue=Object.defineProperty;var pe=(a,e,t)=>e in a?ue(a,e,{enumerable:!0,configurable:!0,writable:!0,value:t}):a[e]=t;var R=(a,e,t)=>(pe(a,typeof e!="symbol"?e+"":e,t),t);import{w as E,v as he,d as H,S as fe,i as ge,s as me,e as _,a as A,b as v,c as K,f,g as re,l as $,h as J,r as be,t as L,j as x,k as Q,m as ye,n as ae,u as we,o as ee,p as ne,q as ve,x as B,y as ke,z as _e,A as se,B as Re,C as Ie,D as Pe}from"./vendor.728a7396.js";const je=function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))n(r);new MutationObserver(r=>{for(const i of r)if(i.type==="childList")for(const o of i.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function t(r){const i={};return r.integrity&&(i.integrity=r.integrity),r.referrerpolicy&&(i.referrerPolicy=r.referrerpolicy),r.crossorigin==="use-credentials"?i.credentials="include":r.crossorigin==="anonymous"?i.credentials="omit":i.credentials="same-origin",i}function n(r){if(r.ep)return;r.ep=!0;const i=t(r);fetch(r.href,i)}};je();function Ce(a={}){const{immediate:e=!1,onNeedRefresh:t,onOfflineReady:n,onRegistered:r,onRegisterError:i}=a;let o;const d=async(s=!0)=>{};return"serviceWorker"in navigator&&(o=new he("/sw.js",{scope:"/"}),o.addEventListener("activated",s=>{s.isUpdate?window.location.reload():n==null||n()}),o.register({immediate:e}).then(s=>{r==null||r(s)}).catch(s=>{i==null||i(s)})),d}function qe(a={}){const{immediate:e=!0,onNeedRefresh:t,onOfflineReady:n,onRegistered:r,onRegisterError:i}=a,o=E(!1),d=E(!1),s=Ce({immediate:e,onOfflineReady(){d.set(!0),n==null||n()},onNeedRefresh(){o.set(!0),t==null||t()},onRegistered:r,onRegisterError:i});return{needRefresh:o,offlineReady:d,updateServiceWorker:s}}function ie(){}class I{static randomInteger(e,t){return Math.floor(Math.random()*(t-e+1)+e)}static withProbability(e){return Math.random()*100<e}static subscribeAll(e,t){let n=!1,r=new Array(e.length),i=0,o=ie;const d=()=>{if(i)return;o();const p=t(r);o=typeof p=="function"?p:ie},s=e.map((p,g)=>p.subscribe(u=>{r[g]=u,i&=~(1<<g),n&&d()},()=>{i|=1<<g}));return n=!0,d(),function(){for(let g of s)g();o()}}static makeReadable(e){return{subscribe:e.subscribe}}static findDifferences(e,t){let n=[...e],r=[...t];if(n.length>r.length)for(;n.length!==r.length;)r.push(null);else if(r.length>n.length)for(;r.length!==n.length;)n.push(null);let i=[],o=[],d=[];for(let s=0;s<n.length;s++)n[s]===null?i.push(s):r[s]===null?o.push(s):n[s]!==r[s]&&d.push(s);return{added:i,removed:o,changed:d}}}const Z=class{static generateText(e=300){let t=[];do{const n=I.randomInteger(10,20),r=I.withProbability(20),i=!r&&I.withProbability(5),o=I.randomInteger(n*.25,n*.75);let d=[];for(let p=0;p<n;p++){let g=Z.getRandomWord();I.withProbability(1)?g=g.toUpperCase():(p==0||I.withProbability(10))&&(g=g[0].toUpperCase()+g.substr(1)),r&&p==o&&(g+=","),d.push(g),i&&p==o&&d.push("-")}let s=d.join(" ");I.withProbability(50)?s+=".":I.withProbability(50)?s+="?":s+="!",t.push(s)}while(t.join(" ").length<e);return t.join(" ")}static getRandomWord(){return Z.DICTIONARY[I.randomInteger(0,Z.DICTIONARY.length-1)]}};let X=Z;R(X,"DICTIONARY",["ability","able","aboard","about","above","accept","accident","according","account","accurate","acres","across","act","action","active","activity","actual","actually","add","addition","additional","adjective","adult","adventure","advice","affect","afraid","after","afternoon","again","against","age","ago","agree","ahead","aid","air","airplane","alike","alive","all","allow","almost","alone","along","aloud","alphabet","already","also","although","am","among","amount","ancient","angle","angry","animal","announced","another","answer","ants","any","anybody","anyone","anything","anyway","anywhere","apart","apartment","appearance","apple","applied","appropriate","are","area","arm","army","around","arrange","arrangement","arrive","arrow","art","article","as","aside","ask","asleep","at","ate","atmosphere","atom","atomic","attached","attack","attempt","attention","audience","author","automobile","available","average","avoid","aware","away","baby","back","bad","badly","bag","balance","ball","balloon","band","bank","bar","bare","bark","barn","base","baseball","basic","basis","basket","bat","battle","be","bean","bear","beat","beautiful","beauty","became","because","become","becoming","bee","been","before","began","beginning","begun","behavior","behind","being","believed","bell","belong","below","belt","bend","beneath","bent","beside","best","bet","better","between","beyond","bicycle","bigger","biggest","bill","birds","birth","birthday","bit","bite","black","blank","blanket","blew","blind","block","blood","blow","blue","board","boat","body","bone","book","border","born","both","bottle","bottom","bound","bow","bowl","box","boy","brain","branch","brass","brave","bread","break","breakfast","breath","breathe","breathing","breeze","brick","bridge","brief","bright","bring","broad","broke","broken","brother","brought","brown","brush","buffalo","build","building","built","buried","burn","burst","bus","bush","business","busy","but","butter","buy","by","cabin","cage","cake","call","calm","came","camera","camp","can","canal","cannot","cap","capital","captain","captured","car","carbon","card","care","careful","carefully","carried","carry","case","cast","castle","cat","catch","cattle","caught","cause","cave","cell","cent","center","central","century","certain","certainly","chain","chair","chamber","chance","change","changing","chapter","character","characteristic","charge","chart","check","cheese","chemical","chest","chicken","chief","child","children","choice","choose","chose","chosen","church","circle","circus","citizen","city","class","classroom","claws","clay","clean","clear","clearly","climate","climb","clock","close","closely","closer","cloth","clothes","clothing","cloud","club","coach","coal","coast","coat","coffee","cold","collect","college","colony","color","column","combination","combine","come","comfortable","coming","command","common","community","company","compare","compass","complete","completely","complex","composed","composition","compound","concerned","condition","congress","connected","consider","consist","consonant","constantly","construction","contain","continent","continued","contrast","control","conversation","cook","cookies","cool","copper","copy","corn","corner","correct","correctly","cost","cotton","could","count","country","couple","courage","course","court","cover","cow","cowboy","crack","cream","create","creature","crew","crop","cross","crowd","cry","cup","curious","current","curve","customs","cut","cutting","daily","damage","dance","danger","dangerous","dark","darkness","date","daughter","dawn","day","dead","deal","dear","death","decide","declared","deep","deeply","deer","definition","degree","depend","depth","describe","desert","design","desk","detail","determine","develop","development","diagram","diameter","did","die","differ","difference","different","difficult","difficulty","dig","dinner","direct","direction","directly","dirt","dirty","disappear","discover","discovery","discuss","discussion","disease","dish","distance","distant","divide","division","do","doctor","does","dog","doing","doll","dollar","done","donkey","door","dot","double","doubt","down","dozen","draw","drawn","dream","dress","drew","dried","drink","drive","driven","driver","driving","drop","dropped","drove","dry","duck","due","dug","dull","during","dust","duty","each","eager","ear","earlier","early","earn","earth","easier","easily","east","easy","eat","eaten","edge","education","effect","effort","egg","eight","either","electric","electricity","element","elephant","eleven","else","empty","end","enemy","energy","engine","engineer","enjoy","enough","enter","entire","entirely","environment","equal","equally","equator","equipment","escape","especially","essential","establish","even","evening","event","eventually","ever","every","everybody","everyone","everything","everywhere","evidence","exact","exactly","examine","example","excellent","except","exchange","excited","excitement","exciting","exclaimed","exercise","exist","expect","experience","experiment","explain","explanation","explore","express","expression","extra","eye","face","facing","fact","factor","factory","failed","fair","fairly","fall","fallen","familiar","family","famous","far","farm","farmer","farther","fast","fastened","faster","fat","father","favorite","fear","feathers","feature","fed","feed","feel","feet","fell","fellow","felt","fence","few","fewer","field","fierce","fifteen","fifth","fifty","fight","fighting","figure","fill","film","final","finally","find","fine","finest","finger","finish","fire","fireplace","firm","first","fish","five","fix","flag","flame","flat","flew","flies","flight","floating","floor","flow","flower","fly","fog","folks","follow","food","foot","football","for","force","foreign","forest","forget","forgot","forgotten","form","former","fort","forth","forty","forward","fought","found","four","fourth","fox","frame","free","freedom","frequently","fresh","friend","friendly","frighten","frog","from","front","frozen","fruit","fuel","full","fully","fun","function","funny","fur","furniture","further","future","gain","game","garage","garden","gas","gasoline","gate","gather","gave","general","generally","gentle","gently","get","getting","giant","gift","girl","give","given","giving","glad","glass","globe","go","goes","gold","golden","gone","good","goose","got","government","grabbed","grade","gradually","grain","grandfather","grandmother","graph","grass","gravity","gray","great","greater","greatest","greatly","green","grew","ground","group","grow","grown","growth","guard","guess","guide","gulf","gun","habit","had","hair","half","halfway","hall","hand","handle","handsome","hang","happen","happened","happily","happy","harbor","hard","harder","hardly","has","hat","have","having","hay","he","headed","heading","health","heard","hearing","heart","heat","heavy","height","held","hello","help","helpful","her","herd","here","herself","hidden","hide","high","higher","highest","highway","hill","him","himself","his","history","hit","hold","hole","hollow","home","honor","hope","horn","horse","hospital","hot","hour","house","how","however","huge","human","hundred","hung","hungry","hunt","hunter","hurried","hurry","hurt","husband","ice","idea","identity","if","ill","image","imagine","immediately","importance","important","impossible","improve","in","inch","include","including","income","increase","indeed","independent","indicate","individual","industrial","industry","influence","information","inside","instance","instant","instead","instrument","interest","interior","into","introduced","invented","involved","iron","is","island","it","its","itself","jack","jar","jet","job","join","joined","journey","joy","judge","jump","jungle","just","keep","kept","key","kids","kill","kind","kitchen","knew","knife","know","knowledge","known","label","labor","lack","lady","laid","lake","lamp","land","language","large","larger","largest","last","late","later","laugh","law","lay","layers","lead","leader","leaf","learn","least","leather","leave","leaving","led","left","leg","length","lesson","let","letter","level","library","lie","life","lift","light","like","likely","limited","line","lion","lips","liquid","list","listen","little","live","living","load","local","locate","location","log","lonely","long","longer","look","loose","lose","loss","lost","lot","loud","love","lovely","low","lower","luck","lucky","lunch","lungs","lying","machine","machinery","mad","made","magic","magnet","mail","main","mainly","major","make","making","man","managed","manner","manufacturing","many","map","mark","market","married","mass","massage","master","material","mathematics","matter","may","maybe","me","meal","mean","means","meant","measure","meat","medicine","meet","melted","member","memory","men","mental","merely","met","metal","method","mice","middle","might","mighty","mile","military","milk","mill","mind","mine","minerals","minute","mirror","missing","mission","mistake","mix","mixture","model","modern","molecular","moment","money","monkey","month","mood","moon","more","morning","most","mostly","mother","motion","motor","mountain","mouse","mouth","move","movement","movie","moving","mud","muscle","music","musical","must","my","myself","mysterious","nails","name","nation","national","native","natural","naturally","nature","near","nearby","nearer","nearest","nearly","necessary","neck","needed","needle","needs","negative","neighbor","neighborhood","nervous","nest","never","new","news","newspaper","next","nice","night","nine","no","nobody","nodded","noise","none","noon","nor","north","nose","not","note","noted","nothing","notice","noun","now","number","numeral","nuts","object","observe","obtain","occasionally","occur","ocean","of","off","offer","office","officer","official","oil","old","older","oldest","on","once","one","only","onto","open","operation","opinion","opportunity","opposite","or","orange","orbit","order","ordinary","organization","organized","origin","original","other","ought","our","ourselves","out","outer","outline","outside","over","own","owner","oxygen","pack","package","page","paid","pain","paint","pair","palace","pale","pan","paper","paragraph","parallel","parent","park","part","particles","particular","particularly","partly","parts","party","pass","passage","past","path","pattern","pay","peace","pen","pencil","people","per","percent","perfect","perfectly","perhaps","period","person","personal","pet","phrase","physical","piano","pick","picture","pictured","pie","piece","pig","pile","pilot","pine","pink","pipe","pitch","place","plain","plan","plane","planet","planned","planning","plant","plastic","plate","plates","play","pleasant","please","pleasure","plenty","plural","plus","pocket","poem","poet","poetry","point","pole","police","policeman","political","pond","pony","pool","poor","popular","population","porch","port","position","positive","possible","possibly","post","pot","potatoes","pound","pour","powder","power","powerful","practical","practice","prepare","present","president","press","pressure","pretty","prevent","previous","price","pride","primitive","principal","principle","printed","private","prize","probably","problem","process","produce","product","production","program","progress","promised","proper","properly","property","protection","proud","prove","provide","public","pull","pupil","pure","purple","purpose","push","put","putting","quarter","queen","question","quick","quickly","quiet","quietly","quite","rabbit","race","radio","railroad","rain","raise","ran","ranch","range","rapidly","rate","rather","raw","rays","reach","read","reader","ready","real","realize","rear","reason","recall","receive","recent","recently","recognize","record","red","refer","refused","region","regular","related","relationship","religious","remain","remarkable","remember","remove","repeat","replace","replied","report","represent","require","research","respect","rest","result","return","review","rhyme","rhythm","rice","rich","ride","riding","right","ring","rise","rising","river","road","roar","rock","rocket","rocky","rod","roll","roof","room","root","rope","rose","rough","round","route","row","rubbed","rubber","rule","ruler","run","running","rush","sad","saddle","safe","safety","said","sail","sale","salmon","salt","same","sand","sang","sat","satellites","satisfied","save","saved","saw","say","scale","scared","scene","school","science","scientific","scientist","score","screen","sea","search","season","seat","second","secret","section","see","seed","seeing","seems","seen","seldom","select","selection","sell","send","sense","sent","sentence","separate","series","serious","serve","service","sets","setting","settle","settlers","seven","several","shade","shadow","shake","shaking","shall","shallow","shape","share","sharp","she","sheep","sheet","shelf","shells","shelter","shine","shinning","ship","shirt","shoe","shoot","shop","shore","short","shorter","shot","should","shoulder","shout","show","shown","shut","sick","sides","sight","sign","signal","silence","silent","silk","silly","silver","similar","simple","simplest","simply","since","sing","single","sink","sister","sit","sitting","situation","six","size","skill","skin","sky","slabs","slave","sleep","slept","slide","slight","slightly","slip","slipped","slope","slow","slowly","small","smaller","smallest","smell","smile","smoke","smooth","snake","snow","so","soap","social","society","soft","softly","soil","solar","sold","soldier","solid","solution","solve","some","somebody","somehow","someone","something","sometime","somewhere","son","song","soon","sort","sound","source","south","southern","space","speak","special","species","specific","speech","speed","spell","spend","spent","spider","spin","spirit","spite","split","spoken","sport","spread","spring","square","stage","stairs","stand","standard","star","stared","start","state","statement","station","stay","steady","steam","steel","steep","stems","step","stepped","stick","stiff","still","stock","stomach","stone","stood","stop","stopped","store","storm","story","stove","straight","strange","stranger","straw","stream","street","strength","stretch","strike","string","strip","strong","stronger","struck","structure","struggle","stuck","student","studied","studying","subject","substance","success","successful","such","sudden","suddenly","sugar","suggest","suit","sum","summer","sun","sunlight","supper","supply","support","suppose","sure","surface","surprise","surrounded","swam","sweet","swept","swim","swimming","swing","swung","syllable","symbol","system","table","tail","take","taken","tales","talk","tall","tank","tape","task","taste","taught","tax","tea","teach","teacher","team","tears","teeth","telephone","television","tell","temperature","ten","tent","term","terrible","test","than","thank","that","thee","them","themselves","then","theory","there","therefore","these","they","thick","thin","thing","think","third","thirty","this","those","thou","though","thought","thousand","thread","three","threw","throat","through","throughout","throw","thrown","thumb","thus","thy","tide","tie","tight","tightly","till","time","tin","tiny","tip","tired","title","to","tobacco","today","together","told","tomorrow","tone","tongue","tonight","too","took","tool","top","topic","torn","total","touch","toward","tower","town","toy","trace","track","trade","traffic","trail","train","transportation","trap","travel","treated","tree","triangle","tribe","trick","tried","trip","troops","tropical","trouble","truck","trunk","truth","try","tube","tune","turn","twelve","twenty","twice","two","type","typical","uncle","under","underline","understanding","unhappy","union","unit","universe","unknown","unless","until","unusual","up","upon","upper","upward","us","use","useful","using","usual","usually","valley","valuable","value","vapor","variety","various","vast","vegetable","verb","vertical","very","vessels","victory","view","village","visit","visitor","voice","volume","vote","vowel","voyage","wagon","wait","walk","wall","want","war","warm","warn","was","wash","waste","watch","water","wave","way","we","weak","wealth","wear","weather","week","weigh","weight","welcome","well","went","were","west","western","wet","whale","what","whatever","wheat","wheel","when","whenever","where","wherever","whether","which","while","whispered","whistle","white","who","whole","whom","whose","why","wide","widely","wife","wild","will","willing","win","wind","window","wing","winter","wire","wise","wish","with","within","without","wolf","women","won","wonder","wonderful","wood","wooden","wool","word","wore","work","worker","world","worried","worry","worse","worth","would","wrapped","write","writer","writing","written","wrong","wrote","yard","year","yellow","yes","yesterday","yet","you","young","younger","your","yourself","youth","zero","zebra","zipper","zoo","zulu"]);var O;(function(a){a[a.None=0]="None",a[a.Correct=1]="Correct",a[a.Incorrect=2]="Incorrect"})(O||(O={}));var Y;(function(a){a[a.Idle=0]="Idle",a[a.Started=1]="Started",a[a.Finished=2]="Finished"})(Y||(Y={}));class Me{constructor(e=300){R(this,"text");R(this,"inputText");R(this,"characterStates");R(this,"gameState");R(this,"cursorPosition");R(this,"mistakePositions");R(this,"correctedMistakePositions");R(this,"totalTypedCharacters");R(this,"startTime");R(this,"endTime");R(this,"wpm");R(this,"cps");R(this,"mistakes");R(this,"accuracy");R(this,"reset");let t=!1;const n=E(typeof e=="string"?e:X.generateText(e)),r=E(""),i=H([n,r],([c,y],k)=>{if(t)return;let w=new Array(c.length);for(let m=0;m<c.length;m++)m>=y.length?w[m]=0:y[m]===c[m]?w[m]=1:w[m]=2;k(w)},[]),o=H([n,r],([c,y],k)=>{t||(y.length>=c.length?k(2):y.length>0?k(1):k(0))},0),d=H(r,(c,y)=>{t||y(c.length)},0),s=E([]),p=E([]),g=E(0),u=E(null),l=E(null),b=H([s,p,g,u,l],([c,y,k,w,m])=>{if(w==null)return 0;m==null&&(m=Date.now());const N=k/5,q=(m-w)/1e3/60,W=N/q,M=(c.length-y.length)/q,z=W-M;return+Math.max(z,0).toFixed(1)},0),j=H([s,p,g,u,l],([c,y,k,w,m])=>{if(w==null)return 0;m==null&&(m=Date.now());const P=(m-w)/1e3,D=k/P,W=(c.length-y.length)/P,U=D-W;return+Math.max(U,0).toFixed(1)},0),C=H(s,c=>c.length,0),F=H([s,g],([c,y])=>{if(y===0)return 0;const k=y-c.length;return Math.round(k/y*100)},0);let S="";r.subscribe(c=>{if(!t){if(c.length>=S.length&&c!==S){const{added:y,changed:k}=I.findDifferences(S,c);g.update(w=>w+y.length+k.length)}S=c}}),o.subscribe(c=>{c===1?u.set(Date.now()):c===2&&(t=!0,l.set(Date.now()))}),I.subscribeAll([i,s,p],([c,y,k])=>{for(let w=0;w<c.length;w++){const m=c[w];m===2&&!y.includes(w)?s.set([...y,w]):m===1&&y.includes(w)&&!k.includes(w)&&p.set([...k,w])}}),this.inputText=r,this.text=I.makeReadable(n),this.mistakePositions=I.makeReadable(s),this.correctedMistakePositions=I.makeReadable(p),this.totalTypedCharacters=I.makeReadable(g),this.startTime=I.makeReadable(u),this.endTime=I.makeReadable(l),this.characterStates=i,this.gameState=o,this.cursorPosition=d,this.wpm=b,this.cps=j,this.mistakes=C,this.accuracy=F,this.reset=c=>{c!=null?n.set(typeof c=="string"?c:X.generateText(c)):n.set(typeof e=="string"?e:X.generateText(e)),S="",t=!1,r.set(""),s.set([]),p.set([]),g.set(0),u.set(null),l.set(null)}}}function oe(a,e,t){const n=a.slice();return n[31]=e[t],n[33]=t,n}function le(a){let e,t,n,r,i,o;return{c(){e=_("div"),t=_("label"),t.textContent="Type here:",n=A(),r=_("input"),v(t,"for","input-field"),v(r,"id","input-field"),v(r,"type","text"),v(r,"autocomplete","off"),v(r,"autocapitalize","off"),v(r,"autocorrect","off"),v(r,"spellcheck","false"),v(e,"id","hidden-form")},m(d,s){K(d,e,s),f(e,t),f(e,n),f(e,r),a[24](r),re(r,a[3]),i||(o=[$(r,"input",a[25]),$(r,"keyup",a[23]),$(r,"selectionchange",a[23])],i=!0)},p(d,s){s[0]&8&&r.value!==d[3]&&re(r,d[3])},d(d){d&&J(e),a[24](null),i=!1,be(o)}}}function ce(a,e){let t,n=e[31]+"",r;return{key:a,first:null,c(){t=_("span"),r=L(n),x(t,"cursor",e[5]===e[33]&&e[1]),x(t,"correct",e[6][e[33]]===O.Correct),x(t,"incorrect",e[6][e[33]]===O.Incorrect),x(t,"corrected",e[7].includes(e[33])),this.first=t},m(i,o){K(i,t,o),f(t,r)},p(i,o){e=i,o[0]&16&&n!==(n=e[31]+"")&&Q(r,n),o[0]&50&&x(t,"cursor",e[5]===e[33]&&e[1]),o[0]&80&&x(t,"correct",e[6][e[33]]===O.Correct),o[0]&80&&x(t,"incorrect",e[6][e[33]]===O.Incorrect),o[0]&144&&x(t,"corrected",e[7].includes(e[33]))},d(i){i&&J(t)}}}function de(a){let e,t,n,r,i,o,d,s,p,g,u,l,b,j,C,F,S,c,y,k,w,m,N,P,D,q,W,U,M,z,V,G;return{c(){e=_("div"),t=_("div"),n=_("div"),r=_("span"),i=L(a[8]),o=A(),d=_("span"),d.textContent="chars/sec",s=A(),p=_("div"),g=_("span"),u=L(a[9]),l=A(),b=_("span"),b.textContent="words/min",j=A(),C=_("div"),F=_("span"),S=L(a[10]),c=L("%"),y=A(),k=_("span"),k.textContent="accuracy",w=A(),m=_("div"),N=_("span"),P=L(a[11]),D=A(),q=_("span"),q.textContent="mistakes",W=A(),U=_("a"),U.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 24 24" height="30" width="30"><path d="M7 9H0V2h1v5.2C2.853 2.963 7.083 0 12 0c6.623 0 12 5.377 12 12s-5.377 12-12 12C5.714 24 .55 19.156.041 13h1.004C1.551 18.603 6.266 23 12 23c6.071 0 11-4.929 11-11S18.071 1 12 1C7.34 1 3.353 3.904 1.751 8H7v1z"></path></svg>',v(r,"class","result-value"),v(d,"class","result-description"),v(n,"class","result-item"),v(g,"class","result-value"),v(b,"class","result-description"),v(p,"class","result-item"),v(F,"class","result-value"),v(k,"class","result-description"),v(C,"class","result-item"),v(N,"class","result-value"),v(q,"class","result-description"),v(m,"class","result-item"),v(t,"id","result"),v(U,"id","restart"),v(e,"id","game-over")},m(T,h){K(T,e,h),f(e,t),f(t,n),f(n,r),f(r,i),f(n,o),f(n,d),f(t,s),f(t,p),f(p,g),f(g,u),f(p,l),f(p,b),f(t,j),f(t,C),f(C,F),f(F,S),f(F,c),f(C,y),f(C,k),f(t,w),f(t,m),f(m,N),f(N,P),f(m,D),f(m,q),f(e,W),f(e,U),z=!0,V||(G=$(U,"click",a[26]),V=!0)},p(T,h){(!z||h[0]&256)&&Q(i,T[8]),(!z||h[0]&512)&&Q(u,T[9]),(!z||h[0]&1024)&&Q(S,T[10]),(!z||h[0]&2048)&&Q(P,T[11])},i(T){z||(ye(()=>{M||(M=ae(e,se,{},!0)),M.run(1)}),z=!0)},o(T){M||(M=ae(e,se,{},!1)),M.run(0),z=!1},d(T){T&&J(e),T&&M&&M.end(),V=!1,G()}}}function Se(a){let e,t,n,r=[],i=new Map,o,d,s=a[2]!==Y.Finished&&le(a),p=a[4];const g=l=>l[31]+l[33];for(let l=0;l<p.length;l+=1){let b=oe(a,p,l),j=g(b);i.set(j,r[l]=ce(j,b))}let u=a[2]===Y.Finished&&de(a);return{c(){s&&s.c(),e=A(),t=_("div"),n=_("div");for(let l=0;l<r.length;l+=1)r[l].c();o=A(),u&&u.c(),v(n,"id","text"),v(t,"id","game")},m(l,b){s&&s.m(l,b),K(l,e,b),K(l,t,b),f(t,n);for(let j=0;j<r.length;j+=1)r[j].m(n,null);f(t,o),u&&u.m(t,null),d=!0},p(l,b){l[2]!==Y.Finished?s?s.p(l,b):(s=le(l),s.c(),s.m(e.parentNode,e)):s&&(s.d(1),s=null),b[0]&242&&(p=l[4],r=we(r,b,g,1,l,p,i,n,Re,ce,null,oe)),l[2]===Y.Finished?u?(u.p(l,b),b[0]&4&&ee(u,1)):(u=de(l),u.c(),ee(u,1),u.m(t,null)):u&&(Ie(),ne(u,1,1,()=>{u=null}),ve())},i(l){d||(ee(u),d=!0)},o(l){ne(u),d=!1},d(l){s&&s.d(l),l&&J(e),l&&J(t);for(let b=0;b<r.length;b+=1)r[b].d();u&&u.d()}}}const te=500;function ze(a,e,t){let n,r,i,o,d,s,p,g,u,l;const b=new Me,{text:j,inputText:C,characterStates:F,gameState:S,cursorPosition:c,correctedMistakePositions:y,wpm:k,cps:w,accuracy:m,mistakes:N}=b;B(a,j,h=>t(4,i=h)),B(a,C,h=>t(3,r=h)),B(a,F,h=>t(6,d=h)),B(a,S,h=>t(2,n=h)),B(a,c,h=>t(5,o=h)),B(a,y,h=>t(7,s=h)),B(a,k,h=>t(9,g=h)),B(a,w,h=>t(8,p=h)),B(a,m,h=>t(10,u=h)),B(a,N,h=>t(11,l=h));let P,D,q;function W(){t(1,q=!q),D=window.setTimeout(W,te)}function U(){t(1,q=!0),window.clearTimeout(D),D=window.setTimeout(W,te)}function M(){!P||n==Y.Finished||P.focus()}function z(){P.setSelectionRange(P.value.length,P.value.length)}C.subscribe(h=>{h&&U()}),c.subscribe(()=>{ke().then(()=>{for(let h of document.getElementsByClassName("cursor"))h.scrollIntoView({block:"center"})})}),_e(()=>{D=window.setTimeout(W,te),M(),window.addEventListener("click",M)});function V(h){Pe[h?"unshift":"push"](()=>{P=h,t(0,P)})}function G(){r=this.value,C.set(r)}return[P,q,n,r,i,o,d,s,p,g,u,l,b,j,C,F,S,c,y,k,w,m,N,z,V,G,()=>b.reset()]}class Te extends fe{constructor(e){super();ge(this,e,ze,Se,me,{},null,[-1,-1])}}new Te({target:document.getElementById("app")});qe();