import React, { useEffect, useRef, useState } from 'react';
import { MikaEngine } from './mika/engine.ts';
import { MikaSettings, Achievement } from './mika/types.ts';
import { sound } from './mika/sound.ts';
import { achievementManager } from './mika/achievements.ts';
import { battleManager, PeerState, TrainerGenre } from './mika/battle.ts';
import {
  Keyboard, Play, Square, Eye, Zap, RotateCcw,
  Sliders, HelpCircle, Monitor, Award, ArrowLeft,
  Sun, Moon, Maximize2, Minimize2, Sparkles, Shield,
  Bot, Volume2, VolumeX, Swords, Flame, CheckSquare
} from 'lucide-react';

interface Particle {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  size: number;
}

export default function App() {
  const mainFrameRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<MikaEngine | null>(null);

  const [settings, setSettings] = useState<MikaSettings>({
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
  });

  const [state, setState] = useState({
    modeName: 'トップメニュー',
    funcNo: 1,
    inPractice: false,
  });

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hideAuxiliaryInFullscreen, setHideAuxiliaryInFullscreen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [unlockedToast, setUnlockedToast] = useState<Achievement | null>(null);

  // Battle State
  const [opponent, setOpponent] = useState<PeerState | null>(null);
  const [battleResult, setBattleResult] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState('部屋1 (Room 1)');
  const [selectedGenre, setSelectedGenre] = useState<TrainerGenre>('basic_words');
  const [cheatAllowed, setCheatAllowed] = useState(false);

  // Particles for Dopagaki Mode
  const [particles, setParticles] = useState<Particle[]>([]);
  const particleIdRef = useRef(0);

  useEffect(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    canvas.width = 960;
    canvas.height = 600;

    const engine = new MikaEngine(canvas);
    engineRef.current = engine;

    engine.onSettingsChange = (newSettings) => setSettings({ ...newSettings });
    engine.onStateChange = (newState) => setState(newState);

    // ドパガキ演出パーティクルトリガー
    engine.onParticleTrigger = (char, x, y) => {
      const texts = ['脳汁！', '神技！', '超速！', '限界突破！', 'GREAT!', 'DON!!', 'ｷﾀ━(ﾟ∀ﾟ)━!', char];
      const selected = texts[Math.floor(Math.random() * texts.length)];
      const colors = ['#f43f5e', '#ec4899', '#a855f7', '#3b82f6', '#06b6d4', '#10b981', '#eab308'];
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = Math.floor(Math.random() * 20) + 18;

      const pId = particleIdRef.current++;
      setParticles((prev) => [...prev.slice(-25), { id: pId, text: selected, x, y, color, size }]);

      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => p.id !== pId));
      }, 700);
    };

    // 実績解除リスナー
    achievementManager.onUnlock = (ach) => {
      sound.playClear();
      setUnlockedToast(ach);
      setTimeout(() => setUnlockedToast(null), 4500);
    };

    // 対戦リスナー
    battleManager.onOpponentUpdate = (opp) => {
      setOpponent(opp ? { ...opp } : null);
    };
    battleManager.onOpponentFinished = (iWon) => {
      setBattleResult(iWon ? '🎉 あなたの勝利！' : '💀 相手が先にゴールしました！');
      setTimeout(() => setBattleResult(null), 5000);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.tagName === 'INPUT' || (e.target as HTMLElement)?.tagName === 'SELECT') return;
      engine.handleKeyDown(e);
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      engine.stopAutoInput();
    };
  }, []);

  // 中心メイン枠だけを全画面表示する
  const toggleMainFrameFullscreen = () => {
    if (!mainFrameRef.current) return;
    if (!document.fullscreenElement) {
      mainFrameRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const toggleTheme = () => {
    const next = settings.theme === 'dark' ? 'light' : 'dark';
    engineRef.current?.setTheme(next);
  };

  const handleKeySend = (key: string) => {
    engineRef.current?.sendKey(key);
  };

  const handleRoomChange = (room: string) => {
    setSelectedRoom(room);
    battleManager.setRoom(room);
  };

  const handleGenreChange = (genre: TrainerGenre) => {
    setSelectedGenre(genre);
    battleManager.rules.genre = genre;
  };

  const handleCheatToggle = (allowed: boolean) => {
    setCheatAllowed(allowed);
    battleManager.rules.allowAutoInput = allowed;
    battleManager.rules.allowAutoPilot = allowed;
    battleManager.rules.allowInvincible = allowed;
  };

  const isDopagaki = settings.dopagaki;

  return (
    <div
      className={`min-h-screen flex flex-col font-sans select-none transition-colors duration-300 relative overflow-hidden ${
        settings.theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      } ${isDopagaki ? 'animate-dopagaki-bg' : ''}`}
    >
      {/* Top Header (非全画面時、または全画面でも隠さない設定の時に表示) */}
      <header
        className={`px-4 py-2 border-b flex items-center justify-between backdrop-blur z-20 transition-colors ${
          settings.theme === 'dark'
            ? 'bg-slate-900/90 border-slate-800 text-white'
            : 'bg-white/90 border-slate-200 text-slate-900 shadow-sm'
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded bg-emerald-600/20 text-emerald-400 border border-emerald-500/30">
            <Monitor className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight flex items-center gap-2">
              美佳のタイプトレーナー
              <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Ver 2.06 拡張版
              </span>
              {isDopagaki && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gradient-to-r from-pink-500 via-purple-500 to-yellow-500 text-white animate-bounce shadow">
                  🔥 ドパガキ
                </span>
              )}
            </h1>
            <p className="text-xs opacity-70">
              画面: <span className="text-emerald-500 font-medium">{state.modeName}</span>
            </p>
          </div>
        </div>

        {/* Status / Quick Action bar */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-end">
          {/* F2: Auto Input */}
          <button
            onClick={() => engineRef.current?.toggleAutoInput()}
            title="F2: 自動入力"
            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border transition-colors ${
              settings.autoInput
                ? 'bg-rose-500 text-white border-rose-400 shadow animate-pulse'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {settings.autoInput ? <Square className="w-3 h-3 fill-current" /> : <Play className="w-3 h-3 fill-current" />}
            <span className="hidden sm:inline">自動入力(F2)</span>
          </button>

          {/* F3: Visible Space */}
          <button
            onClick={() => engineRef.current?.toggleVisibleSpace()}
            title="F3: 空白記号表示"
            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border transition-colors ${
              settings.visibleSpace
                ? 'bg-indigo-600/30 text-indigo-300 border-indigo-500/50'
                : 'bg-slate-800/80 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Eye className="w-3 h-3" />
            <span className="hidden sm:inline">空白(F3)</span>
          </button>

          {/* F4: Speed Multiplier */}
          <button
            onClick={() => engineRef.current?.cycleSpeedMultiplier()}
            title="F4: 速度倍率"
            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border transition-colors ${
              settings.speedMultiplier > 1.0
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Zap className="w-3 h-3" />
            <span>{settings.speedMultiplier}x</span>
          </button>

          {/* F5: Dopagaki */}
          <button
            onClick={() => engineRef.current?.toggleDopagaki()}
            title="F5: ドパガキモード"
            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border transition-all ${
              settings.dopagaki
                ? 'bg-pink-600 text-white border-pink-400 shadow scale-105 animate-pulse'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Sparkles className="w-3 h-3" />
            <span>ドパガキ(F5)</span>
          </button>

          {/* F6: AutoPilot */}
          <button
            onClick={() => engineRef.current?.toggleAutoPilot()}
            title="F6: 完全オートパイロット"
            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border transition-all ${
              settings.autoPilot
                ? 'bg-emerald-600 text-white border-emerald-400 shadow scale-105'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Bot className="w-3 h-3" />
            <span>全自動(F6)</span>
          </button>

          {/* F7: Invincible */}
          <button
            onClick={() => engineRef.current?.toggleInvincible()}
            title="F7: 無敵イージーモード"
            className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded border transition-all ${
              settings.invincible
                ? 'bg-cyan-600 text-white border-cyan-400 shadow scale-105'
                : 'bg-slate-800/80 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Shield className="w-3 h-3" />
            <span>無敵(F7)</span>
          </button>

          <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

          {/* 7. Online Match */}
          <button
            onClick={() => handleKeySend('7')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 border border-indigo-500/50 transition-colors"
            title="7. オンライン対戦練習"
          >
            <Swords className="w-3 h-3" />
            <span>7. オンライン</span>
          </button>

          {/* 8. Achievements */}
          <button
            onClick={() => handleKeySend('8')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-yellow-600/30 hover:bg-yellow-600/50 text-yellow-300 border border-yellow-500/50 transition-colors"
            title="8. 獲得実績一覧"
          >
            <Award className="w-3 h-3" />
            <span>8. 実績</span>
          </button>

          {/* 9. Secret Menu */}
          <button
            onClick={() => handleKeySend('9')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/50 transition-colors"
            title="9. 裏メニュー (美佳のタイプトレーナー枠内に統合)"
          >
            <Flame className="w-3 h-3" />
            <span>9. 裏メニュー</span>
          </button>

          {/* Sound Toggle */}
          <button
            onClick={() => {
              sound.enabled = !sound.enabled;
              setSettings((s) => ({ ...s, soundEnabled: sound.enabled }));
              engineRef.current?.dispmen();
            }}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title={settings.soundEnabled ? 'サウンド: ON' : 'サウンド: OFF'}
          >
            {settings.soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="ライト/ダーク切替"
          >
            {settings.theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Help */}
          <button
            onClick={() => setShowHelp(true)}
            className="p-1.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="ヘルプ"
          >
            <HelpCircle className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Online PvP Battle Settings & Status Bar */}
      <div className="bg-gradient-to-r from-indigo-950 via-slate-900 to-indigo-950 border-b border-indigo-800/60 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-3 text-indigo-100 z-10 shadow">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-indigo-300 font-bold">
            <Swords className="w-4 h-4 text-amber-400" />
            <span>オンライン対戦ルーム設定:</span>
          </div>

          {/* Room Selector */}
          <select
            value={selectedRoom}
            onChange={(e) => handleRoomChange(e.target.value)}
            className="bg-slate-900 border border-indigo-700/60 rounded px-2 py-0.5 text-xs text-amber-300 font-mono"
          >
            <option value="部屋1 (Room 1)">部屋1 (Room 1)</option>
            <option value="部屋2 (Room 2)">部屋2 (Room 2)</option>
            <option value="部屋3 (Room 3)">部屋3 (Room 3)</option>
            <option value="ガチ対戦部屋">ガチ対戦部屋</option>
            <option value="フリー対戦部屋">フリー対戦部屋</option>
          </select>

          {/* Trainer / Genre Selector */}
          <select
            value={selectedGenre}
            onChange={(e) => handleGenreChange(e.target.value as TrainerGenre)}
            className="bg-slate-900 border border-indigo-700/60 rounded px-2 py-0.5 text-xs text-indigo-200"
          >
            <option value="basic_words">基本英単語</option>
            <option value="msdos">MS-DOSコマンド</option>
            <option value="c_lang">C言語コード</option>
            <option value="pascal">パスカル</option>
            <option value="basic">BASIC</option>
            <option value="romaji_words">ローマ字単語(完全版)</option>
            <option value="random_home">ランダム練習</option>
          </select>

          {/* Cheat Rules */}
          <button
            onClick={() => handleCheatToggle(!cheatAllowed)}
            className={`px-2 py-0.5 rounded border text-[11px] font-medium transition-colors ${
              cheatAllowed ? 'bg-amber-600/30 border-amber-500/50 text-amber-200' : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            {cheatAllowed ? 'チート許可: ON' : 'チート禁止 (正当勝負)'}
          </button>
        </div>

        {/* Opponent Realtime Progress */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {opponent ? (
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-semibold">{opponent.name} 接続中:</span>
              <div className="w-28 bg-slate-800 rounded-full h-2 overflow-hidden border border-indigo-500/30">
                <div
                  className="bg-gradient-to-r from-amber-400 to-rose-500 h-2 rounded-full transition-all duration-200"
                  style={{ width: `${opponent.progress}%` }}
                />
              </div>
              <span className="font-mono text-amber-300">{opponent.progress}%</span>
            </div>
          ) : (
            <span className="text-slate-400 text-[11px]">※ 同じブラウザで別タブを開くと自動接続</span>
          )}

          <button
            onClick={() => engineRef.current?.startConfiguredBattle()}
            className="px-2.5 py-0.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold transition-all shadow"
          >
            対戦開始
          </button>
        </div>
      </div>

      {/* Main Screen Body */}
      <main className="flex-1 flex flex-col items-center justify-center p-2 sm:p-4 overflow-hidden relative">
        {/* Canvas Screen Enclosure (Retro PC Bezel) - 中心のメイン枠 */}
        <div
          ref={mainFrameRef}
          className={`w-full max-w-5xl flex flex-col items-center rounded-xl p-3 shadow-2xl relative transition-all ${
            isFullscreen ? 'fixed inset-0 z-50 rounded-none p-2 sm:p-4 max-w-none justify-center' : ''
          } ${
            settings.theme === 'dark' ? 'bg-slate-900 border border-slate-800 shadow-black/80' : 'bg-white border border-slate-200 shadow-slate-300'
          } ${isDopagaki ? 'ring-4 ring-pink-500 ring-offset-4 ring-offset-slate-950 animate-pulse' : ''}`}
        >
          {/* Main Frame Header Bar */}
          <div className="w-full flex items-center justify-between pb-1.5 mb-1 text-[11px] opacity-75">
            <span className="font-mono tracking-wider">MIKA TYPE TRAINER TERMINAL</span>

            <div className="flex items-center gap-3">
              {/* 全画面時に「キー補助すら隠す (純粋Canvasのみ)」トグル */}
              {isFullscreen && (
                <button
                  onClick={() => setHideAuxiliaryInFullscreen(!hideAuxiliaryInFullscreen)}
                  className={`flex items-center gap-1 px-2 py-0.5 rounded border transition-colors ${
                    hideAuxiliaryInFullscreen
                      ? 'bg-rose-600/40 text-rose-300 border-rose-500/60'
                      : 'bg-slate-800/80 text-slate-300 border-slate-700'
                  }`}
                  title="キー補助バーすら隠し、本当に純粋なメイン枠（Canvas）だけにする"
                >
                  <CheckSquare className="w-3 h-3" />
                  <span>{hideAuxiliaryInFullscreen ? 'キー補助を復帰' : 'キー補助すら非表示 (純粋枠)'}</span>
                </button>
              )}

              {/* Fullscreen Toggle button */}
              <button
                onClick={toggleMainFrameFullscreen}
                className="flex items-center gap-1 px-2 py-0.5 rounded hover:bg-slate-800/50 hover:text-white transition-colors"
                title={isFullscreen ? 'メイン枠の全画面を解除' : '中心のメイン枠だけを全画面表示'}
              >
                {isFullscreen ? <Minimize2 className="w-3.5 h-3.5 text-amber-400" /> : <Maximize2 className="w-3.5 h-3.5" />}
                <span>{isFullscreen ? '全画面解除' : '中心メイン枠を全画面'}</span>
              </button>
            </div>
          </div>

          {/* Canvas Box */}
          <div className="w-full bg-black rounded-lg overflow-hidden border-2 border-slate-700/80 shadow-inner flex items-center justify-center relative flex-1">
            <canvas
              ref={canvasRef}
              className={`block max-w-full bg-white cursor-pointer ${
                isFullscreen
                  ? hideAuxiliaryInFullscreen
                    ? 'h-full w-auto max-h-[96vh]'
                    : 'h-full w-auto max-h-[85vh]'
                  : 'h-auto max-h-[72vh]'
              }`}
              onClick={() => {
                // Keep focus
              }}
            />

            {/* Dopagaki Flying Particles Overlay */}
            {isDopagaki && (
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                {particles.map((p) => (
                  <div
                    key={p.id}
                    className="absolute font-black tracking-wider animate-float-fade"
                    style={{
                      left: p.x,
                      top: p.y,
                      color: p.color,
                      fontSize: `${p.size}px`,
                      textShadow: '0 0 10px rgba(255,255,255,0.8), 0 0 20px rgba(255,0,128,0.6)',
                    }}
                  >
                    {p.text}
                  </div>
                ))}
              </div>
            )}

            {/* CRT Screen Scanline effect overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-black/[0.015] to-black/[0.06]" />
          </div>

          {/* Bottom Virtual Controls for Convenience (全画面でhideAuxiliaryInFullscreenが有効なら完全非表示！) */}
          {(!isFullscreen || !hideAuxiliaryInFullscreen) && (
            <div
              className={`w-full mt-3 pt-3 border-t flex flex-wrap items-center justify-between gap-3 text-xs ${
                settings.theme === 'dark' ? 'border-slate-800' : 'border-slate-200'
              }`}
            >
              {/* Quick Action Key Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="opacity-60 font-mono mr-1">キー補助:</span>
                <button
                  onClick={() => handleKeySend('Escape')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono active:scale-95 transition-all flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" /> ESC (戻る)
                </button>
                <button
                  onClick={() => handleKeySend('Enter')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 font-mono active:scale-95 transition-all"
                >
                  Enter (決定/リトライ)
                </button>
                <button
                  onClick={() => handleKeySend(' ')}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-mono active:scale-95 transition-all"
                >
                  Space (ガイド切替)
                </button>

                <div className="h-4 w-px bg-slate-700 mx-1 hidden sm:block" />

                {/* Number Buttons 1 to 9 */}
                <div className="flex items-center gap-1 flex-wrap">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                    <button
                      key={num}
                      onClick={() => handleKeySend(num.toString())}
                      className={`w-6 h-6 rounded font-mono text-xs flex items-center justify-center border active:scale-95 transition-colors ${
                        num === 7
                          ? 'bg-indigo-600/40 text-indigo-300 border-indigo-500/60 hover:bg-indigo-600/60 font-bold'
                          : num === 8
                          ? 'bg-yellow-600/40 text-yellow-300 border-yellow-500/60 hover:bg-yellow-600/60 font-bold'
                          : num === 9
                          ? 'bg-amber-600/40 text-amber-300 border-amber-500/60 hover:bg-amber-600/60 font-bold'
                          : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700/60'
                      }`}
                      title={
                        num === 7
                          ? '7. オンライン対戦'
                          : num === 8
                          ? '8. 実績'
                          : num === 9
                          ? '9. 裏メニュー'
                          : `${num}番を選択`
                      }
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>

              {/* Speed slider & Quick Reset */}
              <div className="flex items-center gap-3">
                <div
                  className={`flex items-center gap-2 px-2.5 py-1 rounded border ${
                    settings.theme === 'dark' ? 'bg-slate-950/60 border-slate-800 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-700'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5 opacity-60" />
                  <span>自動打鍵:</span>
                  <input
                    type="range"
                    min={10}
                    max={200}
                    step={5}
                    value={settings.autoSpeed}
                    onChange={(e) => engineRef.current?.setAutoSpeed(Number(e.target.value))}
                    className="w-20 accent-emerald-500 cursor-pointer"
                  />
                  <span className="font-mono text-emerald-400 w-10 text-right">{settings.autoSpeed}ms</span>
                </div>

                <button
                  onClick={() => {
                    if (window.confirm('これまでの練習記録・累積練習時間をすべて消去しますか？')) {
                      engineRef.current?.seisekiclear();
                      engineRef.current?.dispmen();
                    }
                  }}
                  className="flex items-center gap-1 px-2.5 py-1 text-slate-400 hover:text-rose-400 bg-slate-800/50 hover:bg-slate-800 rounded border border-slate-700/50 transition-colors"
                  title="成績データを初期化"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>成績消去</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Achievement Unlocked Toast Notification */}
      {unlockedToast && (
        <div className="fixed top-16 right-4 z-50 animate-bounce">
          <div className="bg-gradient-to-r from-amber-600 via-yellow-600 to-amber-700 text-white px-4 py-3 rounded-xl shadow-2xl border-2 border-yellow-300 flex items-center gap-3">
            <span className="text-2xl">{unlockedToast.icon}</span>
            <div>
              <div className="text-[10px] uppercase font-bold tracking-wider text-yellow-200">ACHIEVEMENT UNLOCKED!</div>
              <div className="font-bold text-sm">{unlockedToast.title}</div>
              <div className="text-xs text-yellow-100">{unlockedToast.desc}</div>
            </div>
          </div>
        </div>
      )}

      {/* Battle Result Overlay */}
      {battleResult && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-4">
          <div className="bg-black/90 text-white px-8 py-6 rounded-2xl border-4 border-amber-400 shadow-2xl text-2xl font-black tracking-wide text-center animate-pulse">
            {battleResult}
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl max-w-lg w-full p-5 shadow-2xl relative text-slate-100">
            <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
              <Keyboard className="w-5 h-5 text-emerald-400" />
              美佳のタイプトレーナー 拡張版の使い方
            </h3>

            <div className="space-y-3 text-xs text-slate-300 leading-relaxed max-h-[70vh] overflow-y-auto pr-2">
              <div className="p-3 bg-slate-950/80 rounded border border-slate-800">
                <div className="font-medium text-emerald-400 mb-1">【メニュー構成 (1〜9)】</div>
                <p>1〜4: ポジション練習・ランダム練習・英単語練習・ローマ字練習</p>
                <p>5〜6: 成績表示・成績消去</p>
                <p><span className="font-mono text-indigo-400 font-bold">7. オンライン対戦練習</span>: 部屋選択・出題単元選択・チート制限を設定してタブ間対戦！</p>
                <p><span className="font-mono text-yellow-400 font-bold">8. 実績</span>: 獲得したアチーブメント一覧をCanvas内で確認！</p>
                <p><span className="font-mono text-amber-400 font-bold">9. 裏メニュー</span>: チート・倍率設定・サウンド切替が可能な隠しメニュー！</p>
              </div>

              <div className="p-3 bg-slate-950/80 rounded border border-slate-800">
                <div className="font-medium text-emerald-400 mb-1">【キーボードショートカット一覧】</div>
                <ul className="list-disc list-inside space-y-1 text-slate-300">
                  <li><span className="font-mono text-white font-semibold">F2 キー</span>: 自動入力モードの ON / OFF 切替</li>
                  <li><span className="font-mono text-white font-semibold">F3 キー</span>: 空白表示の切替（「␣」記号 ⇔ 通常の半角スペース）</li>
                  <li><span className="font-mono text-white font-semibold">F4 キー</span>: 速度倍率の切替（1.0倍 ⇔ 10.0倍 ⇔ 100.0倍）</li>
                  <li><span className="font-mono text-pink-400 font-semibold">F5 キー</span>: 🎆 ドパガキモード（ネオン＆文字飛び散り＆脳汁スコア表示）</li>
                  <li><span className="font-mono text-emerald-400 font-semibold">F6 キー</span>: 🤖 完全オートパイロット（ミスゼロ最高速自動クリア）</li>
                  <li><span className="font-mono text-cyan-400 font-semibold">F7 キー</span>: 🛡️ 無敵イージーモード（どのキーを押してもミスなしで自動正解）</li>
                  <li><span className="font-mono text-white font-semibold">ESC キー</span>: 中断 / 一つ前のメニューに戻る</li>
                  <li><span className="font-mono text-white font-semibold">Enter キー</span>: 選択決定 / 練習終了時のリトライ</li>
                </ul>
              </div>

              <div className="p-3 bg-slate-950/80 rounded border border-slate-800">
                <div className="font-medium text-amber-400 mb-1">【全画面モード】</div>
                <p>枠右上のボタンで「中心メイン枠だけ全画面」に拡大できます。「キー補助すら非表示 (純粋枠)」をONにすると、下部のボタンすら消去され、100% CanvasだけのレトロPC画面に没頭できます。</p>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowHelp(false)}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-medium transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
