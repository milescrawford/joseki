
const FACTOR = 5;
const BIG_FACTOR = 10;
const PASS = 'pass';
const DONE = 'done';
const DELAY_INITIAL = 0;
const DELAY_STANDARD = 250;
const STORAGE_KEY = 'josekis';
const BOARD_SIZE = 600;
const SMALL_SIZE = 150;
const SMALL_THRESH = 600;
const SMALL_SECTION = {top: 0, right: 0, bottom: 8.5, left: 8.5};
const FULL_SECTION = {top: 0, right: 0, bottom: 0, left: 0};
const FONT = 'Cabin Sketch';
const TOKEN_KEY = 'token'
const EMAIL_KEY = 'email';
const HIGH_KEY = 'highScore';
const DAY_KEY = 'day';
const DAY_SCORE_KEY = 'dayScore';
const WELCOME_KEY = 'welcomeSeen';
const LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T"];
const EMPTY_SCORE = {
            sessionAttempts: 0,
            sessionSuccess: 0,
            combo: 0,
            score: 0,
            streak: 0,
            unique: {},
        };

{
    var delay_ms = DELAY_INITIAL;
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
    var running = false;

    // Scoring
    var score;
    var numPlayerMoves = 0;
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
        clearBoardMsg();
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
            this.font = (board.stoneRadius * 3)+"px "+(board.font || "");
            if(smallBoard) {
                this.fillText(text, board.getX(13), board.getY(9));
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

        board = newBoard(document.getElementById('board'), boardResize(), (smallBoard ? SMALL_SECTION : FULL_SECTION));
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

    function urlBase() {
        return window.location.hostname == 'localhost' ? 'http://localhost:8000' : 'https://joseki.cat';
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

    function ensureBackwardsCompatibility()  {
        // Added Ability To Enable/Disable Josekis
        function upgradeToPreVersion1() {
            josekiData.forEach(j => {
                if (!Object.hasOwn(j, "enabled"))
                    j.enabled = true;
            });
        }

        // Added Ability to Group Josekis
        function upgradeToVersion1() {
            let newJosekiData = { version: 1, groups: []};
            newJosekiData.groups.push(newJosekiGroup('Existing Josekis', true, josekiData));
            josekiData = newJosekiData;
        }

        // Moves and passing can be manual or automatic.  Adds saved user settings.
        function upgradeToVersion2() {
            josekiData.version = 2;
            josekiData.userSettings = {};
            josekiData.userSettings.allowUnrestrictedAutoStones = false;
            
            let jArray = getJosekiArray();
            for (const j of jArray) {
                for (let i = 0; i < j.moves.length; i++) {
                    if (j.moves[i] == PASS)
                        j.moves[i] = serMove(true, null, null, false);
                    else {
                        let m = parseMove(j.moves[i]);
                        j.moves[i] = serMove(false, m.x, m.y, m.isAuto);
                    }
                }
            }
        }

        if (!josekiData.version) {
            upgradeToPreVersion1();
            upgradeToVersion1();
        }

        if (josekiData.version < 2)
            upgradeToVersion2();
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
                        ensureBackwardsCompatibility();
                        initFunc();

                        // Nothing on server yet, pull local or init
                    } else if (response.status == 404) {
                        if (window.localStorage.getItem(STORAGE_KEY)){
                            josekiData = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
                            ensureBackwardsCompatibility();
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
                ensureBackwardsCompatibility();
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
        let relativeLogin = urlBase() + '/login/';
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

    function parseMove(moveStr) {
        let moveArr = moveStr.split(",");

        let move = {};
        
        if (moveArr[0] === 'p') {
            move.type = PASS;
            move.isAuto = "true" === moveArr[1];
        } else {
            move.type = "move";
            move.x = parseInt(moveArr[0]);
            move.y = parseInt(moveArr[1]);
            move.isAuto = "true" === moveArr[2];
        }
        
        return move;
    }

    function serMove(isPass, x,y, isAuto) {
        return isPass ? "p," + isAuto : x + "," + y + "," + isAuto;
    }

    function xyToGrid(x,y) {
        return [LETTERS[x], 19 - y];
    }

    function newBoard(element, width, section) {
        let b = new WGo.Board(element, {
            width: width,
            background: "",
            font: FONT,
            section: section,
        });

        if(gridOption){
            let adjust = 0.5;
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
            for (const moveStr of joseki.moves){
                let move = parseMove(moveStr);
                if (move.type == PASS) {
                    transformed.moves.push(moveStr);
                } else {
                    let [newx, newy] = transform(move.x, move.y);
                    let newMove = serMove(false, newx, newy, move.isAuto);

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
            let passStr = serMove(true, null, null, true);
            wb.moves.unshift(passStr);
            whiteBegins.push(wb);
        }

        let all = original.concat(ltr, ttb, diag, whiteBegins);

        // Filter joseki if board is small
        let filtered = [];
        if(smallBoard) {
            filtered = all.filter((x) => {
                let ret = true;
                for (const mv of x.moves){
                    let m = parseMove(mv);
                    if(m.type != PASS && (m.x < 9 || m.y > 9)) {
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

                //Determine board icon section
                
                //find min/max stones
                let minX = 18;
                let minY = 18;
                let maxX = 0;
                let maxY = 0;
                for (const move of joseki.moves) {
                    let m = parseMove(move);
                    if(m.type != PASS) {
                        minX = m.x < minX ? m.x : minX;
                        minY = m.y < minY ? m.y : minY;
                        maxX = m.x > maxX ? m.x : maxX;
                        maxY = m.y > maxY ? m.y : maxY;
                    }
                }

                // If we're close enough, include the corner 
                minX = minX < 5 ? 0 : minX -1
                minY = minY < 5 ? 0 : minY -1
                maxX = maxX > 13 ? 18 : maxX+1
                maxY = maxY > 13 ? 18 : maxY+1


                // Must be square, find side length and adjust min/max based on
                // aspect ratio
                let sqSide = Math.max(maxX - minX, maxY - minY)
                if(maxX-minX > maxY-minY && minY==0){
                    maxY = sqSide
                }else if(maxX-minX > maxY-minY && maxY==18){
                    minY = maxY - sqSide
                }else if(maxX-minX < maxY-minY && minX==0){
                    maxX = sqSide
                }else if(maxX-minX < maxY-minY && maxX==18){
                    minX = maxX - sqSide
                }

                // Translate min/max to board section
                let section = {top: minY, right: 18-maxX, bottom: 18-maxY, left: minX};
    
                // Create icon
                let existing = document.getElementById('joseki-group-' + groupIndex + '-content');
                existing.appendChild(josekiCont);
                let existingBoard = newBoard(menuBoardEl, SMALL_SIZE, section);
                let color = WGo.B;
                for (const move of joseki.moves) {
                    let m = parseMove(move);
                    if (m.type != PASS)
                        existingBoard.addObject({ x: m.x, y: m.y, c: color});
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
                for (const moveStr of moves){
                    let move = parseMove(moveStr);
                    if(move.type == PASS){
                        editPass(move.isAuto);
                    } else {
                        editAdd(move.x, move.y, move.isAuto);
                    }
                }
                document.getElementById('comment').value = currentEditJoseki.comment;
                josekiGroupSelectEl.value = groupIndex;
            }
        }

        setAllowAutoStone();
    }

    function handleEditStoneTypeChange() {
        let stoneType = document.getElementById('editStoneType')?.value;
        let isAuto = stoneType === 'automatic';
        editStoneTypeChange(isAuto);
    }

    function editStoneTypeChange(isAuto) {
        let passButton = document.getElementById('passButton');
        passButton.innerText = isAuto ? 'Automatic Pass' : 'Pass / Tenuki';
    }

    function setAllowAutoStone() {
        if (josekiData?.userSettings?.allowUnrestrictedAutoStones)
            return;

        // Setup/Auto stones can only start a joseki.  They cannot be after a non-automatic move.
        let allowAutoStones = true;
        if (currentEditJoseki.moves.some(m => !parseMove(m).isAuto))
            allowAutoStones = false;

        let stoneTypeElem = document.getElementById('editStoneType');
        stoneTypeElem.disabled = !allowAutoStones;
        
        if (!allowAutoStones) {
            stoneTypeElem.value = 'normal';
            editStoneTypeChange(false)
            stoneTypeElem.parentElement.setAttribute('data-tooltip', 'Setup stones can only start a joseki!');
        } else {
            stoneTypeElem.parentElement.removeAttribute('data-tooltip');
        }
    }

    function handleEditAdd(x,y) {
        let stoneType = document.getElementById('editStoneType')?.value;
        editAdd(x,y, stoneType === 'automatic');
    }

    function editAdd(x,y,isAuto) {
        clearGhostStone();
        let color = game.turn;
        let result = game.play(x,y,color);
        if (Array.isArray(result)) {
            currentEditJoseki.moves.push(serMove(false, x,y,isAuto));
            board.addObject({ x: x, y: y, c: color});

            if (!isAuto) {
                let moveNumber = currentEditJoseki.moves.reduce((acc, m) => acc + (parseMove(m).isAuto ? 0 : 1), 0);
                board.addObject({x: x, y: y, type: "LB", font: FONT, text: moveNumber});
            }

            board.removeObject(result);
            currentEditBoard.push(board.getState());
        }
        setAllowAutoStone();
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
        setAllowAutoStone();
    }

    function handleEditPass() {
        let stoneType = document.getElementById('editStoneType')?.value;
        editPass(stoneType === 'automatic');
    }

    function editPass(isAuto) {
        // If you are adding a pass, the pass can't be the first automatic or first normal move in the joseki.
        if( currentEditJoseki.moves.filter(m => parseMove(m).isAuto === isAuto).length > 0){
            clearGhostStone();
            currentEditJoseki.moves.push(serMove(true, null, null, isAuto));
            currentEditBoard.push(board.getState());
            game.pass();
        }
        setAllowAutoStone();
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
        mainBoard(handlePlayMove, true);
        setupLogin();
        loadScores();
        loadJosekiData(reset);
    }

    async function reset() {
        running = true;
        delay_ms = DELAY_INITIAL;
        displayScore();
        buildTree();
        mainBoard(handlePlayMove);

        game = new WGo.Game();

        // Update info/stats
        document.getElementById('pass').addEventListener('click', handlePassMove);
        document.getElementById('fail-card').className = 'hide-card';
        document.getElementById('success-card').className = 'hide-card';
        document.getElementById('pass-card').className = 'hide-card';
        document.getElementById('empty-point-card').className = 'hide-card';
        document.getElementById('pass-msg').className = 'd-none';
        clearBoardMsg();

        // Half the time, white starts
        if (Math.floor(Math.random() * 2)){
            await passMove(true);
        } else {
            await playAutomaticMove();
        }

        running = false;
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

    function pass() {
        game.pass();

        if (delay_ms !== DELAY_INITIAL) {
            document.getElementById('pass-card').className = "show-card";
            boardMsg('White Passed')
        }

        if (lastMove) {
            board.removeObject(lastMove);
        }
    }

    async function handlePlayMove(x, y) {
        if (running) return;
        running = true;
        delay_ms = DELAY_STANDARD;

        await playMove(x,y,false);

        running = false;
    }

    async function playMove(x, y, isAutomaticMove = false) {
        gtag("event", "move", {'event_category': 'joseki'});
        document.getElementById('pass-card').className = 'hide-card';
        clearBoardMsg();
        
        if (!isAutomaticMove)
            numPlayerMoves += 1;

        let move = serMove(false, x,y,isAutomaticMove);

        if (play(WGo.B, x,y)) {
            if (move in tree) {
                // Correct move
                tree = tree[move];
                await respond();
            } else if (numPlayerMoves === 1) {
                // can't fail on the first move
                emptyStartPoint();
                moves = 0;
            } else{
                fail(move); 
            }
        }
    }

    async function handlePassMove() {
        if (running) return;
        running = true;
        delay_ms = DELAY_STANDARD;

        await passMove();

        running = false;
    }

    async function passMove(isAutomaticMove = false) {
        if (!isAutomaticMove)
            numPlayerMoves += 1;

        let passMove = serMove(true, null, null, isAutomaticMove);

        if (passMove in tree) {
            game.pass();
            tree = tree[passMove];
            await respond();
        } else {
            fail(passMove);
        }
    }

    // displays each valid move as a "ghost" stone
    function displayGhostStones() {
        for (const correct of Object.keys(tree)) {
            let c = parseMove(correct);
            if (c.type == PASS) {
                document.getElementById('pass-msg').className = "d-block";
            } else {
                board.addObject({x: c.x, y:c.y, type: 'outline'});
            }
        }
    }

    function emptyStartPoint() {
        shutdown();
        boardMsg("No joseki yet!", 'black');
        document.getElementById('empty-point-card').className = "show-card";
        displayGhostStones()
    }

    function fail(move) {
        shutdown();
        boardMsg("Failed", 'red');
        document.getElementById('fail-card').className = "show-card";

        let m = parseMove(move);
        if(m.type != PASS){
            board.removeObjectsAt(m.x, m.y);
            board.addObject({ x: m.x, y: m.y, type: 'MA' });
        }
        displayGhostStones()
        updateScore(false);
        gtag("event", "practice", {'event_category': 'joseki', 'event_label': 'fail'});
    }

    function succeed(msg) {
        shutdown();
        boardMsg("Correct!", 'green');
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
                numPlayerMoves *
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

        numPlayerMoves = 0;
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
        document.getElementById('pass').removeEventListener('click', handlePassMove);
        board.removeEventListener('click', handlePlayMove);
        board.removeEventListener('mousemove', handleHover);
        board.addEventListener('click', reset);
    }

    // Make a reply if we can
    async function respond() {
        const possibleMoves = getPossibleMoves();
        if (possibleMoves.length > 0){
            await delay();
            const chosenMove = chooseRandomMove(possibleMoves);
            tree = tree[chosenMove];
            let m = parseMove(chosenMove);
            if (m.type == PASS){
                pass();
            } else {
                play(WGo.W, m.x,m.y);
            }

            if (await playAutomaticMove())
                return;
        }

        // Joseki is done if nothing left
        if(DONE in tree){
            succeed(tree[DONE]);
        }
    }

    function getPossibleMoves() {
        return Object.keys(tree).filter(move => move != DONE);
    }

    function chooseRandomMove(possibleMoves) {
        return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    }

    // If the next stone in the joseki is an automatic stone, play it automatically.
    async function playAutomaticMove() {
        let possibleMoves = getPossibleMoves();
        if (possibleMoves.length <= 0)
            return false;

        let m = parseMove(chooseRandomMove(possibleMoves));
        if (m.isAuto) {
            if (m.type === PASS) {
                await passMove(m.isAuto);
            } else {
                await delay();
                await playMove(m.x, m.y, m.isAuto);
            }
        }

        return m.isAuto;
    }

    function delay() {
        return new Promise(r => setTimeout(r, delay_ms));
    }
}
