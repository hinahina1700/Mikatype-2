export interface PeerState {
  playerId: string;
  name: string;
  progress: number; // 0 to 100
  currentTyped: number;
  totalTarget: number;
  cpm: number;
  finished: boolean;
  won: boolean;
}

export class BattleManager {
  private channel: BroadcastChannel | null = null;
  public myId: string = 'player_' + Math.random().toString(36).substring(2, 7);
  public opponentState: PeerState | null = null;
  public onOpponentUpdate?: (state: PeerState | null) => void;
  public onBattleStartRequest?: (seedWords: string[]) => void;
  public onOpponentFinished?: (won: boolean) => void;

  constructor() {
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        this.channel = new BroadcastChannel('mikatype_battle_channel');
        this.channel.onmessage = (event) => this.handleMessage(event.data);
        // Announce presence
        this.broadcastPresence();
      } catch {
        // BroadcastChannel unavailable
      }
    }
  }

  public broadcastPresence() {
    this.send({
      type: 'presence',
      playerId: this.myId,
    });
  }

  public broadcastProgress(current: number, total: number, cpm: number, finished: boolean = false, won: boolean = false) {
    const progress = total > 0 ? Math.min(100, Math.floor((current / total) * 100)) : 0;
    this.send({
      type: 'progress',
      playerId: this.myId,
      name: '対戦相手(Tab)',
      progress,
      currentTyped: current,
      totalTarget: total,
      cpm,
      finished,
      won,
    });
  }

  public startMatchWithOpponent(words: string[]) {
    this.send({
      type: 'start_match',
      playerId: this.myId,
      words,
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
      // Respond with presence back
      this.send({
        type: 'presence_ack',
        playerId: this.myId,
      });
      if (!this.opponentState) {
        this.opponentState = {
          playerId: data.playerId as string,
          name: '相手プレイヤー (別タブ)',
          progress: 0,
          currentTyped: 0,
          totalTarget: 60,
          cpm: 0,
          finished: false,
          won: false,
        };
        this.onOpponentUpdate?.(this.opponentState);
      }
    } else if (data.type === 'presence_ack') {
      if (!this.opponentState) {
        this.opponentState = {
          playerId: data.playerId as string,
          name: '相手プレイヤー (別タブ)',
          progress: 0,
          currentTyped: 0,
          totalTarget: 60,
          cpm: 0,
          finished: false,
          won: false,
        };
        this.onOpponentUpdate?.(this.opponentState);
      }
    } else if (data.type === 'progress') {
      this.opponentState = {
        playerId: data.playerId as string,
        name: (data.name as string) || '相手プレイヤー (別タブ)',
        progress: Number(data.progress) || 0,
        currentTyped: Number(data.currentTyped) || 0,
        totalTarget: Number(data.totalTarget) || 60,
        cpm: Number(data.cpm) || 0,
        finished: Boolean(data.finished),
        won: Boolean(data.won),
      };
      this.onOpponentUpdate?.(this.opponentState);
      if (this.opponentState.finished && this.opponentState.won) {
        this.onOpponentFinished?.(false);
      }
    } else if (data.type === 'start_match') {
      if (Array.isArray(data.words)) {
        this.onBattleStartRequest?.(data.words as string[]);
      }
    }
  }

  public destroy() {
    this.channel?.close();
  }
}

export const battleManager = new BattleManager();
