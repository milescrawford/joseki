
const FACTOR = 5;
const BIG_FACTOR = 10;
const PASS = 'pass';
const DONE = 'done';
const DELAY_MS = 250;
const STORAGE_KEY = 'josekis';
const BOARD_SIZE = 600;
const SMALL_SIZE = 120;
const SMALL_THRESH = 500;
const FONT = 'Cabin Sketch';
const TOKEN_KEY = 'token'
const EMAIL_KEY = 'email';
const HIGH_KEY = 'highScore';
const DAY_KEY = 'day';
const DAY_SCORE_KEY = 'dayScore';
const WELCOME_KEY = 'welcomeSeen';
const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"];
const STARTER_JOSEKIS = {version: 1,groups: [{name: "Existing Josekis",enabled: true,josekis: [{"id": 27,"comment": "Fuseki: Orthodox.","moves": ["15,15", "3,3", "16,3", "3,15", "14,2"],"enabled": true}, {"id": 4,"comment": "Approach 3-4 high and settle facing in front of the 3-4.","moves": ["3,2", "3,4", "2,4", "2,5", "2,3", "3,5", "5,2", "3,9"],"enabled": true}, {"id": 17,"comment": "Approach 3-4 high, settle facing to the side of the 3-4.","moves": ["3,2", "3,4", "2,4", "3,3", "2,3", "4,2", "2,2", "3,5"],"enabled": true}, {"id": 7,"comment": "Approach 3-4 low, get kicked, and settle low.","moves": ["3,2", "2,4", "2,3", "3,4", "5,2", "2,8"],"enabled": true}, {"id": 14,"comment": "Approach 3-4 low, get kicked, settle high.","moves": ["3,2", "2,4", "2,3", "3,4", "5,2", "3,8"],"enabled": true}, {"id": 16,"comment": "Approach 3-4 low, make more fragile, faster extension.","moves": ["16,3", "14,2", "15,5"],"enabled": true}, {"id": 15,"comment": "Approach 3-4 low, make solid, calm extension.","moves": ["16,3", "14,2", "15,4"],"enabled": true}, {"id": 20,"comment": "Approach 4-4 high, back off high, give defender large corner in exchange for influence.","moves": ["15,15", "13,15", "15,13", "15,16", "16,16", "14,16", "16,17", "13,13"],"enabled": true}, {"id": 21,"comment": "Approach 4-4 high, back off high, trade corner potential for influence.","moves": ["15,3", "15,5", "13,3", "13,5"],"enabled": true}, {"id": 10,"comment": "Approach 4-4 low, back off, and settle calmly.","moves": ["3,3", "2,5", "5,2", "1,3", "2,2", "2,8"],"enabled": true}, {"id": 19,"comment": "Approach 4-4 low, back off, force defender to split corner, develop sides.","moves": ["3,3", "2,5", "5,2", "2,3", "2,2", "1,2", "2,4", "1,3", "3,4", "1,4", "2,1", "3,5"],"enabled": true}, {"id": 5,"comment": "Approach 4-4 low, back off, force defender to split the corner, and keep side low.","moves": ["3,3", "2,5", "5,2", "2,3", "2,2", "1,2", "2,4", "1,3", "3,4", "1,4", "3,5", "2,6"],"enabled": true}, {"id": 9,"comment": "Approach 4-4 low, get kicked, get side thickness.","moves": ["3,3", "2,5", "2,4", "3,5", "5,2", "3,9", "2,7", "3,7", "1,5", "1,6", "1,4", "2,6"],"enabled": true}, {"id": 18,"comment": "Approach 4-4 low, get kicked, settle.","moves": ["3,3", "2,5", "2,4", "3,5", "5,2", "3,9"],"enabled": true}, {"id": 8,"comment": "Enclose 3-4.","moves": ["3,2", "pass", "2,4"],"enabled": true}, {"id": 11,"comment": "Enclose 4-4.","moves": ["3,3", "pass", "2,5"],"enabled": true}, {"id": 26,"comment": "Fuseki: Chinese.","moves": ["15,3", "3,15", "15,16", "3,3", "16,10"],"enabled": true}, {"id": 25,"comment": "Fuseki: Sanrensei.","moves": ["3,3", "15,15", "15,3", "3,15", "9,3"],"enabled": true}, {"id": 6,"comment": "Invade 4-4, defender double-hanes to retain corner.","moves": ["3,3", "2,2", "2,3", "3,2", "4,2", "4,1", "5,1", "5,2", "4,3", "6,1", "3,1", "5,0", "2,1"],"enabled": true}, {"id": 22,"comment": "Invade 4-4, defender emphasizes side and sente.","moves": ["3,3", "2,2", "3,2", "2,3", "2,5", "2,4", "3,4", "1,5"],"enabled": true}, {"id": 13,"comment": "Invade 4-4, defender emphasizes side influence and sente.","moves": ["3,3", "2,2", "3,2", "2,3", "2,5", "1,5"],"enabled": true}, {"id": 23,"comment": "Invade 4-4, defender seals invader in with excellent influence.","moves": ["15,3", "16,2", "16,3", "15,2", "14,2", "14,1", "13,2", "13,1", "12,2", "17,3", "17,4", "17,2", "16,5"],"enabled": true}, {"id": 12,"comment": "Invade 4-4, defender trades some corner territory for sente.","moves": ["3,3", "2,2", "3,2", "2,3", "3,4", "1,5"],"enabled": true}, {"id": 24,"comment": "Invade 4-4, invader lives with sente.","moves": ["15,3", "16,2", "15,2", "16,3", "16,4", "17,4", "16,5", "17,5", "16,6", "17,6", "16,7"],"enabled": true}]}]};
const EMPTY_SCORE = {
            sessionAttempts: 0,
            sessionSuccess: 0,
            combo: 0,
            score: 0,
            streak: 0,
            unique: {},
        };

{
    var josekiData = {};
    var tree;
    var board;
    var game;
    var currentEditJoseki;
    var currentEditBoard;
    var currentEditGroupIndex;
    var groupHiddenState = {};
    var gridOption = false;
    var smallBoard = false;
    var ghostStone;
    var lastMove;
    var msgObj;

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

    function boardMsg(text, color='black') {
        let fillStyle = "rgba(0,0,0,0.9)";
        if (color == 'green') {
            fillStyle = "rgba(40,167,69,0.9)";
        } else if (color == 'red') {
            fillStyle = "rgba(220,53,69,0.9)";
        }
        msgObj = { grid: { draw: function(args, board) {
            this.fillStyle = fillStyle;
            this.textBaseline="middle";
            this.textAlign="center";
            this.font = (board.stoneRadius * 4)+"px "+(board.font || "");
            if(smallBoard) {
                this.fillText(text, board.getX(13), board.getY(5));
            } else {
                this.fillText(text, board.getX(9), board.getY(9));
            }
        }}};
        board.addCustomObject(msgObj);
    }

    function clearBoardMsg() {
        if(msgObj){
            board.removeCustomObject(msgObj);
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
            boardMsg("Loading...");
        }else{
            board.addEventListener("click", listener);
            board.addEventListener("mousemove", handleHover);
            board.addEventListener("mouseout", clearGhostStone);
        }
    }

    function apiBase() {
        return window.location.hostname == 'localhost' ? 'http://localhost:8000' : 'https://api.joseki.cat';
    }

    function getJosekiArray(filter) {
        const result = [];

        for (let i = 0; i < josekiData.groups.length; i++) {
            const group = josekiData.groups[i];

            for (const joseki of group.josekis) {
                if (!filter || filter(joseki, group, i))
                    result.push(joseki);
            };
        }

        return result;
    }

    function storeJosekiData() {
        gtag("event", "edit", {'event_category': 'joseki', "value" : getJosekiArray().length});
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(josekiData));

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
                'body': JSON.stringify(josekiData),
            });
        }
    }

    function ensureBackwardsCompatibility(rawJosekiData)  {
        // Added Ability To Enable/Disable Josekis
        function upgradeToPreVersion1(josekis) {
            josekis.forEach(j => {
                if (!Object.hasOwn(j, "enabled"))
                    j.enabled = true;
            });
        }

        // Added Ability to Group Josekis
        function upgradeToVersion1(josekis) {
            let newJosekiData = { version: 1, groups: []};
            newJosekiData.groups.push(newJosekiGroup('Existing Josekis', true, josekis));
            return newJosekiData;
        }

        if (rawJosekiData.version)
            return;

        upgradeToPreVersion1(rawJosekiData);
        josekiData = upgradeToVersion1(rawJosekiData);
    }

    function loadJosekiData(initFunc) {
        let token = window.localStorage.getItem(TOKEN_KEY)
        if(token) {
            // We have a login, check server
            let apiUrl = apiBase() + '/load';
            fetch(apiUrl, { 'mode': 'cors', 'headers': { 'Authorization': token}})
                .then(async function(response) {

                    // Joseki on server, use those
                    if (response.ok) {
                        josekiData = await response.json();
                        ensureBackwardsCompatibility(josekiData);
                        initFunc();

                        // Nothing on server yet, pull local or init
                    } else if (response.status == 404) {
                        if (window.localStorage.getItem(STORAGE_KEY)){
                            josekiData = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
                            ensureBackwardsCompatibility(josekiData);
                            storeJosekiData(); // Write whatever they have locally to server
                        } else {
                            josekiData = STARTER_JOSEKIS;
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
                josekiData = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
                ensureBackwardsCompatibility(josekiData);
            } else {
                josekiData = STARTER_JOSEKIS;
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
        if (width < SMALL_THRESH) {
            smallBoard = true;
        } else {
            smallBoard = false;
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
        let section = {top: 0, right: 0, bottom: 0, left: 0};
        if (smallBoard) {
            section = {top: 0, right: 0, bottom: 8.5, left: 8.5};
        }
        let b = new WGo.Board(element, {
            width: width,
            background: "",
            font: FONT,
            section: section,
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
        let original = clone(getJosekiArray((joseki, group) => group.enabled && joseki.enabled));

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

        let all = original.concat(ltr, ttb, diag, whiteBegins);

        // Filter joseki if board is small
        let filtered = [];
        if(smallBoard) {
            filtered = all.filter((x) => {
                let ret = true;
                for (const mv of x.moves){
                    let [x,y] = parseMove(mv);
                    if(x != 'pass' && (x < 9 || y > 9)) {
                        ret = false;
                    }
                }
                return ret;
            })
        }else {
            filtered = all;
        }

        // Build move tree
        tree = {};
        for (const joseki of filtered){
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
        loadJosekiData(resetEdit);
    }

    function resetEdit(id) {
        const getGroupEl = function(groupIndex, enabled) {
            return `<div class="group row g-2 mt-2">
                <div class="col-12">
                    <div class="card border-info mb-3">
                        <div class="overlay--${!enabled} joseki-group__overlay--${!enabled} no-border cursor--pointer" onClick="event.stopPropagation(); toggleHideJosekiGroup(${groupIndex});"></div>
                        <div class="card-header h5 cursor--pointer no-border" onClick="event.stopPropagation(); toggleHideJosekiGroup(${groupIndex});">
                            <span id="joseki-group-${groupIndex}-name" class="joseki-group__name-overlay--${!enabled}"></span>
                            <div class="joseki-group__actions">
                                <button class="btn btn-secondary border-primary joseki-group__btn" onClick="event.stopPropagation(); toggleJosekiGroup(${groupIndex});">Toggle Group</button>    
                                <button class="btn btn-warning border-primary joseki-group__btn" onClick="event.stopPropagation(); deleteJosekiGroup(${groupIndex});">Delete Group</button>
                            </div>
                        </div>
                        <div id="joseki-group-${groupIndex}-content" class="row g-2 mt-1 p-2 joseki-group__content"></div>
                    </div>
                </div>
            </div>`;
        };

        mainBoard(handleEditAdd);
        game = new WGo.Game();

        currentEditGroupIndex = null;
        currentEditJoseki = newJoseki();
        currentEditBoard = [board.getState()];
        document.getElementById('comment').value = '';
        let josekiGroupSelectEl = document.getElementById('group');
        josekiGroupSelectEl.innerHTML = '';

        // Existing menu
        let groupsContainerEl = document.getElementById("joseki-groups");
        groupsContainerEl.innerHTML = '';

        for (let groupIndex = 0; groupIndex < josekiData.groups.length; groupIndex++) {
            let group = josekiData.groups[groupIndex];

            let groupOptionEl = document.createElement('option');
            groupOptionEl.value = groupIndex;
            groupOptionEl.text = group.name;
            josekiGroupSelectEl.appendChild(groupOptionEl);

            let josekiGroupEl = document.createElement('div');
            josekiGroupEl.innerHTML = getGroupEl(groupIndex, group.enabled);
            groupsContainerEl.appendChild(josekiGroupEl);

            document.getElementById('joseki-group-' + groupIndex + '-name').textContent = group.name;

            group.josekis.sort(function(a,b) { return a['comment'].localeCompare(b['comment']);});

            for (const joseki of group.josekis) {
                let josekiCont = document.createElement("div");
                josekiCont.className = "menu-card col card mx-2 p-1 col-2 border-primary align-top";
                if (joseki.id == id) {
                    josekiCont.className += " bg-info";
                } else {
                    josekiCont.addEventListener('click', function() { resetEdit(joseki.id);});
                }
    
                let overlayEl = document.createElement('div');
                overlayEl.className = `overlay--${!joseki.enabled} joseki__overlay--${!joseki.enabled}`;
                josekiCont.appendChild(overlayEl);
    
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
    
                let existing = document.getElementById('joseki-group-' + groupIndex + '-content');
                existing.appendChild(josekiCont);
                let existingBoard = newBoard(menuBoardEl, SMALL_SIZE, false);
                let color = WGo.B;
                for (const move of joseki.moves) {
                    let [x,y] = parseMove(move);
                    existingBoard.addObject({ x: x, y: y, c: color});
                    color = color == WGo.B ? WGo.W : WGo.B;
                }
            }

            // Set the max-height, so css can animate hiding the group on user action
            let groupContentEl = document.getElementById('joseki-group-' + groupIndex + '-content');
            groupContentEl.style['max-height'] = groupContentEl.clientHeight + 'px';
            if (groupHiddenState[groupIndex])
                groupContentEl.classList.add('joseki-group__content--hidden');
    
            if(id) {
                let tmpJoseki = group.josekis.find(function(a){ return a.id == id});
                if (!tmpJoseki)
                    continue;

                currentEditJoseki = tmpJoseki;
                currentEditGroupIndex = groupIndex;
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
                josekiGroupSelectEl.value = groupIndex;
            }
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
        let desiredGroup = document.getElementById('group').value;

        if (currentEditGroupIndex !== null) {
            let josekiIndex = josekiData.groups[currentEditGroupIndex].josekis.findIndex(function(a){ return a.id === currentEditJoseki.id});
            if (josekiIndex !== -1)
                josekiData.groups[currentEditGroupIndex].josekis.splice(josekiIndex, 1);
        }

        josekiData.groups[desiredGroup].josekis.unshift(currentEditJoseki);

        storeJosekiData();
        resetEdit();
    }

        ////////// Edit Joseki Actions ///////////

    function newJoseki() {
        let maxId = 0;
        getJosekiArray((joseki) => {
            if (joseki.id > maxId)
                maxId = joseki.id;
        });

        return {'id': maxId +1, 'comment':'', 'moves': [], 'enabled': true};
    }

    function deleteJoseki() {
        let currentJoseki = getJosekiArray(joseki => joseki.id === currentEditJoseki.id).pop();
        let numEnabledJosekis = getJosekiArray((joseki, group) => joseki.enabled && group.enabled).length;
        let allJosekis = getJosekiArray();

        if (!currentJoseki)
            return alert("No joseki selected");

        if (allJosekis.length <= 1)
            return alert("Can't remove last joseki");

        if (numEnabledJosekis <= 1 && currentJoseki.enabled)
            return alert("Can't delete last enabled joseki");

        if (!confirm("Are you sure you want to delete this joseki?"))
            return;
            
        josekiData.groups.forEach(group => {
            let index = group.josekis.findIndex(function(a){ return a.id == currentEditJoseki.id});
            if (index > -1) {
                group.josekis.splice(index, 1);
            }
        });
        
        storeJosekiData();
        resetEdit();
    }

    function toggleJoseki() {
        let numEnabledJosekis = getJosekiArray((joseki, group) => group.enabled && joseki.enabled).length;
        let currentJoseki = getJosekiArray(joseki => joseki.id === currentEditJoseki.id).pop();

        if (!currentJoseki)
            return alert("No joseki selected");

        if (numEnabledJosekis <= 1 && currentJoseki.enabled)
            return alert("At least one joseki must be enabled");

        currentJoseki.enabled = !currentJoseki.enabled;
        storeJosekiData();
        resetEdit();
    }

    ////////// Edit Joseki Group Actions ///////////

    function newJosekiGroup(name = '', enabled = true, josekis = []) {
        return { 'name': name, 'enabled': enabled, 'josekis': josekis};
    }

    function saveJosekiGroup() {
        let groupName = prompt('Please enter a name for the new group');
        
        if (groupName === null)
            return;

        groupName = groupName?.trim();

        if (!groupName)
            return alert('Group name cannot be whitespace')

        if (['\\', '"', ':'].some(char => groupName.includes(char)))
            return alert('Group names may not include \\, : or " characters');

        if (josekiData.groups.filter((group) => group.name.toLowerCase() === groupName.toLowerCase()).length)
            return alert(groupName + ' already exists');

        josekiData.groups.push(newJosekiGroup(groupName, true, []));

        storeJosekiData();
        resetEdit();

        window.scrollTo(0, document.body.scrollHeight);
    }

    function deleteJosekiGroup(deleteGroupIndex) {
        if (josekiData.groups.length <= 1)
            return alert('Cannot delete only Joseki Group');
        
        if (getJosekiArray((joseki, group, groupIndex) => joseki.enabled && group.enabled && groupIndex !== deleteGroupIndex).length < 1)
            return alert ('Cannot delete all remaining enabled josekis');

        if (!confirm("Are you sure you want to delete group " + josekiData.groups[deleteGroupIndex].name + " and all josekis in that group?"))
            return;

        josekiData.groups.splice(deleteGroupIndex, 1);
                
        storeJosekiData();
        resetEdit();
    }

    function toggleJosekiGroup(toggleGroupIndex) {
        let group = josekiData.groups[toggleGroupIndex];

        if (group.enabled) {
            let numRemainingEnabledJosekis = getJosekiArray((joseki, group, groupIndex) => groupIndex !== toggleGroupIndex && group.enabled && joseki.enabled).length;

            if (numRemainingEnabledJosekis < 1)
                return alert ("At least one joseki must remain enabled");
        }

        group.enabled = !group.enabled;
        storeJosekiData();
        resetEdit();
    }

    function toggleHideJosekiGroup(toggleGroupIndex) {
        if (!Object.hasOwn(groupHiddenState, toggleGroupIndex))
            groupHiddenState[toggleGroupIndex] = false;

        groupHiddenState[toggleGroupIndex] = !groupHiddenState[toggleGroupIndex];

        let groupContentEl = document.getElementById('joseki-group-' + toggleGroupIndex + '-content');
        groupContentEl.classList.add('joseki-group__content--animate');
        groupContentEl.classList.toggle('joseki-group__content--hidden');
    }

    ////////// Play ///////////


    function init() {
        if(!window.localStorage.getItem(WELCOME_KEY)){
            $('#welcomeModal').modal()
            window.localStorage.setItem(WELCOME_KEY, 'seen');
        }

        if (window.localStorage.getItem(TOKEN_KEY)) {
            document.getElementById('save-warning').className += ' d-none';
        }else {
            document.getElementById('all-time').className += ' d-none';
        }
        mainBoard(handleMove, true);
        setupLogin();
        loadScores();
        loadJosekiData(reset);
    }

    function reset() {

        displayScore();
        buildTree();
        mainBoard(handleMove);

        game = new WGo.Game();

        // Update info/stats
        document.getElementById('pass').addEventListener('click', pass);
        document.getElementById('fail-card').className = 'hide-card';
        document.getElementById('success-card').className = 'hide-card';
        document.getElementById('pass-card').className = 'hide-card';
        document.getElementById('pass-msg').className = 'd-none';
        clearBoardMsg();

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
        document.getElementById('pass-card').className = 'hide-card';
        clearBoardMsg();
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

    function fail(move) {
        shutdown();
        boardMsg("Failed", 'red');
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
        boardMsg("Correct", 'green');
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
                Math.max(Math.log10(Object.keys(getJosekiArray((joseki, group) => group.enabled && joseki.enabled)).length) * FACTOR, 1) *
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
        const possibleMoves = Object.keys(tree).filter(move => move != DONE);
        if (possibleMoves.length > 0){
            await new Promise(r => setTimeout(r, DELAY_MS));
            const chosenMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
            tree = tree[chosenMove];

            if (chosenMove == PASS){
                game.pass();
                document.getElementById('pass-card').className = "show-card";
                boardMsg('White Passed')
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

