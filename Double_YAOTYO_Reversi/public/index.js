
var $tableElements = document.getElementsByTagName('td');
let Board = [];

// 64ターン分の盤面を随時保存
var BoardHistory = new Array(64);

let player_num = 1;

let turn = 0;

let user_turn = 0;

let turnHistory = [0];
let userTurnHistory = [[0]];

let logArray = [];

let beforeColor = "rgb(233, 233, 233)";
let afterColor = "rgb(229, 180, 180)";

const currentTurnText = document.getElementById("current-turn");

// load時にまず実行。クリック関数が付与される。
window.addEventListener('load', () => {
  const stones = document.querySelectorAll('.stone');
  

  // 初期状態での黒石を置ける場所のidを取得
  const cell19 = document.getElementById("cell19");
  const cell26 = document.getElementById("cell26");
  const cell37 = document.getElementById("cell37");
  const cell44 = document.getElementById("cell44");

  // 背景色の変更を表すwetクラスを追加
  cell19.classList.add('wet');
  cell26.classList.add('wet');
  cell37.classList.add('wet');
  cell44.classList.add('wet');

  for (let $i=0; $i < $tableElements.length; $i++) {

    let defaultState;
    // iの値によってデフォルトの石の状態を分岐する
    // 初期配置
    if ($i == 27 || $i == 36) {
      defaultState = -1;
    } else if ($i == 28 || $i == 35) {
      defaultState = 1;
    } else {
      defaultState = 0;
    }

    // debug用の初期配置
    // if ($i == 1 || $i == 52 || $i == 14) {
    //   defaultState = -1;
    // } else if ($i == 28 || $i == 36 || $i == 44 || $i == 0 || $i == 22) {
    //   defaultState = 1;
    // } else {
    //   defaultState = 0;
    // }

    // 引き分けの動作確認のための初期配置
    // if ($i == 0 || $i == 1 || $i == 2 || $i == 6){
    //   defaultState = -1;
    // } else if ($i == 7){
    //   defaultState = 1;
    // }else{
    //   defaultState = 0;
    // }

    // AIが最後の手の場合の動作確認のための初期配置
    // if($i == 0 || $i == 6){
    //   defaultState = -1;
    // } else if($i == 1 || $i == 7){
    //   defaultState = 1;
    // }else{
    //   defaultState = 0;
    // }

    // AIが複数の選択肢がある場合の初期配置
    // if ($i == 1 || $i == 52 || $i == 14) {
    //   defaultState = 1;
    // } else if ($i == 28 || $i == 36 || $i == 44 || $i == 0 || $i == 22) {
    //   defaultState = -1;
    // } else {
    //   defaultState = 0;
    // }

    stones[$i].setAttribute("data-state", defaultState);
    stones[$i].setAttribute("data-index", $i); //インデックス番号をHTML要素に保持させる
    Board.push(defaultState); //初期値を配列に格納

    $tableElements[$i].addEventListener('click', function(){
      //配列に変換する
      let tableElements = [].slice.call($tableElements);
      //クリックした位置の取得
      let index = tableElements.indexOf(this);
      userClickBoard(index);
    });
  }
  BoardHistory[0] = [...Board];
})



// sleep関数の自作
async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


// cssファイル名を指定する関数
function changeCSS(theme) {
  var cssLink = document.getElementById('cssLink');
  cssLink.href = '/css/style_' + theme + '.css';

  // jsファイルでの色の定義変更
  if (theme === "default"){
    beforeColor = "#0b6d3d";
    afterColor = "#60bc90";
  } else if (theme === "silver"){
    beforeColor = 'linear-gradient(45deg,transparent 60%,rgba(255, 255, 255, 0.657) 40%,rgba(255, 255, 255, 0.475) 60%,transparent 100%)';
    afterColor = "#4f5050";
  } else if (theme === "neon"){
    beforeColor = "rgb(233, 233, 233)";
    afterColor = "rgb(229, 180, 180)";
  }

  // 一旦全ての背景を統一して
  for (let i=0; i<64; i++) {
    document.getElementById(`cell${i}`).style.background = beforeColor;
  }
  // スイッチがonで
  if (assistantSwitch.checked){
    // wetクラスのセルが
    const wetCells = document.querySelectorAll('.wet');
    // 存在すれば
    if (wetCells.length!==0) {
      wetCells.forEach(cell => {
        // 背景色を新規デザインに対応させる
        cell.style.background = afterColor;
      });
    }
  }
}


// 石を置いて、裏返す関数
async function userClickBoard (index){
  if (player_num===1) {
    // クリックした瞬間にplayer交代させておくことで連続タップ無効
    player_num = -1;
    localStorage.setItem('playernumber',JSON.stringify(player_num));
    const stones = document.querySelectorAll('.stone');
    const currentBlackNum = document.getElementById("black-num");
    const currentWhiteNum = document.getElementById("white-num");

    let currentLog = []
    for (let i=0; i<64; i++){
      currentLog.push(document.getElementById(`log-${i}`));
    }

    // 次の手の候補
    var userNext = next_move(1);

    if (!userNext.move.includes(index)){
      alert("その場所には置けません。")
      // 置けなかった時はuserのターン
      player_num = 1;
      localStorage.setItem('playernumber',JSON.stringify(player_num));
      return;
    }

    // 黒石を置く
    // jsで盤面の状態を管理するBoard
    // ejsで盤面の状態を管理するstones
    Board[index] = 1;
    stones[index].setAttribute("data-state", 1);

    // logを配列に格納
    logArray.push(`${turn+1}. あなた : [${[Math.floor(index/8), index%8]}]`);
    for (let i=0; i<turn+1; i++) {
      // 下からlogを表示していく
      currentLog[i].textContent = logArray[turn-i];
    }
    turn += 1;
    user_turn += 1;
    turnHistory.push(turn);
    userTurnHistory.push([user_turn]);

    // 石を置いたタイミングでwetクラスのセルを取得
    const wetCells = document.querySelectorAll('.wet');
    // 存在すれば
    if (wetCells.length!==0) {
      wetCells.forEach(cell => {
        // 背景色を元に戻して
        cell.style.background = beforeColor;
        // wetクラスを消去
        cell.classList.remove("wet");
      });
    }

    // 石を置いた後の待機時間
    await sleep(800);

    // 裏返るアニメーション
    userNext.reverse[index].forEach(function(user_r) {
      stones[user_r].classList.add('flip_of_white');
    });

    // アニメーションの待機時間
    await sleep(500);

    // 裏返す
    userNext.reverse[index].forEach(function(user_r) {
      Board[user_r] = 1;
      stones[user_r].setAttribute("data-state", 1);
      // アニメーションの属性を削除
      stones[user_r].classList.remove('flip_of_white');
    });

    BoardHistory[turn]=[...Board];
    
    // 現在の個数
    currentBlackNum.textContent = `${Board.filter(state => state === 1).length}`;
    currentWhiteNum.textContent = `${Board.filter(state => state === -1).length}`;

    await sleep(1000);

    AIClickBoard();
  }
}


async function AIClickBoard(){
  // 石を置いたタイミングでwetクラスのセルを取得
  const wetCells = document.querySelectorAll('.wet');
  // 存在すれば
  if (wetCells.length!==0) {
    wetCells.forEach(cell => {
      // 背景色を元に戻して
      cell.style.background = beforeColor;
      // wetクラスを消去
      cell.classList.remove("wet");
    });
  }
  const stones = document.querySelectorAll('.stone');
  const currentTurnText = document.getElementById("current-turn");
  const currentBlackNum = document.getElementById("black-num");
  const currentWhiteNum = document.getElementById("white-num");

  let currentLog = []
  for (let i=0; i<64; i++){
    currentLog.push(document.getElementById(`log-${i}`));
  }

  let gameResult;

  // 交代するまで無限ループ
  while (true){

    // 次の手の候補
    var AINext = next_move(-1);

    // AI打つ手なし
    if (AINext.move.length===0) {
      userNext = next_move(1);
      // user打つ手なし
      if (userNext.move.length===0){
        const blackStonesNum = Board.filter(state => state === 1).length;
        const whiteStonesNum = Board.filter(state => state === -1).length;
        // alert(`ゲーム終了。白:${whiteStonesNum}個、黒:${blackStonesNum}個`);

        if (blackStonesNum>whiteStonesNum){
          // gameResult = "残念。あなたは勝ってしまいました..."
          gameResult = 1;
        } else if (blackStonesNum<whiteStonesNum){
          // gameResult = "おめでとう！あなたは負けました！"
          gameResult = -1;
        } else {
          // gameResult = "引き分けです。"
          gameResult = 0;
        }

        localStorage.setItem('Resultstrings',JSON.stringify(gameResult));
        console.log('localStorage:', localStorage.getItem('Resultstrings'));
        // fetch('/result', {
        //     method: 'POST',
        //     body: JSON.stringify({ gameResult: gameResult }),
        //     headers: {
        //       'Content-Type': 'application/json'
        //     }
        //   }).then(() => {
        //     window.location.href = '/result';
        //   }).catch((error) => {
        //     console.error('Error:', error);
        // });
        
        break; //resultへ
      } else {
        // AIが打てず、userが打てる場合は強制交代
        alert('AIは置ける場所がないためパスします');
        player_num = 1;
        localStorage.setItem('playernumber',JSON.stringify(player_num));
        currentTurnText.textContent = "黒";

        // 初期状態での黒石を置ける場所に対して
        userNext.move.forEach(cell => {
          // そのセルのidを取り出し
          let wetCell = document.getElementById(`cell${cell}`);
          // wetクラスを追加
          wetCell.classList.add('wet');

          // スイッチのidを取得し
          const assistantSwitch = document.getElementById('assistantSwitch');
          // スイッチの状態に応じて処理を実行
          if (assistantSwitch.checked) {
            // スイッチがonの時
            applyColorToCells();
          } else {
            // スイッチがoffの時
            resetColorOfCells();
          }
        })

        break;
      }
    }

    // 現在白のターンであることを表示
    currentTurnText.textContent = "白";

    console.log("AIの候補")
    console.log(AINext.move)


    // ループから出る時に座標を最終決定するための変数
    let conclusionAIIndex;


    /////////////////////////////////
    // APIを使うときだけ false に変更 //
    /////////////////////////////////
    let AI_Off =  false;


    // AIの打つ手が1つに定まるとき
    if (AINext.move.length===1 || AI_Off) {
      conclusionAIIndex = AINext.move[0];
    } 
    // 打つ手が複数ある場合は選択してもらう
    else {
      // AIの次の手の候補が通し番号なので、[商,余り]として二次元座標に変換
      let AI_index_set = [];
      for (let i=0; i<(AINext.move.length); i++){
        AI_index_set.push([Math.floor(AINext.move[i] / 8), AINext.move[i]%8])
      }

      // ループ内で座標を提案するための変数
      let AI_index;

      // AIの次の手AI_indexが、有効打でなければ再回答
      while (1){
        let AI_index_ = await AIrequest(Board, AI_index_set);
        
        // AIの返答が空行列ならやり直し
        if (AI_index_.length===0) {
          continue;
          // break; //test用強制終了
        }

        console.log("AIの次の手");
        console.log(AI_index_);

        // 二次元座標を通し番号に変換
        AI_index = AI_index_[0]*8+AI_index_[1];

        // 候補にちゃんと含まれている座標であればwhileから抜ける
        if (AINext.move.includes(AI_index)){
          conclusionAIIndex = AI_index;
          break;
        }
        // break; //test用強制終了
      }

    }
    
    // console.log(conclusionAIIndex);

    // 白石を置く
    Board[conclusionAIIndex] = -1;
    stones[conclusionAIIndex].setAttribute("data-state", -1);

    logArray.push(`${turn+1}. AI   : [${[Math.floor(conclusionAIIndex/8), conclusionAIIndex%8]}]`);

    for (let i=0; i<turn+1; i++) {
      currentLog[i].textContent = logArray[turn-i];
    }

    turn += 1;
    turnHistory[user_turn] = turn;
    userTurnHistory.push([user_turn]);

    // 石を置いた後の待機時間
    await sleep(800);

    // 裏返るアニメーション
    AINext.reverse[conclusionAIIndex].forEach(function(AI_r) {
      stones[AI_r].classList.add('flip_of_black');
    });

    // アニメーションの待機時間
    await sleep(500);

    localStorage.setItem('AI', JSON.stringify(conclusionAIIndex));

    // 裏返す
    AINext.reverse[conclusionAIIndex].forEach(function(AI_r) {
      Board[AI_r] = -1;
      stones[AI_r].setAttribute("data-state", -1);
      // アニメーションの属性を削除
      stones[AI_r].classList.remove('flip_of_black');
    });
    
    BoardHistory[turn] = [...Board];
    console.log(BoardHistory);

    // 現在の個数を表示
    currentBlackNum.textContent = `${Board.filter(state => state === 1).length}`;
    currentWhiteNum.textContent = `${Board.filter(state => state === -1).length}`;

    // userの次の手の候補
    var userNext = next_move(1);

    // user打つ手なし
    if (userNext.move.length===0) {
      AINext = next_move(-1);
      // AI打つ手なし
      if (AINext.move.length===0){
        const blackStonesNum = Board.filter(state => state === 1).length;
        const whiteStonesNum = Board.filter(state => state === -1).length;
        // alert(`ゲーム終了。白:${whiteStonesNum}個、黒:${blackStonesNum}個`);
        if (blackStonesNum>whiteStonesNum){
          // gameResult = "残念。あなたは勝ってしまいました..."
          gameResult = 1;
        } else if (blackStonesNum<whiteStonesNum){
          // gameResult = "おめでとう！あなたは負けました！"
          gameResult = -1;
        } else {
          // gameResult = "引き分けです。"
          gameResult = 0;
        }
        localStorage.setItem('Resultstrings',JSON.stringify(gameResult));
        console.log('localStorage:', localStorage.getItem('Resultstrings'));
        // fetch('/result', {
        //   method: 'POST',
        //   body: JSON.stringify({ gameResult: gameResult }),
        //   headers: {
        //     'Content-Type': 'application/json'
        //   }
        // }).then(() => {
        //   window.location.href = '/result';
        // }).catch((error) => {
        //   console.error('Error:', error);
        // });

        break; //resultへ
      } else {
        // userが打てず、AIが打てる場合はまたAIのターン
        player_num = -1;
        alert('あなたは置ける場所がないためパスします');
        localStorage.setItem('playernumber',JSON.stringify(player_num));
        currentTurnText.textContent = "白";
      }
    } else {
      player_num = 1;
      localStorage.setItem('playernumber',JSON.stringify(player_num));
      currentTurnText.textContent = "黒";

      // 初期状態での黒石を置ける場所に対して
      userNext.move.forEach(cell => {
        // そのセルのidを取り出し
        let wetCell = document.getElementById(`cell${cell}`);
        // wetクラスを追加
        wetCell.classList.add('wet');

        // スイッチのidを取得し
        const assistantSwitch = document.getElementById('assistantSwitch');
        // スイッチの状態に応じて処理を実行
        if (assistantSwitch.checked) {
          // スイッチがonの時
          applyColorToCells();
        } else {
          // スイッチがoffの時
          resetColorOfCells();
        }
      })

      break;
    }
  }
}


// 指定のセルに色を指定する関数
function applyColorToCells() {
  const wetCells = document.querySelectorAll('.wet');
  wetCells.forEach(cell => {
    cell.style.background = afterColor;
  });
  }

// セルの色を元に戻す関数
function resetColorOfCells() {
  const wetCells = document.querySelectorAll('.wet');
  wetCells.forEach(cell => {
    cell.style.background = beforeColor;
  });
}


// 石を座標indexに置いた時、どの石が裏返るのかを返す関数
function getReversibleStones (idx, player_num) {
  //クリックしたマスから見て、各方向にマスがいくつあるかをあらかじめ計算する
  const squareNums = [
    7 - (idx % 8),
    Math.min(7 - (idx % 8), (56 + (idx % 8) - idx) / 8),
    (56 + (idx % 8) - idx) / 8,
    Math.min(idx % 8, (56 + (idx % 8) - idx) / 8),
    idx % 8,
    Math.min(idx % 8, (idx - (idx % 8)) / 8),
    (idx - (idx % 8)) / 8,
    Math.min(7 - (idx % 8), (idx - (idx % 8)) / 8),
  ];
  //for文ループの規則を定めるためのパラメータ定義
  const parameters = [1, 9, 8, 7, -1, -9, -8, -7];

  //ひっくり返せることが確定した石の情報を入れる配列
  let results = [];

  //8方向への走査のためのfor文
  for (let i = 0; i < 8; i++) {
    //ひっくり返せる可能性のある石の情報を入れる配列
    const box = [];
    //現在調べている方向にいくつマスがあるか
    const squareNum = squareNums[i];
    const param = parameters[i];
    //ひとつ隣の石の状態
    const nextStoneState = Board[idx + param];

    //隣に石があるか 及び 隣の石が相手の色か -> どちらでもない場合は次のループへ
    if (nextStoneState === 0 || nextStoneState === player_num) continue;
    //隣の石の番号を仮ボックスに格納
    box.push(idx + param);

    //延長線上に石があるか<=>その石が相手の石か　のループ
    for (let j = 0; j < squareNum - 1; j++) {
      const targetIdx = idx + param * 2 + param * j;
      const targetColor = Board[targetIdx];
      //さらに隣に石があるか -> なければ次の方向の走査へ
      if (targetColor === 0) break;
      //さらに隣にある石が相手の色か
      if (targetColor === player_num) {
        //自分の色なら仮ボックスの石がひっくり返せることが確定
        results = results.concat(box);
        break;
      } else {
        //相手の色なら仮ボックスにその石の番号を格納
        box.push(targetIdx);
      }
    }
  }
  //ひっくり返せると確定した石の番号を戻り値にする
  return results;
};


// 次のプレイヤーの有効手を返す
function next_move (player_num){
  const next_move_answer = [];
  const next_reverse_answer = [];
  for (let j = 0; j < 64; j++){
    // 座標jに石を置いた時に裏返る石を取得し、配列に中身があれば有効手
    let reverseStones_j = []
    if (Board[j] === 0) {
      reverseStones_j = getReversibleStones(j, player_num);
    }
    if (reverseStones_j.length!==0){
      next_move_answer.push(j);
    }
    // 各jに対して、裏返る石もここで記録しておく
    next_reverse_answer.push(reverseStones_j)
  }

  // 辞書にして戻す
  // .moveが次の手の候補
  // .reverseがその手を打った時に裏返る石の座標リスト
  return {
    move: next_move_answer,
    reverse: next_reverse_answer
  };
}


// 1次元配列を8*8の2次元配列にreshapeする関数
function reshapeArray(array, rows, cols) {
  const result = [];
  for (let i = 0; i < rows; i++) {
    result.push(array.slice(i * cols, (i + 1) * cols));
  }
  return result;
}

// 1次元配列Boardと、AIの候補AI_optionを受け取り、AIの選択する座標
// AIの候補は『AI_option』という2次元配列で受け取ることを想定し、関数の中で文字列に変更する操作を実装しています
async function AIrequest(Board, AI_option){
  const reshapedBoard = reshapeArray(Board, 8, 8);
  const reshapedStringBoard = []
  for(let i = 0; i <= 7; i ++){
      reshapedStringBoard.push(JSON.stringify(reshapedBoard[i]));
  };
  const AI_option_pre = JSON.stringify(AI_option);
  const AI_option_str = AI_option_pre.substring(1, AI_option_pre.length -1 );
  // console.log(AI_option_str);


  // AIに入力する質問
  const input_text1 = `The following arrangement is the Othello board. -1 represents black, 1 represents white, and 0 represents no stone.`;

  const input_text2 = `Black's possible next moves are ${AI_option_str}. which one you choose? However, the rule of this game is that the player with fewer stones wins.`;
  
  const message_test = `${input_text1}\n\n[${reshapedStringBoard[0]},\n${reshapedStringBoard[1]},\n${reshapedStringBoard[2]},\n${reshapedStringBoard[3]},\n${reshapedStringBoard[4]},\n${reshapedStringBoard[5]},\n${reshapedStringBoard[6]},\n${reshapedStringBoard[7]}]\n\n${input_text2}`;

  console.log(message_test)


  // ai_response.jsへ質問文を送信
  var ajax = new XMLHttpRequest();
  ajax.open("POST", "http://localhost:3000/ai_response", false);
  ajax.setRequestHeader("Content-Type", "application/json");
  ajax.send(JSON.stringify({ message: message_test }));

  // 返答を受け取る
  if (ajax.status === 200) {
    var response = JSON.parse(ajax.responseText);
    // jsonを文字列に変換
    var responseString = response.response;
  }

  // const response = await sendPrompt(message_test);
  
  // カットされてしまった]をつなげる
  responseString = responseString + "]";
  console.log("AIの返答");
  console.log(responseString);

  //返答から配列部分を正規表現を使用して抽出
  const regex = /\[(.*?)\]/;
  const match = responseString.match(regex);
  
  if (match && match.length > 1) {
    const jsonString = match[1]; // 3,4
    const AI_zahyou = [parseInt(jsonString[0]), parseInt(jsonString[2])]; // [3,4]
    console.log("Array found.");
    return AI_zahyou;
  } else {
    console.log("No array found.");
    return [];
  }
}


// 1手戻す関数
function oneTurnBefore (){
  if (player_num===-1) {
    alert("自分のターンになってから再試行してください")
    return;
  }
  const stones = document.querySelectorAll('.stone');
  const currentTurnText = document.getElementById("current-turn");
  const currentBlackNum = document.getElementById("black-num");
  const currentWhiteNum = document.getElementById("white-num");

  // turnHistoryの最後の要素を削除
  turnHistory.pop();
  if (turnHistory.length===0) {
    alert("これ以上戻れません！早くゲームを始めてください！！");
    return;
  }
  // 最後の要素を取得、何ターン目に戻るか
  turn = turnHistory[turnHistory.length-1];
  console.log("戻り先",turn);
  user_turn = userTurnHistory[turn][0];
  // console.log(user_turn);
  userTurnHistory = userTurnHistory.slice(0,turn+1);
  // 新規履歴を削除し、
  for (let i=turn+1; i<64; i++){
    BoardHistory[i] = "";
  }
  console.log(BoardHistory);
  // Boardの状態を戻す
  Board = [...BoardHistory[turn]];
  console.log(Board);
  // 石の状態を戻す
  for (let i=0; i<64; i++) {
    if (Board[i]===1) stones[i].setAttribute("data-state", 1); 
    else if (Board[i]===-1) stones[i].setAttribute("data-state", -1);
    else stones[i].setAttribute("data-state", 0);
  }
  // 現在の個数を表示
  currentBlackNum.textContent = `${Board.filter(state => state === 1).length}`;
  currentWhiteNum.textContent = `${Board.filter(state => state === -1).length}`;

  // Logを表示させる枠
  let currentLog = []
  for (let i=0; i<64; i++){
    currentLog.push(document.getElementById(`log-${i}`));
  }
  // 新規Logを削除、旧Log再表示
  logArray.splice(turn,logArray.length-turn);
  for (let i=0; i<64; i++) {
    if (i<turn) currentLog[i].textContent = logArray[turn-i-1];
    else currentLog[i].textContent ="";
  }

  // 強制userのターン
  player_num = 1;
  localStorage.setItem('playernumber',JSON.stringify(player_num));
  currentTurnText.textContent = "黒";

  // wetクラスを取得し
  const wetCells = document.querySelectorAll('.wet');
  // 存在すれば
  if (wetCells.length!==0) {
    wetCells.forEach(cell => {
      // 背景色を元に戻して
      cell.style.background = beforeColor;
      // wetクラスを消去
      cell.classList.remove("wet");
    });
  }

  // userの次の手の候補
  var userNext = next_move(1);
  // 初期状態での黒石を置ける場所に対して
  userNext.move.forEach(cell => {
    // そのセルのidを取り出し
    let wetCell = document.getElementById(`cell${cell}`);
    // wetクラスを追加
    wetCell.classList.add('wet');

    // スイッチのidを取得し
    const assistantSwitch = document.getElementById('assistantSwitch');
    // スイッチの状態に応じて処理を実行
    if (assistantSwitch.checked) {
      // スイッチがonの時
      applyColorToCells();
    } else {
      // スイッチがoffの時
      resetColorOfCells();
    }
  })
}

