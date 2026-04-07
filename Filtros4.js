const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

const upload = document.getElementById("upload");
const btnNoise = document.getElementById("noise");
const btnSalt = document.getElementById("salt");
const btnBlur = document.getElementById("blur");
const btnMedian = document.getElementById("median");
const btnReset = document.getElementById("reset");

const noiseRange = document.getElementById("noiseRange");
const saltRange = document.getElementById("saltRange");
const blurRange = document.getElementById("blurRange");
const medianRange = document.getElementById("medianRange");

let originalImage = null;

upload.addEventListener("change", function (e) {
    const file = e.target.files[0];
    const img = new Image();

    img.onload = function () {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        originalImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
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
}

function applyFilters() {
    if (!originalImage) return;

    // Siempre volver a la original
    ctx.putImageData(originalImage, 0, 0);

    // Ruido
    for (let i = 0; i < noiseRange.value; i++) {
        addGaussianNoise();
    }

    // Sal y pimienta
    for (let i = 0; i < saltRange.value; i++) {
        addSaltPepper();
    }

    // Blur
    for (let i = 0; i < blurRange.value; i++) {
        blur();
    }

    // Mediana
    for (let i = 0; i < medianRange.value; i++) {
        medianFilter();
    }
}

//Reset
function resetImage() {
    if (originalImage) {
        ctx.putImageData(originalImage, 0, 0);
    }
}

noiseRange.oninput = applyFilters;
saltRange.oninput = applyFilters;
blurRange.oninput = applyFilters;
medianRange.oninput = applyFilters;

btnNoise.onclick = addGaussianNoise;
btnSalt.onclick = addSaltPepper;
btnBlur.onclick = blur;
btnMedian.onclick = medianFilter;
btnReset.onclick = resetImage;

btnReset.onclick = () => {
    noiseRange.value = 0;
    saltRange.value = 0;
    blurRange.value = 0;
    medianRange.value = 0;

    if (originalImage) {
        ctx.putImageData(originalImage, 0, 0);
    }
};