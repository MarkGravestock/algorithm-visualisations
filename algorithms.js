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
        description: "Depth-First Search to find all possible paths from source to sink in a directed acyclic graph. Explores every possible route through the graph.",

        execute: function(graph, sourceId = null, sinkId = null) {
            const steps = [];
            const allPaths = [];

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

                recordSkippedNode: (currentId, neighborId, currentPath) => {
                    steps.push(new AlgorithmStep('explore-edge', {
                        from: currentId,
                        to: neighborId,
                        path: [...currentPath],
                        skipped: true,
                        reason: 'in-current-path'
                    }, `Skipping node ${neighborId} - already in current path`));
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
                            this.recordSkippedNode(currentId, neighborId, currentPath);
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
            dfsExplorer.exploreFrom(sourceId, [sourceId], initialVisited);

            steps.push(new AlgorithmStep('complete', {
                totalPaths: allPaths.length,
                paths: allPaths
            }, `Search complete! Found ${allPaths.length} path(s) from ${sourceId} to ${sinkId}`));

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
        description: "Breadth-First Search to find all possible paths from source to sink. Explores paths level-by-level, finding shorter paths before longer ones. Uses a queue-based approach instead of recursion.",

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

                recordSkippedNode: (currentId, neighborId, currentPath) => {
                    steps.push(new AlgorithmStep('explore-edge', {
                        from: currentId,
                        to: neighborId,
                        path: currentPath,
                        skipped: true,
                        reason: 'in-current-path'
                    }, `Skipping node ${neighborId} - already in current path`));
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

            while (queue.length > 0) {
                const currentPath = queue.shift();
                const currentId = currentPath[currentPath.length - 1];

                bfsExplorer.recordDequeue(currentPath, currentId);

                if (currentId === sinkId) {
                    bfsExplorer.recordSinkReached(currentPath);
                    continue;
                }

                const neighbors = graph.getNeighbors(currentId);
                bfsExplorer.recordExplorationStart(currentId, currentPath, neighbors);

                for (const neighborId of neighbors) {
                    if (currentPath.includes(neighborId)) {
                        bfsExplorer.recordSkippedNode(currentId, neighborId, currentPath);
                        continue;
                    }

                    const newPath = [...currentPath, neighborId];
                    bfsExplorer.recordEdgeTraversal(currentId, neighborId, currentPath);
                    bfsExplorer.recordEnqueue(newPath);

                    queue.push(newPath);
                }
            }

            steps.push(new AlgorithmStep('complete', {
                totalPaths: allPaths.length,
                paths: allPaths
            }, `Search complete! Found ${allPaths.length} path(s) from ${sourceId} to ${sinkId} using BFS`));

            return { steps, paths: allPaths };
        }
    }
};
