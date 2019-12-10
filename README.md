
# Overview

前バージョンのタイピングゲームをフルスクリプト版に改編。

漢字・カタカナ・数字にも対応（多分）

# Environment

## OS

* Windows10 <64bit>

## Tool

* npm 5.6.0
* Python 3.6.4

## Python Module

* numpy 1.14.2
* flask 0.12.2
* pykakasi 1.0

# SetUp ＆ Run

0. Python, Nodejsをインストール

* [Nodejs](https://nodejs.org/ja/)
* [Python](https://www.python.org/)

**以下、アプリケーションディレクトリで実行（cd [クローンしてきた名前]）**

1. パッケージをインストール

```
npm install
```

2. ビルド

```
npm run build
```

3. Pythonのモジュールをインストール

```
pip install flask （Anaconda使ってる人は不要）
pip install pykakasi
```

4. 課題のテキストを用意

```/pylib/resource/q?.txt```にべちゃ張り。<br>
改行は勝手に処理するので、見やすい位置で改行して大丈夫（空行はまずいかも）<br>
1番目の問題はq0.txt, 2番目の問題はq1.txt, ...

```
# pylib/resource/q0.txt

課題のテキストを適当に張り付ける
```


5. 課題のテキストをコンパイル

[ファイル名]の所はq0とかq1

```
# 個別にコンパイル
python compile.py [ファイル名]

# 全ファイル一気にコンパイル
python compile.py --all
```

6. コンパイルされたファイルを確認

```/pylib/production/q?.txt```にコンパイルしたファイルと同名のファイルが新しくできている（はず）<br>
漢字の所に読み仮名が振られているから、確認する。<br>
間違っている所があれば、手で直す。<br>
**コンパイルは最初の一回のみでok**

```
# pylib/production/q0.txt

課題（かだい）のテキストを適当（てきとう）に張（は）り付（つ）ける
```

7. サーバーを起動

```
python server.py
```

8. ブラウザからアクセス

```
http://localhost:8000
```

# license

以下のサイトより変換コードを拝借。
[Hatena Blog ローマ字→平仮名変換関数 #javascript](http://c4se.hatenablog.com/entry/20100330/1269906760)


# Update

## 2019/08/21

* 終了を押すたびにデータが保存されるバグを修正
* コンパイル時に、文節に漢字しか含まれないとうまくいかないバグを修正
* 出題ランダムモードを追加
* 全テキストファイルを一気にコンパイルするコマンドを追加
```
python compile.py --all
```

## 2019/0823

* 間違えたときにビープ音が鳴るように設定
* 修正：時間制限を外すとエラーが起きる

### ビープ音の変更

beep.jsのsound_base64を書き換えればok

#### 具体的な手順（Windowsの場合）

1. 音素材を用意（.wav, .mp3, ...等）
2. コマンドプロンプトを開く
3. ```base64 ファイル名``` を実行
4. 出力される文字列（超長い）をコピー
5. beep.jsの``` String row`~~` ``` の~~の部分に貼り付け