/***
 * @author Stephan Hesse <stephan@emliri.com>
 * @copyright (c) (2018) Stephan Hesse, Emliri
 * @copyright Peer5
 * @license Apache2.0
 *
 * Videojs HLS Source-handler plugin using Hls.js
 */

import * as Hls from 'hls.js';
import videojs from 'video.js'; // resolved UMD-wise through webpack

(function (videojs) {
  type ErrorHandler = () => void;

  /**
   * creates an error handler function
   */
  function makeErrorHandler (hls: Hls): ErrorHandler {
    let _recoverDecodingErrorDate = null;
    let _recoverAudioCodecErrorDate = null;

    return function () {
      let now = Date.now();

      if (!_recoverDecodingErrorDate || (now - _recoverDecodingErrorDate) > 2000) {
        _recoverDecodingErrorDate = now;
        hls.recoverMediaError();
      } else if (!_recoverAudioCodecErrorDate || (now - _recoverAudioCodecErrorDate) > 2000) {
        _recoverAudioCodecErrorDate = now;
        hls.swapAudioCodec();
        hls.recoverMediaError();
      } else {
        console.error('Error loading media: File could not be played');
      }
    };
  }

  /**
   * Videojs Source-handler plugin for Hls.js
   * @class
   * @constructor
   */
  class Html5HlsJS {
    private hls: Hls;
    private el: HTMLMediaElement;
    private _duration: number;

    constructor (source: videojs.Tech.SourceObject, tech: videojs.Tech) {
      const options: videojs.ComponentOptions = tech.options_;
      const el: HTMLMediaElement = this.el = <HTMLMediaElement> tech.el();
      const hls: Hls = this.hls = new Hls((options as any).hlsjsConfig);

      // create separate error handlers for hlsjs and the video tag
      const hlsjsErrorHandler: ErrorHandler = makeErrorHandler(hls);
      const videoTagErrorHandler: ErrorHandler = makeErrorHandler(hls);

      // listen to error events coming from the video tag
      el.addEventListener('error', (e) => {
        const mediaError = this.el.error;
        if (mediaError.code === mediaError.MEDIA_ERR_DECODE) {
          videoTagErrorHandler();
        } else {
          console.error('Error loading media: File could not be played');
        }
      });

      // update live status on level load
      hls.on(Hls.Events.LEVEL_LOADED, (event, data) => {
        this._duration = data.details.live ? Infinity : data.details.totalduration;
      });

      // try to recover on fatal errors
      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            hls.startLoad();
            break;
          case Hls.ErrorTypes.MEDIA_ERROR:
            hlsjsErrorHandler();
            break;
          default:
            console.error('Error loading media: File could not be played');
            break;
          }
        }
      });

      Object.keys(Hls.Events).forEach(function (key) {
        let eventName = Hls.Events[key];
        hls.on(eventName, function (event, data) {
          tech.trigger(eventName, data);
        });
      });

      // Intercept native TextTrack calls and route to video.js directly only
      // if native text tracks are not supported on this browser.
      if (!tech.featuresNativeTextTracks) {
        Object.defineProperty(el, 'textTracks', {
          value: tech.textTracks,
          writable: false
        });
        el.addTextTrack = function () {
          return tech.addTextTrack.apply(tech, arguments);
        };
      }

      // attach hlsjs to videotag
      hls.attachMedia(this.el as HTMLVideoElement);
      hls.loadSource(source.src);
    }

    /**
     * Returns duration of media
     */
    duration (): number {
      return this._duration || this.el.duration || 0;
    }

    /**
     * Dispose
     */
    dispose (): void {
      this.hls.destroy();
    }
  }

  const HLS_MIME_TYPE_REGEX = /^application\/(x-mpegURL|vnd\.apple\.mpegURL)$/i;
  const HLS_M3U8_EXT_REGEX = /\.m3u8/i;

  /**
   * The static plugin factory for our source-handler
   * @class
   */
  class HlsSourceHandlerPlugin {
    static canHandleSource (source) {
      if (source.skipContribHlsJs) {
        return '';
      } else if (HLS_MIME_TYPE_REGEX.test(source.type)) {
        return 'probably';
      } else if (HLS_M3U8_EXT_REGEX.test(source.src)) {
        return 'maybe';
      } else {
        return '';
      }
    }

    static handleSource (source, tech) {
      return new Html5HlsJS(source, tech);
    }

    static canPlayType (type) {
      if (HLS_MIME_TYPE_REGEX.test(type)) {
        return 'probably';
      }

      return '';
    }
  }

  if (!Hls.isSupported()) {
    return;
  }

  // support es6 style import
  videojs = videojs && (videojs as any).default || videojs;

  if (videojs) {
    let html5Tech = videojs.getTech && videojs.getTech('Html5'); // videojs6 (partially on videojs5 too)

    html5Tech = html5Tech || ((videojs.getComponent && videojs.getComponent('Html5')) as any); // videojs5 (we use videojs 7 typings)

    if (html5Tech) {
      (html5Tech as any).registerSourceHandler(HlsSourceHandlerPlugin, 0);
    }
  } else {
    console.warn('videojs-contrib-hls.js: Couldn\'t find find window.videojs nor require(\'video.js\')');
  }
})(videojs);
