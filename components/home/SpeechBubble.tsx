import styles from './SpeechBubble.module.css';

interface SpeechBubbleProps {
  text: string;
}

/**
 * Kept as its own component (separate from MascotHero) so its content/position can change
 * independently once 여울 gains expression/animation states (DESIGN_SYSTEM.md §1-1 v8,
 * principle 7 — "인터랙션 가능한 캐릭터 영역으로 여지를 두고 설계").
 */
export function SpeechBubble({ text }: SpeechBubbleProps) {
  return (
    <div className={styles.bubble}>
      <p className={styles.text}>{text}</p>
    </div>
  );
}
