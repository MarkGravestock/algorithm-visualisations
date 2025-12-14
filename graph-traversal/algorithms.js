class AlgorithmStep {
    constructor(type, data, description) {
        this.type = type;
        this.data = data;
        this.description = description;
    }
}

class GraphAnalyzer {
    static findSourceNode(graph) {
        const nodesWithIncoming = new Set();
        graph.edges.forEach(edge => nodesWithIncoming.add(edge.to));
        return graph.nodes.find(n => !nodesWithIncoming.has(n.id))?.id;
    }

    static findSinkNode(graph) {
        return graph.nodes.find(n => graph.getNeighbors(n.id).length === 0)?.id;
    }

    static validateSourceAndSink(sourceId, sinkId, steps, allPaths) {
        if (sourceId === undefined || sinkId === undefined) {
            steps.push(new AlgorithmStep('complete', {},
                'Error: Could not identify source or sink node'));
            return { steps, paths: allPaths, isValid: false };
        }
        return { isValid: true };
    }
}

const Algorithms = {
    'dfs-all-paths': {
        name: "DFS - All Paths",
        description: "Depth-First Search to find all possible paths from source to sink. WARNING: On graphs with cycles, this will explore cycles indefinitely until reaching max depth limit.",

        execute: function(graph, sourceId = null, sinkId = null) {
            const steps = [];
            const allPaths = [];
            const MAX_DEPTH = 50;
            let depthLimitReached = false;

            sourceId = sourceId ?? GraphAnalyzer.findSourceNode(graph);
            sinkId = sinkId ?? GraphAnalyzer.findSinkNode(graph);

            const validation = GraphAnalyzer.validateSourceAndSink(sourceId, sinkId, steps, allPaths);
            if (!validation.isValid) return validation;

            this.recordStartStep(steps, sourceId, sinkId);

            const dfsExplorer = {
                recordSinkReached: (currentPath) => {
                    steps.push(new AlgorithmStep('visit', {
                        nodeId: sinkId,
                        path: currentPath,
                        action: 'sink-reached'
                    }, `Reached sink node ${sinkId}`));

                    const pathCopy = [...currentPath];
                    allPaths.push(pathCopy);

                    steps.push(new AlgorithmStep('path-found', {
                        path: pathCopy,
                        pathIndex: allPaths.length - 1
                    }, `Found complete path ${allPaths.length}: ${pathCopy.join(' → ')}`));
                },

                recordExplorationStart: (currentId, currentPath, neighbors) => {
                    steps.push(new AlgorithmStep('visit', {
                        nodeId: currentId,
                        path: [...currentPath],
                        neighbors: neighbors,
                        action: 'explore'
                    }, `Exploring neighbors of node ${currentId}: [${neighbors.join(', ')}]`));
                },

                recordDepthLimitReached: (currentId, currentPath) => {
                    steps.push(new AlgorithmStep('explore-edge', {
                        from: currentId,
                        to: null,
                        path: [...currentPath],
                        skipped: true,
                        reason: 'max-depth'
                    }, `⚠️ Maximum depth (${MAX_DEPTH}) reached at node ${currentId} - stopping exploration to prevent infinite cycles`));
                    depthLimitReached = true;
                },

                recordEdgeTraversal: (currentId, neighborId, currentPath) => {
                    steps.push(new AlgorithmStep('explore-edge', {
                        from: currentId,
                        to: neighborId,
                        path: [...currentPath],
                        skipped: false
                    }, `Traversing edge ${currentId} → ${neighborId}`));
                },

                recordBacktrack: (currentId, currentPath) => {
                    if (currentId !== sourceId) {
                        steps.push(new AlgorithmStep('backtrack', {
                            nodeId: currentId,
                            path: [...currentPath]
                        }, `Backtracking from node ${currentId}`));
                    }
                },

                exploreFrom: function(currentId, currentPath) {
                    if (currentPath.length > MAX_DEPTH) {
                        this.recordDepthLimitReached(currentId, currentPath);
                        return;
                    }

                    if (currentId === sinkId) {
                        this.recordSinkReached(currentPath);
                        return;
                    }

                    const neighbors = graph.getNeighbors(currentId);
                    this.recordExplorationStart(currentId, currentPath, neighbors);

                    for (const neighborId of neighbors) {
                        this.recordEdgeTraversal(currentId, neighborId, currentPath);

                        const newPath = [...currentPath, neighborId];
                        this.exploreFrom(neighborId, newPath);
                    }

                    this.recordBacktrack(currentId, currentPath);
                }
            };

            dfsExplorer.exploreFrom(sourceId, [sourceId]);

            const completionMessage = depthLimitReached
                ? `Search stopped at max depth ${MAX_DEPTH}. Found ${allPaths.length} path(s). Graph likely contains cycles!`
                : `Search complete! Found ${allPaths.length} path(s) from ${sourceId} to ${sinkId}`;

            steps.push(new AlgorithmStep('complete', {
                totalPaths: allPaths.length,
                paths: allPaths,
                depthLimitReached: depthLimitReached
            }, completionMessage));

            return { steps, paths: allPaths };
        },

        recordStartStep: function(steps, sourceId, sinkId) {
            steps.push(new AlgorithmStep('visit', {
                nodeId: sourceId,
                path: [sourceId],
                action: 'start'
            }, `Starting DFS from node ${sourceId} to find all paths to node ${sinkId}`));
        }
    },

    'dfs-node-disjoint': {
        name: "DFS - Node-Disjoint Paths",
        description: "Depth-First Search to find node-disjoint paths from source to sink. No two paths share any intermediate nodes (except source and sink). Useful for finding independent routes in network flow problems.",

        execute: function(graph, sourceId = null, sinkId = null) {
            const steps = [];
            const allPaths = [];

            sourceId = sourceId ?? GraphAnalyzer.findSourceNode(graph);
            sinkId = sinkId ?? GraphAnalyzer.findSinkNode(graph);

            const validation = GraphAnalyzer.validateSourceAndSink(sourceId, sinkId, steps, allPaths);
            if (!validation.isValid) return validation;

            steps.push(new AlgorithmStep('visit', {
                nodeId: sourceId,
                path: [sourceId],
                action: 'start'
            }, `Starting DFS from node ${sourceId} to find node-disjoint paths to node ${sinkId}`));

            const globallyUsedNodes = new Set([sourceId, sinkId]);

            const disjointExplorer = {
                markPathNodesAsUsed: (pathCopy) => {
                    for (let i = 1; i < pathCopy.length - 1; i++) {
                        globallyUsedNodes.add(pathCopy[i]);
                    }
                },

                isNodeGloballyUsed: (neighborId) => {
                    return globallyUsedNodes.has(neighborId) && neighborId !== sinkId;
                },

                recordSinkReached: (currentPath) => {
                    steps.push(new AlgorithmStep('visit', {
                        nodeId: sinkId,
                        path: currentPath,
                        action: 'sink-reached'
                    }, `Reached sink node ${sinkId}`));

                    const pathCopy = [...currentPath];
                    allPaths.push(pathCopy);

                    steps.push(new AlgorithmStep('path-found', {
                        path: pathCopy,
                        pathIndex: allPaths.length - 1
                    }, `Found node-disjoint path ${allPaths.length}: ${pathCopy.join(' → ')}`));

                    this.markPathNodesAsUsed(pathCopy);
                },

                recordExplorationStart: (currentId, currentPath, neighbors) => {
                    steps.push(new AlgorithmStep('visit', {
                        nodeId: currentId,
                        path: [...currentPath],
                        neighbors: neighbors,
                        action: 'explore'
                    }, `Exploring neighbors of node ${currentId}: [${neighbors.join(', ')}]`));
                },

                recordSkippedNode: (currentId, neighborId, currentPath, reason) => {
                    const messages = {
                        'in-current-path': `Skipping node ${neighborId} - already in current path`,
                        'globally-used': `Skipping node ${neighborId} - used in another path`
                    };

                    steps.push(new AlgorithmStep('explore-edge', {
                        from: currentId,
                        to: neighborId,
                        path: [...currentPath],
                        skipped: true,
                        reason: reason
                    }, messages[reason]));
                },

                recordEdgeTraversal: (currentId, neighborId, currentPath) => {
                    steps.push(new AlgorithmStep('explore-edge', {
                        from: currentId,
                        to: neighborId,
                        path: [...currentPath],
                        skipped: false
                    }, `Traversing edge ${currentId} → ${neighborId}`));
                },

                recordBacktrack: (currentId, currentPath) => {
                    if (currentId !== sourceId) {
                        steps.push(new AlgorithmStep('backtrack', {
                            nodeId: currentId,
                            path: [...currentPath]
                        }, `Backtracking from node ${currentId}`));
                    }
                },

                exploreFrom: function(currentId, currentPath, visited) {
                    if (currentId === sinkId) {
                        this.recordSinkReached(currentPath);
                        return;
                    }

                    const neighbors = graph.getNeighbors(currentId);
                    this.recordExplorationStart(currentId, currentPath, neighbors);

                    for (const neighborId of neighbors) {
                        if (visited.has(neighborId)) {
                            this.recordSkippedNode(currentId, neighborId, currentPath, 'in-current-path');
                            continue;
                        }

                        if (this.isNodeGloballyUsed(neighborId)) {
                            this.recordSkippedNode(currentId, neighborId, currentPath, 'globally-used');
                            continue;
                        }

                        this.recordEdgeTraversal(currentId, neighborId, currentPath);

                        const newPath = [...currentPath, neighborId];
                        const newVisited = new Set(visited);
                        newVisited.add(neighborId);

                        this.exploreFrom(neighborId, newPath, newVisited);
                    }

                    this.recordBacktrack(currentId, currentPath);
                }
            };

            const initialVisited = new Set([sourceId]);
            disjointExplorer.exploreFrom(sourceId, [sourceId], initialVisited);

            steps.push(new AlgorithmStep('complete', {
                totalPaths: allPaths.length,
                paths: allPaths
            }, `Search complete! Found ${allPaths.length} node-disjoint path(s) from ${sourceId} to ${sinkId}`));

            return { steps, paths: allPaths };
        }
    },

    'dfs-memoized': {
        name: "DFS - All Paths (Memoized)",
        description: "Optimized DFS using memoization to cache path results. Once all paths from a node to sink are computed, they're reused on subsequent visits. Finds the same paths as standard DFS but more efficiently.",

        execute: function(graph, sourceId = null, sinkId = null) {
            const steps = [];
            const allPaths = [];
            const memo = new Map();

            sourceId = sourceId ?? GraphAnalyzer.findSourceNode(graph);
            sinkId = sinkId ?? GraphAnalyzer.findSinkNode(graph);

            const validation = GraphAnalyzer.validateSourceAndSink(sourceId, sinkId, steps, allPaths);
            if (!validation.isValid) return validation;

            steps.push(new AlgorithmStep('visit', {
                nodeId: sourceId,
                path: [sourceId],
                action: 'start'
            }, `Starting memoized DFS from node ${sourceId} to find all paths to node ${sinkId}`));

            const memoizedExplorer = {
                recordSinkReached: (currentPath, usedCache) => {
                    steps.push(new AlgorithmStep('visit', {
                        nodeId: sinkId,
                        path: currentPath,
                        action: 'sink-reached'
                    }, `Reached sink node ${sinkId}`));

                    if (currentPath.length > 0) {
                        allPaths.push([...currentPath]);
                        steps.push(new AlgorithmStep('path-found', {
                            path: [...currentPath],
                            pathIndex: allPaths.length - 1,
                            fromCache: usedCache
                        }, `Found complete path ${allPaths.length}: ${currentPath.join(' → ')}${usedCache ? ' (via cache)' : ''}`));
                    }
                },

                recordCacheHit: (currentId, currentPath, cachedPaths) => {
                    steps.push(new AlgorithmStep('visit', {
                        nodeId: currentId,
                        path: currentPath,
                        action: 'cache-hit',
                        cachedPathCount: cachedPaths.length
                    }, `Cache hit! Node ${currentId} has ${cachedPaths.length} cached path(s) to sink - reusing results`));

                    if (currentPath.length > 0) {
                        for (const cachedPath of cachedPaths) {
                            const completePath = [...currentPath.slice(0, -1), ...cachedPath];
                            allPaths.push(completePath);
                            steps.push(new AlgorithmStep('path-found', {
                                path: completePath,
                                pathIndex: allPaths.length - 1,
                                fromCache: true
                            }, `Found complete path ${allPaths.length}: ${completePath.join(' → ')} (via cache)`));
                        }
                    }
                },

                recordCacheMiss: (currentId, currentPath) => {
                    steps.push(new AlgorithmStep('visit', {
                        nodeId: currentId,
                        path: currentPath,
                        action: 'explore'
                    }, `Cache miss - exploring neighbors of node ${currentId}`));
                },

                recordEdgeTraversal: (currentId, neighborId, currentPath) => {
                    steps.push(new AlgorithmStep('explore-edge', {
                        from: currentId,
                        to: neighborId,
                        path: currentPath,
                        skipped: false
                    }, `Traversing edge ${currentId} → ${neighborId}`));
                },

                recordCacheStore: (currentId, currentPath, pathsFromHere) => {
                    steps.push(new AlgorithmStep('backtrack', {
                        nodeId: currentId,
                        path: currentPath,
                        cachedCount: pathsFromHere.length
                    }, `Cached ${pathsFromHere.length} path(s) from node ${currentId} to sink`));
                },

                exploreFrom: function(currentId, currentPath, usedCache) {
                    if (currentId === sinkId) {
                        this.recordSinkReached(currentPath, usedCache);
                        return [[sinkId]];
                    }

                    if (memo.has(currentId)) {
                        const cachedPaths = memo.get(currentId);
                        this.recordCacheHit(currentId, currentPath, cachedPaths);
                        return cachedPaths;
                    }

                    this.recordCacheMiss(currentId, currentPath);

                    const neighbors = graph.getNeighbors(currentId);
                    const pathsFromHere = [];

                    for (const neighborId of neighbors) {
                        this.recordEdgeTraversal(currentId, neighborId, currentPath);

                        const newPath = [...currentPath, neighborId];
                        const pathsFromNeighbor = this.exploreFrom(neighborId, newPath, usedCache);

                        for (const pathFromNeighbor of pathsFromNeighbor) {
                            pathsFromHere.push([currentId, ...pathFromNeighbor]);
                        }
                    }

                    memo.set(currentId, pathsFromHere);
                    this.recordCacheStore(currentId, currentPath, pathsFromHere);

                    return pathsFromHere;
                }
            };

            memoizedExplorer.exploreFrom(sourceId, [sourceId], false);

            steps.push(new AlgorithmStep('complete', {
                totalPaths: allPaths.length,
                paths: allPaths,
                cacheSize: memo.size
            }, `Search complete! Found ${allPaths.length} path(s) using memoization. Cache contains ${memo.size} entries.`));

            return { steps, paths: allPaths };
        }
    },

    'bfs-all-paths': {
        name: "BFS - All Paths",
        description: "Breadth-First Search to find all possible paths from source to sink. WARNING: On graphs with cycles, this will explore cycles indefinitely until reaching max depth limit.",

        execute: function(graph, sourceId = null, sinkId = null) {
            const steps = [];
            const allPaths = [];
            const MAX_DEPTH = 50;
            const MAX_QUEUE_SIZE = 1000;
            let limitReached = false;

            sourceId = sourceId ?? GraphAnalyzer.findSourceNode(graph);
            sinkId = sinkId ?? GraphAnalyzer.findSinkNode(graph);

            const validation = GraphAnalyzer.validateSourceAndSink(sourceId, sinkId, steps, allPaths);
            if (!validation.isValid) return validation;

            steps.push(new AlgorithmStep('visit', {
                nodeId: sourceId,
                path: [sourceId],
                action: 'start'
            }, `Starting BFS from node ${sourceId} to find all paths to node ${sinkId}`));

            const queue = [[sourceId]];

            const bfsExplorer = {
                recordEnqueue: (path) => {
                    steps.push(new AlgorithmStep('visit', {
                        nodeId: path[path.length - 1],
                        path: path,
                        action: 'enqueue'
                    }, `Enqueued path: [${path.join(' → ')}]`));
                },

                recordDequeue: (currentPath, currentId) => {
                    steps.push(new AlgorithmStep('visit', {
                        nodeId: currentId,
                        path: currentPath,
                        action: 'dequeue'
                    }, `Dequeued path: [${currentPath.join(' → ')}] - exploring from node ${currentId}`));
                },

                recordSinkReached: (currentPath) => {
                    steps.push(new AlgorithmStep('visit', {
                        nodeId: sinkId,
                        path: currentPath,
                        action: 'sink-reached'
                    }, `Reached sink node ${sinkId}`));

                    allPaths.push([...currentPath]);

                    steps.push(new AlgorithmStep('path-found', {
                        path: [...currentPath],
                        pathIndex: allPaths.length - 1
                    }, `Found complete path ${allPaths.length}: ${currentPath.join(' → ')}`));
                },

                recordExplorationStart: (currentId, currentPath, neighbors) => {
                    steps.push(new AlgorithmStep('visit', {
                        nodeId: currentId,
                        path: currentPath,
                        neighbors: neighbors,
                        action: 'explore'
                    }, `Exploring neighbors of node ${currentId}: [${neighbors.join(', ')}]`));
                },

                recordLimitReached: (reason) => {
                    steps.push(new AlgorithmStep('explore-edge', {
                        from: null,
                        to: null,
                        path: [],
                        skipped: true,
                        reason: 'limit-reached'
                    }, `⚠️ ${reason} - stopping to prevent infinite cycles`));
                    limitReached = true;
                },

                recordEdgeTraversal: (currentId, neighborId, currentPath) => {
                    steps.push(new AlgorithmStep('explore-edge', {
                        from: currentId,
                        to: neighborId,
                        path: currentPath,
                        skipped: false
                    }, `Traversing edge ${currentId} → ${neighborId}`));
                }
            };

            bfsExplorer.recordEnqueue([sourceId]);

            while (queue.length > 0 && !limitReached) {
                if (queue.length > MAX_QUEUE_SIZE) {
                    bfsExplorer.recordLimitReached(`Queue size exceeded ${MAX_QUEUE_SIZE}`);
                    break;
                }

                const currentPath = queue.shift();

                if (currentPath.length > MAX_DEPTH) {
                    bfsExplorer.recordLimitReached(`Path depth exceeded ${MAX_DEPTH}`);
                    break;
                }

                const currentId = currentPath[currentPath.length - 1];
                bfsExplorer.recordDequeue(currentPath, currentId);

                if (currentId === sinkId) {
                    bfsExplorer.recordSinkReached(currentPath);
                    continue;
                }

                const neighbors = graph.getNeighbors(currentId);
                bfsExplorer.recordExplorationStart(currentId, currentPath, neighbors);

                for (const neighborId of neighbors) {
                    const newPath = [...currentPath, neighborId];
                    bfsExplorer.recordEdgeTraversal(currentId, neighborId, currentPath);
                    bfsExplorer.recordEnqueue(newPath);

                    queue.push(newPath);
                }
            }

            const completionMessage = limitReached
                ? `Search stopped due to limits. Found ${allPaths.length} path(s). Graph likely contains cycles!`
                : `Search complete! Found ${allPaths.length} path(s) from ${sourceId} to ${sinkId} using BFS`;

            steps.push(new AlgorithmStep('complete', {
                totalPaths: allPaths.length,
                paths: allPaths,
                limitReached: limitReached
            }, completionMessage));

            return { steps, paths: allPaths };
        }
    },

    'dfs-cycle-detection': {
        name: "DFS - Cycle Detection",
        description: "Depth-first search that detects and avoids cycles in the graph. When a cycle is detected, the algorithm skips that edge and continues exploring other paths.",
        execute: function(graph, sourceId = null, sinkId = null) {
            const steps = [];
            const allPaths = [];
            const cyclesDetected = [];

            sourceId = sourceId ?? GraphAnalyzer.findSourceNode(graph);
            sinkId = sinkId ?? GraphAnalyzer.findSinkNode(graph);

            const validation = GraphAnalyzer.validateSourceAndSink(sourceId, sinkId, steps, allPaths);
            if (!validation.isValid) return validation;

            steps.push(new AlgorithmStep('visit', {
                nodeId: sourceId,
                path: [sourceId],
                action: 'start'
            }, `Starting DFS with cycle detection from node ${sourceId} to node ${sinkId}`));

            const cycleDetector = {
                recordSinkReached: (currentPath) => {
                    steps.push(new AlgorithmStep('visit', {
                        nodeId: sinkId,
                        path: currentPath,
                        action: 'sink-reached'
                    }, `Reached sink node ${sinkId}`));

                    const pathCopy = [...currentPath];
                    allPaths.push(pathCopy);
                    steps.push(new AlgorithmStep('path-found', {
                        path: pathCopy,
                        pathIndex: allPaths.length - 1
                    }, `Found complete path ${allPaths.length}: ${pathCopy.join(' → ')}`));
                },

                recordExplorationStart: (currentId, currentPath, neighbors) => {
                    steps.push(new AlgorithmStep('visit', {
                        nodeId: currentId,
                        path: [...currentPath],
                        neighbors: neighbors,
                        action: 'explore'
                    }, `Exploring neighbors of node ${currentId}: [${neighbors.join(', ')}]`));
                },

                recordCycleDetected: (currentId, neighborId, currentPath) => {
                    const cycleInfo = {
                        from: currentId,
                        to: neighborId,
                        path: [...currentPath]
                    };
                    cyclesDetected.push(cycleInfo);

                    steps.push(new AlgorithmStep('cycle-detected', {
                        from: currentId,
                        to: neighborId,
                        path: [...currentPath],
                        cycleIndex: cyclesDetected.length - 1
                    }, `🔁 Cycle detected! Edge ${currentId} → ${neighborId} creates a cycle (node ${neighborId} already in current path)`));
                },

                recordEdgeTraversal: (currentId, neighborId, currentPath) => {
                    steps.push(new AlgorithmStep('explore-edge', {
                        from: currentId,
                        to: neighborId,
                        path: [...currentPath],
                        skipped: false
                    }, `Traversing edge ${currentId} → ${neighborId}`));
                },

                recordBacktrack: (currentId, currentPath) => {
                    if (currentId !== sourceId) {
                        steps.push(new AlgorithmStep('backtrack', {
                            nodeId: currentId,
                            path: [...currentPath]
                        }, `Backtracking from node ${currentId}`));
                    }
                },

                exploreFrom: function(currentId, currentPath, visited) {
                    if (currentId === sinkId) {
                        this.recordSinkReached(currentPath);
                        return;
                    }

                    const neighbors = graph.getNeighbors(currentId);
                    this.recordExplorationStart(currentId, currentPath, neighbors);

                    for (const neighborId of neighbors) {
                        if (visited.has(neighborId)) {
                            this.recordCycleDetected(currentId, neighborId, currentPath);
                            continue;
                        }

                        this.recordEdgeTraversal(currentId, neighborId, currentPath);

                        const newPath = [...currentPath, neighborId];
                        const newVisited = new Set(visited);
                        newVisited.add(neighborId);

                        this.exploreFrom(neighborId, newPath, newVisited);
                    }

                    this.recordBacktrack(currentId, currentPath);
                }
            };

            const initialVisited = new Set([sourceId]);
            cycleDetector.exploreFrom(sourceId, [sourceId], initialVisited);

            steps.push(new AlgorithmStep('complete', {
                totalPaths: allPaths.length,
                paths: allPaths,
                cyclesDetected: cyclesDetected.length
            }, `Search complete! Found ${allPaths.length} path(s) from ${sourceId} to ${sinkId}. Detected ${cyclesDetected.length} cycle(s).`));

            return { steps, paths: allPaths };
        }
    }
};
