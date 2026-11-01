// js/modules/pomodoro.js
let pomodoroTimer = null;

function setPomoMode(mode) {
    state.pomodoro.mode = mode;
    if (pomodoroTimer) clearInterval(pomodoroTimer);
    state.pomodoro.isRunning = false;

    if (mode === 'focus') state.pomodoro.timeLeft = 25 * 60;
    else if (mode === 'shortBreak') state.pomodoro.timeLeft = 5 * 60;
    else if (mode === 'longBreak') state.pomodoro.timeLeft = 15 * 60;

    updatePomoUI();
}

function togglePomodoro() {
    if (state.pomodoro.isRunning) {
        clearInterval(pomodoroTimer);
        state.pomodoro.isRunning = false;
    } else {
        state.pomodoro.isRunning = true;
        pomodoroTimer = setInterval(() => {
            if (state.pomodoro.timeLeft > 0) {
                state.pomodoro.timeLeft--;
                updatePomoUI();
            } else {
                clearInterval(pomodoroTimer);
                state.pomodoro.isRunning = false;
                playChime();
                if (state.pomodoro.mode === 'focus') {
                    state.pomodoro.focusMinutesToday += 25;
                    state.pomodoro.sessionsToday += 1;
                }
                saveState();
                alert("Sessão Pomodoro Concluída! 🎉");
            }
        }, 1000);
    }
    updatePomoUI();
}

function resetPomodoro() {
    setPomoMode(state.pomodoro.mode);
}

function updatePomoUI() {
    const min = Math.floor(state.pomodoro.timeLeft / 60);
    const sec = state.pomodoro.timeLeft % 60;
    const timeStr = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;

    document.getElementById('pomo-timer-text').textContent = timeStr;
    document.getElementById('dash-pomo-display').textContent = timeStr;

    const btnText = state.pomodoro.isRunning ? 'Pausar' : 'Iniciar Foco';
    document.getElementById('pomo-main-btn').textContent = btnText;
    document.getElementById('dash-pomo-btn').textContent = btnText;

    const total = state.pomodoro.mode === 'focus' ? 25 * 60 : (state.pomodoro.mode === 'shortBreak' ? 5 * 60 : 15 * 60);
    const offset = 691 - (state.pomodoro.timeLeft / total) * 691;
    const ring = document.getElementById('pomo-progress-ring');
    if (ring) ring.style.strokeDashoffset = offset;

    document.getElementById('pomo-sessions-count').textContent = state.pomodoro.sessionsToday;
    document.getElementById('pomo-total-time').textContent = `${state.pomodoro.focusMinutesToday} min`;
}
