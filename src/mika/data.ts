/**
 * 美佳のタイプトレーナー 単語・文字データテーブル
 */

export const MIKA_a_pos2 = "QWERTYUIOP";
export const MIKA_a_pos3 = "ASDFGHJKL";
export const MIKA_a_pos4 = "ZXCVBNM";
export const MIKA_a_pos1 = "1234567890";

export const MIKA_c_pos1 = MIKA_a_pos1;
export const MIKA_c_pos2 = MIKA_a_pos2;
export const MIKA_c_pos3 = MIKA_a_pos3 + ";";
export const MIKA_c_pos4 = MIKA_a_pos4 + ",.";
export const MIKA_c_post = [MIKA_c_pos1, MIKA_c_pos2, MIKA_c_pos3, MIKA_c_pos4];

export const MIKA_h_pos1 = MIKA_a_pos3;
export const MIKA_h_pos2 = MIKA_a_pos2;
export const MIKA_h_pos3 = MIKA_a_pos3 + MIKA_a_pos2;
export const MIKA_h_pos4 = MIKA_a_pos4;
export const MIKA_h_pos5 = MIKA_a_pos3 + MIKA_a_pos4;
export const MIKA_h_pos6 = MIKA_a_pos3 + MIKA_a_pos2 + MIKA_a_pos4;
export const MIKA_h_pos7 = MIKA_a_pos1;
export const MIKA_h_pos8 = MIKA_a_pos3 + MIKA_a_pos2 + MIKA_a_pos4 + MIKA_a_pos1;
export const MIKA_h_pos = [
  MIKA_h_pos1,
  MIKA_h_pos2,
  MIKA_h_pos3,
  MIKA_h_pos4,
  MIKA_h_pos5,
  MIKA_h_pos6,
  MIKA_h_pos7,
  MIKA_h_pos8,
];

export const MIKA_oubun = [
  "America","American","April","British","England","English","Europe","Greek","I","Japan",
  "Japanese","a","ability","able","about","above","abroad","absent","accept","accident",
  "account","achieve","acquire","across","act","action","activity","add","address","admire",
  "admit","advance","advantage","afraid","after","again","against","age","ago","agree",
  "air","all","allow","almost","alone","along","already","also","although","always",
  "am","among","amount","an","ancient","and","angry","animal","another","answer",
  "any","anybody","anyone","anything","anywhere","apart","appear","are","area","around",
  "arrive","art","artist","as","ask","asleep","at","attempt","attend","attention",
  "attitude","autumn","average","away","back","bad","bag","bake","base","be",
  "beach","beautiful","beauty","became","because","become","bed","been","before","began",
  "begin","behavior","behind","belief","believe","belong","below","bend","best","better",
  "between","beyond","big","bird","bit","black","blood","blow","blue","body",
  "book","born","both","box","boy","break","bring","brother","brought","build",
  "burn","business","but","buy","by","cake","call","came","can","cannot",
  "car","care","career","carry","case","catch","caught","cause","century","certain",
  "certainly","chance","change","character","characteristic","child","children","choice","choose","city",
  "civilization","class","clear","clock","close","cloud","cold","college","color","come",
  "common","communication","company","complete","concern","condition","consider","continue","control","cool",
  "could","count","country","course","cover","create","creature","culture","cut","danger",
  "dark","date","day","deal","death","decide","deep","degree","demand","describe",
  "desire","determine","develop","development","did","die","difference","different","difficult","difficulty",
  "discover","discovery","discuss","distinguish","do","doctor","dog","done","door","doubt",
  "down","draw","dream","dress","drink","driver","drop","dry","during","each",
  "early","earth","easily","east","easy","eat","economic","educate","education","effect",
  "effort","either","else","empty","end","energy","enjoy","enough","enter","environment",
  "escape","especially","even","event","ever","every","everyone","everything","exactly","example",
  "except","excuse","exist","existence","expect","experience","explain","express","expression","eye",
  "face","fact","fail","fall","family","famous","far","fashion","fast","father",
  "favorite","fear","feel","feeling","feet","fellow","felt","few","field","fight",
  "finally","find","fine","fire","first","five","floor","flower","fog","follow",
  "food","foot","for","force","foreign","form","forward","found","four","free",
  "freedom","fresh","friend","from","front","full","fun","future","gain","game",
  "garden","gave","general","generally","generation","get","gift","girl","give","given",
  "glass","go","gone","good","got","government","great","green","ground","group",
  "grow","habit","had","half","hand","happen","happy","hard","hardly","has",
  "have","he","head","hear","heard","heart","help","her","here","hide",
  "high","him","himself","his","history","hold","hole","home","hope","hour",
  "house","how","however","human","hundred","idea","ideal","idle","if","ill",
  "imagine","importance","important","impossible","in","include","increase","indeed","individual","industry",
  "influence","information","injure","inside","instance","instead","intellectual","interest","interested","interesting",
  "into","introduce","invent","invite","is","it","its","itself","job","join",
  "joy","judge","jump","just","keep","kept","key","kill","kind","knew",
  "know","knowledge","known","labor","lack","lady","land","language","large","last",
  "late","later","laugh","law","lay","lead","learn","least","leave","left",
  "less","lesson","let","letter","library","lie","life","light","like","likely",
  "limit","line","listen","literature","little","live","local","lonely","long","look",
  "lose","lost","lot","loud","love","lovely","low","machine","made","mail",
  "main","major","make","man","manner","many","mark","mass","material","matter",
  "may","me","mean","meaning","meant","measure","meet","member","men","mental",
  "merely","method","might","mile","million","mind","minute","modern","moment","money",
  "month","moon","more","morning","most","mother","move","movement","much","music",
  "must","my","myself","name","nation","natural","nature","near","nearly","necessary",
  "need","neighbor","never","new","newspaper","next","nice","night","no","noise",
  "none","nor","normal","not","nothing","notice","novel","now","number","object",
  "occur","of","off","offer","often","old","on","once","one","only",
  "open","opinion","opportunity","or","order","ordinary","original","other","ought","our",
  "ourselves","out","outside","over","own","paper","parent","part","particular","particularly",
  "pass","past","path","pay","peace","people","perhaps","period","person","personal",
  "philosophy","phone","photo","physical","pick","picture","piece","pity","place","plan",
  "play","please","pleasure","poetry","point","political","poor","popular","population","position",
  "possible","post","power","practical","practice","prefer","present","prevent","private","probably",
  "problem","process","produce","progress","prove","provide","public","purpose","put","quality",
  "question","quick","quiet","quite","radio","rain","rate","rather","reach","read",
  "reader","reading","real","realize","really","reason","receive","recognize","record","regard",
  "relation","remain","remember","require","respect","rest","result","return","rich","right",
  "river","road","room","rule","run","sad","safe","said","same","satisfy",
  "save","saw","say","school","science","scientific","scientist","sea","season","second",
  "see","seem","seen","sense","separate","serious","service","set","several","shall",
  "share","she","short","should","show","sick","side","sight","simple","simply",
  "since","sincerely","single","sit","situation","six","sleep","small","so","social",
  "society","soft","some","someone","something","sometimes","son","soon","sort","sound",
  "southern","space","speak","special","speech","spend","spirit","stage","stand","standard",
  "star","start","state","stay","step","still","stone","stop","story","strange",
  "street","strong","student","study","subject","success","such","suddenly","suffer","suggest",
  "sun","suppose","sure","surface","surprise","system","take","taken","talk","tall",
  "taste","teach","teacher","television","tell","ten","tend","term","test","than",
  "that","the","their","them","themselves","then","there","therefore","these","they",
  "thing","think","this","those","though","thought","thousand","three","through","thus",
  "time","to","today","together","told","too","took","tool","toward","town",
  "train","travel","tree","trouble","true","truth","try","turn","twenty","two",
  "type","under","understand","uniform","universe","university","unless","until","up","upon",
  "us","use","used","usually","value","various","very","view","village","visit",
  "voice","wait","walk","want","war","was","watch","water","way","we",
  "week","well","went","were","what","whatever","when","where","whether","which",
  "while","white","who","whole","whom","whose","why","wife","will","window",
  "wish","with","within","without","woman","women","wonder","wood","word","work",
  "worker","world","worry","worth","would","write","writer","writing","written","wrong",
  "year","yes","yesterday","yet","you","young","your","yourself"
];

export const MIKA_memsdos = [
  "ASSIGN","BACKUP","CD","CHKDSK","COPY","CLS","DATE","DEL","DIR","DISKCOPY","DUMP","EXIT",
  "FORMAT","MENU","MKDIR","MORE","PATH","PRINT","RECOVER","REN","RMDIR","SET","SPEED","SYS","TIME","TYPE"
];

export const MIKA_mec = [
  "auto","static","extern","register","typedef","char","short","int","long","unsigned","float",
  "double","struct","union","if","else","while","do","switch","case","default","break","continue",
  "return","goto","define","include","printf","fprintf","scanf","fopen","fclose","fscanf",
  "getchar","putchar","stdio","for","sprintf","sscanf"
];

export const MIKA_mepascal = [
  "real","integer","char","Boolean","packed","array","of","set","file","record","end","case","nil",
  "in","div","mod","goto","begin","if","then","else","case","while","do","repeat","until","for",
  "to","downto","with","program","label","const","type","var","procedure","function","false","true",
  "text","input","output","get","put","reset","rewrite","read","readln","write","writeln","page","pack","unpack"
];

export const MIKA_mefortran = [
  "GO","TO","ASSIGN","IF","DO","CONTINUE","PAUSE","STOP","CALL","RETURN","READ","WRITE",
  "BACKSPACE","REWIND","ENDFILE","DIMENSION","COMMON","EQUIVALENCE","INTEGER","REAL","LOGICAL",
  "DOUBLE","PRECISION","COMPLEX","EXTERNAL","DATA","FORMAT","FUNCTION","SUBROUTINE","BLOCK","DATA","END"
];

export const MIKA_mebasic = [
  "AUTO","BEEP","BLOAD","BSAVE","CALL","CHAIN","CIRCLE","CLEAR","CLOSE","CLS","COLOR","COMMON",
  "COM","ON","OFF","STOP","CONSOLE","CONT","COPY","DATA","DEF","DEFINT","DEFSNG","DEFDBL","DEFSTR",
  "SEG","USR","DELETE","DIM","DRAW","EDIT","END","ERASE","ERROR","FIELD","FILES","LFILES","FOR",
  "TO","STEP","NEXT","GET","GOSUB","GOTO","RETURN","HELP","IF","THEN","ELSE","INPUT","WAIT","KEY",
  "LIST","KILL","KINPUT","KPLOAD","LET","LIST","LLIST","LINE","LOAD","LOCATE","LSET","RSET","MERGE",
  "MON","MOTOR","NAME","NEW","OPEN","OPTION","BASE","OUT","PAINT","PEN","POINT","POKE","PRESET",
  "PRINT","LPRINT","USING","PSET","PUT","RANDOMIZE","READ","REM","RENUM","RESTORE","RESUME","ROLL",
  "RUN","SAVE","SCREEN","SET","STOP","SWAP","TERM","TIME","TRON","TROFF","VIEW","WAIT","WHILE",
  "WEND","WIDTH","WINDOW","WRITE"
];

export const MIKA_me8086 = [
  "AAA","AAD","AAM","AAS","ADC","ADD","AND","CALL","CBW","CLC","CLD","CLI","CMC","CMP","CMPS",
  "CWD","DAA","DAS","DEC","DIV","ESC","HLT","IDIV","IMUL","IN","INC","INT","INTR","INTO","IRET",
  "JA","JNBE","JAE","JNB","JB","JNAE","JBE","JNA","JC","JCXZ","JE","JZ","JG","JNLE","JGE","JNL",
  "JL","JNGE","JLE","JNG","JMP","JNC","JNE","JNZ","JNO","JNP","JPO","JNS","JO","JP","JPE","JS",
  "LAHF","LDS","LOCK","LODS","LOOP","LOOPE","LOOPZ","LOOPNE","LOOPNZ","LEA","LES","NMI","MOV",
  "MOVS","MOVSB","MOVSW","MUL","NEG","NOP","NOT","OR","OUT","POP","POPF","PUSH","PUSHF","RCL",
  "RCR","REP","REPE","REPZ","REPNE","REPNZ","RET","ROL","ROR","SAHF","SAL","SHL","SAR","SBB",
  "SCAS","SHR","SINGLESTEP","STC","STD","STI","STOS","SUB","TEST","WAIT","XCHG","XLAT","XOR",
  "CS","DS","SS","ES","AX","BX","CX","DX","AH","AL","BH","BL","CH","CL","DH","DL","SP","BP",
  "SI","DI","DB","DW","DD","DUP","SEGMENT","ENDS","ORG","GROUP","ASSUME","NOTHING","PROC","ENDP",
  "LABEL","EQU","PURGE","NAME","PUBLIC","EXTRN","END","RECORD","PARA","BYTE","WORD","PAGE","INPAGE",
  "COMMON","AT","STACK","MEMORY","SEG","PTR","THIS","TYPE","OFFSET","LENGTH","SIZE","WIDTH"
];

export const MIKA_w_seq = [
  MIKA_oubun,
  MIKA_memsdos,
  MIKA_mec,
  MIKA_mepascal,
  MIKA_mefortran,
  MIKA_mebasic,
  MIKA_me8086,
];

export const MIKA_romaji_tango_table = [
  "あめ","いぬ","うみ","えき","おか","かさ","きく","くるま","けむり","ことり",
  "さくら","しか","すずめ","せみ","そら","たいこ","つき","てがみ","とけい",
  "なつ","にじ","ぬま","ねこ","のやま","はな","ひこうき","ふね","へび","ほし",
  "まち","みち","むし","めがね","もり","やま","ゆき","よる","らいおん","りんご",
  "るす","れもん","ろうそく","わたし","わに"
];

export const MIKA_kana = [
  'あ','い','う','え','お','か','き','く','け','こ','さ','し','す','せ','そ','た','ち','つ','て','と',
  'な','に','ぬ','ね','の','は','ひ','ふ','へ','ほ','ま','み','む','め','も','や','ゆ','よ',
  'ら','り','る','れ','ろ','わ','を','ん','が','ぎ','ぐ','げ','ご','ざ','じ','ず','ぜ','ぞ',
  'だ','ぢ','づ','で','ど','ば','び','ぶ','べ','ぼ','ぱ','ぴ','ぷ','ぺ','ぽ'
];

export const MIKA_kana_yomi = [
  "a","i","u","e","o","ka","ki","ku","ke","ko","sa","si","su","se","so","ta","ti","tu","te","to",
  "na","ni","nu","ne","no","ha","hi","hu","he","ho","ma","mi","mu","me","mo","ya","yu","yo",
  "ra","ri","ru","re","ro","wa","wo","nn","ga","gi","gu","ge","go","za","zi","zu","ze","zo",
  "da","di","du","de","do","ba","bi","bu","be","bo","pa","pi","pu","pe","po"
];

export const MIKA_kana_yomi2: (string | null)[] = [
  null,null,null,null,null,null,null,null,null,null,null,"shi",null,null,null,null,
  "chi","tsu",null,null,null,null,null,null,null,null,null,"fu",null,null,null,null,
  null,null,null,null,null,null,"la","li","lu","le","lo",null,null,null,null,null,
  null,null,null,null,"ji",null,null,null,null,null,null,null,null,null,null,null,
  null,null,null,null,null,null,null
];
