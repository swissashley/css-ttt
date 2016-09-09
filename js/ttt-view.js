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
