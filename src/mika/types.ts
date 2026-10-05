export interface MikaSettings {
  autoInput: boolean;         // F2
  autoSpeed: number;          // ms (10-200)
  visibleSpace: boolean;      // F3
  speedMultiplier: number;    // F4 (1.0 - 9999.0)
  dopagaki: boolean;          // F5: サイケデリックネオン・飛び散る文字演出
  autoPilot: boolean;         // F6: 完全オートパイロット（ミスゼロ・超高速自動クリア）
  invincible: boolean;        // F7: 無敵イージーモード（何を押してもミスなしで自動正解）
  theme: 'dark' | 'light';    // ライトモード / ダークモード
  soundEnabled: boolean;
  soundVolume: number;
}

export interface MikaRecord {
  r_speed: number[];
  r_date: string[];
  r_time: number[];
  w_speed: number[];
  w_date: string[];
  w_time: number[];
  a_speed: number[];
  a_date: string[];
  a_time: number[];
  p_time: number;
}

export interface Achievement {
  id: string;
  title: string;
  desc: string;
  icon: string;
  unlockedAt: string | null;
}
