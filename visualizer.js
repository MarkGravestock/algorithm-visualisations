// Graph visualization and animation system

class GraphVisualizer {
    constructor(svgElement) {
        this.svg = svgElement;
        this.graph = null;
        this.nodeRadius = 25;
        this.scale = 1;
        this.offsetX = 0;
        this.offsetY = 0;

        this.setupSVG();
    }

    setupSVG() {
        // Create arrow marker for directed edges
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
        marker.setAttribute('id', 'arrowhead');
        marker.setAttribute('markerWidth', '10');
        marker.setAttribute('markerHeight', '10');
        marker.setAttribute('refX', '9');
        marker.setAttribute('refY', '3');
        marker.setAttribute('orient', 'auto');
        marker.setAttribute('markerUnits', 'strokeWidth');

        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        polygon.setAttribute('points', '0 0, 10 3, 0 6');
        polygon.setAttribute('fill', '#adb5bd');

        marker.appendChild(polygon);
        defs.appendChild(marker);
        this.svg.appendChild(defs);

        // Create groups for edges and nodes (edges should be drawn first)
        this.edgesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.edgesGroup.setAttribute('class', 'edges');
        this.svg.appendChild(this.edgesGroup);

        this.nodesGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        this.nodesGroup.setAttribute('class', 'nodes');
        this.svg.appendChild(this.nodesGroup);
    }

    setGraph(graph) {
        this.graph = graph;
        this.render();
        this.centerGraph();
    }

    render() {
        // Clear existing elements
        this.edgesGroup.innerHTML = '';
        this.nodesGroup.innerHTML = '';

        if (!this.graph) return;

        // Draw edges
        this.graph.edges.forEach(edge => {
            this.drawEdge(edge);
        });

        // Draw nodes
        this.graph.nodes.forEach(node => {
            this.drawNode(node);
        });
    }

    drawEdge(edge) {
        const fromNode = this.graph.getNode(edge.from);
        const toNode = this.graph.getNode(edge.to);

        if (!fromNode || !toNode) return;

        // Calculate edge endpoints (from circle edge to circle edge)
        const dx = toNode.x - fromNode.x;
        const dy = toNode.y - fromNode.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) return;

        const unitX = dx / distance;
        const unitY = dy / distance;

        const startX = fromNode.x + unitX * this.nodeRadius;
        const startY = fromNode.y + unitY * this.nodeRadius;
        const endX = toNode.x - unitX * (this.nodeRadius + 10);
        const endY = toNode.y - unitY * (this.nodeRadius + 10);

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('class', 'edge-line');
        line.setAttribute('x1', startX);
        line.setAttribute('y1', startY);
        line.setAttribute('x2', endX);
        line.setAttribute('y2', endY);
        line.setAttribute('data-from', edge.from);
        line.setAttribute('data-to', edge.to);

        this.edgesGroup.appendChild(line);
    }

    drawNode(node) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('transform', `translate(${node.x}, ${node.y})`);
        group.setAttribute('data-node-id', node.id);

        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('class', 'node-circle');
        circle.setAttribute('r', this.nodeRadius);
        circle.setAttribute('cx', 0);
        circle.setAttribute('cy', 0);

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('class', 'node-label');
        text.setAttribute('x', 0);
        text.setAttribute('y', 5);
        text.textContent = node.label;

        // Create visit count badge (initially hidden)
        const badgeGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        badgeGroup.setAttribute('class', 'visit-badge');
        badgeGroup.setAttribute('data-visit-count', '0');
        badgeGroup.style.display = 'none';

        const badgeCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        badgeCircle.setAttribute('class', 'badge-circle');
        badgeCircle.setAttribute('r', 10);
        badgeCircle.setAttribute('cx', 18);
        badgeCircle.setAttribute('cy', -18);

        const badgeText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        badgeText.setAttribute('class', 'badge-text');
        badgeText.setAttribute('x', 18);
        badgeText.setAttribute('y', -14);
        badgeText.textContent = '0';

        badgeGroup.appendChild(badgeCircle);
        badgeGroup.appendChild(badgeText);

        group.appendChild(circle);
        group.appendChild(text);
        group.appendChild(badgeGroup);
        this.nodesGroup.appendChild(group);
    }

    centerGraph() {
        if (!this.graph || this.graph.nodes.length === 0) return;

        const svgRect = this.svg.getBoundingClientRect();
        const svgWidth = svgRect.width;
        const svgHeight = svgRect.height;

        // Calculate bounding box of graph
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        this.graph.nodes.forEach(node => {
            minX = Math.min(minX, node.x);
            minY = Math.min(minY, node.y);
            maxX = Math.max(maxX, node.x);
            maxY = Math.max(maxY, node.y);
        });

        const graphWidth = maxX - minX + 2 * this.nodeRadius;
        const graphHeight = maxY - minY + 2 * this.nodeRadius;

        // Calculate scale to fit
        const scaleX = (svgWidth - 100) / graphWidth;
        const scaleY = (svgHeight - 100) / graphHeight;
        this.scale = Math.min(scaleX, scaleY, 1.2);

        // Calculate offset to center
        const graphCenterX = (minX + maxX) / 2;
        const graphCenterY = (minY + maxY) / 2;
        this.offsetX = svgWidth / 2 - graphCenterX * this.scale;
        this.offsetY = svgHeight / 2 - graphCenterY * this.scale;

        // Apply transformation
        const transform = `translate(${this.offsetX}, ${this.offsetY}) scale(${this.scale})`;
        this.edgesGroup.setAttribute('transform', transform);
        this.nodesGroup.setAttribute('transform', transform);
    }

    highlightNode(nodeId, className) {
        const nodeGroup = this.nodesGroup.querySelector(`[data-node-id="${nodeId}"]`);
        if (nodeGroup) {
            const circle = nodeGroup.querySelector('.node-circle');
            circle.setAttribute('class', `node-circle ${className}`);
        }
    }

    highlightEdge(fromId, toId, className) {
        const edge = this.edgesGroup.querySelector(
            `[data-from="${fromId}"][data-to="${toId}"]`
        );
        if (edge) {
            edge.setAttribute('class', `edge-line ${className}`);
        }
    }

    updateVisitCount(nodeId, count) {
        const nodeGroup = this.nodesGroup.querySelector(`[data-node-id="${nodeId}"]`);
        if (nodeGroup) {
            const badge = nodeGroup.querySelector('.visit-badge');
            const badgeText = nodeGroup.querySelector('.badge-text');

            if (badge && badgeText) {
                badge.setAttribute('data-visit-count', count);
                badgeText.textContent = count;
                badge.style.display = count > 0 ? 'block' : 'none';
            }
        }
    }

    resetVisitCounts() {
        this.nodesGroup.querySelectorAll('.visit-badge').forEach(badge => {
            badge.setAttribute('data-visit-count', '0');
            badge.style.display = 'none';
            const badgeText = badge.querySelector('.badge-text');
            if (badgeText) {
                badgeText.textContent = '0';
            }
        });
    }

    resetHighlights() {
        // Reset all nodes
        this.nodesGroup.querySelectorAll('.node-circle').forEach(circle => {
            circle.setAttribute('class', 'node-circle');
        });

        // Reset all edges
        this.edgesGroup.querySelectorAll('.edge-line').forEach(edge => {
            edge.setAttribute('class', 'edge-line');
        });
    }

    highlightPath(path, className) {
        // Highlight nodes in path
        path.forEach(nodeId => {
            this.highlightNode(nodeId, className);
        });

        // Highlight edges in path
        for (let i = 0; i < path.length - 1; i++) {
            this.highlightEdge(path[i], path[i + 1], className);
        }
    }
}

class AnimationController {
    constructor(visualizer) {
        this.visualizer = visualizer;
        this.steps = [];
        this.currentStepIndex = 0;
        this.isPlaying = false;
        this.isPaused = false;
        this.speed = 1000; // milliseconds
        this.timeoutId = null;
        this.visitCounts = new Map(); // Track visit counts for each node

        this.onStepChange = null;
        this.onComplete = null;
    }

    setSteps(steps) {
        this.steps = steps;
        this.currentStepIndex = 0;
        this.isPlaying = false;
        this.isPaused = false;
    }

    setSpeed(speed) {
        this.speed = speed;
    }

    start() {
        if (this.steps.length === 0) return;

        this.isPlaying = true;
        this.isPaused = false;
        this.playNextStep();
    }

    pause() {
        this.isPaused = true;
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
    }

    resume() {
        if (this.isPaused) {
            this.isPaused = false;
            this.playNextStep();
        }
    }

    stop() {
        this.isPlaying = false;
        this.isPaused = false;
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
            this.timeoutId = null;
        }
        this.reset();
    }

    reset() {
        this.currentStepIndex = 0;
        this.visitCounts.clear();
        this.visualizer.resetHighlights();
        this.visualizer.resetVisitCounts();
        if (this.onStepChange) {
            this.onStepChange(null, 0);
        }
    }

    stepForward() {
        if (this.currentStepIndex < this.steps.length) {
            this.executeStep(this.currentStepIndex);
            this.currentStepIndex++;
            return true;
        }
        return false;
    }

    stepBackward() {
        if (this.currentStepIndex > 0) {
            this.currentStepIndex--;
            this.replayUpToCurrentStep();
            return true;
        }
        return false;
    }

    playNextStep() {
        if (!this.isPlaying || this.isPaused) return;

        if (this.currentStepIndex >= this.steps.length) {
            this.isPlaying = false;
            if (this.onComplete) {
                this.onComplete();
            }
            return;
        }

        this.executeStep(this.currentStepIndex);
        this.currentStepIndex++;

        this.timeoutId = setTimeout(() => {
            this.playNextStep();
        }, this.speed);
    }

    executeStep(stepIndex) {
        const step = this.steps[stepIndex];
        if (!step) return;

        // Reset highlights before each step
        this.visualizer.resetHighlights();

        // Increment visit count for visited nodes (exclude initial 'start' action)
        if (step.type === 'visit' && step.data.nodeId !== undefined && step.data.action !== 'start') {
            const currentCount = this.visitCounts.get(step.data.nodeId) || 0;
            const newCount = currentCount + 1;
            this.visitCounts.set(step.data.nodeId, newCount);
            this.visualizer.updateVisitCount(step.data.nodeId, newCount);
        }

        switch (step.type) {
            case 'visit':
                if (step.data.nodeId !== undefined) {
                    // Special highlighting for cache hits
                    const nodeClass = step.data.action === 'cache-hit' ? 'cache-hit' : 'current';
                    this.visualizer.highlightNode(step.data.nodeId, nodeClass);
                }
                if (step.data.path) {
                    step.data.path.forEach((nodeId, idx) => {
                        if (idx < step.data.path.length - 1) {
                            this.visualizer.highlightNode(nodeId, 'in-path');
                        }
                    });
                    for (let i = 0; i < step.data.path.length - 1; i++) {
                        this.visualizer.highlightEdge(
                            step.data.path[i],
                            step.data.path[i + 1],
                            'in-path'
                        );
                    }
                }
                break;

            case 'explore-edge':
                if (!step.data.skipped) {
                    this.visualizer.highlightEdge(step.data.from, step.data.to, 'active');
                    this.visualizer.highlightNode(step.data.to, 'visiting');
                }
                if (step.data.path) {
                    step.data.path.forEach(nodeId => {
                        this.visualizer.highlightNode(nodeId, 'in-path');
                    });
                    for (let i = 0; i < step.data.path.length - 1; i++) {
                        this.visualizer.highlightEdge(
                            step.data.path[i],
                            step.data.path[i + 1],
                            'in-path'
                        );
                    }
                }
                break;

            case 'backtrack':
                if (step.data.path) {
                    step.data.path.forEach(nodeId => {
                        this.visualizer.highlightNode(nodeId, 'visited');
                    });
                }
                break;

            case 'path-found':
                if (step.data.path) {
                    this.visualizer.highlightPath(step.data.path, 'path-found');
                }
                break;

            case 'complete':
                // Keep the last state
                break;
        }

        if (this.onStepChange) {
            this.onStepChange(step, stepIndex);
        }
    }

    replayUpToCurrentStep() {
        this.visitCounts.clear();
        this.visualizer.resetHighlights();
        this.visualizer.resetVisitCounts();
        for (let i = 0; i < this.currentStepIndex; i++) {
            this.executeStep(i);
        }
    }
}
