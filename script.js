document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const paperContainer = document.querySelector('.paper-container');
    const paper = document.getElementById('chromatography-paper');
    const startStopButton = document.getElementById('startStopButton');
    const solventPolaritySlider = document.getElementById('solventPolarity');
    const solventPolarityValue = document.getElementById('solventPolarityValue');
    const addSampleButton = document.getElementById('addSampleButton');
    const newSamplePolarityInput = document.getElementById('newSamplePolarity');
    const removeAllSamplesBtn = document.getElementById('removeAllSamples');
    const sampleLegendList = document.getElementById('sample-legend-list');
    const controls = [startStopButton, solventPolaritySlider, addSampleButton, newSamplePolarityInput, removeAllSamplesBtn];

    // --- Simulation State & Constants ---
    let samples = [];
    let nextSampleId = 0;
    const MAX_SAMPLES = 8;
    const SAMPLE_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f1c40f', '#e67e22', '#1abc9c', '#7f8c8d'];
    let isRunning = false;
    const PAPER_HEIGHT = 500;
    const ORIGIN_LINE_BOTTOM = 60;
    const MAX_TRAVEL_DISTANCE = PAPER_HEIGHT - ORIGIN_LINE_BOTTOM - 25;
    const VIRTUAL_SCALE_CM = 10.0;

    const updateSliderBackground = (slider) => {
        const percentage = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
        slider.style.background = `linear-gradient(to right, var(--accent-color) ${percentage}%, var(--primary-bg) ${percentage}%)`;
    };

    const createScale = () => {
        const scaleContainer = document.createElement('div');
        scaleContainer.className = 'scale';
        for (let cm = 0; cm <= VIRTUAL_SCALE_CM; cm++) {
            const positionPx = ORIGIN_LINE_BOTTOM + (cm / VIRTUAL_SCALE_CM) * MAX_TRAVEL_DISTANCE;
            const tick = document.createElement('div');
            tick.className = 'tick major';
            tick.style.bottom = `${positionPx}px`;
            const label = document.createElement('span');
            label.className = 'tick-label';
            label.textContent = cm;
            label.style.bottom = `${positionPx}px`;
            scaleContainer.appendChild(tick);
            scaleContainer.appendChild(label);
        }
        paperContainer.appendChild(scaleContainer);
    };

    const renderSpots = () => {
        paper.querySelectorAll('.sample-spot').forEach(spot => spot.remove());
        const spotSpacing = 80 / (Math.max(1, samples.length));
        const startPosition = 50 - (spotSpacing * (samples.length - 1)) / 2;
        samples.forEach((sample, index) => {
            const spot = document.createElement('div');
            spot.className = 'sample-spot';
            spot.id = `sample-${sample.id}`;
            spot.style.backgroundColor = sample.color;
            spot.style.left = `${startPosition + index * spotSpacing}%`;
            paper.appendChild(spot);
        });
    };

    const updateSampleLegend = (showDistance = false) => {
        sampleLegendList.innerHTML = '';
        if (samples.length === 0) {
            sampleLegendList.innerHTML = '<li>Nenhuma amostra adicionada.</li>';
            return;
        }
        const solventPolarityForCalc = parseInt(solventPolaritySlider.value);
        samples.forEach(sample => {
            const listItem = document.createElement('li');
            listItem.className = 'legend-item';
            const colorSwatch = document.createElement('span');
            colorSwatch.className = 'legend-color-swatch';
            colorSwatch.style.backgroundColor = sample.color;
            const textContainer = document.createElement('div');
            let baseText = `<b>Polaridade: ${sample.polarity}%</b>`;
            if (showDistance) {
                const distPx = calculateFinalDistance(sample.polarity, solventPolarityForCalc);
                const distCm = (distPx / MAX_TRAVEL_DISTANCE) * VIRTUAL_SCALE_CM;
                baseText += `<br><b>Distância: ${distCm.toFixed(2)} cm</b>`;
            }
            textContainer.innerHTML = baseText;
            listItem.appendChild(colorSwatch);
            listItem.appendChild(textContainer);
            sampleLegendList.appendChild(listItem);
        });
    };

    /**
     * LÓGICA DE CÁLCULO CORRIGIDA - Modelo de Competição de Fase Normal (Partição)
     * Na cromatografia em papel (fase normal), a fase estacionária é altamente polar (celulose/água).
     * - Amostras mais polares interagem fortemente com o papel e correm MENOS.
     * - Solventes mais polares têm maior força de eluição, competindo melhor com o papel e levando as amostras mais para CIMA.
     */
    const calculateFinalDistance = (samplePolarity, solventPolarity) => {
        const sampleP = samplePolarity / 100;
        const solventP = solventPolarity / 100;

        // Regra de Ouro: Amostra 100% apolar (0%) não interage com o papel polar,
        // viajando sempre junto à frente do solvente.
        if (samplePolarity === 0) {
            return 0.98 * MAX_TRAVEL_DISTANCE;
        }

        // Garante que a força do solvente seja no mínimo um valor muito pequeno para evitar divisões incorretas
        const s = Math.max(0.01, solventP);

        // Equação matemática de partição competitiva (Fator de Retenção Rf aproximado):
        // O solvente (s) atua eluindo a amostra para cima, enquanto a retenção da amostra (sampleP) 
        // atenuada pela presença de um solvente forte (1.0 - s) a retém na fase estacionária.
        // Adicionamos um fator de afinidade para aumentar a separação visual entre os pontos.
        const affinityFactor = 5.0;
        let travelRatio = s / (s + (sampleP * affinityFactor) * (1.0 - s));

        // Trava de segurança visual para o ponto ficar bem distribuído no papel
        travelRatio = Math.max(0.02, Math.min(0.98, travelRatio));

        return travelRatio * MAX_TRAVEL_DISTANCE;
    };

    const setControlsState = (state) => {
        if (state === 'running') {
            controls.forEach(control => control.disabled = true);
        } else if (state === 'finished') {
            controls.forEach(control => control.disabled = true);
            startStopButton.disabled = false;
        } else {
            controls.forEach(control => control.disabled = false);
        }
    };

    const startChromatography = () => {
        if (isRunning || samples.length === 0) return;
        isRunning = true;
        setControlsState('running');
        startStopButton.textContent = 'Executando...';
        const solventFront = document.createElement('div');
        solventFront.className = 'solvent-front';
        paper.appendChild(solventFront);
        void paper.offsetWidth;
        setTimeout(() => {
            const solventPolarity = parseInt(solventPolaritySlider.value);
            solventFront.style.bottom = `${ORIGIN_LINE_BOTTOM + MAX_TRAVEL_DISTANCE}px`;
            samples.forEach(sample => {
                const spotElement = document.getElementById(`sample-${sample.id}`);
                const travelDistance = calculateFinalDistance(sample.polarity, solventPolarity);
                spotElement.style.bottom = `${ORIGIN_LINE_BOTTOM + travelDistance}px`;
            });
        }, 100);
        setTimeout(() => {
            isRunning = false;
            startStopButton.textContent = 'Reiniciar Simulação';
            setControlsState('finished');
            updateSampleLegend(true);
        }, 6100);
    };

    const resetSimulation = () => {
        paper.querySelectorAll('.solvent-front').forEach(el => el.remove());
        paper.querySelectorAll('.sample-spot').forEach(spot => {
            spot.style.transition = 'bottom 0.5s ease';
            spot.style.bottom = `calc(var(--origin-line-bottom) - var(--spot-size) / 2)`;
        });
        setTimeout(() => {
            paper.querySelectorAll('.sample-spot').forEach(spot => {
                spot.style.transition = 'bottom 6s linear';
            });
        }, 500);
        startStopButton.textContent = 'Iniciar Cromatografia';
        isRunning = false;
        setControlsState('idle');
        updateSampleLegend(false);
    };

    const addSample = () => {
        if (samples.length >= MAX_SAMPLES) {
            alert(`Limite de ${MAX_SAMPLES} amostras atingido.`);
            return;
        }
        const polarity = parseInt(newSamplePolarityInput.value);
        if (isNaN(polarity) || polarity < 0 || polarity > 100) {
            alert("Por favor, insira uma polaridade válida entre 0 e 100.");
            return;
        }
        const newSample = {
            id: nextSampleId++,
            color: SAMPLE_COLORS[samples.length % SAMPLE_COLORS.length],
            polarity: polarity
        };
        samples.push(newSample);
        renderSpots();
        resetSimulation();
    };

    const removeAll = () => {
        samples = [];
        nextSampleId = 0;
        renderSpots();
        resetSimulation();
    };

    startStopButton.addEventListener('click', () => {
        if (startStopButton.textContent.includes('Reiniciar')) {
            resetSimulation();
        } else {
            startChromatography();
        }
    });
    solventPolaritySlider.addEventListener('input', (e) => {
        solventPolarityValue.textContent = e.target.value;
        updateSliderBackground(e.target);
    });
    addSampleButton.addEventListener('click', addSample);
    removeAllSamplesBtn.addEventListener('click', removeAll);

    const initialize = () => {
        createScale();
        // Amostras iniciais para demonstrar o comportamento cromatográfico real.
        samples = [
            { id: nextSampleId++, color: SAMPLE_COLORS[0], polarity: 0 },   // Totalmente apolar (Regra de ouro)
            { id: nextSampleId++, color: SAMPLE_COLORS[1], polarity: 20 },  // Baixa polaridade
            { id: nextSampleId++, color: SAMPLE_COLORS[2], polarity: 50 },  // Média polaridade
            { id: nextSampleId++, color: SAMPLE_COLORS[3], polarity: 100 }, // Alta polaridade
        ];
        renderSpots();
        updateSampleLegend();
        resetSimulation();
        updateSliderBackground(solventPolaritySlider);
    };
    initialize();
});
