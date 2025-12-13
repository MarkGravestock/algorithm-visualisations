// Main application logic and UI coordination

class AlgorithmVisualizerApp {
    constructor() {
        this.currentGraph = null;
        this.currentAlgorithm = null;
        this.algorithmSteps = [];
        this.foundPaths = [];

        this.initializeUI();
        this.initializeVisualizer();
        this.initializeAnimation();
        this.attachEventListeners();
        this.loadInitialExample();
    }

    initializeUI() {
        this.elements = {
            algorithmSelect: document.getElementById('algorithm-select'),
            exampleSelect: document.getElementById('example-select'),
            speedSelect: document.getElementById('speed-select'),
            startBtn: document.getElementById('start-btn'),
            pauseBtn: document.getElementById('pause-btn'),
            resetBtn: document.getElementById('reset-btn'),
            stepBtn: document.getElementById('step-btn'),
            algorithmDescription: document.getElementById('algorithm-description'),
            nodesVisited: document.getElementById('nodes-visited'),
            currentPath: document.getElementById('current-path'),
            pathsFound: document.getElementById('paths-found'),
            pathsContent: document.getElementById('paths-content'),
            stepDescription: document.getElementById('step-description'),
            graphSvg: document.getElementById('graph-svg')
        };
    }

    initializeVisualizer() {
        this.visualizer = new GraphVisualizer(this.elements.graphSvg);
    }

    initializeAnimation() {
        this.animator = new AnimationController(this.visualizer);

        this.animator.onStepChange = (step, stepIndex) => {
            this.updateStepInfo(step, stepIndex);
        };

        this.animator.onComplete = () => {
            this.onAnimationComplete();
        };
    }

    attachEventListeners() {
        this.elements.algorithmSelect.addEventListener('change', () => {
            this.updateAlgorithmDescription();
            this.reset();
        });

        this.elements.exampleSelect.addEventListener('change', () => {
            this.loadExample();
        });

        this.elements.speedSelect.addEventListener('change', () => {
            this.updateSpeed();
        });

        this.elements.startBtn.addEventListener('click', () => {
            this.start();
        });

        this.elements.pauseBtn.addEventListener('click', () => {
            this.togglePause();
        });

        this.elements.resetBtn.addEventListener('click', () => {
            this.reset();
        });

        this.elements.stepBtn.addEventListener('click', () => {
            this.step();
        });
    }

    loadInitialExample() {
        this.updateAlgorithmDescription();
        this.loadExample();
    }

    updateAlgorithmDescription() {
        const algorithmId = this.elements.algorithmSelect.value;
        const algorithm = Algorithms[algorithmId];

        if (algorithm) {
            this.currentAlgorithm = algorithm;
            this.elements.algorithmDescription.innerHTML = `
                <h4>${algorithm.name}</h4>
                <p>${algorithm.description}</p>
            `;
        }
    }

    loadExample() {
        const exampleId = this.elements.exampleSelect.value;
        const example = Examples[exampleId];

        if (example) {
            this.currentGraph = example.createGraph();
            this.visualizer.setGraph(this.currentGraph);
            this.reset();
        }
    }

    updateSpeed() {
        const speedValue = this.elements.speedSelect.value;
        const speedMap = {
            'slow': 1500,
            'medium': 750,
            'fast': 200
        };

        this.animator.setSpeed(speedMap[speedValue] || 1000);
    }

    start() {
        if (this.algorithmSteps.length === 0) {
            this.runAlgorithm();
        }

        if (this.animator.isPaused) {
            this.animator.resume();
        } else {
            this.animator.start();
        }

        this.elements.startBtn.disabled = true;
        this.elements.pauseBtn.disabled = false;
        this.elements.stepBtn.disabled = true;
        this.elements.pauseBtn.textContent = 'Pause';
    }

    togglePause() {
        if (this.animator.isPaused) {
            this.animator.resume();
            this.elements.pauseBtn.textContent = 'Pause';
            this.elements.stepBtn.disabled = true;
        } else {
            this.animator.pause();
            this.elements.pauseBtn.textContent = 'Resume';
            this.elements.stepBtn.disabled = false;
        }
    }

    reset() {
        this.animator.stop();
        this.algorithmSteps = [];
        this.foundPaths = [];

        this.visualizer.resetHighlights();

        this.elements.startBtn.disabled = false;
        this.elements.pauseBtn.disabled = true;
        this.elements.stepBtn.disabled = false;
        this.elements.pauseBtn.textContent = 'Pause';

        this.elements.nodesVisited.textContent = '0';
        this.elements.currentPath.textContent = '[]';
        this.elements.pathsFound.textContent = '0';
        this.elements.pathsContent.innerHTML = '<p style="color: #6c757d;">No paths found yet</p>';
        this.elements.stepDescription.innerHTML = '<p style="color: #6c757d;">Click Start to begin visualization</p>';
    }

    step() {
        if (this.algorithmSteps.length === 0) {
            this.runAlgorithm();
        }

        const hasMore = this.animator.stepForward();

        if (!hasMore) {
            this.onAnimationComplete();
        }
    }

    runAlgorithm() {
        if (!this.currentAlgorithm || !this.currentGraph) return;

        const result = this.currentAlgorithm.execute(this.currentGraph);
        this.algorithmSteps = result.steps;
        this.foundPaths = result.paths || [];

        this.animator.setSteps(this.algorithmSteps);
    }

    updateStepInfo(step, stepIndex) {
        if (!step) {
            this.elements.stepDescription.innerHTML = '<p style="color: #6c757d;">Click Start to begin visualization</p>';
            return;
        }

        // Update step description
        this.elements.stepDescription.innerHTML = `
            <p><strong>Step ${stepIndex + 1}/${this.algorithmSteps.length}</strong></p>
            <p>${step.description}</p>
        `;

        // Update current path
        if (step.data.path) {
            this.elements.currentPath.textContent = `[${step.data.path.join(' → ')}]`;
        }

        // Update nodes visited count
        const visitedNodes = new Set();
        for (let i = 0; i <= stepIndex; i++) {
            const s = this.algorithmSteps[i];
            if (s.data.nodeId !== undefined) {
                visitedNodes.add(s.data.nodeId);
            }
            if (s.data.path) {
                s.data.path.forEach(id => visitedNodes.add(id));
            }
        }
        this.elements.nodesVisited.textContent = visitedNodes.size;

        // Update found paths
        const pathsFoundSoFar = this.algorithmSteps
            .slice(0, stepIndex + 1)
            .filter(s => s.type === 'path-found').length;

        this.elements.pathsFound.textContent = pathsFoundSoFar;

        if (step.type === 'path-found') {
            this.addPathToList(step.data.path, step.data.pathIndex, step.data.fromCache);
        }

        // Scroll step description into view
        this.elements.stepDescription.scrollTop = this.elements.stepDescription.scrollHeight;
    }

    addPathToList(path, index, fromCache = false) {
        if (this.elements.pathsContent.querySelector('p')) {
            this.elements.pathsContent.innerHTML = '';
        }

        const pathDiv = document.createElement('div');
        pathDiv.className = fromCache ? 'path-item from-cache' : 'path-item';
        pathDiv.innerHTML = `
            <strong>Path ${index + 1}:</strong>${fromCache ? '<span class="cache-badge">CACHED</span>' : ''}<br>
            ${path.join(' → ')}
        `;

        this.elements.pathsContent.appendChild(pathDiv);
        this.elements.pathsContent.scrollTop = this.elements.pathsContent.scrollHeight;
    }

    onAnimationComplete() {
        this.elements.startBtn.disabled = false;
        this.elements.pauseBtn.disabled = true;
        this.elements.stepBtn.disabled = false;
        this.elements.pauseBtn.textContent = 'Pause';

        // Show completion message
        const completionStep = this.algorithmSteps[this.algorithmSteps.length - 1];
        if (completionStep && completionStep.type === 'complete') {
            this.elements.stepDescription.innerHTML = `
                <p><strong>Complete!</strong></p>
                <p>${completionStep.description}</p>
            `;
        }
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new AlgorithmVisualizerApp();
});
