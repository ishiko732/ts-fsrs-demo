import DeckPage from '@/page/deck';

export const dynamic = 'force-dynamic';
type PageProps = {
  searchParams: {
    deleted: '1' | '0';
  };
};
export default async function Page({ searchParams }: PageProps) {
  return <DeckPage deleted={searchParams.deleted === '1' ?? false} />;
}
