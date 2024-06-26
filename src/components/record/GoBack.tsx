import { Button } from '../ui/button';
import Link from 'next/link';

export default function GoBack() {
  return (
    <Link href={'/note'} legacyBehavior>
      <Button variant={'outline'}>Go Notes</Button>
    </Link>
  );
}
