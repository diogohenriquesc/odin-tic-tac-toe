// The gameboard representes the state of the board
const gameboard = (() => {
	let _board = new Array(9);

	const getBoard = () => _board;

	const addMarker = (position, value) => (_board[position] = value);

	const resetBoard = () => {
		_board = new Array(9);
	};

	const hasEmptySlots = () => {
		return _board.includes(undefined);
	};
	return {
		getBoard,
		addMarker,
		resetBoard,
		hasEmptySlots,
	};
})();

// Player Factory
function createPlayer(name, marker) {
	let points = 0;

	return {
		name,
		marker,
		points,
		changeName: function (newName) {
			this.name = newName;
		},
		addPoint: function () {
			this.points += 1;
		},
		resetPoints: function () {
			this.points = 0;
		},
	};
}

/* The gameConstroler will be responsible for controlling the flow and state of the games's, as well as 
whether anybody has won the game */
const gameControler = (() => {
	const _players = [
		createPlayer('Player One', 'x'),
		createPlayer('Player Two', 'o'),
	];

	let _currentPlayer = _players[0];

	const getPlayers = () => _players;

	const getCurrentPlayer = () => _currentPlayer;

	const changePlayerName = (playerId, newName) => {
		_players[playerId].changeName(newName);
	};

	const getPlayerPoints = (playerId) => {
		return _players[playerId].points;
	};

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

	const _getPlayerPositions = (marker) => {
		const board = gameboard.getBoard();

		const playerIndexes =  board.reduce((indexes, position, index) => {
			if (position === marker) {
				indexes.push(index);
			}

			return indexes;
		}, []);

		return playerIndexes.join('');
	} 

	const _checkForWinner = () => {
		const currentPlayerPositions = _getPlayerPositions(_currentPlayer.marker);
		if (currentPlayerPositions.length < 3) return;

		for (let i = 0; i < _winningPositions.length; i++) {
			if (
				_checkPositions(currentPlayerPositions, _winningPositions[i][0]) &&
				_checkPositions(currentPlayerPositions, _winningPositions[i][1]) &&
				_checkPositions(currentPlayerPositions, _winningPositions[i][2])
			)
				return {
					message: true,
					position: _winningPositions[i],
				};
		}
	};

	const _checkPositions = (playerPositions, value) => {
		return playerPositions.includes(value) ? true : false;
	};

	const _checkForTie = () => {
		return !gameboard.hasEmptySlots();
	};

	const playRound = (position) => {
		if (!gameboard.getBoard()[position] && !_checkForWinner()) {
			gameboard.addMarker(position, _currentPlayer.marker);

			if (_checkForWinner()) {
				_players[_currentPlayer.marker === 'x' ? 0 : 1].addPoint();
				return 'winner';
			} else if (_checkForTie()) {
				return 'tie';
			} else {
				_switchTurns();
				return null;
			}
		}
	};

	const resetGame = () => {
		gameboard.resetBoard();
		_currentPlayer = _players[0];
	};

	return {
		getPlayers,
		getCurrentPlayer,
		playRound,
		resetGame,
		changePlayerName,
		getPlayerPoints,
	};
})();

// The display controler will interact with the DOM
const displayControler = (() => {
	const _header = document.querySelector('.header');
	const _boardCells = document.querySelectorAll('.gameboard__cell');
	const _nameInputs = document.querySelectorAll('.player__info-name');
	const _replayButton = document.querySelector('.btn-replay');
	const _messageDisplay = document.querySelector('.header__message p');
	const _scoreDisplays = document.querySelectorAll('.player__info-score');

	_boardCells.forEach((cell) =>
		cell.addEventListener('click', (e) => {
			_cellClick(e);
		})
	);

	_nameInputs.forEach((input) => {
		input.addEventListener('change', (e) => _inputChange(e));
	});

	_replayButton.addEventListener('click', () => _replayClick());

	const _cellClick = (e) => {
		const clickedCell = e.target.dataset.number;
		const gameStatus = gameControler.playRound(clickedCell);
		_updateBoard();
		_updateHeader();

		if (gameStatus === 'winner') {
			_displayMessage(`${gameControler.getCurrentPlayer().name} is the winner!`);
		} else if (gameStatus === 'tie') {
			_displayMessage(`It's a tie!`);
		}
	};

	const _inputChange = (e) => {
		const input = e.target;
		const playerId = Number(input.closest('.player__info').dataset.player);
		let newName = input.value;

		if (newName === '') {
			newName = playerId === 0 ? 'Player One' : 'Player Two';
			input.value = newName;
		}

		gameControler.changePlayerName(playerId, newName);
	}

	const _replayClick = () => {
		gameControler.resetGame();
		_updateBoard();
		_updateHeader();
		_displayMessage('');
	}

	const _displayMessage = (message) => {
		_messageDisplay.textContent = message;
	}

	const _renderBoard = () => {
		const board = gameboard.getBoard();

		for (let i = 0; i < board.length; i++) {
			if (board[i] === 'x' || board[i] === 'o') {
				_boardCells[i].textContent = board[i];
			}
		}
	};

	const _clearBoard = () => {
		_boardCells.forEach((cell) => {
			cell.textContent = '';
		});
	};

	const _updateBoard = () => {
		_clearBoard();
		_renderBoard();
	};

	const _updateHeader = () => {
		const currentPlayer = gameControler.getCurrentPlayer();

		_header.setAttribute('data-selected', currentPlayer.marker === 'x' ? 0 : 1);
		_scoreDisplays.forEach((display, index) =>
				(display.textContent = gameControler.getPlayerPoints(index))
		);
	};
})();
