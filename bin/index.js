#!/usr/bin/env node

import fs from "fs";
import * as readline from "readline";
import cliProgress from "cli-progress";
import path from "path";

const dataFolderPath = path.join(
  "C:",
  "Users",
  "yashw",
  "Documents",
  "Text-to-speech-CLA-data"
);

console.log(`
88888888888                888         888                        d8888               888 d8b          
    888                    888         888                       d88888               888 Y8P          
    888                    888         888                      d88P888               888              
    888   .d88b.  888  888 888888      888888 .d88b.           d88P 888 888  888  .d88888 888  .d88b.  
    888  d8P  Y8b 'Y8bd8P' 888         888   d88""88b         d88P  888 888  888 d88" 888 888 d88""88b 
    888  88888888   X88K   888         888   888  888        d88P   888 888  888 888  888 888 888  888 
    888  Y8b.     .d8""8b. Y88b.       Y88b. Y88..88P       d8888888888 Y88b 888 Y88b 888 888 Y88..88P 
    888   "Y8888  888  888  "Y888       "Y888 "Y88P"       d88P     888  "Y88888  "Y88888 888  "Y88P"  
                                                                                                       
                                                                                                       
`);

try {
  fs.unlinkSync(path.join(dataFolderPath, "audio.mp3"));
} catch (err) {
  console.log(":)");
}
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (query) => {
  return new Promise((resolve) => {
    rl.question(query, resolve);
  });
};

async function getUserChoice() {
  chooseOption = await question(`Select input source:
    1. Load from 'text_Input.txt' file present in this path ${dataFolderPath}
    2. Enter input text manually
    Enter 1 or 2: `);
  console.log(`\nYou chose option ${chooseOption}\n`);

  if (chooseOption === "1") {
    inputText = fs
      .readFileSync(path.join(dataFolderPath, "text_Input.txt"), "utf8")
      .trim();
  } else {
    inputText = await question("Enter your text here : ");
  }

  rl.close();
}
let chooseOption;
let inputText = "";
await getUserChoice();

if (inputText) {
  console.log("\n Converting Text to Speech !\n");
}

const requestHuggingFace = async (data) => {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/mms-tts-eng",
      {
        headers: {
          Authorization: "Bearer <Your Token>",
        },
        method: "POST",
        body: JSON.stringify(data),
      }
    );
    progressBar.update(200); // Update the progress bar to 100% when the response is received
    const result = await response.arrayBuffer();
    progressBar.update(300); // Update the progress bar to 100% when the response is received
    progressBar.stop(); // Stop the progress bar when the response is received
    return result;
  } catch (error) {
    throw new Error("ERROR :: Error in API request:");
  }
};

// Create a new progress bar
const progressBar = new cliProgress.SingleBar(
  {},
  cliProgress.Presets.shades_classic
);

// Start the progress bar
progressBar.start(300, 0);

// Simulate the progress bar moving forward
const progressInterval = setInterval(() => {
  progressBar.increment();
}, 30);

const data = await requestHuggingFace({ inputs: inputText });

// Clear the progress interval
clearInterval(progressInterval);

try {
  fs.writeFileSync(path.join(dataFolderPath, "audio.mp3"), Buffer.from(data));
  console.log("\ncheck for audio.mp3 in this folder", dataFolderPath);
  console.log("\nDone! Check you directory for file!");
} catch (err) {
  console.log("ERROR :: Unable to create file");
}
