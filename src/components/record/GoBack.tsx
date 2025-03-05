import Link from 'next/link';

import { Button } from '../ui/button';

export default function GoBack() {
  return (
    <Link href={'/note'} legacyBehavior>
      <Button variant={'outline'}>Go Notes</Button>
    </Link>
  );
}
