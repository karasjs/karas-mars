(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('karas')) :
  typeof define === 'function' && define.amd ? define(['karas'], factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Mars = factory(global.karas));
})(this, (function (karas) { 'use strict';

  function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

  var karas__default = /*#__PURE__*/_interopDefaultLegacy(karas);

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = null != arguments[i] ? arguments[i] : {};
      i % 2 ? ownKeys(Object(source), !0).forEach(function (key) {
        _defineProperty(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
    return target;
  }
  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
    }
  }
  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }
  function _defineProperty(obj, key, value) {
    key = _toPropertyKey(key);
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    Object.defineProperty(subClass, "prototype", {
      writable: false
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }
  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }
  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };
    return _setPrototypeOf(o, p);
  }
  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return self;
  }
  function _superPropBase(object, property) {
    while (!Object.prototype.hasOwnProperty.call(object, property)) {
      object = _getPrototypeOf(object);
      if (object === null) break;
    }
    return object;
  }
  function _get() {
    if (typeof Reflect !== "undefined" && Reflect.get) {
      _get = Reflect.get.bind();
    } else {
      _get = function _get(target, property, receiver) {
        var base = _superPropBase(target, property);
        if (!base) return;
        var desc = Object.getOwnPropertyDescriptor(base, property);
        if (desc.get) {
          return desc.get.call(arguments.length < 3 ? target : receiver);
        }
        return desc.value;
      };
    }
    return _get.apply(this, arguments);
  }
  function _toPrimitive(input, hint) {
    if (typeof input !== "object" || input === null) return input;
    var prim = input[Symbol.toPrimitive];
    if (prim !== undefined) {
      var res = prim.call(input, hint || "default");
      if (typeof res !== "object") return res;
      throw new TypeError("@@toPrimitive must return a primitive value.");
    }
    return (hint === "string" ? String : Number)(input);
  }
  function _toPropertyKey(arg) {
    var key = _toPrimitive(arg, "string");
    return typeof key === "symbol" ? key : String(key);
  }

  var version = "0.0.12";

  var _window$mars = window.mars,
    MarsPlayer = _window$mars.MarsPlayer,
    AssetManager = _window$mars.AssetManager,
    Material = _window$mars.Material,
    glContext = _window$mars.glContext,
    Composition = _window$mars.Composition;
  var _karas$refresh = karas__default["default"].refresh;
    _karas$refresh.level.CACHE;
    _karas$refresh.webgl.drawTextureCache;
    karas__default["default"].math.matrix.calRectPoint;
    karas__default["default"].util.isNil;
    var _karas$mode = karas__default["default"].mode;
    _karas$mode.CANVAS;
    var WEBGL = _karas$mode.WEBGL;
    karas__default["default"].inject;
  var r2d = 180 / Math.PI;
  var vertexSimple = "\nprecision lowp float;\nattribute vec2 aPos;\nvoid main(){ gl_Position = vec4(aPos,.0,1.);}\n";
  var fragmentSimple = "\nprecision lowp float;\nvoid main(){ gl_FragColor = vec4(1.);}\n";
  function mapRange(p, min, max) {
    return p === 0 ? 0 : min + (max - min) * p;
  }
  var $ = /*#__PURE__*/function (_karas$Geom) {
    _inherits($, _karas$Geom);
    function $(tagName, props) {
      var _this;
      _this = _karas$Geom.call(this, tagName, props) || this;
      _defineProperty(_assertThisInitialized(_this), "scene", null);
      _defineProperty(_assertThisInitialized(_this), "playOptions", null);
      _defineProperty(_assertThisInitialized(_this), "mp", null);
      _defineProperty(_assertThisInitialized(_this), "timeDelta", 0);
      _defineProperty(_assertThisInitialized(_this), "playbackRate", 1);
      return _this;
    }
    _createClass($, [{
      key: "render",
      value: function render(renderMode, ctx, dx, dy) {
        var _this2 = this;
        var res = _get(_getPrototypeOf($.prototype), "render", this).call(this, renderMode, ctx, dx, dy);
        if (res["break"]) {
          return res;
        }
        var root = this.__root;
        if (renderMode !== root.__renderMode || renderMode !== WEBGL) {
          return res;
        }
        var scene = this.scene;
        var gl = ctx;
        if (scene) {
          var mp = this.mp;
          if (!mp) {
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
            mp = this.mp = new MarsPlayer({
              gl: gl,
              manualRender: true
            });
            this.gpu = mp.gpuCapability;
            this.renderState = mp.renderer.pipelineContext.gl;
            this.defaultMtl = Material.create({
              name: 'defMtl',
              shader: {
                vertex: vertexSimple,
                fragment: fragmentSimple
              }
            });
            this.defaultMtl.blending = true;
            this.defaultMtl.blendFunction = [gl.ONE, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA];
            this.defaultMtl.depthMask = true;
            this.defaultMtl.depthTest = true;
            this.defaultMtl.culling = false;
            this.defaultMtl.cullFace = gl.CCW;
            this.defaultMtl.stencilTest = false;
            this.defaultMtl.polygonOffsetFill = false;
            this.defaultMtl.polygonOffset = [1, 0];
            this.renderState.bindFramebuffer(gl.FRAMEBUFFER, null);
            this.renderState.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, 0);
            if (!this.host.blend) {
              this.renderState.disable(glContext.BLEND);
            }
            var flipY = gl.getParameter(gl.UNPACK_FLIP_Y_WEBGL);
            var premultiply = gl.getParameter(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL);
            var program = gl.getParameter(gl.CURRENT_PROGRAM);
            gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
            var activeTexIndex = gl.getParameter(gl.ACTIVE_TEXTURE);
            var originTexture = gl.getParameter(gl.TEXTURE_BINDING_2D);
            var _renderer = mp.renderer;
            var composition = this.composition = Composition.initialize(scene, _objectSpread2(_objectSpread2({
              handleEnd: function handleEnd() {},
              keepResource: false,
              willReverseTime: false
            }, this.playOptions), {}, {
              renderer: _renderer,
              width: _renderer.getWidth(),
              height: _renderer.getHeight(),
              shaderLibrary: _renderer.getShaderLibrary()
            }));
            var onComp = function onComp() {
              composition.start();
              if (originTexture) {
                gl.bindTexture(gl.TEXTURE_2D, originTexture);
              }
              gl.activeTexture(activeTexIndex);
              _this2.renderState.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, +premultiply);
              _this2.renderState.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, +flipY);
              _this2.renderState.useProgram(null);
              gl.useProgram(program);
              scene.textures = void 0;
            };
            onComp();
          }
          var comp = this.composition;
          var renderer = comp && comp.renderer;
          if (renderer && !renderer.isDestroyed && !mp.paused) {
            this._updateTransform();
            this._updateComposition();
            var bit = glContext.STENCIL_BUFFER_BIT;
            if (this.host.clearDepth) {
              bit = bit | glContext.DEPTH_BUFFER_BIT;
            }
            this.renderState.clear(bit);
            renderer.renderRenderFrame(comp.renderFrame);
          }
          this._reset(ctx);
        }
      }
    }, {
      key: "_updateTransform",
      value: function _updateTransform() {
        var parent = this.domParent;
        var comp = this.composition;
        this.project3DPoint(comp.camera);
        var scaleX = parent.getStyle('scaleX'),
          scaleY = parent.getStyle('scaleY');
          parent.getStyle('rotateZ');
        this.env;
        comp.rootTransform.setTransform({
          // position: point,
          scale: [scaleX, scaleY, 1]
          // rotation: [0, 0, rotateZ],
        });
      }
    }, {
      key: "_updateComposition",
      value: function _updateComposition() {
        var comp = this.composition;
        if (comp.shouldRestart()) {
          comp.restart();
          comp.update(0);
        } else if (!comp.shouldDestroy) {
          var dt = Math.min(this.timeDelta || 0, 33) * this.playbackRate;
          comp.update(dt);
        }
      }
    }, {
      key: "_reset",
      value: function _reset(gl) {
        gl.useProgram(gl.program);
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
        this.aliasRenderState();
      }
    }, {
      key: "aliasRenderState",
      value: function aliasRenderState() {
        var mtl = this.defaultMtl;
        var marsRenderState = this.mp.renderer.pipelineContext;
        if (mtl && marsRenderState) {
          marsRenderState.reset();
          mtl.setupStates(marsRenderState);
          delete marsRenderState.glCapabilityCache[glContext.BLEND];
          marsRenderState.depthMask(false);
          marsRenderState.activeTexture(glContext.TEXTURE0);
        }
      }
    }, {
      key: "project3DPoint",
      value: function project3DPoint(camera) {
        var z = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
        var parent = this.domParent;
        var x1 = this.x,
          y1 = this.y,
          translateX = parent.getStyle('translateX'),
          translateY = parent.getStyle('translateY');
        var pos = camera.position;
        var pw = this.width,
          ph = this.height;
        var fov = Math.tan(camera.fov / r2d / 2);
        var depth = pos[2] - z;
        var width, height;
        if (camera.clipMode) {
          width = fov * depth;
          height = width * ph / pw;
        } else {
          height = fov * depth;
          width = height * pw / ph;
        }
        var x = (x1 + translateX) / pw;
        var y = (y1 + translateY) / ph;
        return [mapRange(x, -width, width) + pos[0], mapRange(y, -height, height) + pos[1], z];
      }
    }]);
    return $;
  }(karas__default["default"].Geom);
  var Mars = /*#__PURE__*/function (_karas$Component) {
    _inherits(Mars, _karas$Component);
    function Mars(props) {
      var _props$playbackRate;
      var _this3;
      _this3 = _karas$Component.call(this, props) || this;
      _defineProperty(_assertThisInitialized(_this3), "isPlay", false);
      _defineProperty(_assertThisInitialized(_this3), "isLoaded", false);
      _defineProperty(_assertThisInitialized(_this3), "__playbackRate", 1);
      _defineProperty(_assertThisInitialized(_this3), "clearDepth", false);
      _defineProperty(_assertThisInitialized(_this3), "blend", false);
      _this3.isPlay = props.autoPlay !== false;
      _this3.__playbackRate = (_props$playbackRate = props.playbackRate) !== null && _props$playbackRate !== void 0 ? _props$playbackRate : 1;
      _this3.clearDepth = !!props.clearDepth;
      _this3.blend = !!props.blend;
      return _this3;
    }
    _createClass(Mars, [{
      key: "componentDidMount",
      value: function componentDidMount() {
        var _this4 = this;
        this.load();
        var _this$props$autoPlay = this.props.autoPlay,
          autoPlay = _this$props$autoPlay === void 0 ? true : _this$props$autoPlay;
        this.cb = function (timeDelta) {
          fake.timeDelta = timeDelta;
          if (_this4.isPlay && _this4.isLoaded) {
            fake.refresh();
          }
        };
        var fake = this.ref.fake;
        fake.playbackRate = this.__playbackRate;
        if (autoPlay) {
          fake.frameAnimate(this.cb);
        }
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        var mp = this.ref.fake.mp;
        mp && mp.destroy(true);
      }
    }, {
      key: "load",
      value: function load() {
        var _this5 = this;
        var url = this.props.url;
        if (!url) {
          return;
        }
        var request = new XMLHttpRequest();
        request.open('get', url, true);
        request.responseType = 'json';
        request.onload = function () {
          if (request.response) {
            var _this5$props;
            _this5.isLoaded = true;
            var json = request.response;
            var asset = new AssetManager(_objectSpread2({}, (_this5$props = _this5.props) === null || _this5$props === void 0 ? void 0 : _this5$props.loadOptions));
            asset.loadScene(json).then(function (scene) {
              var _this5$props$onLoad, _this5$props2;
              (_this5$props$onLoad = (_this5$props2 = _this5.props).onLoad) === null || _this5$props$onLoad === void 0 ? void 0 : _this5$props$onLoad.call(_this5$props2);
              _this5.playAnimation(scene);
            });
          }
        };
        request.send();
      }
    }, {
      key: "playAnimation",
      value: function playAnimation(scene) {
        var _this$props;
        var fake = this.ref.fake;
        fake.scene = scene;
        fake.playOptions = (_this$props = this.props) === null || _this$props === void 0 ? void 0 : _this$props.playOptions;
        // 第一帧强制显示
        fake.refresh();
      }
    }, {
      key: "render",
      value: function render() {
        return karas__default["default"].createElement("div", null, karas__default["default"].createElement($, {
          ref: "fake",
          style: {
            width: '100%',
            height: '100%',
            fill: 'none',
            stroke: 0
          }
        }));
      }
    }, {
      key: "play",
      value: function play(start) {
        var _this6 = this;
        var cb = function cb() {
          var comp = _this6.ref.fake.composition;
          if (comp) {
            _this6.ref.fake.removeFrameAnimate(cb);
            _this6.pause();
            comp.restart();
            comp.update(start !== null && start !== void 0 ? start : 0);
            _this6.resume();
          }
        };
        this.ref.fake.frameAnimate(cb);
      }
    }, {
      key: "pause",
      value: function pause() {
        this.ref.fake.removeFrameAnimate(this.cb);
      }
    }, {
      key: "resume",
      value: function resume() {
        this.ref.fake.frameAnimate(this.cb);
      }
    }, {
      key: "playbackRate",
      get: function get() {
        return this.__playbackRate;
      },
      set: function set(v) {
        var _parseFloat;
        v = (_parseFloat = parseFloat(v)) !== null && _parseFloat !== void 0 ? _parseFloat : 1;
        // if(v <= 0) {
        //   v = 1;
        // }
        this.__playbackRate = v;
        if (this.ref.fake) {
          this.ref.fake.playbackRate = v;
        }
      }
    }]);
    return Mars;
  }(karas__default["default"].Component);
  Mars.version = version;

  return Mars;

}));
//# sourceMappingURL=index.js.map
