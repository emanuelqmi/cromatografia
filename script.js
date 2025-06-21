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
        const APOLAR_ZONE_THRESHOLD = 30;

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
         * LÓGICA DE CÁLCULO FINAL E COMPLETA - Modelo de 3 Zonas
         */
        const calculateFinalDistance = (samplePolarity, solventPolarity) => {
            const sampleP = samplePolarity / 100;
            const solventP = solventPolarity / 100;
            let travelRatio = 0.0;

            // ZONA 1: Amostra perfeitamente apolar (Regra de Ouro)
            if (samplePolarity === 0) {
                travelRatio = 1.0;

            // ZONA 2: Amostra "quase apolar" (1% a 30%) - Aderência ao papel domina
            } else if (samplePolarity <= APOLAR_ZONE_THRESHOLD) {
                travelRatio = 1.0 - sampleP;

            // ZONA 3: Amostra polar (> 30%) - Lógica CORRIGIDA de "Força de Eluição"
            } else {
                // A potência do solvente agora tem um valor base para nunca ser zero.
                const solventPower = 0.05 + (solventP * 0.95);
                
                // A afinidade ("engate") é máxima quando as polaridades são iguais.
                const affinity = 1.0 - Math.abs(solventP - sampleP);
                
                // A "Força de Eluição" final que determina o deslocamento.
                travelRatio = solventPower * affinity;
            }
            
            // Trava de segurança final para evitar qualquer ultrapassagem visual.
            travelRatio = Math.max(0, Math.min(0.995, travelRatio));
            
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
            // Amostras iniciais para demonstrar a lógica de 3 zonas.
            samples = [
                { id: nextSampleId++, color: SAMPLE_COLORS[0], polarity: 0 },   // Zona 1: Teste da regra de ouro.
                { id: nextSampleId++, color: SAMPLE_COLORS[1], polarity: 20 },  // Zona 2: Teste da aderência.
                { id: nextSampleId++, color: SAMPLE_COLORS[2], polarity: 50 },  // Zona 3: Teste do caso 50/100 -> 5cm e 50/0 -> >0cm
                { id: nextSampleId++, color: SAMPLE_COLORS[3], polarity: 100 }, // Zona 3: Teste do caso 100/100 -> 10cm.
            ];
            renderSpots();
            updateSampleLegend();
            resetSimulation();
            updateSliderBackground(solventPolaritySlider);
        };
        initialize();
    });

