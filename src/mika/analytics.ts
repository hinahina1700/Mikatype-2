export interface KeyStat {
  typed: number;
  missed: number;
}

export interface PracticeHistory {
  date: string;
  cpm: number;
  accuracy: number;
  mode: string;
}

export interface FingerStat {
  name: string;
  hand: 'left' | 'right';
  fingerIndex: number; // 0:小指, 1:薬指, 2:中指, 3:人差指, 4:親指, 5:親指, 6:人差指, 7:中指, 8:薬指, 9:小指
  typed: number;
  missed: number;
}

class AnalyticsManager {
  public keyStats: Record<string, KeyStat> = {};
  public history: PracticeHistory[] = [];

  constructor() {
    this.load();
  }

  private load() {
    try {
      const savedStats = localStorage.getItem('MIKATYPE_KEY_STATS');
      if (savedStats) this.keyStats = JSON.parse(savedStats);

      const savedHistory = localStorage.getItem('MIKATYPE_HISTORY');
      if (savedHistory) this.history = JSON.parse(savedHistory);
    } catch {
      // ignore
    }
  }

  public save() {
    try {
      localStorage.setItem('MIKATYPE_KEY_STATS', JSON.stringify(this.keyStats));
      localStorage.setItem('MIKATYPE_HISTORY', JSON.stringify(this.history.slice(-50))); // 直近50回
    } catch {
      // ignore
    }
  }

  public recordStroke(key: string, isMiss: boolean) {
    const k = key.toUpperCase();
    if (!this.keyStats[k]) {
      this.keyStats[k] = { typed: 0, missed: 0 };
    }
    this.keyStats[k].typed++;
    if (isMiss) {
      this.keyStats[k].missed++;
    }
    this.save();
  }

  public recordSession(mode: string, cpm: number, accuracy: number) {
    const now = new Date();
    const timeStr = `${now.getMonth() + 1}/${now.getDate()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    this.history.push({
      date: timeStr,
      cpm: Math.round(cpm),
      accuracy: Math.round(accuracy * 10) / 10,
      mode,
    });
    this.save();
  }

  // 指ごとの担当キーマッピング
  // 0: 左手小指 (1, Q, A, Z)
  // 1: 左手薬指 (2, W, S, X)
  // 2: 左手中指 (3, E, D, C)
  // 3: 左手人差指 (4, 5, R, T, F, G, V, B)
  // 4: 左手親指 (Space)
  // 5: 右手親指 (Space)
  // 6: 右手人差指 (6, 7, Y, U, H, J, N, M)
  // 7: 右手中指 (8, I, K, ',')
  // 8: 右手薬指 (9, O, L, '.')
  // 9: 右手小指 (0, P, ';')
  public getFingerStats(): FingerStat[] {
    const fingerNames = [
      '左手・小指',
      '左手・薬指',
      '左手・中指',
      '左手・人差指',
      '左手・親指',
      '右手・親指',
      '右手・人差指',
      '右手・中指',
      '右手・薬指',
      '右手・小指',
    ];

    const mapping: Record<number, string[]> = {
      0: ['1', 'Q', 'A', 'Z'],
      1: ['2', 'W', 'S', 'X'],
      2: ['3', 'E', 'D', 'C'],
      3: ['4', '5', 'R', 'T', 'F', 'G', 'V', 'B'],
      4: [' '],
      5: [' '],
      6: ['6', '7', 'Y', 'U', 'H', 'J', 'N', 'M'],
      7: ['8', 'I', 'K', ','],
      8: ['9', 'O', 'L', '.'],
      9: ['0', 'P', ';'],
    };

    return fingerNames.map((name, idx) => {
      let typed = 0;
      let missed = 0;
      const keys = mapping[idx] || [];
      keys.forEach((k) => {
        const stat = this.keyStats[k.toUpperCase()];
        if (stat) {
          typed += stat.typed;
          missed += stat.missed;
        }
      });
      return {
        name,
        hand: idx < 5 ? 'left' : 'right',
        fingerIndex: idx,
        typed,
        missed,
      };
    });
  }

  // キーのミス率を 0.0 (ミスなし) 〜 1.0 (高ミス率) で取得
  public getKeyMissRatio(key: string): number {
    const k = key.toUpperCase();
    const stat = this.keyStats[k];
    if (!stat || stat.typed === 0) return 0;
    return stat.missed / stat.typed;
  }
}

export const analytics = new AnalyticsManager();
