import karas from 'karas';
import { loadSceneAsync, MarsPlayer, RI } from '@alipay/mars-player';
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
  playbackRate = 1;

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
      let mp = this.mp;
      if(!mp) {
        let gl = ctx;
        mp = this.mp = new MarsPlayer({
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

        let flipY = gl.getParameter(gl.UNPACK_FLIP_Y_WEBGL);
        let premultiply = gl.getParameter(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL);
        let program = gl.getParameter(gl.CURRENT_PROGRAM);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
        let activeTexIndex = gl.getParameter(gl.ACTIVE_TEXTURE);
        let originTexture = gl.getParameter(gl.TEXTURE_BINDING_2D);

        let composition = this.composition = mp.initializeComposition(scene, {
          onEnd: () => {},
          keepResource: false,
          willReverseTime: false,
        });
        let onComp = () => {
          composition.start();
          if (originTexture) {
            gl.bindTexture(gl.TEXTURE_2D, originTexture);
          }
          gl.activeTexture(activeTexIndex);
          composition.camera = {
            aspect: this.width / this.height,
          };
          this.renderState.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, +premultiply);
          this.renderState.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, +flipY);
          this.renderState.useProgram(null);
          gl.useProgram(program);
          scene.textures = void 0;
        };
        onComp();
      }
      let comp = this.composition;
      let renderer = comp && comp.renderer;
      if(renderer && !renderer.isDestroyed && !mp.paused) {
        this._updateTransform();
        this._updateComposition();
        let bit = RI.constants.STENCIL_BUFFER_BIT;
        this.renderState.clear(bit);
        comp.renderFrame.render();
      }
    }
  }

  _updateTransform() {}

  _updateComposition() {
    let comp = this.composition;
    if(comp.shouldRestart) {
      comp.restart();
    }
    else if(!comp.shouldDestroy) {
      let dt = Math.min(this.timeDelta || 0, 33) * this.playbackRate;
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

    let { autoPlay = true } = this.props;
    this.cb = timeDelta => {
      fake.timeDelta = timeDelta;
      if(this.isPlay && this.isLoaded) {
        fake.refresh();
      }
    }
    let fake = this.ref.fake;
    fake.playbackRate = this.__playbackRate;
    if(autoPlay) {
      fake.frameAnimate(this.cb);
    }
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
    let fake = this.ref.fake;
    fake.scene = scene;
    // 第一帧强制显示
    fake.refresh();
  }

  render() {
    return <div>
      <$ ref="fake" style={{
        width: '100%',
        height: '100%',
        fill: 'none',
        stroke: 0,
      }}/>
    </div>;
  }

  play() {
    this.pause();
    let comp = this.ref.fake.composition;
    if(comp) {
      comp.restart();
    }
    this.resume();
  }

  pause() {
    this.ref.fake.removeFrameAnimate(this.cb);
  }

  resume() {
    this.ref.fake.frameAnimate(this.cb);
  }

  get playbackRate() {
    return this.__playbackRate;
  }

  set playbackRate(v) {
    v = parseFloat(v) || 1;
    if(v <= 0) {
      v = 1;
    }
    this.__playbackRate = v;
  }
}

Mars.version = version;

export default Mars;
