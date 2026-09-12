import type { TodayLearning } from '@/lib/types';
import { dayTypeLabel, todayLearningTitle } from '@/lib/copy';
import styles from './TodayLearningCard.module.css';

interface TodayLearningCardProps {
  data: TodayLearning;
}

/**
 * The single dominant "오늘의 학습" card. Branches on data.dayType — a reading day shows
 * a book cover + reading progress; a drawing day shows the source story instead, with no
 * cover thumbnail (book covers are reading-day-only, per DESIGN_SYSTEM.md §1-1 v8).
 * Exactly one Primary CTA lives here — the only Primary button on the whole screen.
 */
export function TodayLearningCard({ data }: TodayLearningCardProps) {
  return (
    <section className={styles.card} aria-label={todayLearningTitle}>
      <p className={styles.dayTypeLabel}>{dayTypeLabel[data.dayType]}</p>

      {data.dayType === 'reading' && data.reading && (
        <>
          <div className={styles.readingRow}>
            <div className={styles.cover} aria-hidden="true">
              <p className={styles.coverPlaceholderText}>표지 이미지 대기 중</p>
            </div>
            <div className={styles.readingBody}>
              <h2 className={styles.title}>{data.reading.bookTitle}</h2>
              <p className={styles.author}>{data.reading.author}</p>
              <div
                className={styles.progressTrack}
                role="progressbar"
                aria-valuenow={data.reading.progressPercent}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <div
                  className={styles.progressFill}
                  style={{ width: `${data.reading.progressPercent}%` }}
                />
              </div>
              <p className={styles.supportingText}>{data.reading.supportingText}</p>
            </div>
          </div>
        </>
      )}

      {data.dayType === 'drawing' && data.drawing && (
        <div className={styles.readingBody}>
          <h2 className={styles.title}>{data.drawing.sourceBookTitle}</h2>
          <p className={styles.supportingText}>{data.drawing.supportingText}</p>
        </div>
      )}

      <button type="button" className={styles.cta}>
        {data.ctaLabel}
      </button>
    </section>
  );
}
