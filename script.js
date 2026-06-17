let currentSongIndex = 0; // เริ่มที่เพลงแรก (index 0)

// DOM Elements
const hoursEl = document.getElementById('hours');
const minutesEl = document.getElementById('minutes');
const secondsEl = document.getElementById('seconds');
const millisecondsEl = document.getElementById('milliseconds');



const topicText = document.querySelector('.topic-text');

// Limit topic text to 3 lines
topicText.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        const lines = topicText.innerText.replace(/\n$/, '').split('\n').length;
        if (lines >= 3) {
            e.preventDefault();
        }
    }
});

topicText.addEventListener('input', () => {
    const lines = topicText.innerText.replace(/\n$/, '').split('\n');
    if (lines.length > 3) {
        topicText.innerText = lines.slice(0, 3).join('\n');
        
        // Move cursor to end
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(topicText);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
    }
});

// Song Elements
const currentSongImg = document.getElementById('current-song-img');
const currentSongName = document.getElementById('current-song-name');
const currentSongCredit = document.getElementById('current-song-credit');
const bgMusic = document.getElementById('bg-music');
const playlistDropdown = document.getElementById('playlist-dropdown');


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
    const h = parseInt(hoursEl.innerText) || 0;
    const m = parseInt(minutesEl.innerText) || 0;
    const s = parseInt(secondsEl.innerText) || 0;

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

    hoursEl.blur();
    minutesEl.blur();
    secondsEl.blur();

    // Read time from display
    timeRemaining = getTargetTime();
    
    if (timeRemaining <= 0) return; // Don't start if 0

    isRunning = true;
    expectedEndTime = Date.now() + timeRemaining;

    hoursEl.contentEditable = "false";
    minutesEl.contentEditable = "false";
    secondsEl.contentEditable = "false";

    countdownInterval = requestAnimationFrame(timerStep);

    // Play music
    if (bgMusic.src && bgMusic.src !== window.location.href) {
        bgMusic.play().catch(e => console.log("Audio play prevented by browser"));
    }
}

// Pause Timer
function pauseTimer() {
    if (!isRunning) return;

    isRunning = false;
    cancelAnimationFrame(countdownInterval);

    hoursEl.contentEditable = "true";
    minutesEl.contentEditable = "true";
    secondsEl.contentEditable = "true";

    // Pause music
    bgMusic.pause();
}

// Reset Timer
function resetTimer() {
    isRunning = false;
    cancelAnimationFrame(countdownInterval);

    timeRemaining = getTargetTime();
    updateDisplay(timeRemaining);

    // Reset music
    bgMusic.pause();
    bgMusic.currentTime = 0;
}

// Timer Finished
function finishTimer() {
    isRunning = false;

    hoursEl.contentEditable = "true";
    minutesEl.contentEditable = "true";
    secondsEl.contentEditable = "true";

    // Visual feedback on finish (can be customized)
    document.querySelector('.time-display').style.color = '#ff003c';
    setTimeout(() => {
        document.querySelector('.time-display').style.color = '#ffffff';
    }, 2000);

    // Stop music
    bgMusic.pause();
}


// Input validation for time elements
[hoursEl, minutesEl, secondsEl].forEach(el => {
    el.addEventListener('keydown', (e) => {
        // Prevent enter, just blur
        if (['Enter'].includes(e.key)) {
            e.preventDefault();
            el.blur();
            return;
        }
        // Allow navigation, deletion, copy/paste
        if (['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
        if (e.ctrlKey || e.metaKey) return;
        
        // Prevent non-numeric input
        if (!/^\d$/.test(e.key)) {
            e.preventDefault();
        }
    });

    el.addEventListener('blur', () => {
        if (isRunning) return;
        
        let val = parseInt(el.innerText);
        if (isNaN(val)) val = 0;
        
        // Clamp values
        if (el === hoursEl && val > 99) val = 99;
        if (el !== hoursEl && val > 59) val = 59;
        
        el.innerText = formatTime(val);
        
        timeRemaining = getTargetTime();
        updateDisplay(timeRemaining);
    });
});

// Spacebar to toggle start/pause
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        // Don't toggle if typing in a text input or contenteditable element, EXCEPT our time spans
        if ((e.target.tagName.toLowerCase() === 'input' && e.target.type === 'text') || 
            (e.target.isContentEditable && e.target !== hoursEl && e.target !== minutesEl && e.target !== secondsEl)) {
            return;
        }
        
        e.preventDefault();
        if (isRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    }
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


