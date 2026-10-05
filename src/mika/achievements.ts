import { Achievement } from './types.ts';

export const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_step', title: '初めの一歩', desc: '美佳のタイプトレーナーで練習を1回開始した', icon: '🌱', unlockedAt: null },
  { id: 'type_100', title: '百打の達人', desc: '1セッションで100文字以上を入力した', icon: '⚡', unlockedAt: null },
  { id: 'type_500_total', title: '累計500文字突破', desc: '累計タイプ文字数が500文字を突破した', icon: '🏆', unlockedAt: null },
  { id: 'perfect_accuracy', title: '神の指先 (ミスゼロ)', desc: 'ミス0回で練習ステージを完走した', icon: '🎯', unlockedAt: null },
  { id: 'secret_menu', title: '裏世界の住人', desc: 'トップ画面から「7. 裏メニュー」を開いた', icon: '🕵️', unlockedAt: null },
  { id: 'dopagaki_active', title: '脳汁ドバドバ！', desc: 'ドパガキモード (F5) を発動した', icon: '🎆', unlockedAt: null },
  { id: 'autopilot_cheat', title: '禁断の全自動', desc: '完全オートパイロットモード (F6) を起動した', icon: '🤖', unlockedAt: null },
  { id: 'invincible_mode', title: '絶対無敵タイパー', desc: '無敵イージーモード (F7) で突き進んだ', icon: '🛡️', unlockedAt: null },
  { id: 'speed_1000', title: '光速の領域 (1000文字/分)', desc: '速度倍率や超高速連打で1000文字/分を超えた', icon: '🚀', unlockedAt: null },
  { id: 'pvp_battle', title: 'ネット対戦デビュー', desc: 'タブ間リアルタイム対戦モードに参加した', icon: '⚔️', unlockedAt: null },
];

export class AchievementManager {
  private achievements: Achievement[] = [];
  public onUnlock?: (ach: Achievement) => void;
  public totalCharactersTyped: number = 0;

  constructor() {
    this.load();
  }

  public getList(): Achievement[] {
    return this.achievements;
  }

  private load() {
    try {
      const saved = localStorage.getItem('MIKATYPE_ACHIEVEMENTS');
      if (saved) {
        const parsed: Record<string, string> = JSON.parse(saved);
        this.achievements = INITIAL_ACHIEVEMENTS.map(item => ({
          ...item,
          unlockedAt: parsed[item.id] || null
        }));
      } else {
        this.achievements = [...INITIAL_ACHIEVEMENTS];
      }

      const totalTyped = localStorage.getItem('MIKATYPE_TOTAL_TYPED');
      if (totalTyped) {
        this.totalCharactersTyped = parseInt(totalTyped, 10) || 0;
      }
    } catch {
      this.achievements = [...INITIAL_ACHIEVEMENTS];
    }
  }

  private save() {
    try {
      const map: Record<string, string | null> = {};
      this.achievements.forEach(a => {
        if (a.unlockedAt) map[a.id] = a.unlockedAt;
      });
      localStorage.setItem('MIKATYPE_ACHIEVEMENTS', JSON.stringify(map));
      localStorage.setItem('MIKATYPE_TOTAL_TYPED', this.totalCharactersTyped.toString());
    } catch {
      // ignore
    }
  }

  public addTypedChar() {
    this.totalCharactersTyped++;
    if (this.totalCharactersTyped >= 500) {
      this.unlock('type_500_total');
    }
    this.save();
  }

  public unlock(id: string) {
    const item = this.achievements.find(a => a.id === id);
    if (item && !item.unlockedAt) {
      item.unlockedAt = new Date().toLocaleTimeString();
      this.save();
      this.onUnlock?.(item);
    }
  }
}

export const achievementManager = new AchievementManager();
