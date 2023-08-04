// The gameboard representes the state of the board
const gameboard = (() => {
	let _board = new Array(9);

	const getBoard = () => _board;

	const addMarker = (position, value) => (_board[position] = value);

	const getIndexes = (marker) => {
		return _board
			.reduce((indexes, currentElement, currentIndex) => {
				if (currentElement === marker) {
					indexes.push(currentIndex);
				}
				return indexes;
			}, [])
			.join('');
	};

	return {
		getBoard,
		addMarker,
		getIndexes,
	};
})();

// Player Factory
const createPlayer = (name, marker, markerIcon) => {
	return {
		name,
		marker,
		markerIcon,
	};
};

/* The gameConstroler will be responsible for controlling the flow and state of the games's turn, as well as 
whether anybody has won the game */
const gameControler = (() => {
	const _players = [
		createPlayer('Player One', 'x', '<i class="fa-solid fa-x"></i>'),
		createPlayer('Player Two', 'o', '<i class="fa-regular fa-circle"></i>'),
	];

	let _currentPlayer = _players[0];

	const getCurrentPlayer = () => _currentPlayer;

	const getPlayers = () => _players;

	const _switchTurns = () => {
		_currentPlayer = _currentPlayer === _players[0] ? _players[1] : _players[0];
	};

	const _winningPositions = [
		'012',
		'345',
		'678',
		'036',
		'147',
		'258',
		'048',
		'246',
	];


	const _checkForWinner = () => {
		const currentPlayerMoves = gameboard.getIndexes(_currentPlayer.marker);
		if (currentPlayerMoves.length < 3) return;

		for (let i = 0; i < _winningPositions.length; i++) { 
      if (
				checkString(currentPlayerMoves, _winningPositions[i][0]) &&
				checkString(currentPlayerMoves, _winningPositions[i][1]) &&
				checkString(currentPlayerMoves, _winningPositions[i][2])
			)
				return true;
		}
	};

	const checkString = (string, value) => {
		return string.includes(value) ? true : false;
  } 

	const playRound = (position) => {
		if (!gameboard.getBoard()[position]) {
			gameboard.addMarker(position, _currentPlayer.marker);

			if (_checkForWinner()) {
        document.querySelector('.message p').textContent = `${_currentPlayer.name} is the winner!`;
			} else {
        _switchTurns();
      }
		}
	};

	return {
		getPlayers,
		getCurrentPlayer,
		playRound,
	};
})();

// The display controler will interact with the DOM
const displayControler = (() => {
	const board = gameboard.getBoard();
	const boardCells = document.querySelectorAll('.gameboard__cell');

	boardCells.forEach((cell) =>
		cell.addEventListener('click', (e) => {
			cellClick(e);
		})
	);

	const renderBoard = () => {
		for (let i = 0; i < board.length; i++) {
			if (board[i] === 'x' || board[i] === 'o') {
				boardCells[i].innerHTML = gameControler
					.getPlayers()
					.find((elm) => elm.marker === board[i]).markerIcon;
			}
		}
	};

	const clearBoard = () => {
		boardCells.forEach((cell) => {
			cell.innerHTML = '';
		});
	};

	const updateBoard = () => {
		clearBoard();
		renderBoard();
	};

	const cellClick = (e) => {
		const clickedCell = e.target.dataset.number;
		gameControler.playRound(clickedCell);
		updateBoard();
	};
})();
