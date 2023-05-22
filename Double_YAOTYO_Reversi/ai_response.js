async function AI_response (message) {
	require('dotenv').config();
	let API_KEY = process.env.OPENAI_API_KEY;

	// messageがない場合
	if (!message) return

	const response = await fetch('https://api.openai.com/v1/completions', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${API_KEY}`,
		},
		body: JSON.stringify({
			'model': 'text-davinci-003',
			'prompt': message,
			"max_tokens": 30, // 出力される文章量の最大値（トークン数） max:4096
			"temperature": 1, // 単語のランダム性 min:0.1 max:2.0
			"top_p": 1, // 単語のランダム性 min:-2.0 max:2.0
			"frequency_penalty": 0.0, // 単語の再利用 min:-2.0 max:2.0
			"presence_penalty": 0.6, // 単語の再利用 min:-2.0 max:2.0
			"stop": ["]"] // 途中で生成を停止する単語
		}),
	})

    const data = await response.json();

	console.log(data.choices[0].text.trim());

    return data.choices[0].text.trim();
}

module.exports = { AI_response };