/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

// declare web audio api variables:
let audioContext;
let drumGainNode;
let synthGainNode;
let oscillator;
let clock;
let isPlaying = false;
let drumSounds = ["hh1", "kick1", "snare1"];
let synthSounds = [
  "s-asharp", "s-csharp", "s-csharplow",
  "s-dsharp", "s-dsharplow", "s-fsharp",
  "s-fsharphigh", "s-gsharp"
];
let buffers = {};
let tempo = 60;
let totalBeats = 16;
let beats = {
  "hh1": {}, "kick1": {}, "snare1": {},
  "s-asharp": {}, "s-csharp": {}, "s-csharplow": {},
  "s-dsharp": {}, "s-dsharplow": {}, "s-fsharp": {},
  "s-fsharphigh": {}, "s-gsharp": {}
};
let allEvents = [];
let uiEvent;
let startTime;
// START BETA VARS //
let rhythmIndex = 1;
let noteTime = 0.0;
let timerWorker = null;
let prevAnimTime = -1;

document.addEventListener('DOMContentLoaded', () => {
  setupAudioContext();
  setupClickHandlers();
  setupSlideHandlers();

  drumSounds.forEach( (sound) => {
    loadDrumSound(sound);
  });

  synthSounds.forEach( (sound) => {
    loadSynthSound(sound);
  });

  startWorker();

  //START TEST//
  window.beats = beats;
  // window.buffers = buffers;
  window.isPlaying = isPlaying;
  //END TEST//
});

const startWorker = () => {
  let timerWorkerBlob = new Blob([
    "let timeoutID=0;function schedule(){timeoutID=setTimeout(function(){postMessage('schedule'); schedule();},100);} onmessage = function(e) { if (e.data == 'start') { if (!timeoutID) schedule();} else if (e.data == 'stop') {if (timeoutID) clearTimeout(timeoutID); timeoutID=0;};}"
  ]);

  let timerWorkerBlobURL = window.URL.createObjectURL(timerWorkerBlob);

  timerWorker = new Worker(timerWorkerBlobURL);
  timerWorker.onmessage = (e) => {
    schedule();
  };
  timerWorker.postMessage('init');
};

// Set up audio context, gain nodes for both drums and synth, and connect them
const setupAudioContext = () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  audioContext = new AudioContext();
  drumGainNode = audioContext.createGain();
  synthGainNode = audioContext.createGain();
  drumGainNode.connect(audioContext.destination);
  synthGainNode.connect(audioContext.destination);
};

const handlePlay = (e) => {
  noteTime = 0.0;
  startTime = audioContext.currentTime + 0.005;
  schedule();
  timerWorker.postMessage("start");
};

const handlePause = () => {
  timerWorker.postMessage("stop");
  rhythmIndex = 1;
  $(".light").removeClass("currently-playing");

};

const playNote = (sound, time) => {
  let bufferNode = buffers[sound].createNode();
  bufferNode.start(time);
};

const schedule = () => {
  let currentTime = audioContext.currentTime;
  // The sequence starts at startTime, so normalize currentTime so that it's 0 at the start of the sequence.
  currentTime -= startTime;
  while (noteTime < currentTime + 0.120) {
    // Convert noteTime to context time.
    let contextPlayTime = noteTime + startTime;

    // Kick
    if (beats["kick1"][rhythmIndex]) {
      playNote("kick1", contextPlayTime);
    }

    // Snare
    if (beats["snare1"][rhythmIndex]) {
        playNote("snare1", contextPlayTime);
    }

    // Hihat
    if (beats["hh1"][rhythmIndex]) {
        // Pan the hihat according to sequence position.
        playNote("hh1", contextPlayTime);
    }

    // // SYNTHS
    if (beats["s-asharp"][rhythmIndex]) {
        playNote("s-asharp", contextPlayTime);
    }

    if (beats["s-csharp"][rhythmIndex]) {
        playNote("s-csharp", contextPlayTime);
    }

    if (beats["s-csharplow"][rhythmIndex]) {
        playNote("s-csharplow", contextPlayTime);
    }

    if (beats["s-dsharp"][rhythmIndex]) {
        playNote("s-dsharp", contextPlayTime);
    }

    if (beats["s-dsharplow"][rhythmIndex]) {
        playNote("s-dsharplow", contextPlayTime);
    }

    if (beats["s-fsharp"][rhythmIndex]) {
        playNote("s-fsharp", contextPlayTime);
    }

    if (beats["s-fsharphigh"][rhythmIndex]) {
        playNote("s-fsharphigh", contextPlayTime);
    }

    if (beats["s-gsharp"][rhythmIndex]) {
        playNote("s-gsharp", contextPlayTime);
    }


    if (noteTime !== prevAnimTime) {
        prevAnimTime = noteTime;
        animateUi((rhythmIndex + 15) % 16 + 1);
    }

    nextNote();
  }
};

const animateUi = (beat) => {
  let prevBeat = (beat + 14) % 16 + 1;

  $(`#light-${beat}`).addClass("currently-playing");
  $(`#light-${prevBeat}`).removeClass("currently-playing");
};

const nextNote = () => {
  let beatTime = 60.0 / tempo;
  rhythmIndex++;
  if (rhythmIndex > totalBeats) {
    rhythmIndex = 1;
  }

  noteTime += 0.25 * beatTime;
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

// Schedule the node to play its sound on the given beat
const activateNode = (beat, sound) => {
  beats[sound][beat] = true;
};

const deactivateNode = (beat, sound) => {
  beats[sound][beat] = false;
};

const setupSlideHandlers = () => {
  // Display tempo upon slider value change
  // Also call changeTempo to timeStretch scheduled events
  const $tempoLabel = $("#tempo-value");
  const $tempoSlider = $("#tempo-slider");
  $tempoSlider.on("input change", () => {
    let val = $tempoSlider.val();
    $tempoLabel.text(val/2);
    changeTempo(val/4);
  });

  //Link drum and synth gains to their respective sliders
  const $drumGainLabel = $("#drum-gain-value");
  const $drumGainSlider = $("#drum-gain-slider");
  $drumGainSlider.on("input", () => {
    let val = $drumGainSlider.val();
    $drumGainLabel.text(val/10);
    drumGainNode.gain.value = val / 110;
  });

  const $synthGainLabel = $("#synth-gain-value");
  const $synthGainSlider = $("#synth-gain-slider");
  $synthGainSlider.on("input", () => {
    let val = $synthGainSlider.val();
    $synthGainLabel.text(val/10);
    synthGainNode.gain.value = val / 110;
  });
};

const changeTempo = (newTempo) => {
  tempo = newTempo;
};


//Load the drum sounds and connect them to drum node
const loadDrumSound = (instrumentName) => {
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
        source.connect(drumGainNode);
        return source;
      };
      buffers[instrumentName] = { createNode };
    });
  };

  // Actually send the request
  oReq.send();
};

const loadSynthSound = (instrumentName) => {
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
        source.connect(synthGainNode);
        return source;
      };
      buffers[instrumentName] = { createNode };
    });
  };

  // Actually send the request
  oReq.send();
};


// End of document


/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map