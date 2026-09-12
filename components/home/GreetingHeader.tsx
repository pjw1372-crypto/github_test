import { greeting, greetingSub } from '@/lib/copy';
import styles from './GreetingHeader.module.css';

interface GreetingHeaderProps {
  childName: string;
}

/** Plain text greeting, not a card/widget — sits beside TopNav in the top row. */
export function GreetingHeader({ childName }: GreetingHeaderProps) {
  return (
    <div className={styles.greeting}>
      <p className={styles.title}>{greeting(childName)}</p>
      <p className={styles.subtitle}>{greetingSub}</p>
    </div>
  );
}
