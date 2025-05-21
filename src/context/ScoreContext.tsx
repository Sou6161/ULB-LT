// ScoreContext.tsx
import { createContext, useContext, useState, useEffect } from 'react';

type ScoreContextType = {
  totalScore: number;
  levelTwoScore: number;
  questionnaireScore: number;
  updateScore: (delta: number) => void;
  setLevelTwoScore: (score: number) => void;
  updateQuestionnaireScore: (delta: number) => void;
  resetAllScores: () => void;
};

const ScoreContext = createContext<ScoreContextType>({
  totalScore: 0,
  levelTwoScore: 0,
  questionnaireScore: 0,
  updateScore: () => {},
  setLevelTwoScore: () => {},
  updateQuestionnaireScore: () => {},
  resetAllScores: () => {},
});

export const ScoreProvider = ({ children }: { children: React.ReactNode }) => {
  // Initialize scores from sessionStorage or default to 0
  const [totalScore, setTotalScore] = useState(() => {
    return parseInt(sessionStorage.getItem('totalScore') || '0', 10);
  });
  
  const [levelTwoScore, setLevelTwoScore] = useState(() => {
    return parseInt(sessionStorage.getItem('levelTwoScore') || '0', 10);
  });
  
  const [questionnaireScore, setQuestionnaireScore] = useState(() => {
    return parseInt(sessionStorage.getItem('questionnaireScore') || '0', 10);
  });

  // Persist scores to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem('totalScore', totalScore.toString());
  }, [totalScore]);

  useEffect(() => {
    sessionStorage.setItem('levelTwoScore', levelTwoScore.toString());
  }, [levelTwoScore]);

  useEffect(() => {
    sessionStorage.setItem('questionnaireScore', questionnaireScore.toString());
  }, [questionnaireScore]);

  const updateScore = (delta: number) => {
    setTotalScore(prev => {
      const newScore = Math.max(0, prev + delta);
      return newScore;
    });
  };

  const updateLevelTwoScore = (score: number) => {
    setLevelTwoScore(score);
    // Update total score to keep them in sync
    setTotalScore(score);
  };

  const updateQuestionnaireScore = (delta: number) => {
    setQuestionnaireScore(prev => {
      const newScore = Math.max(0, prev + delta);
      return newScore;
    });
    // Also update total score
    updateScore(delta);
  };

  const resetAllScores = () => {
    setTotalScore(0);
    setLevelTwoScore(0);
    setQuestionnaireScore(0);
    sessionStorage.removeItem('totalScore');
    sessionStorage.removeItem('levelTwoScore');
    sessionStorage.removeItem('questionnaireScore');
  };

  return (
    <ScoreContext.Provider
      value={{
        totalScore,
        levelTwoScore,
        questionnaireScore,
        updateScore,
        setLevelTwoScore: updateLevelTwoScore,
        updateQuestionnaireScore,
        resetAllScores,
      }}
    >
      {children}
    </ScoreContext.Provider>
  );
};

export const useScore = () => useContext(ScoreContext);