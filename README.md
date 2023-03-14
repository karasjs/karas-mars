# karas-mars
Mars component for karas.

---
karas接入@alipay/mars组件。

[![NPM version](https://img.shields.io/npm/v/karas-mars.svg)](https://npmjs.org/package/karas-mars)

## Install
```
tnpm install karas
tnpm install karas-mars
```
仅限蚂蚁内网使用。

## Usage

```jsx
import Mars from 'karas-mars';

karas.render(
  <canvas width="720" height="720">
    <Mars style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: 200,
            height: 200,
            translateX: '-50%',
            translateY: '-50%',
          }}
          url={'https://gw.alipayobjects.com/os/gltf-asset/mars-cli/ELCOQKVUKUIO/-994158386-08237.json'}
          playbackRate={1} // 播放速率
          autoPlay={true} // 自动播放
    />
  </canvas>
);
```

### method
* pause() 暂停
* resume() 恢复
* play() 从头播放

### get/set
* playbackRate 播放速率，默认`1`

### event

# License
[MIT License]
