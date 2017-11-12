
// const setupClock = () => {
//   // Initialize the WAAClock
//   clock = new WAAClock(audioContext, {toleranceEarly: 0.1});
// };

// const handlePlay = () => {
//   clock.start();
//   startTime = audioContext.currentTime;
//   let nextUiBeatTime = nextBeatTime(0);
//   uiEvent = clock.callbackAtTime(activateUi, nextUiBeatTime)
//    .repeat(beatTime)
//    .tolerance({late: 100});
//   // Starting the clock clears all prior events, so we reactivate here.
//   // BUT, it won't clear our array of events, so I do it manually:
//   allEvents = [];
//   allEvents.push(uiEvent);
//   activateNodes();
// };

// const handlePause = () => {
//   clock.stop();
//   deactivateNodes();
// };
//
// const activateUi = () => {
//   let uiBeat = nextBeatTime(0);
//   let $currentNodes = $(`*[data-beat="${uiBeat}"]`);
//   console.log(`Beat: ${uiBeat}`);
//   $currentNodes.fadeTo(100, 0.3, function() { $(this).fadeTo(100, 1.0); });
// };

// Iterate through all clicked nodes, pull out their data-attributes,
// and activate.
// const activateNodes = () => {
//   const $clickedNodes = $(".clicked-node");
//   $clickedNodes.each ( function(index, el) {
//     let beat = $(this).data("beat");
//     let sound = $(this).data("sound");
//     activateNode(beat, sound);
//   });
// };
//
// const deactivateNodes = () => {
//   const $clickedNodes = $(".clicked-node");
//   $clickedNodes.each ( function(index, el) {
//     let beat = $(this).data("beat");
//     let sound = $(this).data("sound");
//     deactivateNode(beat, sound);
//   });
// };
