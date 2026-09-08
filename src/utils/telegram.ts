import WebApp from '@twa-dev/sdk';

export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  photo_url?: string;
}

export const isTelegramEnvironment = (): boolean => {
  return typeof window !== 'undefined' && !!(window as unknown as { Telegram?: { WebApp?: { initData?: string } } }).Telegram?.WebApp?.initData;
};

export const initTelegramApp = () => {
  try {
    WebApp.ready();
    WebApp.expand();
    if (WebApp.setHeaderColor) {
      WebApp.setHeaderColor('#030712');
    }
    if (WebApp.setBackgroundColor) {
      WebApp.setBackgroundColor('#030712');
    }
  } catch (err) {
    console.warn('Telegram WebApp init notice (dev/browser mode):', err);
  }
};

export const getTelegramUser = (): TelegramUser => {
  try {
    const user = WebApp.initDataUnsafe?.user;
    if (user && user.id) {
      return {
        id: user.id,
        first_name: user.first_name || 'Warrior',
        last_name: user.last_name,
        username: user.username || 'warrior_tg',
        photo_url: user.photo_url,
        language_code: user.language_code,
      };
    }
  } catch {
    // fallback
  }

  return {
    id: 7770001,
    first_name: 'IronMind',
    username: 'iron_spartan',
    photo_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    language_code: 'en',
  };
};

export const triggerHaptic = (type: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft' = 'medium') => {
  try {
    if (WebApp.HapticFeedback?.impactOccurred) {
      WebApp.HapticFeedback.impactOccurred(type);
    } else if (navigator.vibrate) {
      navigator.vibrate(type === 'heavy' ? 40 : 20);
    }
  } catch {
    // ignore
  }
};

export const triggerNotificationHaptic = (type: 'error' | 'success' | 'warning') => {
  try {
    if (WebApp.HapticFeedback?.notificationOccurred) {
      WebApp.HapticFeedback.notificationOccurred(type);
    } else if (navigator.vibrate) {
      navigator.vibrate(type === 'error' ? [50, 50, 50] : [30, 20, 30]);
    }
  } catch {
    // ignore
  }
};

export const triggerSelectionHaptic = () => {
  try {
    if (WebApp.HapticFeedback?.selectionChanged) {
      WebApp.HapticFeedback.selectionChanged();
    }
  } catch {
    // ignore
  }
};
