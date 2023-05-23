/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

const express = require('express');
const app = express();
app.use(express.json())
// ビューエンジンをejsにセットする
app.set('view engine', 'ejs');

app.use(express.static('public'));
app.use(express.urlencoded({extended: false}));




// Constants
const PORT = 3000;
const HOST = '0.0.0.0';

// App
// const app = express();
// app.get('/', (req, res) => {
// 	res.send('Hello remote world!\n');
// });

app.get('/', (req, res) => {
	res.render('top.ejs');
});

app.get('/game', (req, res) => {
  // game.ejsをレンダリングするなど、必要な処理を実行
  res.render('game.ejs'); // 必要ならば適切なテンプレート名に変更してください
});

// AIの返答処理を実装するファイルへのパス
const aiResponseRoutes = require('./ai_response');
app.post('/ai_response', (req, res) => {
  aiResponseRoutes.AI_response(req.body.message)
    .then(response => {
      // console.log(response);
      res.status(200).json({ response });
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    });
});


app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
