# 本ソフトウェアについて
本ソフトウェアはSPAなどのWebAPIを呼び出すクライアントの動作試験を行うために開発された、モックサーバです。  
リクエストされたURLに対してレスポンスデータを返却する動作を行います。

# ライセンスおよび免責
本ソフトウェアはMITライセンスで配布されています。
どのように利用しても構いませんが、すべて自己責任での利用となります。

# 本ソフトウェアの特徴
## インストール方法
```
npm install @chandla/api-mock-server
```
または
```
yarn add @chandla/api-mock-server
```
単純利用目的であればグローバルインストールを推奨します。


## 起動方法
インストールすると起動用コマンドがnode_modules/.binにインストールされます。  
package.json内のscriptであればコマンド単体での利用が可能です。

```
mock-server [options]
```
パスが通っていいない場合、
```
./node_modules/.bin/mock-server [options]
```
で起動することができます。


## コマンドラインオプション

| オプション | パラメタ | 機能 | 省略値 |
| --- | --- | --- | --- |
| -c | ファイルパス |本ソフトウェアの基本動作環境設定ファイルを指定します。 | なし |
| -p | ポート番号 | 本ソフトウェアのListenポート番号を指定します。 | 4010 |
| -r | ファイルパス | 本ソフトウェアの入力ファイル（routesファイルという）のパスを指定します。 | ./routes/routes.json |
| -s | ファイルパスまたはURL | 静的コンテンツ配信対象ディレクトリまたは、静的コンテンツを配信するサーバのURLを指定します。 | ./public |
| -x | なし | CORSヘッダを有効化します。プリフライトリクエストなどにも対応します。 | 

## 基本的な機能
### 1.最も基本的な使い方
最も基本的な使い方です。  
routesファイルに以下のように指定することでレスポンスを返却します。
```endpoints```の要素を複数設定することで複数のAPIエンドポイントに対応することができます。
#### <routes.json>
```jsonc
{
  // エンドポイントURLリスト
  "endpoinnts": [
    {
      // エンドポイントパターン（express準拠。パスパラメタ可）
      "pattern": "/aaa/bbb",
      // httpメソッド
      "method": "GET",
      // 応答データリスト（条件判定による応答データの変更が可能）
      "matches": [
        {
          // 応答データ(metadata)のパス。routes.jsonからの相対パス。
          // 直接値を記述することも可能。
          // デフォルト設定ではファイル読み込み
          "metadata": "responses/response_a/define.json"
        }
      ]
    }
  ]
}
```
#### <responses/response_a/define.json>
```jsonc
// 応答データそのものではなく、ヘッダやレスポンスステータスを記載する
{
  // レスポンスヘッダ
  "headers":[
    {
      "name": "Content-Type",
      "value": "application/json"
    },
    {
      "name": "Access-Control-Expose-Headers",
      "value": "X-Test-Header"
    },
    {
      "name": "X-Test-Header",
      "value": "test-header-value"
    },
    {
      "name": "X-Not-Exposed-Header",
      "value": "be not exposed"
    }
  ],
  // レスポンスに設定するcookie
  "cookies":[{
    "name": "sample-cookie",
    "value": "cookie-value"
  }],
  // レスポンスステータス
  "status": 200,
  // レスポンスデータファイルのパス
  // JSONであれば直接値を記述することも可能
  "data": "response_a.json"
}
```
#### <responses/response_a/response_a.json>
```jsonc
// comment
{
  // comment
  "aaa": "1234",
  "bbb": 98765
}
```
このようにroutesファイルを作成することで```/aaa/bbb```にGETメソッドのリクエストを受信した場合に```response_a.json```ファイルの内容を返却することができます。  
この時レスポンスヘッダに設定した```Content-Type```とファイルの内容がマッチしている必要があります。  
レスポンスデータはJSON形式以外の場合、ファイルの内容をそのまま出力するので、ダウンロードAPIのモックとしても利用可能です。

### 2.metadataを直接記述する
routes.jsonのコメントにも記載されていますが、```metadata```部を直接記述することも可能です。  
その場合、以下のように記述します。
#### <routes.json>
```jsonc
{
  // エンドポイントURLリスト
  "endpoinnts": [
    {
      // エンドポイントパターン（express準拠。パスパラメタ可）
      "pattern": "/aaa/bbb",
      // httpメソッド
      "method": "GET",
      // 応答データリスト（条件判定による応答データの変更が可能）
      "matches": [
        {
          // metadataを直接記述する場合はmetadataTypeをimmediateにする
          // 無指定の場合、fileが指定されたものとみなす
          "metadataType": "immediate",
          "metadata": {
            // レスポンスヘッダ
            "headers":[
              {
                "name": "Content-Type",
                "value": "application/json"
              }
            ],
            // レスポンスに設定するcookie
            "cookies":[{
              "name": "sample-cookie",
              "value": "cookie-value"
            }],
            // レスポンスステータス
            "status": 200,
            // レスポンスデータファイルのパス
            // JSONであれば直接値を記述することも可能
            "data": "response_a.json"
          }
        }
      ]
    }
  ]
}
```
### 3.レスポンスデータの内容を直接指定する
レスポンスデータ形式がJSONの場合、直接```metadata```の内容に含めることが可能です。  
```metadata```が独立したファイルであっても、routesファイルに直接記述されていても同様です。  
以下のように記述します。
#### <routes.json>
```jsonc
{
  // エンドポイントURLリスト
  "endpoinnts": [
    {
      // エンドポイントパターン（express準拠。パスパラメタ可）
      "pattern": "/aaa/bbb",
      // httpメソッド
      "method": "GET",
      // 応答データリスト（条件判定による応答データの変更が可能）
      "matches": [
        {
          // metadataを直接記述する場合はmetadataTypeをimmediateにする
          // 無指定の場合、fileが指定されたものとみなす
          "metadataType": "immediate",
          "metadata": {
            // レスポンスヘッダ
            "headers":[
              {
                "name": "Content-Type",
                "value": "application/json"
              }
            ],
            // レスポンスに設定するcookie
            "cookies":[{
              "name": "sample-cookie",
              "value": "cookie-value"
            }],
            // レスポンスステータス
            "status": 200,
            // レスポンスデータ
            // JSONであれば直接値を記述することも可能
            "datatype": "object", 
            "data": {
              // comment
              "aaa": "1234",
              "bbb": 98765
            }
          }
        }
      ]
    }
  ]
}
```
### 4.routesファイル変更時の動作
本ソフトウェアはroutesファイルの変更を自動検出します。  
リクエストを受信した際にファイルの変更有無をタイムスタンプでチェックを行い、変更されていれば再読み込みを行ってから処理を行います。

### 5.エンドポイントURLにプレフィックスを付加する
複数のAPIのエンドポイントURLの先頭部分が固定的な文字列である場合、各エンドポイントの```pattern```に同じ文字列を記載することになります。  
本ソフトウェアではURLのパスの共通部分を別途定義することができます。
#### <routes.json>
```jsonc
{
  // URLプレフィックスリスト（express準拠）
  // 単一の場合文字列1行でも可
  "prefix": [
    "/prefix00",
    "/prefix01"
  ],  
  // エンドポイントURLリスト
  "endpoinnts": [
    {
      // エンドポイントパターン（express準拠。パスパラメタ可）
      "pattern": "/aaa/bbb",
      // httpメソッド
      "method": "GET",
      // 応答データリスト（条件判定による応答データの変更が可能）
      "matches": [
        {
          // 応答データ(metadata)のパス。routes.jsonからの相対パス。
          // 直接値を記述することも可能。
          // デフォルト設定ではファイル読み込み
          "metadata": "responses/response_a/define.json"
        }
      ]
    }
  ]
}
```
このように定義することで、```/prefix00/aaa/bbb```と```/prefix01/aaa/bbb```を同一のエンドポイントとして処理することができます。

### 6.リクエストの内容によって応答を切り替える
本ソフトウェアではリクエストデータの内容によってレスポンスデータを切り替えることができます。  
```matches```の要素に```conditions```を加えることで条件判定が動作します。  
```conditions```の内容はjavascriptの式として評価されます。
結果はbooleanとしてtrueであればマッチしたものとみなします。  
そのため空文字列や０やnullやundefinedを結果とする式はアンマッチとみなされます。

#### <routes.json>
```jsonc
{
  // エンドポイントURLリスト
  "endpoinnts": [
    {
      // エンドポイントパターン（express準拠。パスパラメタ可）
      "pattern": "/aaa/bbb",
      // httpメソッド
      "method": "GET",
      // 応答データリスト（条件判定による応答データの変更が可能）
      "matches": [
        {
          "metadata": "responses/response_a/define.json",
          // 条件式を指定リクエストパラメタのAAA項目が'BBB'であればマッチ
          "conditions": "data.AAA==='BBB'"
        },
        {
          // 条件式がない場合は強制的にマッチ
          "metadata": "responses/response_b/define.json"
        }
      ]
    }
  ]
}
```
評価に利用できる値は以下のオブジェクトに格納されています。
| オブジェクト名 | 説明 |
| --- | --- |
| data | パスパラメタ、クエリパラメタ、ボディのJSONデータをマージしたmapです |
| headers | リクエストヘッダの内容をセットしたmapです |
| cookies | cookieに設定された値をセットしたmapです |

## 応用編
### 1.静的コンテンツの配信
SPAの開発中は```ng serve```や```next```コマンドによってSPAのコンテンツ配信を行いますが、ビルド後の状態でテストを行うためにはwebサーバが必要になります。  
本ソフトウェアはwebサーバとしての機能を持っており、```-s```オプションを指定することで、任意のディレクトリをドキュメントルートとしたコンテンツ配信を行うことができます。  
コンテンツ配信とwebAPI機能の両方を持つことで同一オリジンでのSPAの動作確認を行うことができます。

### 2.静的コンテンツのリバースプロキシ
本番リリースされた環境の資産でサーバ側の動作だけを変更して動作確認したいケースに利用します。  
静的コンテンツのファイルパスの代わりに、資産を配信しているwebサーバのURLを指定することで、静的資産を別のwebサーバから取得することができます。  
https?で始まる文字列を指定した場合、webサーバを指定したものとみなします。  
```HTTP_PROXY```や```HTTPS_PROXY```環境変数が指定されている場合、プロキシサーバを通過することも可能です。（認証付きプロキシには未対応）

### 3.CORS対応
単体のwebAPIのモックとして利用する場合、クロスオリジンでの呼び出しとなります。  
そのため、CORSヘッダやプリフライトリクエストに対応する必要があります。
-xオプションを利用することで対応可能です。

### 4.共通的なレスポンスヘッダ付与
全リクエストに対して共通的なレスポンスヘッダを付与したい場合、routesファイルに指定を行います。
#### <routes.json>
```jsonc
{
  // 共通レスポンスヘッダの付与
  "defaultHeaders": [
    {
      "name": "x-def-header",
      "value": "def-header-value"
    }
  ],
  // エンドポイントURLリスト
  "endpoinnts": [
    {
      // エンドポイントパターン（express準拠。パスパラメタ可）
      "pattern": "/aaa/bbb",
      // httpメソッド
      "method": "GET",
      // 応答データリスト（条件判定による応答データの変更が可能）
      "matches": [
        {
          "metadata": "responses/response_a/define.json",
          // 条件式を指定リクエストパラメタのAAA項目が'BBB'であればマッチ
          "conditions": "data.AAA==='BBB'"
        },
        {
          // 条件式がない場合は強制的にマッチ
          "metadata": "responses/response_b/define.json"
        }
      ]
    }
  ]
}
```
すべてのレスポンスに同一内容のヘッダを付与したい場合に限りますが、個々の```metadata```に記述する必要がなくなります。

### 5.endpointsの分割
routesファイルの```endpoints```は別ファイルとすることが可能です。  
また、複数のファイルを指定することも可能です。  
これにより設定情報だけが異なるようなバリエーションを作成する際、省力化を図ることができます。

#### <routes.json> endpointsを他ファイルにする場合
```jsonc
{
  // 共通レスポンスヘッダの付与
  "defaultHeaders": [
    {
      "name": "x-def-header",
      "value": "def-header-value"
    }
  ],
  // エンドポイントファイル指定
  "endpointsType": "file",
  // エンドポイントファイルパス
  "endpointsPath": "endpoints.json"
}
```
#### <endpoints.json>
```jsonc
{
  // エンドポイントURLリスト
  "endpoinnts": [
    {
      // エンドポイントパターン（express準拠。パスパラメタ可）
      "pattern": "/aaa/bbb",
      // httpメソッド
      "method": "GET",
      // 応答データリスト（条件判定による応答データの変更が可能）
      "matches": [
        {
          "metadata": "responses/response_a/define.json",
          // 条件式を指定リクエストパラメタのAAA項目が'BBB'であればマッチ
          "conditions": "data.AAA==='BBB'"
        },
        {
          // 条件式がない場合は強制的にマッチ
          "metadata": "responses/response_b/define.json"
        }
      ]
    }
  ]
}
```

#### <routes.json> endpointsを指定ディレクトリに含まれるjsonファイルにする場合
```jsonc
{
  // 共通レスポンスヘッダの付与
  "defaultHeaders": [
    {
      "name": "x-def-header",
      "value": "def-header-value"
    }
  ],
  // エンドポイントファイル指定
  "endpointsType": "dir",
  // エンドポイントディレクトリパス
  "endpointsPath": "endpoints"
}
```
指定されたディレクトリをスキャンし、JSONファイルを探して内容に含まれる```endpoints```を取り込みます。

### 6.レスポンスデータの編集
レスポンスデータ形式がJSONの場合に限られますが、スクリプトを組み込むことでレスポンスデータの編集が可能です。  
これによりデータの折り返しや加工が可能となります。
スクリプトは```scripts```で指定したディレクトリに配置する必要があります。
呼び出しは「モジュール名：関数名」で記述します。

#### <routes.json>
```jsonc
{
  // 共通レスポンスヘッダの付与
  "defaultHeaders": [
    {
      "name": "x-def-header",
      "value": "def-header-value"
    }
  ],

  // スクリプト配置ディレクトリの指定
  "scripts": "./scripts",

  // デフォルトスクリプトの名前。「モジュール名:関数名」の形式で指定する。
  // すべてのレスポンスで動作します。
  "defaultScript": "sample1.js:aaa",

  // エンドポイントURLリスト
  "endpoinnts": [
    {
      // エンドポイントパターン（express準拠。パスパラメタ可）
      "pattern": "/aaa/bbb",
      // httpメソッド
      "method": "GET",
      // 応答データリスト（条件判定による応答データの変更が可能）
      "matches": [
        {
          "metadata": "responses/response_a/define.json",
          // 条件式を指定リクエストパラメタのAAA項目が'BBB'であればマッチ
          "conditions": "data.AAA==='BBB'"
        },
        {
          // 条件式がない場合は強制的にマッチ
          "metadata": "responses/response_b/define.json"
        }
      ]
    }
  ]
}
```
#### <responses/response_a/define.json>
```jsonc
// 応答データそのものではなく、ヘッダやレスポンスステータスを記載する
{
  // レスポンスヘッダ
  "headers":[
    {
      "name": "Content-Type",
      "value": "application/json"
    },
    {
      "name": "Access-Control-Expose-Headers",
      "value": "X-Test-Header"
    },
    {
      "name": "X-Test-Header",
      "value": "test-header-value"
    },
    {
      "name": "X-Not-Exposed-Header",
      "value": "be not exposed"
    }
  ],
  // レスポンスに設定するcookie
  "cookies":[{
    "name": "sample-cookie",
    "value": "cookie-value"
  }],
  // レスポンスステータス
  "status": 200,
  // レスポンスデータファイルのパス
  // JSONであれば直接値を記述することも可能
  "data": "response_a.json",

  // 編集用関数の呼び出し
  "edit": "sample1.js:bbb"
}
```
#### <scripts/sample1.js>
```javascript
module.exports = {
  aaa: (req, res, state) => {
    console.log('the aaa.');
    if(state['aaa']){
      state['aaa'] ++;
    }else{
      state['aaa'] = 1;
    }
    console.log('value of the aaa = ' + state['aaa']);
  },
  bbb: (req, res, state) => {
    console.log('the bbb');
    // リクエストのAAAをレスポンスのbbbにセット
    res.data.bbb = req.data.AAA;
  }
};
```
デフォルトスクリプト、```metadata```の```edit```の順番で処理されます。
編集関数の引数は以下の通りです。

| 引数名 | 説明 |
| --- | --- |
| req | リクエストデータ |
| req.headers | リクエストヘッダを格納したmap |
| req.cookies | リクエストのcookieを格納したmap |
| req.data | リクエストボディのJSON、パスパラメタ、クエリパラメタをマージしたオブジェクト |
| res | レスポンスデータ |
| res.status | レスポンスステータスコード |
| res.data | レスポンスデータのオブジェクト。レスポンスデータがJSONとして解釈可能な場合のみ有効 |
| res.headers | レスポンスヘッダを格納したmap |
| res.cookies | レスポンスのcookieを格納したmap |
| res.rawData | JSONとして解釈できない場合のレスポンスデータ |
| state | グローバルな記憶域として利用可能なmap。プロセス起動中は内容が保持される |

### 7.バリデーション
設定が非常に複雑となりますが、OpenAPI Specification V3相当のバリデーションを行うことが可能です。  
付属ツールのyaml2routesを利用するとOpenAPIのYAMLファイルから簡単に生成することができます。  
これはバリデーションを行うためのスキーマ情報を保持する必要があるためです。  
バリデーションには```openapi-request-validator```を利用しています。
バリデーション用のスキーマには```OpenAPIRequestValidatorArgs```オブジェクトを使用します。  
```endpoint```の```validatorArgs```に設定を行うことでバリデーションが有効となります。  
```OpenAPIRequestValidatorArgs```の詳細は[こちら](https://www.npmjs.com/package/openapi-request-validator)を参照。

# routesファイルのリファレンス
## routesファイル(Routes型)

| キー名 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| prefix | string \| string[] | - | エンドポイントURLのプレフィックスを指定します。配列で複数指定可能です。 |
| defaultHeaders | Header[] | - | デフォルトで付与するレスポンスヘッダを指定します。 |
| scripts | string | - | 利用するスクリプトファイルの入ったディレクトリを指定します。 |
| defaultScript | string | - | デフォルトで実行するスクリプトを指定します。「module.js:funcname」のようにスクリプトファイル名と関数名をコロンでつないで指定します。 |
| endpointsType | "file" \| "dir" \| "immediate" | - | ```endpoints```の定義方法を指定します。省略すると```"immediate"```が指定されたもとみなします。 |
| endpointsPath | string | - | ```endpointsType```で```file```または```dir```を指定した場合に読み込み対象のファイルパスとして指定します。 |
| endpoints | Endpoint[] | - | エンドポイント定義を記述します。 |
| customProps | Record\<any\> | - | 任意の情報を記述できるmapです。ツール用の情報を記述することを想定しています。 |
| version | string | - | routesファイルのバージョンを記述します。ツールでの利用を想定しています。 |

## Record\<T\>型
文字列をキー、T型を値として持つmapです。具体的には以下のような定義です。
```
interface {[key: string]: T}
```

## Headers型
| キー名 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| name | string | 〇 | ヘッダ名を指定します。 |
| value | string | 〇 | ヘッダ値を指定します。 |

## Endpoint型
| キー名 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| pattern | string | 〇 | エンドポイントURLのパターンを記述します。express形式に準拠しており、パスパラメタは「:パスパラメタ名」で記述します。 |
| method | "GET" \| "POST" \| "PUT" \| "DELETE" \| "PATCH" | 〇 | HTTPメソッド名を記述します。 |
| matches | Pattern[] | 〇 | 応答パターンの配列を指定します。 |
| customProps | Record\<any\> | - | 任意の情報を記述できるmapです。ツール用の情報を記述することを想定しています。 |

## Pattern型
| キー名 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| conditions | string | - | この```Pattern```を利用するかどうかを判定するためのjavascript式を記述します。<br>"data.param1===\'AAAA\' \|\| data.param2===\'BBBB\'"のように記述します。<br>この項目を省略すると条件にヒットしたものとみなされ、以後の```Pattern```は評価されません。 |
| metadataType | "file" \| "immediate" | - | ```metadata```の指定方法を記述します。```file```を指定するとファイルからの読み込みになります。<br/>省略時は```file```が指定されたものとみなします。 |
| metadata | string \| Metadata | 〇 | ```metadataType```に```file```を指定した場合、```metadata```を記述したファイル名として使用します。<br/>```immediate```を指定した場合には```Metadata```型オブジェクトが記述されているものとみなします。 |
| customProps | Record\<any\> | - | 任意の情報を記述できるmapです。ツール用の情報を記述することを想定しています。 |

## Metadata型
| キー名 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| status | number | - | レスポンスステータスコードを指定します。省略時は```200```または```204```が指定されたものとみなします。 |
| headers | Header[] | - | 付与するレスポンスヘッダを指定します。 |
| cookies | Header[] | - | 付与するcookieを指定します。 |
| datatype | "file" \| "value" \| "object" | - | dataの型を指定します。省略時は```file```が指定されたものとみなします。 |
| data | string \| Record\<any\> | - | レスポンスボディの内容を指定します。```datatype```の指定により設定内容が変わります。<br/>・```file```指定の場合：レスポンスデータファイルへのパスを指定します。相対パスの場合、routesファイルからの相対パスとなります。<br/>・```value```指定の場合：レスポンスデータに内容をそのままセットします。<br/>・```object```指定の場合：レスポンスデータオブジェクトを記述します。 |
| edit | string |  - | レスポンスデータ編集のために実行するスクリプトを指定します。<br/>「module.js:funcname」のようにスクリプトファイル名と関数名をコロンでつないで指定します。 |
| customProps | Record\<any\> | - | 任意の情報を記述できるmapです。ツール用の情報を記述することを想定しています。 |

# 動作環境設定ファイルのリファレンス
```-c```オプションで指定するファイルの内容です。
| キー名 | 型 | 必須 | 説明 |
| --- | --- | --- | --- |
| port | number | - | 本ソフトウェアが使用するポート番号を指定します。<br/>省略時は```4010```を使用します。 |
| routesPath | string | - | ```-r```オプションを使用しない場合に読み込むroutesファイルのパスを指定します。<br/>省略時は"```"./routes/routes.json"```です。 |
| staticContents | string | - | ```-s```オプションを使用しない場合に静的コンテンツ配信の対象とするディレクトリです。<br/>省略時は```"./public"```です。 |
| enableCors | boolean | - | ```-x```オプションがない場合のCORS対応の有無を指定します。<br/>省略時は```false```(なし)です。

# 付属ツール
本ソフトウェアに付属するツールを説明します。

## yaml2routes
OpenAPI Specification v3形式のYAMLファイルをもとにroutesファイルを作成するツールです。    
スキーマに```example```が指定されている場合、その値を利用してレスポンスデータを作成します。指定されていない場合、データ型に応じた値をレスポンスデータに設定します。

### 起動方法
```
yaml2routes -i {入力パス} -o {出力ファイル名} [options]
```
### コマンドラインオプション

| オプション | パラメタ | 機能 | 省略値 |
| --- | --- | --- | --- |
| -i | ファイルパス | 必須パラメタです。<br/>入力となるYAMLファイルのパスまたはディレクトリを指定します。<br/>ディレクトリの場合スキャンを行いYAMLファイルを検索します。この場合、ディレクトリに含まれるすべてのYAMLファイルが読み込み対象となります。 | なし |
| -o | ファイルパス | 必須パラメタです。<br/>変換結果を出力するファイル名を指定します。 | なし |
| -p | 文字列 | 変換結果のdataの内容を出力するディレクトリ名を指定します。<br/>指定しない場合、```-o```で指定したファイルと同じディレクトリに出力されます。 | なし |
| -s | ファイルパス | 出力するroutesファイルのひな形となるファイルを指定します。 | なし |
| -w | なし | 本オプションを指定すると、バリデーション用のスキーマ情報を出力します。<br/>出力ファイルサイズが大きくなります。 | なし |
| -r | 数字 | レスポンスデータの設定度合いを指定します。<br/>0：可能な限りすべての項目に値を設定します。<br/>1：必須項目のみ値を設定します。<br/>2：必須項目のみ値を設定します。配列指定の場合には空配列を設定します。 | 0 |
