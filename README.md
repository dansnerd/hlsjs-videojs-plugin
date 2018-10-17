# HLS plugin for video.js using hls.js
Plays HLS with [video.js](https://github.com/videojs/video.js) on any HTML5 platform, even where it's not natively supported, using  a v0 compatible [hls.js](https://github.com/video-dev/hls.js) library of your choice.

~~This bundled plugin is an **alternative** to the original [videojs-contrib-hls](https://github.com/videojs/videojs-contrib-hls) and runs directly on top of [video.js 5.0+](https://github.com/videojs/video.js).~~ DISAMBIGUATION: `videojs-contrib-hls` is an out-dated plugin supported by Brightcove that is an unrelated HLS implementation.

This plugin implements a videojs source handler for m3u8 files or other HLS mime-type matching source objects.

~~`hls.js` is bundled inside and there is no need to include it in addition.~~

IMPORTANT: The plugin here expects Hls.js to be installed in the global environment or to be injected via your own webpack toolchain.

NOTE: You can disable this behavior and have Hls.js (and even videojs) bundled into this plugin completely, simply by removing the respective `externals` entries in the webpack config file.

NOTE: This plugin was created from code forked-off a [Peer5 implementation](https://github.com/Peer5/videojs-contrib-hls) with the motivation to ensure Hlsjs/videojs API type-safety as well as flexible choice of versions on the user-side; specifically allow using a videojs v7+ distro and latest Hls.js v0 or other compatible distro.

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
