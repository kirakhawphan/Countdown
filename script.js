// ==========================================
// Playlist Data Structure
// คุณสามารถเพิ่ม แก้ไข หรือลบเพลงในนี้ได้เลย
// ==========================================
const playlist = [
    {
        name: "ชื่อเพลงที่ 1",
        credit: "ศิลปินที่ 1",
        image: "https://via.placeholder.com/90/222/fff?text=MUSIC", // ใส่ชื่อไฟล์รูปที่อยู่ในโฟลเดอร์ Music เช่น "Music/cover1.jpg"
        audio: "" // ใส่ชื่อไฟล์เพลง เช่น "Music/song1.mp3"
    },
    {
        name: "ชื่อเพลงที่ 2",
        credit: "ศิลปินที่ 2",
        image: "https://via.placeholder.com/90/222/fff?text=MUSIC2",
        audio: ""
    }
];

let currentSongIndex = 0; // เริ่มที่เพลงแรก (index 0)

// DOM Elements
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const millisecondsEl = document.getElementById('milliseconds');

const inputHours = document.getElementById('input-hours');
const inputMinutes = document.getElementById('input-minutes');
const inputSeconds = document.getElementById('input-seconds');

const btnStart = document.getElementById('btn-start');
const btnPause = document.getElementById('btn-pause');
const btnReset = document.getElementById('btn-reset');

const settingsBtn = document.getElementById('settings-btn');
const settingsModal = document.getElementById('settings-modal');
const closeModalBtn = document.getElementById('close-modal');

const inputTopic = document.getElementById('input-topic');
const topicText = document.querySelector('.topic-text');

// Song Elements
const currentSongImg = document.getElementById('current-song-img');
const currentSongName = document.getElementById('current-song-name');
const currentSongCredit = document.getElementById('current-song-credit');
const bgMusic = document.getElementById('bg-music');

// State variables
let countdownInterval;
let expectedEndTime;
let timeRemaining = 0;
let isRunning = false;

// Load Song Data
function loadSong(index) {
    if (playlist.length === 0 || !playlist[index]) return;
    const song = playlist[index];
    currentSongName.innerText = song.name;
    currentSongCredit.innerText = song.credit;
    currentSongImg.src = song.image;
    bgMusic.src = song.audio;
}

// Format numbers to always have 2 digits
function formatTime(time) {
    return time < 10 ? `0${time}` : time;
}

// Update the display with current time left
function updateDisplay(ms) {
    if (ms < 0) ms = 0;

    const h = Math.floor(ms / (1000 * 60 * 60));
    const m = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((ms % (1000 * 60)) / 1000);
    // We want to show 2 digits for milliseconds (centiseconds, 00-99)
    const cs = Math.floor((ms % 1000) / 10);

    hoursEl.innerText = formatTime(h);
    minutesEl.innerText = formatTime(m);
    secondsEl.innerText = formatTime(s);
    millisecondsEl.innerText = formatTime(cs);
}

// Calculate total milliseconds from inputs
function getTargetTime() {
    const h = parseInt(inputHours.value) || 0;
    const m = parseInt(inputMinutes.value) || 0;
    const s = parseInt(inputSeconds.value) || 0;

    return (h * 60 * 60 * 1000) + (m * 60 * 1000) + (s * 1000);
}

// Timer Loop
function timerStep() {
    const now = Date.now();
    timeRemaining = expectedEndTime - now;

    if (timeRemaining <= 0) {
        timeRemaining = 0;
        updateDisplay(0);
        finishTimer();
    } else {
        updateDisplay(timeRemaining);
        // Using requestAnimationFrame for smooth UI updates
        countdownInterval = requestAnimationFrame(timerStep);
    }
}

// Start Timer
function startTimer() {
    if (isRunning) return;

    // If we're starting fresh, get time from inputs
    if (timeRemaining <= 0) {
        timeRemaining = getTargetTime();
        if (timeRemaining <= 0) return; // Don't start if 0
    }

    isRunning = true;
    expectedEndTime = Date.now() + timeRemaining;

    // Update UI states
    btnStart.disabled = true;
    btnPause.disabled = false;
    inputHours.disabled = true;
    inputMinutes.disabled = true;
    inputSeconds.disabled = true;

    countdownInterval = requestAnimationFrame(timerStep);

    // Play music
    if (bgMusic.src && bgMusic.src !== window.location.href) {
        bgMusic.play().catch(e => console.log("Audio play prevented by browser"));
    }

    // Optional: Close modal automatically when starting
    settingsModal.classList.remove('show');
}

// Pause Timer
function pauseTimer() {
    if (!isRunning) return;

    isRunning = false;
    cancelAnimationFrame(countdownInterval);

    // UI Updates
    btnStart.disabled = false;
    btnPause.disabled = true;

    // Pause music
    bgMusic.pause();
}

// Reset Timer
function resetTimer() {
    isRunning = false;
    cancelAnimationFrame(countdownInterval);

    timeRemaining = getTargetTime();
    updateDisplay(timeRemaining);

    // UI Updates
    btnStart.disabled = false;
    btnPause.disabled = true;
    inputHours.disabled = false;
    inputMinutes.disabled = false;
    inputSeconds.disabled = false;

    // Reset music
    bgMusic.pause();
    bgMusic.currentTime = 0;
}

// Timer Finished
function finishTimer() {
    isRunning = false;
    btnStart.disabled = false;
    btnPause.disabled = true;
    inputHours.disabled = false;
    inputMinutes.disabled = false;
    inputSeconds.disabled = false;

    // Visual feedback on finish (can be customized)
    document.querySelector('.time-display').style.color = '#ff003c';
    setTimeout(() => {
        document.querySelector('.time-display').style.color = '#ffffff';
    }, 2000);

    // Stop music
    bgMusic.pause();
}

// Modal Logic
settingsBtn.addEventListener('click', () => {
    // Sync the input value with the current topic text when opening
    inputTopic.value = topicText.innerText;
    settingsModal.classList.add('show');
});

closeModalBtn.addEventListener('click', () => {
    settingsModal.classList.remove('show');
});

settingsModal.addEventListener('click', (e) => {
    // Close modal when clicking outside the content box
    if (e.target === settingsModal) {
        settingsModal.classList.remove('show');
    }
});

// Topic Sync Logic
inputTopic.addEventListener('input', (e) => {
    topicText.innerText = e.target.value;
});

topicText.addEventListener('input', (e) => {
    inputTopic.value = e.target.innerText;
});

// Event Listeners for Timer Controls
btnStart.addEventListener('click', startTimer);
btnPause.addEventListener('click', pauseTimer);
btnReset.addEventListener('click', resetTimer);

// Input validations to prevent negative or overly large numbers
[inputHours, inputMinutes, inputSeconds].forEach(input => {
    input.addEventListener('input', function () {
        let val = parseInt(this.value);
        if (isNaN(val) || val < 0) this.value = "00";
        if (this.id !== 'input-hours' && val > 59) this.value = "59";
        if (this.id === 'input-hours' && val > 99) this.value = "99";

        // Update display live as user types
        if (!isRunning) {
            timeRemaining = getTargetTime();
            updateDisplay(timeRemaining);
        }
    });

    input.addEventListener('blur', function () {
        if (this.value.length === 1) {
            this.value = '0' + this.value;
        } else if (this.value === '') {
            this.value = '00';
        }
    });
});

// Initialize Display
timeRemaining = getTargetTime();
updateDisplay(timeRemaining);

// Load the first song
loadSong(currentSongIndex);

// ==========================================
// Easy Upload Handlers (No-code updates)
// ==========================================
document.getElementById('upload-audio').addEventListener('change', function () {
    if (this.files && this.files[0]) {
        bgMusic.src = URL.createObjectURL(this.files[0]);
        // Auto-fill song name from filename if user hasn't typed one
        if (currentSongName.innerText.includes('พิมพ์ชื่อเพลง')) {
            currentSongName.innerText = this.files[0].name.replace(/\.[^/.]+$/, "");
        }
    }
});

document.getElementById('upload-cover').addEventListener('change', function () {
    if (this.files && this.files[0]) {
        currentSongImg.src = URL.createObjectURL(this.files[0]);
    }
});

document.getElementById('upload-logos').addEventListener('change', function () {
    if (this.files) {
        const logoImgs = document.querySelectorAll('.logo-box img');
        for (let i = 0; i < Math.min(this.files.length, 4); i++) {
            logoImgs[i].src = URL.createObjectURL(this.files[i]);
        }
    }
});
