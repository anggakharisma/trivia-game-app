"use client"
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, Clock, Lock } from 'lucide-react';
import dataQuestions from './data/questions'

// Array of team color schemes
const teamColorSchemes = [
  { bg: "bg-blue-100", border: "border-blue-300", highlight: "bg-blue-200" },
  { bg: "bg-red-100", border: "border-red-300", highlight: "bg-red-200" },
  { bg: "bg-green-100", border: "border-green-300", highlight: "bg-green-200" },
  { bg: "bg-yellow-100", border: "border-yellow-300", highlight: "bg-yellow-200" },
  { bg: "bg-purple-100", border: "border-purple-300", highlight: "bg-purple-200" },
  { bg: "bg-pink-100", border: "border-pink-300", highlight: "bg-pink-200" },
  { bg: "bg-indigo-100", border: "border-indigo-300", highlight: "bg-indigo-200" },
  { bg: "bg-orange-100", border: "border-orange-300", highlight: "bg-orange-200" }
];

// Default teams
const defaultTeams = [
  { id: 1, name: "Team Alpha", score: 0, colorScheme: teamColorSchemes[0] },
  { id: 2, name: "Team Beta", score: 0, colorScheme: teamColorSchemes[1] }
];

// localStorage keys
const TEAMS_STORAGE_KEY = 'trivia_teams';
const ANSWERED_QUESTIONS_KEY = 'trivia_answered_questions';
const GAME_ROUND_KEY = 'trivia_game_round';

// Simple authentication
function LoginForm({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'trivpass2024') {
      onLogin(true);
      setError('');
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-20">
      <CardHeader>
        <CardTitle className="flex items-center justify-center">
          <Lock className="mr-2" /> Admin Login
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleLogin}>
        <CardContent className="space-y-4">
          {error && <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
          <div className="space-y-2">
            <label htmlFor="username" className="block text-sm font-medium">Username</label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">Password</label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">Login</Button>
        </CardFooter>
      </form>
    </Card>
  );
}

// Perfect Circle Buzzer Component with responsive design
function PerfectCircleBuzzer({ onClick, isActive }) {
  const [size, setSize] = useState(0);
  const containerRef = useRef(null);

  // Update buzzer size on mount and window resize
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        // Use the smaller of width or height, and take 70% of that value
        const smallerDimension = Math.min(containerWidth, containerHeight) * 0.7;
        setSize(smallerDimension);
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 flex items-center justify-center bg-gray-100"
    >
      <button
        onClick={onClick}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          fontSize: `${size / 10}px` // Responsive font size
        }}
        className={`rounded-full flex items-center justify-center
                  bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold shadow-2xl
                  transform transition-all duration-300 active:scale-95 focus:outline-none 
                  ${isActive ? 'animate-pulse bg-red-500' : 'bg-red-600'}`}
      >
        BUZZ!
      </button>
    </div>
  );
}

export default function TriviaApp() {
  // Load teams from localStorage or use default teams
  const loadTeamsFromStorage = () => {
    if (typeof window !== 'undefined') {
      const storedTeams = localStorage.getItem(TEAMS_STORAGE_KEY);
      return storedTeams ? JSON.parse(storedTeams) : defaultTeams;
    }
    return defaultTeams;
  };

  // Load answered questions from localStorage
  const loadAnsweredQuestionsFromStorage = () => {
    if (typeof window !== 'undefined') {
      const storedAnsweredQuestions = localStorage.getItem(ANSWERED_QUESTIONS_KEY);
      return storedAnsweredQuestions ? JSON.parse(storedAnsweredQuestions) : [];
    }
    return [];
  };

  // Load game round from localStorage
  const loadGameRoundFromStorage = () => {
    if (typeof window !== 'undefined') {
      const storedGameRound = localStorage.getItem(GAME_ROUND_KEY);
      return storedGameRound ? parseInt(storedGameRound, 10) : 1;
    }
    return 1;
  };

  const [teams, setTeams] = useState([]);
  const [questions, setQuestions] = useState(dataQuestions);
  const [gameRound, setGameRound] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [newTeamName, setNewTeamName] = useState("");
  const [viewMode, setViewMode] = useState("game"); // "game", "buzzer", "admin"
  const [showAnswer, setShowAnswer] = useState(false);
  const [answeredQuestions, setAnsweredQuestions] = useState([]);
  const [buzzerActive, setBuzzerActive] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const audioRef = useRef(null);

  // Initialize state from localStorage when component mounts
  useEffect(() => {
    setTeams(loadTeamsFromStorage());
    setAnsweredQuestions(loadAnsweredQuestionsFromStorage());
    setGameRound(loadGameRoundFromStorage());
  }, []);

  // Update localStorage whenever teams, answered questions, or game round changes
  useEffect(() => {
    if (teams.length > 0) {
      localStorage.setItem(TEAMS_STORAGE_KEY, JSON.stringify(teams));
    }
  }, [teams]);

  useEffect(() => {
    localStorage.setItem(ANSWERED_QUESTIONS_KEY, JSON.stringify(answeredQuestions));
  }, [answeredQuestions]);

  useEffect(() => {
    localStorage.setItem(GAME_ROUND_KEY, gameRound.toString());
  }, [gameRound]);

  // Function to add a new team
  const addTeam = () => {
    if (newTeamName.trim() === "") return;
    // Get the next color scheme based on current team count
    const colorIndex = teams.length % teamColorSchemes.length;

    const newTeam = {
      id: teams.length > 0 ? Math.max(...teams.map(t => t.id)) + 1 : 1,
      name: newTeamName,
      score: 0,
      colorScheme: teamColorSchemes[colorIndex]
    };
    setTeams([...teams, newTeam]);
    setNewTeamName("");
  };

  // Function to update team score
  const updateScore = (teamId, points) => {
    setTeams(teams.map(team =>
      team.id === teamId ? { ...team, score: team.score + points } : team
    ));
  };

  // Function to select a question
  const selectQuestion = (categoryIdx, questionIdx) => {
    const category = questions.categories[categoryIdx];
    const question = category.questions[questionIdx];
    const pointMultiplier = gameRound === 2 ? 2 : 1;

    setCurrentQuestion({
      ...question,
      category: category.name,
      actualPoints: question.points * pointMultiplier
    });

    // Mark question as answered
    setAnsweredQuestions([...answeredQuestions, question.id]);
  };

  // Function to close the current question and go back to categories
  const closeQuestion = () => {
    setCurrentQuestion(null);
    setShowAnswer(false);
  };

  // Play buzzer sound
  const playBuzzerSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
    setBuzzerActive(true);
    setTimeout(() => setBuzzerActive(false), 2000); // Reset buzzer after 2 seconds
  };

  // Reset game function
  const resetGame = () => {
    if (window.confirm("Are you sure you want to reset the game? This will clear all answered questions.")) {
      setAnsweredQuestions([]);
      localStorage.removeItem(ANSWERED_QUESTIONS_KEY);
    }
  };

  // Clear all data function
  const clearAllData = () => {
    if (window.confirm("Are you sure you want to clear all data? This will remove all teams, scores, and game progress.")) {
      localStorage.removeItem(TEAMS_STORAGE_KEY);
      localStorage.removeItem(ANSWERED_QUESTIONS_KEY);
      localStorage.removeItem(GAME_ROUND_KEY);
      setTeams(defaultTeams);
      setAnsweredQuestions([]);
      setGameRound(1);
    }
  };

  // Check if we should show the login screen
  const needsAuthentication = (viewMode === "admin" || viewMode === "game") && !isAuthenticated;

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Audio element for buzzer sound */}
      <audio
        ref={audioRef}
        src="/sounds/buzzer.mp3" // You'll need to add this sound file to your project
      />

      {viewMode === "buzzer" ? (
        <PerfectCircleBuzzer onClick={playBuzzerSound} isActive={buzzerActive} />
      ) : (
        <div className="p-4 max-w-6xl mx-auto">
          <header className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Trivia Game</h1>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "game" ? "default" : "outline"}
                onClick={() => setViewMode("game")}
              >
                Game Board
              </Button>
              <Button
                variant={viewMode === "buzzer" ? "default" : "outline"}
                onClick={() => setViewMode("buzzer")}
              >
                Buzzer
              </Button>
              <Button
                variant={viewMode === "admin" ? "default" : "outline"}
                onClick={() => setViewMode("admin")}
              >
                Admin
              </Button>
            </div>
          </header>

          {needsAuthentication ? (
            <LoginForm onLogin={setIsAuthenticated} />
          ) : (
            <>
              {viewMode === "game" && (
                <div className="game-container">
                  <div className="rounds-toggle mb-4 flex justify-center">
                    <Tabs defaultValue={gameRound === 1 ? "round1" : "round2"} className="w-full max-w-md">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger
                          value="round1"
                          onClick={() => setGameRound(1)}
                          className={gameRound === 1 ? "font-bold" : ""}
                        >
                          Round 1 (10 pts)
                        </TabsTrigger>
                        <TabsTrigger
                          value="round2"
                          onClick={() => setGameRound(2)}
                          className={gameRound === 2 ? "font-bold" : ""}
                        >
                          Final Round (20 pts)
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  <div className="teams-scoreboard grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                    {teams.map(team => (
                      <Card
                        key={team.id}
                        className={`${team.colorScheme.bg} border-2 ${team.colorScheme.border}`}
                      >
                        <CardHeader className="pb-2">
                          <CardTitle className="flex justify-between">
                            <span className='text-xl'>{team.name}</span>
                            <span className="text-2xl font-bold">{team.score}</span>
                          </CardTitle>
                        </CardHeader>
                        <CardFooter className="pt-2 flex justify-end gap-2">
                      
                          <Button size="sm" variant="outline" onClick={() => updateScore(team.id, -10)}>-10</Button>
                          <Button size="sm" variant="outline" onClick={() => updateScore(team.id, 10)}>+10</Button>
                          <Button size="sm" variant="outline" onClick={() => updateScore(team.id, 20)}>+20</Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>

                  {currentQuestion ? (
                    <Card className="mt-4 bg-white">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="text-sm text-gray-500">{currentQuestion.category}</p>
                            <CardTitle className="text-2xl">{currentQuestion.text}</CardTitle>
                          </div>
                          <div className="text-xl font-bold">
                            {currentQuestion.actualPoints} pts
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {showAnswer ? (
                          <div className="p-4 bg-green-50 rounded-md border border-green-200">
                            <p className="font-semibold">Answer: {currentQuestion.answer}</p>
                          </div>
                        ) : (
                          <Button onClick={() => setShowAnswer(true)}>Reveal Answer</Button>
                        )}
                      </CardContent>
                      <CardFooter className="flex justify-between">
                        <Button variant="outline" onClick={closeQuestion}>Back to Board</Button>
                        <div className="flex gap-2">
                          {teams.map(team => (
                            <Button
                              key={team.id}
                              onClick={() => updateScore(team.id, currentQuestion.actualPoints)}
                              className={`${team.colorScheme.highlight} hover:bg-opacity-80 text-gray-800 border hover:border-gray-400`}
                            >
                              {team.name} +{currentQuestion.actualPoints}
                            </Button>
                          ))}
                        </div>
                      </CardFooter>
                    </Card>
                  ) : (
                    <div className="categories-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {questions.categories.map((category, categoryIdx) => (
                        <Card key={category.name} className="bg-white">
                          <CardHeader className="pb-2">
                            <CardTitle>{category.name}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 gap-2">
                              {category.questions.map((question, questionIdx) => (
                                <Button
                                  key={question.id}
                                  variant={answeredQuestions.includes(question.id) ? "ghost" : "outline"}
                                  disabled={answeredQuestions.includes(question.id)}
                                  onClick={() => selectQuestion(categoryIdx, questionIdx)}
                                  className="h-12"
                                >
                                  {question.points * (gameRound === 2 ? 2 : 1)} pts
                                </Button>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {viewMode === "admin" && (
                <div className="admin-container">
                  <Card className="bg-white mb-6">
                    <CardHeader>
                      <CardTitle>Add Team</CardTitle>
                    </CardHeader>
                    <CardContent className="flex gap-2">
                      <Input
                        placeholder="Team Name"
                        value={newTeamName}
                        onChange={(e) => setNewTeamName(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') addTeam();
                        }}
                      />
                      <Button onClick={addTeam}>Add Team</Button>
                    </CardContent>
                  </Card>

                  <Card className="bg-white mb-6">
                    <CardHeader>
                      <CardTitle>Teams & Scores</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-2">
                        {teams.map(team => (
                          <div
                            key={team.id}
                            className={`flex justify-between items-center p-2 border rounded ${team.colorScheme.bg}`}
                          >
                            <span>{team.name}</span>
                            <div className="flex items-center gap-2">
                              <span className="font-bold">{team.score}</span>
                              <Button variant="outline" size="sm" onClick={() => {
                                setTeams(teams.filter(t => t.id !== team.id));
                              }}>Remove</Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" onClick={() => {
                        if (window.confirm("Are you sure you want to reset all scores to zero?")) {
                          setTeams(teams.map(team => ({ ...team, score: 0 })));
                        }
                      }}>Reset All Scores</Button>
                    </CardFooter>
                  </Card>

                  <Card className="bg-white">
                    <CardHeader>
                      <CardTitle>Game Management</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Reset game progress (keeps teams and scores, but clears answered questions)</p>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={resetGame}
                        >
                          Reset Game Progress
                        </Button>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500 mb-2">Clear all data (removes all teams, scores, and game progress)</p>
                        <Button
                          variant="destructive"
                          className="w-full"
                          onClick={clearAllData}
                        >
                          Clear All Data
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
