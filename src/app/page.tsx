import HomePage from '@/page/home';
import { FlushTimeZonePage } from '@/components/deck/flushTimezone';
import { getSessionUserId } from './(auth)/api/auth/[...nextauth]/session';

type HomeProps = {
  searchParams: { hourOffset?: string };
};

export default async function Home({ searchParams }: HomeProps) {
  const uid = await getSessionUserId();
  return (
    <>
      <HomePage />
      {uid && (
        <FlushTimeZonePage hourOffset={+(searchParams.hourOffset ?? 4)} />
      )}
    </>
  );
}
