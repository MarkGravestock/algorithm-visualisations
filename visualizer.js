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
        this.createArrowMarker();
        this.createRenderingGroups();
    }

    createArrowMarker() {
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
    }

    createRenderingGroups() {
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
        this.clearExistingElements();
        if (!this.graph) return;
        this.renderEdges();
        this.renderNodes();
    }

    clearExistingElements() {
        this.edgesGroup.innerHTML = '';
        this.nodesGroup.innerHTML = '';
    }

    renderEdges() {
        this.graph.edges.forEach(edge => {
            this.drawEdge(edge);
        });
    }

    renderNodes() {
        this.graph.nodes.forEach(node => {
            this.drawNode(node);
        });
    }

    drawEdge(edge) {
        const fromNode = this.graph.getNode(edge.from);
        const toNode = this.graph.getNode(edge.to);

        if (!fromNode || !toNode) return;

        const endpoints = this.calculateEdgeEndpoints(fromNode, toNode);
        if (!endpoints) return;

        const line = this.createEdgeLine(edge, endpoints);
        this.edgesGroup.appendChild(line);
    }

    calculateEdgeEndpoints(fromNode, toNode) {
        const dx = toNode.x - fromNode.x;
        const dy = toNode.y - fromNode.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance === 0) return null;

        const unitX = dx / distance;
        const unitY = dy / distance;

        return {
            startX: fromNode.x + unitX * this.nodeRadius,
            startY: fromNode.y + unitY * this.nodeRadius,
            endX: toNode.x - unitX * (this.nodeRadius + 10),
            endY: toNode.y - unitY * (this.nodeRadius + 10)
        };
    }

    createEdgeLine(edge, endpoints) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('class', 'edge-line');
        line.setAttribute('x1', endpoints.startX);
        line.setAttribute('y1', endpoints.startY);
        line.setAttribute('x2', endpoints.endX);
        line.setAttribute('y2', endpoints.endY);
        line.setAttribute('data-from', edge.from);
        line.setAttribute('data-to', edge.to);
        return line;
    }

    drawNode(node) {
        const group = this.createNodeGroup(node);
        const circle = this.createNodeCircle();
        const text = this.createNodeLabel(node);
        const badgeGroup = this.createVisitCountBadge();

        group.appendChild(circle);
        group.appendChild(text);
        group.appendChild(badgeGroup);
        this.nodesGroup.appendChild(group);
    }

    createNodeGroup(node) {
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('transform', `translate(${node.x}, ${node.y})`);
        group.setAttribute('data-node-id', node.id);
        return group;
    }

    createNodeCircle() {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('class', 'node-circle');
        circle.setAttribute('r', this.nodeRadius);
        circle.setAttribute('cx', 0);
        circle.setAttribute('cy', 0);
        return circle;
    }

    createNodeLabel(node) {
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('class', 'node-label');
        text.setAttribute('x', 0);
        text.setAttribute('y', 5);
        text.textContent = node.label;
        return text;
    }

    createVisitCountBadge() {
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
        return badgeGroup;
    }

    centerGraph() {
        if (!this.graph || this.graph.nodes.length === 0) return;

        const svgRect = this.svg.getBoundingClientRect();
        const bounds = this.calculateGraphBounds();
        this.scale = this.calculateFitScale(svgRect, bounds);
        const offsets = this.calculateCenteringOffsets(svgRect, bounds);

        this.offsetX = offsets.x;
        this.offsetY = offsets.y;

        this.applyGraphTransformation();
    }

    calculateGraphBounds() {
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        this.graph.nodes.forEach(node => {
            minX = Math.min(minX, node.x);
            minY = Math.min(minY, node.y);
            maxX = Math.max(maxX, node.x);
            maxY = Math.max(maxY, node.y);
        });

        const graphWidth = maxX - minX + 2 * this.nodeRadius;
        const graphHeight = maxY - minY + 2 * this.nodeRadius;

        return { minX, minY, maxX, maxY, graphWidth, graphHeight };
    }

    calculateFitScale(svgRect, bounds) {
        const scaleX = (svgRect.width - 100) / bounds.graphWidth;
        const scaleY = (svgRect.height - 100) / bounds.graphHeight;
        return Math.min(scaleX, scaleY, 1.2);
    }

    calculateCenteringOffsets(svgRect, bounds) {
        const graphCenterX = (bounds.minX + bounds.maxX) / 2;
        const graphCenterY = (bounds.minY + bounds.maxY) / 2;

        return {
            x: svgRect.width / 2 - graphCenterX * this.scale,
            y: svgRect.height / 2 - graphCenterY * this.scale
        };
    }

    applyGraphTransformation() {
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
        this.resetAllNodeHighlights();
        this.resetAllEdgeHighlights();
    }

    resetAllNodeHighlights() {
        this.nodesGroup.querySelectorAll('.node-circle').forEach(circle => {
            circle.setAttribute('class', 'node-circle');
        });
    }

    resetAllEdgeHighlights() {
        this.edgesGroup.querySelectorAll('.edge-line').forEach(edge => {
            edge.setAttribute('class', 'edge-line');
        });
    }

    highlightPath(path, className) {
        this.highlightNodesInPath(path, className);
        this.highlightEdgesInPath(path, className);
    }

    highlightNodesInPath(path, className) {
        path.forEach(nodeId => {
            this.highlightNode(nodeId, className);
        });
    }

    highlightEdgesInPath(path, className) {
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

        this.visualizer.resetHighlights();
        this.updateVisitCountIfNeeded(step);
        this.renderStepVisualization(step);

        if (this.onStepChange) {
            this.onStepChange(step, stepIndex);
        }
    }

    updateVisitCountIfNeeded(step) {
        if (step.type === 'visit' && step.data.nodeId !== undefined && step.data.action !== 'start') {
            const currentCount = this.visitCounts.get(step.data.nodeId) || 0;
            const newCount = currentCount + 1;
            this.visitCounts.set(step.data.nodeId, newCount);
            this.visualizer.updateVisitCount(step.data.nodeId, newCount);
        }
    }

    renderStepVisualization(step) {
        switch (step.type) {
            case 'visit':
                this.renderVisitStep(step);
                break;

            case 'explore-edge':
                this.renderExploreEdgeStep(step);
                break;

            case 'backtrack':
                this.renderBacktrackStep(step);
                break;

            case 'path-found':
                this.renderPathFoundStep(step);
                break;

            case 'cycle-detected':
                this.renderCycleDetectedStep(step);
                break;

            case 'complete':
                break;
        }
    }

    renderVisitStep(step) {
        if (step.data.nodeId !== undefined) {
            const nodeClass = this.determineNodeHighlightClass(step);
            this.visualizer.highlightNode(step.data.nodeId, nodeClass);
        }
        if (step.data.path) {
            this.highlightCurrentPath(step.data.path);
        }
    }

    determineNodeHighlightClass(step) {
        return step.data.action === 'cache-hit' ? 'cache-hit' : 'current';
    }

    highlightCurrentPath(path) {
        path.forEach((nodeId, idx) => {
            if (idx < path.length - 1) {
                this.visualizer.highlightNode(nodeId, 'in-path');
            }
        });
        for (let i = 0; i < path.length - 1; i++) {
            this.visualizer.highlightEdge(path[i], path[i + 1], 'in-path');
        }
    }

    renderExploreEdgeStep(step) {
        if (!step.data.skipped) {
            this.visualizer.highlightEdge(step.data.from, step.data.to, 'active');
            this.visualizer.highlightNode(step.data.to, 'visiting');
        }
        if (step.data.path) {
            this.highlightCurrentPath(step.data.path);
        }
    }

    renderBacktrackStep(step) {
        if (step.data.path) {
            step.data.path.forEach(nodeId => {
                this.visualizer.highlightNode(nodeId, 'visited');
            });
        }
    }

    renderPathFoundStep(step) {
        if (step.data.path) {
            this.visualizer.highlightPath(step.data.path, 'path-found');
        }
    }

    renderCycleDetectedStep(step) {
        if (step.data.from !== undefined && step.data.to !== undefined) {
            this.visualizer.highlightEdge(step.data.from, step.data.to, 'cycle');
            this.visualizer.highlightNode(step.data.to, 'cycle');
        }
        if (step.data.path) {
            this.highlightCurrentPath(step.data.path);
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
