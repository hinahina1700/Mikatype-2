import {
  MIKA_c_pos1, MIKA_c_pos2, MIKA_c_pos3, MIKA_c_pos4, MIKA_c_post,
  MIKA_h_pos, MIKA_w_seq, MIKA_romaji_tango_table,
  MIKA_kana, MIKA_kana_yomi, MIKA_kana_yomi2
} from './data.ts';
import { MikaSettings } from './types.ts';
import { sound } from './sound.ts';
import { achievementManager } from './achievements.ts';
import { battleManager } from './battle.ts';

export class MikaEngine {
  private canvas: HTMLCanvasElement;
  private g: CanvasRenderingContext2D;

  public settings: MikaSettings = {
    autoInput: false,
    autoSpeed: 50,
    visibleSpace: true,
    speedMultiplier: 1.0,
    dopagaki: false,
    autoPilot: false,
    invincible: false,
    theme: 'dark',
    soundEnabled: true,
    soundVolume: 0.5,
  };

  public onSettingsChange?: (settings: MikaSettings) => void;
  public onStateChange?: (state: { modeName: string; funcNo: number; inPractice: boolean }) => void;
  public onSecretMenuOpen?: () => void;
  public onParticleTrigger?: (char: string, x: number, y: number) => void;

  private autoInputTimer: number | null = null;
  private autoPilotTimer: number | null = null;
  private procptimer: number | null = null;
  private procrtimer: number | null = null;
  private procatimer: number | null = null;

  // Colors
  private magenta = 'RGB(128,32,128)';
  private green = 'RGB(0,128,0)';
  private blue = 'RGB(0,0,128)';
  private cyan = 'RGB(0,128,128)';
  private orange = 'RGB(128,32,0)';
  private red = 'RGB(128,0,0)';
  private color_position_err = 'RGB(192,0,0)';
  private bk_color = 'RGB(255,255,255)';
  private finger_color = 'RGB(255,191,63)';
  private nail_color = 'RGB(255,255,191)';
  private color_text_under_line = 'RGB(0,0,255)';
  private key_black = 'RGB(0,0,0)';
  private key_gray = 'RGB(127,127,127)';
  private key_magenta = 'RGB(255,0,255)';
  private key_blue = 'RGB(0,0,255)';
  private key_red = 'RGB(255,0,0)';
  private color_romaji = 'RGB(0,0,255)';
  private color_romaji_err = 'RGB(255,0,0)';
  private color_romaji_under_line = 'RGB(0,0,255)';

  // Finger coordinates
  private fngpoint = [
    [21*16+8, 10*8+6, 3*8+2],
    [20*16+2, 15*8,   4*8],
    [20*16-3, 20*8,   4*8],
    [20*16+2, 25*8,   4*8],
    [22*16,   31*8-4, 5*8],
    [22*16,   39*8+4, 5*8],
    [20*16+2, 46*8,   4*8],
    [20*16-3, 51*8,   4*8],
    [20*16+2, 56*8,   4*8],
    [21*16+8, 61*8,   3*8+2]
  ];

  // Records
  public r_date = ["00/00/00","00/00/00","00/00/00","00/00/00","00/00/00","00/00/00","00/00/00","00/00/00"];
  public w_date = ["00/00/00","00/00/00","00/00/00","00/00/00","00/00/00","00/00/00","00/00/00"];
  public a_date = ["00/00/00","00/00/00"];
  public r_speed = [0.0,0.0,0.0,0.0,0.0,0.0,0.0,0.0];
  public w_speed = [0.0,0.0,0.0,0.0,0.0,0.0,0.0];
  public a_speed = [0.0,0.0];
  public p_time = 0;
  public r_time = [0,0,0,0,0,0,0,0];
  public w_time = [0,0,0,0,0,0,0];
  public a_time = [0,0];
  public rt_t = 0;

  // Counts
  private p_count_position = [0,0,0,0,0,0,0,0];
  private p_count_random = [0,0,0,0,0,0,0,0];
  private p_count_word = [0,0,0,0,0,0,0];
  private p_count_romaji = [0,0];
  private p_count: number[] | null = null;

  // State
  public exec_func_no = 1;
  private type_kind_no = 0;
  private type_kind_mes = "";
  private type_speed_record: number[] = [];
  private type_date_record: string[] = [];
  private type_time_record: number[] = [];
  private char_table = "";
  private word_table: string[] = [];
  private cookie_kind = "";

  private key_char = 'A';
  private guide_char: string | number = 'A';
  private err_char: string | number = 0;
  private char_position = 0;
  public type_count = 0;
  private w_count = 0;
  public type_err_count = 0;
  private c_p1 = 0;
  private c_p2 = 0;
  private err_char_flag = 0;
  private time_start_flag = 0;
  private type_start_time = 0;
  private type_end_time = 0;
  private type_speed_time = 0.0;
  private ttype_speed_time = 0.0;
  public type_speed = 0.0;
  private type_speed2 = 0.0;
  private practice_end_flag = 0;
  private key_guide_flag = 0;
  private menu_kind_flag = 1;
  private type_end_flag = 0;
  private type_syuryou_flag = 0;
  private type_date = "";
  private sec_count = 0;

  private romaji: string | null = null;
  private romaji_length = 0;
  private romaji2: string | null = null;
  private romaji_length2 = 0;
  private key_char2: string | number = 0;
  private r_count = 0;

  private chat_t: string[][] = Array.from({ length: 10 }, () => new Array(40).fill(' '));
  private chat_yomi_t: number[] = new Array(400).fill(0);
  private cline_x = 3;
  public cline_c = 0;
  private utikiri_flag = 0;
  private utikiri_flag2 = 0;

  private max_x_flag = 0;
  private max_y_flag = 0;
  private width_x = 16;
  private width_y = 8;
  private mes_del_flag = 0;

  private menu_function_table: number[] = [];
  private sel_flag: number[] = [];

  // Top Menu: 7: オンライン対戦練習, 8: 実績, 9: 裏メニュー
  private menu_mes_s = [
    "ポジション練習",
    "ランダム練習",
    "英単語練習",
    "ローマ字練習",
    "成績表示",
    "成績消去",
    "オンライン対戦練習",
    "実績",
    "裏メニュー"
  ];
  private menu_cord_s = [
    [1.5*14, 20*8],
    [3.3*14, 20*8],
    [5.1*14, 20*8],
    [6.9*14, 20*8],
    [8.7*14, 20*8],
    [10.5*14, 20*8],
    [12.3*14, 20*8],
    [14.1*14, 20*8],
    [15.9*14, 20*8]
  ];
  private menu_s_function = [21, 22, 23, 24, 29, 30, 70, 88, 90];
  private menu_s_sel_flag = [0, 0, 0, 0, 0, 0, 0, 0, 0];

  // 裏メニュー定義 (美佳のタイプトレーナー枠内に統合)
  private mes0_secret = "●●●  美佳のタイプトレーナー 裏メニュー  ●●●";
  private secret_menu_function = [901, 902, 903, 904, 905, 906, 907, 9001];
  private secret_sel_flag = [0, 0, 0, 0, 0, 0, 0, 0];
  private menu_cord_secret = [
    [2*14, 20*8],
    [4*14, 20*8],
    [6*14, 20*8],
    [8*14, 20*8],
    [10*14, 20*8],
    [12*14, 20*8],
    [14*14, 20*8],
    [16*14, 20*8]
  ];

  private menu_mes = ["ホームポジション","上一段","ホームポジション＋上一段","下一段","ホームポジション＋下一段","ホームポジション＋上一段＋下一段","数字","全段","メニューに戻る"];
  private menu_cord = [[2*14,20*8],[4*14,20*8],[6*14,20*8],[8*14,20*8],[10*14,20*8],[12*14,20*8],[14*14,20*8],[16*14,20*8],[18*14,20*8]];
  private position_menu_function = [401,402,403,404,405,406,407,408,9001];
  private position_sel_flag = [0,0,0,0,0,0,0,0,0];
  private random_menu_function = [501,502,503,504,505,506,507,508,9001];
  private random_sel_flag = [0,0,0,0,0,0,0,0,0];

  private menu_mes_w = ["基本英単語練習","ＭＳＤＯＳコマンド練習","Ｃ言語練習","パスカル練習","フォートラン練習","ＢＡＳＩＣ練習","８０８６アセンブラ練習","メニューに戻る"];
  private word_menu_function = [601,602,603,604,605,606,607,9001];
  private word_sel_flag = [0,0,0,0,0,0,0,0];

  private menu_mes_r = ["ローマ字ランダム練習","ローマ字単語練習","メニューに戻る"];
  private romaji_menu_function = [701,702,9001];
  private romaji_sel_flag = [0,0,0];

  private mes0 = "●●●  美佳のタイプトレーナー Ver2.06 拡張統合版  ●●●";
  private mes0a = "●●●  美佳のタイプトレーナー ポジション練習　●●●";
  private mes0b = "●●●  美佳のタイプトレーナー ランダム練習　●●●";
  private mesta = "●●●  美佳のタイプトレーナー %s　●●●";
  private mes0c = "●●●  美佳のタイプトレーナー 英単語練習　●●●";
  private mes0d = "●●●  美佳のタイプトレーナー ローマ字練習　●●●";
  private mestb = "●● 美佳のタイプトレーナー ポジション練習 %s ●●";
  private mestc = "●● 美佳のタイプトレーナー ランダム練習 %s ●●";
  private mesi1 = "もう一度練習するときはリターンキーまたは、Enterキーを押してください";
  private mesi2 = "メニューに戻るときはESCキーを押してください";
  private mesi3 = "おめでとう、記録を更新しました";
  private abort_mes = "ESCキーを押すと中断します";
  private return_mes = "ESCキーを押すとメニューに戻ります";
  private key_type_mes = "のキーを打ちましょうね．．";
  private keymes1 = "ｽﾍﾟｰｽを押すとｷｰｶﾞｲﾄﾞを消去します";
  private keymes2 = "ｽﾍﾟｰｽを押すとｷｰｶﾞｲﾄﾞを表示します";
  private keymes3 = "この次は、スペースキーを押してキーガイドの表示を消して練習してみましょうね";
  private keymes4 = "この次は、スペースキーを押してキーガイドを表示して練習してみましょうね";

  private t_line = 7;
  private romaji_line = 2*16+6;
  private romaji_underline = 2*16+10;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('2D context unavailable');
    this.g = ctx;
    this.loadStorage();
    this.rt_t = this.seisekiruiseki();
    this.applyThemeColors();
    this.dispmen();

    // 対戦スタートを受信したときのフック
    battleManager.onBattleStartRequest = (words) => {
      achievementManager.unlock('pvp_battle');
      this.startBattlePractice(words);
    };
  }

  public applyThemeColors() {
    if (this.settings.theme === 'light') {
      this.bk_color = 'RGB(248,250,252)';
      this.key_black = 'RGB(15,23,42)';
      this.key_gray = 'RGB(203,213,225)';
    } else {
      this.bk_color = 'RGB(255,255,255)';
      this.key_black = 'RGB(0,0,0)';
      this.key_gray = 'RGB(127,127,127)';
    }
  }

  public setTheme(theme: 'dark' | 'light') {
    this.settings.theme = theme;
    this.applyThemeColors();
    this.dispmen();
    this.onSettingsChange?.({ ...this.settings });
  }

  public startBattlePractice(words: string[]) {
    // 英単語練習 基本英単語 (601) を同期した単語で開始
    this.exec_func_no = 601;
    this.preptrain(601);
    this.intwordtable(words, 0);
    this.prepflags();
    this.dispmen();
  }

  // --- Storage ---
  private loadStorage() {
    try {
      const data = localStorage.getItem('MIKATYPE_DATA');
      if (data) {
        const parsed = JSON.parse(data);
        if (parsed.r_speed) this.r_speed = parsed.r_speed;
        if (parsed.r_date) this.r_date = parsed.r_date;
        if (parsed.r_time) this.r_time = parsed.r_time;
        if (parsed.w_speed) this.w_speed = parsed.w_speed;
        if (parsed.w_date) this.w_date = parsed.w_date;
        if (parsed.w_time) this.w_time = parsed.w_time;
        if (parsed.a_speed) this.a_speed = parsed.a_speed;
        if (parsed.a_date) this.a_date = parsed.a_date;
        if (parsed.a_time) this.a_time = parsed.a_time;
        if (parsed.p_time) this.p_time = parsed.p_time;
      }
    } catch {
      // ignore
    }
  }

  private saveStorage() {
    try {
      const data = {
        r_speed: this.r_speed,
        r_date: this.r_date,
        r_time: this.r_time,
        w_speed: this.w_speed,
        w_date: this.w_date,
        w_time: this.w_time,
        a_speed: this.a_speed,
        a_date: this.a_date,
        a_time: this.a_time,
        p_time: this.p_time,
      };
      localStorage.setItem('MIKATYPE_DATA', JSON.stringify(data));
    } catch {
      // ignore
    }
  }

  public seisekiclear() {
    const date0 = '00/00/00';
    this.rt_t = 0;
    this.p_time = 0;
    this.r_speed.fill(0.0);
    this.r_date.fill(date0);
    this.r_time.fill(0);
    this.w_speed.fill(0.0);
    this.w_date.fill(date0);
    this.w_time.fill(0);
    this.a_speed.fill(0.0);
    this.a_date.fill(date0);
    this.a_time.fill(0);
    this.saveStorage();
  }

  public seisekiruiseki(): number {
    let total = this.p_time;
    for (let i = 0; i < 8; i++) total += this.r_time[i];
    for (let i = 0; i < 7; i++) total += this.w_time[i];
    for (let i = 0; i < 2; i++) total += this.a_time[i];
    return total;
  }

  // --- Fun & Cheat Mode Controls ---
  public toggleAutoInput() {
    this.settings.autoInput = !this.settings.autoInput;
    if (this.settings.autoInput) this.startAutoInput();
    else this.stopAutoInput();
    this.dispmen();
    this.onSettingsChange?.({ ...this.settings });
  }

  public setAutoSpeed(ms: number) {
    this.settings.autoSpeed = Math.max(10, ms);
    if (this.settings.autoInput) {
      this.stopAutoInput();
      this.startAutoInput();
    }
    this.onSettingsChange?.({ ...this.settings });
  }

  public toggleVisibleSpace() {
    this.settings.visibleSpace = !this.settings.visibleSpace;
    this.dispmen();
    this.onSettingsChange?.({ ...this.settings });
  }

  public setSpeedMultiplier(mult: number) {
    this.settings.speedMultiplier = Math.max(0.1, mult);
    if (this.settings.speedMultiplier >= 1000) {
      achievementManager.unlock('speed_1000');
    }
    this.dispmen();
    this.onSettingsChange?.({ ...this.settings });
  }

  public cycleSpeedMultiplier() {
    if (this.settings.speedMultiplier === 1.0) this.setSpeedMultiplier(10.0);
    else if (this.settings.speedMultiplier === 10.0) this.setSpeedMultiplier(100.0);
    else this.setSpeedMultiplier(1.0);
  }

  public toggleDopagaki() {
    this.settings.dopagaki = !this.settings.dopagaki;
    if (this.settings.dopagaki) {
      achievementManager.unlock('dopagaki_active');
    }
    this.dispmen();
    this.onSettingsChange?.({ ...this.settings });
  }

  public toggleAutoPilot() {
    this.settings.autoPilot = !this.settings.autoPilot;
    if (this.settings.autoPilot) {
      achievementManager.unlock('autopilot_cheat');
      this.startAutoPilot();
    } else {
      this.stopAutoPilot();
    }
    this.dispmen();
    this.onSettingsChange?.({ ...this.settings });
  }

  public toggleInvincible() {
    this.settings.invincible = !this.settings.invincible;
    if (this.settings.invincible) {
      achievementManager.unlock('invincible_mode');
    }
    this.dispmen();
    this.onSettingsChange?.({ ...this.settings });
  }

  public startAutoInput() {
    this.stopAutoInput();
    this.autoInputTimer = window.setInterval(() => {
      if (!this.settings.autoInput) {
        this.stopAutoInput();
        return;
      }
      if (this.practice_end_flag === 1) {
        this.stopAutoInput();
        return;
      }
      const target = this.getCurrentTargetKey();
      if (target) {
        this.exec_func(target);
      }
    }, this.settings.autoSpeed);
  }

  public stopAutoInput() {
    if (this.autoInputTimer !== null) {
      clearInterval(this.autoInputTimer);
      this.autoInputTimer = null;
    }
  }

  private startAutoPilot() {
    this.stopAutoPilot();
    // 完全オートパイロット：ミスゼロかつ最高速(12ms間隔)で自動クリア
    this.autoPilotTimer = window.setInterval(() => {
      if (!this.settings.autoPilot) {
        this.stopAutoPilot();
        return;
      }
      if (this.practice_end_flag === 1) {
        // 次の練習をEnterで自動リスタート
        this.exec_func('\r');
        return;
      }
      const target = this.getCurrentTargetKey();
      if (target) {
        this.exec_func(target);
      }
    }, 15);
  }

  private stopAutoPilot() {
    if (this.autoPilotTimer !== null) {
      clearInterval(this.autoPilotTimer);
      this.autoPilotTimer = null;
    }
  }

  public getCurrentTargetKey(): string | null {
    if (this.exec_func_no >= 401 && this.exec_func_no <= 408) {
      return (this.guide_char || this.key_char) as string;
    }
    if ((this.exec_func_no >= 501 && this.exec_func_no <= 508) || (this.exec_func_no >= 601 && this.exec_func_no <= 607)) {
      if (this.chat_t[this.c_p2] && this.chat_t[this.c_p2][this.c_p1]) {
        return this.chat_t[this.c_p2][this.c_p1];
      }
    }
    if (this.exec_func_no >= 701 && this.exec_func_no <= 702) {
      if (this.key_char) {
        return this.key_char as string;
      }
    }
    return null;
  }

  // --- Keyboard Handler ---
  public handleKeyDown(event: KeyboardEvent) {
    const key = event.key;

    if (key === 'F2') {
      event.preventDefault();
      this.toggleAutoInput();
      return;
    }
    if (key === 'F3') {
      event.preventDefault();
      this.toggleVisibleSpace();
      return;
    }
    if (key === 'F4') {
      event.preventDefault();
      this.cycleSpeedMultiplier();
      return;
    }
    if (key === 'F5') {
      event.preventDefault();
      this.toggleDopagaki();
      return;
    }
    if (key === 'F6') {
      event.preventDefault();
      this.toggleAutoPilot();
      return;
    }
    if (key === 'F7') {
      event.preventDefault();
      this.toggleInvincible();
      return;
    }

    if (key === 'Enter') {
      event.preventDefault();
      sound.playKey();
      this.exec_func('\r');
      if (this.settings.autoInput && !this.autoInputTimer && this.exec_func_no > 400 && this.exec_func_no < 800) {
        this.startAutoInput();
      }
    } else if (key === 'Escape') {
      event.preventDefault();
      sound.playKey();
      this.stopAutoInput();
      this.stopAutoPilot();
      this.exec_func('\x1b');
    } else if (key.length === 1) {
      event.preventDefault();
      this.exec_func(key);
      if (this.settings.autoInput && !this.autoInputTimer && this.exec_func_no > 400 && this.exec_func_no < 800) {
        this.startAutoInput();
      }
    }
  }

  public sendKey(char: string) {
    sound.playKey();
    if (char === 'Enter') this.exec_func('\r');
    else if (char === 'Escape') {
      this.stopAutoInput();
      this.stopAutoPilot();
      this.exec_func('\x1b');
    } else {
      this.exec_func(char);
    }
  }

  // --- Rendering Helpers ---
  private xcord(x1: number): number {
    const max_x = (this.max_x_flag === 0) ? 25*16 : 20*16;
    return Math.floor((this.canvas.height * x1) / max_x);
  }

  private ycord(y1: number): number {
    const max_y = (this.max_y_flag === 0) ? 80*8 : 64*8;
    return Math.floor((this.canvas.width * y1) / max_y);
  }

  private xxcord(x: number): number { return this.t_line * 16 + x * 20; }
  private yycord(y: number): number { return y * 16; }

  private cslfonthight(scale: number): number {
    return this.xcord(this.width_x * scale) - this.xcord(0);
  }
  private cslfontwidth(scale: number): number {
    return this.ycord(this.width_y * 2 * scale) - this.ycord(0);
  }
  private cslfontsize(scale: number): number {
    return Math.min(this.cslfonthight(scale), this.cslfontwidth(scale));
  }

  private cslclr() {
    this.g.fillStyle = this.bk_color;
    this.g.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  private cslcolor(color: string) {
    this.mes_del_flag = (color === this.bk_color) ? 1 : 0;
    this.g.fillStyle = color;
    this.g.strokeStyle = color;
  }

  private cslputscale(x1: number, y1: number, mes: string, scale: number) {
    const fontSize = this.cslfontsize(scale);
    const ffontSize = fontSize / 1.33;
    const fontHeight = this.cslfonthight(1.0);
    const fontWidth = this.cslfontwidth(1.0);
    const xx1 = this.xcord(x1 + this.width_x);
    const yy1 = this.ycord(y1);

    this.g.font = `${Math.floor(fontSize)}px monospace`;
    const xx = Math.floor(xx1 + (ffontSize - fontHeight) / 2);
    const yy = Math.floor(yy1 + (fontWidth - fontSize) / 2);

    if (this.mes_del_flag === 1) {
      const measure = this.g.measureText(mes);
      const h1 = measure.actualBoundingBoxAscent || fontSize * 0.8;
      const h2 = measure.actualBoundingBoxDescent || fontSize * 0.2;
      this.g.fillRect(yy, xx - h1 - 1, measure.width, h1 + h2 + 2);
    } else {
      this.g.fillText(mes, yy, xx);
    }
  }

  private charlength(a: string): number {
    const code = a.charCodeAt(0);
    if (code < 255) return 1;
    if (0xff61 <= code && code <= 0xff9f) return 1;
    return 2;
  }

  private stringlength(a: string): number {
    let len = 0;
    for (let i = 0; i < a.length; i++) len += this.charlength(a.charAt(i));
    return len;
  }

  private cslputzscale(x: number, y: number, a: string, scale: number) {
    let aa = a;
    if (a >= '0' && a <= '9') aa = String.fromCharCode(a.charCodeAt(0) + 0xfee0);
    else if (a >= 'A' && a <= 'Z') aa = String.fromCharCode(a.charCodeAt(0) + 0xfee0);
    else if (a >= 'a' && a <= 'z') aa = String.fromCharCode(a.charCodeAt(0) + 0xfee0);
    else if (a === ',') aa = '，';
    else if (a === '.') aa = '．';
    else if (a === ' ') aa = this.settings.visibleSpace ? '␣' : ' ';
    else if (a === ';') aa = '；';
    this.cslputscale(x, y, aa, scale);
  }

  private cslput(x: number, y: number, mes: string) {
    let j = 0;
    for (let i = 0; i < mes.length; i++) {
      this.cslputscale(x, y + j, mes[i], 1.0);
      j += 8 * this.charlength(mes[i]);
    }
  }

  private cslputu(x: number, y: number, mes: string, yy: number, color1: string) {
    const charLen = this.stringlength(mes);
    const fontSize = this.cslfontsize(1.0);
    const fontHeight = this.cslfonthight(1.0);
    const x1 = this.xcord(x + this.width_x) + yy + (fontSize - fontHeight) / 2 + 2;
    let x2 = this.xcord(1) - this.xcord(0);
    if (x2 > 0) x2--;
    const y1 = this.ycord(y);
    const y2 = this.ycord(y + charLen * 8);

    this.cslcolor(color1);
    this.g.lineWidth = (color1 === this.bk_color) ? 3 : 2;
    this.g.beginPath();
    for (let xx = x1; xx <= x1 + x2; xx++) {
      this.g.moveTo(y1, xx);
      this.g.lineTo(y2, xx);
    }
    this.g.stroke();
  }

  private cslmencenter(x: number, mes: string) {
    const kk = (this.max_y_flag === 0) ? 80 : 64;
    const k = this.stringlength(mes);
    const y = ((kk - k) * this.width_y) / 2;
    this.cslput(x, y, mes);
  }

  private cslrecttt(x1: number, y1: number, x2: number, y2: number, color: string, b: number) {
    let bb = 0;
    if (b !== 0) {
      const bx = this.xcord(b) - this.xcord(0);
      const by = this.ycord(b) - this.ycord(0);
      bb = Math.max(1, Math.min(bx, by));
    }
    const xx1 = this.xcord(x1) + bb;
    const xx2 = this.xcord(x2) - bb;
    const yy1 = this.ycord(y1) + bb;
    const yy2 = this.ycord(y2) - bb;
    this.g.fillStyle = color;
    if (xx1 <= xx2 && yy1 <= yy2) {
      this.g.fillRect(yy1, xx1, yy2 - yy1, xx2 - xx1);
    }
  }

  private cslrectt(x1: number, y1: number, x2: number, y2: number, color1: string) {
    this.cslrecttt(x1, y1, x2, y2, color1, 0);
  }

  private cslrectb(x1: number, y1: number, x2: number, y2: number, color1: string, color2: string, b: number) {
    this.cslrectt(x1, y1, x2, y2, color1);
    this.cslrecttt(x1, y1, x2, y2, color2, b);
  }

  private cslellipse(x1: number, y1: number, x2: number, y2: number, color: string) {
    this.g.fillStyle = color;
    const xx1 = this.xcord(x1);
    const xx2 = this.xcord(x2);
    const yy1 = this.ycord(y1);
    const yy2 = this.ycord(y2);
    const x = (xx1 + xx2) / 2;
    const y = (yy1 + yy2) / 2;
    const rx = Math.max(1, x - xx1 - 1);
    const ry = Math.max(1, y - yy1 - 1);
    this.g.beginPath();
    this.g.ellipse(y, x, ry, rx, 0, 0, Math.PI * 2);
    this.g.fill();
  }

  private cslkeyback(x_pos: number, y_pos: number, color: string) {
    this.cslrectt(
      x_pos + this.width_x - 10,
      y_pos + this.width_y - 7,
      x_pos + 2 * this.width_x + 10,
      y_pos + 3 * this.width_y + 7,
      color
    );
  }

  private homeposi(x: number, y: number): boolean {
    return x === 3 && ((1 <= y && y <= 4) || (7 <= y && y <= 10));
  }

  private keyposit_x(x: number): number {
    return 4 * this.width_x + (x - 1) * 4 * this.width_x;
  }
  private keyposit_y(x: number, y: number): number {
    return 4 * this.width_y + (y - 1) * 6 * this.width_y + (x - 1) * 2 * this.width_y;
  }

  private poofinger(x_finger: number, y_finger: number, width_finger: number, color: string) {
    const x1 = x_finger + 4;
    const y1 = y_finger + 4;
    const x2 = x_finger + 24;
    const y2 = y_finger + width_finger - 4;
    this.cslellipse(x1 - 7, y1, x1 + 7, y2, color);
    this.cslrectt(x1, y1, x2, y2, color);
  }

  private pofinger(x_pos: number, y_pos: number, yubi_haba: number, flag: number) {
    let x1 = x_pos;
    const x2 = 400;
    const y1 = y_pos;
    const y2 = y_pos + yubi_haba;
    let color: string;
    if (flag === 0) {
      color = this.finger_color;
    } else {
      color = this.bk_color;
      x1--;
    }
    this.cslellipse(x1 - 8, y1, x1 + 8, y2, color);
    this.cslrectt(x1, y1, x2, y2, color);
    if (flag === 0) {
      this.poofinger(x_pos, y_pos, yubi_haba, this.nail_color);
    }
  }

  private pfinger(flag: number) {
    for (let i = 0; i < 10; i++) {
      this.pofinger(this.fngpoint[i][0], this.fngpoint[i][1], this.fngpoint[i][2], flag);
    }
  }

  private fngposit(finger: number): number {
    if (finger === 5) return 4;
    if (finger === 6) return 7;
    if (finger >= 11) return 10;
    return finger;
  }

  private difposit(a: string | number, flag: number) {
    if (a === 0 || typeof a !== 'string') return;
    const pos1 = this.keycord(a);
    if (pos1[0] === 0 || pos1[1] === 0) return;
    const yy = this.fngposit(pos1[1]);
    const x_finger = this.fngpoint[yy - 1][0];
    const y_finger = this.fngpoint[yy - 1][1];
    const yubi_haba = this.fngpoint[yy - 1][2];
    if (flag === 0) {
      this.poofinger(x_finger, y_finger, yubi_haba, this.key_black);
    } else {
      this.poofinger(x_finger - 1, y_finger, yubi_haba, this.finger_color);
      this.poofinger(x_finger, y_finger, yubi_haba, this.nail_color);
    }
  }

  private dispguidechar(key_char: string | number, flag: number) {
    if (key_char !== 0 && typeof key_char === 'string') {
      const color = (flag === 0) ? this.key_blue : this.bk_color;
      this.cslcolor(color);
      this.cslputzscale(2 * this.width_x - 2, 34 * this.width_y - 1, key_char, 2.4);
    }
  }

  private dipline(x: number, line: string, flag: number) {
    const len = line.length;
    for (let i = 0; i < len; i++) {
      const x_pos = this.keyposit_x(x + 1);
      const y_pos = this.keyposit_y(x + 1, i + 1);
      const x1 = x_pos;
      const y1 = y_pos - 4;
      const x2 = x_pos + 3 * this.width_x;
      const y2 = y_pos + 4 * this.width_y + 4;
      const x3 = x_pos + this.width_x;
      const y3 = y_pos + this.width_y;
      const isHome = this.homeposi(x + 1, i + 1);
      const color2 = isHome ? this.key_magenta : this.key_gray;

      if (flag === 0 || flag === 1) {
        this.cslrectb(x1, y1, x2, y2, this.key_black, color2, 1);
      }
      if (flag === 0 || flag === 2) {
        this.cslcolor(this.key_black);
        this.cslputzscale(x3, y3, line.charAt(i), 1.8);
      } else if (flag === 3) {
        this.cslkeyback(x_pos, y_pos, color2);
      }
    }
  }

  private dikposit(a: string | number, flag: number) {
    if (a === 0 || typeof a !== 'string') return;
    const pos1 = this.keycord(a);
    if (pos1[0] === 0 || pos1[1] === 0) return;
    const x_posit = this.keyposit_x(pos1[0]);
    const y_posit = this.keyposit_y(pos1[0], pos1[1]);
    const isHome = this.homeposi(pos1[0], pos1[1]);

    let BkColor = '';
    let TextColor = '';
    if (flag === 0) {
      BkColor = this.key_black;
      TextColor = isHome ? this.key_magenta : this.key_gray;
    } else if (flag === 1 || flag === 2) {
      BkColor = isHome ? this.key_magenta : this.key_gray;
      TextColor = this.key_black;
    } else {
      BkColor = this.color_position_err;
      TextColor = this.key_black;
    }
    this.cslkeyback(x_posit, y_posit, BkColor);
    this.cslcolor(TextColor);
    if (flag === 0 || flag === 1 || flag === 3) {
      this.cslputzscale(x_posit + this.width_x, y_posit + this.width_y, a, 1.8);
    }
  }

  private diposit(flag: number) {
    this.dipline(0, MIKA_c_pos1, flag);
    this.dipline(1, MIKA_c_pos2, flag);
    this.dipline(2, MIKA_c_pos3, flag);
    this.dipline(3, MIKA_c_pos4, flag);
  }

  private disperrorcount(flag: number, i: number, j: number) {
    const type_mes = 'ミスタッチ' + this.formatd(this.type_err_count, 3) + '回';
    this.cslcolor((flag === 0) ? this.red : this.bk_color);
    this.cslput(i * 16, j * 8, type_mes);
  }

  private dispseikai(flag: number) {
    if (this.type_count === 0) return;
    const type_mes = '正解' + this.formatd(this.type_count, 3) + '回';
    this.cslcolor((flag === 0) ? this.cyan : this.bk_color);
    this.cslput(2 * 16, 64 * 8, type_mes);
  }

  private dispkeygideonoff(flag: number) {
    const km1 = (this.menu_kind_flag === 1) ? this.keymes1 : this.keymes2;
    const km2 = (this.menu_kind_flag === 1) ? this.keymes2 : this.keymes1;
    if (flag === 1) {
      this.cslcolor(this.bk_color);
      this.cslput(16, 1, km2);
    }
    this.cslcolor(this.cyan);
    this.cslput(16, 1, km1);
  }

  private disptitle(mes: string, submes: string) {
    const mes0 = mes.replace('%s', submes);
    this.cslcolor(this.magenta);
    this.cslmencenter(1, mes0);
  }

  private dispkaisumes(flag: number, i: number, j: number) {
    if (this.p_count === null) return;
    const count = this.p_count[this.type_kind_no];
    if (count === 0) return;
    this.cslcolor((flag === 0) ? this.green : this.bk_color);
    this.cslput(i * 16, j * 8, "練習回数" + this.formatd(count, 4) + "回");
  }

  private dispabortmessage(flag: number, i: number, j: number) {
    this.cslcolor((flag === 0) ? this.cyan : this.bk_color);
    this.cslput(i * 16, Math.max(j * 8, 1), this.abort_mes);
  }

  private dispsecond(flag: number) {
    this.cslcolor((flag === 0) ? this.blue : this.bk_color);
    this.cslput(2 * 16, 1, "今回は  " + this.formatd(this.type_speed_time, 4) + "秒かかりました");
  }

  private dispkeyguidonoffmes(flag: number) {
    this.cslcolor((flag === 0) ? this.green : this.bk_color);
    const mes = (this.key_guide_flag === 1) ? this.keymes3 : this.keymes4;
    this.cslput(20 * 16, 2 * 8, mes);
  }

  // ステータスオーバーレイを描画（[F5]ドパガキ [F6]全自動 [F7]無敵）
  private renderCheatStatusOverlay() {
    let statusText = "";
    if (this.settings.dopagaki) statusText += "[F5]ドパガキON ";
    if (this.settings.autoPilot) statusText += "[F6]全自動ON ";
    if (this.settings.invincible) statusText += "[F7]無敵ON ";
    if (this.settings.speedMultiplier > 1.0) statusText += `[F4]${this.settings.speedMultiplier}倍速 `;

    if (statusText) {
      this.cslcolor(this.red);
      this.cslput(0, 48 * 8, statusText.trim());
    }
  }

  private dispptrain(mestb: string) {
    this.cslclr();
    this.disptitle(mestb, this.type_kind_mes);
    if (this.p_count && this.p_count[this.type_kind_no] !== 0) {
      this.dispkaisumes(0, 1, 64);
    }
    this.dispkeygideonoff(0);
    if (this.practice_end_flag === 0) {
      this.dispabortmessage(0, 2, 0);
    }
    this.cslcolor(this.cyan);
    this.cslput(2 * 16, 38 * 8, this.key_type_mes);
    this.dispguidechar(this.key_char, 0);
    this.diposit(0);
    this.dikposit(this.guide_char, 0);
    this.pfinger(0);
    this.difposit(this.guide_char, 0);
    this.renderCheatStatusOverlay();
  }

  private dispctable() {
    let k = 0;
    const kazu_yoko = 40;
    for (let j = 0; j < this.cline_x; j++) {
      for (let i = 0; i < kazu_yoko; i++) {
        if (k >= this.cline_c) break;
        const a = this.chat_t[j][i];
        this.cslcolor(this.key_black);
        this.cslputzscale(this.xxcord(j), this.yycord(i), a, 1.0);
        k++;
      }
    }
  }

  private dispmaxspeedrecord(i1: number, j1: number, i2: number, j2: number) {
    this.cslcolor(this.green);
    this.cslput(i1 * 16, j1 * 8, "最高入力速度" + this.formatf1(this.type_speed_record[this.type_kind_no], 6) + "文字／分");
    this.cslput(i2 * 16, j2 * 8, "達成日 " + this.type_date_record[this.type_kind_no]);
  }

  private disptrain(mest: string) {
    this.cslclr();
    this.disptitle(mest, this.type_kind_mes);
    this.cslcolor(this.green);
    this.cslput(4 * 16, 4 * 8, "制限時間60秒");
    if (this.p_count && this.p_count[this.type_kind_no] !== 0) {
      this.dispkaisumes(0, 1, 31);
    }
    if (this.type_speed_record[this.type_kind_no] !== 0.0) {
      this.dispmaxspeedrecord(3, 20, 3, 49);
    }
    this.dispctable();
    this.dispabortmessage(0, 23, 20);
    this.renderCheatStatusOverlay();
  }

  private dispatrain(mest: string) {
    this.cslclr();
    this.disptitle(mest, this.type_kind_mes);
    this.cslcolor(this.blue);
    this.cslput(2 * 16 + 8, 28 * 8, "ローマ字＝");
    this.cslcolor(this.green);
    this.cslput(4 * 16, 4 * 8, "制限時間60秒");
    if (this.p_count && this.p_count[this.type_kind_no] !== 0) {
      this.dispkaisumes(0, 1, 31);
    }
    if (this.type_speed_record[this.type_kind_no] !== 0.0) {
      this.dispmaxspeedrecord(4, 38, 4, 65);
    }
    this.dispromaji(this.romaji, 0);
    this.dispctable();
    this.dispabortmessage(0, 23, 20);
    this.renderCheatStatusOverlay();
  }

  private dispromaji(a: string | null, flag: number) {
    const ii = this.romaji_line;
    if (a === null) {
      if (flag === 0) {
        this.cslcolor((this.err_char_flag === 1) ? this.color_romaji_err : this.bk_color);
        this.dispbkchar(ii, 38 * 8 + 8, 1.4);
      } else {
        this.cslputu(this.romaji_underline, 38 * 8, "aaaa", 1, this.bk_color);
      }
      return;
    }
    const aLen = a.length;
    if (flag === 0) {
      for (let i = 0; i < aLen; i++) {
        this.cslcolor((this.err_char_flag === 1 && i === this.r_count) ? this.color_romaji_err : this.bk_color);
        this.dispbkchar(ii, 38 * 8 + 8 + i * 32, 1.4);
        this.cslcolor(this.color_romaji);
        this.cslputzscale(ii, 38 * 8 + 8 + i * 32, a.charAt(i), 2.0);
        if (i < this.r_count) {
          this.cslputu(this.romaji_underline, 38 * 8 + i * 32, "aaaa", 1, this.color_romaji_under_line);
        }
      }
    } else {
      this.cslcolor(this.bk_color);
      for (let i = 0; i < aLen; i++) {
        this.cslputzscale(ii, 38 * 8 + 8 + i * 32, a.charAt(i), 2.0);
        this.cslputu(this.romaji_underline, 38 * 8 + i * 32, "aaaa", 1, this.bk_color);
      }
    }
  }

  private dispbkchar(i: number, j: number, scale: number) {
    const fontSize = this.cslfontsize(scale);
    const xx1 = this.xcord(i);
    const xx2 = this.xcord(i + 16);
    const xx = Math.floor((xx2 + xx1 - fontSize) / 2);
    const yy1 = this.ycord(j);
    const yy2 = this.ycord(j + 16);
    const yy = Math.floor((yy2 + yy1 - fontSize) / 2);
    this.g.fillRect(yy, xx, fontSize, fontSize);
  }

  private disperrchar(flag: number) {
    this.cslcolor((flag === 1) ? this.key_red : this.bk_color);
    const ii = this.xxcord(this.c_p2);
    const jj = this.yycord(this.c_p1);
    this.dispbkchar(ii, jj, 1.0);
    this.cslcolor(this.key_black);
    this.cslputzscale(ii, jj, this.chat_t[this.c_p2][this.c_p1], 1.0);
  }

  private ppseiseki(i: number, j: number, menu_mes: string[], r_speed: number[], r_date: string[], r_time: number[]) {
    for (let ii = 0; ii < j; ii++) {
      this.cslput((i + ii) * 16, 1, menu_mes[ii]);
      if (r_speed[ii] !== 0.0) {
        this.cslput((i + ii) * 16, 33 * 8, this.formatf1(r_speed[ii], 6));
        this.cslput((i + ii) * 16, 44 * 8, r_date[ii]);
      }
      this.cslput((i + ii) * 16, 54 * 8, this.tconv(r_time[ii]));
    }
  }

  public dispseiseki() {
    this.cslclr();
    const a = this.tconv(this.rt_t);
    this.cslcolor(this.green);
    this.cslput(1, 1, "前回までの練習時間　" + a);
    this.cslcolor(this.blue);
    this.cslput(1, 43 * 8, this.return_mes);

    const time_i = this.seisekiruiseki() - this.rt_t;
    this.cslcolor(this.green);
    this.cslput(16, 1, "今回の練習時間　　　" + this.tconv(time_i));

    this.cslcolor(this.blue);
    this.cslput(3 * 16, 1, "練習項目");
    this.cslput(3 * 16, 19 * 8, "タイプ速度　文字／分");
    this.cslput(3 * 16, 46 * 8, "達成日");
    this.cslput(3 * 16, 59 * 8, "累積練習時間");

    this.cslcolor(this.orange);
    this.cslput(4 * 16, 54 * 8, this.tconv(this.p_time));
    this.cslput(4 * 16, 1, this.menu_mes_s[0]);

    this.ppseiseki(6, 8, this.menu_mes, this.r_speed, this.r_date, this.r_time);
    this.ppseiseki(15, 7, this.menu_mes_w, this.w_speed, this.w_date, this.w_time);
    this.ppseiseki(23, 2, this.menu_mes_r, this.a_speed, this.a_date, this.a_time);
    this.renderCheatStatusOverlay();
  }

  public dispmen() {
    if (this.exec_func_no === 1) {
      this.menexe(this.menu_mes_s, this.menu_cord_s, this.menu_s_function, this.menu_s_sel_flag, this.mes0);
    } else if (this.exec_func_no === 21) {
      this.menexe(this.menu_mes, this.menu_cord, this.position_menu_function, this.position_sel_flag, this.mes0a);
    } else if (this.exec_func_no === 22) {
      this.menexe(this.menu_mes, this.menu_cord, this.random_menu_function, this.random_sel_flag, this.mes0b);
    } else if (this.exec_func_no === 23) {
      this.menexe(this.menu_mes_w, this.menu_cord, this.word_menu_function, this.word_sel_flag, this.mes0c);
    } else if (this.exec_func_no === 24) {
      this.menexe(this.menu_mes_r, this.menu_cord, this.romaji_menu_function, this.romaji_sel_flag, this.mes0d);
    } else if (this.exec_func_no === 29) {
      this.dispseiseki();
    } else if (this.exec_func_no === 70) {
      this.dispOnlineBattleWait();
    } else if (this.exec_func_no === 88) {
      this.dispAchievementsScreen();
    } else if (this.exec_func_no === 90) {
      this.dispSecretMenu();
    } else if (this.exec_func_no > 400 && this.exec_func_no < 500) {
      this.dispptrain(this.mestb);
    } else if (this.exec_func_no > 500 && this.exec_func_no < 600) {
      this.disptrain(this.mestc);
    } else if (this.exec_func_no > 600 && this.exec_func_no < 700) {
      this.disptrain(this.mesta);
    } else if (this.exec_func_no > 700 && this.exec_func_no < 800) {
      this.dispatrain(this.mesta);
    }

    this.onStateChange?.({
      modeName: this.type_kind_mes || (this.exec_func_no === 1 ? "トップメニュー" : this.exec_func_no === 90 ? "裏メニュー" : this.exec_func_no === 88 ? "実績一覧" : this.exec_func_no === 70 ? "オンライン対戦" : "メニュー"),
      funcNo: this.exec_func_no,
      inPractice: this.exec_func_no > 400 && this.exec_func_no < 800
    });
  }

  public dispSecretMenu() {
    achievementManager.unlock('secret_menu');
    const autoSpeedStr = `${this.settings.autoSpeed}ms`;
    const speedMultStr = `${this.settings.speedMultiplier}倍`;
    const menu_items = [
      `ドパガキモード: ${this.settings.dopagaki ? "有効" : "無効"}`,
      `完全オートパイロット: ${this.settings.autoPilot ? "有効" : "無効"}`,
      `無敵イージーモード: ${this.settings.invincible ? "有効" : "無効"}`,
      `自動入力速度切替: ${autoSpeedStr}`,
      `速度倍率切替: ${speedMultStr}`,
      `効果音サウンド: ${sound.enabled ? "ON" : "OFF"}`,
      "獲得実績一覧確認",
      "メニューに戻る"
    ];
    this.menexe(menu_items, this.menu_cord_secret, this.secret_menu_function, this.secret_sel_flag, this.mes0_secret);
  }

  public dispAchievementsScreen() {
    this.cslclr();
    this.cslcolor(this.magenta);
    this.cslmencenter(1, "●●●  美佳のタイプトレーナー 獲得実績一覧  ●●●");

    const list = achievementManager.getList();
    this.cslcolor(this.blue);
    this.cslput(1, 43 * 8, "ESCまたはEnterキーでメニューに戻ります");

    list.forEach((ach, index) => {
      const line = 3 + index * 2;
      if (line >= 24) return;
      if (ach.unlockedAt) {
        this.cslcolor(this.green);
        this.cslput(line * 16, 2 * 8, `${ach.icon} ${ach.title} [達成: ${ach.unlockedAt}] - ${ach.desc}`);
      } else {
        this.cslcolor(this.key_gray);
        this.cslput(line * 16, 2 * 8, `🔒 ${ach.title} - ${ach.desc}`);
      }
    });

    this.renderCheatStatusOverlay();
  }

  public dispOnlineBattleWait() {
    this.cslclr();
    this.cslcolor(this.magenta);
    this.cslmencenter(1, "●●●  美佳のタイプトレーナー オンライン対戦設定  ●●●");

    const genreNames: Record<string, string> = {
      basic_words: '基本英単語',
      msdos: 'MS-DOSコマンド',
      c_lang: 'C言語コード',
      romaji_words: 'ローマ字単語(完全版)',
      random_home: 'ランダム練習',
    };

    this.cslcolor(this.cyan);
    this.cslput(3 * 16, 10 * 8, `[1] 部屋選択: ${battleManager.currentRoom} (1キーで切替)`);
    this.cslput(5 * 16, 10 * 8, `[2] トレーナー(単元): ${genreNames[battleManager.rules.genre] || '基本英単語'} (2キーで切替)`);
    this.cslput(7 * 16, 10 * 8, `[3] チート制限: ${battleManager.rules.allowAutoInput ? "チート使用許可" : "チート禁止(ガチ勝負)"} (3キーで切替)`);

    if (battleManager.opponentState) {
      this.cslcolor(this.green);
      this.cslmencenter(10 * 16, `【対戦相手接続中: ${battleManager.opponentState.name}】`);
      this.cslcolor(this.cyan);
      this.cslmencenter(12 * 16, "Enterキーを押すと同期マッチを開始します！");
    } else {
      this.cslcolor(this.orange);
      this.cslmencenter(10 * 16, `【対戦相手を待機中... (${battleManager.currentRoom})】`);
      this.cslcolor(this.key_black);
      this.cslmencenter(12 * 16, "同じブラウザで別のタブ（またはウィンドウ）を開いてください");
    }

    this.cslcolor(this.blue);
    this.cslmencenter(15 * 16, "Enterキー: マッチ開始 / ESCキー: メニューに戻る");

    this.renderCheatStatusOverlay();
  }

  public cycleAutoSpeed() {
    const speeds = [10, 25, 50, 100, 200];
    const curIdx = speeds.indexOf(this.settings.autoSpeed);
    const nextSpeed = (curIdx === -1 || curIdx === speeds.length - 1) ? speeds[0] : speeds[curIdx + 1];
    this.setAutoSpeed(nextSpeed);
  }

  public cycleBattleRoom() {
    const rooms = ['部屋1 (Room 1)', '部屋2 (Room 2)', '部屋3 (Room 3)'];
    const idx = rooms.indexOf(battleManager.currentRoom);
    const nextRoom = (idx === -1 || idx === rooms.length - 1) ? rooms[0] : rooms[idx + 1];
    battleManager.setRoom(nextRoom);
    this.dispOnlineBattleWait();
  }

  public cycleBattleGenre() {
    const genres = ['basic_words', 'msdos', 'c_lang', 'romaji_words', 'random_home'] as const;
    const idx = genres.indexOf(battleManager.rules.genre as typeof genres[number]);
    const next = (idx === -1 || idx === genres.length - 1) ? genres[0] : genres[idx + 1];
    battleManager.rules.genre = next;
    this.dispOnlineBattleWait();
  }

  public toggleBattleCheatRule() {
    battleManager.rules.allowAutoInput = !battleManager.rules.allowAutoInput;
    battleManager.rules.allowAutoPilot = battleManager.rules.allowAutoInput;
    battleManager.rules.allowInvincible = battleManager.rules.allowAutoInput;
    this.dispOnlineBattleWait();
  }

  public startConfiguredBattle() {
    let wordList: string[] = [];
    const genre = battleManager.rules.genre;

    if (genre === 'msdos') wordList = [...MIKA_w_seq[1]];
    else if (genre === 'c_lang') wordList = [...MIKA_w_seq[2]];
    else if (genre === 'romaji_words') wordList = [...MIKA_romaji_tango_table].slice(0, 50);
    else if (genre === 'random_home') wordList = ["asdf", "jkl;", "fdsa", "jkl;", "asdf", "jkl;"];
    else wordList = [...MIKA_w_seq[0]];

    const shuffled = wordList.sort(() => 0.5 - Math.random()).slice(0, battleManager.rules.wordCount || 25);
    battleManager.startMatchWithOpponent(shuffled);
    this.startBattlePractice(shuffled);
  }

  private menexe(menu_mes: string[], menu_cord: number[][], menu_function: number[], sel_flag: number[], menut: string) {
    this.max_x_flag = 0;
    this.max_y_flag = 0;
    this.cslclr();
    this.cslcolor(this.magenta);
    this.cslmencenter(1, menut);

    this.max_x_flag = 1;
    this.max_y_flag = 1;
    this.cslcolor(this.cyan);
    this.cslput(18 * 16, 29 * 8, "番号キーを押して下さい");

    const j = menu_mes.length;
    for (let i = 0; i < j; i++) {
      const x = menu_cord[i][0];
      const y = menu_cord[i][1];
      if (sel_flag[i] === 1) this.cslcolor(this.green);
      else if (i === 6 && menu_function[i] === 777) this.cslcolor(this.orange); // 裏メニューはオレンジ
      else this.cslcolor(this.blue);

      this.cslput(x, y, menu_mes[i]);
      if (sel_flag[i] === 1) this.cslputu(x, y, menu_mes[i], 1, this.green);
      this.cslputzscale(x, y - 4 * this.width_y, String.fromCharCode('1'.charCodeAt(0) + i), 1.0);
    }

    this.renderCheatStatusOverlay();

    this.menu_function_table = menu_function;
    this.sel_flag = sel_flag;
    this.max_x_flag = 0;
    this.max_y_flag = 0;
  }

  private mencom(menu_function_table: number[], sel_flag: number[], nChar: string): number {
    if (!menu_function_table || menu_function_table.length === 0) return 0;
    const ii = menu_function_table.length;

    if (nChar === '\x1b') {
      for (let i = 0; i < ii; i++) {
        if (menu_function_table[i] > 9000 && menu_function_table[i] < 9999) {
          return menu_function_table[i];
        }
      }
      return 0;
    }
    if (nChar < '1' || nChar > '9') return 0;

    const iii = nChar.charCodeAt(0) - 0x31;
    if (iii < ii) {
      const func_no = menu_function_table[iii];
      let sel_flag1 = 0;
      for (let i = 0; i < ii; i++) {
        if (sel_flag[i] !== 0) sel_flag1 = i + 1;
      }
      if (0 < func_no && func_no < 9000) {
        if (sel_flag1 !== 0) sel_flag[sel_flag1 - 1] = 0;
        sel_flag[iii] = 1;
      }
      return func_no;
    }
    return 0;
  }

  public exec_func(nChar: string) {
    // 画面固有のキーハンドリング (実績画面: 88)
    if (this.exec_func_no === 88) {
      if (nChar === '\x1b' || nChar === '\r' || nChar === '\n') {
        this.exec_func_no = 1;
        this.dispmen();
        return 1;
      }
    }

    // 画面固有のキーハンドリング (オンライン対戦設定画面: 70)
    if (this.exec_func_no === 70) {
      if (nChar === '1') {
        this.cycleBattleRoom();
        return 1;
      }
      if (nChar === '2') {
        this.cycleBattleGenre();
        return 1;
      }
      if (nChar === '3') {
        this.toggleBattleCheatRule();
        return 1;
      }
      if (nChar === '\x1b') {
        this.exec_func_no = 1;
        this.dispmen();
        return 1;
      }
      if (nChar === '\r' || nChar === '\n') {
        this.startConfiguredBattle();
        return 1;
      }
    }

    const func_no = this.mencom(this.menu_function_table, this.sel_flag, nChar);
    if (func_no !== 0) {
      this.menu_function_table = [];

      // 裏メニュー内の機能分岐 (901〜907)
      if (func_no === 901) {
        this.toggleDopagaki();
        this.exec_func_no = 90;
        this.dispmen();
        return 1;
      }
      if (func_no === 902) {
        this.toggleAutoPilot();
        this.exec_func_no = 90;
        this.dispmen();
        return 1;
      }
      if (func_no === 903) {
        this.toggleInvincible();
        this.exec_func_no = 90;
        this.dispmen();
        return 1;
      }
      if (func_no === 904) {
        this.cycleAutoSpeed();
        this.exec_func_no = 90;
        this.dispmen();
        return 1;
      }
      if (func_no === 905) {
        this.cycleSpeedMultiplier();
        this.exec_func_no = 90;
        this.dispmen();
        return 1;
      }
      if (func_no === 906) {
        sound.enabled = !sound.enabled;
        this.exec_func_no = 90;
        this.dispmen();
        return 1;
      }
      if (func_no === 907) {
        this.exec_func_no = 88;
        this.dispmen();
        return 1;
      }

      this.exec_func_no = func_no;

      if (this.exec_func_no === 70) {
        this.dispOnlineBattleWait();
        return 1;
      }

      if (this.exec_func_no === 88) {
        this.dispAchievementsScreen();
        return 1;
      }

      if (this.exec_func_no === 90) {
        this.dispSecretMenu();
        return 1;
      }

      if (this.exec_func_no === 30) {
        if (window.confirm("成績を消去してもいいですか？")) {
          this.seisekiclear();
        }
        this.exec_func_no = 1;
      } else {
        if (this.exec_func_no > 9000) {
          this.exec_func_no = this.exec_func_no - 9000;
        } else if (this.exec_func_no > 400 && this.exec_func_no < 800) {
          this.preptrain(this.exec_func_no);
        }
      }
      this.dispmen();
      return 1;
    } else {
      if (nChar === '\x1b' && (this.exec_func_no === 29 || this.exec_func_no === 90 || this.exec_func_no === 88)) {
        this.exec_func_no = 1;
        this.dispmen();
        return 1;
      } else if (this.exec_func_no > 400 && this.exec_func_no < 500) {
        this.procptrain(nChar);
        return 1;
      } else if (this.exec_func_no > 500 && this.exec_func_no < 600) {
        this.proctrain(nChar);
        return 1;
      } else if (this.exec_func_no > 600 && this.exec_func_no < 700) {
        this.proctrain(nChar);
        return 1;
      } else if (this.exec_func_no > 700 && this.exec_func_no < 800) {
        this.procatrain(nChar);
        return 1;
      }
    }
    return 0;
  }

  // --- Practice Logic ---
  public preptrain(func_no: number) {
    achievementManager.unlock('first_step');

    if (func_no > 400 && func_no < 500) {
      this.type_kind_no = func_no - 401;
      this.cookie_kind = 'P';
      this.practice_end_flag = 0;
      this.menu_kind_flag = 1;
      this.key_guide_flag = 0;
      this.time_start_flag = 0;
      this.type_kind_mes = this.menu_mes[this.type_kind_no];
      this.p_count = this.p_count_position;
      this.char_table = MIKA_h_pos[this.type_kind_no];
      this.char_position = this.randomchar(this.char_table, -1);
      this.key_char = this.char_table[this.char_position];
      this.guide_char = this.key_char;
      this.err_char = 0;
      this.type_err_count = 0;
      this.type_count = 0;
    } else if (func_no > 500 && func_no < 600) {
      this.type_kind_no = func_no - 501;
      this.cookie_kind = 'R';
      this.type_speed_record = this.r_speed;
      this.type_date_record = this.r_date;
      this.type_time_record = this.r_time;
      this.p_count = this.p_count_random;
      this.practice_end_flag = 0;
      this.type_kind_mes = this.menu_mes[this.type_kind_no];
      this.char_table = MIKA_h_pos[this.type_kind_no];
      this.inctable(this.char_table, this.type_speed_record[this.type_kind_no]);
      this.prepflags();
    } else if (func_no > 600 && func_no < 700) {
      this.type_kind_no = func_no - 601;
      this.cookie_kind = 'W';
      this.type_speed_record = this.w_speed;
      this.type_date_record = this.w_date;
      this.type_time_record = this.w_time;
      this.p_count = this.p_count_word;
      this.practice_end_flag = 0;
      this.type_kind_mes = this.menu_mes_w[this.type_kind_no];
      this.word_table = MIKA_w_seq[this.type_kind_no];
      this.intwordtable(this.word_table, this.type_speed_record[this.type_kind_no]);
      this.prepflags();
    } else if (func_no > 700 && func_no < 800) {
      this.type_kind_no = func_no - 701;
      this.cookie_kind = 'A';
      this.type_speed_record = this.a_speed;
      this.type_date_record = this.a_date;
      this.type_time_record = this.a_time;
      this.p_count = this.p_count_romaji;
      this.practice_end_flag = 0;
      this.type_kind_mes = this.menu_mes_r[this.type_kind_no];
      if (this.type_kind_no === 0) {
        this.inatable(MIKA_kana, this.type_speed_record[this.type_kind_no]);
      } else {
        this.intawordtable(MIKA_romaji_tango_table, this.type_speed_record[this.type_kind_no]);
      }
      this.prepflags();
      this.getromaji(this.w_count);
    }
  }

  private prepflags() {
    this.c_p1 = 0;
    this.c_p2 = 0;
    this.type_count = 0;
    this.type_err_count = 0;
    this.err_char_flag = 0;
    this.type_speed = 0.0;
    this.type_speed2 = 0.0;
    this.type_speed_time = 0.0;
    this.ttype_speed_time = 0.0;
    this.w_count = 0;
    this.r_count = 0;
    this.time_start_flag = 0;
    this.utikiri_flag = 0;
    this.utikiri_flag2 = 0;
    this.type_syuryou_flag = 0;
    this.sec_count = 0;
  }

  private procptrain(nChar: string) {
    if (nChar === ' ') {
      if (this.practice_end_flag === 0) {
        if (this.menu_kind_flag === 1) {
          this.menu_kind_flag = 3;
          if (this.type_count === 0) this.setProcptimer(3000);
          else this.setProcptimer(2000);
          this.difposit(this.guide_char, 1);
          this.keyguideoff();
        } else {
          if (this.guide_char === 0 && this.procptimer) clearTimeout(this.procptimer);
          this.menu_kind_flag = 1;
          this.keyguideon();
          this.difposit(this.guide_char, 0);
        }
      } else if (this.practice_end_flag === 1) {
        if (this.menu_kind_flag === 1) {
          this.menu_kind_flag = 3;
          this.keyguideoff();
        } else {
          this.menu_kind_flag = 1;
          this.keyguideon();
        }
      }
    } else if (nChar === '\x1b') {
      if (this.practice_end_flag === 0) {
        this.practice_end_flag = 1;
        if (this.procptimer) clearTimeout(this.procptimer);
        if (this.time_start_flag !== 0) {
          this.type_end_time = performance.now();
          this.type_speed_time = Math.floor((this.type_end_time - this.type_start_time) / 1000.0);
          this.p_time += this.type_speed_time;
          this.saveStorage();
        }
        this.procpabort();
      } else {
        this.exec_func_no = this.funcbackmenu(this.exec_func_no);
        this.dispmen();
      }
    } else if ((nChar === '\r' || nChar === '\n') && this.practice_end_flag === 1) {
      this.practice_end_flag = 0;
      this.dispkeyguidonoffmes(1);
      this.dispretrymessage(1);
      this.dispsecond(1);
      this.dispabortmessage(0, 2, 0);
      this.pfinger(0);
      this.dispseikai(2);
      this.key_guide_flag = 0;
      this.type_count = 0;
      this.disperrorcount(2, 3, 64);
      this.type_err_count = 0;
      this.time_start_flag = 0;
      this.procpnextchar();
      if (this.menu_kind_flag === 3) {
        this.setProcptimer(3000);
      }
    } else if (this.practice_end_flag === 0) {
      // 無敵イージーモード時は、何を押しても正解扱いにする
      const isCorrect = this.settings.invincible || (this.uppertolower(nChar) === this.uppertolower(this.key_char));

      if (isCorrect) {
        sound.playCorrect();
        achievementManager.addTypedChar();
        this.triggerParticle(this.key_char);

        if (this.menu_kind_flag === 3 && this.guide_char === 0 && this.procptimer) {
          clearTimeout(this.procptimer);
        }
        this.dispseikai(1);
        if (this.time_start_flag === 0) {
          this.type_start_time = performance.now();
          this.time_start_flag = 1;
        }
        this.type_count++;
        this.dispseikai(0);

        if (this.type_count >= 100) achievementManager.unlock('type_100');

        if (this.type_count >= 60) {
          sound.playClear();
          if (this.type_err_count === 0) achievementManager.unlock('perfect_accuracy');

          this.type_end_time = performance.now();
          this.type_speed_time = Math.floor((this.type_end_time - this.type_start_time) / 1000.0);
          this.p_time += this.type_speed_time;
          this.saveStorage();
          if (this.menu_kind_flag === 3) this.dikposit(this.err_char, 2);
          else this.dikposit(this.err_char, 1);
          this.err_char = 0;
          this.procpabort();
          this.practice_end_flag = 1;
          this.type_end_flag = 1;
          this.dispkaisumes(1, 1, 64);
          if (this.p_count) this.p_count[this.type_kind_no]++;
          this.dispsecond(0);
          this.dispkaisumes(0, 1, 64);
          if (this.type_err_count <= 5 && this.menu_kind_flag === 1) {
            this.key_guide_flag = 1;
            this.dispkeyguidonoffmes(0);
          } else if (this.type_err_count >= 15 && this.menu_kind_flag === 3) {
            this.key_guide_flag = 2;
            this.dispkeyguidonoffmes(0);
          }
        } else {
          this.procpnextchar();
          if (this.menu_kind_flag === 3) this.setProcptimer(2000);
        }
      } else {
        sound.playMiss();
        this.disperrorcount(1, 3, 64);
        this.type_err_count++;
        this.disperrorcount(0, 3, 64);
        if (this.menu_kind_flag === 3) this.dikposit(this.err_char, 2);
        else this.dikposit(this.err_char, 1);
        this.err_char = this.convertupperlower(this.key_char, nChar);
        this.dikposit(this.err_char, 3);
      }
    }
  }

  private triggerParticle(char: string) {
    if (this.settings.dopagaki && this.onParticleTrigger) {
      const x = Math.random() * this.canvas.width;
      const y = Math.random() * this.canvas.height;
      this.onParticleTrigger(char, x, y);
    }
  }

  private keyguideoff() {
    this.dispkeygideonoff(1);
    this.diposit(3);
    this.guide_char = 0;
    this.dikposit(this.err_char, 3);
  }

  private keyguideon() {
    this.dispkeygideonoff(1);
    this.diposit(2);
    this.guide_char = this.key_char;
    this.dikposit(this.guide_char, 0);
    this.dikposit(this.err_char, 3);
  }

  private procpabort() {
    this.dispabortmessage(1, 2, 0);
    this.pfinger(1);
    this.dispretrymessage(0);
  }

  private procpnextchar() {
    if (this.menu_kind_flag === 3) {
      this.dikposit(this.err_char, 2);
      this.dikposit(this.guide_char, 2);
      if (this.guide_char !== 0) this.difposit(this.guide_char, 1);
    } else {
      this.dikposit(this.err_char, 1);
      this.dikposit(this.guide_char, 1);
      this.difposit(this.guide_char, 1);
    }
    this.err_char = 0;
    this.dispguidechar(this.key_char, 1);
    this.char_position = this.randomchar(this.char_table, this.char_position);
    this.key_char = this.char_table[this.char_position];
    this.guide_char = (this.menu_kind_flag === 1) ? this.key_char : 0;
    this.dispguidechar(this.key_char, 0);
    this.dikposit(this.guide_char, 0);
    this.difposit(this.guide_char, 0);
  }

  private setProcptimer(ms: number) {
    if (this.procptimer) clearTimeout(this.procptimer);
    this.procptimer = window.setTimeout(() => {
      if (this.practice_end_flag === 0) {
        this.guide_char = this.key_char;
        this.dikposit(this.guide_char, 0);
        this.difposit(this.guide_char, 0);
      }
    }, ms);
  }

  private proctrain(nChar: string) {
    if (nChar === '\x1b') {
      if (this.practice_end_flag === 0) {
        this.practice_end_flag = 1;
        if (this.time_start_flag === 1) {
          if (this.procrtimer) clearInterval(this.procrtimer);
          this.type_end_time = performance.now();
          this.ttype_speed_time = (this.type_end_time - this.type_start_time) / 1000.0;
          if (this.ttype_speed_time <= 0.0) this.ttype_speed_time = 1.0;
          this.type_time_record[this.type_kind_no] += Math.floor(this.ttype_speed_time);
          this.saveStorage();
        }
        this.dispabortmessage(1, 23, 20);
        this.dispretrymessage(0);
      } else {
        if (this.type_syuryou_flag === 1 || this.type_syuryou_flag === 2) {
          this.type_speed_record[this.type_kind_no] = this.type_speed;
          this.type_date_record[this.type_kind_no] = this.type_date;
        }
        this.exec_func_no = this.funcbackmenu(this.exec_func_no);
        this.dispmen();
      }
    } else if ((nChar === '\r' || nChar === '\n') && this.practice_end_flag === 1) {
      this.practice_end_flag = 0;
      if (this.type_syuryou_flag === 1 || this.type_syuryou_flag === 2) {
        this.type_speed_record[this.type_kind_no] = this.type_speed;
        this.type_date_record[this.type_kind_no] = this.type_date;
      }
      if (600 < this.exec_func_no && this.exec_func_no < 700) {
        this.intwordtable(this.word_table, this.type_speed_record[this.type_kind_no]);
      } else {
        this.inctable(this.char_table, this.type_speed_record[this.type_kind_no]);
      }
      this.prepflags();
      this.dispmen();
    } else if (this.practice_end_flag === 0) {
      if (this.time_start_flag === 1) {
        this.type_end_time = performance.now();
        this.ttype_speed_time = (this.type_end_time - this.type_start_time) / 1000.0;
      }
      this.key_char = this.chat_t[this.c_p2][this.c_p1];

      // 無敵イージーモード
      const isCorrect = this.settings.invincible || (this.uppertolower(nChar) === this.uppertolower(this.key_char));

      if (isCorrect) {
        sound.playCorrect();
        achievementManager.addTypedChar();
        this.triggerParticle(this.key_char);

        if (this.type_count + 1 >= this.cline_c) {
          if (this.practice_end_flag === 0) {
            this.practice_end_flag = 1;
            if (this.procrtimer) clearInterval(this.procrtimer);
            sound.playClear();

            this.type_count++;
            this.utikiri_flag = 1;
            this.utikiri_flag2 = 0;
            if (this.err_char_flag === 1) {
              this.err_char_flag = 0;
              this.disperrchar(0);
            }
            this.cslputu(this.t_line * 16 + this.c_p2 * 20, this.c_p1 * 16, "aa", 1, this.color_text_under_line);
            if (this.c_p1 < 39) this.c_p1++;
            else { this.c_p1 = 0; this.c_p2++; }

            if (this.ttype_speed_time > 60.0) {
              this.ttype_speed_time = 60.0;
              this.type_end_time = this.type_start_time + 60000.0;
              this.utikiri_flag = 0;
            }
            this.procdispspeed();
            this.type_time_record[this.type_kind_no] += Math.floor(this.ttype_speed_time);
            this.prockiroku();
            this.proctrainexit();

            // 対戦進捗同期 (ゴール送信)
            battleManager.broadcastProgress(this.type_count, this.cline_c, this.type_speed, true, true);

            if (this.type_err_count === 0) achievementManager.unlock('perfect_accuracy');
          }
          return;
        }

        this.type_count++;

        // 対戦進捗同期
        battleManager.broadcastProgress(this.type_count, this.cline_c, this.type_speed, false, false);

        if (this.time_start_flag === 0) {
          this.type_start_time = performance.now();
          this.type_speed_time = 0;
          this.ttype_speed_time = 0;
          this.time_start_flag = 1;
          this.procrtimer = window.setInterval(() => this.onProcrtimer(), 1000);
        }
        if (this.err_char_flag === 1) {
          this.err_char_flag = 0;
          this.disperrchar(0);
        }
        this.cslputu(this.t_line * 16 + this.c_p2 * 20, this.c_p1 * 16, "aa", 1, this.color_text_under_line);
        if (this.c_p1 < 39) this.c_p1++;
        else { this.c_p1 = 0; this.c_p2++; }
      } else {
        sound.playMiss();
        this.err_char_flag = 1;
        this.disperrchar(1);
        this.disperrorcount(1, 5, 49);
        this.type_err_count++;
        this.disperrorcount(0, 5, 49);
      }
    }
  }

  private onProcrtimer() {
    this.sec_count++;
    if (this.sec_count >= 60.0) {
      if (this.procrtimer) clearInterval(this.procrtimer);
      if (this.practice_end_flag === 0) {
        this.practice_end_flag = 1;
        sound.playClear();
        this.ttype_speed_time = 60.0;
        this.type_end_time = this.type_start_time + 60000;
        this.procdispspeed();
        this.type_time_record[this.type_kind_no] += this.ttype_speed_time;
        this.prockiroku();
        this.proctrainexit();
      }
    } else {
      if (this.practice_end_flag === 0) {
        this.type_end_time = this.type_start_time + this.sec_count * 1000;
        this.ttype_speed_time = this.sec_count;
        this.procdispspeed();
      }
    }
  }

  private procatrain(nChar: string) {
    if (nChar === '\x1b') {
      if (this.practice_end_flag === 0) {
        this.practice_end_flag = 1;
        if (this.time_start_flag === 1) {
          if (this.procatimer) clearInterval(this.procatimer);
          this.type_end_time = performance.now();
          this.ttype_speed_time = (this.type_end_time - this.type_start_time) / 1000.0;
          if (this.ttype_speed_time <= 0.0) this.ttype_speed_time = 1.0;
          this.type_time_record[this.type_kind_no] += Math.floor(this.ttype_speed_time);
          this.saveStorage();
        }
        this.dispabortmessage(1, 23, 20);
        this.dispretrymessage(0);
      } else {
        if (this.type_syuryou_flag === 1 || this.type_syuryou_flag === 2) {
          this.type_speed_record[this.type_kind_no] = this.type_speed;
          this.type_date_record[this.type_kind_no] = this.type_date;
        }
        this.exec_func_no = this.funcbackmenu(this.exec_func_no);
        this.dispmen();
      }
    } else if ((nChar === '\r' || nChar === '\n') && this.practice_end_flag === 1) {
      this.practice_end_flag = 0;
      if (this.type_syuryou_flag === 1 || this.type_syuryou_flag === 2) {
        this.type_speed_record[this.type_kind_no] = this.type_speed;
        this.type_date_record[this.type_kind_no] = this.type_date;
      }
      if (this.exec_func_no === 701) {
        this.inatable(MIKA_kana, this.type_speed_record[this.type_kind_no]);
      } else {
        this.intawordtable(MIKA_romaji_tango_table, this.type_speed_record[this.type_kind_no]);
      }
      this.prepflags();
      this.getromaji(this.w_count);
      this.dispmen();
    } else if (this.practice_end_flag === 0) {
      if (this.time_start_flag === 1) {
        this.type_end_time = performance.now();
        this.ttype_speed_time = (this.type_end_time - this.type_start_time) / 1000.0;
      }
      const lowered = this.uppertolower(nChar);
      const isCorrect = this.settings.invincible || (this.key_char === lowered || this.key_char2 === lowered);

      if (isCorrect) {
        sound.playCorrect();
        achievementManager.addTypedChar();
        this.triggerParticle(this.key_char as string);

        if (this.key_char === ' ' ||
           ((this.key_char === lowered || this.settings.invincible) && (this.r_count + 1 >= this.romaji_length)) ||
           ((this.key_char2 === lowered) && (this.r_count + 1 >= this.romaji_length2))) {
          if (this.w_count + 1 >= this.cline_c) {
            if (this.practice_end_flag === 0) {
              this.practice_end_flag = 1;
              if (this.procatimer) clearInterval(this.procatimer);
              sound.playClear();

              this.w_count++;
              this.type_count++;
              if (this.err_char_flag === 1) {
                this.err_char_flag = 0;
                this.disperrchar(0);
                this.dispromaji(this.romaji, 0);
              }
              this.cslputu(this.romaji_underline, 38 * 8 + this.r_count * 32, "aaaa", 1, this.color_romaji_under_line);
              this.r_count++;
              this.cslputu(this.t_line * 16 + this.c_p2 * 20, this.c_p1 * 16, "aa", 1, this.color_text_under_line);
              this.utikiri_flag = 1;
              this.utikiri_flag2 = 0;
              if (this.ttype_speed_time > 60.0) {
                this.ttype_speed_time = 60.0;
                this.type_end_time = this.type_start_time + 60000.0;
                this.utikiri_flag = 0;
              }
              this.procdispspeed2();
              this.type_time_record[this.type_kind_no] += Math.floor(this.ttype_speed_time);
              this.prockiroku();
              this.proctrainexit2();
              if (this.c_p1 < 39) this.c_p1++;
              else { this.c_p1 = 0; this.c_p2++; }

              battleManager.broadcastProgress(this.w_count, this.cline_c, this.type_speed, true, true);
              if (this.type_err_count === 0) achievementManager.unlock('perfect_accuracy');
            }
            return;
          }
        }

        this.type_count++;
        battleManager.broadcastProgress(this.w_count, this.cline_c, this.type_speed, false, false);

        if (this.time_start_flag === 0) {
          this.type_start_time = performance.now();
          this.type_speed_time = 0;
          this.ttype_speed_time = 0;
          this.time_start_flag = 1;
          this.procatimer = window.setInterval(() => this.onProcatimer(), 1000);
        }
        if (this.key_char !== lowered && this.key_char2 === lowered) {
          this.dispromaji(this.romaji, 1);
          this.key_char = this.key_char2 as string;
          this.key_char2 = 0;
          this.romaji = this.romaji2;
          this.romaji_length = this.romaji_length2;
          this.romaji2 = null;
          this.romaji_length2 = 0;
          this.dispromaji(this.romaji, 0);
        } else if (this.key_char === lowered && this.key_char2 !== lowered) {
          this.key_char2 = 0;
          this.romaji2 = null;
          this.romaji_length2 = 0;
        }
        if (this.err_char_flag === 1) {
          this.err_char_flag = 0;
          this.disperrchar(0);
          this.dispromaji(this.romaji, 0);
        }
        this.cslputu(this.romaji_underline, 38 * 8 + this.r_count * 32, "aaaa", 1, this.color_romaji_under_line);
        this.r_count++;
        if (this.key_char === ' ' || this.r_count >= this.romaji_length) {
          this.w_count++;
          this.cslputu(this.t_line * 16 + this.c_p2 * 20, this.c_p1 * 16, "aa", 1, this.color_text_under_line);
          if (this.c_p1 < 39) this.c_p1++;
          else { this.c_p1 = 0; this.c_p2++; }
          this.r_count = 0;
          this.dispromaji(this.romaji, 1);
          this.getromaji(this.w_count);
          this.dispromaji(this.romaji, 0);
        } else {
          this.key_char = this.romaji ? this.romaji.charAt(this.r_count) : ' ';
          this.key_char2 = this.romaji2 ? this.romaji2.charAt(this.r_count) : 0;
        }
      } else {
        sound.playMiss();
        this.err_char_flag = 1;
        this.disperrorcount(1, 5, 65);
        this.type_err_count++;
        this.disperrorcount(0, 5, 65);
        this.disperrchar(1);
        this.dispromaji(this.romaji, 0);
      }
    }
  }

  private onProcatimer() {
    this.sec_count++;
    if (this.sec_count >= 60.0) {
      if (this.procatimer) clearInterval(this.procatimer);
      if (this.practice_end_flag === 0) {
        this.practice_end_flag = 1;
        sound.playClear();
        this.ttype_speed_time = 60.0;
        this.type_end_time = this.type_start_time + 60000;
        this.procdispspeed2();
        this.type_time_record[this.type_kind_no] += this.ttype_speed_time;
        this.prockiroku();
        this.proctrainexit2();
      }
    } else {
      if (this.practice_end_flag === 0) {
        this.type_end_time = this.type_start_time + this.sec_count * 1000;
        this.ttype_speed_time = this.sec_count;
        this.procdispspeed2();
      }
    }
  }

  private procdispspeed() {
    this.disptime(1);
    this.dispspeedrate(1);
    this.type_speed_time = this.ttype_speed_time;
    this.type_speed = this.ftypespeed(this.type_count, this.type_start_time, this.type_end_time);
    this.disptime(0);
    this.dispspeedrate(0);
  }

  private procdispspeed2() {
    this.disptime(1);
    this.dispspeedrate2(1);
    this.type_speed_time = this.ttype_speed_time;
    this.type_speed = this.ftypespeed(this.w_count, this.type_start_time, this.type_end_time);
    this.type_speed2 = this.ftypespeed(this.type_count, this.type_start_time, this.type_end_time);
    this.disptime(0);
    this.dispspeedrate2(0);
  }

  private dispspeedrate(flag: number) {
    this.cslcolor((flag === 0) ? this.blue : this.bk_color);
    let a = "入力速度" + this.formatf1(this.type_speed, 6) + "文字／分";
    if (this.settings.dopagaki) {
      a = "【脳汁限界突破】" + this.formatf1(this.type_speed, 6) + "文字/分 神速！";
    }
    this.cslput(5 * 16, 24 * 8, a);
  }

  private dispspeedrate2(flag: number) {
    this.cslcolor((flag === 0) ? this.blue : this.bk_color);
    let a = "打鍵数" + this.formatf1(this.type_speed2, 6) + "文字／分";
    let b = "入力速度" + this.formatf1(this.type_speed, 6) + "文字／分";
    if (this.settings.dopagaki) {
      a = "【神速打鍵】" + this.formatf1(this.type_speed2, 6) + "打/分";
      b = "【脳汁ドバドバ】" + this.formatf1(this.type_speed, 6) + "文字/分";
    }
    this.cslput(5 * 16, 20 * 8, a);
    this.cslput(5 * 16, 42 * 8, b);
  }

  private disptime(flag: number) {
    this.cslcolor((flag === 0) ? this.blue : this.bk_color);
    const uFlag = (flag === 0) ? this.utikiri_flag : this.utikiri_flag2;
    const a = (uFlag === 0)
      ? "経過時間" + this.formatd(this.type_speed_time, 2) + "秒"
      : "経過時間" + this.formatf2(this.type_speed_time, 5) + "秒";
    this.cslput(5 * 16, 4 * 8, a);
  }

  private ftypespeed(count: number, start_time: number, end_time: number): number {
    if (end_time === start_time) return 0.0;
    const speed = (1000.0 * 60.0 * count) / (end_time - start_time);
    const result = speed * this.settings.speedMultiplier;
    if (result >= 1000) achievementManager.unlock('speed_1000');
    return result;
  }

  private prockiroku() {
    if (this.type_speed_record[this.type_kind_no] < this.type_speed) {
      if (this.type_speed_record[this.type_kind_no] > 0.0) {
        this.dispupmes();
        this.type_syuryou_flag = 2;
      } else {
        this.type_syuryou_flag = 1;
      }
      this.type_date = this.getdate();
      this.type_speed_record[this.type_kind_no] = this.type_speed;
      this.type_date_record[this.type_kind_no] = this.type_date;
      this.saveStorage();
    } else {
      this.saveStorage();
    }
  }

  private dispupmes() {
    this.cslcolor(this.green);
    this.cslput(20 * 16, 20 * 8, this.mesi3);
  }

  private proctrainexit() {
    this.dispkaisumes(1, 1, 31);
    if (this.p_count) this.p_count[this.type_kind_no]++;
    this.dispkaisumes(0, 1, 31);
    this.dispabortmessage(1, 23, 20);
    this.dispretrymessage(0);
  }

  private proctrainexit2() {
    this.dispkaisumes(1, 1, 31);
    if (this.p_count) this.p_count[this.type_kind_no]++;
    this.dispkaisumes(0, 1, 31);
    this.dispabortmessage(1, 23, 20);
    this.dispretrymessage(0);
  }

  private dispretrymessage(flag: number) {
    this.cslcolor((flag === 0) ? this.cyan : this.bk_color);
    this.cslput(22 * 16, 10 * 8, this.mesi1);
    this.cslput(23 * 16, 10 * 8, this.mesi2);
  }

  private funcbackmenu(func_no: number): number {
    if (func_no > 400 && func_no < 500) return 21;
    if (func_no > 500 && func_no < 600) return 22;
    if (func_no > 600 && func_no < 700) return 23;
    if (func_no > 700 && func_no < 800) return 24;
    return 1;
  }

  // --- Generation Logic ---
  private inctable(a: string, speed: number) {
    this.incctable(a, null, speed, 0);
  }
  private inatable(b: string[], speed: number) {
    this.incctable(null, b, speed, 1);
  }

  private incctable(a: string | null, b: string[] | null, speed: number, flag: number) {
    const size_yoko = 40;
    this.cline_x = Math.max(3, Math.min(10, Math.ceil((speed + 40.0) / 40.0)));
    this.cline_c = this.cline_x * size_yoko;
    const aLen = flag === 0 ? a!.length : b!.length;
    let k = 0;
    let kk = 0;

    for (let j = 0; j < this.cline_x; j++) {
      for (let i = 0; i < size_yoko; i++) {
        if (kk === 5) {
          kk = 0;
          this.chat_t[j][i] = ' ';
          if (flag !== 0) this.chat_yomi_t[k] = 0;
          k++;
        } else {
          const ii = Math.floor(Math.random() * aLen);
          if (flag === 0) {
            this.chat_t[j][i] = a![ii];
          } else {
            this.chat_t[j][i] = b![ii];
            this.chat_yomi_t[k] = ii + 1;
          }
          k++;
          kk++;
        }
      }
    }
    if (this.chat_t[this.cline_x - 1][39] === ' ') this.cline_c--;
  }

  private intwordtable(a: string[], speed: number) {
    this.inttangotable(a, speed, 0);
  }
  private intawordtable(a: string[], speed: number) {
    this.inttangotable(a, speed, 1);
  }

  private inttangotable(a: string[], speed: number, flag: number) {
    const size_yoko = 40;
    this.cline_x = Math.max(3, Math.min(10, Math.ceil((speed + 40.0) / 40.0)));
    this.cline_c = this.cline_x * size_yoko;
    const aLen = a.length;
    let kk = 0;
    let i = 0;
    let j = 0;
    let space_flag = 0;

    for (let l = 0; l < 1000; l++) {
      const ii = Math.floor(Math.random() * aLen);
      const b = a[ii];
      const bLen = b.length;
      if (kk + bLen > this.cline_c) break;
      space_flag = 0;

      for (let k = 0; k < bLen; k++) {
        const c = b.charAt(k);
        this.chat_t[j][i] = c;
        if (flag === 1) {
          this.chat_yomi_t[kk] = this.kfound(c);
        }
        kk++;
        if (kk >= this.cline_c) break;
        i++;
        if (i >= size_yoko) {
          i = 0;
          j++;
        }
      }
      if (kk >= this.cline_c) break;
      this.chat_t[j][i] = ' ';
      if (flag === 1) this.chat_yomi_t[kk] = 0;
      space_flag = 1;
      kk++;
      if (kk >= this.cline_c) break;
      i++;
      if (i >= size_yoko) {
        i = 0;
        j++;
      }
    }
    this.cline_c = kk;
    if (space_flag === 1) this.cline_c--;
  }

  private kfound(a: string): number {
    for (let i = 0; i < MIKA_kana.length; i++) {
      if (a === MIKA_kana[i]) return i + 1;
    }
    return 0;
  }

  private getromaji(w_count: number) {
    const c_point = this.chat_yomi_t[w_count];
    if (c_point !== 0) {
      this.romaji = MIKA_kana_yomi[c_point - 1];
      if (this.romaji) {
        this.key_char = this.romaji.charAt(0);
        this.romaji_length = this.romaji.length;
      } else {
        this.key_char = ' ';
        this.romaji_length = 0;
      }
      this.romaji2 = MIKA_kana_yomi2[c_point - 1];
      if (this.romaji2) {
        this.key_char2 = this.romaji2.charAt(0);
        this.romaji_length2 = this.romaji2.length;
      } else {
        this.key_char2 = 0;
        this.romaji_length2 = 0;
      }
    } else {
      this.romaji = null;
      this.romaji2 = null;
      this.romaji_length = 0;
      this.romaji_length2 = 0;
      this.key_char = ' ';
      this.key_char2 = 0;
    }
  }

  // --- General Helpers ---
  private keycord(a: string): [number, number] {
    const upper = a.toUpperCase();
    for (let j = 0; j < 4; j++) {
      const idx = MIKA_c_post[j].indexOf(upper);
      if (idx !== -1) {
        return [j + 1, idx + 1];
      }
    }
    return [0, 0];
  }

  private randomchar(table: string, prev: number): number {
    const len = table.length;
    if (len === 0) return 0;
    if (prev === -1) return Math.floor(Math.random() * len);
    let ii = Math.floor(Math.random() * (len - 1));
    ii = ii + prev + 1;
    if (ii >= len) ii -= len;
    return ii;
  }

  private formatd(x: number, width: number): string {
    let s = Math.floor(x).toString();
    while (s.length < width) s = ' ' + s;
    return s;
  }

  private formatf1(x: number, width: number): string {
    let s = x.toFixed(1);
    while (s.length < width) s = ' ' + s;
    return s;
  }

  private formatf2(x: number, width: number): string {
    let s = x.toFixed(2);
    while (s.length < width) s = ' ' + s;
    return s;
  }

  private formatzd(x: number, width: number): string {
    return Math.floor(x).toString().padStart(width, '0');
  }

  private tconv(time: number): string {
    const t3 = this.formatzd(time % 60, 2);
    time = Math.floor(time / 60);
    const t2 = this.formatzd(time % 60, 2);
    const t1 = this.formatd(Math.floor(time / 60), 5);
    return `${t1}時間${t2}分${t3}秒`;
  }

  private getdate(): string {
    const x = new Date();
    const y = x.getFullYear().toString().substring(2, 4);
    const m = this.formatzd(x.getMonth() + 1, 2);
    const d = this.formatzd(x.getDate(), 2);
    return `${y}/${m}/${d}`;
  }

  private uppertolower(c: string): string {
    return c.toLowerCase();
  }

  private convertupperlower(a: string, b: string): string {
    if ('A' <= a && a <= 'Z') return b.toUpperCase();
    if ('a' <= a && a <= 'z') return b.toLowerCase();
    return b;
  }
}
