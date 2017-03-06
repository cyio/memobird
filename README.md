# memobird
咕咕机 Node.js SDK

## 安装

首先安装[graphicsmagick](http://www.graphicsmagick.org), 才能将JPG/PNG格式的图片转为咕咕机可打印的`BMP点位图`. Mac OS X：

    brew install graphicsmagick

然后使用Npm安装:

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
memobird.init()
  .then(() => memobird.printText('你好咕咕机'))
  .then(printcontentid => memobird.glance(printcontentid, 1000))
  .then(printflag => console.log('打印状态:', printflag));
```

监听打印状态

```javascript
memobird.init()
  .then(() => memobird.printImage('https://assets-cdn.github.com/images/modules/logos_page/GitHub-Mark.png'))
  .then(printcontentid => memobird.watch(printcontentid, 3000, 15000))
  .then(printflag => console.log('打印状态:', printflag));
```

## 参数

`glance`  方法可以延时一定时间后获取咕咕机打印状态。因为咕咕机打印需要时间，所以立即获取打印状态一定显示未打印，没有意义。参数按顺序依次为：

- `printcontentid`：打印内容的唯一ID（由printText或printImage返回）
- `delay`: 延时(多少毫秒后才获取打印状态)，默认1000

`watch` 方法可以监听打印状态。当打印内容大小变化很大时，难以预测需要的打印时间。`watch`方法可以隔一段时间获取一次打印状态，只有当打印状态为已完成或者监听时间超时时才终止。参数按顺序依次为：

- `printcontentid`：打印内容的唯一ID（由printText或printImage返回）
- `delay`: 监听频率(多少毫秒获取一次打印状态)，默认3000
- `maxDelay`: 监听超时(超出多长时间立即终止监听)，默认15000
