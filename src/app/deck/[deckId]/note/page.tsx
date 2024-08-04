type Props = {
  params: {
    deckId: string;
  };
  searchParams: {
    deleted: '1' | '0';
  };
};

export default async function Page({ params, searchParams }: Props) {
  const { deckId } = params;
  const deleted = searchParams.deleted === '1' ?? false;
  return (
    <>
      <div>
        {deckId},{String(deleted)}
      </div>
    </>
  );
}
