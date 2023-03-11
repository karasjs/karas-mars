import karas from 'karas';
import { MarsPlayer, MarsPlayerConstructor, MarsPlayerPlayOptions, RI } from '@alipay/mars-player';
import { version } from '../package.json';

const {
  refresh: {
    level: {
      CACHE,
    },
    webgl: {
      drawTextureCache,
    },
  },
  math: {
    matrix: {
      calRectPoint,
    },
  },
  util: {
    isNil,
  },
  mode: {
    CANVAS,
    WEBGL,
  },
  inject,
} = karas;

const vertexSimple = `
precision lowp float;
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos,.0,1.);}
`;
const fragmentSimple = `
precision lowp float;
void main(){ gl_FragColor = vec4(1.);}
`;

class $ extends karas.Geom {
  scene = null;
  mp = null;

  constructor(tagName, props) {
    super(tagName, props);
  }

  render(renderMode, ctx, dx, dy) {
    let res = super.render(renderMode, ctx, dx, dy);
    if(res.break) {
      return res;
    }
    let root = this.__root;
    if(renderMode !== root.__renderMode || renderMode !== WEBGL) {
      return res;
    }
    if(this.scene) {console.log(MarsPlayer)
      if(!this.mp) {
        let gl = ctx;
        let mp = this.mp = new MarsPlayer({
          gl,
          manualRender: true,
        });
        this.gpu = mp.renderer.gpu;
        this.renderState = mp.renderer.internal.state;
        this.defaultMtl = new RI.Material({
          name: 'defMtl',
          shader: {
            vertex: vertexSimple,
            fragment: fragmentSimple,
            shared: true,
          },
          states: {
            blending: true,
            blendSrc: gl.ONE,
            blendSrcAlpha: gl.ONE,
            blendDst: gl.ONE_MINUS_SRC_ALPHA,
            blendDstAlpha: gl.ONE_MINUS_SRC_ALPHA,
            depthMask: true,
            depthTest: false,
            cullFaceEnabled: false,
            frontFace: gl.CCW,
            stencilTest: false,
            polygonOffsetFill: false,
            polygonOffset: [1, 0],
          },
        }).assignRenderer(mp.renderer);
        this.renderState.bindFramebuffer(gl.FRAMEBUFFER, null);
        this.renderState.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
        this.renderState.noCache = true;
      }
    }
  }
}

class Mars extends karas.Component {
  isPlay = false;
  isLoaded = false;
  __playbackRate = 1;

  constructor(props) {
    super(props);
    this.isPlay = props.autoPlay !== false;
    this.__playbackRate = props.playbackRate || 1;
  }

  componentDidMount() {
    this.load();

    let fake = this.ref.fake;
    fake.frameAnimate(() => {
      if(this.isPlay && this.isLoaded) {
        fake.refresh();
      }
    });
  }

  componentWillUnmount() {}

  load() {
    let url = this.props.url;
    if(!url) {
      return;
    }
    let request = new XMLHttpRequest();
    request.open('get', url, true);
    request.responseType = 'json';
    request.onload = () => {
      if(request.response) {
        this.isLoaded = true;
        this.props.onLoad?.();
        this.playAnimation(request.response);
      }
    };
    request.send();
  }

  playAnimation(scene) {
    console.log(scene);
    let fake = this.ref.fake;
    fake.scene = scene;
    // 第一帧强制显示
    fake.refresh();
  }

  render() {
    // return karas.createElement('div', {},
    //   karas.createElement($, {
    //     ref: 'fake',
    //     style: {
    //       width: '100%',
    //       height: '100%',
    //       fill: 'none',
    //       stroke: 0,
    //     },
    //   }));
    return <div>
      <$ ref="fake" style={{
        width: '100%',
        height: '100%',
        fill: 'none',
        stroke: 0,
      }}/>
    </div>;
  }
}

Mars.version = version;

export default Mars;
