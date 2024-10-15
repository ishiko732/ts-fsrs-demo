'use client';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

export default function GoHome() {
  const router = useRouter();
  return <Button onClick={() => router.replace('/deck')}>Go Decks</Button>;
}
