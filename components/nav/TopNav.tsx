import { nav as navCopy } from '@/lib/copy';
import { NotificationIcon } from './icons/NotificationIcon';
import { LibraryIcon } from './icons/LibraryIcon';
import { HomeIcon } from './icons/HomeIcon';
import styles from './TopNav.module.css';

type NavItem = 'notifications' | 'library' | 'home';

interface TopNavProps {
  activeItem: NavItem;
}

/**
 * Exactly 3 buttons, fixed order: 알림 → 서재 → 홈 (DESIGN_SYSTEM.md §1-1 v8).
 * No search button. No left sidebar. 홈 is always rightmost and, on this screen,
 * always the active item.
 */
export function TopNav({ activeItem }: TopNavProps) {
  return (
    <nav className={styles.nav} aria-label="주요 메뉴">
      <button
        type="button"
        className={`${styles.item} ${activeItem === 'notifications' ? styles.active : ''}`}
        aria-current={activeItem === 'notifications' ? 'page' : undefined}
      >
        <NotificationIcon className={styles.icon} />
        <span>{navCopy.notifications}</span>
      </button>
      <button
        type="button"
        className={`${styles.item} ${activeItem === 'library' ? styles.active : ''}`}
        aria-current={activeItem === 'library' ? 'page' : undefined}
      >
        <LibraryIcon className={styles.icon} />
        <span>{navCopy.library}</span>
      </button>
      <button
        type="button"
        className={`${styles.item} ${activeItem === 'home' ? styles.active : ''}`}
        aria-current={activeItem === 'home' ? 'page' : undefined}
      >
        <HomeIcon className={styles.icon} />
        <span>{navCopy.home}</span>
      </button>
    </nav>
  );
}
