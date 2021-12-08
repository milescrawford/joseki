
const PASS = 'pass';
const DELAY_MS = 250;
const BOARD_BACK = "#f5ea92";
const STORAGE_KEY = 'josekis';
const BOARD_SIZE = 600;
const SMALL_SIZE = 100;
const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"];

{
    let josekis = [];
    if (window.localStorage.getItem(STORAGE_KEY)){
        josekis = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
    } else {
        josekis = [
            { 'id': 1,
                'moves': ['15,3', '16,5', '13,2', '17,3', '16,2', '16,8'],
                'comment': 'Approach 4-4, settle peacefully',
            },
            { 'id': 3,
                'moves': ['15,3', '16,5', '16,4', '15,5', '13,2', '15,9'],
                'comment': 'Kick',
            },
        ];
    }

    let tree;
    let board;
    let game;
    let sessionAttempts = 0;
    let sessionSuccess = 0;
    let currentEditJoseki;


    ////////// Common ///////////

    function parseMove(move) {
        let coords = move.split(",");
        return [parseInt(coords[0]), parseInt(coords[1])];
    }

    function serMove(x,y) {
        return x + "," + y;
    }

    function xyToGrid(x,y) {
        return [LETTERS[x], 19 - y];
    }

    function newBoard(element, width=BOARD_SIZE, grid=true) {

        let adjust = grid ? 0.5 : 0;

        let b = new WGo.Board(element, {
            width: width,
            background: BOARD_BACK,
            font: 'Arial',
            section: {
                top:   8 - adjust,
                right: 8 - adjust,
                left:  0 - adjust,
                bottom:0 - adjust, 
            }
        });

        if(grid){
            b.addCustomObject( { grid: { draw: function(args, board) {
                var ch, t, xright, xleft, ytop, ybottom;

                this.fillStyle = "rgba(0,0,0,0.7)";
                this.textBaseline="middle";
                this.textAlign="center";
                this.font = (board.stoneRadius* 0.8)+"px "+(board.font || "");

                xleft = board.getX(0 - adjust);
                xright = board.getX(board.size - adjust);
                ytop = board.getY(0 - adjust);
                ybottom = board.getY(board.size - adjust);

                for(var i = 0; i < board.size; i++) {
                    ch = i+"A".charCodeAt(0);
                    if(ch >= "I".charCodeAt(0)) ch++;

                    t = board.getY(i);
                    this.fillText(board.size-i, xright, t);
                    this.fillText(board.size-i, xleft, t);

                    t = board.getX(i);
                    this.fillText(String.fromCharCode(ch), t, ytop);
                    this.fillText(String.fromCharCode(ch), t, ybottom);
                }

                this.fillStyle = "black";
            }}});
        }

        return b;
    }

    ////////// Edit ///////////

    function initEdit(id) {

        // Main Editor
        let cont = document.getElementById("container");
        cont.removeChild(cont.childNodes[0]);
        let boardElement = document.createElement("div");
        boardElement.id = "board";
        cont.insertBefore(boardElement, cont.firstChild);

        board = newBoard(document.getElementById('board'));
        board.addEventListener("click", handleEditAdd);
        game = new WGo.Game();
        currentEditJoseki = newJoseki();
        document.getElementById('comment').value = '';
        redraw();


        // Existing menu
        let existing = document.getElementById("existingList");
        existing.innerHTML = '';
        for (const joseki of josekis) {
            let josekiCont = document.createElement("div");
            if (joseki.id == id) {
                josekiCont.className = "josekiMenu selected";
            } else {
                josekiCont.className = "josekiMenu";
                josekiCont.addEventListener('click', function() { initEdit(joseki.id);});
            }
            let boardElement = document.createElement("div");
            josekiCont.appendChild(boardElement);
            josekiCont.appendChild(document.createTextNode(joseki.comment));
            existing.appendChild(josekiCont);
            let existingBoard = newBoard(boardElement, SMALL_SIZE, false);
            let color = WGo.B;
            for (const move of joseki.moves) {
                let [x,y] = parseMove(move);
                existingBoard.addObject({ x: x, y: y, c: color});
                color = color == WGo.B ? WGo.W : WGo.B;
            }
        }

        if(id) {
            currentEditJoseki = josekis.find(function(a){ return a.id == id});
            let moves = currentEditJoseki.moves;
            currentEditJoseki.moves = [];
            for (const move of moves){
                if(move == PASS){
                    editPass();
                } else {
                    let [x,y] = parseMove(move);
                    handleEditAdd(x,y);
                }
            }
            document.getElementById('comment').value = currentEditJoseki.comment;
            redraw();
        }

    }

    function handleEditAdd(x,y) {
        let color = game.turn;
        let result = game.play(x,y,color);
        if (Array.isArray(result)) {
            currentEditJoseki.moves.push(serMove(x,y));
            board.addObject({ x: x, y: y, c: color});
            if (result.length) {
                for (const cap of result) {
                    board.removeObjectsAt(cap.x, cap.y);
                }
            }
        }
        redraw();
    }

    function editRemove() {
        if(currentEditJoseki.moves.length > 0) {
            let removed = currentEditJoseki.moves.pop();
            if(removed != PASS) {
                game.popPosition();
            }
            redraw();
        }
    }

    function redraw(){

        // Board
        board.removeAllObjects();
        for ( let x = 0; x < game.size; x++) {
            for ( let y = 0; y < game.size; y++) {
                let obj = game.getStone(x,y);
                if (obj){
                    board.addObject({x:x,y:y,c:obj});
                }
            }
        }

        // Log
        let color = WGo.B;
        let log = document.getElementById('log');
        log.innerHTML = '';
        for( const move of currentEditJoseki.moves){
            log.innerHTML += color == WGo.B ? "Black: " : "White: ";
            log.innerHTML += move == PASS ? 'Pass' : serMove(...xyToGrid(...parseMove(move)));
            log.innerHTML += "<br>";
            color = color == WGo.B ? WGo.W : WGo.B;
        }
    }



    function editSave() {
        currentEditJoseki.comment = document.getElementById('comment').value || "#" + currentEditJoseki.id;
        if(josekis.find(function(a){ return a.id == currentEditJoseki.id})) {
            let index = josekis.findIndex(function(a){ return a.id == currentEditJoseki.id});
            josekis[index] = currentEditJoseki;
        } else {
            josekis.unshift(currentEditJoseki);
        }

        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(josekis));

        initEdit();
    }

    function editPass() {
        if(
           currentEditJoseki.moves.length >0 &&
           currentEditJoseki.moves[currentEditJoseki.moves.length -1] != PASS
        ){
            currentEditJoseki.moves.push(PASS);
            game.turn = game.turn == WGo.B ? WGo.W : WGo.B;
        }
        redraw();
    }

    function newJoseki() {
        let maxId;
        if(josekis.length){
            maxId = Math.max(...josekis.map(function(a) {return a.id}));
        }else{
            maxId = 0;
        }
        return {'id': maxId +1, 'comment':'', 'moves': []};
    }

    function deleteJoseki() {
        if (josekis.length > 1) {
            if (confirm("Are you sure you want to delete this joseki?")) {
                let index = josekis.findIndex(function(a){ return a.id == currentEditJoseki.id});
                if (index > -1) {
                    josekis.splice(index, 1);
                }
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify(josekis));
                initEdit();
            }
        }else {
            alert("Can't remove last joseki");
        }
    }


    ////////// Play ///////////

    function init() {
        displayRatio();
        reset();
    }

    function reset() {

        // extract moves
        let original = josekis.map(function(a) {return a.moves;});

        // Augment with rotated joseki
        let rotated = [];
        for (const joseki of original){
            let rot = [];
            for (const move of joseki){
                if (move == PASS) {
                    rot.push(PASS);
                } else {
                    let [x,y] = parseMove(move);
                    let newy = (x - 18) * -1;
                    let newx = 18 - ((0-y) * -1);
                    let rotMove = serMove(newx, newy);
                    rot.push(rotMove);
                }
            }
            rotated.push(rot);
        }

        // Augment with white leads joseki
        let whiteBegins = [];
        for (const joseki of original.concat(rotated)){
            whiteBegins.push([PASS].concat(joseki));
        }

        // Build move tree
        tree = {};
        for (const joseki of original.concat(rotated, whiteBegins)){
            let cur_tree = tree;
            for (const move of joseki) {
                if (! (move in cur_tree)) {
                    cur_tree[move] = {};
                }
                cur_tree = cur_tree[move];
            }
        }

        // Setup frsh board
        let cont = document.getElementById("container");
        cont.removeChild(cont.childNodes[0]);
        let boardElement = document.createElement("div");
        boardElement.id = "board";
        cont.insertBefore(boardElement, cont.firstChild);

        board = newBoard(document.getElementById('board'));
        game = new WGo.Game();


        // Update info/stats
        document.getElementById('msg').innerHTML = '';
        board.addEventListener("click", handleMove);
        document.getElementById('pass').addEventListener('click', pass);

        // Half the time, white starts
        if (Math.floor(Math.random() * 2)){
            pass();
        }
    }


    function play(color, x, y) {
        let result = game.play(x,y,color);
        if (Array.isArray(result)) {
            board.addObject({ x: x, y: y, c: color});
            if (result.length) {
                for (const cap of result) {
                    board.removeObjectsAt(cap.x, cap.y);
                }
            }
            return true;
        } else {
            return false;
        }
    }

    function handleMove(x, y) {
        document.getElementById('msg').innerHTML = '';
        let move = serMove(x,y);

        if (play(WGo.B,x,y)) {

            if (move in tree) {
                // Correct move
                tree = tree[move];
                respond();
            }else{
                fail(move); 
            }
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
        shutdown();
        document.getElementById('msg').innerHTML = "FAIL!";

        if(move != PASS){
            let [x,y] = parseMove(move);
            board.removeObjectsAt(x, y);
            board.addObject({ x: x, y: y, type: 'MA' });
        }
        for (const correct of Object.keys(tree)) {
            if (correct == PASS) {
                document.getElementById('msg').innerHTML += " Pass/Tenuki was a correct option.";
            } else {
                let [x,y] = parseMove(correct);
                board.addObject({x: x, y:y, type: 'CR'});
            }
        }

        updateRatio(false);
    }

    function succeed() {
        shutdown();
        document.getElementById('msg').innerHTML = "CORRECT!";
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

    function shutdown() {
        document.getElementById('pass').removeEventListener('click', pass);
        board.removeEventListener('click', handleMove);
        board.addEventListener('click', reset);
    }

    // Make a reply if we can
    async function respond() {
        await new Promise(r => setTimeout(r, DELAY_MS));
        const possibleMoves = Object.keys(tree);
        if(possibleMoves.length > 0) {
            const chosenMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            tree = tree[chosenMove];

            if (chosenMove == PASS){
                document.getElementById('msg').innerHTML = "White passed.";
            } else {
                let [x,y] = parseMove(chosenMove);
                play(WGo.W, x,y);
            }
        }

        // Joseki is done if nothing left
        if(Object.keys(tree).length == 0){
            succeed();
        }
    }


}

