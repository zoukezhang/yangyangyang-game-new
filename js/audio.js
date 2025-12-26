// ================= 🎵 音乐系统 (Marimba) =================
let synth = null;
let bassSynth = null;
let isMuted = false;

async function initAudio() {
    await Tone.start();
    
    synth = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: "sine" }, 
        envelope: { attack: 0.01, decay: 0.3, sustain: 0, release: 0.3 },
        volume: -6
    }).toDestination();

    bassSynth = new Tone.MembraneSynth({
        pitchDecay: 0.05, octaves: 2, oscillator: { type: "sine" },
        envelope: { attack: 0.01, decay: 0.4, sustain: 0.01, release: 1.4, attackCurve: "exponential" },
        volume: -10
    }).toDestination();

    const melody = [
        { time: "0:0", note: "C5" }, { time: "0:1", note: "E5" }, { time: "0:2", note: "G5" }, { time: "0:3", note: "A5" },
        { time: "1:0", note: "G5" }, { time: "1:2", note: "E5" }, { time: "1:3", note: "C5" },
        { time: "2:0", note: "D5" }, { time: "2:1", note: "F5" }, { time: "2:2", note: "A5" }, { time: "2:3", note: "B5" },
        { time: "3:0", note: "A5" }, { time: "3:2", note: "F5" }, { time: "3:3", note: "D5" }
    ];

    const bassLine = [
        { time: "0:0", note: "C2" }, { time: "1:0", note: "G2" },
        { time: "2:0", note: "D2" }, { time: "3:0", note: "G2" }
    ];

    const melodyPart = new Tone.Part((time, value) => {
        synth.triggerAttackRelease(value.note, "16n", time);
    }, melody).start(0);
    melodyPart.loop = true; melodyPart.loopEnd = "4m";

    const bassPart = new Tone.Part((time, value) => {
        bassSynth.triggerAttackRelease(value.note, "8n", time);
    }, bassLine).start(0);
    bassPart.loop = true; bassPart.loopEnd = "4m";

    Tone.Transport.bpm.value = 140;
}

function playMusic() { Tone.Transport.start(); }
function stopMusic() { Tone.Transport.stop(); }

function toggleMute() {
    isMuted = !isMuted;
    const btn = document.getElementById('musicToggle');
    const icon = btn.querySelector('i');
    
    if (isMuted) {
        Tone.Destination.mute = true;
        icon.className = 'fas fa-volume-mute text-gray-400';
    } else {
        Tone.Destination.mute = false;
        icon.className = 'fas fa-volume-up text-gray-700';
    }
}

function playClickSound() {
    if (!isMuted && synth) synth.triggerAttackRelease("C6", "32n", Tone.now(), 0.5);
}

function playMatchSound() {
    if (!isMuted && synth) {
        const now = Tone.now();
        synth.triggerAttackRelease("C5", "32n", now);
        synth.triggerAttackRelease("E5", "32n", now + 0.05);
        synth.triggerAttackRelease("G5", "32n", now + 0.1);
        synth.triggerAttackRelease("C6", "16n", now + 0.15);
    }
}