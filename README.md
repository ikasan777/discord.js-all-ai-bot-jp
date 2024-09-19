
# AI搭載Discord Bot

このDiscord botは、複数のAIモデル（GPT、Gemini、Perplexity）を利用して、チャット応答や自動応答機能を提供するにゃ。

## 主な機能

1. 複数のAIモデル（GPT、Gemini、Perplexity）との対話
2. スラッシュコマンドによる簡単な操作
3. 会話履歴の保存と利用
4. リアクションによるメッセージの再生成と削除
5. 特定チャンネルでの自動応答機能
6. 管理者による機能のオン/オフ切り替え

## コマンド一覧

- `/gpt <質問>`: GPTモデルに質問するにゃ
- `/gemini <質問>`: Geminiモデルに質問するにゃ
- `/perplexity <質問>`: Perplexityモデルに質問するにゃ
- `/toggle <機能名>`: 指定した機能のオン/オフを切り替えるにゃ
- `/set_auto_respond <チャンネル> <AI>`: 指定したチャンネルで自動応答を設定するにゃ（管理者のみ）

## 特徴

- JSON形式での会話履歴の永続化保存
- ユーザーごと、AIモデルごとの会話コンテキスト維持
- リアクションによる簡単な操作（メッセージの再生成と削除）
- 管理者限定の自動応答設定機能

## セットアップ

1. 必要なライブラリをインストールするにゃ：
   ```
   npm install discord.js openai @google/generative-ai axios dotenv
   ```

2. `.env`ファイルを作成し、以下の環境変数を設定するにゃ：
   ```
   DISCORD_TOKEN=あなたのDiscordボットトークン
   OPENAI_API_KEY=あなたのOpenAI APIキー
   GEMINI_API_KEY=あなたのGemini APIキー
   PERPLEXITY_API_KEY=あなたのPerplexity APIキー
   ```

3. ボットを起動するにゃ：
   ```
   node index.js
   ```

## 注意事項

- APIの使用制限に注意するにゃ
- 自動応答機能を使用する際は、適切なチャンネルで設定するにゃ
- 会話履歴はJSONファイルに保存されるため、定期的なバックアップを推奨するにゃ

## ライセンス

このプロジェクトはMITライセンスの下で公開されているにゃ。詳細は`LICENSE`ファイルを参照するにゃ。
