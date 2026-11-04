document.addEventListener('DOMContentLoaded', () => {
    const ACCESS_PIN = '0509'; // PIN de 4 dígitos configurado
    const MAX_PIN_ATTEMPTS = 5;
    const LOCKOUT_DURATION = 5 * 60 * 1000;
    const LOCKOUT_STORAGE_KEY = 'isis-pin-lockout';
    const accessForm = document.getElementById('access-form');
    const accessInput = document.getElementById('access-pin');
    const accessSubmit = document.getElementById('access-submit');
    const accessStatus = document.getElementById('access-status');
    const accessConfigNotice = document.getElementById('access-config-notice');
    const accessScreen = document.getElementById('access-screen');
    const protectedContent = document.getElementById('protected-content');
    const isPinConfigured = /^\d{4}$/.test(ACCESS_PIN);
    let lockoutTimer;
    let attemptState = { attempts: 0, lockedUntil: 0 };
    let lockoutStorageAvailable = true;

    if (!isPinConfigured) {
        accessInput.disabled = true;
        accessSubmit.disabled = true;
        accessStatus.textContent = 'Configure primeiro seu PIN de 4 dígitos em isis.js.';
    } else {
        accessConfigNotice.hidden = true;
    }

    try {
        const savedAttemptState = JSON.parse(localStorage.getItem(LOCKOUT_STORAGE_KEY) || 'null');
        if (
            savedAttemptState &&
            Number.isInteger(savedAttemptState.attempts) &&
            savedAttemptState.attempts >= 0 &&
            Number.isFinite(savedAttemptState.lockedUntil)
        ) {
            attemptState = savedAttemptState;
        } else {
            localStorage.removeItem(LOCKOUT_STORAGE_KEY);
        }
    } catch (error) {
        lockoutStorageAvailable = false;
        accessInput.disabled = true;
        accessSubmit.disabled = true;
        accessStatus.textContent = 'Não foi possível ativar o limite de tentativas. Habilite o armazenamento local do navegador.';
    }

    function updateAccessLockout() {
        const secondsRemaining = Math.ceil((attemptState.lockedUntil - Date.now()) / 1000);
        if (secondsRemaining > 0) {
            accessInput.disabled = true;
            accessSubmit.disabled = true;
            accessStatus.textContent = `Muitas tentativas. Tente novamente em ${secondsRemaining} s.`;
            clearTimeout(lockoutTimer);
            lockoutTimer = setTimeout(updateAccessLockout, 1000);
            return;
        }

        if (attemptState.lockedUntil) {
            attemptState = { attempts: 0, lockedUntil: 0 };
            try {
                localStorage.removeItem(LOCKOUT_STORAGE_KEY);
            } catch (error) {
                lockoutStorageAvailable = false;
                accessStatus.textContent = 'Não foi possível manter o limite de tentativas. Habilite o armazenamento local do navegador.';
            }
        }

        if (isPinConfigured && lockoutStorageAvailable) {
            accessInput.disabled = false;
            accessSubmit.disabled = false;
            accessStatus.textContent = '';
        }
    }

    updateAccessLockout();
    if (isPinConfigured && lockoutStorageAvailable) {
        accessInput.focus();
    }

    accessInput.addEventListener('input', () => {
        accessInput.value = accessInput.value.replace(/\D/g, '').slice(0, 4);
    });

    accessForm.addEventListener('submit', (event) => {
        event.preventDefault();
        if (!isPinConfigured || !lockoutStorageAvailable || accessInput.disabled) {
            return;
        }

        if (accessInput.value === ACCESS_PIN) {
            try {
                localStorage.removeItem(LOCKOUT_STORAGE_KEY);
            } catch (error) {
                accessStatus.textContent = 'Não foi possível confirmar a proteção. Habilite o armazenamento local do navegador.';
                return;
            }

            accessScreen.hidden = true;
            protectedContent.hidden = false;
            document.body.classList.remove('access-locked');
            return;
        }

        attemptState.attempts += 1;
        if (attemptState.attempts >= MAX_PIN_ATTEMPTS) {
            attemptState.lockedUntil = Date.now() + LOCKOUT_DURATION;
        }

        try {
            localStorage.setItem(LOCKOUT_STORAGE_KEY, JSON.stringify(attemptState));
        } catch (error) {
            lockoutStorageAvailable = false;
            accessInput.disabled = true;
            accessSubmit.disabled = true;
            accessStatus.textContent = 'Não foi possível registrar a tentativa. Habilite o armazenamento local do navegador.';
            return;
        }

        accessInput.value = '';
        if (attemptState.lockedUntil) {
            updateAccessLockout();
        } else {
            const attemptsRemaining = MAX_PIN_ATTEMPTS - attemptState.attempts;
            accessStatus.textContent = `PIN incorreto. Restam ${attemptsRemaining} tentativas.`;
            accessInput.focus();
        }
    });

    // Inicializar Ícones do Lucide
    lucide.createIcons();

    const themeToggle = document.getElementById('theme-toggle');
    const savedTheme = localStorage.getItem('theme');
    const initialTheme = savedTheme === 'light' ? 'light' : 'dark';

    function applyTheme(theme) {
        document.body.dataset.theme = theme;
        const isDark = theme === 'dark';
        themeToggle.setAttribute('aria-pressed', String(isDark));
        themeToggle.setAttribute('aria-label', `Ativar modo ${isDark ? 'claro' : 'escuro'}`);
        themeToggle.setAttribute('title', `Ativar modo ${isDark ? 'claro' : 'escuro'}`);
        themeToggle.querySelector('[data-lucide]').setAttribute('data-lucide', isDark ? 'sun' : 'moon');
        lucide.createIcons();
    }

    applyTheme(initialTheme);

    themeToggle.addEventListener('click', () => {
        const nextTheme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', nextTheme);
        applyTheme(nextTheme);
    });

    /* ==========================================
       LISTA DE MÚSICAS E MENSAGENS
       ========================================== */
    const playlist = [
        {
            title: "Dengo",
            artist: "ANAVITÓRIA",
            src: "Musicas/ANAVITÓRIA - Dengo.mp3",
            quote: "Amo ser seu dengo, e você é meu dengo também."
        },
        {
            title: "Espetáculo estranho",
            artist: "ANAVITÓRIA",
            src: "Musicas/ANAVITÓRIA - Espetáculo estranho.mp3",
            quote: "Algum dia vamos morar juntas e ser o espetáculo mais lindo do mundo."
        },
        {
            title: "Porque Eu Te Amo",
            artist: "ANAVITÓRIA",
            src: "Musicas/ANAVITÓRIA - Porque Eu Te Amo.mp3",
            quote: "Não preciso de muitos motivos para explicar... amo você por inteiro."
        },
        {
            title: "Singular",
            artist: "ANAVITÓRIA",
            src: "Musicas/ANAVITÓRIA - Singular.mp3",
            quote: "Você é única e perfeita do seu próprio jeito singular."
        },
        {
            title: "Cor De Marte",
            artist: "ANAVITÓRIA",
            src: "Musicas/Cor De Marte - ANAVITÓRIA.mp3",
            quote: "Me prova, me enxerga, me sinta, me cheira e se deixa em mim..."
        }, 
        {
            title: "Namora Comigo",
            artist: "Mart'nália",
            src: "Musicas/Namora Comigo - Mart’nália.mp3",
            quote: "Fica comigo. Namora comigo. Casa comigo. Viva comigo até o fim..."
        },
        {
            title: "VELUDO MARROM",
            artist: "Liniker",
            src: "Musicas/Liniker - VELUDO MARROMr.mp3",
            quote: "Enquanto você dorme, eu cheiro você pra guardar na memória o tom do meu veludo cor marrom"
        }
    ];

    let currentTrackIndex = 0;
    let isPlaying = false;

    // Elementos do DOM
    const audio = document.getElementById('audio-player');
    const playBtn = document.getElementById('play-pause-btn');
    const playIcon = document.getElementById('play-icon');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const vinyl = document.querySelector('.vinyl-record');

    const songTitle = document.getElementById('song-title');
    const songArtist = document.getElementById('song-artist');
    const songQuote = document.getElementById('song-quote');

    const progressBar = document.getElementById('progress-bar');
    const currentTimeEl = document.getElementById('current-time');
    const durationEl = document.getElementById('duration');

    /* ==========================================
       FUNÇÕES DO PLAYER
       ========================================== */
    function loadTrack(index) {
        const track = playlist[index];
        audio.src = track.src;
        songTitle.textContent = track.title;
        songArtist.textContent = track.artist;
        songQuote.textContent = track.quote;
        
        progressBar.value = 0;
        currentTimeEl.textContent = "0:00";
        durationEl.textContent = "0:00";
    }

    function playTrack() {
        isPlaying = true;
        audio.play();
        vinyl.classList.add('playing');
        playIcon.setAttribute('data-lucide', 'pause');
        lucide.createIcons();
    }

    function pauseTrack() {
        isPlaying = false;
        audio.pause();
        vinyl.classList.remove('playing');
        playIcon.setAttribute('data-lucide', 'play');
        lucide.createIcons();
    }

    // Carregar primeira faixa ao iniciar
    loadTrack(currentTrackIndex);

    // Play / Pause Toggle
    if (playBtn) {
        playBtn.addEventListener('click', () => {
            if (isPlaying) {
                pauseTrack();
            } else {
                playTrack();
            }
        });
    }

    // Próxima Música
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
            loadTrack(currentTrackIndex);
            if (isPlaying) playTrack();
        });
    }

    // Música Anterior
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            currentTrackIndex = (currentTrackIndex - 1 + playlist.length) % playlist.length;
            loadTrack(currentTrackIndex);
            if (isPlaying) playTrack();
        });
    }

    // Passar para a próxima música automaticamente quando a atual terminar
    audio.addEventListener('ended', () => {
        currentTrackIndex = (currentTrackIndex + 1) % playlist.length;
        loadTrack(currentTrackIndex);
        playTrack();
    });

    // Atualizar Barra de Progresso e Tempo
    audio.addEventListener('timeupdate', () => {
        if (audio.duration) {
            const progressPercent = (audio.currentTime / audio.duration) * 100;
            progressBar.value = progressPercent;

            // Formatar tempo decorrido
            const currentMinutes = Math.floor(audio.currentTime / 60);
            const currentSeconds = Math.floor(audio.currentTime % 60);
            currentTimeEl.textContent = `${currentMinutes}:${currentSeconds < 10 ? '0' : ''}${currentSeconds}`;

            // Formatar duração total
            const durationMinutes = Math.floor(audio.duration / 60);
            const durationSeconds = Math.floor(audio.duration % 60);
            durationEl.textContent = `${durationMinutes}:${durationSeconds < 10 ? '0' : ''}${durationSeconds}`;
        }
    });

    // Mudar posição da música ao arrastar a barra de progresso
    progressBar.addEventListener('input', () => {
        if (audio.duration) {
            const seekTime = (progressBar.value / 100) * audio.duration;
            audio.currentTime = seekTime;
        }
    });

    /* ==========================================
       INTERAÇÃO DOS ENVELOPES (MODAL DE CARTINHA)
       ========================================== */
    const envelopeItems = document.querySelectorAll('.envelope-item');
    const envelopeModal = document.getElementById('envelope-modal');
    const envelopeQuoteText = document.getElementById('envelope-quote-text');
    const closeEnvelopeModal = document.querySelector('.close-envelope');

    envelopeItems.item = envelopeItems; // auxiliar
    envelopeItems.forEach(item => {
        item.addEventListener('click', () => {
            const message = item.getAttribute('data-message');
            if (message && envelopeQuoteText && envelopeModal) {
                envelopeQuoteText.textContent = message;
                envelopeModal.classList.remove('hidden');
            }
        });
    });

    if (closeEnvelopeModal && envelopeModal) {
        closeEnvelopeModal.addEventListener('click', () => {
            envelopeModal.classList.add('hidden');
        });

        // Fechar clicando fora da cartinha
        window.addEventListener('click', (e) => {
            if (e.target === envelopeModal) {
                envelopeModal.classList.add('hidden');
            }
        });
    }

    /* ==========================================
       MODAL DAS ESTRELAS
       ========================================== */
    const stars = document.querySelectorAll('.sky-star');
    const modal = document.getElementById('star-modal');
    const modalTitle = document.getElementById('star-modal-title');
    const modalText = document.getElementById('star-quote-text');
    const closeModal = document.querySelector('.close-modal');

    stars.forEach(star => {
        star.addEventListener('click', () => {
            const title = star.getAttribute('data-title');
            const quote = star.getAttribute('data-quote');
            if (title && quote && modalTitle && modalText && modal) {
                modalTitle.textContent = title;
                modalText.textContent = quote;
                modal.classList.remove('hidden');
            }
        });
    });

    if (closeModal && modal) {
        closeModal.addEventListener('click', () => {
            modal.classList.add('hidden');
        });

        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.add('hidden');
            }
        });
    }
});

/* ==========================================
       LINHA DO TEMPO INTERATIVA (NOSSA HISTÓRIA)
       ========================================== */
    const storyData = [
        {
            title: "Antes de você",
            desc: "Eu era só eu. E tudo ainda parecia muito vazio.",
            image: "Imagens/primeirodate.png"
        },
        {
            title: "Quando você apareceu",
            desc: "Era pra ser momentâneo, eu achei que não iria gostar tanto de alguém que me mandava emojis de animais extintos ou algo assim... Parece que eu me enganei.",
            image: "Imagens/onibus.png"
        },
        {
            title: "Quando percebi",
            desc: "Eu já te amava, e nem tinha percebido. Só procurava coragem pra te dizer.",
            image: "Imagens/nupcias.png"
        },
        {
            title: "Agora",
            desc: "E aqui estamos. E ainda é só o começo.",
            image: "Imagens/felicidade.png"
        }
    ];

    let currentStoryIndex = 0;
    const timelineSteps = document.querySelectorAll('.timeline-step');
    const storyImg = document.getElementById('story-img');
    const storyTitle = document.getElementById('story-title');
    const storyDesc = document.getElementById('story-desc');
    const storyStepNumber = document.getElementById('story-step-number');
    const storyPrevBtn = document.getElementById('story-prev-btn');
    const storyNextBtn = document.getElementById('story-next-btn');

    function updateStory(index) {
        currentStoryIndex = index;
        const data = storyData[index];

        // Atualiza a imagem, título, descrição e contador
        if (storyImg) {
            storyImg.src = data.image;
            
            // Se for a imagem da felicidade, aplica a rotação de 90 graus
            if (data.image.includes('felicidade.png')) {
                storyImg.classList.add('rotate-img');
            } else {
                storyImg.classList.remove('rotate-img');
            }
        }

        if (storyTitle) storyTitle.textContent = data.title;
        if (storyDesc) storyDesc.textContent = data.desc;
        if (storyStepNumber) storyStepNumber.textContent = `Momento ${index + 1} de ${storyData.length}`;

        // Atualiza qual card da lista lateral fica com destaque
        timelineSteps.forEach((step, i) => {
            if (i === index) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });

        if (storyPrevBtn) storyPrevBtn.disabled = index === 0;
        if (storyNextBtn) storyNextBtn.disabled = index === storyData.length - 1;
    }

    // Botão Próximo
    if (storyNextBtn) {
        storyNextBtn.addEventListener('click', (e) => {
            e.preventDefault();
            currentStoryIndex = Math.min(currentStoryIndex + 1, storyData.length - 1);
            updateStory(currentStoryIndex);
        });
    }

    // Botão Anterior
    if (storyPrevBtn) {
        storyPrevBtn.addEventListener('click', (e) => {
            e.preventDefault();
            currentStoryIndex = Math.max(currentStoryIndex - 1, 0);
            updateStory(currentStoryIndex);
        });
    }

    updateStory(currentStoryIndex);

    /* ==========================================
       CARROSSEL INFINITO DE FUNDO (SEÇÃO FINAL)
       ========================================== */
    const slides = document.querySelectorAll('.bg-slideshow .slide');
    let currentSlideIndex = 0;

    if (slides.length > 0) {
        setInterval(() => {
            // Remove a classe active da foto atual
            slides[currentSlideIndex].classList.remove('active');

            currentSlideIndex = (currentSlideIndex + 1) % slides.length;

            // Adiciona a classe active na nova foto
            slides[currentSlideIndex].classList.add('active');
        }, 4000); // 4000ms = troca de foto a cada 4 segundos
    }