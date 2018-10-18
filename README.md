# HLS plugin for video.js using hls.js
Plays HLS with [video.js](https://github.com/videojs/video.js) on any HTML5 platform, even where it's not natively supported, using  a v0 compatible [hls.js](https://github.com/video-dev/hls.js) library of your choice (or the default bundled one).

~~This bundled plugin is an **alternative** to the original [videojs-contrib-hls](https://github.com/videojs/videojs-contrib-hls) and runs directly on top of [video.js 5.0+](https://github.com/videojs/video.js).~~ DISAMBIGUATION: `videojs-contrib-hls` is an out-dated plugin supported by Brightcove that is an unrelated HLS implementation.

This plugin implements a videojs source handler for m3u8 files or other HLS mime-type matching source objects.

An `hls.js` distro is bundled by default with this plugin and there is no need to include it in addition.

The plugin can also be built without bundling Hls.js (see package-script `npm run build:use-external-hlsjs`). In this case, an Hls.js distro should be installed in the environment, exported as a  `window` property or via your own build toolchain in a CJS/UMD fashion. This should allow to use the Hls.js version of your choice, without having to rebuild the plugin.

See the section `Dependency injection` in this readme.

## Getting Started

Take a look at `examples/index.html` and use the files in `dist` of this git repo.

## Options
hls.js is [very configurable](https://github.com/dailymotion/hls.js/blob/master/API.md#fine-tuning), you may pass in an options object to the source handler at player initialization. You can pass in options just like you would for other parts of video.js:

``` html
<video id=player width=600 height=300 class="video-js vjs-default-skin" controls>
  <source src="https://example.com/index.m3u8" type="application/x-mpegURL">
</video>
<script src="video.js"></script>
<script src="videojs-contrib-hlsjs.min.js"></script>
<script>
    var player = videojs('video', {
        autoplay: true,
        html5: {
            hlsjsConfig: {
                debug: true
            }
        }
    });
</script>
```

## Advanced Usage

### Listening to hls.js events

 events are passed to the tech and can be subscribed to

 ```js
    var player = videojs('video');
    player.tech_.on(Hls.Events.MANIFEST_LOADED, function (e) {
        // do something
    })
 ```

A full list of hls.js events can be found [here](https://github.com/video-dev/hls.js/blob/master/doc/API.md#runtime-events)

### Custom hls.js configuration

**DO NOT USE THIS REF UNLESS YOU KNOW WHAT YOU ARE DOING**

the hls.js instance is exposed on the sourceHandler instance

 ```js
    var player = videojs('video');
    // player.tech_.sourceHandler_.hls is the underlying Hls instance
    player.tech_.sourceHandler_.hls.currentLevel = -1
 ```

## Dependency injection

If Hls.js or videojs are not resolved at declaration time of the plugin in one of the expectable ways, the plugin setup will silently no-op.

To programmatically inject Hlsjs or videojs libraries in a custom way (for example to avoid polluting global namespace and without relying on module-bundler capacities), the declaration can be run explicitely via the setup function exported by the plugin module (supposing you are importing the plugin with a module-bundler):

```
var videojs = require('videojs');
var Hls = require('hls.js');

var hlsVideojsPlugin = require('./path/to/this-plugin-dist');

hlsVideojsPlugin(Hls, videojs /* optional */); // when run without args we'll try to resolve from UMD or window
```

Obviously, you can also still simply load the module in a `script` tag and it will try to resolve dependencies from `window`.

Finally, another option is to build the plugin yourself with Hls.js bundled, and modify the version in the `package.json` to match your choice.

NOTE: This plugin was created from code forked-off a [Peer5 implementation](https://github.com/Peer5/videojs-contrib-hls) with the motivation to ensure Hlsjs/videojs API type-safety as well as flexible choice of versions on the user-side; specifically allow using a videojs v7+ distro and latest Hls.js v0 or other compatible distro.
