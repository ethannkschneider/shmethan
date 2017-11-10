import WAAClock from 'waaclock';

// declare web audio api variables:
let audioContext;
let oscillator;
let clock;
let isPlaying = false;
let sounds = ["hh1", "kick1", "snare1"];
let buffers = {};
let tempo = 120;
let totalBeats = 4;
let beatTime = 60 / tempo;
let barTime = totalBeats * beatTime;
let beats = {
  "hh1": {1: null, 2: null, 3: null, 4: null},
  "kick1": {1: null, 2: null, 3: null, 4: null},
  "snare1": {1: null, 2: null, 3: null, 4: null}
};
let allEvents = [];

document.addEventListener('DOMContentLoaded', () => {
  setupAudioContext();
  setupClock();
  setupClickHandlers();
  setupSlideHandlers();

  sounds.forEach( (sound) => {
    loadSound(sound);
  });
  //START TEST//
  window.beats = beats;
  window.buffers = buffers;
  //END TEST//
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
  clock = new WAAClock(audioContext, {toleranceEarly: 0.1});
};

const setupClickHandlers = () => {
  //Nodes on the sequencer change color when clicked
  //They also either activate or deactive their respective events
  $(".grid-node").click( (e) => {
    let $node = $(e.target);
    let nodeBeat = $node.data("beat");
    let nodeSound = $node.data("sound");
    $node.toggleClass("clicked-node");
    $node.hasClass("clicked-node") ?
      activateNode(nodeBeat, nodeSound) : deactivateNode(nodeBeat, nodeSound);
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

const setupSlideHandlers = () => {
  // Display tempo upon slider value change
  // Also call changeTempo to timeStretch scheduled events
  const $tempoLabel = $("#tempo-value");
  const $tempoSlider = $("#tempo-slider");
  $tempoSlider.on("input change", () => {
    let val = $tempoSlider.val();
    $tempoLabel.text(val);
    changeTempo(val);
  });
};

const changeTempo = (newTempo) => {
  clock.timeStretch(audioContext.currentTime, allEvents, tempo / newTempo);
  tempo = newTempo;
  beatTime = 60 / tempo;
  barTime = totalBeats * beatTime;
};


const nextBeatTime = (beat) => {
  let currentTime = audioContext.currentTime;
  let currentBar = Math.floor(currentTime / barTime);
  let currentBeat = Math.round(currentTime % barTime);
  if (currentBeat < beat) {
    return currentBar * barTime + beat * beatTime;
  } else {
    return (currentBar + 1) * barTime + beat * beatTime;
  }
};

const handlePlay = () => {
  clock.start();
  //Starting the clock clears all prior events, so we reactivate here.
  // BUT, it won't clear our array of events, so I do it manually:
  allEvents = [];
  activateNodes();

};

const handlePause = () => {
  clock.stop();
  deactivateNodes();
};

// Iterate through all clicked nodes, pull out their data-attributes,
// and activate.
const activateNodes = () => {
  const $clickedNodes = $(".clicked-node");
  $clickedNodes.each ( function(index, el) {
    let beat = $(this).data("beat");
    let sound = $(this).data("sound");
    activateNode(beat, sound);
  });
};

const deactivateNodes = () => {
  const $clickedNodes = $(".clicked-node");
  $clickedNodes.each ( function(index, el) {
    let beat = $(this).data("beat");
    let sound = $(this).data("sound");
    deactivateNode(beat, sound);
  });
};

// Schedule the node to play its sound on the given beat
const activateNode = (beat, sound) => {
  let event = clock.callbackAtTime( (newEvent) => {
    let bufferNode = buffers[sound].createNode();
    bufferNode.start(newEvent.deadline);
  }, nextBeatTime(beat));
  event.repeat(barTime);
  event.tolerance({ early: 0.1, late: 0.01});
  beats[sound][beat] = event;
  // Add scheduled event to allEvents so we can timestretch it later
  allEvents.push(event);
  console.log(`allEvents: ${allEvents.length}`);
};

const deactivateNode = (beat, sound) => {
  let event = beats[sound][beat];
  if (event) {
    event.clear();
  }
  beats[sound][beat] = null;
  //Remove event from allEvents so we don't timestretch it later
  let eventIndex = allEvents.indexOf(event);
  allEvents.splice(eventIndex, 1);
  console.log(`allEvents: ${allEvents.length}`);
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
    console.log("Request loaded!");
    audioContext.decodeAudioData(oReq.response, (audioBuffer) => {
      let createNode = function() {
        let source = audioContext.createBufferSource();
        source.buffer = audioBuffer;
        source.connect(audioContext.destination);
        return source;
      };
      buffers[instrumentName] = { createNode };
      console.log("buffer added!");
    });
  };

  // Actually send the request
  oReq.send();
};






// End of document
