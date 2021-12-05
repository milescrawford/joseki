
const PASS = 'pass';
const DELAY_MS = 250;

var josekis = [
    ['15,3', '16,5', '13,2', '17,3', '16,2', '16,8'],
    ['15,3', '16,5', '16,4', '15,5', '13,2', '15,9'],
    ['15,3', PASS, '16,5', '13,2', '15,1',],
];



var tree;
var board;
var game;
var sessionAttempts = 0;
var sessionSuccess = 0;
var currentEditJoseki;

////////// Edit ///////////

function initEdit() {

    // Main Editor
    var cont = document.getElementById("container");
    cont.removeChild(cont.childNodes[0]);
    var boardElement = document.createElement("div");
    boardElement.id = "board";
    cont.insertBefore(boardElement, cont.firstChild);

    board = new WGo.Board(document.getElementById("board"), {
        width: 600,
        section: {
            top: 0,
            right: 0,
            left: 8,
            bottom:8 
        }
    });
    board.addEventListener("click", handleEditAdd);
    game = new WGo.Game();
    currentEditJoseki = [];
    displayCurrentEdit();


    // Existing menu
    var existing = document.getElementById("existingList");
    existing.innerHTML = '';
    for (const joseki of josekis) {
        var boardElement = document.createElement("div");
        boardElement.className = "existing";
        existing.appendChild(boardElement);
        var existingBoard = new WGo.Board(boardElement, {
            width: 100,
            section: {
                top: 0,
                right: 0,
                left: 8,
                bottom:8 
            }
        });
        var color = WGo.B;
        for (const move of joseki) {
            let [x,y] = parseMove(move);
            existingBoard.addObject({ x: x, y: y, c: color});
            color = color == WGo.B ? WGo.W : WGo.B;
        }
    }
}

function handleEditAdd(x,y) {
    let color = game.turn;
    let result = game.play(x,y,color);
    if (Array.isArray(result)) {
        currentEditJoseki.push(x +","+y);
        displayCurrentEdit();

        board.addObject({ x: x, y: y, c: color});
        if (result.length) {
            for (const cap of result) {
                board.removeObjectsAt(cap.x, cap.y);
            }
        }
    }
}

function displayCurrentEdit(){
    var color = WGo.B;
    var log = document.getElementById('log');
    log.innerHTML = '';
    for( const move of currentEditJoseki){
        log.innerHTML += color == WGo.B ? "Black: " : "White: ";
        log.innerHTML += move;
        log.innerHTML += "<br>";
        color = color == WGo.B ? WGo.W : WGo.B;
    }
}

function editRemove() {
    currentEditJoseki.pop();
    game.popPosition();
    displayGame(game, board);
    displayCurrentEdit();
}

function handleMove(x, y) {
    let move = x+","+y;
    play(WGo.B,x,y);

    if (move in tree) {
        // Correct move
        tree = tree[move];
        respond();
    }else{
        fail(move); 
    }
}

function displayGame(){
    board.removeAllObjects();
    for ( var x = 0; x < game.size; x++) {
        for ( var y = 0; y < game.size; y++) {
            var obj = game.getStone(x,y);
            if (obj){
                board.addObject({x:x,y:y,c:obj});
            }
        }
    }
}

function editSave() {
    josekis.unshift(currentEditJoseki);
    initEdit();
}


////////// Play ///////////

function init() {
    displayRatio();
    reset();
}

function reset() {
    // Augment with rotated joseki
    var rotated = [];
    for (const joseki of josekis){
        var rot = [];
        for (const move of joseki){
            if (move == PASS) {
                rot.push(PASS);
            } else {
                let [x,y] = parseMove(move);
                let newy = (x - 18) * -1;
                let newx = 18 - ((0-y) * -1);
                let rotMove = newx +"," + newy;
                rot.push(rotMove);
            }
        }
        rotated.push(rot);
    }
    let expandedJosekis = josekis.concat(rotated);

    // Augment with white leads joseki
    var whiteBegins = [];
    for (const joseki of expandedJosekis){
        whiteBegins.push([PASS].concat(joseki));
    }
    expandedJosekis = expandedJosekis.concat(whiteBegins);


    // Build move tree
    tree = {};
    for (const joseki of expandedJosekis){
        var cur_tree = tree;
        for (const move of joseki) {
            if (! (move in cur_tree)) {
                cur_tree[move] = {};
            }
            cur_tree = cur_tree[move];
        }
    }

    // Setup frsh board
    var cont = document.getElementById("container");
    cont.removeChild(cont.childNodes[0]);
    var boardElement = document.createElement("div");
    boardElement.id = "board";
    cont.insertBefore(boardElement, cont.firstChild);

    board = new WGo.Board(document.getElementById("board"), {
        width: 600,
        section: {
            top: 0,
            right: 0,
            left: 8,
            bottom:8 
        }
    });
    game = new WGo.Game();


    // Update info/stats
    document.getElementById('log').innerHTML = '';
    document.getElementById('msg').innerHTML = '';

    board.addEventListener("click", handleMove);
}

function parseMove(move) {
    var coords = move.split(",");
    return [parseInt(coords[0]), parseInt(coords[1])];
}

function play(color, x, y) {
    let result = game.play(x,y,color);
    if (Array.isArray(result)) {
        board.addObject({ x: x, y: y, c: color});
        document.getElementById('log').innerHTML += color + ": " + x + ","+y+"<br>";;
        if (result.length) {
            for (const cap of result) {
                board.removeObjectsAt(cap.x, cap.y);
            }
        }
    } else {
        alert("Illegal move");
    }
}

function handleMove(x, y) {
    let move = x+","+y;
    play(WGo.B,x,y);

    if (move in tree) {
        // Correct move
        tree = tree[move];
        respond();
    }else{
        fail(move); 
    }
}

function pass() {
    if (PASS in tree) {
        tree = tree[PASS];
        respond();
    } else {
        fail(PASS);
    }
}

// Failed Joseki
function fail(move) {
    board.removeEventListener('click', handleMove);
    document.getElementById('msg').innerHTML = "FAIL";

    if(move != PASS){
        let [x,y] = parseMove(move);
        board.removeObjectsAt(x, y);
        board.addObject({ x: x, y: y, type: 'MA' });
    }
    for (const correct of Object.keys(tree)) {
        let [x,y] = parseMove(correct);
        board.addObject({x: x, y:y, type: 'CR'});
    }

    updateRatio(false);
}

function succeed() {
    document.getElementById('msg').innerHTML = "DONE!";
    board.removeEventListener('click', handleMove);
    updateRatio(true);
}

function updateRatio(successful) {
    sessionAttempts +=1;
    if(successful){
        sessionSuccess +=1;
    }
    displayRatio();
}

function displayRatio() {
    let ratio = sessionAttempts == 0 ? 0 : Math.round((sessionSuccess / sessionAttempts) * 100.0);
    document.getElementById('ratio').innerHTML = ratio;
    document.getElementById('tries').innerHTML = sessionAttempts;
}


// Make a reply if we can
async function respond() {
    await new Promise(r => setTimeout(r, DELAY_MS));
    const possibleMoves = Object.keys(tree);
    if(possibleMoves.length > 0) {
        const chosenMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
        tree = tree[chosenMove];

        if (chosenMove != PASS){
            let [x,y] = parseMove(chosenMove);
            play(WGo.W, x,y);
        }
    }

    // Joseki is done if nothing left
    if(Object.keys(tree).length == 0){
        succeed();
    }
}

