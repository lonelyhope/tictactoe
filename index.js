// import React from 'react';
// import ReactDOM from 'react-dom';
// import './index.css';

class Square extends React.Component {
  render() {
    return (
      <button
        className="square"
        onClick={() => {this.props.onClick()} }>
        {this.props.value}
      </button>
    );
  }
}

class Board extends React.Component {
  renderSquare(i) {    
    return (
      <Square
        key={i}
        value={this.props.squares[i]}
        // 传了一个函数给子组件
        onClick={() => {this.props.onClick(i)}}/>
    );
  }

  render() {
    let row = this.props.row, col = this.props.col;
    return (
      <div>
        {
          new Array(row).fill(0).map((rn, x) => {
            // 渲染棋盘的行
            return (
              <div className="board-row" key={x}>
                {
                  new Array(col).fill(0).map((cn, y) => 
                    // 棋盘的列
                    this.renderSquare(x * col + y)
                  )
                }
              </div>
            );
          })
        }
      </div>
    );
  }
}
  
class Game extends React.Component {
  constructor() {
    super();
    let row = 9, col = 9;
    this.state = {
      xIsNext: true,
      stepNumber: 0,
      row: row,
      col: col,
      hasWinner: false,
      winner: null,
      history: [{
        squares: Array(row * col).fill(null),
      }],
      endStep: null,
    }
  }

  handleClick(i) {
    let hasWinner = this.state.hasWinner;
    let history = this.state.history;
    // 当前落子的行号和列号
    const row = Math.floor(i / this.state.col);
    const col = i % this.state.col;

    const step = this.state.stepNumber;
    const current = history[step].squares;
    const squares = current.slice();
    if (squares[i] || step == this.state.endStep) {
      return;
    }
    squares[i] = this.state.xIsNext ? 'X' : 'O';
    let winner = calculateWinner(squares, this.state.row, this.state.col, row, col, squares[i]);
    let endStep = null;
    if (winner) {
      endStep = step + 1;
      history = history.slice(0, step + 1);
    }
    if (step >= history.length - 1) {
      history = history.concat([{
        squares: squares
      }])
    } else {
      history[step + 1] = {
        squares: squares
      }
    }
    // 当 state 发生变化时发生重新渲染
    this.setState({
      history: history,
      xIsNext: !this.state.xIsNext,
      stepNumber: step + 1,
      hasWinner: !!(winner),
      winner: winner,
      endStep: endStep,
    });
    // 这样是不会重新渲染的
    // this.state.squares[i] = i;
  }

  jumpTo(step) {
    this.setState({
      stepNumber: step,
      xIsNext: (step % 2) ? false : true,
      hasWinner: step == this.state.endStep,
    });
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.stepNumber];
    const winner = this.state.hasWinner && this.state.winner;

    const moves = history.map((step, move) => {
      const desc = move ?
        'Move #' + move :
        'Game start';
        return (
          <li key={move}>
            <a href="#href" onClick={() => this.jumpTo(move)}>{desc}</a>
          </li>
        );
    })
    
    let status;
    if (winner) {
      status = 'Winner: ' + winner;
    } else {
      status = 'Next player: ' + (this.state.xIsNext ? 'X' : 'O');
    }

    return (
      <div className="game">
        <div className="game-board">
          <Board squares={current.squares}
            onClick={ (i) => {this.handleClick(i)} }
            row={this.state.row}
            col={this.state.col} />
        </div>
        <div className="game-info">
          <div>{status}</div>
          <ol>{moves}</ol>
        </div>
      </div>
    );
  }
}

// ========================================

ReactDOM.render(<Game />, document.getElementById("root"));

function calculateWinner(squares, square_row, square_col ,row, col, turn) {
  if (!squares) return null;
  let winSize = 3;
  let detect_start_row = 0, detect_end_row = 0, detect_start_col = 0, detect_end_col = 0;
  if (row != undefined && col != undefined) {
    detect_start_row = row - winSize + 1;
    detect_start_row = detect_start_row >= 0 ? detect_start_row : 0;
    detect_end_row = row + winSize - 1;
    detect_end_row = detect_end_row < square_row ? detect_end_row : square_row;

    detect_start_col = col - winSize + 1;
    detect_start_col = detect_start_col >= 0 ? detect_start_col : 0;
    detect_end_col = col + winSize - 1;
    detect_end_col = detect_end_col < square_col ? detect_end_col : square_col;
  }

  let N = 1;
  let i = row, j = col;
  for (j = detect_start_col + 1; j <= detect_end_col; j++) {
    if (squares[i * square_col + j - 1] && squares[i * square_col + j] != squares[i * square_col + j - 1]) N = 1;
    if (squares[i * square_col + j - 1] && squares[i * square_col + j] == squares[i * square_col + j - 1]) N++;
    if (N == winSize) return turn;
  }
  
  j = col;
  N = 1;
  for (i = detect_start_row + 1; i <= detect_end_row; i++) {
    if (squares[(i - 1) * square_col + j] && squares[i * square_col + j] != squares[(i - 1) * square_col + j])
      N = 1;
    if (squares[(i - 1) * square_col + j] && squares[i * square_col + j] == squares[(i - 1) * square_col + j])
      N++;
    if (N == winSize) return turn;
  }

  N = 1;
  i = row + winSize - 1;
  j = col - winSize + 1;
  for (; i >= detect_start_row && j <= detect_end_col; i--, j++) {
    if (squares[(i + 1) * square_col + (j - 1)] && squares[i * square_col + j] != squares[(i + 1) * square_col + (j - 1)])
      N = 1;
    if (squares[(i + 1) * square_col + (j - 1)] && squares[i * square_col + j] == squares[(i + 1) * square_col + (j - 1)])
      N++;
    if (N == winSize) return turn;
  }

  N = 1;
  i = row - winSize + 1;
  j = col - winSize + 1;
  for (; i >= detect_start_row && j <= detect_end_col; i++, j++) {
    if (squares[(i - 1) * square_col + (j - 1)] && squares[i * square_col + j] != squares[(i - 1) * square_col + (j - 1)])
      N = 1;
    if (squares[(i - 1) * square_col + (j - 1)] && squares[i * square_col + j] == squares[(i - 1) * square_col + (j - 1)])
      N++;
    if (N == winSize) return turn;
  }

  return null;
}
