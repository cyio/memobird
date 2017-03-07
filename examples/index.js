const Memobird = require('../');

const memobird = new Memobird({
  ak: 'xxxxxxxxxxxxxxxx',
  memobirdID: 'xxxxxxxx',
  useridentifying: 'xxx',
});

memobird.init()
  .then(() => {
    const printcontentid = memobird.printText('你好咕咕机!');
    return printcontentid;
  })
  .then((printcontentid) => {
    console.log('打印内容的唯一ID:', printcontentid);
    // 3000毫秒后获取打印状态
    const printflag = memobird.glance(printcontentid, 3000);
    return printflag;
  })
  .then((printflag) => {
    if (printflag === 1) {
      console.log('打印状态:', '已打印');
    } else {
      console.log('打印状态:', '未打印');
    }
  })
  .then(() => {
    const printcontentid = memobird.printImage('https://assets-cdn.github.com/images/modules/logos_page/GitHub-Mark.png');
    return printcontentid;
  })
  .then((printcontentid) => {
    console.log('打印内容的唯一ID:', printcontentid);
    // 每3000毫秒获取一次打印状态，如果显示未打印则继续获取，当获取到结果为已打印的状态或总用时超出15000毫秒，则终止并返回结果
    const printflag = memobird.watch(printcontentid, 3000, 15000);
    return printflag;
  })
  .then((printflag) => {
    if (printflag === 1) {
      console.log('打印状态:', '已打印');
    } else {
      console.log('打印状态:', '未打印，监听超时');
    }
  })
  .catch(error => console.log('打印出错了：', error));
