(function createHelloKittySurprise() {
    // 1. Inject Theme Styles
    const style = document.createElement('style');
    style.textContent = `
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@700;800&display=swap');

        #hk-game-modal * {
            box-sizing: border-box;
            font-family: 'Nunito', sans-serif;
            user-select: none;
        }

        #hk-game-modal {
            position: fixed;
            top: 0; left: 0; width: 100vw; height: 100vh;
            background: rgba(255, 240, 245, 0.95);
            display: flex; justify-content: center; align-items: center;
            z-index: 999999;
        }

        .hk-card {
            background: #ffffff;
            border: 6px solid #ff75a0;
            border-radius: 35px;
            padding: 25px;
            width: 90%; max-width: 550px;
            box-shadow: 0 15px 35px rgba(255, 117, 160, 0.3);
            text-align: center;
            position: relative;
        }

        .hk-title {
            font-family: 'Fredoka One', cursive;
            color: #ff407d;
            font-size: 2rem;
            margin-bottom: 10px;
        }

        .hk-scoreboard {
            display: flex; justify-content: space-between;
            background: #fff0f5;
            border: 2px dashed #ff75a0;
            border-radius: 18px;
            padding: 8px 20px;
            font-family: 'Fredoka One', cursive;
            color: #ff407d;
            font-size: 1.1rem;
            margin-bottom: 15px;
        }

        .hk-canvas-box {
            position: relative;
            width: 100%; height: 320px;
            background: linear-gradient(to bottom, #ffe3ec, #ffffff);
            border-radius: 20px;
            border: 3px solid #ffb6c1;
            overflow: hidden;
        }

        canvas { width: 100%; height: 100%; display: block; cursor: pointer; }

        .hk-btn {
            background: linear-gradient(135deg, #ff75a0, #ff407d);
            color: white; border: none;
            border-radius: 25px; padding: 12px 30px;
            font-family: 'Fredoka One', cursive; font-size: 1.1rem;
            cursor: pointer; box-shadow: 0 5px 15px rgba(255, 64, 125, 0.3);
            transition: transform 0.2s; margin-top: 15px;
        }

        .hk-btn:hover { transform: scale(1.05); }

        .hk-overlay {
            position: absolute; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(255, 255, 255, 0.95);
            display: flex; flex-direction: column;
            justify-content: center; align-items: center;
            padding: 20px; border-radius: 18px;
        }

        .hk-hidden { display: none !important; }

        .hk-message {
            background: #fff0f5; border: 3px dashed #ff75a0;
            border-radius: 20px; padding: 15px; margin: 10px 0;
            font-size: 1.1rem; font-weight: 800; color: #5c434d;
            line-height: 1.5;
        }

        .hk-particle {
            position: fixed; pointer-events: none; font-size: 2rem; z-index: 1000000;
            animation: hk-burst 1.5s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
        }

        @keyframes hk-burst {
            0% { transform: translate(0, 0) scale(0.5); opacity: 1; }
            100% { transform: translate(var(--dx), var(--dy)) scale(1.4); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // 2. Build DOM Elements Programmatically
    const modal = document.createElement('div');
    modal.id = 'hk-game-modal';
    modal.innerHTML = `
        <div class="hk-card">
            <div class="hk-title">Hello Kitty Catcher 💕</div>
            <div class="hk-scoreboard">
                <div>Score: <span id="hk-score">0</span> / 10</div>
                <div>Time: <span id="hk-time">30</span>s</div>
            </div>
            <div class="hk-canvas-box">
                <canvas id="hkCanvas"></canvas>
                
                <div id="hkStart" class="hk-overlay">
                    <h2 style="font-family:'Fredoka One'; color:#ff407d;">A Surprise For You! ✨</h2>
                    <p style="font-weight:800; color:#5c434d; margin: 10px 0;">Catch 10 treats to unlock your special message!</p>
                    <button class="hk-btn" id="hkStartBtn">START GAME 🎀</button>
                </div>

                <div id="hkSurprise" class="hk-overlay hk-hidden">
                    <h2 style="font-family:'Fredoka One'; color:#ff2a5f;">🎉 YOU WIN, MY QUEEN! 🎉</h2>
                    <div class="hk-message">
                        "To my amazing wife: You fill my life with joy and sweet moments every single day. I love you endlessly! 💕👑✨"
                    </div>
                    <button class="hk-btn" id="hkRestartBtn">PLAY AGAIN 💖</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    // 3. Audio Synth Engine
    let audioCtx = null;
    function playTone(freq) {
        try {
            if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            if (audioCtx.state === 'suspended') audioCtx.resume();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(freq * 1.5, audioCtx.currentTime + 0.1);
            gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
            osc.connect(gain); gain.connect(audioCtx.destination);
            osc.start(); osc.stop(audioCtx.currentTime + 0.1);
        } catch(e) {}
    }

    // 4. Game Logic & Physics Engine
    const canvas = document.getElementById('hkCanvas');
    const ctx = canvas.getContext('2d');
    
    let score = 0, timeLeft = 30, gameActive = false, timer = null, animFrame = null;
    let items = [];
    const basket = { x: 0, y: 0, w: 70, h: 45 };
    const icons = ['💖', '🍓', '🎀', '🍰', '✨'];

    function resize() {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        basket.y = canvas.height - 55;
    }
    resize();

    function updateBasket(clientX) {
        const rect = canvas.getBoundingClientRect();
        basket.x = clientX - rect.left - basket.w / 2;
        if (basket.x < 0) basket.x = 0;
        if (basket.x + basket.w > canvas.width) basket.x = canvas.width - basket.w;
    }

    canvas.addEventListener('mousemove', e => gameActive && updateBasket(e.clientX));
    canvas.addEventListener('touchmove', e => {
        if (gameActive && e.touches[0]) {
            e.preventDefault();
            updateBasket(e.touches[0].clientX);
        }
    }, { passive: false });

    function loop() {
        if (!gameActive) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Spawn items
        if (Math.random() < 0.04) {
            items.push({
                x: Math.random() * (canvas.width - 30) + 15,
                y: -20,
                speed: 2 + Math.random() * 3,
                icon: icons[Math.floor(Math.random() * icons.length)]
            });
        }

        // Draw Basket
        ctx.fillStyle = '#ff75a0';
        ctx.beginPath();
        ctx.roundRect(basket.x, basket.y, basket.w, basket.h, 15);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 12px Nunito';
        ctx.textAlign = 'center';
        ctx.fillText('CATCH!', basket.x + basket.w / 2, basket.y + 28);

        // Render & Move Items
        for (let i = items.length - 1; i >= 0; i--) {
            let item = items[i];
            item.y += item.speed;

            ctx.font = '24px serif';
            ctx.textAlign = 'center';
            ctx.fillText(item.icon, item.x, item.y);

            // Collision Check
            if (item.y >= basket.y && item.y <= basket.y + basket.h && item.x >= basket.x && item.x <= basket.x + basket.w) {
                playTone(600 + score * 50);
                score++;
                document.getElementById('hk-score').innerText = score;
                items.splice(i, 1);

                if (score >= 10) triggerWin();
            } else if (item.y > canvas.height + 30) {
                items.splice(i, 1);
            }
        }

        animFrame = requestAnimationFrame(loop);
    }

    function runGame() {
        score = 0; timeLeft = 30; items = []; gameActive = true;
        document.getElementById('hk-score').innerText = score;
        document.getElementById('hk-time').innerText = timeLeft;
        document.getElementById('hkStart').classList.add('hk-hidden');
        document.getElementById('hkSurprise').classList.add('hk-hidden');
        
        basket.x = canvas.width / 2 - basket.w / 2;

        clearInterval(timer);
        cancelAnimationFrame(animFrame);

        timer = setInterval(() => {
            timeLeft--;
            document.getElementById('hk-time').innerText = timeLeft;
            if (timeLeft <= 0) {
                clearInterval(timer);
                gameActive = false;
                alert('Time is up! Let\'s try again!');
                document.getElementById('hkStart').classList.remove('hk-hidden');
            }
        }, 1000);

        loop();
    }

    function triggerWin() {
        gameActive = false;
        clearInterval(timer);
        cancelAnimationFrame(animFrame);
        
        document.getElementById('hkSurprise').classList.remove('hk-hidden');
        playTone(900);

        // Burst Effects
        for (let i = 0; i < 25; i++) {
            const p = document.createElement('div');
            p.className = 'hk-particle';
            p.innerText = icons[Math.floor(Math.random() * icons.length)];
            p.style.left = '50vw'; p.style.top = '50vh';
            
            const angle = Math.random() * Math.PI * 2;
            const dist = 100 + Math.random() * 150;
            p.style.setProperty('--dx', Math.cos(angle) * dist + 'px');
            p.style.setProperty('--dy', Math.sin(angle) * dist + 'px');
            
            document.body.appendChild(p);
            setTimeout(() => p.remove(), 1500);
        }
    }

    document.getElementById('hkStartBtn').addEventListener('click', runGame);
    document.getElementById('hkRestartBtn').addEventListener('click', runGame);
})();
