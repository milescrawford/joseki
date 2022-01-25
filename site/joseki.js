
const PASS = 'pass';
const DONE = 'done';
const DELAY_MS = 250;
const STORAGE_KEY = 'josekis';
const BOARD_SIZE = 600;
const SMALL_SIZE = 120;
const FONT = 'Neucha';
const TOKEN_KEY = 'token'
const EMAIL_KEY = 'email';
const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"];

{
    let josekis = [];
    loadJoseki();


    let tree;
    let board;
    let game;
    let sessionAttempts = 0;
    let sessionSuccess = 0;
    let currentEditJoseki;
    let gridOption = false;


    ////////// Common ///////////

    function apiBase() {
        return window.location.hostname == 'localhost' ? 'http://localhost' : 'https://api.joseki.cat';
    }

    function storeJoseki() {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(josekis));

        let token = window.localStorage.getItem(TOKEN_KEY)
        if (token) {
            let apiUrl = apiBase() + '/store';
            fetch(apiUrl, { 
                'method': 'POST', 
                'mode': 'cors', 
                'headers': { 
                    'Authorization': token,
                    'Content-Type': 'application/json',
                }, 
                'body': JSON.stringify(josekis),
            });
        }
    }

    function loadJoseki() {
        let token = window.localStorage.getItem(TOKEN_KEY)
        if(token) {
            let apiUrl = apiBase() + '/load';
            fetch(apiUrl, { 'mode': 'cors', 'headers': { 'Authorization': token}})
                .then(response => response.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        console.log(data);
                    }
                });
        }

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
    }

    function setupLogin() {

        let loginEl = document.getElementById('login-a');
        let welcomeEl = document.getElementById('welcome');
        let emailEl = document.getElementById('email');

        let base = "https://login.joseki.cat/oauth2/authorize?client_id=24mjbjvra3522lff13op0dnvhm&response_type=code&scope=email+openid&redirect_uri=";
        let relativeLogin = window.location.hostname == 'localhost' ? 'http://localhost:8000/login/' : 'https://joseki.cat/login/';
        let loginUrl = base + encodeURIComponent(relativeLogin);
        loginEl.href = loginUrl;

        if (window.localStorage.getItem(TOKEN_KEY)) {
            emailEl.innerText = window.localStorage.getItem(EMAIL_KEY);
            loginEl.className += ' d-none';
        } else {
            welcomeEl.className += " d-none";
        }
    }

    function boardResize() {
        let width = document.getElementById('boardcontainer').clientWidth;
        if(board) {
            board.setWidth(width);
        }
        return width;
    }
    window.addEventListener('resize', boardResize);

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

    function newBoard(element, width=boardResize(), grid=gridOption) {
        let adjust = grid ? 0.5 : 0;
        let b = new WGo.Board(element, {
            width: width,
            background: "",
            font: FONT,
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

    function clone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    function transformJoseki(toTransform, transform) {
        let output = [];
        for (const joseki of toTransform){
            let transformed = clone(joseki); 
            transformed.moves = [];
            for (const move of joseki.moves){
                if (move == PASS) {
                    transformed.moves.push(PASS);
                } else {
                    let [x,y] = parseMove(move);
                    let [newx, newy] = transform(x,y);
                    let newMove = serMove(newx, newy);

                    transformed.moves.push(newMove);
                }
            }
            output.push(transformed);
        }
        return output;
    }


    function buildTree() {
        let original = clone(josekis);

        // mirror left to right, top to bottom, and diagonally
        let ltr = transformJoseki( original, function(x,y) { 
            return [x, 18-y];});
        let ttb = transformJoseki( original.concat(ltr), function(x,y){ 
            return [18-x, y];});
        let diag = transformJoseki( original.concat(ltr, ttb), function(x,y){ 
            return [18 - ((0-y) * -1), (x - 18) * -1]; });

        // Augment with white leads joseki
        let whiteBegins = [];
        for (const joseki of original.concat(ltr, ttb, diag)){
            let wb = clone(joseki);
            wb.moves.unshift(PASS);
            whiteBegins.push(wb);
        }

        // Build move tree
        tree = {};
        for (const joseki of original.concat(ltr, ttb, diag, whiteBegins)){
            let cur_tree = tree;
            for (const move of joseki.moves) {
                if (! (move in cur_tree)) {
                    cur_tree[move] = {};
                }
                cur_tree = cur_tree[move];
            }
            cur_tree[DONE] = cur_tree[DONE] ? cur_tree[DONE] += " " + joseki.comment : joseki.comment;
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

    }

    ////////// login ///////////

    function initLogin() {
        let apiUrl = apiBase() + '/login';
        let code = new URLSearchParams(window.location.search).get('code')
        fetch(apiUrl, { 'mode': 'cors', 'headers': { 'Authorization': code}})
            .then(response => response.json())
            .then(data => {
                window.localStorage.setItem(TOKEN_KEY, data[TOKEN_KEY]);
                window.localStorage.setItem(EMAIL_KEY, data[EMAIL_KEY]);
                window.location.assign("/");
            }
            );
    }


    ////////// Edit ///////////

    function initEdit(id) {
        setupLogin();

        // Main Editor
        let cont = document.getElementById("boardcontainer");
        let boardElement = document.getElementById('board');
        if(boardElement) {
            cont.removeChild(boardElement);
        }
        boardElement = document.createElement("div");
        boardElement.id = "board";
        cont.insertBefore(boardElement, cont.firstChild);

        board = newBoard(document.getElementById('board'));
        board.addEventListener("click", handleEditAdd);
        game = new WGo.Game();
        currentEditJoseki = newJoseki();
        document.getElementById('comment').value = '';
        redraw();


        // Existing menu
        josekis.sort(function(a,b) { return a['comment'].localeCompare(b['comment']);});
        let existing = document.getElementById("existingList");
        existing.innerHTML = '';
        for (const joseki of josekis) {
            let josekiCont = document.createElement("div");
            josekiCont.className = "menu-card col card mx-2 p-1 col-2 border-primary align-top";
            if (joseki.id == id) {
                josekiCont.className += " bg-info";
            } else {
                josekiCont.addEventListener('click', function() { initEdit(joseki.id);});
            }

            let rowEl = document.createElement('div');
            rowEl.className = "row g-2";
            josekiCont.appendChild(rowEl);

            let menuBoardEl = document.createElement("div");
            menuBoardEl.className = 'menu-board col';
            rowEl.appendChild(menuBoardEl);

            let commentEl = document.createElement("div");
            commentEl.className = 'col';
            commentEl.appendChild(document.createTextNode(joseki.comment));
            rowEl.appendChild(commentEl);

            josekiCont.appendChild(rowEl);

            existing.appendChild(josekiCont);
            let existingBoard = newBoard(menuBoardEl, SMALL_SIZE, false);
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



    function editSave() {
        currentEditJoseki.comment = document.getElementById('comment').value || "#" + currentEditJoseki.id;
        if(josekis.find(function(a){ return a.id == currentEditJoseki.id})) {
            let index = josekis.findIndex(function(a){ return a.id == currentEditJoseki.id});
            josekis[index] = currentEditJoseki;
        } else {
            josekis.unshift(currentEditJoseki);
        }

        storeJoseki();

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
                storeJoseki();
                initEdit();
            }
        }else {
            alert("Can't remove last joseki");
        }
    }


    ////////// Play ///////////

    function init() {
        setupLogin();
        displayRatio();
        reset();
    }

    function reset() {

        buildTree();


        // Setup fresh board
        let cont = document.getElementById("boardcontainer");
        let boardElement = document.getElementById('board');
        if(boardElement) {
            cont.removeChild(boardElement);
        }
        boardElement = document.createElement("div");
        boardElement.id = "board";
        cont.insertBefore(boardElement, cont.firstChild);

        board = newBoard(document.getElementById('board'));
        game = new WGo.Game();


        // Update info/stats
        document.getElementById('josekiCount').innerText = Object.keys(josekis).length;
        document.getElementById('pass-indicate').className = 'hide';
        board.addEventListener("click", handleMove);
        document.getElementById('pass').addEventListener('click', pass);
        document.getElementById('fail-card').className = 'hide-card';
        document.getElementById('success-card').className = 'hide-card';
        document.getElementById('pass-msg').className = 'd-none';

        // Half the time, white starts
        if (Math.floor(Math.random() * 2)){
            pass();
        }
    }


    function play(color, x, y) {
        let result = game.play(x,y,color);
        if (Array.isArray(result)) {
            redraw();
            board.addObject({ x: x, y: y, c: color});
            board.addObject({ x: x, y: y, type: 'CR'});
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
        document.getElementById('pass-indicate').className = 'hide';
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
        document.getElementById('fail-card').className = "show-card";

        if(move != PASS){
            let [x,y] = parseMove(move);
            board.removeObjectsAt(x, y);
            board.addObject({ x: x, y: y, type: 'MA' });
        }
        for (const correct of Object.keys(tree)) {
            if (correct == PASS) {
                document.getElementById('pass-msg').className = "d-block";
            } else {
                let [x,y] = parseMove(correct);
                board.addObject({x: x, y:y, type: 'outline'});
            }
        }

        updateRatio(false);
    }

    function succeed(msg) {
        shutdown();
        document.getElementById('success-msg').innerHTML = msg;
        document.getElementById('success-card').className = "show-card";
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
        const possibleMoves = Object.keys(tree).filter(move => move != DONE);;

        if (possibleMoves.length > 0){
            const chosenMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            tree = tree[chosenMove];

            if (chosenMove == PASS){
                document.getElementById('pass-indicate').className = "show";
            } else {
                let [x,y] = parseMove(chosenMove);
                play(WGo.W, x,y);
            }
        }

        // Joseki is done if nothing left
        if(DONE in tree){
            succeed(tree[DONE]);
        }
    }
}

