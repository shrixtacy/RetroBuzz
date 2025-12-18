import React, { useState, useEffect, useCallback } from 'react';
import { SoundEffects } from '../utils/soundEffects';

type Player = 'X' | 'O' | null;
type GameResult = Player | 'tie';
type Board = Player[];
type Difficulty = 'easy' | 'medium' | 'hard' | 'impossible';

interface TicTacToeGameProps {
  onGameEnd: (winner: Player, difficulty: Difficulty) => void;
}

const TicTacToeGame: React.FC<TicTacToeGameProps> = ({ onGameEnd }) => {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState<Player>(null);
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [playerScore, setPlayerScore] = useState(0);
  const [aiScore, setAiScore] = useState(0);
  const [ties, setTies] = useState(0);
  const [gameCount, setGameCount] = useState(0);
  const [soundEffects] = useState(() => SoundEffects.getInstance());

  const winningCombinations = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6] // Diagonals
  ];

  const checkWinner = useCallback((board: Board): GameResult => {
    for (const combination of winningCombinations) {
      const [a, b, c] = combination;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    return board.includes(null) ? null : 'tie';
  }, [winningCombinations]);

  // Minimax algorithm for impossible difficulty
  const minimax = useCallback((board: Board, depth: number, isMaximizing: boolean, alpha: number = -Infinity, beta: number = Infinity): number => {
    const result = checkWinner(board);
    
    if (result === 'O') return 10 - depth; // AI wins
    if (result === 'X') return depth - 10; // Player wins
    if (result === 'tie') return 0; // Tie
    
    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'O';
          const evaluation = minimax(board, depth + 1, false, alpha, beta);
          board[i] = null;
          maxEval = Math.max(maxEval, evaluation);
          alpha = Math.max(alpha, evaluation);
          if (beta <= alpha) break; // Alpha-beta pruning
        }
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let i = 0; i < 9; i++) {
        if (board[i] === null) {
          board[i] = 'X';
          const evaluation = minimax(board, depth + 1, true, alpha, beta);
          board[i] = null;
          minEval = Math.min(minEval, evaluation);
          beta = Math.min(beta, evaluation);
          if (beta <= alpha) break; // Alpha-beta pruning
        }
      }
      return minEval;
    }
  }, [checkWinner]);

  // Get best move using minimax
  const getBestMove = useCallback((board: Board): number => {
    let bestMove = -1;
    let bestValue = -Infinity;
    
    for (let i = 0; i < 9; i++) {
      if (board[i] === null) {
        board[i] = 'O';
        const moveValue = minimax(board, 0, false);
        board[i] = null;
        
        if (moveValue > bestValue) {
          bestValue = moveValue;
          bestMove = i;
        }
      }
    }
    
    return bestMove;
  }, [minimax]);

  // Strategic move evaluation
  const evaluateMove = useCallback((board: Board, position: number, player: Player): number => {
    let score = 0;
    
    // Check each winning combination
    for (const combination of winningCombinations) {
      if (combination.includes(position)) {
        const line = combination.map(pos => board[pos]);
        const playerCount = line.filter(cell => cell === player).length;
        const opponentCount = line.filter(cell => cell === (player === 'O' ? 'X' : 'O')).length;
        const emptyCount = line.filter(cell => cell === null).length;
        
        if (opponentCount === 0) {
          // No opponent pieces in this line
          if (playerCount === 2 && emptyCount === 1) score += 100; // Winning move
          else if (playerCount === 1 && emptyCount === 2) score += 10; // Good position
        } else if (playerCount === 0) {
          // No player pieces in this line
          if (opponentCount === 2 && emptyCount === 1) score += 50; // Block opponent win
          else if (opponentCount === 1 && emptyCount === 2) score += 5; // Block opponent setup
        }
      }
    }
    
    // Center preference
    if (position === 4) score += 15;
    
    // Corner preference
    if ([0, 2, 6, 8].includes(position)) score += 8;
    
    return score;
  }, [winningCombinations]);

  const getAIMove = useCallback((board: Board, difficulty: Difficulty): number => {
    const availableMoves = board.map((cell, index) => cell === null ? index : -1).filter(index => index !== -1);
    
    if (availableMoves.length === 0) return -1;
    
    switch (difficulty) {
      case 'easy':
        // 70% random, 30% strategic
        if (Math.random() < 0.7) {
          return availableMoves[Math.floor(Math.random() * availableMoves.length)];
        }
        // Fall through to medium logic
        
      case 'medium':
        // Strategic but not perfect
        // First check for winning moves
        for (const move of availableMoves) {
          const testBoard = [...board];
          testBoard[move] = 'O';
          const result = checkWinner(testBoard);
          if (result === 'O') {
            return move;
          }
        }
        
        // Then check for blocking moves
        for (const move of availableMoves) {
          const testBoard = [...board];
          testBoard[move] = 'X';
          const result = checkWinner(testBoard);
          if (result === 'X') {
            return move;
          }
        }
        
        // Otherwise, pick strategically
        let bestMove = availableMoves[0];
        let bestScore = -1;
        
        for (const move of availableMoves) {
          const score = evaluateMove(board, move, 'O');
          if (score > bestScore) {
            bestScore = score;
            bestMove = move;
          }
        }
        
        return bestMove;
        
      case 'hard':
        // Mix of minimax and strategic play
        if (availableMoves.length > 6) {
          // Early game: use strategic evaluation
          return getAIMove(board, 'medium');
        } else {
          // Late game: use minimax with some randomness
          if (Math.random() < 0.8) {
            return getBestMove(board);
          } else {
            return getAIMove(board, 'medium');
          }
        }
        
      case 'impossible':
        // Perfect play using minimax
        return getBestMove(board);
        
      default:
        return availableMoves[0];
    }
  }, [checkWinner, evaluateMove, getBestMove]);

  const makeMove = useCallback((position: number) => {
    if (board[position] || gameOver || !isPlayerTurn) return;
    
    soundEffects.playTicTacToeMove();
    const newBoard = [...board];
    newBoard[position] = 'X';
    setBoard(newBoard);
    setIsPlayerTurn(false);
    
    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result === 'tie' ? null : result);
      setGameOver(true);
      if (result === 'X') {
        soundEffects.playGameWin();
        setPlayerScore(prev => prev + 1);
      } else if (result === 'tie') {
        setTies(prev => prev + 1);
      }
      setGameCount(prev => prev + 1);
      onGameEnd(result === 'tie' ? null : result, difficulty);
    }
  }, [board, gameOver, isPlayerTurn, checkWinner, difficulty, onGameEnd]);

  // AI move effect
  useEffect(() => {
    if (!isPlayerTurn && !gameOver) {
      const timer = setTimeout(() => {
        const aiMove = getAIMove(board, difficulty);
        if (aiMove !== -1) {
          soundEffects.playTicTacToeMove();
          const newBoard = [...board];
          newBoard[aiMove] = 'O';
          setBoard(newBoard);
          
          const result = checkWinner(newBoard);
          if (result) {
            setWinner(result === 'tie' ? null : result);
            setGameOver(true);
            if (result === 'O') {
              soundEffects.playGameOver();
              setAiScore(prev => prev + 1);
            } else if (result === 'tie') {
              setTies(prev => prev + 1);
            }
            setGameCount(prev => prev + 1);
            onGameEnd(result === 'tie' ? null : result, difficulty);
          } else {
            setIsPlayerTurn(true);
          }
        }
      }, 500 + Math.random() * 1000); // Random delay for realism
      
      return () => clearTimeout(timer);
    }
  }, [isPlayerTurn, gameOver, board, difficulty, getAIMove, checkWinner, onGameEnd]);

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setGameOver(false);
    setWinner(null);
  };

  const resetStats = () => {
    setPlayerScore(0);
    setAiScore(0);
    setTies(0);
    setGameCount(0);
    resetGame();
  };

  const getDifficultyDescription = (diff: Difficulty): string => {
    switch (diff) {
      case 'easy': return 'AI makes random moves 70% of the time';
      case 'medium': return 'AI uses basic strategy but makes mistakes';
      case 'hard': return 'AI uses advanced strategy with occasional errors';
      case 'impossible': return 'Perfect AI - you can only tie at best!';
    }
  };

  const getWinRate = (): string => {
    if (gameCount === 0) return '0%';
    return `${Math.round((playerScore / gameCount) * 100)}%`;
  };

  return (
    <div style={{ padding: '16px' }}>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <label style={{ fontSize: '11px', marginRight: '8px' }}>Difficulty:</label>
          <select 
            value={difficulty} 
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            disabled={!gameOver && gameCount > 0}
            style={{ fontSize: '10px' }}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="impossible">Impossible</option>
          </select>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="win95-button" onClick={resetGame} style={{ fontSize: '10px', padding: '2px 8px' }}>
            New Game
          </button>
          <button className="win95-button" onClick={resetStats} style={{ fontSize: '10px', padding: '2px 8px' }}>
            Reset Stats
          </button>
        </div>
      </div>

      <div style={{ fontSize: '9px', color: '#666', marginBottom: '12px', fontStyle: 'italic' }}>
        {getDifficultyDescription(difficulty)}
      </div>

      <div style={{ display: 'flex', gap: '20px' }}>
        <div>
          <div 
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '2px',
              width: '150px',
              height: '150px',
              border: '2px inset #c0c0c0',
              padding: '4px',
              backgroundColor: '#c0c0c0'
            }}
          >
            {board.map((cell, index) => (
              <button
                key={index}
                className="win95-button"
                onClick={() => makeMove(index)}
                disabled={!!cell || gameOver || !isPlayerTurn}
                style={{
                  fontSize: '24px',
                  fontWeight: 'bold',
                  color: cell === 'X' ? '#0000ff' : '#ff0000',
                  cursor: (!cell && !gameOver && isPlayerTurn) ? 'pointer' : 'default'
                }}
              >
                {cell}
              </button>
            ))}
          </div>

          <div style={{ marginTop: '12px', textAlign: 'center' }}>
            {gameOver ? (
              <div>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: 'bold',
                  color: winner === 'X' ? '#008000' : winner === 'O' ? '#ff0000' : '#666'
                }}>
                  {winner === 'X' ? 'You Win!' : winner === 'O' ? 'AI Wins!' : 'Tie Game!'}
                </div>
                <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
                  Click "New Game" to play again
                </div>
              </div>
            ) : (
              <div>
                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>
                  {isPlayerTurn ? 'Your Turn (X)' : 'AI Thinking... (O)'}
                </div>
                {!isPlayerTurn && (
                  <div style={{ fontSize: '10px', color: '#666', marginTop: '4px' }}>
                    AI is calculating the best move...
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div style={{ minWidth: '120px' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '8px' }}>
            Statistics
          </div>
          
          <div style={{ fontSize: '10px', marginBottom: '4px' }}>
            <strong>Games Played:</strong> {gameCount}
          </div>
          <div style={{ fontSize: '10px', marginBottom: '4px' }}>
            <strong>Your Wins:</strong> {playerScore}
          </div>
          <div style={{ fontSize: '10px', marginBottom: '4px' }}>
            <strong>AI Wins:</strong> {aiScore}
          </div>
          <div style={{ fontSize: '10px', marginBottom: '4px' }}>
            <strong>Ties:</strong> {ties}
          </div>
          <div style={{ fontSize: '10px', marginBottom: '8px' }}>
            <strong>Win Rate:</strong> {getWinRate()}
          </div>

          <div style={{ 
            border: '1px inset #c0c0c0', 
            padding: '8px', 
            backgroundColor: '#f0f0f0',
            fontSize: '9px'
          }}>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>AI Strategy Tips:</div>
            <div style={{ marginBottom: '2px' }}>• Easy: Beatable with basic strategy</div>
            <div style={{ marginBottom: '2px' }}>• Medium: Requires good planning</div>
            <div style={{ marginBottom: '2px' }}>• Hard: Very challenging</div>
            <div>• Impossible: Unbeatable!</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicTacToeGame;