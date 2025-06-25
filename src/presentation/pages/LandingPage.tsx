import { Header } from '../components/Header';
import { HeroSection } from '../components/HeroSection';
import { HowToUse } from '../components/HowToUse';
import { GameModes } from '../components/GameModes';
import { ChessBoard } from '../components/ChessBoard';

export const LandingPage = () => (
  <>
    <Header />
    <main>
      <HeroSection />
      <HowToUse />
      <GameModes />
      <ChessBoard />
    </main>

  </>
);
