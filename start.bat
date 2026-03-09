@echo off
REM この bat ファイルが置かれているフォルダへ移動
cd /d "%~dp0"
cd ..
cd yt_rank_homepage

REM Python の簡易HTTPサーバー起動（ポート8000）
python -m http.server 8000

REM サーバー終了後にウィンドウを閉じない
pause
