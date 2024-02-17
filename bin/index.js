#!/usr/bin/env node

import fs from "fs";
import * as readline from "readline";
import path from "path";
import cliProgress from "cli-progress";

const dataFolderPath = path.join(
  "C:",
  "Users",
  "yashw",
  "Documents",
  "Text-to-speech-CLA-data"
);


console.log(`
████████╗███████╗██╗  ██╗████████╗    ████████╗ ██████╗     ███████╗██████╗ ███████╗███████╗ ██████╗██╗  ██╗
╚══██╔══╝██╔════╝╚██╗██╔╝╚══██╔══╝    ╚══██╔══╝██╔═══██╗    ██╔════╝██╔══██╗██╔════╝██╔════╝██╔════╝██║  ██║
   ██║   █████╗   ╚███╔╝    ██║          ██║   ██║   ██║    ███████╗██████╔╝█████╗  █████╗  ██║     ███████║
   ██║   ██╔══╝   ██╔██╗    ██║          ██║   ██║   ██║    ╚════██║██╔═══╝ ██╔══╝  ██╔══╝  ██║     ██╔══██║
   ██║   ███████╗██╔╝ ██╗   ██║          ██║   ╚██████╔╝    ███████║██║     ███████╗███████╗╚██████╗██║  ██║
   ╚═╝   ╚══════╝╚═╝  ╚═╝   ╚═╝          ╚═╝    ╚═════╝     ╚══════╝╚═╝     ╚══════╝╚══════╝ ╚═════╝╚═╝  ╚═╝
                                                                                                            
`)

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

if (inputText.length>0) {
  console.log("\n Converting Text to Speech !\n");
}else{
  console.log("\n Invalid Input !\n");
  process.exit(1);
}

const requestHuggingFace = async (data) => {
  try {
    const response = await fetch(
      "https://api-inference.huggingface.co/models/facebook/mms-tts-eng",
      {
        headers: {
          Authorization: "Bearer <Your_Access_Token>",
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
