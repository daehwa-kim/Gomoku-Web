var length = 15;
var playerId = [1, 2];
var playerName = ["Tester", "CPU"];
var playerColor = [1, 2];
var lastRow = -1;
var lastCol = -1;
var turn = 0;
var playMode = 0;
var debug = false;

/***** Gameplay *****/
function put(stone, player, turnOver) {
    var row = rowOf(stone);
    var col = columnOf(stone);
    if(typeof turnOver == "undefined") turnOver = true;

    if (stoneExists(row, col))
    {
        getStone(row, col).style.backgroundImage = ""; // getImageByColor(playerColor[turn]);
        stoneSetPlayer(row, col, player);
        if (lastRow != -1) getStone(lastRow, lastCol).innerHTML = "";
        getStone(row, col).innerHTML = "<img src='images/Indicator.png' width='24px' height='24px'>";
        lastRow = row;
        lastCol = col;

        checkWin(row, col, player);

        if (turnOver && turn != null) turn = (turn == 0) ? 1 : 0;
    }
}

function resetGame()
{
    for (var row = 0; row < length; row++)
    {
        for (var col = 0; col < length; col++)
        {
            stoneErase(row, col);
        }
    }
}

function checkWin(headRow, headCol, player)
{
    var win = false;
    var count = 5;

    for (var dir = 0; dir <= 3; dir++)
    {
        var v = (dir != 0) ? 1 : 0;
        var h = (dir != 1) ? ( (dir == 3) ? -1 : 1 ) : 0;

        for (var i = 0; i < count; i++)
        {
            var row = headRow - (v * i);
            var col = headCol - (h * i);

            if (isComplete(row, col, dir, playerColor[player]))
            {
                win = true;
                break;
            }
        }
    }

    if (win)
    {
        //alert(playerName[player] + " Wins!");
        ShowDialog(playerName[player] + " Wins!");
        turn = null;
    }
}

function isComplete(headRow, headCol, dir, color)
{
    var isComplete = true;
    var count = 5;
    var v = (dir != 0) ? 1 : 0;
    var h = (dir != 1) ? ( (dir == 3) ? -1 : 1 ) : 0;

    for (var i = 0; i < count; i++)
    {
        var row = headRow + (v * i);
        var col = headCol + (h * i);

        if (!stoneExists(row, col) || getStone(row, col).getAttribute("stoneColor") != color)
        {
            isComplete = false;
            break;
        }
    }

    return isComplete;
}
/***** Gameplay *****/


/***** Stone Functions *****/
function stoneExists(row, col)
{
    var exists = false;
    if (row >= 0 && row < length && col >= 0 && col < length) exists = true;
    return exists;
}

function stoneIsEmpty(row, col)
{
    return getStone(row, col).getAttribute("stoneColor") == "0";
}

function stoneIsAllowedFor(row, col, color)
{
    var isAllowed = true;

    if (color == 2)
    {
        isAllowed = true;
    }

    return isAllowed;
}

function stoneSetPlayer(row, col, player)
{
    getStone(row, col).setAttribute("stoneOwner", playerId[player]);
    getStone(row, col).setAttribute("stoneColor", playerColor[player]);
}

function stoneErase(row, col)
{
    getStone(row, col).setAttribute("stoneOwner", "");
    getStone(row, col).setAttribute("stoneColor", "0");
    getStone(row, col).style.backgroundImage = "";
    getStone(row, col).innerHTML = "";
}
/***** Stone Functions *****/


/***** Interface *****/
function stoneClick(stone)
{
    var row = rowOf(stone);
    var col = columnOf(stone);

    if (stoneIsEmpty(row, col) && turn != null &&
        (turn == 0 || playMode == 2) &&
        stoneIsAllowedFor(row, col, playerColor[turn]))
    {
        if (playMode == 0)
        {
            put(getStone(row, col), turn);
            var random = Math.floor(Math.random() * 1000) + 500;
            setTimeout(aiAction, random);
        }
        else
        {
            put(getStone(row, col), turn);
        }
    }
}

function stoneMouseOver(stone)
{
    if (stone.getAttribute("stoneColor") == "0" && (turn == 0 || playMode == 2))
    {
        if (playerColor[turn] == 1)
        {
            stone.style.backgroundImage = "url('images/ImgStoneBlack_Transparent.png')";
        }
        else if (playerColor[turn] == 2)
        {
            stone.style.backgroundImage = "url('images/ImgStoneWhite_Transparent.png')";
        }
    }
}

function stoneMouseLeave(stone)
{
    stone.style.backgroundImage = "";
}

function resetClick()
{
    if (playMode == 0)
    {
        resetGame();

        if (playerColor[0] == 1)
        {
            playerColor[0] = 2;
            playerColor[1] = 1;

            put(getStone(7, 7), 1);
            turn = 0;
        }
        else
        {
            playerColor[0] = 1;
            playerColor[1] = 2;

            turn = 0;
        }
    }
    else if (playMode == 1)
    {

    }
    else
    {
        resetGame();
        turn = 0;
    }
}

function aiAction()
{
    if (turn == 1)
    {
        put(aiPick(), 1);
    }
}
/***** Interface *****/


/***** Bases *****/
function getStone(row, col)
{
    var stone = document.getElementById(row.toString() + "+" + col.toString());
    return stone;
}

function rowOf(stone)
{
    var stoneId = stone.getAttribute("id");
    var row = stoneId.substring(0, stoneId.indexOf("+"));
    return row;
}

function columnOf(stone)
{
    var stoneId = stone.getAttribute("id");
    var col = stoneId.substring(stoneId.indexOf("+") + 1);
    return col;
}

function getImageByColor(color) {
    var image = "";
    if (color == 1) image = "url('images/ImgStoneBlack.png')";
    else if (color == 2) image = "url('images/ImgStoneWhite.png')";
    return image;
}
/***** Bases *****/


/***** AI *****/
function aiPick()
{
    var outputs = [];
    var highest = 0;

    aiScan();

    // Get stones with the highest weight
    for (var row = 0; row < length; row++)
    {
        for (var col = 0; col < length; col++)
        {
            if (parseInt(getStone(row, col).getAttribute("stoneAiWeight")) > highest)
            {
                highest = parseInt(getStone(row, col).getAttribute("stoneAiWeight"));

                for (var i = outputs.length; i > 0; i--)
                {
                    outputs.pop();
                }

                outputs.push(getStone(row, col));
            }
            else if (parseInt(getStone(row, col).getAttribute("stoneAiWeight")) == highest)
            {
                outputs.push(getStone(row, col));
            }
        }
    }

    if (outputs.length > 0)
    {
        for (var i = outputs.length - 1; i >= 0; i--)
        {
            var row = rowOf(outputs[i]);
            var col = columnOf(outputs[i]);
            if (!stoneIsAllowedFor(row, col, playerColor[1]) || !stoneIsEmpty(row, col))
            {
                outputs.splice(i, 1);
            }
        }
    }

    aiResetWeights();

    var random = Math.floor(Math.random() * outputs.length);

    return (outputs.length > 0) ? outputs[random] : null;
}

function aiScan()
{
    for (var count = 2; count <= 6; count++)
    {
        for (var row = 0; row < length; row++)
        {
            for (var col = 0; col < length; col++)
            {
                for (var dir = 0; dir <= 3; dir++)
                {
                    aiExamineSubset(row, col, count, dir, playerColor[1], false);
                    aiExamineSubset(row, col, count, dir, playerColor[0], true);
                }
            }
        }
    }

    if (document.getElementById("chkDebug").checked)
    {
        for (var row = 0; row < length; row++)
        {
            for (var col = 0; col < length; col++)
            {
                getStone(row, col).innerHTML = (parseInt(getStone(row, col).getAttribute("stoneAiWeight")) > 0) ? getStone(row, col).getAttribute("stoneAiWeight") : "";
            }
        }
    }
}

function aiExamineSubset(headRow, headCol, length, dir, color, opponentSide)
{
    var own = 0, opponent = 0, empty = 0;
    var v = (dir != 0) ? 1 : 0;
    var h = (dir != 1) ? ( (dir == 3) ? -1 : 1 ) : 0;
    var items = [];
    var rowFirstEmpty = -1, colFirstEmpty = -1, rowLastEmpty = -1, colLastEmpty = -1;
    var attackWeight = 1;
    var defenseWeight = 1;

    if (opponentSide) defenseWeight = 2;
    else attackWeight = 2;

    for (var i = 0; i < length; i++)
    {
        var row = headRow + (v * i);
        var col = headCol + (h * i);

        if (stoneExists(row, col) && stoneIsEmpty(row, col))
        {
            empty++;
            if (rowFirstEmpty == -1)
            {
                rowFirstEmpty = row;
                colFirstEmpty = col;
            }
            rowLastEmpty = row;
            colLastEmpty = col;
        }
        else if (stoneExists(row, col) && getStone(row, col).getAttribute("stoneColor") == color)
        {
            own++;
        }
        else
        {
            opponent++;
        }

        items.push( stoneExists(row, col) ? getStone(row, col).getAttribute("stoneColor") : -1 );
    }

    if (stoneExists(rowFirstEmpty, colFirstEmpty) && stoneIsEmpty(rowFirstEmpty, colFirstEmpty))
    {
        if (length == 5 && own == 4 && empty == 1 && !opponentSide) // Force Attack
        {
            aiAddWeight(rowFirstEmpty, colFirstEmpty, 2000);
        }
        else if (length == 5 && own == 4 && empty == 1 && opponentSide) // Force Defend
        {
            aiAddWeight(rowFirstEmpty, colFirstEmpty, 900);
        }
        else if (length == 6 && own == 3 && empty == 2 &&
            ( (items[0] != playerColor[1] && items[0] != 0) ^ (items[length - 1] != playerColor[1] && items[length - 1] != 0) ) )
        {
            if (items[0] == 0 && items[1] == 0)
            {
                var itemRow = headRow + (v * 1);
                var itemCol = headCol + (h * 1);
                aiAddWeight(rowFirstEmpty, colFirstEmpty, 30 * attackWeight);
                aiAddWeight(itemRow, itemCol, 30 * attackWeight);
            }
            else if (items[length - 1] == 0 && items[length - 2] == 0)
            {
                var itemRow = headRow + (v * (length - 2));
                var itemCol = headCol + (h * (length - 2));
                aiAddWeight(rowLastEmpty, colLastEmpty, 30 * attackWeight);
                aiAddWeight(itemRow, itemCol, 30 * attackWeight);
            }
            else if (items[0] == 0)
            {
                aiAddWeight(rowFirstEmpty, colFirstEmpty, 60 * attackWeight);
            }
            else if (items[length - 1] == 0)
            {
                aiAddWeight(rowLastEmpty, colLastEmpty, 60 * attackWeight);
            }
        }
        else if (length == 5 && own == 3 && empty == 2 &&
        !(items[0] == 0 && items[1] == 0) && !(items[length - 1] == 0 && items[length -2] == 0) &&
        !(items[1] == 0 && items[2] == 0) && !(items[2] == 0 && items[3] == 0) )
        {
            if (items[0] == 0 && items[length - 1] == 0)
            {
                aiAddWeight(rowFirstEmpty, colFirstEmpty, 60 * (attackWeight + 2));
                aiAddWeight(rowLastEmpty, colLastEmpty, 60 * (attackWeight + 2));
            }
            else
            {
                aiAddWeight(rowFirstEmpty, colFirstEmpty, 60 * attackWeight);
                aiAddWeight(rowLastEmpty, colLastEmpty, 60 * attackWeight);
            }

            if (items[2] == 0 && (items[1] == 0 || items[3] == 0))
            {
                var itemRow = headRow + (v * 2);
                var itemCol = headCol + (h * 2);
                aiAddWeight(itemRow, itemCol, 15 * attackWeight);
            }
        }
        else if (length == 5 && own == 3 && empty == 1 &&
            ( (items[0] != playerColor[1] && items[0] != 0) || (items[length - 1] != playerColor[1] && items[length - 1] != 0) ) )
        {
            aiAddWeight(rowFirstEmpty, colFirstEmpty, 1);
        }
        else if (length == 5 && own == 2 && empty == 3)
        {
            aiAddWeight(rowFirstEmpty, colFirstEmpty, 3);
            aiAddWeight(rowLastEmpty, colLastEmpty, 3);
        }
        else if (length == 5 && own == 1 && empty >= 3)
        {
            aiAddWeight(rowFirstEmpty, colFirstEmpty, 1);
            aiAddWeight(rowLastEmpty, colLastEmpty, 1);
        }
        else if (length == 3 && own == 2)
        {
            aiAddWeight(rowFirstEmpty, colFirstEmpty, 1);
        }
        else if (length == 2 && own == 1)
        {
            aiAddWeight(rowFirstEmpty, colFirstEmpty, 0);
        }
    }

}

function aiAddWeight(row, col, weight)
{
    var stoneAiWeight = parseInt(getStone(row, col).getAttribute("stoneAiWeight"));
    getStone(row, col).setAttribute("stoneAiWeight", stoneAiWeight + weight);
}

function aiResetWeights()
{
    for (var row = 0; row < length; row++)
    {
        for (var col = 0; col < length; col++)
        {
            getStone(row, col).setAttribute("stoneAiWeight", "0");
        }
    }
}
/***** AI *****/


/***** HTML *****/
function ShowDialog(message) {
    document.getElementById("dialog_back").style.display = "block";
    //document.getElementsByTagName("main")[0].style.filter="blur(5px)";

    if (message == "fineuploader") {
        document.getElementById("dialog").innerHTML = "<iframe src='FineUploader' style='display: inline-block; width: 100%; height: 100%; border: none;'> </iframe>";
        document.getElementById("dialog").style.width = "90vw";
        document.getElementById("dialog").style.maxWidth = "600px";
        document.getElementById("dialog").style.height = "300px";
        document.getElementById("dialog").style.marginTop = "25vh";
    }
    else
    {
        document.getElementById("dialog").innerHTML = message;
    }
}

function debugSwitch() {
    if (debug)
    {
        debug = false;
        document.getElementById("board").style.backgroundImage = "";
    }
    else
    {
        debug = true;
        document.getElementById("board").style.backgroundImage = "url('images/BoardDebug.png')";
    }
}