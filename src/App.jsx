import React, { useState, useEffect } from 'react';
import './App.css';

const BOARD_SIZE = 3;
const PLAYER_HUMAN = 'X';
const PLAYER_AI = 'O';
const EMPTY_CELL = '';

const initialBoard = Array.from(Array(BOARD_SIZE), () => new Array(BOARD_SIZE).fill(EMPTY_CELL));

const App = () => {
  const [board, setBoard] = useState(initialBoard);
  const [currentPlayer, setCurrentPlayer] = useState(PLAYER_HUMAN);
  const [winner, setWinner] = useState(null);

  const resetGame = () => {
    setBoard(Array.from(Array(BOARD_SIZE), () => new Array(BOARD_SIZE).fill(EMPTY_CELL)));
    setCurrentPlayer(PLAYER_HUMAN);
    setWinner(null);
  };

  const checkWinner = (board) => {
    for (let i = 0; i < BOARD_SIZE; i++) {
      if (board[i][0] !== EMPTY_CELL && board[i][0] === board[i][1] && board[i][1] === board[i][2]) {
        return board[i][0];
      }
    }

    for (let j = 0; j < BOARD_SIZE; j++) {
      if (board[0][j] !== EMPTY_CELL && board[0][j] === board[1][j] && board[1][j] === board[2][j]) {
        return board[0][j];
      }
    }

    if (board[0][0] !== EMPTY_CELL && board[0][0] === board[1][1] && board[1][1] === board[2][2]) {
      return board[0][0];
    }
    if (board[0][2] !== EMPTY_CELL && board[0][2] === board[1][1] && board[1][1] === board[2][0]) {
      return board[0][2];
    }

    if (board.flat().every(cell => cell !== EMPTY_CELL)) {
      return 'draw';
    }

    return null;
  };

  const handleHumanMove = (row, col) => {
    if (!board[row][col] && !winner) {
      let newBoard = [...board];
      newBoard[row][col] = PLAYER_HUMAN;
      setBoard(newBoard);

      const winner = checkWinner(newBoard);
      if (winner) {
        setWinner(winner);
      } else {
        setCurrentPlayer(PLAYER_AI);
      }
    }
  };

  const minimax = (newBoard, player) => {
    const availableSpots = newBoard.flatMap((row, rowIndex) =>
      row.map((cell, colIndex) => (cell === EMPTY_CELL ? { row: rowIndex, col: colIndex } : null))
    ).filter(Boolean);

    const winner = checkWinner(newBoard);
    if (winner === PLAYER_HUMAN) return { score: -10 };
    if (winner === PLAYER_AI) return { score: 10 };
    if (availableSpots.length === 0) return { score: 0 };

    const moves = [];
    for (let spot of availableSpots) {
      const move = {};
      move.row = spot.row;
      move.col = spot.col;
      newBoard[spot.row][spot.col] = player;

      if (player === PLAYER_AI) {
        const result = minimax(newBoard, PLAYER_HUMAN);
        move.score = result.score;
      } else {
        const result = minimax(newBoard, PLAYER_AI);
        move.score = result.score;
      }

      newBoard[spot.row][spot.col] = EMPTY_CELL;
      moves.push(move);
    }

    let bestMove;
    if (player === PLAYER_AI) {
      let bestScore = -Infinity;
      for (let move of moves) {
        if (move.score > bestScore) {
          bestScore = move.score;
          bestMove = move;
        }
      }
    } else {
      let bestScore = Infinity;
      for (let move of moves) {
        if (move.score < bestScore) {
          bestScore = move.score;
          bestMove = move;
        }
      }
    }

    return bestMove;
  };

  const aiMove = () => {
    if (currentPlayer === PLAYER_AI && !winner) {
      const bestMove = minimax(board, PLAYER_AI);
      let newBoard = [...board];
      newBoard[bestMove.row][bestMove.col] = PLAYER_AI;
      setBoard(newBoard);

      const winner = checkWinner(newBoard);
      if (winner) {
        setWinner(winner);
      } else {
        setCurrentPlayer(PLAYER_HUMAN);
      }
    }
  };

  useEffect(() => {
    if (currentPlayer === PLAYER_AI) {
      const timeout = setTimeout(() => {
        aiMove();
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [currentPlayer]);

  const renderCell = (row, col) => (
    <div
      className={`cell ${board[row][col] === PLAYER_HUMAN ? 'player-x' : board[row][col] === PLAYER_AI ? 'player-o' : ''}`}
      onClick={() => handleHumanMove(row, col)}
      key={`${row}-${col}`}
    >
      {board[row][col]}
    </div>
  );

  const renderBoard = () => (
    <div className="board">
      {board.map((row, rowIndex) =>
        row.map((cell, colIndex) => renderCell(rowIndex, colIndex))
      )}
    </div>
  );

  const renderStatus = () => {
    if (winner === 'draw') {
      return <div className="status">It's a draw!</div>;
    } else if (winner) {
      return <div className="status">{`${winner} wins!`}</div>;
    } else {
      return <div className="status">{`Current Player: ${currentPlayer}`}</div>;
    }
  };

  return (
    <div className="App">
      <h1 className="title">Tic Tac Toe</h1>
      <div className="game">
        {renderStatus()}
        {renderBoard()}
        <button className="reset-btn" onClick={resetGame}>Reset Game</button>
      </div>
    </div>
  );
};

export default App;
