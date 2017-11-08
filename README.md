# JS Project Proposal: Ecto-Drum
Ecto-Drum is a web-based drum machine that allows users to create custom beats and download them as .wav files.  
[Here is an example of the concept] (http://www.html5drummachine.com/)

## Functionality & MVP
With Ecto-Drum, users will be able to:
* Start and stop audio
* Create custom rhythms with a simple user interface
* Record and download audio
* Add audio effects to their beats  

This project will also include:
* A production README
* Links to songs that make use of Ecto-Drum (seriously)

## Wireframes
Ecto-Drum will consist of a single screen, with nav-links to my Github and LinkedIn profiles. There will be a grid representing beats in a four-bar or eight-bar phrase. The grid will have rows, representing the kick, snare, hihat, and two percussion sounds. Users can create their own rhythms by clicking on positions on the grid, and then clicking the play button on the right. There will also be a stop button to pause the audio, a and download/record button that allows the user to save the .wav file to their computer. Below the grid, there will be several effects sliders for the user to adjust. Finally, at the bottom of the page there will be links to real songs that make use of Ecto-Synth to create slippery ecto-grooves.

![wireframe](https://github.com/ethannkschneider/ecto-drum/blob/master/Wireframe.png)

## Architecture and Techologies
Ecto-Drum will employ the following technologies:
* Vanilla javascript and/or jQuery for DOM manipulation
* The Web Audio Api for sound creation
* Webpack for bundling js files

In addition to the entry file, there will be at least the following scripts:
* layout.js -- this will be the main file that houses smaller components, including buttons
* grid.js -- this will be responsible for rendering the 8-bar grid

## Implementation Timeline
Day 1:
* Set up basic node modules and webpack
* Set up basic file structure and layout
* Get basic audio to play in the browser
Day 2:
* Get basic user interaction functionality (e.g. play and pause)
* Get very familiar with the Web Audio Api
Day 3:
* Figure out how to implement the basic 8-bar grid in real time
* Continue to improve user interaction capabilities (creating rhythms, etc)
Day 4:
* Sleek styling
* Downloading wav files


## Bonus Features
* Allow users to pick between 8-bar and 16-bar grids
* Add buttons for users to change layout design
* Allow user to change time signatures
* Create an Ecto-Synth!
