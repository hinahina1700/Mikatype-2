export type TrainerGenre =
  | 'basic_words'     // 基本英単語
  | 'msdos'           // MS-DOSコマンド
  | 'c_lang'          // C言語
  | 'pascal'          // パスカル
  | 'fortran'         // フォートラン
  | 'basic'           // BASIC
  | 'asm8086'         // 8086アセンブラ
  | 'romaji_words'    // ローマ字単語
  | 'random_home';    // ランダム練習

export interface BattleRules {
  allowAutoInput: boolean;
  allowAutoPilot: boolean;
  allowInvincible: boolean;
  genre: TrainerGenre;
  wordCount: number;
}

export interface PeerState {
  playerId: string;
  name: string;
  roomName: string;
  progress: number; // 0 to 100
  currentTyped: number;
  totalTarget: number;
  cpm: number;
  finished: boolean;
  won: boolean;
  cheatingDetected: boolean;
}

export class BattleManager {
  private channel: BroadcastChannel | null = null;
  public myId: string = 'player_' + Math.random().toString(36).substring(2, 7);
  public currentRoom: string = '部屋1 (Room 1)';
  public rules: BattleRules = {
    allowAutoInput: false,
    allowAutoPilot: false,
    allowInvincible: false,
    genre: 'basic_words',
    wordCount: 20,
  };

  public opponentState: PeerState | null = null;
  public onOpponentUpdate?: (state: PeerState | null) => void;
  public onBattleStartRequest?: (seedWords: string[], rules: BattleRules) => void;
  public onOpponentFinished?: (won: boolean) => void;

  constructor() {
    this.initChannel(this.currentRoom);
  }

  public setRoom(roomName: string) {
    this.currentRoom = roomName;
    this.opponentState = null;
    this.initChannel(roomName);
    this.broadcastPresence();
    this.onOpponentUpdate?.(null);
  }

  private initChannel(roomName: string) {
    if (this.channel) {
      try { this.channel.close(); } catch {}
    }
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        const channelName = `mikatype_battle_${encodeURIComponent(roomName)}`;
        this.channel = new BroadcastChannel(channelName);
        this.channel.onmessage = (event) => this.handleMessage(event.data);
        this.broadcastPresence();
      } catch {
        // ignore
      }
    }
  }

  public broadcastPresence() {
    this.send({
      type: 'presence',
      playerId: this.myId,
      roomName: this.currentRoom,
    });
  }

  public broadcastProgress(
    current: number,
    total: number,
    cpm: number,
    finished: boolean = false,
    won: boolean = false,
    isCheating: boolean = false
  ) {
    const progress = total > 0 ? Math.min(100, Math.floor((current / total) * 100)) : 0;
    this.send({
      type: 'progress',
      playerId: this.myId,
      name: '対戦相手(Tab)',
      roomName: this.currentRoom,
      progress,
      currentTyped: current,
      totalTarget: total,
      cpm,
      finished,
      won,
      cheatingDetected: isCheating,
    });
  }

  public startMatchWithOpponent(words: string[]) {
    this.send({
      type: 'start_match',
      playerId: this.myId,
      roomName: this.currentRoom,
      words,
      rules: this.rules,
    });
  }

  private send(data: Record<string, unknown>) {
    if (this.channel) {
      try {
        this.channel.postMessage(data);
      } catch {
        // ignore
      }
    }
  }

  private handleMessage(data: Record<string, unknown>) {
    if (!data || data.playerId === this.myId) return;

    if (data.type === 'presence') {
      this.send({
        type: 'presence_ack',
        playerId: this.myId,
        roomName: this.currentRoom,
      });
      if (!this.opponentState) {
        this.opponentState = {
          playerId: data.playerId as string,
          name: '相手プレイヤー (別タブ)',
          roomName: this.currentRoom,
          progress: 0,
          currentTyped: 0,
          totalTarget: 60,
          cpm: 0,
          finished: false,
          won: false,
          cheatingDetected: false,
        };
        this.onOpponentUpdate?.(this.opponentState);
      }
    } else if (data.type === 'presence_ack') {
      if (!this.opponentState) {
        this.opponentState = {
          playerId: data.playerId as string,
          name: '相手プレイヤー (別タブ)',
          roomName: this.currentRoom,
          progress: 0,
          currentTyped: 0,
          totalTarget: 60,
          cpm: 0,
          finished: false,
          won: false,
          cheatingDetected: false,
        };
        this.onOpponentUpdate?.(this.opponentState);
      }
    } else if (data.type === 'progress') {
      this.opponentState = {
        playerId: data.playerId as string,
        name: (data.name as string) || '相手プレイヤー (別タブ)',
        roomName: this.currentRoom,
        progress: Number(data.progress) || 0,
        currentTyped: Number(data.currentTyped) || 0,
        totalTarget: Number(data.totalTarget) || 60,
        cpm: Number(data.cpm) || 0,
        finished: Boolean(data.finished),
        won: Boolean(data.won),
        cheatingDetected: Boolean(data.cheatingDetected),
      };
      this.onOpponentUpdate?.(this.opponentState);
      if (this.opponentState.finished && this.opponentState.won) {
        this.onOpponentFinished?.(false);
      }
    } else if (data.type === 'start_match') {
      if (Array.isArray(data.words)) {
        if (data.rules) {
          this.rules = data.rules as BattleRules;
        }
        this.onBattleStartRequest?.(data.words as string[], this.rules);
      }
    }
  }

  public destroy() {
    this.channel?.close();
  }
}

export const battleManager = new BattleManager();
