/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	const View = __webpack_require__(1);
	const Game = __webpack_require__(2);

	$( () => {
	  const game = new Game();
	  const view = new View(game,$(".ttt"));
	});


/***/ },
/* 1 */
/***/ function(module, exports) {

	function View (game, $el) {
	  this.game = game;
	  this.$el = $el;
	  this.setupBoard();
	  this.bindEvents();
	}

	View.prototype.bindEvents = function () {
	  $("li").on("click", (event) => {
	    let list = event.currentTarget;
	    if (list.textContent.length !== 1) {
	      list.textContent = this.game.currentPlayer;
	      this.makeMove($(list));
	    } else {
	      alert("Invalid move!");
	    }
	  });
	};

	View.prototype.makeMove = function ($square) {
	  this.game.playMove($square.data("pos"));
	  $square.css("background-color", "white");
	  $square.off("mouseleave");
	  $square.off("mouseenter");
	  if (this.game.isOver()){
	    let winner = this.game.winner;
	    if (winner === null){
	      alert("draw game");
	    } else {
	    alert("the winner is " + this.game.winner());
	    }
	  }
	};

	View.prototype.setupBoard = function () {
	  const $ul = $("<ul></ul>");
	  $ul.addClass("grid");
	  for (var i = 0; i < 9; i++) {
	    let $li = $("<li></li>");
	    let x = Math.floor(i/3);
	    let y = i % 3;
	    $li.data("pos", [x, y]);
	    $li.addClass("tile" + i);
	    $li.css({"background-color": "gray",
	    "width": "100px",
	    "height": "100px",
	    "float": "left"
	    });

	    $li.on("mouseenter", (event) => {
	      const list = event.currentTarget;
	      list.style.backgroundColor = "yellow";
	    });
	    $li.on("mouseleave", (event) => {
	      const list = event.currentTarget;
	      list.style.backgroundColor = "gray";
	    });

	    $ul.append($li);
	  }

	  //css
	  $ul.css({"float": "left",
	  "width": "300px",
	  "height": "300px",
	  "list-style": "none"
	  });
	  this.$el.append($ul);
	};

	module.exports = View;


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	const Board = __webpack_require__(3);
	const MoveError = __webpack_require__(4);

	class Game {
	  constructor() {
	    this.board = new Board();
	    this.currentPlayer = Board.marks[0];
	  }

	  isOver() {
	    return this.board.isOver();
	  }

	  playMove(pos) {
	    this.board.placeMark(pos, this.currentPlayer);
	    this.swapTurn();
	  }

	  promptMove(reader, callback) {
	    const game = this;

	    this.board.print();
	    console.log(`Current Turn: ${this.currentPlayer}`)

	    reader.question('Enter rowIdx: ', rowIdxStr => {
	      const rowIdx = parseInt(rowIdxStr);
	      reader.question('Enter colIdx: ', colIdxStr => {
	        const colIdx = parseInt(colIdxStr);
	        callback([rowIdx, colIdx]);
	      });
	    });
	  }

	  run(reader, gameCompletionCallback) {
	    this.promptMove(reader, move => {
	      try {
	        this.playMove(move);
	      } catch (e) {
	        if (e instanceof MoveError) {
	          console.log(e.msg);
	        } else {
	          throw e;
	        }
	      }

	      if (this.isOver()) {
	        this.board.print();
	        if (this.winner()) {
	          console.log(`${this.winner()} has won!`);
	        } else {
	          console.log('NO ONE WINS!');
	        }
	        gameCompletionCallback();
	      } else {
	        // continue loop
	        this.run(reader, gameCompletionCallback);
	      }
	    });
	  }

	  swapTurn() {
	    if (this.currentPlayer === Board.marks[0]) {
	      this.currentPlayer = Board.marks[1];
	    } else {
	      this.currentPlayer = Board.marks[0];
	    }
	  }

	  winner() {
	    return this.board.winner();
	  }
	}

	module.exports = Game;


/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	const MoveError = __webpack_require__(4);

	class Board {
	  constructor() {
	    this.grid = Board.makeGrid();
	  }

	  isEmptyPos(pos) {
	    if (!Board.isValidPos(pos)) {
	      throw new MoveError('Is not valid position!');
	    }

	    return (this.grid[pos[0]][pos[1]] === null);
	  }

	  isOver() {
	    if (this.winner() != null) {
	      return true;
	    }

	    for (let rowIdx = 0; rowIdx < 3; rowIdx++) {
	      for (let colIdx = 0; colIdx < 3; colIdx++) {
	        if (this.isEmptyPos([rowIdx, colIdx])) {
	          return false;
	        }
	      }
	    }

	    return true;
	  }

	  placeMark(pos, mark) {
	    if (!this.isEmptyPos(pos)) {
	      throw new MoveError('Is not an empty position!');
	    }

	    this.grid[pos[0]][pos[1]] = mark;
	  }

	  print() {
	    const strs = [];
	    for (let rowIdx = 0; rowIdx < 3; rowIdx++) {
	      const marks = [];
	      for (let colIdx = 0; colIdx < 3; colIdx++) {
	        marks.push(
	          this.grid[rowIdx][colIdx] ? this.grid[rowIdx][colIdx] : " "
	        );
	      }
	      strs.push(`${marks.join('|')}\n`);
	    }

	    console.log(strs.join('-----\n'));
	  }

	  winner() {
	    const posSeqs = [
	      // horizontals
	      [[0, 0], [0, 1], [0, 2]],
	      [[1, 0], [1, 1], [1, 2]],
	      [[2, 0], [2, 1], [2, 2]],
	      // verticals
	      [[0, 0], [1, 0], [2, 0]],
	      [[0, 1], [1, 1], [2, 1]],
	      [[0, 2], [1, 2], [2, 2]],
	      // diagonals
	      [[0, 0], [1, 1], [2, 2]],
	      [[2, 0], [1, 1], [0, 2]]
	    ];

	    for (let i = 0; i < posSeqs.length; i++) {
	      const winner = this.winnerHelper(posSeqs[i]);
	      if (winner != null) {
	        return winner;
	      }
	    }

	    return null;
	  }

	  winnerHelper(posSeq) {
	    for (let markIdx = 0; markIdx < Board.marks.length; markIdx++) {
	      const targetMark = Board.marks[markIdx];
	      let winner = true;
	      for (let posIdx = 0; posIdx < 3; posIdx++) {
	        const pos = posSeq[posIdx];
	        const mark = this.grid[pos[0]][pos[1]];

	        if (mark != targetMark) {
	          winner = false;
	        }
	      }

	      if (winner) {
	        return targetMark;
	      }
	    }

	    return null;
	  }

	  static isValidPos(pos) {
	    return (0 <= pos[0]) &&
	    (pos[0] < 3) &&
	    (0 <= pos[1]) &&
	    (pos[1] < 3);
	  }

	  static makeGrid() {
	    const grid = [];

	    for (let i = 0; i < 3; i++) {
	      grid.push([]);
	      for (let j = 0; j < 3; j++) {
	        grid[i].push(null);
	      }
	    }

	    return grid;
	  }
	}

	Board.marks = ['x', 'o'];

	module.exports = Board;


/***/ },
/* 4 */
/***/ function(module, exports) {

	
	const MoveError = function (msg) { this.msg = msg; };

	// MoveError really should be a child class of the built in Error object provided
	// by Javascript, but since we haven't covered inheritance yet, we'll just
	// let it be a vanilla Object for now!

	module.exports = MoveError;


/***/ }
/******/ ]);