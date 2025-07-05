import GameInit from '../components/GameInit/GameInit';
import { RedisTest } from '../components/RedisTest/RedisTest';

export function HomePage() {

  return (
    <div>
      <RedisTest />
      <GameInit/>
    </div>
  );
}

