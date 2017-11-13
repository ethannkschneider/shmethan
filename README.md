# Shmethan: The Mystical Audio Sequencer
[Live Demo](https://ethannkschneider.github.io/ecto-drum/)
Shmethan is an audio sequencer built using the basic Web Audio Api, JavaScript, jQuery, HTML, and CSS. Users can click on purple squares to create drum and synth patterns. Clicking on the green circle will start the beat, and clicking again will stop it. You can edit the beat while it's playing, too. Sliders on the bottom right control the beat's tempo, the volumes of the drum and synth samples, and a simple audio effect called 'Magic Sauce' (slap-back delay, feedback, and compression).

![Using Shmethan]()

## Process and References
For this project, I decided not to use a high-level audio library (like Tone.js) because I wanted to learn how the Web Audio Api works at a lower level. When I started out, I planned on using a smaller library called [WAAClock](https://github.com/sebpiq/WAAClock) to help with note scheduling. However, I ran into some issues implementing this API (e.g. the beat not starting at the beginning), so I decided to switch to using the basic Web Audio Api in order to have more control of the audio scheduling.  

The main references I used in creating this sequencer were both by Chris Wilson: his excellent article [A Tale of Two Clocks](https://www.html5rocks.com/en/tutorials/audio/scheduling/) and his related take on a [midi drum machine](https://github.com/cwilso/MIDIDrums).

I also made heavy use of [this gradient generator](http://www.colorzilla.com/gradient-editor/) to create most of the color gradients.
