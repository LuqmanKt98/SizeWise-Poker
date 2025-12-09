
import PokerRoom from './components/PokerRoom';
import Loader from './components/Loader';
import { Suspense } from 'react';

export default function RoomPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<Loader />}>
      <PokerRoom roomId={params.id} />
    </Suspense>
  );
}

    