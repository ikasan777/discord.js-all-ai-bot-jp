# にゃんこAIアシスタントDiscordボットにゃ！

このDiscordボットは、複数のAI（GPT、Gemini、Perplexity）を使用して質問に答え、自動応答機能を提供する猫語アシスタントにゃ。ユーザーごとに会話履歴を管理し、簡単に削除できる機能も備えているにゃ。全て公式APIを使っているから、安心して使ってほしいにゃ！

## 機能にゃ

1. **複数のAIサポートにゃ**: GPT-3.5(モデル変更したらGPT-4も)、Gemini、Perplexityの3つのAIモデルを使用できるにゃ。

2. **スラッシュコマンドにゃ**: 
   - `/gpt <prompt>`: GPT-3.5に質問するにゃ。
   - `/gemini <prompt>`: Geminiに質問するにゃ。
   - `/perplexity <prompt>`: Perplexityに質問するにゃ。
   - `/toggle <feature>`: 各AI機能のオン/オフを切り替えるにゃ。
   - `/set_auto_respond <channel> <ai>`: 特定のチャンネルで自動応答を設定するにゃ（管理者のみ）。
   - `/clear_history <ai>`: 指定したAI(全ても可)の会話履歴を削除するにゃ。

3. **会話履歴にゃ**: ユーザーごと、AIごとに会話履歴を保存し、文脈を考慮した応答が可能にゃ。

4. **自動応答にゃ**: 設定されたチャンネルでは、全てのメッセージに対して指定されたAIが自動的に応答するにゃ。

5. **リアクション機能にゃ**: 応答に対して再生成（🔄）や削除（🗑️）のリアクションが可能にゃ。

6. **猫語変換にゃ**: 全ての応答を猫語に変換するにゃ。これは変更可能にゃ！

## 対応AIチャットモデル一覧にゃ

1. OpenAI (GPT):
   - GPT-4
   - GPT-4 Turbo
   - GPT-3.5 Turbo

   すぐに使えるモデル名: `gpt-4`, `gpt-4-turbo-preview`, `gpt-3.5-turbo`

2. Google Gemini:
   - Gemini 1.5 Pro (プレビュー)
   - Gemini 1.0 Pro

   すぐに使えるモデル名: `gemini-pro`

3. Perplexity AI:
   - llama-3.1-sonar-huge-128k-online
   - sonar-small-chat
   - sonar-medium-chat
   - codellama-70b-instruct
   - mistral-7b-instruct
   - mixtral-8x7b-instruct

   すぐに使えるモデル名: `llama-3.1-sonar-huge-128k-online`

これらのモデルは、各AIサービスの公式ドキュメントに基づくチャットモデルにゃ。モデルの提供状況は頻繁に更新されるので、最新の情報は各サービスの公式ドキュメントで確認するのがいいにゃ。

## セットアップにゃ

1. 必要なパッケージをインストールするにゃ：
   ```
   npm install discord.js openai @google/generative-ai axios dotenv
   ```

2. `.env`ファイルを作成し、以下の環境変数を設定するにゃ：
   ```
   DISCORD_TOKEN=あなたのDiscordボットトークンにゃ
   OPENAI_API_KEY=あなたのOpenAI APIキーにゃ
   GEMINI_API_KEY=あなたのGemini APIキーにゃ
   PERPLEXITY_API_KEY=あなたのPerplexity APIキーにゃ
   ```

3. ボットを起動するにゃ：
   ```
   node index.js
   ```

## 使い方にゃ

1. スラッシュコマンドを使用して各AIに質問するにゃ。例：`/gpt 猫の鳴き声の種類は？`

2. 管理者は`/set_auto_respond`コマンドを使用して、特定のチャンネルで自動応答を設定できるにゃ。

3. 自動応答が設定されたチャンネルでは、全てのメッセージに対してAIが自動的に応答するにゃ。

4. AIの応答に対して🔄リアクションを付けると再生成、🗑️リアクションを付けると削除ができるにゃ。

5. `/clear_history`コマンドを使用して、特定のAIまたは全てのAIの会話履歴を削除できるにゃ。

## 注意点にゃ

- GPTとPerplexityは有料APIにゃ。使用量に注意するにゃ！
- このコードには、ぱいちゃGPT(GPT無料API)を使うようなコードはないにゃ。
- 自動応答機能を使用する際は、適切なチャンネルで設定するにゃ。
- 会話履歴はJSONファイルに保存されるため、定期的なバックアップを推奨するにゃ。
- 一応このコードを頑張ってselfbotに導入してるにゃ、期待せず待っててほしいにゃ。

## 安心して使ってほしいにゃ！何か問題があったら教えてにゃ！
