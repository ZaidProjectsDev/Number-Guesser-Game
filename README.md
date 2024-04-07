# Number Guesser Game!

## Student Project for HR Rotterdam

### Uses:
- Google Mediapipe HandLandmarker
- ML5.js
- Material GUI

## Installation and Usage

1. Clone this repository.
2. Open the respective folder for the program you wish to run.
3. Run the `index.html` as a live server:
    - In VS Code, right click on it in the Explorer window and click "Open With Live Server"
    - In PHPStorm, right click on it and click "Run 'index.html (Javascript)'"

## Running the Game

- To run the Game, open the `game` folder and follow the Run instructions listed above.

## Collecting Pose Data

- To collect pose data, run the `dataset_collection` program in the `dataset_collection` folder.

## Training a Model

- To train a model, run the `training` program in the `training` folder.

## Testing the Model

- To test the model you trained, send the generated model from the `training` folder to the `model` folder of the testing program.

## Using the Model in the Game

- To use the model in the game, put the model generated from training into the `model` folder of the game.

## Important

- Uses Google Mediapipe Hand Landmark detection as a basis for the code.
- Functions such as `download()`, `generateHtmlForLabels()`, `toggleButtonVisibility()` and some elements of the `style_css` (the gradient effect for the game) were partially generated with AIs such as Microsoft Bing Copilot, Mistral local via KoboldCPP, and ChatGPT GPT4 paid.