# node-memobird
咕咕机SDK

## 安装

首先安装`graphicsmagick`，才能将JPG/PNG格式的图片转为咕咕机可打印的`BMP点位图`。参考本项目依赖的包[gm](https://github.com/aheckmann/gm)。Mac OS X：

    brew install graphicsmagick

然后使用Npm安装：

    npm install memobird


## 使用

初始化

```javascript
const Memobird = require('Memobird');

const memobird = new Memobird({
  ak: 'xxxxxxxxxxxxxxxx',
  memobirdID: 'xxxxxxxx',
  useridentifying: 'xxx',
});
```

打印文字

```javascript
memobird.init()
  .then(() => memobird.printText('你好咕咕机'))
```

打印图片

```javascript
memobird.init()
  .then(() => memobird.printImage('http://7xrs2s.com1.z0.glb.clouddn.com/5388545BF2D3F99643AFE22BE8C87B8A.jpg'))
```

获取打印状态

```javascript
// glance方法：
// 第一个参数：打印内容的唯一ID（由printText或printImage返回）
// 第二个参数：延时到多少毫秒后才获取打印状态，默认1000
memobird.init()
  .then(() => memobird.printText('你好咕咕机'))
  .then(printcontentid => memobird.glance(printcontentid, 1000))
  .then(printflag => console.log('打印状态:', printflag));
```

监听打印状态

```javascript
// watch方法：打印成功或超时时终止并返回打印状态
// 第一个参数：打印内容的唯一ID（由printText或printImage返回）
// 第二个参数：监听频率(多少毫秒获取一次打印状态)，默认3000
// 第三个参数：监听超时(超出多长时间立即终止监听)，默认15000
memobird.init()
  .then(() => memobird.printImage('http://7xrs2s.com1.z0.glb.clouddn.com/5388545BF2D3F99643AFE22BE8C87B8A.jpg'))
  .then(printcontentid => memobird.watch(printcontentid, 3000, 15000))
  .then(printflag => console.log('打印状态:', printflag));
```
