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
const playlistDropdown = document.getElementById('playlist-dropdown');
const songCurrentTime = document.getElementById('song-current-time');
const songTotalTime = document.getElementById('song-total-time');
const songSeekBar = document.getElementById('song-seek-bar');

// State variables
let countdownInterval;
let expectedEndTime;
let timeRemaining = 0;
let isRunning = false;


// Load Song Data
function loadSong(index) {
    if (typeof myPlaylist === 'undefined' || myPlaylist.length === 0 || !myPlaylist[index]) return;

    let songData = myPlaylist[index];
    let song = {};

    if (typeof songData === 'string') {
        // Simple string path format
        song = {
            name: songData.split('/').pop().replace(/\.[^/.]+$/, ""), // Extract filename without extension
            credit: "Unknown Artist",
            image: "https://via.placeholder.com/90/222/fff?text=MUSIC",
            audio: songData
        };
    } else {
        // Object format
        song = songData;
    }

    currentSongName.innerText = song.name || "Unknown Track";
    currentSongCredit.innerText = song.credit || "Unknown Artist";
    currentSongImg.src = song.image || "https://via.placeholder.com/90/222/fff?text=MUSIC";
    bgMusic.src = song.audio || "";
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
    // Sync the input value with the current text when opening
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

// Text Sync Logic
inputTopic.addEventListener('input', (e) => {
    topicText.innerText = e.target.value || "Topic / Event Name";
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

// Play next song when current song ends
bgMusic.addEventListener('ended', function () {
    if (typeof myPlaylist !== 'undefined' && myPlaylist.length > 1) {
        currentSongIndex++;
        if (currentSongIndex >= myPlaylist.length) {
            currentSongIndex = 0;
        }
        loadSong(currentSongIndex);
        populateDropdown(); // Refresh active state in dropdown
        if (isRunning) {
            bgMusic.play().catch(e => console.log("Audio play prevented by browser"));
        }
    } else {
        // If only 1 song, loop it
        bgMusic.currentTime = 0;
        if (isRunning) {
            bgMusic.play().catch(e => console.log("Audio play prevented by browser"));
        }
    }
});

// Image Rotation Logic
bgMusic.addEventListener('play', () => {
    if (currentSongImg) currentSongImg.classList.add('playing');
});

bgMusic.addEventListener('pause', () => {
    if (currentSongImg) currentSongImg.classList.remove('playing');
});

// ==========================================
// Playlist Dropdown & Seek Bar Logic
// ==========================================

function populateDropdown() {
    if (!playlistDropdown) return;
    playlistDropdown.innerHTML = '';
    
    if (typeof myPlaylist !== 'undefined' && myPlaylist.length > 0) {
        myPlaylist.forEach((songData, index) => {
            let songName = typeof songData === 'string' ? songData.split('/').pop().replace(/\.[^/.]+$/, "") : songData.name;
            let songCredit = typeof songData === 'string' ? "Unknown Artist" : songData.credit;
            let songImage = typeof songData === 'string' ? "https://via.placeholder.com/90/222/fff?text=MUSIC" : (songData.image || "https://via.placeholder.com/90/222/fff?text=MUSIC");
            
            const item = document.createElement('div');
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            item.style.padding = '8px';
            item.style.marginBottom = '5px';
            item.style.borderRadius = '6px';
            item.style.cursor = 'pointer';
            item.style.transition = 'background 0.2s';
            
            // Hover effect
            item.addEventListener('mouseenter', () => {
                if (currentSongIndex !== index) item.style.background = 'rgba(255,255,255,0.1)';
            });
            item.addEventListener('mouseleave', () => {
                if (currentSongIndex !== index) item.style.background = 'transparent';
            });
            
            if (currentSongIndex === index) {
                item.style.background = 'rgba(0, 240, 255, 0.15)';
                item.style.border = '1px solid var(--accent)';
            } else {
                item.style.border = '1px solid transparent';
            }

            item.innerHTML = `
                <img src="${songImage}" style="width:30px; height:30px; border-radius:4px; margin-right:10px; object-fit:cover;">
                <div style="flex-grow: 1; overflow: hidden;">
                    <div style="font-weight: 600; font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff;">${songName}</div>
                    <div style="font-size: 0.7rem; color: #ccc; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${songCredit}</div>
                </div>
            `;
            
            item.addEventListener('click', () => {
                currentSongIndex = index;
                loadSong(currentSongIndex);
                populateDropdown(); // Refresh active state
                playlistDropdown.style.display = 'none';
                if (isRunning) bgMusic.play().catch(e => console.log(e));
            });
            
            playlistDropdown.appendChild(item);
        });
    } else {
        playlistDropdown.innerHTML = '<div style="color: #888; font-size: 0.85rem; text-align: center;">No songs in playlist.js</div>';
    }
}

if (currentSongName) {
    currentSongName.addEventListener('click', (e) => {
        e.stopPropagation();
        if (playlistDropdown.style.display === 'none' || playlistDropdown.style.display === '') {
            populateDropdown();
            playlistDropdown.style.display = 'block';
        } else {
            playlistDropdown.style.display = 'none';
        }
    });
}

// Close dropdown when clicking outside
document.addEventListener('click', (e) => {
    if (playlistDropdown && !playlistDropdown.contains(e.target) && e.target !== currentSongName) {
        playlistDropdown.style.display = 'none';
    }
});

// 2. Seek Bar Logic
function formatAudioTime(seconds) {
    if (isNaN(seconds) || !isFinite(seconds)) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s < 10 ? '0' + s : s}`;
}

bgMusic.addEventListener('loadedmetadata', () => {
    if (songTotalTime) songTotalTime.innerText = formatAudioTime(bgMusic.duration);
    if (songSeekBar) songSeekBar.max = bgMusic.duration;
});

bgMusic.addEventListener('timeupdate', () => {
    if (songCurrentTime) songCurrentTime.innerText = formatAudioTime(bgMusic.currentTime);
    if (songSeekBar && !songSeekBar.matches(':active')) {
        // Only update slider if user is not currently dragging it
        songSeekBar.value = bgMusic.currentTime;
    }
});

if (songSeekBar) {
    songSeekBar.addEventListener('input', () => {
        bgMusic.currentTime = songSeekBar.value;
        if (songCurrentTime) songCurrentTime.innerText = formatAudioTime(bgMusic.currentTime);
    });
}
