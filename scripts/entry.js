// declare web audio api variables:
let audioContext;
let drumGainNode;
let synthGainNode;
let instrumentGain;
let dryGain;
let wetGain;
let feedback;
let compression;
let delay;
let clock;
let isPlaying = false;
//store the file names of sounds to be used
let drumSounds = ["hh1", "kick1", "snare1"];
let synthSounds = [
  "s-asharp", "s-csharp", "s-csharplow",
  "s-dsharp", "s-dsharplow", "s-fsharp",
  "s-fsharphigh", "s-gsharp"
];
//eventually we will store the decoded files in the buffers object
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
let rhythmIndex = 1;
let noteTime = 0.0;
// See https://github.com/cwilso/MIDIDrums for timerWorker info
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

});

// timerWorker citation: https://github.com/cwilso/MIDIDrums
// Chris Wilson is the WAA scheduling guru
// we are using worker to call schedule()
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
  instrumentGain = audioContext.createGain();
  dryGain = audioContext.createGain();
  wetGain = audioContext.createGain();
  drumGainNode.connect(instrumentGain);
  synthGainNode.connect(instrumentGain);
  instrumentGain.connect(dryGain);
  instrumentGain.connect(wetGain);
  dryGain.gain.value = 1;
  wetGain.gain.value = 0;
  // ADD EFFECTS
  dryGain.connect(audioContext.destination);
  compression = audioContext.createDynamicsCompressor();
  feedback = audioContext.createGain();
  feedback.gain.value = 0.19;
  delay = audioContext.createDelay();
  delay.delayTime.value = 0.08;
  wetGain.connect(compression);
  compression.connect(delay);
  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(audioContext.destination);
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
  // See: https://www.html5rocks.com/en/tutorials/audio/scheduling/
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

    // Light up the current beat
    if (noteTime !== prevAnimTime) {
        prevAnimTime = noteTime;
        animateUi((rhythmIndex + 15) % 16 + 1);
    }

    //Increase current beat by one
    nextNote();
  }
};

const animateUi = (beat) => {
// Beats are 1 through 16, so, we do a bit of weird modding to get prevBeat
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

  // Modal
  // See: https://www.w3schools.com/howto/howto_css_modals.asp
  let $modal = $("#modal");
  let $modalButton = $("#modal-button");
  let $span = $(".close");

  $modalButton.click( (e) => {
    $modal.css("display", "block");
  });

  $span.click( (e) => {
    $modal.css("display", "none");
  });

  $(window).click( (e) => {
    if (e.target == $modal[0]) {
      $modal.css("display", "none");
    }
  });
};

// Schedule the node to play its sound on the given beat
// Info about which notes are/should be scheduled is stored in beats
const activateNode = (beat, sound) => {
  beats[sound][beat] = true;
};

const deactivateNode = (beat, sound) => {
  beats[sound][beat] = false;
};

const setupSlideHandlers = () => {
  // Display tempo upon slider value change and call changeTempo
  // The numbers that val is divided by are just accounting for
  // 1) what makes sense to display to user and 2) making sure changeTempo
  // functions smoothly
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

  // Add magic sauce (basically slap-back delay, feedback, and compression)
  const $magicSlideLabel = $("#magic-value");
  const $magicSlider = $("#magic-slider");
  $magicSlider.on("input", () => {
    let val = $magicSlider.val();
    $magicSlideLabel.text(val);
    wetGain.gain.value = val/2;
    dryGain.gain.value = 1 - val/2;
  });
};

// Since the scheduling function uses 'tempo' to schedule notes,
// all we need to do here is set tempo to newTempo
const changeTempo = (newTempo) => {
  tempo = newTempo;
};

// Load the drum sounds and connect them to drum node
// See examples at https://github.com/sebpiq/WAAClock for reference
const loadDrumSound = (instrumentName) => {
  const oReq = new XMLHttpRequest();
  // Make an ajax request to fetch the audio ('true' indicates async)
  // Can't use jQuery here bc it doesn't support ArrayBuffer response types
  oReq.open('GET', 'https://raw.githubusercontent.com/ethannkschneider/ecto-drum/master/audio_files/' + instrumentName + ".mp3", true);
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

// Similar to above
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


// End of document
