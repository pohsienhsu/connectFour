/** Connect Four
 *
 * Player 1 and 2 alternate turns. On each turn, a piece is dropped down a
 * column until a player gets four-in-a-row (horiz, vert, or diag) or until
 * board fills (tie)
 */

const WIDTH = 7;
const HEIGHT = 6;

let currPlayer = 1; // active player: 1 or 2
let board = []; // array of rows, each row is array of cells  (board[y][x])

/** Creating random Colors */
const randomColors = () => {
  const r = Math.floor(Math.random() * 256);
  const g = Math.floor(Math.random() * 256);
  const b = Math.floor(Math.random() * 256);
  return `rgb(${r}, ${g}, ${b})`;
}

/** Adding event listener to every column's header so it changes color when the mouse is over */
const selectedColEffect = (target, event) => {
  if (event === "mouseover") {
    target.addEventListener(event, (e) => {
      e.target.style.color = (currPlayer === 1 ? "red" : "blue");
      const colNum = e.target.getAttribute('id');
      for (let i = 0; i < HEIGHT; i++) {
        const colCell = document.getElementById(`${i}-${colNum}`);
        colCell.style.border = (currPlayer === 1 ? "solid 1px red" : "solid 1px blue");
      }
    });    
  } else {
    target.addEventListener("mouseout", (e) => {
      e.target.style.color = "rgb(60, 59, 61)";
      const colNum = e.target.getAttribute('id');
      for (let i = 0; i < HEIGHT; i++) {
        const colCell = document.getElementById(`${i}-${colNum}`);
        colCell.style.border = "solid 1px #666";
      }
    });
  }
}



/** Changing the header's color */
const changeColor = setInterval(() => {
    const letters = document.querySelectorAll("h1 span");
    for (let letter of letters) {
        letter.style.color = randomColors();
    }
    const icon = document.querySelector('i');
    icon.style.color = randomColors();
}, 2000);

/** makeBoard: create in-JS board structure:
 *    board = array of rows, each row is array of cells  (board[y][x])
 */

const makeBoard = () => {
  // TODO: set "board" to empty HEIGHT x WIDTH matrix array
  for (let i = 0; i < HEIGHT; i++) {
      board.push([]);
      for (let j = 0; j < WIDTH; j++) {
        board[i].push(null);
      }
  }
}

/** makeHtmlBoard: make HTML table and row of column tops. */

const makeHtmlBoard = () => {

  /** Creating the top tr to act as button to select which column to drop the piece*/
  const top = document.createElement("tr");
  top.setAttribute("id", "column-top");

  for (let x = 0; x < WIDTH; x++) {
    const arrowDown = document.createElement("i");
    arrowDown.className = "fas fa-angle-double-down";
    arrowDown.addEventListener("click", handleClick);
    const headCell = document.createElement("td");
    arrowDown.setAttribute("id", x);
    selectedColEffect(arrowDown, "mouseover");
    selectedColEffect(arrowDown, "mouseout");
    headCell.append(arrowDown);
    top.append(headCell);
  }
  const htmlBoard = document.querySelector('#board');
  htmlBoard.append(top);

  /** Creating cell as td in tr within the HEIGHT and WIDTH, and giving each cell an id according to its position of x and y */  
  for (let y = 0; y < HEIGHT; y++) {
    const row = document.createElement("tr");
    for (let x = 0; x < WIDTH; x++) {
      const cell = document.createElement("td");
      cell.setAttribute("id", `${y}-${x}`);
      row.append(cell);
    }
    htmlBoard.append(row);
  }
}


/** findSpotForCol: given column x, return top empty y (null if filled) */

const findSpotForCol = (x) => {
  // TODO: write the real version of this, rather than always returning 0
  const emptyCells = board.filter((row) => {
    return row[x] === null;
  })
  return emptyCells.length === 0 ? null : emptyCells.length - 1;
}

/** placeInTable: update DOM to place piece into HTML table of board */

function placeInTable(y, x) {
  // TODO: make a div and insert into correct table cell
  const piece = document.createElement("div");
  piece.classList.add('piece');
  piece.classList.add(currPlayer === 1 ? 'p1' : 'p2');
  const cell = document.getElementById(`${y}-${x}`);
  cell.append(piece);

}

/** endGame: announce game end */

function endGame(msg) {
  // TODO: pop up alert message
  const playerIndicate = document.querySelector("#player");
  playerIndicate.style.color = "";
  playerIndicate.style.fontSize = "3rem";
  playerIndicate.textContent = msg;
  const arrows = document.querySelectorAll("#column-top td i");
  for (let arrow of arrows) {
    arrow.style.display = "none";
  };
  if (msg === "TIE!") {
    playerIndicate.style.textShadow = "3px 3px 0 purple";
  };
  const restart = document.querySelector('#restart i');
  restart.style.display = "block";
  restart.addEventListener("click", function(e) {
    const theBoard = document.querySelector('#board');
    theBoard.innerHTML = "";
    board = [];
    makeBoard();
    makeHtmlBoard();
    restart.style.display = "none";
    currPlayer = 1;
    playerIndicate.textContent = "PLAYER 1";
    playerIndicate.style.fontSize = "2rem";
    playerIndicate.style.textShadow = "3px 3px 0 red";
  })
}

/** handleClick: handle click of column top to play piece */

function handleClick(evt) {
  // get x from ID of clicked cell
  const x = +evt.target.id;

  // get next spot in column (if none, ignore click)
  const y = findSpotForCol(x);
  if (y === null) {
    return;
  }

  // place piece in board and add to HTML table
  // TODO: add line to update in-memory board
  placeInTable(y, x);
  board[y][x] = currPlayer;

  // check for win
  if (checkForWin()) {
    return endGame(`Player ${currPlayer} won!`);
  }

  // check for tie
  // TODO: check if all cells in board are filled; if so call, call endGame
  const isFilled = board.every(val => val.every(value => value !== null));
  if (isFilled) {
    return endGame("TIE!");
  }

  // switch players
  // TODO: switch currPlayer 1 <-> 2
  currPlayer = (currPlayer === 1 ? 2 : 1);
  const playerIndicate = document.querySelector('#player');
  playerIndicate.textContent = `PLAYER ${currPlayer}`;
  playerIndicate.style.textShadow = "3px 3px 0px " + (currPlayer === 1 ? "red" : "blue");
}

/** checkForWin: check board cell-by-cell for "does a win start here?" */

function checkForWin() {
  function _win(cells) {
    // Check four cells to see if they're all color of current player
    //  - cells: list of four (y, x) cells
    //  - returns true if all are legal coordinates & all match currPlayer

    return cells.every(
      ([y, x]) =>
        y >= 0 &&
        y < HEIGHT &&
        x >= 0 &&
        x < WIDTH &&
        board[y][x] === currPlayer
    );
  }

  // TODO: read and understand this code. Add comments to help you.
  
  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const horiz = [[y, x], [y, x + 1], [y, x + 2], [y, x + 3]];
      const vert = [[y, x], [y + 1, x], [y + 2, x], [y + 3, x]];
      const diagDR = [[y, x], [y + 1, x + 1], [y + 2, x + 2], [y + 3, x + 3]];
      const diagDL = [[y, x], [y + 1, x - 1], [y + 2, x - 2], [y + 3, x - 3]];

      if (_win(horiz) || _win(vert) || _win(diagDR) || _win(diagDL)) {
        return true;
      }
    }
  }
}


makeBoard();
makeHtmlBoard();


