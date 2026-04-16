import { useState, useEffect, useRef } from "react";
import { DesktopPet } from "./components/DesktopPet";
import { Monitor, MonitorOff, Plus, Trash2, Coins, X, Globe, Keyboard, ChevronDown, ChevronUp, Bug, Image as ImageIcon } from "lucide-react";
import { BACKGROUNDS, getTimeOfDay, Theme } from "./utils/backgrounds";

const SPAWN_COST = 50;
const EARN_RATE_PER_SEC = 1;

// Consumption per hour (converted to per second for smooth updates)
const TUXEDO_CONSUME_PER_SEC = 10 / 60;
const TABBY_CONSUME_PER_SEC = 20 / 60;

const TRANSLATIONS = {
  en: {
    title: "Desktop Pets",
    netIncome: "Net Income",
    sec: "sec",
    min: "min",
    screenOff: "Screen Off: Not earning money!",
    starving: "⚠️ OUT OF MONEY! CATS ARE STARVING! ⚠️",
    stopScreen: "Stop Screen Time",
    resumeScreen: "Resume Screen Time",
    tuxedoCat: "Tuxedo Cat",
    tabbyCat: "Tabby Cat",
    spawnPet: "Spawn Random Pet",
    cost: "Cost",
    clear: "Clear",
    catDetails: "Cat Details",
    name: "Name",
    breed: "Breed",
    appetite: "Appetite",
    done: "Done",
    tuxedo: "tuxedo",
    tabby: "tabby",
    typingBonus: "⌨️ Typing Bonus (2x)!",
    born: "Born",
    sayBye: "Say bye",
    theme: "Theme",
    forest: "Forest",
    grassland: "Grassland",
    indoor: "Cozy Indoor",
    garden: "Garden",
    classic: "Classic",
    quit: "Quit"
  },
  zh: {
    title: "桌面宠物",
    netIncome: "净收入",
    sec: "秒",
    min: "分钟",
    screenOff: "息屏：停止赚取金币！",
    starving: "⚠️ 金币耗尽！猫咪正在挨饿！ ⚠️",
    stopScreen: "停止屏幕时间",
    resumeScreen: "恢复屏幕时间",
    tuxedoCat: "奶牛猫",
    tabbyCat: "橘猫",
    spawnPet: "随机召唤宠物",
    cost: "花费",
    clear: "清除",
    catDetails: "猫咪详情",
    name: "名字",
    breed: "品种",
    appetite: "食量",
    done: "完成",
    tuxedo: "奶牛猫",
    tabby: "橘猫",
    typingBonus: "⌨️ 打字奖励 (2倍)！",
    born: "出生日期",
    sayBye: "说再见",
    theme: "主题",
    forest: "森林",
    grassland: "草原",
    indoor: "温馨室内",
    garden: "花园",
    classic: "经典",
    quit: "退出"
  }
};

export default function App() {
  const [pets, setPets] = useState<{ id: number, type: 'tuxedo' | 'tabby', x: number, y: number, name: string, bornAt?: number }[]>([]);
  const [money, setMoney] = useState(() => {
    const saved = localStorage.getItem('desktopPets_money');
    return saved ? parseFloat(saved) : 100;
  }); // Start with 100 coins or saved amount
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [isScreenActive, setIsScreenActive] = useState(true);
  const [isTypingBonus, setIsTypingBonus] = useState(false);
  const [isInfoMinimized, setIsInfoMinimized] = useState(true);
  const [isDebugMode, setIsDebugMode] = useState(false);
  const [showDebugAnimations, setShowDebugAnimations] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('desktopPets_theme');
    return (saved as Theme) || 'forest';
  });
  const [timeOfDay, setTimeOfDay] = useState(getTimeOfDay());
  const [isAlwaysOnTop, setIsAlwaysOnTop] = useState(() => {
    const saved = localStorage.getItem('desktopPets_onTop');
    return saved === null ? true : saved === 'true';
  });
  const [locale, setLocale] = useState<'en' | 'zh'>(() => {
    const saved = localStorage.getItem('desktopPets_locale');
    return (saved === 'en' || saved === 'zh') ? saved : 'en';
  });
  const [contextMenu, setContextMenu] = useState<{ petId: number, x: number, y: number } | null>(null);
  const [petToDelete, setPetToDelete] = useState<number | null>(null);
  
  const t = TRANSLATIONS[locale];

  const petsRef = useRef(pets);
  const isScreenActiveRef = useRef(isScreenActive);
  const lastTypingTimeRef = useRef(0);

  // Listen for typing
  useEffect(() => {
    const handleKeyDown = () => {
      lastTypingTimeRef.current = Date.now();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    // Move existing pets higher if they are currently near the bottom
    setPets(prev => prev.map(pet => {
      const bottomThreshold = window.innerHeight - 200;
      if (pet.y > bottomThreshold) {
        return { ...pet, y: window.innerHeight - 350 };
      }
      return pet;
    }));
  }, []);

  useEffect(() => {
    localStorage.setItem('desktopPets_pets', JSON.stringify(pets));
  }, [pets]);

  useEffect(() => {
    localStorage.setItem('desktopPets_money', money.toString());
  }, [money]);

  useEffect(() => {
    localStorage.setItem('desktopPets_locale', locale);
  }, [locale]);

  useEffect(() => {
    localStorage.setItem('desktopPets_onTop', String(isAlwaysOnTop));
    try {
      // @ts-ignore
      const ipc = window.require ? window.require('electron').ipcRenderer : null;
      if (ipc) {
        ipc.send('toggle-always-on-top', isAlwaysOnTop);
      }
    } catch(e) { console.log(e); }
  }, [isAlwaysOnTop]);

  useEffect(() => {
    localStorage.setItem('desktopPets_theme', theme);
  }, [theme]);

  useEffect(() => {
    petsRef.current = pets;
  }, [pets]);

  useEffect(() => {
    isScreenActiveRef.current = isScreenActive;
  }, [isScreenActive]);

  // Update time of day every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOfDay(getTimeOfDay());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  // Game Loop for Money
  useEffect(() => {
    let lastTime = Date.now();
    
    const interval = setInterval(() => {
      const now = Date.now();
      const deltaSec = (now - lastTime) / 1000;
      lastTime = now;

      const isTyping = (now - lastTypingTimeRef.current) < 3000; // 3 seconds typing timeout
      setIsTypingBonus(prev => prev !== isTyping ? isTyping : prev);

      setMoney(currentMoney => {
        const currentPets = petsRef.current;
        const tuxCount = currentPets.filter(p => p.type === 'tuxedo').length;
        const tabbyCount = currentPets.filter(p => p.type === 'tabby').length;

        const multiplier = isTyping ? 2 : 1;
        const earned = isScreenActiveRef.current ? (EARN_RATE_PER_SEC * multiplier * deltaSec) : 0;
        const consumed = ((tuxCount * TUXEDO_CONSUME_PER_SEC) + (tabbyCount * TABBY_CONSUME_PER_SEC)) * deltaSec;

        const newMoney = currentMoney + earned - consumed;
        return Math.max(0, newMoney);
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const spawnPet = (specificType?: 'tuxedo' | 'tabby') => {
    const isFree = isDebugMode && specificType;
    if (money >= SPAWN_COST || isFree) {
      let type: 'tuxedo' | 'tabby';
      if (specificType) {
        type = specificType;
      } else {
        const rand = Math.random();
        type = rand > 0.5 ? 'tuxedo' : 'tabby';
      }
      
      if (!isFree) setMoney(m => m - SPAWN_COST);
      setPets(prev => [...prev, {
        id: Date.now(),
        bornAt: Date.now(),
        type,
        name: `${type === 'tuxedo' ? t.tuxedoCat : t.tabbyCat} ${prev.length + 1}`,
        x: Math.random() * (window.innerWidth - 200) + 50,
        y: window.innerHeight - 350 // Spawn higher up
      }]);
    }
  };

  const clearPets = () => setPets([]);

  const removePet = (id: number) => {
    setPets(prev => prev.filter(p => p.id !== id));
    setSelectedPetId(null);
  };

  const updatePetName = (id: number, newName: string) => {
    setPets(prev => prev.map(p => p.id === id ? { ...p, name: newName } : p));
  };

  const toggleLocale = () => {
    setLocale(prev => prev === 'en' ? 'zh' : 'en');
  };

  const isStarving = money === 0;
  
  const currentTuxCount = pets.filter(p => p.type === 'tuxedo').length;
  const currentTabbyCount = pets.filter(p => p.type === 'tabby').length;
  const currentConsumption = (currentTuxCount * TUXEDO_CONSUME_PER_SEC) + (currentTabbyCount * TABBY_CONSUME_PER_SEC);
  const netIncome = (isScreenActive ? (EARN_RATE_PER_SEC * (isTypingBonus ? 2 : 1)) : 0) - currentConsumption;

  const selectedPet = pets.find(p => p.id === selectedPetId);
  const currentBackground = BACKGROUNDS[theme][timeOfDay];

  return (
    <div 
      className="min-h-screen overflow-hidden relative font-sans selection:bg-[#FFD700] selection:text-black bg-cover bg-center bg-no-repeat transition-all duration-1000"
      style={{ backgroundImage: `url(${currentBackground})` }}
    >
      {/* UI Controls */}
      <div className="relative z-50 p-6 max-w-2xl mx-auto mt-12 bg-white/80 backdrop-blur-md rounded-3xl shadow-2xl border border-white/50 text-center transition-all duration-300">
        <button 
          onClick={() => setIsInfoMinimized(!isInfoMinimized)}
          className="absolute top-4 left-4 flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full text-sm font-bold"
        >
          {isInfoMinimized ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>

        <button 
          onClick={() => setIsDebugMode(!isDebugMode)}
          className={`absolute top-4 left-16 flex items-center gap-1 transition-colors px-3 py-1.5 rounded-full text-sm font-bold ${isDebugMode ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-800'}`}
          title="Debug Mode"
        >
          <Bug size={16} />
        </button>

        <button
          onClick={() => setIsAlwaysOnTop(!isAlwaysOnTop)}
          className={`absolute top-4 left-28 flex items-center gap-1 transition-colors px-3 py-1.5 rounded-full text-sm font-bold ${
            isAlwaysOnTop 
              ? 'bg-purple-100 text-purple-700 border border-purple-200 shadow-sm' 
              : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
          }`}
          title={locale === 'en' ? "Always on Top" : "始终置顶层显示"}
        >
          📌 {locale === 'en' ? (isAlwaysOnTop ? "On Top" : "Standard") : (isAlwaysOnTop ? "已置顶" : "常规层")}
        </button>

        <button 
          onClick={toggleLocale}
          className="absolute top-4 right-24 flex items-center gap-1 text-gray-500 hover:text-gray-800 transition-colors bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full text-sm font-bold"
        >
          <Globe size={16} />
          {locale === 'en' ? '中文' : 'English'}
        </button>

        <button 
          onClick={() => window.close()}
          className="absolute top-4 right-4 flex items-center gap-1 text-red-600 hover:text-white transition-colors bg-red-100 hover:bg-red-500 px-3 py-1.5 rounded-full text-sm font-bold"
        >
          <X size={16} />
          {t.quit}
        </button>

        <div className="flex items-center justify-center gap-3 mb-2 mt-2">
          <Monitor className="text-blue-500" size={32} />
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">{t.title}</h1>
        </div>
        
        {!isInfoMinimized && (
          <>
            {/* Theme Selector */}
            <div className="flex justify-center gap-2 mb-6 flex-wrap">
              {(['classic', 'forest', 'grassland', 'indoor', 'garden'] as Theme[]).map(tName => (
                <button
                  key={tName}
                  onClick={() => setTheme(tName)}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${
                    theme === tName 
                      ? 'bg-blue-500 text-white shadow-md' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <ImageIcon size={14} />
                    {t[tName]}
                  </div>
                </button>
              ))}
            </div>

            {/* Economy Stats */}
            <div className="bg-yellow-100 border border-yellow-300 rounded-xl p-4 mb-6 inline-block shadow-inner">
              <div className="flex items-center justify-center gap-2 text-2xl font-black text-yellow-600 mb-1">
                <Coins size={24} />
                {Math.floor(money)}
              </div>
              <div className={`text-sm font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                {t.netIncome}: {netIncome > 0 ? '+' : ''}{netIncome.toFixed(2)} / {t.sec}
              </div>
              {isTypingBonus && isScreenActive && (
                <div className="text-purple-600 font-bold mt-2 animate-bounce flex items-center justify-center gap-1">
                  <Keyboard size={16} />
                  {t.typingBonus}
                </div>
              )}
              {!isScreenActive && (
                <div className="text-blue-600 font-bold mt-2">
                  {t.screenOff}
                </div>
              )}
              {isStarving && (
                <div className="text-red-600 font-bold mt-2 animate-pulse">
                  {t.starving}
                </div>
              )}
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              {isDebugMode && (
                <button
                  onClick={() => setIsScreenActive(!isScreenActive)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg h-fit self-center ${
                    isScreenActive ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'
                  }`}
                >
                  {isScreenActive ? <MonitorOff size={18} /> : <Monitor size={18} />}
                  {isScreenActive ? t.stopScreen : t.resumeScreen}
                </button>
              )}

              <button
                onClick={() => spawnPet()}
                disabled={money < SPAWN_COST}
                className={`flex flex-col items-center gap-1 px-6 py-3 rounded-xl font-bold transition-all shadow-lg ${
                  money >= SPAWN_COST 
                    ? 'bg-purple-500 text-white hover:scale-105' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                <div className="flex items-center gap-2"><Plus size={18} /> {t.spawnPet}</div>
                <div className="text-xs opacity-80">{t.cost}: {SPAWN_COST} 🪙</div>
              </button>
              
              {isDebugMode && pets.length > 0 && (
                <button
                  onClick={clearPets}
                  className="flex items-center gap-2 px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:scale-105 transition-transform shadow-lg h-fit self-center"
                >
                  <Trash2 size={18} />
                  {t.clear}
                </button>
              )}

              {isDebugMode && (
                <button
                  onClick={() => setShowDebugAnimations(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-500 text-white rounded-xl font-bold hover:scale-105 transition-transform shadow-lg h-fit self-center"
                >
                  Animations
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Render Pets */}
      {pets.map(pet => (
        <DesktopPet 
          key={pet.id} 
          type={pet.type} 
          initialX={pet.x} 
          initialY={pet.y} 
          isStarving={isStarving}
          name={pet.name}
          isFrozen={selectedPetId === pet.id}
          onClick={() => setSelectedPetId(pet.id)}
          onContextMenu={(e) => setContextMenu({ petId: pet.id, x: e.clientX, y: e.clientY })}
        />
      ))}

      {contextMenu && (
        <>
          <div 
            className="fixed inset-0 z-[10001]" 
            onClick={() => setContextMenu(null)} 
            onContextMenu={(e) => { e.preventDefault(); setContextMenu(null); }}
          />
          <div 
            className="fixed z-[10002] bg-white rounded-2xl shadow-2xl border border-gray-200 py-2 w-48 overflow-hidden animate-fade-in"
            style={{ 
              left: Math.min(contextMenu.x, window.innerWidth - 200), 
              top: Math.min(contextMenu.y, window.innerHeight - 160) 
            }}
          >
            <button
              onClick={() => { setSelectedPetId(contextMenu.petId); setContextMenu(null); }}
              className="w-full px-4 py-2.5 text-left hover:bg-gray-50 font-bold text-gray-700 flex items-center gap-2 text-sm transition-colors"
            >
              🔍 {t.catDetails}
            </button>
            <button
              onClick={() => { setIsAlwaysOnTop(!isAlwaysOnTop); setContextMenu(null); }}
              className="w-full px-4 py-2.5 text-left hover:bg-gray-50 font-bold text-gray-700 flex items-center gap-2 text-sm transition-colors border-y border-gray-100"
            >
              📌 {locale === 'en' ? (isAlwaysOnTop ? "Switch to Standard" : "Pin Always on Top") : (isAlwaysOnTop ? "取消置顶显示" : "置顶浮动层")}
            </button>
            <button
              onClick={() => { setPetToDelete(contextMenu.petId); setContextMenu(null); }}
              className="w-full px-4 py-2.5 text-left hover:bg-red-50 font-bold text-red-600 flex items-center gap-2 text-sm transition-colors"
            >
              👋 {t.sayBye}
            </button>
          </div>
        </>
      )}

      {/* Pet Details Modal */}
      {selectedPet && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[10000] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl relative border border-white/50">
            <button 
              onClick={() => setSelectedPetId(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-6 text-gray-800">{t.catDetails}</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-600 mb-2">{t.name}</label>
                <input
                  type="text"
                  value={selectedPet.name}
                  onChange={(e) => updatePetName(selectedPet.id, e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-xl p-3 font-bold text-gray-800 focus:border-blue-500 focus:outline-none transition-colors"
                  autoFocus
                />
              </div>
              
              <div className="bg-gray-50 p-4 rounded-xl space-y-3 text-sm font-medium text-gray-600 border border-gray-100">
                <div className="flex justify-between items-center">
                  <span>{t.breed}:</span>
                  <span className="capitalize text-gray-800 font-bold bg-white px-3 py-1 rounded-lg shadow-sm">
                    {t[selectedPet.type]}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>{t.appetite}:</span>
                  <span className="text-gray-800 font-bold bg-white px-3 py-1 rounded-lg shadow-sm">
                    {selectedPet.type === 'tuxedo' ? '10' : '20'} 🪙 / {t.min}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>{t.born}:</span>
                  <span className="text-gray-800 font-bold bg-white px-3 py-1 rounded-lg shadow-sm">
                    {new Date(selectedPet.bornAt || selectedPet.id).toLocaleString(locale === 'zh' ? 'zh-CN' : 'en-US', { dateStyle: 'medium', timeStyle: 'short' })}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button 
                onClick={() => { setPetToDelete(selectedPet.id); setSelectedPetId(null); }}
                className="w-1/3 py-3 bg-red-100 text-red-600 font-bold rounded-xl hover:bg-red-200 transition-colors"
              >
                {t.sayBye}
              </button>
              <button 
                onClick={() => setSelectedPetId(null)}
                className="w-2/3 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30"
              >
                {t.done}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Debug Animations Modal */}
      {isDebugMode && showDebugAnimations && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[10000] flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setShowDebugAnimations(false)}
        >
          <div 
            className="bg-white rounded-3xl p-6 max-w-5xl w-full shadow-2xl relative border border-white/50 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowDebugAnimations(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 transition-colors"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">Debug: Animations</h2>
            <p className="text-gray-500 mb-6 text-sm">Preview all pet species and their animation states. Use the buttons to spawn specific pets for testing.</p>
            
            <div className="space-y-8">
              {(['tuxedo', 'tabby'] as const).map(type => (
                <div key={type} className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
                  <h3 className="text-xl font-bold capitalize mb-4 text-gray-700 flex items-center justify-between">
                    {type}
                    <button 
                      onClick={() => spawnPet(type)}
                      className="text-xs bg-green-500 text-white px-3 py-1 rounded-lg hover:bg-green-600 transition-colors flex items-center gap-1"
                    >
                      <Plus size={12} />
                      Spawn (Free)
                    </button>
                  </h3>
                  <div className="flex flex-wrap gap-4 justify-center">
                    {(['idle', 'walking', 'sleeping', 'eating', 'loaf', 'kneading', 'yarn'] as const).map(state => (
                      <div key={state} className="flex flex-col items-center bg-white rounded-xl p-2 shadow-sm border border-gray-100">
                        <div className="w-40 h-40 relative flex items-center justify-center overflow-hidden rounded-lg bg-gray-100/50">
                          <DesktopPet 
                            type={type} 
                            forceState={state} 
                            staticMode={true} 
                            name=""
                          />
                        </div>
                        <span className="mt-2 font-bold text-gray-600 capitalize">{state}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setShowDebugAnimations(false)}
                className="px-8 py-3 bg-blue-500 text-white font-bold rounded-xl hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/30"
              >
                {t.done}
              </button>
            </div>
          </div>
        </div>
      )}

      {petToDelete && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[20000] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-red-100 text-center">
            <div className="mx-auto w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
              ⚠️
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {locale === 'en' ? "Say Bye to Pet?" : "告别宠物？"}
            </h3>
            <p className="text-gray-500 text-sm font-medium mb-6">
              {locale === 'en' 
                ? "Are you sure you want to send this pet away? You won't be able to retrieve it unless you spawn a new one." 
                : "您确定要遣送这只小猫咪吗？遣送后除非召唤新的，否则无法找回哦。"}
            </p>
            <div className="flex gap-3">
              <button 
                onClick={() => setPetToDelete(null)}
                className="w-1/2 py-3 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition-colors"
              >
                {locale === 'en' ? "Cancel" : "取消"}
              </button>
              <button 
                onClick={() => { 
                  removePet(petToDelete); 
                  setPetToDelete(null); 
                }}
                className="w-1/2 py-3 bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors shadow-lg shadow-red-500/20"
              >
                {locale === 'en' ? "Yes, Say Bye" : "确定遣送"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
