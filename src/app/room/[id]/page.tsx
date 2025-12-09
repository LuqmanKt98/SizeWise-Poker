
import PokerRoom from './components/PokerRoom';
import Loader from './components/Loader';
import { Suspense } from 'react';

export default async function RoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <Suspense fallback={<Loader />}>
      <PokerRoom roomId={id} />
    </Suspense>
  );
}

    