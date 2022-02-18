
const FACTOR = 5;
const BIG_FACTOR = 10;
const PASS = 'pass';
const DONE = 'done';
const DELAY_MS = 250;
const STORAGE_KEY = 'josekis';
const BOARD_SIZE = 600;
const SMALL_SIZE = 120;
const FONT = 'Neucha';
const TOKEN_KEY = 'token'
const EMAIL_KEY = 'email';
const HIGH_KEY = 'highScore';
const DAY_KEY = 'day';
const DAY_SCORE_KEY = 'dayScore';
const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"];
const STARTER_JOSEKIS = [{"id":13,"comment":"Emphasize side after 3-3 invasion.","moves":["3,3","2,2","3,2","2,3","2,5","2,4","3,4","1,5"]},{"id":4,"comment":"Approach 3-4 high and settle.","moves":["3,2","3,4","2,4","2,5","2,3","3,5","5,2","3,9"]},{"id":7,"comment":"Approach 3-4 low and settle.","moves":["3,2","2,4","2,3","3,4","5,2","2,8"]},{"id":5,"comment":"Approach 4-4 low and force defender to split the corner.","moves":["3,3","2,5","5,2","2,3","2,2","1,2","2,4","1,3","3,4","1,4","3,5","2,6"]},{"id":9,"comment":"Approach 4-4 low and get side thickness after the kick.","moves":["3,3","2,5","2,4","3,5","5,2","3,9","3,7","4,7","1,5","1,6","1,4","2,6"]},{"id":10,"comment":"Approach 4-4 low and settle.","moves":["3,3","2,5","5,2","1,3","2,2","2,8"]},{"id":12,"comment":"Block 3-3 invasion with sente.","moves":["3,3","2,2","3,2","2,3","3,4","1,5"]},{"id":8,"comment":"Enclose 3-4.","moves":["3,2","pass","2,4"]},{"id":11,"comment":"Enclose 4-4.","moves":["3,3","pass","2,5"]},{"id":6,"comment":"Retain corner after 3-3 invasion.","moves":["3,3","2,2","2,3","3,2","4,2","4,1","5,1","5,2","4,3","6,1","3,1","5,0","2,1"]}];
const EMPTY_SCORE = {
            sessionAttempts: 0,
            sessionSuccess: 0,
            combo: 0,
            score: 0,
            unique: {},
        };

{
    var josekis = [];
    var tree;
    var board;
    var game;
    var currentEditJoseki;
    var currentEditBoard;
    var gridOption = false;
    var ghostStone;
    var lastMove;

    // Scoring
    var score;
    var moves = 0;
    var streak = 0;

    var reloadDate = getDate();
    setInterval(function() {
        if (getDate() != reloadDate){
            location.reload();
        }

    }, 1000 * 60);

    ////////// Common ///////////

    function getDate() {
        let date = new Date();
        return date.getFullYear() + "-" + (date.getMonth()+1) + "-" + date.getDate();
    }

    function updateHighScore(newScore){
        let highScore = window.localStorage.getItem(HIGH_KEY) || 0;
        if (newScore > highScore) {
            window.localStorage.setItem(HIGH_KEY, newScore);
        }
    }

    function getHighScore(){
        return parseInt(window.localStorage.getItem(HIGH_KEY) || 0);
    }

    function clearGhostStone() {
        if(ghostStone) {
            board.removeObject(ghostStone);
        }
    }

    function handleHover(x,y) {
        clearGhostStone();
        if(game.isValid(x,y)){
            ghostStone = { x: x, y: y, c:game.turn, type: 'outline' };
            board.addObject(ghostStone);
        }
    }

    function mainBoard(listener, disabled=false) {
        let cont = document.getElementById("boardcontainer");
        let boardElement = document.getElementById('board');
        if(boardElement) {
            cont.removeChild(boardElement);
        }
        boardElement = document.createElement("div");
        boardElement.id = "board";
        cont.insertBefore(boardElement, cont.firstChild);

        board = newBoard(document.getElementById('board'));
        if (disabled) {
            board.addCustomObject( { grid: { draw: function(args, board) {
                this.fillStyle = "rgba(0,0,0,0.7)";
                this.textBaseline="middle";
                this.textAlign="center";
                this.font = (board.stoneRadius * 4)+"px "+(board.font || "");
                this.fillText("Loading...", board.getX(9), board.getY(9));
            }}});
        }else{
            board.addEventListener("click", listener);
            board.addEventListener("mousemove", handleHover);
            board.addEventListener("mouseout", clearGhostStone);
        }
    }

    function apiBase() {
        return window.location.hostname == 'localhost' ? 'http://localhost' : 'https://api.joseki.cat';
    }

    function storeJoseki() {
        gtag("event", "edit", {'event_category': 'joseki', "value" : josekis.length});
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

    function loadJoseki(initFunc) {

        let token = window.localStorage.getItem(TOKEN_KEY)
        if(token) {
            // We have a login, check server
            let apiUrl = apiBase() + '/load';
            fetch(apiUrl, { 'mode': 'cors', 'headers': { 'Authorization': token}})
                .then(async function(response) {

                    // Joseki on server, use those
                    if (response.ok) {
                        josekis = await response.json();
                        initFunc();

                        // Nothing on server yet, pull local or init
                    } else if (response.status == 404) {
                        if (window.localStorage.getItem(STORAGE_KEY)){
                            josekis = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
                            storeJoseki(); // Write whatever they have locally to server
                        } else {
                            josekis = STARTER_JOSEKIS;
                        }
                        initFunc();

                    } else {
                        alert('Could not load joseki, see console');
                        console.log(response);
                    }
                });
        } else {
            // Not logged in, pull local or init
            if (window.localStorage.getItem(STORAGE_KEY)){
                josekis = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
            } else {
                josekis = STARTER_JOSEKIS;
            }
            initFunc();
        }
    }

    function loadScores() {

        let date = getDate();
        if (window.localStorage.getItem(DAY_KEY) != date) {
            window.localStorage.setItem(DAY_KEY, date);
            window.localStorage.setItem(DAY_SCORE_KEY, JSON.stringify(EMPTY_SCORE));
            score = null;
        }
        if(!score){
            score = JSON.parse(window.localStorage.getItem(DAY_SCORE_KEY));
        }

        let token = window.localStorage.getItem(TOKEN_KEY)
        if(token) {
            // We have a login, check server
            let apiUrl = apiBase() + '/load-score/' + getDate();
            fetch(apiUrl, { 'mode': 'cors', 'headers': { 'Authorization': token}})
                .then(async function(response) {

                    // Joseki on server, use those
                    if (response.ok) {
                        let scores = await response.json();
                        updateHighScore(scores['highScore']);
                        streak = scores['streak'];
                        displayScore();

                    } else if (response.status == 404) {
                        // Nothing on server yet, nothing to do

                    } else {
                        alert('Could not load scores, see console');
                        console.log(response);
                    }
                });
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
            let email = window.localStorage.getItem(EMAIL_KEY);
            emailEl.innerText = email.substr(0, email.indexOf('@')); 
            welcomeEl.className = 'nav-link';
            gtag('event', 'logged_in', {'event_category': 'joseki'});
        } else {
            loginEl.className = 'nav-link';
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

    ////////// about ///////////
    function initAbout() {
        setupLogin();
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

    function initEdit() {
        if (window.localStorage.getItem(TOKEN_KEY)) {
            document.getElementById('save-warning').className += ' d-none';
        }
        mainBoard(handleEditAdd, true);
        setupLogin();
        loadJoseki(resetEdit);
    }

    function resetEdit(id) {

        mainBoard(handleEditAdd);
        game = new WGo.Game();

        currentEditJoseki = newJoseki();
        currentEditBoard = [board.getState()];
        document.getElementById('comment').value = '';


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
                josekiCont.addEventListener('click', function() { resetEdit(joseki.id);});
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
        }

    }

    function handleEditAdd(x,y) {
        clearGhostStone();
        let color = game.turn;
        let result = game.play(x,y,color);
        if (Array.isArray(result)) {
            currentEditJoseki.moves.push(serMove(x,y));
            board.addObject({ x: x, y: y, c: color});
            board.addObject({x: x, y: y, type: "LB", font: FONT, text: (currentEditJoseki.moves.length)});
            board.removeObject(result);
            currentEditBoard.push(board.getState());
        }
    }

    function editRemove() {
        if(currentEditJoseki.moves.length > 0) {
            currentEditJoseki.moves.pop();
            currentEditBoard.pop();
            game.popPosition();
            // Must clone because wgo mutates the restored state and we want to
            // keep it safe.
            board.restoreState(clone(currentEditBoard[currentEditBoard.length - 1]));
        }
    }

    function editPass() {
        if( currentEditJoseki.moves.length > 0){
            clearGhostStone();
            currentEditJoseki.moves.push(PASS);
            currentEditBoard.push(board.getState());
            game.pass();
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

        resetEdit();
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
                resetEdit();
            }
        }else {
            alert("Can't remove last joseki");
        }
    }


    ////////// Play ///////////


    function init() {
        if (window.localStorage.getItem(TOKEN_KEY)) {
            document.getElementById('save-warning').className += ' d-none';
        }else {
            document.getElementById('all-time').className += ' d-none';
        }
        mainBoard(handleMove, true);
        setupLogin();
        loadScores();
        loadJoseki(reset);
    }

    function reset() {

        displayScore();
        buildTree();
        mainBoard(handleMove);

        game = new WGo.Game();

        // Update info/stats
        document.getElementById('pass-indicate').className = 'hide';
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
            if (lastMove) {
                board.removeObject(lastMove);
            }
            board.addObject({ x: x, y: y, c: color});
            lastMove = { x: x, y: y, type: 'CR'};
            board.addObject(lastMove);
            board.removeObject(result);
            return true;
        } else {
            return false;
        }
    }

    function handleMove(x, y) {
        gtag("event", "move", {'event_category': 'joseki'});
        document.getElementById('pass-indicate').className = 'hide';
        moves += 1;
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
        moves += 1;
        if (PASS in tree) {
            game.pass();
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

        updateScore(false);
        gtag("event", "practice", {'event_category': 'joseki', 'event_label': 'fail'});
    }

    function succeed(msg) {
        shutdown();
        document.getElementById('success-msg').innerText = msg;
        document.getElementById('success-card').className = "show-card";
        updateScore(true, msg);
        gtag("event", "practice", {'event_category': 'joseki', 'event_label': 'success'});

    }

    function updateScore(successful, msg) {
        score.sessionAttempts +=1;
        if(successful){
            score.sessionSuccess +=1;
            score.combo += 1;
            score.unique[msg] = true;

            // # moves base * combo multi * unique multi * total multi
            score.score += Math.round(
                moves *
                Math.max(Math.log10(score.combo) * BIG_FACTOR, 1) *
                Math.max(Math.log10(Object.keys(josekis).length) * FACTOR, 1) *
                Math.max(Math.log10(Object.keys(score.unique).length) * FACTOR, 1)
            );
            updateHighScore(score.score);
        } else {
            score.combo = 0;
        }
        window.localStorage.setItem(DAY_SCORE_KEY, JSON.stringify(score));

        let token = window.localStorage.getItem(TOKEN_KEY)
        if (token) {
            let apiUrl = apiBase() + '/store-score';
            fetch(apiUrl, {
                'method': 'POST',
                'mode': 'cors',
                'headers': {
                    'Authorization': token,
                    'Content-Type': 'application/json',
                },
                'body': JSON.stringify({'highScore': getHighScore(), 'score': score.score, 'date': getDate()}),
            });
        }

        moves = 0;
        displayScore();
    }

    function displayScore() {
        let ratio = score.sessionAttempts == 0 ? 0 : Math.round((score.sessionSuccess / score.sessionAttempts) * 100.0);
        document.getElementById('ratio').innerHTML = ratio;
        document.getElementById('unique').innerHTML = Object.keys(score.unique).length;
        document.getElementById('combo').innerHTML = score.combo;
        document.getElementById('tries').innerHTML = score.sessionAttempts;
        document.getElementById('streak').innerText = streak;

        // animated ones
        document.getElementById('score').style.setProperty('--score', score.score);
        document.getElementById('highScore').style.setProperty('--highScore', getHighScore());

    }

    function shutdown() {
        document.getElementById('pass').removeEventListener('click', pass);
        board.removeEventListener('click', handleMove);
        board.removeEventListener('mousemove', handleHover);
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
                game.pass();
                document.getElementById('pass-indicate').className = "show";
                if (lastMove) {
                    board.removeObject(lastMove);
                }
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

