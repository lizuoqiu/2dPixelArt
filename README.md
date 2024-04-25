# Interactive editing of Monocular Depths

This folder contains the following subdirectories:

- `2dPixelArt`: This contains the source files for the web editing application.
- `sample_images`: This contains 3 sample RGB images with their corresponding depth maps for test purposes.

## Setting up the interface

This application requires NodeJs to run. Follow the installation guide below to setup Nodejs and its dependencies.

NOTE: This application runs only on the web browser and does not interact with a backend server.

### BackEnd Setup
Our backend server is running at Flask API and we introduce the Omidata as AI surface normal estimator.

### Initial Environment Setup
We have pre-set environment file on root repository, please use conda to manage environment:
- `conda env create -f environment.yml`
After set the conda environment, you need to download the pretrained models from:

https://drive.usercontent.google.com/download?id=1wNxVO4vVbDEMEpnAi_jwQObf2MFodcBR&authuser=0

And place to `python/omnidata_main/omnidata_tools/torch/pretrained_models`

Or you can use the Script to download the models:

`sh python/omnidata_main/omnidata_tools/torchpython/omnidata_main/omnidata_tools/torch/tools/download_depth_models.sh`

`sh python/omnidata_main/omnidata_tools/torch/tools/download_surface_normal_models.sh`

It will create the folder and download the models.

### Back-end Start
Use following command to start the web server:

`cd python`

`python passing_api.py`

### Installation

Download and install Nodejs from the [official website](https://nodejs.org/en/download/).
<br>
Test if installation was successful by running the following on the terminal:

- `node -v`: The system should display the Node.js version installed on your system
- `npm -v`: The system should display the NPM version installed on your system

### Yarn Setup

Run the following scripts on the terminal to setup `yarn`:

- `npm install -g npm`: Setup `npm` globally
- `npm install --global yarn`: Setup `yarn` globally

## Available Scripts

In the `2dPixelArt` directory, you can run:

### `yarn install` or `yarn`

This command downloads the node module dependencies for the depth editing application.

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

## Issues

`Yarn` breaks for Nodejs 17.

### Solution

Run `export NODE_OPTIONS=--openssl-legacy-provider` on the terminal.

<br>

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
