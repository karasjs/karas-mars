import karas from 'karas';
import { loadSceneAsync, MarsPlayer, MarsPlayerConstructor, MarsPlayerPlayOptions, RI } from '@alipay/mars-player';
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
  timeDelta = 0;

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
    let scene = this.scene;
    if(scene) {
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

        let activeTexIndex = gl.getParameter(gl.ACTIVE_TEXTURE);
        let originTexture = gl.getParameter(gl.TEXTURE_BINDING_2D);

        let composition = this.composition = mp.initializeComposition(scene, {
          onEnd: () => {},
          keepResource: false,
          willReverseTime: false,
        });
        let onComp = () => {
          composition.start();
          scene.textures = void 0;
        };
        onComp();
      }
      let comp = this.composition;
    }
  }

  _updateComposition() {
    if(this.isDestroyed || this.mp.paused) {
      return;
    }
    let comp = this.composition;
    if(comp.shouldRestart) {
      comp.restart();
    }
    else if(!comp.shouldDestroy) {
      let dt = Math.min(this.timeDelta || 0, 33);
      comp.tick(dt);
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
    fake.frameAnimate(timeDelta => {
      fake.timeDelta = timeDelta;
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
        let json = request.response;
        loadSceneAsync(json, {}).then(scene => {
          this.props.onLoad?.();
          this.playAnimation(scene);
        });
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
