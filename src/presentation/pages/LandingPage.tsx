import { Header } from '../components/Header';
import { HeroSection } from '../components/HeroSection';
import { HowToUse } from '../components/HowToUse';
import { GameModes } from '../components/GameModes';
import { ChessBoard } from '../components/ChessBoard';
import './LandingPage.css'

export const LandingPage = () => (
  <>
    <Header />
    <main>
      
      <div className='hero-container'>
        <HeroSection />
      </div>
      <HowToUse />
      <GameModes />
    </main>
    <div className='asd'>
      <ChessBoard />
    </div>

  </>
);
