"use strict";(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[7689],{98420:function(e,t,r){r.d(t,{Z:function(){return i}});let i=(0,r(79205).Z)("Building2",[["path",{d:"M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z",key:"1b4qmf"}],["path",{d:"M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2",key:"i71pzd"}],["path",{d:"M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2",key:"10jefs"}],["path",{d:"M10 6h4",key:"1itunk"}],["path",{d:"M10 10h4",key:"tcdvrf"}],["path",{d:"M10 14h4",key:"kelpxr"}],["path",{d:"M10 18h4",key:"1ulq68"}]])},10407:function(e,t,r){r.d(t,{Z:function(){return i}});let i=(0,r(79205).Z)("ChevronRight",[["path",{d:"m9 18 6-6-6-6",key:"mthhwq"}]])},55900:function(e,t,r){r.d(t,{Z:function(){return i}});let i=(0,r(79205).Z)("GraduationCap",[["path",{d:"M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z",key:"j76jl0"}],["path",{d:"M22 10v6",key:"1lu8f3"}],["path",{d:"M6 12.5V16a6 3 0 0 0 12 0v-3.5",key:"1r8lef"}]])},69076:function(e,t,r){r.d(t,{Z:function(){return i}});let i=(0,r(79205).Z)("RotateCcw",[["path",{d:"M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8",key:"1357e3"}],["path",{d:"M3 3v5h5",key:"1xhq8a"}]])},45447:function(e,t,r){let i,s;r.d(t,{v:function(){return H}});var a=r(3078),o=r(53576),n=r(2265),l=r(62035),u=r(45699),h=r(56277),f=r(45414);function d(e,t){let r;let i=()=>{let{currentTime:i}=t,s=(null===i?0:i.value)/100;r!==s&&e(s),r=s};return f.Wi.update(i,!0),()=>(0,f.Pn)(i)}let c=new WeakMap;function p({target:e,contentRect:t,borderBoxSize:r}){var i;null===(i=c.get(e))||void 0===i||i.forEach(i=>{i({target:e,contentSize:t,get size(){return function(e,t){if(t){let{inlineSize:e,blockSize:r}=t[0];return{width:e,height:r}}return e instanceof SVGElement&&"getBBox"in e?e.getBBox():{width:e.offsetWidth,height:e.offsetHeight}}(e,r)}})})}function g(e){e.forEach(p)}let m=new Set;var v=r(81645),T=r(14438);let _=()=>({current:0,offset:[],progress:0,scrollLength:0,targetOffset:0,targetLength:0,containerLength:0,velocity:0}),x=()=>({time:0,x:_(),y:_()}),b={x:{length:"Width",position:"Left"},y:{length:"Height",position:"Top"}};function M(e,t,r,i){let s=r[t],{length:a,position:o}=b[t],n=s.current,l=r.time;s.current=e[`scroll${o}`],s.scrollLength=e[`scroll${a}`]-e[`client${a}`],s.offset.length=0,s.offset[0]=0,s.offset[1]=s.scrollLength,s.progress=(0,v.Y)(0,s.scrollLength,s.current);let u=i-l;s.velocity=u>50?0:(0,T.R)(s.current-n,u)}var C=r(59111),w=r(88843),S=r(8913);let y={start:0,center:.5,end:1};function E(e,t,r=0){let i=0;if(e in y&&(e=y[e]),"string"==typeof e){let t=parseFloat(e);e.endsWith("px")?i=t:e.endsWith("%")?e=t/100:e.endsWith("vw")?i=t/100*document.documentElement.clientWidth:e.endsWith("vh")?i=t/100*document.documentElement.clientHeight:e=t}return"number"==typeof e&&(i=t*e),r+i}let P=[0,0],R=[[0,0],[1,1]],B={x:0,y:0},A=new WeakMap,F=new WeakMap,D=new WeakMap,L=e=>e===document.documentElement?window:e;function N(e,{container:t=document.documentElement,...r}={}){let a=D.get(t);a||(a=new Set,D.set(t,a));let o=function(e,t,r,i={}){return{measure:()=>(function(e,t=e,r){if(r.x.targetOffset=0,r.y.targetOffset=0,t!==e){let i=t;for(;i&&i!==e;)r.x.targetOffset+=i.offsetLeft,r.y.targetOffset+=i.offsetTop,i=i.offsetParent}r.x.targetLength=t===e?t.scrollWidth:t.clientWidth,r.y.targetLength=t===e?t.scrollHeight:t.clientHeight,r.x.containerLength=e.clientWidth,r.y.containerLength=e.clientHeight})(e,i.target,r),update:t=>{M(e,"x",r,t),M(e,"y",r,t),r.time=t,(i.offset||i.target)&&function(e,t,r){let{offset:i=R}=r,{target:s=e,axis:a="y"}=r,o="y"===a?"height":"width",n=s!==e?function(e,t){let r={x:0,y:0},i=e;for(;i&&i!==t;)if(i instanceof HTMLElement)r.x+=i.offsetLeft,r.y+=i.offsetTop,i=i.offsetParent;else if("svg"===i.tagName){let e=i.getBoundingClientRect(),t=(i=i.parentElement).getBoundingClientRect();r.x+=e.left-t.left,r.y+=e.top-t.top}else if(i instanceof SVGGraphicsElement){let{x:e,y:t}=i.getBBox();r.x+=e,r.y+=t;let s=null,a=i.parentNode;for(;!s;)"svg"===a.tagName&&(s=a),a=i.parentNode;i=s}else break;return r}(s,e):B,l=s===e?{width:e.scrollWidth,height:e.scrollHeight}:"getBBox"in s&&"svg"!==s.tagName?s.getBBox():{width:s.clientWidth,height:s.clientHeight},u={width:e.clientWidth,height:e.clientHeight};t[a].offset.length=0;let h=!t[a].interpolate,f=i.length;for(let e=0;e<f;e++){let r=function(e,t,r,i){let s=Array.isArray(e)?e:P,a=0;return"number"==typeof e?s=[e,e]:"string"==typeof e&&(s=(e=e.trim()).includes(" ")?e.split(" "):[e,y[e]?e:"0"]),E(s[0],r,i)-E(s[1],t)}(i[e],u[o],l[o],n[a]);h||r===t[a].interpolatorOffsets[e]||(h=!0),t[a].offset[e]=r}h&&(t[a].interpolate=(0,w.s)(t[a].offset,(0,S.Y)(i),{clamp:!1}),t[a].interpolatorOffsets=[...t[a].offset]),t[a].progress=(0,C.u)(0,1,t[a].interpolate(t[a].current))}(e,r,i)},notify:()=>t(r)}}(t,e,x(),r);if(a.add(o),!A.has(t)){let e=()=>{for(let e of a)e.measure()},r=()=>{for(let e of a)e.update(f.frameData.timestamp)},o=()=>{for(let e of a)e.notify()},n=()=>{f.Wi.read(e,!1,!0),f.Wi.read(r,!1,!0),f.Wi.update(o,!1,!0)};A.set(t,n);let l=L(t);window.addEventListener("resize",n,{passive:!0}),t!==document.documentElement&&F.set(t,"function"==typeof t?(m.add(t),s||(s=()=>{let e={width:window.innerWidth,height:window.innerHeight},t={target:window,size:e,contentSize:e};m.forEach(e=>e(t))},window.addEventListener("resize",s)),()=>{m.delete(t),!m.size&&s&&(s=void 0)}):function(e,t){i||"undefined"==typeof ResizeObserver||(i=new ResizeObserver(g));let r=(0,u.IG)(e);return r.forEach(e=>{let r=c.get(e);r||(r=new Set,c.set(e,r)),r.add(t),null==i||i.observe(e)}),()=>{r.forEach(e=>{let r=c.get(e);null==r||r.delete(t),(null==r?void 0:r.size)||null==i||i.unobserve(e)})}}(t,n)),l.addEventListener("scroll",n,{passive:!0})}let n=A.get(t);return f.Wi.read(n,!1,!0),()=>{var e;(0,f.Pn)(n);let r=D.get(t);if(!r||(r.delete(o),r.size))return;let i=A.get(t);A.delete(t),i&&(L(t).removeEventListener("scroll",i),null===(e=F.get(t))||void 0===e||e(),window.removeEventListener("resize",i))}}let U=new Map;function z({source:e,container:t=document.documentElement,axis:r="y"}={}){e&&(t=e),U.has(t)||U.set(t,{});let i=U.get(t);return i[r]||(i[r]=(0,u.tn)()?new ScrollTimeline({source:t,axis:r}):function({source:e,container:t,axis:r="y"}){e&&(t=e);let i={value:0},s=N(e=>{i.value=100*e[r].progress},{container:t,axis:r});return{currentTime:i,cancel:s}}({source:t,axis:r})),i[r]}function O(e){return e&&(e.target||e.offset)}var k=r(11534);function I(e,t){(0,l.K)(!!(!t||t.current),`You have defined a ${e} options but the provided ref is not yet hydrated, probably because it's defined higher up the tree. Try calling useScroll() in the same component as the ref, or setting its \`layoutEffect: false\` option.`)}let W=()=>({scrollX:(0,a.BX)(0),scrollY:(0,a.BX)(0),scrollXProgress:(0,a.BX)(0),scrollYProgress:(0,a.BX)(0)});function H({container:e,target:t,layoutEffect:r=!0,...i}={}){let s=(0,o.h)(W);return(r?k.L:n.useEffect)(()=>(I("target",t),I("container",e),function(e,{axis:t="y",...r}={}){let i={axis:t,...r};return"function"==typeof e?2===e.length||O(i)?N(t=>{e(t[i.axis].progress,t)},i):d(e,z(i)):function(e,t){if(e.flatten(),O(t))return e.pause(),N(r=>{e.time=e.duration*r[t.axis].progress},t);{let r=z(t);return e.attachTimeline?e.attachTimeline(r,e=>(e.pause(),d(t=>{e.time=e.duration*t},r))):h.Z}}(e,i)}((e,{x:t,y:r})=>{s.scrollX.set(t.current),s.scrollXProgress.set(t.progress),s.scrollY.set(r.current),s.scrollYProgress.set(r.progress)},{...i,container:(null==e?void 0:e.current)||void 0,target:(null==t?void 0:t.current)||void 0})),[e,t,JSON.stringify(i.offset)]),s}},24317:function(e,t,r){r.d(t,{H:function(){return c}});var i=r(88843);let s=e=>e&&"object"==typeof e&&e.mix,a=e=>s(e)?e.mix:void 0;var o=r(2265),n=r(3078),l=r(45750),u=r(53576),h=r(11534),f=r(45414);function d(e,t){let r=function(e){let t=(0,u.h)(()=>(0,n.BX)(e)),{isStatic:r}=(0,o.useContext)(l._);if(r){let[,r]=(0,o.useState)(e);(0,o.useEffect)(()=>t.on("change",r),[])}return t}(t()),i=()=>r.set(t());return i(),(0,h.L)(()=>{let t=()=>f.Wi.preRender(i,!1,!0),r=e.map(e=>e.on("change",t));return()=>{r.forEach(e=>e()),(0,f.Pn)(i)}}),r}function c(e,t,r,s){if("function"==typeof e)return function(e){n.S1.current=[],e();let t=d(n.S1.current,e);return n.S1.current=void 0,t}(e);let o="function"==typeof t?t:function(...e){let t=!Array.isArray(e[0]),r=t?0:-1,s=e[0+r],o=e[1+r],n=e[2+r],l=e[3+r],u=(0,i.s)(o,n,{mixer:a(n[0]),...l});return t?u(s):u}(t,r,s);return Array.isArray(e)?p(e,o):p([e],([e])=>o(e))}function p(e,t){let r=(0,u.h)(()=>[]);return d(e,()=>{r.length=0;let i=e.length;for(let t=0;t<i;t++)r[t]=e[t].get();return t(r)})}},7610:function(e,t,r){r.d(t,{zz:function(){return n}});let i=1/3,s=1/6,a=e=>0|Math.floor(e),o=new Float64Array([1,1,0,-1,1,0,1,-1,0,-1,-1,0,1,0,1,-1,0,1,1,0,-1,-1,0,-1,0,1,1,0,-1,1,0,1,-1,0,-1,-1]);function n(e=Math.random){let t=function(e){let t=new Uint8Array(512);for(let e=0;e<256;e++)t[e]=e;for(let r=0;r<255;r++){let i=r+~~(e()*(256-r)),s=t[r];t[r]=t[i],t[i]=s}for(let e=256;e<512;e++)t[e]=t[e-256];return t}(e),r=new Float64Array(t).map(e=>o[e%12*3]),n=new Float64Array(t).map(e=>o[e%12*3+1]),l=new Float64Array(t).map(e=>o[e%12*3+2]);return function(e,o,u){let h,f,d,c,p,g,m,v,T,_;let x=(e+o+u)*i,b=a(e+x),M=a(o+x),C=a(u+x),w=(b+M+C)*s,S=e-(b-w),y=o-(M-w),E=u-(C-w);S>=y?y>=E?(p=1,g=0,m=0,v=1,T=1,_=0):(S>=E?(p=1,g=0,m=0):(p=0,g=0,m=1),v=1,T=0,_=1):y<E?(p=0,g=0,m=1,v=0,T=1,_=1):S<E?(p=0,g=1,m=0,v=0,T=1,_=1):(p=0,g=1,m=0,v=1,T=1,_=0);let P=S-p+s,R=y-g+s,B=E-m+s,A=S-v+2*s,F=y-T+2*s,D=E-_+2*s,L=S-1+3*s,N=y-1+3*s,U=E-1+3*s,z=255&b,O=255&M,k=255&C,I=.6-S*S-y*y-E*E;if(I<0)h=0;else{let e=z+t[O+t[k]];I*=I,h=I*I*(r[e]*S+n[e]*y+l[e]*E)}let W=.6-P*P-R*R-B*B;if(W<0)f=0;else{let e=z+p+t[O+g+t[k+m]];W*=W,f=W*W*(r[e]*P+n[e]*R+l[e]*B)}let H=.6-A*A-F*F-D*D;if(H<0)d=0;else{let e=z+v+t[O+T+t[k+_]];H*=H,d=H*H*(r[e]*A+n[e]*F+l[e]*D)}let G=.6-L*L-N*N-U*U;if(G<0)c=0;else{let e=z+1+t[O+1+t[k+1]];G*=G,c=G*G*(r[e]*L+n[e]*N+l[e]*U)}return 32*(h+f+d+c)}}},13946:function(e,t,r){r.d(t,{x:function(){return u}});var i=r(72079),s=r(82552),a=r(24451);class o extends a.w{constructor(e,t="tDiffuse"){super(),this.textureID=t,this.uniforms=null,this.material=null,e instanceof i.jyz?(this.uniforms=e.uniforms,this.material=e):e&&(this.uniforms=i.rDY.clone(e.uniforms),this.material=new i.jyz({name:void 0!==e.name?e.name:"unspecified",defines:Object.assign({},e.defines),uniforms:this.uniforms,vertexShader:e.vertexShader,fragmentShader:e.fragmentShader})),this._fsQuad=new a.T(this.material)}render(e,t,r){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=r.texture),this._fsQuad.material=this.material,this.renderToScreen?e.setRenderTarget(null):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil)),this._fsQuad.render(e)}dispose(){this.material.dispose(),this._fsQuad.dispose()}}class n extends a.w{constructor(e,t){super(),this.scene=e,this.camera=t,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(e,t,r){let i,s;let a=e.getContext(),o=e.state;o.buffers.color.setMask(!1),o.buffers.depth.setMask(!1),o.buffers.color.setLocked(!0),o.buffers.depth.setLocked(!0),this.inverse?(i=0,s=1):(i=1,s=0),o.buffers.stencil.setTest(!0),o.buffers.stencil.setOp(a.REPLACE,a.REPLACE,a.REPLACE),o.buffers.stencil.setFunc(a.ALWAYS,i,4294967295),o.buffers.stencil.setClear(s),o.buffers.stencil.setLocked(!0),e.setRenderTarget(r),this.clear&&e.clear(),e.render(this.scene,this.camera),e.setRenderTarget(t),this.clear&&e.clear(),e.render(this.scene,this.camera),o.buffers.color.setLocked(!1),o.buffers.depth.setLocked(!1),o.buffers.color.setMask(!0),o.buffers.depth.setMask(!0),o.buffers.stencil.setLocked(!1),o.buffers.stencil.setFunc(a.EQUAL,1,4294967295),o.buffers.stencil.setOp(a.KEEP,a.KEEP,a.KEEP),o.buffers.stencil.setLocked(!0)}}class l extends a.w{constructor(){super(),this.needsSwap=!1}render(e){e.state.buffers.stencil.setLocked(!1),e.state.buffers.stencil.setTest(!1)}}class u{constructor(e,t){if(this.renderer=e,this._pixelRatio=e.getPixelRatio(),void 0===t){let r=e.getSize(new i.FM8);this._width=r.width,this._height=r.height,(t=new i.dd2(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:i.cLu})).texture.name="EffectComposer.rt1"}else this._width=t.width,this._height=t.height;this.renderTarget1=t,this.renderTarget2=t.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new o(s.C),this.copyPass.material.blending=i.jFi,this.timer=new i.B7y}swapBuffers(){let e=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=e}addPass(e){this.passes.push(e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(e,t){this.passes.splice(t,0,e),e.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(e){let t=this.passes.indexOf(e);-1!==t&&this.passes.splice(t,1)}isLastEnabledPass(e){for(let t=e+1;t<this.passes.length;t++)if(this.passes[t].enabled)return!1;return!0}render(e){this.timer.update(),void 0===e&&(e=this.timer.getDelta());let t=this.renderer.getRenderTarget(),r=!1;for(let t=0,i=this.passes.length;t<i;t++){let i=this.passes[t];if(!1!==i.enabled){if(i.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(t),i.render(this.renderer,this.writeBuffer,this.readBuffer,e,r),i.needsSwap){if(r){let t=this.renderer.getContext(),r=this.renderer.state.buffers.stencil;r.setFunc(t.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,e),r.setFunc(t.EQUAL,1,4294967295)}this.swapBuffers()}void 0!==n&&(i instanceof n?r=!0:i instanceof l&&(r=!1))}}this.renderer.setRenderTarget(t)}reset(e){if(void 0===e){let t=this.renderer.getSize(new i.FM8);this._pixelRatio=this.renderer.getPixelRatio(),this._width=t.width,this._height=t.height,(e=this.renderTarget1.clone()).setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=e,this.renderTarget2=e.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(e,t){this._width=e,this._height=t;let r=this._width*this._pixelRatio,i=this._height*this._pixelRatio;this.renderTarget1.setSize(r,i),this.renderTarget2.setSize(r,i);for(let e=0;e<this.passes.length;e++)this.passes[e].setSize(r,i)}setPixelRatio(e){this._pixelRatio=e,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}},11610:function(e,t,r){r.d(t,{v:function(){return o}});var i=r(72079),s=r(24451);let a={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
		precision highp float;

		uniform mat4 modelViewMatrix;
		uniform mat4 projectionMatrix;

		attribute vec3 position;
		attribute vec2 uv;

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		precision highp float;

		uniform sampler2D tDiffuse;

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

			#ifdef LINEAR_TONE_MAPPING

				gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );

			#elif defined( REINHARD_TONE_MAPPING )

				gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );

			#elif defined( CINEON_TONE_MAPPING )

				gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );

			#elif defined( ACES_FILMIC_TONE_MAPPING )

				gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );

			#elif defined( AGX_TONE_MAPPING )

				gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );

			#elif defined( NEUTRAL_TONE_MAPPING )

				gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );

			#elif defined( CUSTOM_TONE_MAPPING )

				gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};class o extends s.w{constructor(){super(),this.isOutputPass=!0,this.uniforms=i.rDY.clone(a.uniforms),this.material=new i.FIo({name:a.name,uniforms:this.uniforms,vertexShader:a.vertexShader,fragmentShader:a.fragmentShader}),this._fsQuad=new s.T(this.material),this._outputColorSpace=null,this._toneMapping=null}render(e,t,r){this.uniforms.tDiffuse.value=r.texture,this.uniforms.toneMappingExposure.value=e.toneMappingExposure,(this._outputColorSpace!==e.outputColorSpace||this._toneMapping!==e.toneMapping)&&(this._outputColorSpace=e.outputColorSpace,this._toneMapping=e.toneMapping,this.material.defines={},i.epp.getTransfer(this._outputColorSpace)===i.j17&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===i.EoG?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===i.CdI?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===i.YGz?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===i.LY2?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===i.Bgp?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===i.ORg?this.material.defines.NEUTRAL_TONE_MAPPING="":this._toneMapping===i.dZ3&&(this.material.defines.CUSTOM_TONE_MAPPING=""),this.material.needsUpdate=!0),!0===this.renderToScreen?e.setRenderTarget(null):(e.setRenderTarget(t),this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil)),this._fsQuad.render(e)}dispose(){this.material.dispose(),this._fsQuad.dispose()}}},24451:function(e,t,r){r.d(t,{T:function(){return l},w:function(){return s}});var i=r(72079);class s{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}let a=new i.iKG(-1,1,1,-1,0,1);class o extends i.u9r{constructor(){super(),this.setAttribute("position",new i.a$l([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new i.a$l([0,2,0,0,2,0],2))}}let n=new o;class l{constructor(e){this._mesh=new i.Kj0(n,e)}dispose(){this._mesh.geometry.dispose()}render(e){e.render(this._mesh,a)}get material(){return this._mesh.material}set material(e){this._mesh.material=e}}},49520:function(e,t,r){r.d(t,{C:function(){return a}});var i=r(72079),s=r(24451);class a extends s.w{constructor(e,t,r=null,s=null,a=null){super(),this.scene=e,this.camera=t,this.overrideMaterial=r,this.clearColor=s,this.clearAlpha=a,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this.isRenderPass=!0,this._oldClearColor=new i.Ilk}render(e,t,r){let i,s;let a=e.autoClear;e.autoClear=!1,null!==this.overrideMaterial&&(s=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),null!==this.clearColor&&(e.getClearColor(this._oldClearColor),e.setClearColor(this.clearColor,e.getClearAlpha())),null!==this.clearAlpha&&(i=e.getClearAlpha(),e.setClearAlpha(this.clearAlpha)),!0==this.clearDepth&&e.clearDepth(),e.setRenderTarget(this.renderToScreen?null:r),!0===this.clear&&e.clear(e.autoClearColor,e.autoClearDepth,e.autoClearStencil),e.render(this.scene,this.camera),null!==this.clearColor&&e.setClearColor(this._oldClearColor),null!==this.clearAlpha&&e.setClearAlpha(i),null!==this.overrideMaterial&&(this.scene.overrideMaterial=s),e.autoClear=a}}},34364:function(e,t,r){r.d(t,{m:function(){return n}});var i=r(72079),s=r(24451),a=r(82552);let o={name:"LuminosityHighPassShader",uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new i.Ilk(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class n extends s.w{constructor(e,t=1,r,n){super(),this.strength=t,this.radius=r,this.threshold=n,this.resolution=void 0!==e?new i.FM8(e.x,e.y):new i.FM8(256,256),this.clearColor=new i.Ilk(0,0,0),this.needsSwap=!1,this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let l=Math.round(this.resolution.x/2),u=Math.round(this.resolution.y/2);this.renderTargetBright=new i.dd2(l,u,{type:i.cLu}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let e=0;e<this.nMips;e++){let t=new i.dd2(l,u,{type:i.cLu});t.texture.name="UnrealBloomPass.h"+e,t.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(t);let r=new i.dd2(l,u,{type:i.cLu});r.texture.name="UnrealBloomPass.v"+e,r.texture.generateMipmaps=!1,this.renderTargetsVertical.push(r),l=Math.round(l/2),u=Math.round(u/2)}this.highPassUniforms=i.rDY.clone(o.uniforms),this.highPassUniforms.luminosityThreshold.value=n,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new i.jyz({uniforms:this.highPassUniforms,vertexShader:o.vertexShader,fragmentShader:o.fragmentShader}),this.separableBlurMaterials=[];let h=[6,10,14,18,22];l=Math.round(this.resolution.x/2),u=Math.round(this.resolution.y/2);for(let e=0;e<this.nMips;e++)this.separableBlurMaterials.push(this._getSeparableBlurMaterial(h[e])),this.separableBlurMaterials[e].uniforms.invSize.value=new i.FM8(1/l,1/u),l=Math.round(l/2),u=Math.round(u/2);this.compositeMaterial=this._getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=t,this.compositeMaterial.uniforms.bloomRadius.value=.1,this.compositeMaterial.uniforms.bloomFactors.value=[1,.8,.6,.4,.2],this.bloomTintColors=[new i.Pa4(1,1,1),new i.Pa4(1,1,1),new i.Pa4(1,1,1),new i.Pa4(1,1,1),new i.Pa4(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,this.copyUniforms=i.rDY.clone(a.C.uniforms),this.blendMaterial=new i.jyz({uniforms:this.copyUniforms,vertexShader:a.C.vertexShader,fragmentShader:a.C.fragmentShader,premultipliedAlpha:!0,blending:i.WMw,depthTest:!1,depthWrite:!1,transparent:!0}),this._oldClearColor=new i.Ilk,this._oldClearAlpha=1,this._basic=new i.vBJ,this._fsQuad=new s.T(null)}dispose(){for(let e=0;e<this.renderTargetsHorizontal.length;e++)this.renderTargetsHorizontal[e].dispose();for(let e=0;e<this.renderTargetsVertical.length;e++)this.renderTargetsVertical[e].dispose();this.renderTargetBright.dispose();for(let e=0;e<this.separableBlurMaterials.length;e++)this.separableBlurMaterials[e].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this._basic.dispose(),this._fsQuad.dispose()}setSize(e,t){let r=Math.round(e/2),s=Math.round(t/2);this.renderTargetBright.setSize(r,s);for(let e=0;e<this.nMips;e++)this.renderTargetsHorizontal[e].setSize(r,s),this.renderTargetsVertical[e].setSize(r,s),this.separableBlurMaterials[e].uniforms.invSize.value=new i.FM8(1/r,1/s),r=Math.round(r/2),s=Math.round(s/2)}render(e,t,r,i,s){e.getClearColor(this._oldClearColor),this._oldClearAlpha=e.getClearAlpha();let a=e.autoClear;e.autoClear=!1,e.setClearColor(this.clearColor,0),s&&e.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this._fsQuad.material=this._basic,this._basic.map=r.texture,e.setRenderTarget(null),e.clear(),this._fsQuad.render(e)),this.highPassUniforms.tDiffuse.value=r.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this._fsQuad.material=this.materialHighPassFilter,e.setRenderTarget(this.renderTargetBright),e.clear(),this._fsQuad.render(e);let o=this.renderTargetBright;for(let t=0;t<this.nMips;t++)this._fsQuad.material=this.separableBlurMaterials[t],this.separableBlurMaterials[t].uniforms.colorTexture.value=o.texture,this.separableBlurMaterials[t].uniforms.direction.value=n.BlurDirectionX,e.setRenderTarget(this.renderTargetsHorizontal[t]),e.clear(),this._fsQuad.render(e),this.separableBlurMaterials[t].uniforms.colorTexture.value=this.renderTargetsHorizontal[t].texture,this.separableBlurMaterials[t].uniforms.direction.value=n.BlurDirectionY,e.setRenderTarget(this.renderTargetsVertical[t]),e.clear(),this._fsQuad.render(e),o=this.renderTargetsVertical[t];this._fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,e.setRenderTarget(this.renderTargetsHorizontal[0]),e.clear(),this._fsQuad.render(e),this._fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,s&&e.state.buffers.stencil.setTest(!0),this.renderToScreen?e.setRenderTarget(null):e.setRenderTarget(r),this._fsQuad.render(e),e.setClearColor(this._oldClearColor,this._oldClearAlpha),e.autoClear=a}_getSeparableBlurMaterial(e){let t=[],r=e/3;for(let i=0;i<e;i++)t.push(.39894*Math.exp(-.5*i*i/(r*r))/r);return new i.jyz({defines:{KERNEL_RADIUS:e},uniforms:{colorTexture:{value:null},invSize:{value:new i.FM8(.5,.5)},direction:{value:new i.FM8(.5,.5)},gaussianCoefficients:{value:t}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				#include <common>

				varying vec2 vUv;

				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {

					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;

					for ( int i = 1; i < KERNEL_RADIUS; i ++ ) {

						float x = float( i );
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += ( sample1 + sample2 ) * w;

					}

					gl_FragColor = vec4( diffuseSum, 1.0 );

				}`})}_getCompositeMaterial(e){return new i.jyz({defines:{NUM_MIPS:e},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`

				varying vec2 vUv;

				void main() {

					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

				}`,fragmentShader:`

				varying vec2 vUv;

				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor( const in float factor ) {

					float mirrorFactor = 1.2 - factor;
					return mix( factor, mirrorFactor, bloomRadius );

				}

				void main() {

					// 3.0 for backwards compatibility with previous alpha-based intensity
					vec3 bloom = 3.0 * bloomStrength * (
						lerpBloomFactor( bloomFactors[ 0 ] ) * bloomTintColors[ 0 ] * texture2D( blurTexture1, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 1 ] ) * bloomTintColors[ 1 ] * texture2D( blurTexture2, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 2 ] ) * bloomTintColors[ 2 ] * texture2D( blurTexture3, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 3 ] ) * bloomTintColors[ 3 ] * texture2D( blurTexture4, vUv ).rgb +
						lerpBloomFactor( bloomFactors[ 4 ] ) * bloomTintColors[ 4 ] * texture2D( blurTexture5, vUv ).rgb
					);

					float bloomAlpha = max( bloom.r, max( bloom.g, bloom.b ) );
					gl_FragColor = vec4( bloom, bloomAlpha );

				}`})}}n.BlurDirectionX=new i.FM8(1,0),n.BlurDirectionY=new i.FM8(0,1)},82552:function(e,t,r){r.d(t,{C:function(){return i}});let i={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`}}}]);