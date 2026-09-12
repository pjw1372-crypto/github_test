import { TopNav } from '@/components/nav/TopNav';
import { GreetingHeader } from '@/components/home/GreetingHeader';
import { TodayLearningCard } from '@/components/home/TodayLearningCard';
import { MascotHero } from '@/components/home/MascotHero';
import { childName, todayLearning } from '@/lib/mockData';
import styles from './HomeScreen.module.css';

/**
 * Home screen — built fresh from PROJECT_BRIEF.md / DESIGN_SYSTEM.md §1-1 v8, not a
 * modification of any prior implementation (none existed in this repo).
 *
 * Information priority (v8): ① today's learning task + one CTA (TodayLearningCard)
 * ② the guiding mascot (MascotHero) ③ 서재, reached only via TopNav — no other widgets.
 */
export function HomeScreen() {
  return (
    <div className={styles.page}>
      <div className={styles.topRow}>
        <GreetingHeader childName={childName} />
        <TopNav activeItem="home" />
      </div>

      <div className={styles.main}>
        <TodayLearningCard data={todayLearning} />
        <MascotHero speech={todayLearning.mascotSpeech} />
      </div>
    </div>
  );
}
