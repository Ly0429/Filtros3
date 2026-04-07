const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const upload = document.getElementById("upload");
const btnNoise = document.getElementById("noise");
const btnSalt = document.getElementById("salt");
const btnBlur = document.getElementById("blur");
const btnMedian = document.getElementById("median");
const btnBrightness = document.getElementById("btnBrightness");
const btnContrast = document.getElementById("btnContrast");
const btnSaturation = document.getElementById("btnSaturation");
const btnReset = document.getElementById("reset");


// SLIDERS
const sliderBrightness = document.getElementById("sliderBrightness");
const sliderContrast = document.getElementById("sliderContrast");
const sliderSaturation = document.getElementById("sliderSaturation");
const sliderNoise = document.getElementById("sliderNoise");
const sliderSalt = document.getElementById("sliderSalt");
const sliderBlur = document.getElementById("sliderBlur");
const sliderMedian = document.getElementById("sliderMedian");

let originalImage = null;

upload.addEventListener("change", function (e) {
    const file = e.target.files[0];
    const img = new Image();

    img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        originalImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
        currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }
    img.src = URL.createObjectURL(file);
});

function clamp(v) {
    return Math.max(0, Math.min(255, v));
}

function addGaussianNoise() {
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {

        let noise = (Math.random() - 0.5) * 50;
        data[i] = clamp(data[i] + noise);
        data[i + 1] = clamp(data[i + 1] + noise);
        data[i + 2] = clamp(data[i + 2] + noise);
    }
    ctx.putImageData(imageData, 0, 0);
    currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

// Filtro sal y pimienta
function addSaltPepper() {
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {

        if (Math.random() < 0.05) {

            let value = Math.random() < 0.5 ? 0 : 255;
            data[i] = data[i + 1] = data[i + 2] = value;
        }
    }
    ctx.putImageData(imageData, 0, 0);
    currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);

}

// Blur (promedio)
function blur() {
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;
    let copy = new Uint8ClampedArray(data);

    let w = canvas.width;
    let h = canvas.height;

    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {

            let i = (y * w + x) * 4;
            let r = 0, g = 0, b = 0;

            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    let ii = ((y + ky) * w + (x + kx)) * 4;
                    r += copy[ii];
                    g += copy[ii + 1];
                    b += copy[ii + 2];

                }
            }

            data[i] = clamp(r / 9);
            data[i + 1] = clamp(g / 9);
            data[i + 2] = clamp(b / 9);

        }
    }
    ctx.putImageData(imageData, 0, 0);
    currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
}


// Median filter
function medianFilter() {
    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;
    let copy = new Uint8ClampedArray(data);

    let w = canvas.width;
    let h = canvas.height;

    for (let y = 1; y < h - 1; y++) {
        for (let x = 1; x < w - 1; x++) {

            let i = (y * w + x) * 4;

            let valuesR = [];
            let valuesG = [];
            let valuesB = [];

            for (let ky = - 1; ky <= 1; ky++) {
                for (let kx = - 1; kx <= 1; kx++) {

                    let ii = ((y + ky) * w + (x + kx)) * 4;

                    valuesR.push(copy[ii]);
                    valuesG.push(copy[ii + 1]);
                    valuesB.push(copy[ii + 2]);
                }
            }
            valuesR.sort((a, b) => a - b);
            valuesG.sort((a, b) => a - b);
            valuesB.sort((a, b) => a - b);

            data[i] = valuesR[4];
            data[i + 1] = valuesG[4];
            data[i + 2] = valuesB[4];
        }
    }
    ctx.putImageData(imageData, 0, 0);
    currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

//Los filtros 

function applyBrightness() {
    let value = parseInt(sliderBrightness.value);

    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        data[i] = clamp(data[i] + value);
        data[i + 1] = clamp(data[i + 1] + value);
        data[i + 2] = clamp(data[i + 2] + value);
    }

    ctx.putImageData(imageData, 0, 0);
}

function applyContrast() {
    let value = parseInt(sliderContrast.value);
    let factor = (259 * (value + 255)) / (255 * (259 - value));

    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        data[i] = clamp(factor * (data[i] - 128) + 128);
        data[i + 1] = clamp(factor * (data[i + 1] - 128) + 128);
        data[i + 2] = clamp(factor * (data[i + 2] - 128) + 128);
    }

    ctx.putImageData(imageData, 0, 0);
}

function applySaturation() {
    let value = sliderSaturation.value / 100;

    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {

        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        let gray = 0.3 * r + 0.59 * g + 0.11 * b;

        data[i] = clamp(gray + value * (r - gray));
        data[i + 1] = clamp(gray + value * (g - gray));
        data[i + 2] = clamp(gray + value * (b - gray));
    }

    ctx.putImageData(imageData, 0, 0);
}

let currentImage = null;

function applyAllFilters() {

    if (!currentImage) return;

    let imageData = new ImageData(
        new Uint8ClampedArray(currentImage.data),
        currentImage.width,
        currentImage.height
    );

    let data = imageData.data;

    let brightness = parseInt(sliderBrightness.value);
    let contrast = parseInt(sliderContrast.value);
    let saturation = sliderSaturation.value / 100;

    let factor = (259 * (contrast + 255)) / (255 * (259 - contrast));

    for (let i = 0; i < data.length; i += 4) {

        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];


        // CONTRASTE
        r = factor * (r - 128) + 128;
        g = factor * (g - 128) + 128;
        b = factor * (b - 128) + 128;

        // SATURACIÓN
        let gray = 0.3 * r + 0.59 * g + 0.11 * b;

        r = gray + saturation * (r - gray);
        g = gray + saturation * (g - gray);
        b = gray + saturation * (b - gray);

        // BRILLO
        r += brightness;
        g += brightness;
        b += brightness;

        data[i] = clamp(r);
        data[i + 1] = clamp(g);
        data[i + 2] = clamp(b);
    }

    ctx.putImageData(imageData, 0, 0);
}

function brightnessFilter() {

    let value = parseInt(sliderBrightness.value);

    // 
    if (value === 0) value = 30;

    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        data[i] = clamp(data[i] + value);
        data[i + 1] = clamp(data[i + 1] + value);
        data[i + 2] = clamp(data[i + 2] + value);
    }

    ctx.putImageData(imageData, 0, 0);
    currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function contrastFilter() {

    let value = parseInt(sliderContrast.value);

    if (value === 100) value = 150;

    let factor = (259 * (value + 255)) / (255 * (259 - value));

    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        data[i] = clamp(factor * (data[i] - 128) + 128);
        data[i + 1] = clamp(factor * (data[i + 1] - 128) + 128);
        data[i + 2] = clamp(factor * (data[i + 2] - 128) + 128);
    }

    ctx.putImageData(imageData, 0, 0);
    currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function saturationFilter() {

    let value = sliderSaturation.value / 100;

    if (value === 1) value = 1.5;

    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {

        let r = data[i];
        let g = data[i + 1];
        let b = data[i + 2];

        let gray = 0.3 * r + 0.59 * g + 0.11 * b;

        data[i] = clamp(gray + value * (r - gray));
        data[i + 1] = clamp(gray + value * (g - gray));
        data[i + 2] = clamp(gray + value * (b - gray));
    }

    ctx.putImageData(imageData, 0, 0);
    currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
}

function gaussianNoiseSlider() {
    if (!currentImage) return;

   
    ctx.putImageData(currentImage, 0, 0);

    let intensity = sliderNoise.value;

    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        let noise = (Math.random() - 0.5) * intensity;

        data[i] = clamp(data[i] + noise);
        data[i + 1] = clamp(data[i + 1] + noise);
        data[i + 2] = clamp(data[i + 2] + noise);
    }

    ctx.putImageData(imageData, 0, 0);
}

function saltPepperSlider() {
    if (!currentImage) return;

    ctx.putImageData(currentImage, 0, 0);

    let intensity = sliderSalt.value / 100;

    let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {

        if (Math.random() < intensity) {
            let val = Math.random() < 0.5 ? 0 : 255;
            data[i] = data[i + 1] = data[i + 2] = val;
        }
    }

    ctx.putImageData(imageData, 0, 0);
}

function blurSlider() {
    if (!originalImage) return;

    
    ctx.putImageData(originalImage, 0, 0);

    let times = parseInt(sliderBlur.value);

    for (let t = 0; t < times; t++) {
        blur();
    }
}

function medianSlider() {
    if (!originalImage) return;

    
    ctx.putImageData(originalImage, 0, 0);

    let times = parseInt(sliderMedian.value);

    for (let t = 0; t < times; t++) {
        medianFilter();
    }
}


btnNoise.onclick = addGaussianNoise;
btnSalt.onclick = addSaltPepper;
btnBlur.onclick = blur;
btnMedian.onclick = medianFilter;

btnBrightness.onclick = brightnessFilter;
btnContrast.onclick = contrastFilter;
btnSaturation.onclick = saturationFilter;


sliderNoise.oninput = gaussianNoiseSlider;
sliderSalt.oninput = saltPepperSlider;
sliderBlur.oninput = blurSlider;
sliderMedian.oninput = medianSlider;

btnReset.onclick = () => {
    if (originalImage) {
        ctx.putImageData(originalImage, 0, 0);
        currentImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
    }

    sliderBrightness.value = 0;
    sliderContrast.value = 100;
    sliderSaturation.value = 100;

    sliderBrightness.addEventListener("input", applyAllFilters);
    sliderContrast.addEventListener("input", applyAllFilters);
    sliderSaturation.addEventListener("input", applyAllFilters);

    //Reset
    function resetImage() {
        if (originalImage) {
            ctx.putImageData(originalImage, 0, 0);
        }
    }

};