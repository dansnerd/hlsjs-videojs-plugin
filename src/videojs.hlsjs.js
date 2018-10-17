import Hls from 'hls.js';
import videojs from 'video.js'; // resolved UMD-wise through webpack

(function (videojs) {

  /**
   * hls.js source handler
   * @param source
   * @param tech
   * @constructor
   */
  class Html5HlsJS {

    constructor(source, tech) {

      var options = tech.options_;
      var el = tech.el();
      var hls = this.hls = new Hls(options.hlsjsConfig);

      /**
       * creates an error handler function
       * @returns {Function}
       */
      function errorHandlerFactory() {
        var _recoverDecodingErrorDate = null;
        var _recoverAudioCodecErrorDate = null;

        return function() {
          var now = Date.now();

          if (!_recoverDecodingErrorDate || (now - _recoverDecodingErrorDate) > 2000) {
            _recoverDecodingErrorDate = now;
            hls.recoverMediaError();
          }
          else if (!_recoverAudioCodecErrorDate || (now - _recoverAudioCodecErrorDate) > 2000) {
            _recoverAudioCodecErrorDate = now;
            hls.swapAudioCodec();
            hls.recoverMediaError();
          }
          else {
            console.error('Error loading media: File could not be played');
          }
        };
      }

      // create separate error handlers for hlsjs and the video tag
      var hlsjsErrorHandler = errorHandlerFactory();
      var videoTagErrorHandler = errorHandlerFactory();

      // listen to error events coming from the video tag
      el.addEventListener('error', function(e) {
        var mediaError = e.currentTarget.error;

        if (mediaError.code === mediaError.MEDIA_ERR_DECODE) {
          videoTagErrorHandler();
        }
        else {
          console.error('Error loading media: File could not be played');
        }
      });

      // update live status on level load
      hls.on(Hls.Events.LEVEL_LOADED, function(event, data) {
        this.duration = data.details.live ? Infinity : data.details.totalduration;
      });

      // try to recover on fatal errors
      hls.on(Hls.Events.ERROR, function(event, data) {
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

      Object.keys(Hls.Events).forEach(function(key) {
        var eventName = Hls.Events[key];
        hls.on(eventName, function(event, data) {
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
        el.addTextTrack = function() {
          return tech.addTextTrack.apply(tech, arguments);
        };
      }

      // attach hlsjs to videotag
      hls.attachMedia(el);
      hls.loadSource(source.src);
    }

    /**
     * Returns duration of media
     */
    duration() {
      return this.duration || el.duration || 0;
    }

    /**
     * Dispose
     */
    dispose() {
      this.hls.destroy();
    }

  }

  const HLS_MIME_TYPE_REGEX = /^application\/(x-mpegURL|vnd\.apple\.mpegURL)$/i;
  const HLS_M3U8_EXT_REGEX = /\.m3u8/i;

  class HlsSourceHandler {

    static canHandleSource(source) {
      if (source.skipContribHlsJs) {
        return '';
      }
      else if (HLS_MIME_TYPE_REGEX.test(source.type)) {
        return 'probably';
      }
      else if (HLS_M3U8_EXT_REGEX.test(source.src)) {
        return 'maybe';
      }
      else {
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
  videojs = videojs && videojs.default || videojs;

  if (videojs) {
    var html5Tech = videojs.getTech && videojs.getTech('Html5'); // videojs6 (partially on videojs5 too)

    html5Tech = html5Tech || (videojs.getComponent && videojs.getComponent('Html5')); // videojs5

    if (html5Tech) {
      html5Tech.registerSourceHandler(HlsSourceHandler, 0);
    }
  }
  else {
    console.warn('videojs-contrib-hls.js: Couldn\'t find find window.videojs nor require(\'video.js\')');
  }

})(videojs)

