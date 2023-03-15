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

const r2d = 180 / Math.PI;

const vertexSimple = `
precision lowp float;
attribute vec2 aPos;
void main(){ gl_Position = vec4(aPos,.0,1.);}
`;
const fragmentSimple = `
precision lowp float;
void main(){ gl_FragColor = vec4(1.);}
`;

function mapRange(p, min, max) {
  return p === 0 ? 0 : min + (max - min) * p;
}

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
    let gl = ctx;
    if(scene) {
      let mp = this.mp;
      if(!mp) {
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
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

        if(!this.host.blend) {
          this.renderState.disable(RI.constants.BLEND);
        }
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
        if(this.host.clearDepth) {
          bit = bit | RI.constants.DEPTH_BUFFER_BIT;
        }
        this.renderState.clear(bit);
        comp.renderFrame.render();
      }
      this._reset(ctx);
    }
  }

  _updateTransform() {
    let parent = this.domParent;
    let comp = this.composition;
    let point = this.project3DPoint(comp.camera);
    let scaleX = parent.getStyle('scaleX'),
      scaleY = parent.getStyle('scaleY'),
      rotateZ = parent.getStyle('rotateZ');
    let env = this.env;
    comp.rootTransform.setTransform({
      // position: point,
      // scale: [scaleX * this.width / env.width, scaleY * this.height / env.height, 1],
      // rotation: [0, 0, rotateZ],
    });
  }

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

  _reset(gl) {
    gl.useProgram(gl.program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.enable(gl.DEPTH_TEST);
    this.aliasRenderState();
  }

  aliasRenderState() {
    let mtl = this.defaultMtl.materialInternal;
    if(mtl && mtl.renderer.state) {
      let marsRenderState = this.renderState;
      marsRenderState._reset();
      mtl.setupStates();
      delete marsRenderState._dict[RI.constants.BLEND];
      marsRenderState.depthMask(false);
      marsRenderState.activeTexture(RI.constants.TEXTURE0);
    }
  }

  project3DPoint(camera, z = 0) {
    let parent = this.domParent;
    let x1 = this.x, y1 = this.y,
      translateX = parent.getStyle('translateX'),
      translateY = parent.getStyle('translateY');
    let pos = camera.position;
    let pw = this.width, ph = this.height;
    let fov = Math.tan(camera.fov / r2d / 2);
    let depth = pos[2] - z;
    let width, height;
    if(camera.clipMode) {
      width = fov * depth;
      height = width * ph / pw;
    }
    else {
      height = fov * depth;
      width = height * pw / ph;
    }
    let x = (x1 + translateX) / pw;
    let y = (y1 + translateY) / ph;
    return [mapRange(x, -width, width) + pos[0], mapRange(y, -height, height) + pos[1], z];
  }
}

class Mars extends karas.Component {
  isPlay = false;
  isLoaded = false;
  __playbackRate = 1;
  clearDepth = false;
  blend = false;

  constructor(props) {
    super(props);
    this.isPlay = props.autoPlay !== false;
    this.__playbackRate = props.playbackRate || 1;
    this.clearDepth = !!props.clearDepth;
    this.blend = !!props.blend;
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
