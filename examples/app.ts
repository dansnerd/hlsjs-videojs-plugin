import * as Hls from 'hls.js';
import videojs from 'video.js';
import * as HlsjsVideojsPlugin from '../dist/HlsjsVideojsPluginExternal.min';

var DEBUG_LOG_ENABLED = true;

HlsjsVideojsPlugin(Hls, videojs); // run this anywhere before calling videojs first

export default function run() {

    var player = videojs('#player', {
        html5: {
            hlsjsConfig: {
                debug: DEBUG_LOG_ENABLED
            }
        }
    });
}
