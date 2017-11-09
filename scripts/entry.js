import WAAClock from 'waaclock';

// declare web audio api variables:
let audioContext;
let oscillator;
let clock;
let isPlaying = false;
let sounds = ["hh1, kick1, snare1"];
let buffers = {};


document.addEventListener('DOMContentLoaded', () => {

  setupAudioContext();
  setupClock();
  setupClickHandlers();
  sounds.forEach( (sound) => {
    loadSound(sound);
  });
  window.buffers = buffers;
});

const setupAudioContext = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  audioContext = new AudioContext();

  //***TEST START***//
  // oscillator = audioContext.createOscillator();
  // oscillator.connect(audioContext.destination);
  // oscillator.start(audioContext.currentTime);
  // oscillator.stop(audioContext.currentTime + 1);
  //***TEST END***//
};

const setupClock = () => {
  // Initialize the WAAClock
  clock = new WAAClock(audioContext);
};

const setupClickHandlers = () => {
  //Nodes on the sequencer change color when clicked
  $(".grid-node").click( (e) => {
    $(e.target).toggleClass("clicked-node");
  });

  //Start with the pause icon hidden and then toggle on click
  $("#pause").hide();
  $("#play-button").click( (e) => {
    $("#play").toggle();
    $("#pause").toggle();
    isPlaying = !isPlaying;
    // if the audio is paused or not playing, play it!
    isPlaying ? handlePlay() : handlePause();
  });
};

const handlePlay = () => {

};

const handlePause = () => {

};

const loadSound = (instrumentName) => {
  const oReq = new XMLHttpRequest();
  // Make an ajax request to fetch the audio ('true' indicates async)
  // Can't use jQuery bc it doesn't support ArrayBuffer response types
  oReq.open('GET', '../audio_files/' + instrumentName + ".mp3", true);
  oReq.responseType = 'arraybuffer';
  // Once the request is loaded, decode the arraybuffer into an audiobuffer
  // and pass it to the callback, which makes a createNode function to
  // connect a bufferSource to the final destination of audioContext.
  // We then store that particular createNode function in the buffers array
  // so we can access it later.
  oReq.onload = () => {
    audioContext.decodeAudioData(oReq.response, (audioBuffer) => {
      let createNode = function() {
        let source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        return source;
      };
      buffers[instrumentName] = { createNode };
    });
  };

  // Actually send the request
  oReq.send();
};
