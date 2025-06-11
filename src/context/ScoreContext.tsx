import React, { createContext, useContext, useState, useEffect } from 'react';

export type ScoreContextType = {
  totalScore: number;
  levelTwoScore: number;
  questionnaireScore: number;
  updateTotalScore: (delta: number) => void;
  updateLevelTwoScore: (delta: number) => void;
  updateQuestionnaireScore: (delta: number) => void;
  resetAllScores: () => void;
  setTotalScore: (score: number) => void;
  setLevelTwoScore: (score: number) => void;
  resetScore: () => void;
};

const ScoreContext = createContext<ScoreContextType>({
  totalScore: 0,
  levelTwoScore: 0,
  questionnaireScore: 0,
  updateTotalScore: () => {},
  updateLevelTwoScore: () => {},
  updateQuestionnaireScore: () => {},
  resetAllScores: () => {},
  setTotalScore: () => {},
  setLevelTwoScore: () => {},
  resetScore: () => {},
});

export const ScoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize scores from sessionStorage or default to 0
  const [totalScore, setTotalScore] = useState(() => {
    const saved = sessionStorage.getItem('totalScore');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [levelTwoScore, setLevelTwoScore] = useState(() => {
    const saved = sessionStorage.getItem('levelTwoScore');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [questionnaireScore, setQuestionnaireScore] = useState(() => {
    const saved = sessionStorage.getItem('questionnaireScore');
    return saved ? parseInt(saved, 10) : 0;
  });

  // Save scores to sessionStorage whenever they change
  useEffect(() => {
    sessionStorage.setItem('totalScore', totalScore.toString());
  }, [totalScore]);

  useEffect(() => {
    sessionStorage.setItem('levelTwoScore', levelTwoScore.toString());
  }, [levelTwoScore]);

  useEffect(() => {
    sessionStorage.setItem('questionnaireScore', questionnaireScore.toString());
  }, [questionnaireScore]);

  // Update total score whenever levelTwoScore or questionnaireScore changes
  useEffect(() => {
    setTotalScore(levelTwoScore + questionnaireScore);
  }, [levelTwoScore, questionnaireScore]);

  const updateTotalScore = (delta: number) => {
    setTotalScore(prev => prev + delta);
  };

  const updateLevelTwoScore = (delta: number) => {
    setLevelTwoScore(prev => {
      const newScore = prev + delta;
      return newScore;
    });
  };

  const updateQuestionnaireScore = (delta: number) => {
    setQuestionnaireScore(prev => {
      const newScore = prev + delta;
      return newScore;
    });
  };

  const resetAllScores = () => {
    setTotalScore(0);
    setLevelTwoScore(0);
    setQuestionnaireScore(0);
    sessionStorage.removeItem('totalScore');
    sessionStorage.removeItem('levelTwoScore');
    sessionStorage.removeItem('questionnaireScore');
  };

  const resetScore = () => {
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
        updateTotalScore,
        updateLevelTwoScore,
        updateQuestionnaireScore,
        resetAllScores,
        setTotalScore,
        setLevelTwoScore,
        resetScore,
      }}
    >
      {children}
    </ScoreContext.Provider>
  );
};

export const useScore = () => useContext(ScoreContext);



// latest code