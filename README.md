# Shmethan: The Mystical Audio Sequencer
[Live Demo](http://ethannkschneider.me/shmethan/)  


Shmethan is an audio sequencer built using the basic Web Audio API, JavaScript, jQuery, HTML, and CSS. Users can click on purple squares to create drum and synth patterns. Clicking on the green circle will start the beat, and clicking again will stop it. You can edit the beat while it's playing, too. Sliders on the bottom right control the beat's tempo, the volumes of the drum and synth samples, and a simple audio effect called 'Magic Sauce' (slap-back delay, feedback, and compression).

![Using Shmethan](https://github.com/ethannkschneider/ecto-drum/blob/master/images/shmethan_gif.gif)

## Web Audio API
The core of the audio sequencing consists in scheduling audio events to be played at specific moments in time. This is done using the method outlined in Chris Wilson's [A Tale of Two Clocks](https://www.html5rocks.com/en/tutorials/audio/scheduling/). The basic idea is to use the built-in Web Audio Api clock to precisely schedule audio events, and to use the powerful but less-precise JavaScript `setTimeout` function to call the schedule function repeatedly. This is accomplished using a Web Worker that runs in a separate global context so it doesn't interfere with the program in the main thread. I used Chris Wilson's [midi drum machine](https://github.com/cwilso/MIDIDrums) as reference for the Web Worker.

## Audio Samples
The audio samples are hosted on github and are loaded into the program using an `XMLHttpRequest`. A `buffers` hash stores `createNode` functions that, when invoked, return audio nodes connected to the user's speakers (i.e. `audioContext.destination`).

````javascript
const loadSynthSound = (instrumentName) => {
  const oReq = new XMLHttpRequest();
  oReq.open('GET', 'https://raw.githubusercontent.com/ethannkschneider/ecto-drum/master/audio_files/' + instrumentName + ".mp3", true);
  oReq.responseType = 'arraybuffer';

  oReq.onload = () => {
    audioContext.decodeAudioData(oReq.response, (audioBuffer) => {
      let createNode = function() {
        let source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(synthGainNode);
        return source;
      };
      buffers[instrumentName] = { createNode };
    });
  };

  oReq.send();
};
````

I referenced [this example drum machine](http://sebpiq.github.io/WAAClock/demos/beatSequence.html) for the sample loading functions.

## Demo Beats
Each purple square (or node) on the sequencer is a separate `div` element on the page. To create demo beats, I added classes to the elements that I wanted in each beat, and then added a `click` event listener on the demo buttons that resets the grid and then 'clicks' each node in the beat.

````javascript
$(".grid-node").click( (e) => {
  let $node = $(e.target);
  let nodeBeat = $node.data("beat");
  let nodeSound = $node.data("sound");
  $node.toggleClass("clicked-node");
  $node.hasClass("clicked-node") ?
    activateNode(nodeBeat, nodeSound) : deactivateNode(nodeBeat, nodeSound);
});

//RESET and DEMO BEAT buttons
$("#reset").click( (e) => {
  let $clickedNodes = $(".clicked-node");
  $clickedNodes.click();
});
// I added specific classes to nodes that are in demo beats
// First reset, the board, then click demo nodes
$("#demo1").click( (e) => {
  $("#reset").click();
  $(".demo-beat-one").click();
});

$("#demo2").click( (e) => {
  $("#reset").click();
  $(".demo-beat-two").click();
});
````

## Process and References
For this project, I decided not to use a high-level audio library (like Tone.js) because I wanted to learn how the Web Audio Api works at a lower level. When I started out, I planned on using a smaller library called [WAAClock](https://github.com/sebpiq/WAAClock) to help with note scheduling. However, I ran into some issues implementing this API (e.g. the beat not starting at the beginning), so I decided to switch to using the basic Web Audio Api in order to have more control of the audio scheduling.  

The main references I used in creating this sequencer were both by Chris Wilson: his excellent article [A Tale of Two Clocks](https://www.html5rocks.com/en/tutorials/audio/scheduling/) and his related take on a [midi drum machine](https://github.com/cwilso/MIDIDrums).

I also made heavy use of [this gradient generator](http://www.colorzilla.com/gradient-editor/) to create most of the color gradients.
