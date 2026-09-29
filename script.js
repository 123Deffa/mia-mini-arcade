/* =========================================================
   MIA'S MINI ARCADE
   SCRIPT.JS — ULTIMATE V2
   =========================================================

   GAME:
   01. Heart Catch 💗
   02. Flower Memory 🌸
   03. Berry Rush 🍓
   04. Save The Cat 🐱
   05. Mia Quiz 🧠
   06. Duo Challenge 👥

   FEATURES:
   - Mobile first
   - Touch friendly
   - Keyboard support
   - Sound effects
   - Vibration
   - Combo system
   - Particles
   - Floating score
   - Screen shake
   - Persistent progress
   - Best score
   - Safe cleanup
   - Retry system
   - 2-player local Duo mode
   - Personal Mia easter eggs
   ========================================================= */

(() => {

    "use strict";


    /* =====================================================
       01. DOM HELPERS
       ===================================================== */

    const $ = (id) =>
        document.getElementById(id);


    const $$ = (selector, parent = document) =>
        [...parent.querySelectorAll(selector)];


    const exists = (id) =>
        Boolean($(id));


    const clamp = (value, min, max) =>
        Math.max(min, Math.min(max, value));


    const random = (min, max) =>
        Math.random() * (max - min) + min;


    const randomInt = (min, max) =>
        Math.floor(random(min, max + 1));


    const pick = (array) => {

        if (!Array.isArray(array) || !array.length) {
            return null;
        }

        return array[
            Math.floor(Math.random() * array.length)
        ];

    };


    const shuffle = (array) => {

        const result = [...array];

        for (
            let i = result.length - 1;
            i > 0;
            i--
        ) {

            const j =
                Math.floor(
                    Math.random() * (i + 1)
                );

            [
                result[i],
                result[j]
            ] = [
                result[j],
                result[i]
            ];

        }

        return result;

    };


    const escapeHTML = (value) => {

        const div =
            document.createElement("div");

        div.textContent =
            String(value ?? "");

        return div.innerHTML;

    };


    /* =====================================================
       02. APPLICATION STATE
       ===================================================== */

    const STATE = {

        currentUser: null,

        currentGame: null,

        gameRunning: false,

        gameToken: 0,

        score: 0,

        target: 0,

        time: 0,

        duration: 0,

        combo: 0,

        maxCombo: 0,

        timer: null,

        animationFrame: null,

        intervals: new Set(),

        timeouts: new Set(),

        cleanups: [],

        gameData: {},

        toastTimer: null,

        bonusTimer: null,

        audioContext: null,

        musicEnabled: true,

        initialized: false

    };


    /* =====================================================
       03. STORAGE
       ===================================================== */

    const STORAGE = {

        USERS:
            "mias-mini-arcade-users-v2",

        CURRENT:
            "mias-mini-arcade-current-v2",

        SETTINGS:
            "mias-mini-arcade-settings-v2"

    };


    /* =====================================================
       04. GAME CONFIG
       ===================================================== */

    const GAME_CONFIG = {

        "heart-catch": {

            name: "GAME 01",

            title: "Heart Catch 💗",

            category: "REFLEX CHALLENGE",

            description:
                "Tangkap hati sebanyak mungkin sebelum waktu habis.",

            time: 25,

            target: 20,

            colorClass: "pink"

        },


        "flower-memory": {

            name: "GAME 02",

            title: "Flower Memory 🌸",

            category: "MEMORY CHALLENGE",

            description:
                "Cari semua pasangan bunga yang sama.",

            time: 50,

            target: 6,

            colorClass: "flower"

        },


        "berry-rush": {

            name: "GAME 03",

            title: "Berry Rush 🍓",

            category: "SPEED CHALLENGE",

            description:
                "Kejar stroberi, ambil bonus dan jangan sampai lengah.",

            time: 25,

            target: 18,

            colorClass: "berry"

        },


        "save-the-cat": {

            name: "GAME 04",

            title: "Save The Cat 🐱",

            category: "SURVIVAL CHALLENGE",

            description:
                "Lindungi kucing dari meteor selama mungkin.",

            time: 25,

            target: 0,

            colorClass: "cat"

        },


        "quiz": {

            name: "GAME 05",

            title: "Mia Quiz 🧠",

            category: "MIA KNOWLEDGE",

            description:
                "Seberapa kenal kamu sama kebiasaan Miaa?",

            time: 70,

            target: 10,

            colorClass: "quiz"

        },


        "duo": {

            name: "GAME 06",

            title: "Duo Challenge 👥",

            category: "2 PLAYER LOCAL",

            description:
                "Dua pemain. Satu HP. Siapa paling cepat?",

            time: 30,

            target: 0,

            colorClass: "duo"

        }

    };


    /* =====================================================
       05. QUIZ DATA
       ===================================================== */

    const QUIZ_QUESTIONS = [

        {

            question:
                "Kalau Miaa lagi capek banget, kemungkinan terbesar adalah...",

            options: [

                "Lari keliling rumah",

                "Rebahan 😭",

                "Naik gunung",

                "Bikin robot"

            ],

            answer: 1,

            reaction:
                "Nahhh ini baru jawaban yang masuk akal 😭🛌"

        },


        {

            question:
                "Minuman yang paling cocok buat menemani Miaa adalah...",

            options: [

                "Kopi ☕",

                "Kuah bakso",

                "Air kolam",

                "Minyak goreng"

            ],

            answer: 0,

            reaction:
                "KOPI. Sudah tidak perlu diperdebatkan ☕😭"

        },


        {

            question:
                "Kalau Miaa lagi santai, aktivitas yang paling masuk akal adalah...",

            options: [

                "Membaca buku 📚",

                "Menghitung pasir",

                "Lari marathon",

                "Mengejar ayam"

            ],

            answer: 0,

            reaction:
                "📚 Anak baik... atau pura-pura baca sambil rebahan? 😭"

        },


        {

            question:
                "Hewan yang paling cocok jadi sidekick Miaa adalah...",

            options: [

                "Buaya",

                "Kucing 🐱",

                "T-Rex",

                "Komodo"

            ],

            answer: 1,

            reaction:
                "🐱 Nahhh, ini baru duo yang cocok."

        },


        {

            question:
                "Kalau ada ayam geprek di depan mata Miaa...",

            options: [

                "Dibiarkan",

                "Dipikirkan seminggu",

                "Diselamatkan segera 🍗",

                "Diberikan ke kucing"

            ],

            answer: 2,

            reaction:
                "🍗 Ayam geprek detected. Prioritas berubah."

        },


        {

            question:
                "Kalau bilang 'aku cuma rebahan sebentar' biasanya...",

            options: [

                "5 menit",

                "10 menit",

                "3 jam kemudian 😭",

                "Tidak jadi rebahan"

            ],

            answer: 2,

            reaction:
                "😭 Kita semua tahu ending-nya."

        },


        {

            question:
                "Kalau kucing tiba-tiba datang saat Miaa baca buku...",

            options: [

                "Diusir",

                "Dicuekin",

                "Diajak foto",

                "Langsung jadi teman baca 🐱"

            ],

            answer: 3,

            reaction:
                "🐱 Buku bisa nanti. Kucing harus diprioritaskan."

        },


        {

            question:
                "Strategi terbaik menangkap stroberi adalah...",

            options: [

                "Klik cepat 🍓",

                "Menunggu 1 jam",

                "Pejamkan mata",

                "Kabur"

            ],

            answer: 0,

            reaction:
                "🍓 REFLEKS MODE: ON."

        },


        {

            question:
                "Kalau hampir menang tapi kalah tipis, pilihan paling mungkin...",

            options: [

                "Menyerah selamanya",

                "Main sekali lagi 😭",

                "Buang HP",

                "Tidur"

            ],

            answer: 1,

            reaction:
                "😭 'Sekali lagi' yang akhirnya jadi 17 ronde."

        },


        {

            question:
                "Julukan random yang cocok untuk Miaa di arcade ini adalah...",

            options: [

                "Bocil Pro Max 😭",

                "CEO Meteor",

                "Ratu Coding",

                "Lord Ayam"

            ],

            answer: 0,

            reaction:
                "😭 BO CIL PRO MAX unlocked."

        }

    ];


    /* =====================================================
       06. MUSIC
       ===================================================== */

    function getMusic() {

        return $("background-music");

    }


    function loadSettings() {

        try {

            const raw =
                localStorage.getItem(
                    STORAGE.SETTINGS
                );

            if (!raw) return;

            const settings =
                JSON.parse(raw);

            if (
                typeof settings.musicEnabled ===
                "boolean"
            ) {

                STATE.musicEnabled =
                    settings.musicEnabled;

            }

        } catch (error) {

            console.warn(
                "Settings gagal dimuat.",
                error
            );

        }

    }


    function saveSettings() {

        try {

            localStorage.setItem(
                STORAGE.SETTINGS,
                JSON.stringify({
                    musicEnabled:
                        STATE.musicEnabled
                })
            );

        } catch (error) {}

    }


    function ensureAudio() {

        if (STATE.audioContext) {

            return STATE.audioContext;

        }


        try {

            const AudioContext =
                window.AudioContext ||
                window.webkitAudioContext;

            if (!AudioContext) {

                return null;

            }

            STATE.audioContext =
                new AudioContext();

            return STATE.audioContext;

        } catch (error) {

            return null;

        }

    }


    function resumeAudio() {

        const context =
            ensureAudio();

        if (!context) return;

        if (
            context.state ===
            "suspended"
        ) {

            context.resume()
                .catch(() => {});

        }

    }


    function playMusic() {

        const music =
            getMusic();

        if (!music) return;

        if (!STATE.musicEnabled) return;


        try {

            music.volume = 0.35;

            const promise =
                music.play();

            if (
                promise &&
                typeof promise.catch ===
                "function"
            ) {

                promise.catch(() => {});

            }

        } catch (error) {}

    }


    function stopMusic() {

        const music =
            getMusic();

        if (!music) return;

        try {

            music.pause();

        } catch (error) {}

    }


    function updateMusicButton() {

        const button =
            $("music-button");

        if (!button) return;


        button.textContent =
            STATE.musicEnabled
                ? "🔊"
                : "🔇";


        button.setAttribute(
            "aria-label",
            STATE.musicEnabled
                ? "Matikan musik"
                : "Nyalakan musik"
        );


        button.setAttribute(
            "aria-pressed",
            String(
                STATE.musicEnabled
            )
        );

    }


    function toggleMusic() {

        STATE.musicEnabled =
            !STATE.musicEnabled;


        saveSettings();

        updateMusicButton();


        if (
            STATE.musicEnabled
        ) {

            resumeAudio();

            playMusic();

            toast("Musik dinyalakan 🎵");

        } else {

            stopMusic();

            toast("Musik dimatikan 🔇");

        }

    }


    /* =====================================================
       07. SOUND EFFECT ENGINE
       ===================================================== */

    function playSFX(
        type = "click",
        options = {}
    ) {

        const context =
            ensureAudio();

        if (!context) return;


        try {

            if (
                context.state ===
                "suspended"
            ) {

                context.resume()
                    .catch(() => {});

            }


            const oscillator =
                context.createOscillator();

            const gain =
                context.createGain();


            oscillator.connect(gain);

            gain.connect(
                context.destination
            );


            const now =
                context.currentTime;


            const duration =
                options.duration ??
                0.10;


            const volume =
                options.volume ??
                0.035;


            let startFrequency =
                440;

            let endFrequency =
                440;


            switch (type) {

                case "click":

                    startFrequency = 440;
                    endFrequency = 520;

                    break;


                case "hit":

                    startFrequency = 560;
                    endFrequency = 720;

                    break;


                case "success":

                    startFrequency = 620;
                    endFrequency = 980;

                    break;


                case "bonus":

                    startFrequency = 700;
                    endFrequency = 1300;

                    break;


                case "wrong":

                    startFrequency = 240;
                    endFrequency = 150;

                    break;


                case "danger":

                    startFrequency = 160;
                    endFrequency = 80;

                    break;


                case "combo":

                    startFrequency = 720;
                    endFrequency = 1150;

                    break;


                default:

                    startFrequency = 440;
                    endFrequency = 440;

            }


            oscillator.type =
                options.wave ??
                "sine";


            oscillator.frequency
                .setValueAtTime(
                    startFrequency,
                    now
                );


            if (
                endFrequency !==
                startFrequency
            ) {

                oscillator.frequency
                    .exponentialRampToValueAtTime(
                        Math.max(
                            1,
                            endFrequency
                        ),
                        now + duration
                    );

            }


            gain.gain.setValueAtTime(
                0.0001,
                now
            );


            gain.gain.exponentialRampToValueAtTime(
                volume,
                now + 0.01
            );


            gain.gain.exponentialRampToValueAtTime(
                0.0001,
                now + duration
            );


            oscillator.start(now);

            oscillator.stop(
                now + duration + 0.02
            );

        } catch (error) {

            /* Audio tidak boleh menghentikan game. */

        }

    }


    /* =====================================================
       08. VIBRATION
       ===================================================== */

    function vibrate(pattern = 15) {

        try {

            if (
                navigator.vibrate
            ) {

                navigator.vibrate(
                    pattern
                );

            }

        } catch (error) {}

    }


    /* =====================================================
       09. TOAST
       ===================================================== */

    function toast(message) {

        const element =
            $("toast");

        if (!element) {

            console.log(message);

            return;

        }


        clearTimeout(
            STATE.toastTimer
        );


        element.textContent =
            message;


        element.classList.remove(
            "show"
        );


        void element.offsetWidth;


        element.classList.add(
            "show"
        );


        STATE.toastTimer =
            setTimeout(() => {

                element.classList.remove(
                    "show"
                );

            }, 2500);

    }


    /* =====================================================
       10. VISUAL EFFECTS
       ===================================================== */

    function createFloatingText(
        text,
        x,
        y,
        className = ""
    ) {

        const arena =
            $("game-arena");

        if (!arena) return;


        const element =
            document.createElement(
                "div"
            );


        element.className =
            `floating-score ${className}`;


        element.textContent =
            text;


        element.style.position =
            "absolute";


        element.style.left =
            `${x}%`;


        element.style.top =
            `${y}%`;


        element.style.pointerEvents =
            "none";


        element.style.zIndex =
            "999";


        arena.appendChild(
            element
        );


        requestAnimationFrame(() => {

            element.classList.add(
                "float-up"
            );

        });


        trackTimeout(
            setTimeout(() => {

                element.remove();

            }, 750)
        );

    }


    function burstParticles(
        x,
        y,
        symbols = [
            "✨",
            "💗",
            "⭐"
        ],
        amount = 8
    ) {

        const arena =
            $("game-arena");

        if (!arena) return;


        for (
            let i = 0;
            i < amount;
            i++
        ) {

            const particle =
                document.createElement(
                    "span"
                );


            particle.className =
                "game-particle";


            particle.textContent =
                pick(symbols);


            particle.style.position =
                "absolute";


            particle.style.left =
                `${x}%`;


            particle.style.top =
                `${y}%`;


            particle.style.zIndex =
                "1000";


            particle.style.pointerEvents =
                "none";


            particle.style.setProperty(
                "--dx",
                `${random(-70, 70)}px`
            );


            particle.style.setProperty(
                "--dy",
                `${random(-90, 30)}px`
            );


            particle.style.fontSize =
                `${randomInt(12, 24)}px`;


            arena.appendChild(
                particle
            );


            trackTimeout(
                setTimeout(() => {

                    particle.remove();

                }, 900)
            );

        }

    }


    function screenShake(
        strength = 4
    ) {

        const arena =
            $("game-arena");

        if (!arena) return;


        arena.classList.remove(
            "screen-shake"
        );


        arena.style.setProperty(
            "--shake",
            `${strength}px`
        );


        void arena.offsetWidth;


        arena.classList.add(
            "screen-shake"
        );


        trackTimeout(
            setTimeout(() => {

                arena.classList.remove(
                    "screen-shake"
                );

            }, 350)
        );

    }


    function launchConfetti() {

        const symbols = [

            "✨",
            "🎉",
            "⭐",
            "💫",
            "🌸",
            "💗",
            "🍓",
            "🐱",
            "🎀",
            "☁️"

        ];


        const amount =
            window.innerWidth < 600
                ? 30
                : 50;


        for (
            let i = 0;
            i < amount;
            i++
        ) {

            const piece =
                document.createElement(
                    "div"
                );


            piece.textContent =
                pick(symbols);


            piece.className =
                "confetti-piece";


            piece.style.position =
                "fixed";


            piece.style.left =
                `${random(0, 100)}vw`;


            piece.style.top =
                "-40px";


            piece.style.fontSize =
                `${randomInt(14, 26)}px`;


            piece.style.zIndex =
                "99999";


            piece.style.pointerEvents =
                "none";


            piece.style.setProperty(
                "--fall-x",
                `${random(-160, 160)}px`
            );


            piece.style.setProperty(
                "--fall-r",
                `${randomInt(-720, 720)}deg`
            );


            document.body.appendChild(
                piece
            );


            requestAnimationFrame(() => {

                piece.classList.add(
                    "confetti-fall"
                );

            });


            setTimeout(() => {

                piece.remove();

            }, 2100);

        }

    }


    /* =====================================================
       11. SCREEN NAVIGATION
       ===================================================== */

    function showScreen(id) {

        const screens =
            $$(".screen");


        screens.forEach(
            screen => {

                screen.classList.remove(
                    "active"
                );

            }
        );


        const target =
            $(id);


        if (!target) {

            console.warn(
                `Screen "${id}" tidak ditemukan.`
            );

            return;

        }


        target.classList.add(
            "active"
        );


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });

    }


    /* =====================================================
       12. USER STORAGE
       ===================================================== */

    function getUsers() {

        try {

            const raw =
                localStorage.getItem(
                    STORAGE.USERS
                );


            if (!raw) return [];


            const data =
                JSON.parse(raw);


            return Array.isArray(data)
                ? data
                : [];

        } catch (error) {

            return [];

        }

    }


    function saveUsers(users) {

        try {

            localStorage.setItem(
                STORAGE.USERS,
                JSON.stringify(users)
            );

        } catch (error) {

            console.warn(
                "Tidak dapat menyimpan user.",
                error
            );

        }

    }


    function saveCurrentUserReference() {

        try {

            if (
                STATE.currentUser
            ) {

                localStorage.setItem(
                    STORAGE.CURRENT,
                    STATE.currentUser.username
                );

            } else {

                localStorage.removeItem(
                    STORAGE.CURRENT
                );

            }

        } catch (error) {}

    }


    function loadCurrentUser() {

        try {

            const username =
                localStorage.getItem(
                    STORAGE.CURRENT
                );


            if (!username) {

                STATE.currentUser =
                    null;

                return;

            }


            const users =
                getUsers();


            STATE.currentUser =
                users.find(
                    user =>
                        user.username ===
                        username
                ) || null;

        } catch (error) {

            STATE.currentUser =
                null;

        }

    }


    function createDefaultUser(
        name,
        username,
        password
    ) {

        return {

            name:
                name.trim(),

            username:
                username.trim(),

            password,

            createdAt:
                Date.now(),

            scores: {

                "heart-catch": 0,

                "flower-memory": 0,

                "berry-rush": 0,

                "save-the-cat": 0,

                "quiz": 0,

                "duo": 0

            },

            bestScores: {

                "heart-catch": 0,

                "flower-memory": 0,

                "berry-rush": 0,

                "save-the-cat": 0,

                "quiz": 0,

                "duo": 0

            },

            completed: {

                "heart-catch": false,

                "flower-memory": false,

                "berry-rush": false,

                "save-the-cat": false,

                "quiz": false,

                "duo": false

            },

            stats: {

                totalPlays: 0,

                totalWins: 0,

                totalHits: 0,

                bestCombo: 0

            },

            bonusClaimed: false

        };

    }


    function normalizeUser(user) {

        if (!user) return null;


        if (!user.scores) {

            user.scores = {};

        }


        if (!user.bestScores) {

            user.bestScores = {};

        }


        if (!user.completed) {

            user.completed = {};

        }


        if (!user.stats) {

            user.stats = {

                totalPlays: 0,

                totalWins: 0,

                totalHits: 0,

                bestCombo: 0

            };

        }


        Object.keys(
            GAME_CONFIG
        ).forEach(
            gameId => {

                if (
                    typeof user.scores[gameId] !==
                    "number"
                ) {

                    user.scores[gameId] =
                        0;

                }


                if (
                    typeof user.bestScores[gameId] !==
                    "number"
                ) {

                    user.bestScores[gameId] =
                        user.scores[gameId] ||
                        0;

                }


                if (
                    typeof user.completed[gameId] !==
                    "boolean"
                ) {

                    user.completed[gameId] =
                        false;

                }

            }
        );


        if (
            typeof user.bonusClaimed !==
            "boolean"
        ) {

            user.bonusClaimed =
                false;

        }


        return user;

    }


    function saveCurrentUser() {

        if (!STATE.currentUser) {
            return;
        }


        normalizeUser(
            STATE.currentUser
        );


        const users =
            getUsers();


        const index =
            users.findIndex(
                user =>
                    user.username ===
                    STATE.currentUser.username
            );


        if (index >= 0) {

            users[index] =
                STATE.currentUser;

        } else {

            users.push(
                STATE.currentUser
            );

        }


        saveUsers(users);

        saveCurrentUserReference();

    }


    /* =====================================================
       13. ACCOUNT
       ===================================================== */

    function registerUser(event) {

        event?.preventDefault();


        const nameInput =
            $("name-input");

        const usernameInput =
            $("username-input");

        const passwordInput =
            $("password-input");


        if (
            !nameInput ||
            !usernameInput ||
            !passwordInput
        ) {

            toast(
                "Form pendaftaran tidak ditemukan 😭"
            );

            return;

        }


        const name =
            nameInput.value.trim();

        const username =
            usernameInput.value.trim();

        const password =
            passwordInput.value;


        if (
            name.length < 2
        ) {

            toast(
                "Nama minimal 2 karakter yaa 😭"
            );

            nameInput.focus();

            return;

        }


        if (
            username.length < 3
        ) {

            toast(
                "Username minimal 3 karakter."
            );

            usernameInput.focus();

            return;

        }


        if (
            !/^[a-zA-Z0-9_.-]+$/.test(
                username
            )
        ) {

            toast(
                "Username hanya boleh huruf, angka, titik, - dan _."
            );

            usernameInput.focus();

            return;

        }


        if (
            password.length < 4
        ) {

            toast(
                "Password minimal 4 karakter."
            );

            passwordInput.focus();

            return;

        }


        const users =
            getUsers();


        const duplicate =
            users.some(
                user =>
                    String(
                        user.username
                    ).toLowerCase() ===
                    username.toLowerCase()
            );


        if (duplicate) {

            toast(
                "Username itu sudah dipakai 😭"
            );

            usernameInput.focus();

            return;

        }


        STATE.currentUser =
            createDefaultUser(
                name,
                username,
                password
            );


        users.push(
            STATE.currentUser
        );


        saveUsers(users);

        saveCurrentUserReference();


        nameInput.value = "";

        usernameInput.value = "";

        passwordInput.value = "";


        resumeAudio();

        playMusic();


        playSFX(
            "success",
            {
                volume: 0.06,
                duration: 0.18
            }
        );


        updateUserUI();

        updateProgress();

        updateMenu();


        showScreen(
            "menu"
        );


        launchConfetti();


        toast(
            `Hai ${STATE.currentUser.name}! Selamat datang di dunia Miaa 🎮🌷`
        );

    }


    function loginUser(event) {

        event?.preventDefault();


        const usernameInput =
            $("login-username");

        const passwordInput =
            $("login-password");


        if (
            !usernameInput ||
            !passwordInput
        ) {

            return;

        }


        const username =
            usernameInput.value.trim();

        const password =
            passwordInput.value;


        if (
            !username ||
            !password
        ) {

            toast(
                "Username dan password harus diisi."
            );

            return;

        }


        const users =
            getUsers();


        const user =
            users.find(
                item =>
                    String(
                        item.username
                    ).toLowerCase() ===
                    username.toLowerCase() &&
                    item.password ===
                    password
            );


        if (!user) {

            playSFX(
                "wrong",
                {
                    volume: 0.04
                }
            );


            toast(
                "Username atau password salah 😭"
            );

            return;

        }


        STATE.currentUser =
            normalizeUser(user);


        saveCurrentUserReference();


        usernameInput.value = "";

        passwordInput.value = "";


        resumeAudio();

        playMusic();


        updateUserUI();

        updateProgress();

        updateMenu();


        playSFX(
            "success",
            {
                volume: 0.06,
                duration: 0.16
            }
        );


        showScreen(
            "menu"
        );


        toast(
            `Welcome back, ${STATE.currentUser.name}! 👋✨`
        );

    }


    function logoutUser() {

        stopCurrentGame();


        STATE.currentUser =
            null;


        saveCurrentUserReference();


        updateUserUI();

        updateProgress();


        showScreen(
            "landing"
        );


        toast(
            "Sampai jumpa lagi 👋"
        );

    }


    /* =====================================================
       14. USER UI
       ===================================================== */

    function updateUserUI() {

        const landingUser =
            $("landing-user");

        const menuUser =
            $("menu-user");


        const name =
            STATE.currentUser
                ? STATE.currentUser.name
                : null;


        if (landingUser) {

            landingUser.textContent =
                name ||
                "Belum login";

        }


        if (menuUser) {

            menuUser.textContent =
                name ||
                "Player";

        }


        updateTotalScore();

    }


    /* =====================================================
       15. SCORE
       ===================================================== */

    function getTotalScore() {

        if (
            !STATE.currentUser
        ) {

            return 0;

        }


        return Object.values(
            STATE.currentUser.scores || {}
        ).reduce(
            (
                total,
                value
            ) =>
                total +
                Number(value || 0),
            0
        );

    }


    function getBestTotalScore() {

        if (
            !STATE.currentUser
        ) {

            return 0;

        }


        return Object.values(
            STATE.currentUser.bestScores || {}
        ).reduce(
            (
                total,
                value
            ) =>
                total +
                Number(value || 0),
            0
        );

    }


    function updateTotalScore() {

        const total =
            getTotalScore();


        const totalBest =
            getBestTotalScore();


        const menuScore =
            $("total-score");


        const gameTotal =
            $("game-total-score");


        const bestScore =
            $("best-score");


        if (menuScore) {

            menuScore.textContent =
                total;

        }


        if (gameTotal) {

            gameTotal.textContent =
                total;

        }


        if (bestScore) {

            bestScore.textContent =
                totalBest;

        }

    }


    function setScore(
        value
    ) {

        STATE.score =
            Math.max(
                0,
                Math.floor(
                    Number(value) || 0
                )
            );


        const element =
            $("game-score");


        if (element) {

            element.textContent =
                STATE.score;

        }


        updateTotalScore();

    }


    function addScore(
        amount,
        effect = true
    ) {

        const value =
            Number(amount) || 0;


        STATE.score =
            Math.max(
                0,
                STATE.score + value
            );


        const element =
            $("game-score");


        if (element) {

            element.textContent =
                STATE.score;

        }


        if (
            effect &&
            value !== 0
        ) {

            updateScoreAnimation();

        }

    }


    function updateScoreAnimation() {

        const element =
            $("game-score");

        if (!element) return;


        element.classList.remove(
            "score-pop"
        );


        void element.offsetWidth;


        element.classList.add(
            "score-pop"
        );

    }


    /* =====================================================
       16. COMBO
       ===================================================== */

    function resetCombo() {

        STATE.combo = 0;

        updateComboUI();

    }


    function increaseCombo() {

        STATE.combo++;

        STATE.maxCombo =
            Math.max(
                STATE.maxCombo,
                STATE.combo
            );


        if (
            STATE.currentUser &&
            STATE.currentUser.stats
        ) {

            STATE.currentUser.stats.bestCombo =
                Math.max(
                    Number(
                        STATE.currentUser.stats.bestCombo || 0
                    ),
                    STATE.combo
                );

        }


        updateComboUI();


        if (
            STATE.combo >= 3
        ) {

            playSFX(
                "combo",
                {
                    volume: 0.025,
                    duration: 0.08
                }
            );

        }

    }


    function breakCombo() {

        STATE.combo = 0;

        updateComboUI();

    }


    function getComboMultiplier() {

        if (STATE.combo >= 10) {
            return 3;
        }

        if (STATE.combo >= 5) {
            return 2;
        }

        if (STATE.combo >= 3) {
            return 1.5;
        }

        return 1;

    }


    function updateComboUI() {

        const elements =
            $$(".combo-value");


        elements.forEach(
            element => {

                element.textContent =
                    STATE.combo > 0
                        ? `×${STATE.combo}`
                        : "×0";

            }
        );


        const combo =
            $("game-combo");


        if (combo) {

            combo.textContent =
                STATE.combo > 0
                    ? `COMBO ×${STATE.combo}`
                    : "COMBO ×0";

        }

    }


    /* =====================================================
       17. PROGRESS
       ===================================================== */

    function getCompletedCount() {

        if (
            !STATE.currentUser
        ) {

            return 0;

        }


        return Object.values(
            STATE.currentUser.completed || {}
        ).filter(Boolean).length;

    }


    function updateProgress() {

        const completed =
            getCompletedCount();


        const progressText =
            $("progress-text");


        const progressBar =
            $("progress-bar");


        const progressHint =
            $("progress-hint");


        if (progressText) {

            progressText.textContent =
                `${completed} / 6`;

        }


        if (progressBar) {

            progressBar.style.width =
                `${(
                    completed / 6
                ) * 100}%`;

        }


        const track =
            document.querySelector(
                ".progress-track"
            );


        if (track) {

            track.setAttribute(
                "aria-valuenow",
                completed
            );

        }


        if (progressHint) {

            if (
                completed >= 6
            ) {

                progressHint.textContent =
                    STATE.currentUser?.bonusClaimed
                        ? "Semua game selesai! Kamu sudah membuka hadiah ☕✨"
                        : "SEMUA GAME SELESAI! Hadiah rahasia sudah menunggu ☕🎁";

            } else {

                const remaining =
                    6 - completed;


                progressHint.textContent =
                    `${remaining} game lagi sampai hadiah rahasia terbuka ☕`;

            }

        }


        updateTotalScore();

    }


    function saveGameResult(
        gameId,
        score
    ) {

        if (
            !STATE.currentUser
        ) {

            return;

        }


        normalizeUser(
            STATE.currentUser
        );


        const oldScore =
            Number(
                STATE.currentUser.scores[gameId] ||
                0
            );


        const oldBest =
            Number(
                STATE.currentUser.bestScores[gameId] ||
                0
            );


        STATE.currentUser.scores[gameId] =
            Math.max(
                oldScore,
                score
            );


        STATE.currentUser.bestScores[gameId] =
            Math.max(
                oldBest,
                score
            );


        STATE.currentUser.completed[gameId] =
            true;


        STATE.currentUser.stats.totalPlays++;


        if (score > 0) {

            STATE.currentUser.stats.totalWins++;

        }


        saveCurrentUser();

        updateProgress();

    }


    /* =====================================================
       18. GAME HUD
       ===================================================== */

    function updateGameHUD(
        targetValue,
        targetText
    ) {

        const score =
            $("game-score");


        const target =
            $("target");


        if (score) {

            score.textContent =
                STATE.score;

        }


        if (target) {

            target.textContent =
                targetText ??
                targetValue;

        }


        updateComboUI();

        updateTotalScore();

    }


    function updateTimerDisplay() {

        const timer =
            $("timer");


        if (!timer) return;


        timer.textContent =
            Math.max(
                0,
                Math.ceil(
                    STATE.time
                )
            );


        timer.classList.toggle(
            "danger",
            STATE.time <= 5 &&
            STATE.time > 0
        );


        if (
            STATE.time <= 5 &&
            STATE.time > 0
        ) {

            timer.classList.add(
                "timer-pulse"
            );

        } else {

            timer.classList.remove(
                "timer-pulse"
            );

        }

    }


    /* =====================================================
       19. TRACK TIMERS / CLEANUP
       ===================================================== */

    function trackInterval(
        callback,
        delay
    ) {

        const id =
            setInterval(
                callback,
                delay
            );


        STATE.intervals.add(
            id
        );


        return id;

    }


    function trackTimeout(
        callback,
        delay
    ) {

        const id =
            setTimeout(() => {

                STATE.timeouts.delete(
                    id
                );

                callback();

            }, delay);


        STATE.timeouts.add(
            id
        );


        return id;

    }


    function registerCleanup(
        callback
    ) {

        if (
            typeof callback ===
            "function"
        ) {

            STATE.cleanups.push(
                callback
            );

        }

    }


    function clearTrackedTimers() {

        if (STATE.timer) {

            clearInterval(
                STATE.timer
            );

            STATE.timer =
                null;

        }


        STATE.intervals.forEach(
            id => {

                clearInterval(id);

            }
        );


        STATE.timeouts.forEach(
            id => {

                clearTimeout(id);

            }
        );


        STATE.intervals.clear();

        STATE.timeouts.clear();


        if (
            STATE.animationFrame
        ) {

            cancelAnimationFrame(
                STATE.animationFrame
            );

            STATE.animationFrame =
                null;

        }

    }


    function runCleanups() {

        const cleanups =
            [...STATE.cleanups];


        STATE.cleanups = [];


        cleanups.forEach(
            cleanup => {

                try {

                    cleanup();

                } catch (error) {

                    console.warn(
                        "Cleanup error:",
                        error
                    );

                }

            }
        );

    }


    /* =====================================================
       20. GAME STOP
       ===================================================== */

    function stopCurrentGame() {

        STATE.gameRunning =
            false;


        STATE.gameToken++;


        clearTrackedTimers();

        runCleanups();


        const arena =
            $("game-arena");


        if (arena) {

            arena
                .querySelectorAll(
                    ".game-dynamic, " +
                    ".game-object, " +
                    ".heart-target, " +
                    ".berry-target, " +
                    ".memory-card, " +
                    ".meteor, " +
                    ".quiz-option, " +
                    ".duo-object, " +
                    ".cat-player, " +
                    ".game-particle, " +
                    ".floating-score"
                )
                .forEach(
                    element =>
                        element.remove()
                );

        }


        const touchControls =
            $("touch-controls");


        if (touchControls) {

            touchControls.style.display =
                "none";

        }

    }


    /* =====================================================
       21. GAME SELECT
       ===================================================== */

    function selectGame(
        gameId
    ) {

        if (
            !GAME_CONFIG[gameId]
        ) {

            toast(
                "Game tidak ditemukan 😭"
            );

            return;

        }


        stopCurrentGame();


        STATE.currentGame =
            gameId;


        STATE.score = 0;

        STATE.target = 0;

        STATE.combo = 0;

        STATE.maxCombo = 0;

        STATE.time =
            GAME_CONFIG[gameId].time;


        STATE.duration =
            GAME_CONFIG[gameId].time;


        STATE.gameData = {};


        const config =
            GAME_CONFIG[gameId];


        if ($("game-name")) {

            $("game-name").textContent =
                config.name;

        }


        if ($("game-title")) {

            $("game-title").textContent =
                config.title;

        }


        if ($("game-category")) {

            $("game-category").textContent =
                config.category;

        }


        if ($("game-description")) {

            $("game-description").textContent =
                config.description;

        }


        if ($("timer")) {

            $("timer").textContent =
                config.time;

        }


        if ($("game-score")) {

            $("game-score").textContent =
                "0";

        }


        if ($("target")) {

            $("target").textContent =
                getInitialTargetText(
                    gameId
                );

        }


        updateComboUI();


        const arena =
            $("game-arena");


        if (arena) {

            arena.innerHTML = `

                <div
                    class="arena-message"
                    id="arena-message"
                >

                    <div
                        class="arena-big-icon"
                        aria-hidden="true"
                    >
                        ${getGameIcon(gameId)}
                    </div>

                    <strong>
                        ${getGameReadyTitle(gameId)}
                    </strong>

                    <span>
                        ${getStartMessage(gameId)}
                    </span>

                    <small>
                        ${getGameTip(gameId)}
                    </small>

                </div>

            `;

        }


        const startButton =
            $("start-game-button");


        if (startButton) {

            startButton.disabled =
                false;

            startButton.style.display =
                "";

            startButton.textContent =
                "▶ MULAI GAME";

        }


        const status =
            $("game-status");


        if (status) {

            status.textContent =
                getStartMessage(gameId);

        }


        showScreen(
            "game"
        );

    }


    function getGameIcon(
        gameId
    ) {

        const icons = {

            "heart-catch":
                "💗",

            "flower-memory":
                "🌸",

            "berry-rush":
                "🍓",

            "save-the-cat":
                "🐱",

            "quiz":
                "🧠",

            "duo":
                "👥"

        };


        return icons[gameId] ||
            "🎮";

    }


    function getGameReadyTitle(
        gameId
    ) {

        const titles = {

            "heart-catch":
                "SIAP TANGKAP HATI?",

            "flower-memory":
                "MASIH INGAT PASANGANNYA?",

            "berry-rush":
                "STROBERI SIAP KABUR 🍓",

            "save-the-cat":
                "SELAMATKAN SI KUCING!",

            "quiz":
                "SEBERAPA KENAL MIAA?",

            "duo":
                "SIAPA PALING CEPAT?"

        };


        return titles[gameId] ||
            "SIAP?";

    }


    function getInitialTargetText(
        gameId
    ) {

        switch (gameId) {

            case "heart-catch":

                return "0/20";


            case "flower-memory":

                return "0/6";


            case "berry-rush":

                return "0/18";


            case "quiz":

                return "0/10";


            case "save-the-cat":

                return "SURVIVE";


            case "duo":

                return "P1 VS P2";


            default:

                return "0";

        }

    }


    function getStartMessage(
        gameId
    ) {

        const messages = {

            "heart-catch":
                "Tangkap hati yang muncul sebelum waktunya habis! 💗",

            "flower-memory":
                "Buka dua kartu dan cari pasangan bunga yang sama. 🌸",

            "berry-rush":
                "Klik stroberi secepat mungkin. Bonus bisa muncul! 🍓",

            "save-the-cat":
                "Gerakkan kucing dan hindari meteor yang turun. ☄️🐱",

            "quiz":
                "Jawab 10 pertanyaan tentang Miaa. Jangan asal 😭",

            "duo":
                "P1 dan P2 bergantian mengejar target. Gas! 👥"

        };


        return messages[gameId] ||
            "Siap bermain? 🎮";

    }


    function getGameTip(
        gameId
    ) {

        const tips = {

            "heart-catch":
                "💡 Combo tinggi = skor lebih besar.",

            "flower-memory":
                "💡 Ingat posisi kartu yang sudah dibuka.",

            "berry-rush":
                "💡 Cari ☕ dan 🍗 untuk bonus.",

            "save-the-cat":
                "💡 Geser layar atau gunakan tombol arah.",

            "quiz":
                "💡 Ini tentang Miaa. Masa nggak tahu 😭",

            "duo":
                "💡 P1 & P2 bermain di HP yang sama."

        };


        return tips[gameId] ||
            "💡 Have fun!";

    }


    /* =====================================================
       22. START GAME
       ===================================================== */

    function startCurrentGame() {

        if (
            STATE.gameRunning
        ) {

            return;

        }


        if (
            !STATE.currentGame
        ) {

            toast(
                "Pilih game dulu ya 😭"
            );

            return;

        }


        resumeAudio();

        playMusic();


        stopCurrentGame();


        STATE.gameRunning =
            true;


        STATE.gameToken++;


        const token =
            STATE.gameToken;


        STATE.score = 0;

        STATE.target = 0;

        STATE.combo = 0;

        STATE.maxCombo = 0;


        const config =
            GAME_CONFIG[
                STATE.currentGame
            ];


        STATE.duration =
            config.time;

        STATE.time =
            config.time;


        setScore(0);

        updateTimerDisplay();

        updateComboUI();


        const startButton =
            $("start-game-button");


        if (startButton) {

            startButton.disabled =
                true;

            startButton.textContent =
                "⏳ SEDANG MAIN...";

        }


        const arenaMessage =
            $("arena-message");


        if (arenaMessage) {

            arenaMessage.remove();

        }


        switch (
            STATE.currentGame
        ) {

            case "heart-catch":

                startHeartCatch(token);

                break;


            case "flower-memory":

                startFlowerMemory(token);

                break;


            case "berry-rush":

                startBerryRush(token);

                break;


            case "save-the-cat":

                startSaveTheCat(token);

                break;


            case "quiz":

                startQuiz(token);

                break;


            case "duo":

                startDuo(token);

                break;


            default:

                finishGame(
                    0,
                    "Game engine tidak ditemukan."
                );

        }

    }


    /* =====================================================
       23. TIMER ENGINE
       ===================================================== */

    function startTimer(
        seconds,
        token,
        onFinish
    ) {

        clearTrackedTimers();


        STATE.time =
            seconds;


        updateTimerDisplay();


        const startTime =
            performance.now();


        const durationMS =
            seconds * 1000;


        function tick(
            now
        ) {

            if (
                !STATE.gameRunning ||
                token !== STATE.gameToken
            ) {

                return;

            }


            const elapsed =
                now - startTime;


            const remaining =
                Math.max(
                    0,
                    seconds -
                    elapsed / 1000
                );


            STATE.time =
                remaining;


            updateTimerDisplay();


            if (
                remaining <= 0
            ) {

                STATE.time = 0;

                updateTimerDisplay();

                onFinish();

                return;

            }


            STATE.animationFrame =
                requestAnimationFrame(
                    tick
                );

        }


        STATE.animationFrame =
            requestAnimationFrame(
                tick
            );

    }


    /* =====================================================
       24. FINISH GAME
       ===================================================== */

    function finishGame(
        score,
        message = "Keren! 🎉"
    ) {

        if (
            !STATE.gameRunning
        ) {

            return;

        }


        STATE.gameRunning =
            false;


        clearTrackedTimers();

        runCleanups();


        const finishedGame =
            STATE.currentGame;


        const finalScore =
            Math.max(
                0,
                Math.floor(
                    Number(score) || 0
                )
            );


        STATE.score =
            finalScore;


        saveGameResult(
            finishedGame,
            finalScore
        );


        const previousBest =
            STATE.currentUser
                ? Number(
                    STATE.currentUser.bestScores[
                        finishedGame
                    ] || 0
                )
                : 0;


        const isNewBest =
            finalScore >= previousBest &&
            finalScore > 0;


        const finalScoreElement =
            $("final-score");


        const resultMessage =
            $("result-message");


        const resultTitle =
            $("result-title");


        const resultIcon =
            $("result-icon");


        const resultLabel =
            $("result-label");


        if (finalScoreElement) {

            finalScoreElement.textContent =
                finalScore;

        }


        if (resultMessage) {

            resultMessage.textContent =
                message;

        }


        if (resultIcon) {

            resultIcon.textContent =
                getResultIcon(
                    finalScore
                );

        }


        if (resultTitle) {

            resultTitle.textContent =
                getResultTitle(
                    finalScore
                );

        }


        if (resultLabel) {

            resultLabel.textContent =
                isNewBest
                    ? "NEW BEST SCORE! 🔥"
                    : "ROUND COMPLETE";

        }


        if (isNewBest) {

            playSFX(
                "bonus",
                {
                    volume: 0.07,
                    duration: 0.35
                }
            );


            vibrate(
                [40, 50, 100]
            );


            launchConfetti();

        } else {

            playSFX(
                "success",
                {
                    volume: 0.055,
                    duration: 0.20
                }
            );


            vibrate(
                [30, 40, 60]
            );

        }


        updateProgress();


        const startButton =
            $("start-game-button");


        if (startButton) {

            startButton.disabled =
                false;

            startButton.textContent =
                "▶ MAIN LAGI";

        }


        showScreen(
            "result"
        );


        checkCompletionBonus();

    }


    function getResultTitle(
        score
    ) {

        if (
            score >= 30
        ) {

            return "GILA JAGO BANGET! 🔥";

        }


        if (
            score >= 20
        ) {

            return "MANTAP POLL! 😎";

        }


        if (
            score >= 10
        ) {

            return "WIIHHH BAGUS! 🎉";

        }


        if (
            score >= 5
        ) {

            return "LUMAYAN NIH 😭";

        }


        return "YAHH... 😭";

    }


    function getResultIcon(
        score
    ) {

        if (
            score >= 30
        ) {

            return "🏆";

        }


        if (
            score >= 20
        ) {

            return "🔥";

        }


        if (
            score >= 10
        ) {

            return "🎉";

        }


        if (
            score >= 5
        ) {

            return "💪";

        }


        return "🐱";

    }


    /* =====================================================
       25. HEART CATCH
       ===================================================== */

    function startHeartCatch(
        token
    ) {

        const arena =
            $("game-arena");


        if (!arena) {

            finishGame(
                0,
                "Arena tidak ditemukan 😭"
            );

            return;

        }


        arena.innerHTML = `

            <div class="game-dynamic heart-game">

                <div class="heart-game-top">

                    <span>
                        💗 CATCH THEM ALL
                    </span>

                    <span
                        class="combo-value"
                    >
                        ×0
                    </span>

                </div>

                <div
                    class="heart-message"
                    id="heart-message"
                >
                    Tangkap hati!
                </div>

                <div
                    class="heart-field"
                    id="heart-field"
                ></div>

            </div>

        `;


        const field =
            $("heart-field");


        if (!field) {

            finishGame(
                0,
                "Heart field tidak ditemukan."
            );

            return;

        }


        let caught =
            0;


        let misses =
            0;


        let lastSpawn =
            0;


        const maxTarget =
            GAME_CONFIG[
                "heart-catch"
            ].target;


        const spawnHeart =
            () => {

                if (
                    !STATE.gameRunning ||
                    token !== STATE.gameToken
                ) {

                    return;

                }


                $$(".heart-target", field)
                    .forEach(
                        old =>
                            old.remove()
                    );


                const heart =
                    document.createElement(
                        "button"
                    );


                heart.type =
                    "button";


                heart.className =
                    "heart-target game-object";


                const variants = [

                    "💗",
                    "💖",
                    "💕",
                    "💓",
                    "💘"

                ];


                heart.textContent =
                    pick(variants);


                const size =
                    randomInt(
                        50,
                        78
                    );


                heart.style.width =
                    `${size}px`;


                heart.style.height =
                    `${size}px`;


                heart.style.left =
                    `${random(9, 91)}%`;


                heart.style.top =
                    `${random(12, 86)}%`;


                heart.style.position =
                    "absolute";


                heart.style.transform =
                    "translate(-50%, -50%)";


                heart.style.zIndex =
                    "20";


                heart.setAttribute(
                    "aria-label",
                    "Tangkap hati"
                );


                const spawnTime =
                    performance.now();


                heart.addEventListener(
                    "pointerdown",
                    event => {

                        event.preventDefault();


                        if (
                            !STATE.gameRunning ||
                            token !== STATE.gameToken
                        ) {

                            return;

                        }


                        const reaction =
                            performance.now() -
                            spawnTime;


                        caught++;

                        increaseCombo();


                        const multiplier =
                            getComboMultiplier();


                        const gained =
                            Math.max(
                                1,
                                Math.round(
                                    multiplier
                                )
                            );


                        addScore(
                            gained
                        );


                        if (
                            STATE.currentUser?.stats
                        ) {

                            STATE.currentUser.stats.totalHits++;

                        }


                        updateGameHUD(
                            caught,
                            `${caught}/${maxTarget}`
                        );


                        createFloatingText(
                            `+${gained}`,
                            parseFloat(
                                heart.style.left
                            ),
                            parseFloat(
                                heart.style.top
                            ),
                            "positive"
                        );


                        burstParticles(
                            parseFloat(
                                heart.style.left
                            ),
                            parseFloat(
                                heart.style.top
                            ),
                            [
                                "💗",
                                "✨",
                                "💕"
                            ],
                            7
                        );


                        if (
                            reaction < 500
                        ) {

                            playSFX(
                                "hit",
                                {
                                    volume: 0.035,
                                    duration: 0.07
                                }
                            );

                        } else {

                            playSFX(
                                "click",
                                {
                                    volume: 0.025,
                                    duration: 0.05
                                }
                            );

                        }


                        vibrate(12);


                        heart.remove();


                        if (
                            STATE.combo === 5 ||
                            STATE.combo === 10
                        ) {

                            createFloatingText(
                                `COMBO ×${STATE.combo}!`,
                                50,
                                45,
                                "combo-pop"
                            );


                            burstParticles(
                                50,
                                45,
                                [
                                    "🔥",
                                    "⭐",
                                    "✨"
                                ],
                                12
                            );

                        }


                        if (
                            caught >=
                            maxTarget
                        ) {

                            finishGame(
                                STATE.score,
                                `Semua ${caught} hati berhasil ditangkap! 💗🔥`
                            );

                            return;

                        }


                        spawnHeart();

                    },
                    {
                        passive: false
                    }
                );


                field.appendChild(
                    heart
                );


                lastSpawn =
                    performance.now();

            };


        spawnHeart();


        const spawnLoop =
            trackInterval(
                () => {

                    if (
                        !STATE.gameRunning ||
                        token !== STATE.gameToken
                    ) {

                        return;

                    }


                    misses++;


                    if (
                        misses % 4 === 0
                    ) {

                        breakCombo();

                    }


                    spawnHeart();

                },
                720
            );


        void spawnLoop;


        updateGameHUD(
            0,
            `0/${maxTarget}`
        );


        startTimer(
            GAME_CONFIG[
                "heart-catch"
            ].time,
            token,
            () => {

                finishGame(
                    STATE.score,
                    `Waktu habis! Kamu berhasil menangkap ${caught} hati 💗`
                );

            }
        );

    }


    /* =====================================================
       26. FLOWER MEMORY
       ===================================================== */

    function startFlowerMemory(
        token
    ) {

        const arena =
            $("game-arena");


        if (!arena) return;


        const flowers = [

            "🌸",
            "🌺",
            "🌻",
            "🌷",
            "🌹",
            "💮"

        ];


        const cards =
            shuffle(
                [
                    ...flowers,
                    ...flowers
                ]
            );


        arena.innerHTML = `

            <div class="game-dynamic memory-game">

                <div class="memory-header">

                    <span>
                        🌸 FIND THE PAIRS
                    </span>

                    <span
                        id="memory-moves"
                    >
                        0 moves
                    </span>

                </div>

                <div
                    class="memory-board"
                    id="memory-board"
                ></div>

            </div>

        `;


        const board =
            $("memory-board");


        if (!board) return;


        let firstCard =
            null;


        let secondCard =
            null;


        let locked =
            false;


        let matched =
            0;


        let moves =
            0;


        function resetSelection() {

            firstCard = null;

            secondCard = null;

            locked = false;

        }


        function handleCard(
            card
        ) {

            if (
                !STATE.gameRunning ||
                token !== STATE.gameToken ||
                locked ||
                card.classList.contains(
                    "flipped"
                ) ||
                card.classList.contains(
                    "matched"
                )
            ) {

                return;

            }


            card.classList.add(
                "flipped"
            );


            playSFX(
                "click",
                {
                    volume: 0.025,
                    duration: 0.05
                }
            );


            if (!firstCard) {

                firstCard =
                    card;

                return;

            }


            secondCard =
                card;

            locked =
                true;


            moves++;


            const movesElement =
                $("memory-moves");


            if (movesElement) {

                movesElement.textContent =
                    `${moves} moves`;

            }


            const same =
                firstCard.dataset.value ===
                secondCard.dataset.value;


            if (same) {

                matched++;


                increaseCombo();


                const bonus =
                    8 +
                    Math.round(
                        getComboMultiplier() * 2
                    );


                addScore(
                    bonus
                );


                firstCard.classList.add(
                    "matched"
                );


                secondCard.classList.add(
                    "matched"
                );


                createFloatingText(
                    `+${bonus}`,
                    50,
                    48,
                    "positive"
                );


                burstParticles(
                    50,
                    50,
                    [
                        "🌸",
                        "✨",
                        "⭐"
                    ],
                    10
                );


                playSFX(
                    "success",
                    {
                        volume: 0.04,
                        duration: 0.12
                    }
                );


                vibrate(
                    [15]
                );


                resetSelection();


                updateGameHUD(
                    matched,
                    `${matched}/6`
                );


                if (
                    matched >= 6
                ) {

                    finishGame(
                        STATE.score,
                        `Semua pasangan bunga ditemukan dalam ${moves} langkah! 🌸🏆`
                    );

                    return;

                }

            } else {

                breakCombo();


                playSFX(
                    "wrong",
                    {
                        volume: 0.025,
                        duration: 0.08
                    }
                );


                createFloatingText(
                    "Coba lagi 😭",
                    50,
                    45,
                    "negative"
                );


                trackTimeout(
                    () => {

                        firstCard?.classList.remove(
                            "flipped"
                        );


                        secondCard?.classList.remove(
                            "flipped"
                        );


                        resetSelection();

                    },
                    650
                );

            }

        }


        cards.forEach(
            (
                flower,
                index
            ) => {

                const card =
                    document.createElement(
                        "button"
                    );


                card.type =
                    "button";


                card.className =
                    "memory-card";


                card.dataset.value =
                    flower;


                card.dataset.index =
                    index;


                card.innerHTML = `

                    <span class="memory-front">
                        ✦
                    </span>

                    <span class="memory-back">
                        ${flower}
                    </span>

                `;


                card.addEventListener(
                    "click",
                    () => {

                        handleCard(
                            card
                        );

                    }
                );


                board.appendChild(
                    card
                );

            }
        );


        updateGameHUD(
            0,
            "0/6"
        );


        startTimer(
            GAME_CONFIG[
                "flower-memory"
            ].time,
            token,
            () => {

                finishGame(
                    STATE.score,
                    `Waktu habis! Kamu menemukan ${matched}/6 pasangan bunga 🌸`
                );

            }
        );

    }


    /* =====================================================
       27. BERRY RUSH
       ===================================================== */

    function startBerryRush(
        token
    ) {

        const arena =
            $("game-arena");


        if (!arena) return;


        arena.innerHTML = `

            <div class="game-dynamic berry-game">

                <div class="berry-top">

                    <span>
                        🍓 BERRY RUSH
                    </span>

                    <span
                        id="berry-streak"
                    >
                        STREAK 0
                    </span>

                </div>

                <div
                    class="berry-field"
                    id="berry-field"
                ></div>

            </div>

        `;


        const field =
            $("berry-field");


        if (!field) return;


        let caught =
            0;


        let streak =
            0;


        let spawnTimeout =
            null;


        const target =
            GAME_CONFIG[
                "berry-rush"
            ].target;


        const updateBerryStreak =
            () => {

                const element =
                    $("berry-streak");


                if (element) {

                    element.textContent =
                        `STREAK ${streak}`;

                }

            };


        const spawnTarget =
            () => {

                if (
                    !STATE.gameRunning ||
                    token !== STATE.gameToken
                ) {

                    return;

                }


                field
                    .querySelectorAll(
                        ".berry-target"
                    )
                    .forEach(
                        element =>
                            element.remove()
                    );


                const targetButton =
                    document.createElement(
                        "button"
                    );


                targetButton.type =
                    "button";


                targetButton.className =
                    "berry-target game-object";


                const roll =
                    Math.random();


                let type =
                    "berry";


                if (
                    roll > 0.91
                ) {

                    type =
                        "chicken";

                } else if (
                    roll > 0.82
                ) {

                    type =
                        "coffee";

                }


                const content = {

                    berry: "🍓",

                    coffee: "☕",

                    chicken: "🍗"

                };


                targetButton.textContent =
                    content[type];


                targetButton.dataset.type =
                    type;


                const size =
                    type === "berry"
                        ? randomInt(48, 68)
                        : randomInt(52, 74);


                targetButton.style.position =
                    "absolute";


                targetButton.style.left =
                    `${random(9, 91)}%`;


                targetButton.style.top =
                    `${random(13, 84)}%`;


                targetButton.style.fontSize =
                    `${size}px`;


                targetButton.style.zIndex =
                    "20";


                targetButton.setAttribute(
                    "aria-label",
                    type === "berry"
                        ? "Stroberi"
                        : type === "coffee"
                            ? "Kopi bonus"
                            : "Ayam geprek bonus"
                );


                targetButton.addEventListener(
                    "pointerdown",
                    event => {

                        event.preventDefault();


                        if (
                            !STATE.gameRunning ||
                            token !== STATE.gameToken
                        ) {

                            return;

                        }


                        const x =
                            parseFloat(
                                targetButton.style.left
                            );


                        const y =
                            parseFloat(
                                targetButton.style.top
                            );


                        if (
                            spawnTimeout
                        ) {

                            clearTimeout(
                                spawnTimeout
                            );

                        }


                        targetButton.remove();


                        if (
                            type ===
                            "berry"
                        ) {

                            caught++;

                            streak++;


                            increaseCombo();


                            const multiplier =
                                getComboMultiplier();


                            const gained =
                                Math.max(
                                    1,
                                    Math.round(
                                        multiplier
                                    )
                                );


                            addScore(
                                gained
                            );


                            createFloatingText(
                                `+${gained}`,
                                x,
                                y,
                                "positive"
                            );


                            burstParticles(
                                x,
                                y,
                                [
                                    "🍓",
                                    "✨",
                                    "💫"
                                ],
                                7
                            );


                            playSFX(
                                "hit",
                                {
                                    volume: 0.035,
                                    duration: 0.07
                                }
                            );


                            vibrate(10);


                            updateGameHUD(
                                caught,
                                `${caught}/${target}`
                            );


                            if (
                                caught >=
                                target
                            ) {

                                finishGame(
                                    STATE.score,
                                    `Stroberinya habis kamu kejar! 🍓🔥`
                                );

                                return;

                            }

                        } else if (
                            type ===
                            "coffee"
                        ) {

                            addScore(
                                5
                            );


                            streak += 2;


                            createFloatingText(
                                "+5 ☕",
                                x,
                                y,
                                "bonus-pop"
                            );


                            burstParticles(
                                x,
                                y,
                                [
                                    "☕",
                                    "✨",
                                    "💖"
                                ],
                                10
                            );


                            playSFX(
                                "bonus",
                                {
                                    volume: 0.05,
                                    duration: 0.16
                                }
                            );


                            vibrate(
                                [20, 30, 20]
                            );


                            toast(
                                "KOPI BONUS! ☕ +5"
                            );

                        } else {

                            addScore(
                                10
                            );


                            streak += 3;


                            createFloatingText(
                                "+10 🍗",
                                x,
                                y,
                                "bonus-pop"
                            );


                            burstParticles(
                                x,
                                y,
                                [
                                    "🍗",
                                    "🔥",
                                    "✨"
                                ],
                                12
                            );


                            playSFX(
                                "bonus",
                                {
                                    volume: 0.07,
                                    duration: 0.22
                                }
                            );


                            vibrate(
                                [30, 30, 50]
                            );


                            toast(
                                "AYAM GEPREK BONUS!!! 🍗🔥"
                            );

                        }


                        updateBerryStreak();


                        spawnTarget();

                    },
                    {
                        passive: false
                    }
                );


                field.appendChild(
                    targetButton
                );


                const lifetime =
                    type === "berry"
                        ? randomInt(
                            650,
                            1000
                        )
                        : randomInt(
                            850,
                            1200
                        );


                spawnTimeout =
                    setTimeout(
                        () => {

                            if (
                                targetButton.isConnected
                            ) {

                                targetButton.remove();

                                streak = 0;

                                breakCombo();

                                updateBerryStreak();

                            }


                            spawnTarget();

                        },
                        lifetime
                    );


                STATE.timeouts.add(
                    spawnTimeout
                );

            };


        updateGameHUD(
            0,
            `0/${target}`
        );


        updateBerryStreak();


        spawnTarget();


        startTimer(
            GAME_CONFIG[
                "berry-rush"
            ].time,
            token,
            () => {

                finishGame(
                    STATE.score,
                    `Waktu habis! Kamu berhasil menangkap ${caught} stroberi 🍓`
                );

            }
        );

    }


    /* =====================================================
       28. SAVE THE CAT
       ===================================================== */

    function startSaveTheCat(
        token
    ) {

        const arena =
            $("game-arena");


        if (!arena) return;


        arena.innerHTML = `

            <div class="game-dynamic cat-game">

                <div class="cat-top">

                    <span>
                        🐱 SAVE THE CAT
                    </span>

                    <span
                        id="cat-lives"
                    >
                        ❤️❤️❤️
                    </span>

                </div>

                <div
                    class="cat-field"
                    id="cat-field"
                >

                    <div
                        class="cat-player"
                        id="cat-player"
                        aria-label="Kucing"
                    >
                        🐱
                    </div>

                    <div
                        class="meteor-layer"
                        id="meteor-layer"
                    ></div>

                    <div
                        class="cat-star-layer"
                        id="cat-star-layer"
                    ></div>

                </div>

                <div
                    class="cat-help"
                >
                    ← ↑ ↓ → atau geser layar
                </div>

            </div>

        `;


        const field =
            $("cat-field");


        const player =
            $("cat-player");


        const meteorLayer =
            $("meteor-layer");


        const starLayer =
            $("cat-star-layer");


        if (
            !field ||
            !player ||
            !meteorLayer
        ) {

            finishGame(
                0,
                "Arena kucing tidak ditemukan."
            );

            return;

        }


        let playerX =
            50;


        let playerY =
            82;


        let lives =
            3;


        let dodged =
            0;


        let stars =
            0;


        const meteors =
            [];


        const starsArray =
            [];


        const moveStep =
            5.5;


        function updatePlayer() {

            playerX =
                clamp(
                    playerX,
                    8,
                    92
                );


            playerY =
                clamp(
                    playerY,
                    10,
                    90
                );


            player.style.left =
                `${playerX}%`;


            player.style.top =
                `${playerY}%`;

        }


        function updateLives() {

            const element =
                $("cat-lives");


            if (!element) return;


            element.textContent =
                "❤️".repeat(
                    lives
                ) +
                "🖤".repeat(
                    3 - lives
                );

        }


        function movePlayer(
            direction
        ) {

            if (
                !STATE.gameRunning ||
                token !== STATE.gameToken
            ) {

                return;

            }


            switch (
                direction
            ) {

                case "up":

                    playerY -=
                        moveStep;

                    break;


                case "down":

                    playerY +=
                        moveStep;

                    break;


                case "left":

                    playerX -=
                        moveStep;

                    break;


                case "right":

                    playerX +=
                        moveStep;

                    break;

            }


            updatePlayer();

        }


        updatePlayer();

        updateLives();


        /* ---------------------------------------------
           KEYBOARD
        --------------------------------------------- */

        const keyboardHandler =
            event => {

                const key =
                    event.key.toLowerCase();


                const map = {

                    arrowup: "up",
                    w: "up",

                    arrowdown: "down",
                    s: "down",

                    arrowleft: "left",
                    a: "left",

                    arrowright: "right",
                    d: "right"

                };


                if (
                    map[key]
                ) {

                    event.preventDefault();

                    movePlayer(
                        map[key]
                    );

                }

            };


        document.addEventListener(
            "keydown",
            keyboardHandler
        );


        registerCleanup(
            () => {

                document.removeEventListener(
                    "keydown",
                    keyboardHandler
                );

            }
        );


        /* ---------------------------------------------
           TOUCH SWIPE
        --------------------------------------------- */

        let touchStartX =
            0;


        let touchStartY =
            0;


        const touchStart =
            event => {

                const touch =
                    event.touches?.[0];


                if (!touch) return;


                touchStartX =
                    touch.clientX;


                touchStartY =
                    touch.clientY;

            };


        const touchEnd =
            event => {

                const touch =
                    event.changedTouches?.[0];


                if (!touch) return;


                const dx =
                    touch.clientX -
                    touchStartX;


                const dy =
                    touch.clientY -
                    touchStartY;


                if (
                    Math.max(
                        Math.abs(dx),
                        Math.abs(dy)
                    ) < 25
                ) {

                    return;

                }


                if (
                    Math.abs(dx) >
                    Math.abs(dy)
                ) {

                    movePlayer(
                        dx > 0
                            ? "right"
                            : "left"
                    );

                } else {

                    movePlayer(
                        dy > 0
                            ? "down"
                            : "up"
                    );

                }

            };


        field.addEventListener(
            "touchstart",
            touchStart,
            {
                passive: true
            }
        );


        field.addEventListener(
            "touchend",
            touchEnd,
            {
                passive: true
            }
        );


        registerCleanup(
            () => {

                field.removeEventListener(
                    "touchstart",
                    touchStart
                );


                field.removeEventListener(
                    "touchend",
                    touchEnd
                );

            }
        );


        /* ---------------------------------------------
           OPTIONAL TOUCH CONTROLS
        --------------------------------------------- */

        const touchControls =
            $("touch-controls");


        if (touchControls) {

            touchControls.style.display =
                "grid";


            const buttons =
                $$(
                    "[data-direction]",
                    touchControls
                );


            buttons.forEach(
                button => {

                    const handler =
                        event => {

                            event.preventDefault();

                            movePlayer(
                                button.dataset.direction
                            );

                        };


                    button.addEventListener(
                        "pointerdown",
                        handler,
                        {
                            passive: false
                        }
                    );


                    registerCleanup(
                        () => {

                            button.removeEventListener(
                                "pointerdown",
                                handler
                            );

                        }
                    );

                }
            );

        }


        /* ---------------------------------------------
           METEOR SPAWN
        --------------------------------------------- */

        function spawnMeteor() {

            if (
                !STATE.gameRunning ||
                token !== STATE.gameToken
            ) {

                return;

            }


            const meteor =
                document.createElement(
                    "div"
                );


            meteor.className =
                "meteor";


            meteor.textContent =
                pick([
                    "☄️",
                    "🔥",
                    "💥",
                    "🌑"
                ]);


            const meteorData = {

                element:
                    meteor,

                x:
                    random(5, 95),

                y:
                    random(-15, -5),

                speed:
                    random(1.8, 3.4),

                size:
                    randomInt(30, 50)

            };


            meteor.style.position =
                "absolute";


            meteor.style.left =
                `${meteorData.x}%`;


            meteor.style.top =
                `${meteorData.y}%`;


            meteor.style.fontSize =
                `${meteorData.size}px`;


            meteor.style.zIndex =
                "15";


            meteor.style.pointerEvents =
                "none";


            meteorLayer.appendChild(
                meteor
            );


            meteors.push(
                meteorData
            );

        }


        /* ---------------------------------------------
           STAR SPAWN
        --------------------------------------------- */

        function spawnStar() {

            if (
                !STATE.gameRunning ||
                token !== STATE.gameToken ||
                !starLayer
            ) {

                return;

            }


            const star =
                document.createElement(
                    "button"
                );


            star.type =
                "button";


            star.className =
                "cat-star";


            star.textContent =
                "⭐";


            const starData = {

                element:
                    star,

                x:
                    random(10, 90),

                y:
                    random(15, 82),

                life:
                    0

            };


            star.style.position =
                "absolute";


            star.style.left =
                `${starData.x}%`;


            star.style.top =
                `${starData.y}%`;


            star.style.fontSize =
                "28px";


            star.style.zIndex =
                "12";


            starLayer.appendChild(
                star
            );


            starsArray.push(
                starData
            );


            star.addEventListener(
                "pointerdown",
                event => {

                    event.preventDefault();


                    if (
                        !STATE.gameRunning ||
                        token !== STATE.gameToken
                    ) {

                        return;

                    }


                    const index =
                        starsArray.indexOf(
                            starData
                        );


                    if (
                        index >= 0
                    ) {

                        starsArray.splice(
                            index,
                            1
                        );

                    }


                    stars++;

                    addScore(3);


                    createFloatingText(
                        "+3 ⭐",
                        starData.x,
                        starData.y,
                        "bonus-pop"
                    );


                    burstParticles(
                        starData.x,
                        starData.y,
                        [
                            "⭐",
                            "✨",
                            "💫"
                        ],
                        8
                    );


                    playSFX(
                        "bonus",
                        {
                            volume: 0.04,
                            duration: 0.10
                        }
                    );


                    star.remove();

                },
                {
                    passive: false
                }
            );


            trackTimeout(
                () => {

                    const index =
                        starsArray.indexOf(
                            starData
                        );


                    if (
                        index >= 0
                    ) {

                        starsArray.splice(
                            index,
                            1
                        );

                    }


                    star.remove();

                },
                1800
            );

        }


        function distance(
            ax,
            ay,
            bx,
            by
        ) {

            return Math.sqrt(
                (
                    ax - bx
                ) ** 2 +
                (
                    ay - by
                ) ** 2
            );

        }


        function handleMeteorCollision(
            meteor
        ) {

            if (
                distance(
                    playerX,
                    playerY,
                    meteor.x,
                    meteor.y
                ) <
                8.5
            ) {

                lives--;

                updateLives();


                breakCombo();


                screenShake(6);


                playSFX(
                    "danger",
                    {
                        volume: 0.07,
                        duration: 0.18
                    }
                );


                vibrate(
                    [80, 40, 80]
                );


                createFloatingText(
                    "ADUH! 😭",
                    playerX,
                    playerY,
                    "negative"
                );


                burstParticles(
                    playerX,
                    playerY,
                    [
                        "💥",
                        "😵",
                        "☄️"
                    ],
                    10
                );


                if (
                    lives <= 0
                ) {

                    finishGame(
                        STATE.score,
                        `Kucing tertabrak meteor setelah menghindari ${dodged} meteor ☄️🐱`
                    );


                    return true;

                }


                return true;

            }


            return false;

        }


        function updateWorld() {

            if (
                !STATE.gameRunning ||
                token !== STATE.gameToken
            ) {

                return;

            }


            for (
                let i =
                    meteors.length - 1;
                i >= 0;
                i--
            ) {

                const meteor =
                    meteors[i];


                meteor.y +=
                    meteor.speed;


                meteor.x +=
                    Math.sin(
                        meteor.y * 0.08
                    ) * 0.08;


                meteor.element.style.left =
                    `${meteor.x}%`;


                meteor.element.style.top =
                    `${meteor.y}%`;


                if (
                    handleMeteorCollision(
                        meteor
                    )
                ) {

                    meteor.element.remove();

                    meteors.splice(
                        i,
                        1
                    );


                    if (
                        !STATE.gameRunning
                    ) {

                        return;

                    }


                    continue;

                }


                if (
                    meteor.y >
                    108
                ) {

                    dodged++;

                    addScore(
                        1
                    );


                    increaseCombo();


                    meteor.element.remove();


                    meteors.splice(
                        i,
                        1
                    );

                }

            }


            STATE.animationFrame =
                requestAnimationFrame(
                    updateWorld
                );

        }


        trackInterval(
            spawnMeteor,
            520
        );


        trackInterval(
            spawnStar,
            1800
        );


        for (
            let i = 0;
            i < 4;
            i++
        ) {

            trackTimeout(
                spawnMeteor,
                i * 220
            );

        }


        updateGameHUD(
            0,
            "SURVIVE"
        );


        startTimer(
            GAME_CONFIG[
                "save-the-cat"
            ].time,
            token,
            () => {

                finishGame(
                    STATE.score,
                    `Berhasil bertahan! ${dodged} meteor dihindari dan ${stars} bintang dikumpulkan! 🐱⭐`
                );

            }
        );


        updateWorld();

    }


    /* =====================================================
       29. MIA QUIZ
       ===================================================== */

    function startQuiz(
        token
    ) {

        const arena =
            $("game-arena");


        if (!arena) return;


        arena.innerHTML = `

            <div class="game-dynamic quiz-game">

                <div
                    class="quiz-progress"
                    id="quiz-progress"
                >
                    SOAL 1 / 10
                </div>

                <div
                    class="quiz-score-mini"
                    id="quiz-score-mini"
                >
                    BENAR: 0
                </div>

                <div
                    class="quiz-question"
                    id="quiz-question"
                ></div>

                <div
                    class="quiz-options"
                    id="quiz-options"
                ></div>

                <div
                    class="quiz-reaction"
                    id="quiz-reaction"
                ></div>

            </div>

        `;


        const questionElement =
            $("quiz-question");


        const optionsElement =
            $("quiz-options");


        const progressElement =
            $("quiz-progress");


        const miniScore =
            $("quiz-score-mini");


        const reactionElement =
            $("quiz-reaction");


        let questionIndex =
            0;


        let correct =
            0;


        const questions =
            shuffle(
                QUIZ_QUESTIONS
            );


        function renderQuestion() {

            if (
                !STATE.gameRunning ||
                token !== STATE.gameToken
            ) {

                return;

            }


            const question =
                questions[
                    questionIndex
                ];


            if (!question) {

                finishGame(
                    STATE.score,
                    `Kamu benar ${correct}/10 soal! 🧠🎉`
                );

                return;

            }


            if (progressElement) {

                progressElement.textContent =
                    `SOAL ${
                        questionIndex + 1
                    } / ${
                        questions.length
                    }`;

            }


            if (questionElement) {

                questionElement.textContent =
                    question.question;

            }


            if (miniScore) {

                miniScore.textContent =
                    `BENAR: ${correct}`;

            }


            if (reactionElement) {

                reactionElement.textContent =
                    "";

            }


            if (optionsElement) {

                optionsElement.innerHTML =
                    "";

            }


            question.options.forEach(
                (
                    option,
                    index
                ) => {

                    const button =
                        document.createElement(
                            "button"
                        );


                    button.type =
                        "button";


                    button.className =
                        "quiz-option";


                    button.textContent =
                        option;


                    button.addEventListener(
                        "click",
                        () => {

                            if (
                                !STATE.gameRunning ||
                                token !== STATE.gameToken
                            ) {

                                return;

                            }


                            const buttons =
                                $$(
                                    ".quiz-option",
                                    optionsElement
                                );


                            buttons.forEach(
                                item => {

                                    item.disabled =
                                        true;

                                }
                            );


                            const isCorrect =
                                index ===
                                question.answer;


                            if (
                                isCorrect
                            ) {

                                correct++;


                                increaseCombo();


                                const gained =
                                    10 +
                                    Math.round(
                                        getComboMultiplier() *
                                        2
                                    );


                                addScore(
                                    gained
                                );


                                button.classList.add(
                                    "correct"
                                );


                                if (
                                    reactionElement
                                ) {

                                    reactionElement.textContent =
                                        question.reaction;

                                }


                                playSFX(
                                    "success",
                                    {
                                        volume: 0.04,
                                        duration: 0.12
                                    }
                                );


                                vibrate(
                                    18
                                );


                                burstParticles(
                                    50,
                                    50,
                                    [
                                        "🧠",
                                        "✨",
                                        "💗"
                                    ],
                                    7
                                );

                            } else {

                                breakCombo();


                                button.classList.add(
                                    "wrong"
                                );


                                const correctButton =
                                    buttons[
                                        question.answer
                                    ];


                                if (
                                    correctButton
                                ) {

                                    correctButton.classList.add(
                                        "correct"
                                    );

                                }


                                if (
                                    reactionElement
                                ) {

                                    reactionElement.textContent =
                                        "😭 Yahh melenceng. Coba lagi soal berikutnya.";

                                }


                                playSFX(
                                    "wrong",
                                    {
                                        volume: 0.035,
                                        duration: 0.10
                                    }
                                );


                                vibrate(
                                    [30]
                                );

                            }


                            updateGameHUD(
                                questionIndex + 1,
                                `${
                                    questionIndex + 1
                                }/10`
                            );


                            if (
                                miniScore
                            ) {

                                miniScore.textContent =
                                    `BENAR: ${correct}`;

                            }


                            trackTimeout(
                                () => {

                                    questionIndex++;


                                    if (
                                        questionIndex >=
                                        questions.length
                                    ) {

                                        finishGame(
                                            STATE.score,
                                            `Kamu berhasil menjawab ${correct}/10 soal dengan benar! 🧠🎉`
                                        );

                                        return;

                                    }


                                    renderQuestion();

                                },
                                750
                            );

                        }
                    );


                    optionsElement.appendChild(
                        button
                    );

                }
            );

        }


        updateGameHUD(
            0,
            "0/10"
        );


        renderQuestion();


        startTimer(
            GAME_CONFIG.quiz.time,
            token,
            () => {

                finishGame(
                    STATE.score,
                    `Waktu habis! Kamu benar ${correct}/10 soal 🧠`
                );

            }
        );

    }


    /* =====================================================
       30. DUO CHALLENGE
       ===================================================== */

    function startDuo(
        token
    ) {

        const arena =
            $("game-arena");


        if (!arena) return;


        arena.innerHTML = `

            <div class="game-dynamic duo-game">

                <div class="duo-title">
                    👥 DUO CHALLENGE
                </div>

                <div
                    class="duo-subtitle"
                    id="duo-phase"
                >
                    PLAYER 1 SIAP?
                </div>

                <div
                    class="duo-score-board"
                >

                    <div
                        class="duo-player p1"
                    >

                        <span>
                            PLAYER 1
                        </span>

                        <strong
                            id="duo-p1"
                        >
                            0
                        </strong>

                    </div>

                    <div
                        class="duo-vs"
                    >
                        VS
                    </div>

                    <div
                        class="duo-player p2"
                    >

                        <span>
                            PLAYER 2
                        </span>

                        <strong
                            id="duo-p2"
                        >
                            0
                        </strong>

                    </div>

                </div>

                <div
                    class="duo-field"
                    id="duo-field"
                >

                    <button
                        id="duo-target"
                        class="duo-object"
                        type="button"
                    >
                        ⭐
                    </button>

                </div>

                <div
                    class="duo-instruction"
                    id="duo-instruction"
                >
                    PLAYER 1 — KLIK TARGET!
                </div>

            </div>

        `;


        const field =
            $("duo-field");


        const target =
            $("duo-target");


        const phase =
            $("duo-phase");


        const instruction =
            $("duo-instruction");


        const p1Element =
            $("duo-p1");


        const p2Element =
            $("duo-p2");


        if (
            !field ||
            !target
        ) {

            finishGame(
                0,
                "Arena Duo tidak ditemukan."
            );

            return;

        }


        let p1 =
            0;


        let p2 =
            0;


        let currentPlayer =
            1;


        let roundStart =
            performance.now();


        const totalRounds =
            20;


        let rounds =
            0;


        function updateDuoUI() {

            if (p1Element) {

                p1Element.textContent =
                    p1;

            }


            if (p2Element) {

                p2Element.textContent =
                    p2;

            }


            if (phase) {

                phase.textContent =
                    currentPlayer === 1
                        ? "PLAYER 1 TURN"
                        : "PLAYER 2 TURN";

            }


            if (instruction) {

                instruction.textContent =
                    currentPlayer === 1
                        ? "PLAYER 1 — KLIK TARGET! 👆"
                        : "PLAYER 2 — KLIK TARGET! 👆";

            }

        }


        function moveTarget() {

            target.style.left =
                `${random(10, 90)}%`;


            target.style.top =
                `${random(12, 88)}%`;


            target.style.transform =
                "translate(-50%, -50%)";


            target.style.fontSize =
                `${randomInt(40, 62)}px`;


            roundStart =
                performance.now();

        }


        function handleTarget() {

            if (
                !STATE.gameRunning ||
                token !== STATE.gameToken
            ) {

                return;

            }


            const reaction =
                performance.now() -
                roundStart;


            const speedBonus =
                reaction < 450
                    ? 2
                    : reaction < 750
                        ? 1
                        : 0;


            if (
                currentPlayer === 1
            ) {

                p1++;

            } else {

                p2++;

            }


            addScore(
                1 + speedBonus
            );


            rounds++;


            createFloatingText(
                speedBonus > 0
                    ? `+${1 + speedBonus} 🔥`
                    : "+1",
                parseFloat(
                    target.style.left
                ),
                parseFloat(
                    target.style.top
                ),
                speedBonus > 0
                    ? "bonus-pop"
                    : "positive"
            );


            burstParticles(
                parseFloat(
                    target.style.left
                ),
                parseFloat(
                    target.style.top
                ),
                [
                    "⭐",
                    "✨",
                    "💫"
                ],
                6
            );


            playSFX(
                speedBonus > 0
                    ? "bonus"
                    : "hit",
                {
                    volume: 0.035,
                    duration: 0.08
                }
            );


            vibrate(10);


            currentPlayer =
                currentPlayer === 1
                    ? 2
                    : 1;


            updateDuoUI();

            moveTarget();


            if (
                rounds >=
                totalRounds
            ) {

                const winner =
                    p1 > p2
                        ? "PLAYER 1 🏆"
                        : p2 > p1
                            ? "PLAYER 2 🏆"
                            : "SERI 🤝";


                const winnerScore =
                    Math.max(
                        p1,
                        p2
                    );


                finishGame(
                    STATE.score,
                    `Pertandingan selesai! ${winner} — P1 ${p1} vs P2 ${p2}. 👥🔥`
                );

            }

        }


        target.addEventListener(
            "pointerdown",
            event => {

                event.preventDefault();

                handleTarget();

            },
            {
                passive: false
            }
        );


        updateDuoUI();

        moveTarget();


        updateGameHUD(
            0,
            "P1 VS P2"
        );


        startTimer(
            GAME_CONFIG.duo.time,
            token,
            () => {

                const winner =
                    p1 > p2
                        ? "Player 1"
                        : p2 > p1
                            ? "Player 2"
                            : "Seri";


                finishGame(
                    STATE.score,
                    `Waktu habis! ${winner} unggul — P1 ${p1} vs P2 ${p2}! 👥`
                );

            }
        );

    }


    /* =====================================================
       31. RETRY
       ===================================================== */

    function retryGame() {

        const gameId =
            STATE.currentGame;


        if (!gameId) {

            showScreen(
                "menu"
            );

            return;

        }


        playSFX(
            "click",
            {
                volume: 0.035
            }
        );


        selectGame(
            gameId
        );


        trackTimeout(
            () => {

                startCurrentGame();

            },
            120
        );

    }


    /* =====================================================
       32. MENU NAVIGATION
       ===================================================== */

    function goToMenu() {

        stopCurrentGame();


        updateMenu();


        showScreen(
            "menu"
        );

    }


    function goHome() {

        stopCurrentGame();


        STATE.currentGame =
            null;


        showScreen(
            "landing"
        );

    }


    /* =====================================================
       33. RESET SCORE
       ===================================================== */

    function resetScore() {

        if (
            !STATE.currentUser
        ) {

            toast(
                "Login dulu untuk reset progress."
            );

            return;

        }


        const confirmed =
            window.confirm(
                "Yakin mau reset semua skor dan progress?"
            );


        if (!confirmed) {

            return;

        }


        Object.keys(
            STATE.currentUser.scores
        ).forEach(
            gameId => {

                STATE.currentUser.scores[
                    gameId
                ] = 0;


                STATE.currentUser.bestScores[
                    gameId
                ] = 0;


                STATE.currentUser.completed[
                    gameId
                ] = false;

            }
        );


        STATE.currentUser.bonusClaimed =
            false;


        STATE.currentUser.stats = {

            totalPlays: 0,

            totalWins: 0,

            totalHits: 0,

            bestCombo: 0

        };


        saveCurrentUser();

        updateProgress();

        updateMenu();


        playSFX(
            "click",
            {
                volume: 0.04
            }
        );


        toast(
            "Semua progress berhasil direset 🔄"
        );

    }


    /* =====================================================
       34. COMPLETION BONUS
       ===================================================== */

    function checkCompletionBonus() {

        if (
            !STATE.currentUser
        ) {

            return;

        }


        const completed =
            Object.values(
                STATE.currentUser.completed
            ).every(Boolean);


        if (
            !completed
        ) {

            return;

        }


        if (
            STATE.currentUser.bonusClaimed
        ) {

            return;

        }


        clearTimeout(
            STATE.bonusTimer
        );


        STATE.bonusTimer =
            setTimeout(
                () => {

                    if (
                        !STATE.currentUser
                    ) {

                        return;

                    }


                    showScreen(
                        "bonus"
                    );


                    launchConfetti();


                    playSFX(
                        "bonus",
                        {
                            volume: 0.08,
                            duration: 0.45
                        }
                    );


                    vibrate(
                        [40, 50, 40, 50, 100]
                    );

                },
                1200
            );

    }


    function claimBonus() {

        if (
            !STATE.currentUser
        ) {

            toast(
                "Login dulu ya."
            );

            return;

        }


        const completed =
            Object.values(
                STATE.currentUser.completed
            ).every(Boolean);


        if (
            !completed
        ) {

            toast(
                "Selesaikan semua 6 game dulu! 🎮"
            );

            return;

        }


        if (
            STATE.currentUser.bonusClaimed
        ) {

            toast(
                "Hadiah ini sudah dibuka ☕✨"
            );

            showScreen(
                "menu"
            );

            return;

        }


        STATE.currentUser.bonusClaimed =
            true;


        saveCurrentUser();

        updateProgress();


        playSFX(
            "bonus",
            {
                volume: 0.08,
                duration: 0.55
            }
        );


        vibrate(
            [40, 50, 40, 50, 100]
        );


        launchConfetti();


        const bonusText =
            $("bonus-message");


        if (bonusText) {

            bonusText.textContent =
                "☕ Kopi digital berhasil dibuka! Wkwkwk. Jangan lupa minum beneran juga 😭✨";

        }


        toast(
            "☕ HADIAH TERBUKA! 🎉"
        );


        setTimeout(
            () => {

                showScreen(
                    "menu"
                );

            },
            1800
        );

    }


    /* =====================================================
       35. LANDING
       ===================================================== */

    function handleLandingStart() {

        resumeAudio();

        playMusic();


        playSFX(
            "click",
            {
                volume: 0.04
            }
        );


        if (
            STATE.currentUser
        ) {

            updateMenu();

            showScreen(
                "menu"
            );

        } else {

            showScreen(
                "account"
            );

        }

    }


    function handleAccountBack() {

        showScreen(
            "landing"
        );

    }


    /* =====================================================
       36. MENU
       ===================================================== */

    function updateMenu() {

        updateUserUI();

        updateProgress();


        const cards =
            $$(".game-card");


        cards.forEach(
            card => {

                const gameId =
                    card.dataset.game;


                const config =
                    GAME_CONFIG[
                        gameId
                    ];


                if (!config) return;


                const score =
                    STATE.currentUser
                        ? Number(
                            STATE.currentUser.scores[
                                gameId
                            ] || 0
                        )
                        : 0;


                const best =
                    STATE.currentUser
                        ? Number(
                            STATE.currentUser.bestScores[
                                gameId
                            ] || 0
                        )
                        : 0;


                const completed =
                    STATE.currentUser
                        ? Boolean(
                            STATE.currentUser.completed[
                                gameId
                            ]
                        )
                        : false;


                card.classList.toggle(
                    "completed",
                    completed
                );


                card.setAttribute(
                    "data-score",
                    String(score)
                );


                card.setAttribute(
                    "data-best",
                    String(best)
                );


                const badge =
                    card.querySelector(
                        ".game-status-badge"
                    );


                if (badge) {

                    badge.textContent =
                        completed
                            ? "✓ SELESAI"
                            : "PLAY";

                }

            }
        );

    }


    /* =====================================================
       37. EVENT BINDING
       ===================================================== */

    function bindEvents() {

        /* ---------------------------------------------
           LANDING
        --------------------------------------------- */

        const startButton =
            $("start-button");


        if (startButton) {

            startButton.addEventListener(
                "click",
                handleLandingStart
            );

        }


        /* ---------------------------------------------
           ACCOUNT BACK
        --------------------------------------------- */

        const accountBack =
            $("account-back-button");


        if (accountBack) {

            accountBack.addEventListener(
                "click",
                handleAccountBack
            );

        }


        /* ---------------------------------------------
           REGISTER
        --------------------------------------------- */

        const registerForm =
            $("register-form");


        if (registerForm) {

            registerForm.addEventListener(
                "submit",
                registerUser
            );

        }


        /* ---------------------------------------------
           LOGIN
        --------------------------------------------- */

        const loginForm =
            $("login-form");


        if (loginForm) {

            loginForm.addEventListener(
                "submit",
                loginUser
            );

        }


        /* ---------------------------------------------
           START GAME
        --------------------------------------------- */

        const startGameButton =
            $("start-game-button");


        if (startGameButton) {

            startGameButton.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopPropagation();


                    if (
                        STATE.gameRunning
                    ) {

                        return;

                    }


                    if (
                        !STATE.currentGame
                    ) {

                        toast(
                            "Pilih game terlebih dahulu 😭"
                        );

                        return;

                    }


                    resumeAudio();

                    playMusic();


                    playSFX(
                        "click",
                        {
                            volume: 0.045
                        }
                    );


                    startCurrentGame();

                }
            );

        }


        /* ---------------------------------------------
           RETRY
        --------------------------------------------- */

        const retryButton =
            $("retry-button");


        if (retryButton) {

            retryButton.addEventListener(
                "click",
                retryGame
            );

        }


        /* ---------------------------------------------
           RESULT → MENU
        --------------------------------------------- */

        const menuButton =
            $("menu-button");


        if (menuButton) {

            menuButton.addEventListener(
                "click",
                () => {

                    playSFX(
                        "click",
                        {
                            volume: 0.035
                        }
                    );


                    goToMenu();

                }
            );

        }


        /* ---------------------------------------------
           HOME
        --------------------------------------------- */

        const homeButton =
            $("home-button");


        if (homeButton) {

            homeButton.addEventListener(
                "click",
                () => {

                    playSFX(
                        "click",
                        {
                            volume: 0.035
                        }
                    );


                    goHome();

                }
            );

        }


        /* ---------------------------------------------
           BACK GAME
        --------------------------------------------- */

        const backButton =
            $("back-button");


        if (backButton) {

            backButton.addEventListener(
                "click",
                () => {

                    playSFX(
                        "click",
                        {
                            volume: 0.035
                        }
                    );


                    goToMenu();

                }
            );

        }


        /* ---------------------------------------------
           GAME CARDS
        --------------------------------------------- */

        $$(".game-card")
            .forEach(
                card => {

                    card.addEventListener(
                        "click",
                        event => {

                            event.preventDefault();


                            const gameId =
                                card.dataset.game;


                            if (
                                !GAME_CONFIG[
                                    gameId
                                ]
                            ) {

                                toast(
                                    "Game belum tersedia."
                                );

                                return;

                            }


                            playSFX(
                                "click",
                                {
                                    volume: 0.035
                                }
                            );


                            selectGame(
                                gameId
                            );

                        }
                    );

                }
            );


        /* ---------------------------------------------
           RESET
        --------------------------------------------- */

        const resetButton =
            $("reset-score-button");


        if (resetButton) {

            resetButton.addEventListener(
                "click",
                resetScore
            );

        }


        /* ---------------------------------------------
           BONUS
        --------------------------------------------- */

        const bonusButton =
            $("bonus-button");


        if (bonusButton) {

            bonusButton.addEventListener(
                "click",
                claimBonus
            );

        }


        /* ---------------------------------------------
           LOGOUT
        --------------------------------------------- */

        const logoutButton =
            $("logout-button");


        if (logoutButton) {

            logoutButton.addEventListener(
                "click",
                logoutUser
            );

        }


        /* ---------------------------------------------
           MUSIC
        --------------------------------------------- */

        const musicButton =
            $("music-button");


        if (musicButton) {

            musicButton.addEventListener(
                "click",
                event => {

                    event.preventDefault();

                    event.stopPropagation();


                    resumeAudio();

                    toggleMusic();

                }
            );

        }

    }


    /* =====================================================
       38. GLOBAL KEYBOARD
       ===================================================== */

    function bindGlobalKeyboard() {

        document.addEventListener(
            "keydown",
            event => {

                if (
                    event.key ===
                    "Escape" &&
                    STATE.gameRunning
                ) {

                    stopCurrentGame();

                    updateMenu();

                    showScreen(
                        "menu"
                    );


                    toast(
                        "Game dihentikan 👋"
                    );

                }

            }
        );

    }


    /* =====================================================
       39. VISIBILITY SAFETY
       ===================================================== */

    function bindVisibilitySafety() {

        document.addEventListener(
            "visibilitychange",
            () => {

                if (
                    document.hidden &&
                    STATE.gameRunning
                ) {

                    /*
                       Jangan langsung stop game.
                       Browser mobile sering berpindah
                       tab sebentar. Game tetap memakai
                       token system agar aman.
                    */

                }

            }
        );

    }


    /* =====================================================
       40. IMAGE / ASSET FALLBACK
       ===================================================== */

    function addGlobalAssetFallback() {

        document.addEventListener(
            "error",
            event => {

                const target =
                    event.target;


                if (
                    target instanceof
                    HTMLImageElement
                ) {

                    target.style.opacity =
                        "0";

                }

            },
            true
        );

    }


    /* =====================================================
       41. INITIALIZATION
       ===================================================== */

    function initialize() {

        if (
            STATE.initialized
        ) {

            return;

        }


        STATE.initialized =
            true;


        loadSettings();

        loadCurrentUser();


        if (
            STATE.currentUser
        ) {

            STATE.currentUser =
                normalizeUser(
                    STATE.currentUser
                );


            saveCurrentUser();

        }


        updateMusicButton();

        updateUserUI();

        updateProgress();

        updateMenu();


        bindEvents();

        bindGlobalKeyboard();

        bindVisibilitySafety();

        addGlobalAssetFallback();


        showScreen(
            "landing"
        );


        console.log(
            "🐱 Mia's Mini Arcade V2 berhasil dimuat."
        );

    }


    /* =====================================================
       42. BEFORE UNLOAD
       ===================================================== */

    window.addEventListener(
        "beforeunload",
        () => {

            stopCurrentGame();

        }
    );


    /* =====================================================
       43. DOM READY
       ===================================================== */

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            initialize,
            {
                once: true
            }
        );

    } else {

        initialize();

    }


})();