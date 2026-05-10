// QR Code Generator logic for QR Code Generator website
const qrInput = document.getElementById('qr-input');
const generateBtn = document.getElementById('generate-btn');
const downloadBtn = document.getElementById('download-btn');
const clearBtn = document.getElementById('clear-btn');
const copyBtn = document.getElementById('copy-btn');
const alertBox = document.getElementById('alert-box');
const loadingHolder = document.getElementById('loading-holder');
const qrCodeContainer = document.getElementById('qrcode');
const colorPicker = document.getElementById('color-picker');
const bgColorPicker = document.getElementById('bg-color-picker');
const themeToggle = document.getElementById('dark-mode-toggle');
const pdfInput = document.getElementById('pdf-input');
const downloadPdfBtn = document.getElementById('download-pdf-btn');
const pdfInfo = document.getElementById('pdf-info');
let qrCode = null;
let uploadedPdfFile = null;
let uploadedPdfBase64 = null;
let currentMode = 'text';

// Initialize theme from localStorage or default to light
function initTheme() {
    const savedTheme = localStorage.getItem('qr-theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    if (themeToggle) {
        themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
    }
}

// Handle tab switching
function setupTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            tabBtns.forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
            currentMode = tabId === 'text-tab' ? 'text' : 'pdf';
            clearContent();
        });
    });
}

// Handle PDF file upload
function handlePdfUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
        showAlert('Please upload a valid PDF file.');
        return;
    }

    uploadedPdfFile = file;
    pdfInfo.textContent = `✓ ${file.name} (${(file.size / 1024).toFixed(2)} KB)`;
    pdfInfo.style.color = '#8ef5a2';
}

// Download uploaded PDF file
function downloadUploadedPdf() {
    if (!uploadedPdfFile) {
        showAlert('No PDF file to download.');
        return;
    }

    const url = URL.createObjectURL(uploadedPdfFile);
    const link = document.createElement('a');
    link.href = url;
    link.download = uploadedPdfFile.name;
    link.click();
    URL.revokeObjectURL(url);
}

// Generate QR code using QRCode.js
function generateQRCode() {
    clearAlert();
    
    let value = '';
    
    if (currentMode === 'text') {
        value = qrInput.value.trim();
        if (!value) {
            showAlert('Please enter your text or URL before generating a QR code.');
            return;
        }
    } else if (currentMode === 'pdf') {
        if (!uploadedPdfFile) {
            showAlert('Please upload a PDF file first.');
            return;
        }
        // Use the file name as the QR content
        value = `PDF: ${uploadedPdfFile.name}`;
    }
    
    const qrColor = colorPicker.value;
    const qrBg = bgColorPicker.value;

    showLoading(true);
    disableButtons(true);

    if (typeof QRCode === 'undefined') {
        showLoading(false);
        showAlert('QRCode library is not available. Please reload the page.');
        disableButtons(false);
        return;
    }

    // Simulate a fast loading animation for a better experience
    setTimeout(() => {
        qrCodeContainer.innerHTML = '';

        qrCode = new QRCode(qrCodeContainer, {
            text: value,
            width: 220,
            height: 220,
            colorDark: qrColor,
            colorLight: qrBg,
            correctLevel: QRCode.CorrectLevel.H
        });

        downloadBtn.disabled = false;
        if (currentMode === 'pdf' && uploadedPdfFile) {
            downloadPdfBtn.disabled = false;
        }
        showLoading(false);
        disableButtons(false);
    }, 600);
}

// Download the generated QR code as a PNG image
function downloadQRCode() {
    if (!qrCode) {
        showAlert('Generate a QR code first before downloading.');
        return;
    }

    const qrImage = qrCodeContainer.querySelector('img');
    const qrCanvas = qrCodeContainer.querySelector('canvas');
    let imageUrl = '';

    if (qrImage) {
        imageUrl = qrImage.src;
    } else if (qrCanvas) {
        imageUrl = qrCanvas.toDataURL('image/png');
    }

    if (!imageUrl) {
        showAlert('Unable to download the QR code. Please generate again.');
        return;
    }

    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = 'qr-code.png';
    link.click();
}

// Copy input text to clipboard
async function copyText() {
    const value = qrInput.value.trim();

    if (!value) {
        showAlert('Enter text first to copy it.');
        return;
    }

    try {
        await navigator.clipboard.writeText(value);
        showAlert('Text copied to clipboard!', 'success');
    } catch (error) {
        showAlert('Unable to copy text. Please try manually.');
    }
}

// Reset the QR code and input field
function clearContent() {
    qrInput.value = '';
    pdfInput.value = '';
    pdfInfo.textContent = '';
    qrCodeContainer.innerHTML = '';
    clearAlert();
    downloadBtn.disabled = true;
    downloadPdfBtn.disabled = true;
    uploadedPdfFile = null;
    qrCode = null;
}

// Show or hide loading animation
function showLoading(isLoading) {
    loadingHolder.style.display = isLoading ? 'flex' : 'none';
}

// Display a message for the user
function showAlert(message, type = 'error') {
    alertBox.textContent = message;
    alertBox.style.color = type === 'error' ? '#fb7185' : '#8ef5a2';
}

// Clear the alert message
function clearAlert() {
    alertBox.textContent = '';
}

// Disable buttons while loading to prevent duplicate actions
function disableButtons(isDisabled) {
    generateBtn.disabled = isDisabled;
    clearBtn.disabled = isDisabled;
    copyBtn.disabled = isDisabled;
    downloadBtn.disabled = isDisabled || !qrCode;
}

// Toggle dark mode and save preference
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    if (themeToggle) {
        themeToggle.textContent = nextTheme === 'dark' ? '☀️' : '🌙';
    }
    localStorage.setItem('qr-theme', nextTheme);
}

// Listen to user interactions
generateBtn.addEventListener('click', generateQRCode);
downloadBtn.addEventListener('click', downloadQRCode);
downloadPdfBtn.addEventListener('click', downloadUploadedPdf);
clearBtn.addEventListener('click', clearContent);
copyBtn.addEventListener('click', copyText);
pdfInput.addEventListener('change', handlePdfUpload);
if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
}

// Generate QR code when the Enter key is pressed
qrInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        generateQRCode();
    }
});

// Initialize the app on page load
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    setupTabs();

    if (typeof QRCode === 'undefined') {
        showAlert('QRCode library failed to load. Please check your internet connection.');
        generateBtn.disabled = true;
        return;
    }
});
