    // JAVASCRIPT
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

        // --- Simulation State ---
        let samples = [];
        let nextSampleId = 0;
        const MAX_SAMPLES = 8;
        const SAMPLE_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#9b59b6', '#f1c40f', '#e67e22', '#1abc9c', '#7f8c8d'];
        let isRunning = false;

        // --- Constants ---
        const PAPER_HEIGHT = 500;
        const ORIGIN_LINE_BOTTOM = 60;
        const MAX_TRAVEL_DISTANCE = PAPER_HEIGHT - ORIGIN_LINE_BOTTOM - 25;
        const VIRTUAL_SCALE_CM = 7.0;
        const APOLAR_THRESHOLD = 40;

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
                spot.dataset.polarity = sample.polarity;
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
                let baseText = `<b>Polaridade: ${sample.polarity}%</b> (${sample.polarity < APOLAR_THRESHOLD ? 'Apolar' : 'Polar'})`;

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

        const calculateFinalDistance = (samplePolarity, solventPolarity) => {
            let travelRatio = 0.0;
            if (samplePolarity < APOLAR_THRESHOLD) {
                let baseRatio = 0.90;
                let solventDragFactor = (solventPolarity / 100) * 0.20;
                travelRatio = baseRatio - solventDragFactor;
            } else {
                const polarityDifference = Math.abs(solventPolarity - samplePolarity);
                if (solventPolarity > 60 && polarityDifference <= 10) {
                    travelRatio = 0.95;
                } else {
                    const attractionToPaper = samplePolarity / 100;
                    const attractionToSolvent = 1.0 - Math.abs((solventPolarity / 100) - (samplePolarity / 100));
                    travelRatio = attractionToSolvent / (attractionToSolvent + attractionToPaper + 0.01);
                }
            }
            travelRatio = Math.max(0, Math.min(1, travelRatio));
            return travelRatio * MAX_TRAVEL_DISTANCE;
        };

        /**
         * FUNÇÃO ATUALIZADA: Gerencia o estado dos controles da UI.
         * @param {'idle' | 'running' | 'finished'} state - O estado atual da simulação.
         */
        const setControlsState = (state) => {
            if (state === 'running') {
                // Desabilita TODOS os controles enquanto a simulação está em execução.
                controls.forEach(control => control.disabled = true);
            } else if (state === 'finished') {
                // Desabilita todos, EXCETO o botão principal (que agora é "Reiniciar").
                controls.forEach(control => control.disabled = true);
                startStopButton.disabled = false;
            } else { // 'idle' state
                // Habilita TODOS os controles.
                controls.forEach(control => control.disabled = false);
            }
        };
        
        const startChromatography = () => {
            if (isRunning || samples.length === 0) return;
            isRunning = true;
            setControlsState('running'); // <-- MUDANÇA AQUI
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
                setControlsState('finished'); // <-- MUDANÇA AQUI
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
                    spot.style.transition = 'bottom 6s ease-in-out';
                });
            }, 500);

            startStopButton.textContent = 'Iniciar Cromatografia';
            isRunning = false;
            setControlsState('idle'); // <-- MUDANÇA AQUI
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
            // A chamada para resetSimulation() já cuida de reabilitar os controles.
            resetSimulation();
        };
        
        const removeAll = () => {
            samples = [];
            nextSampleId = 0;
            renderSpots();
            // A chamada para resetSimulation() já cuida de reabilitar os controles.
            resetSimulation();
        };

        // Event Listeners (sem alterações)
        startStopButton.addEventListener('click', () => {
            if (startStopButton.textContent.includes('Reiniciar')) {
                resetSimulation();
            } else {
                startChromatography();
            }
        });
        solventPolaritySlider.addEventListener('input', (e) => {
            solventPolarityValue.textContent = e.target.value;
        });
        addSampleButton.addEventListener('click', addSample);
        removeAllSamplesBtn.addEventListener('click', removeAll);

        const initialize = () => {
            createScale();
            samples = [
                { id: nextSampleId++, color: SAMPLE_COLORS[0], polarity: 90 },
                { id: nextSampleId++, color: SAMPLE_COLORS[1], polarity: 65 },
                { id: nextSampleId++, color: SAMPLE_COLORS[2], polarity: 15 },
            ];
            renderSpots();
            updateSampleLegend();
            resetSimulation();
        };
        initialize();
    });
