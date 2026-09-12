import { SpeechBubble } from './SpeechBubble';
import styles from './MascotHero.module.css';

interface MascotHeroProps {
  speech: string;
}

/**
 * 여울 마스코트 히어로 영역.
 *
 * PLACEHOLDER NOTICE: the confirmed home-screen mascot pose (안경·보타이, 파란 책을 들고
 * 앉아 읽는 포즈 — "yeoul-fox-home-sitting-reading.png") was only reviewed inline in chat
 * and does not exist as a file anywhere in this environment. Per this task's explicit
 * instruction not to redraw/reinterpret the mascot, no substitute illustration is drawn
 * here — this renders a neutral, clearly-labeled placeholder box at the final image's
 * aspect ratio instead.
 *
 * To finish: save the real PNG to /public/images/mascot/yeoul-fox-home-sitting-reading.png,
 * then replace the placeholder <div> below with
 *   <Image src="/images/mascot/yeoul-fox-home-sitting-reading.png" alt="여울" fill style={{objectFit: 'contain'}} />
 * and remove the placeholder border/background from MascotHero.module.css — no other
 * layout changes are needed, the wrapper/aspect-ratio box is already sized for it.
 */
export function MascotHero({ speech }: MascotHeroProps) {
  return (
    <div className={styles.wrapper}>
      <SpeechBubble text={speech} />
      <div className={styles.imageBox} role="img" aria-label="여울 마스코트 (앉아서 책 읽는 포즈)">
        <p className={styles.placeholderText}>
          여울 마스코트 이미지 자리
          <br />
          (yeoul-fox-home-sitting-reading.png 대기 중)
        </p>
      </div>
    </div>
  );
}
